import { ServerError, Serverize } from '@serverize/client';
import {
  onIdTokenChanged,
  signInWithCustomToken,
  signOut,
} from 'firebase/auth';
import * as vscode from 'vscode';

import { relative, sep } from 'path';
import { auth, client, signInWithEmail } from 'serverize';
import { registerAuthCommands } from './commands/auth-command';
import { showError } from './error-handler';
import { OrganizationDataProvider } from './tree/accounts';
import { ProjectsDataProvider, ReleaseItem } from './tree/projects';
import { ChannelItem, SecretItem, SecretsDataProvider } from './tree/secrets';

const outputChannel = vscode.window.createOutputChannel('Serverize', {
  log: true,
});

function isDevelopment(context: vscode.ExtensionContext) {
  return context.extensionMode === vscode.ExtensionMode.Development;
}

export async function activate(context: vscode.ExtensionContext) {
  const bin = isDevelopment(context)
    ? 'DEBUG=serverize NODE_ENV=development ./node_modules/.bin/serverize'
    : 'npx serverize@latest';
  const logs = [
    `Extension mode: ${vscode.ExtensionMode[context.extensionMode]}`,
    `Workspace trusted: ${vscode.workspace.isTrusted}`,
    `API URL: ${client.options.baseUrl}`,
  ];
  logs.forEach((log) => console.log(log));
  logs.forEach((log) => outputChannel.info(log));

  const secretsDataProvider = new SecretsDataProvider(context, client);
  const projectDataProvider = new ProjectsDataProvider(context, client);
  const organizationDataProvider = new OrganizationDataProvider(
    context,
    client,
  );

  await vscode.commands.executeCommand(
    'setContext',
    'serverize:isSignedIn',
    false,
  );

  onIdTokenChanged(auth, async (user) => {
    if (user) {
      outputChannel.info('User signed in');
      await vscode.commands
        .executeCommand('setContext', 'serverize:isSignedIn', true)
        .then(undefined, (err) => {
          console.error(
            'Error setting context serverize:isSignedIn',
            err.message,
          );
        });
    } else {
      outputChannel.info('User signed out');
      await vscode.commands
        .executeCommand('setContext', 'serverize:isSignedIn', false)
        .then(undefined, (err) => {
          console.error(
            'Error setting context serverize:isSignedIn',
            err.message,
          );
        });
    }
    await vscode.commands.executeCommand('serverize.orgs.refresh');
    await vscode.commands.executeCommand('serverize.projects.refresh');
    await vscode.commands.executeCommand('serverize.secrets.refresh');
  });

  vscode.window.registerTreeDataProvider(
    'serverizeOrgsView',
    organizationDataProvider,
  );

  vscode.window.registerTreeDataProvider(
    'serverizeProjectsView',
    projectDataProvider,
  );

  vscode.window.registerTreeDataProvider(
    'serverizeSecretsView',
    secretsDataProvider,
  );
  vscode.window.registerTreeDataProvider('serverizeHelpView', {
    getTreeItem: (element) => element as vscode.TreeItem,
    getChildren(element) {
      const openDiscordItem = (() => {
        const item = new vscode.TreeItem('Open Discord');
        item.iconPath = new vscode.ThemeIcon('comment-discussion');
        item.command = {
          command: 'vscode.open',
          title: 'Open Discord',
          arguments: [vscode.Uri.parse('https://discord.gg/aj9bRtrmNt')],
        };
        return item;
      })();
      const docsItem = (() => {
        const item = new vscode.TreeItem('Serverize Docs');
        item.iconPath = new vscode.ThemeIcon('book');
        item.command = {
          command: 'vscode.open',
          title: 'Open Documentation',
          arguments: [
            vscode.Uri.parse('https://serverize.sh/docs/concepts/projects'),
          ],
        };
        return item;
      })();
      const reportIssueItem = (() => {
        const item = new vscode.TreeItem('Report Issue');
        item.iconPath = new vscode.ThemeIcon('comment');
        item.command = {
          command: 'vscode.open',
          title: 'Open Issue Tracker',
          arguments: [
            vscode.Uri.parse(
              'https://github.com/JanuaryLabs/serverize/issues/new',
            ),
          ],
        };
        return item;
      })();
      const installDockerItem = (() => {
        const item = new vscode.TreeItem('Install Docker');
        item.iconPath = new vscode.ThemeIcon('link-external');
        item.command = {
          command: 'vscode.open',
          title: 'Open Docker Installation Guide',
          arguments: [vscode.Uri.parse('https://docker.com/get-started')],
        };
        return item;
      })();
      return [openDiscordItem, docsItem, reportIssueItem, installDockerItem];
    },
  });
  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.setup', async () => {
      const terminal =
        vscode.window.terminals.find((term) => term.exitStatus === undefined) ??
        vscode.window.createTerminal({
          name: 'Serverize',
        });

      terminal.show();
      const command = `${bin} setup`;
      outputChannel.info('Running command: ' + command);
      terminal.sendText(command);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.projects.refresh', async () => {
      projectDataProvider.refresh();
    }),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.secrets.refresh', async () => {
      secretsDataProvider.refresh();
    }),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.orgs.refresh', async () => {
      organizationDataProvider.refresh();
    }),
  );

  registerAuthCommands(context, 'serverize.createProject', async (session) => {
    const projectName = await showProjectNameBox();

    if (!projectName) {
      vscode.window.showWarningMessage('Project name is required');
      return;
    }

    const [, error] = await client.request('POST /projects', {
      name: projectName,
    });
    showError(error);

    await vscode.commands.executeCommand('serverize.projects.refresh');
    vscode.window.showInformationMessage(`Project ${projectName} created`);
  });

  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.showOutput', () => {
      outputChannel.show();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'serverize.release.open',
      async (item: ReleaseItem) => {
        const SERVERIZE_DOMAIN = isDevelopment(context)
          ? '127.0.0.1.nip.io'
          : 'january.sh';
        const PROTOCOL = isDevelopment(context) ? 'http' : 'https';
        vscode.env.openExternal(
          vscode.Uri.parse(
            `${PROTOCOL}://${item.data.domainPrefix}.${SERVERIZE_DOMAIN}`,
          ),
        );
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.addAccount', async () => {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Adding account',
          cancellable: false,
        },
        async () => {
          await addAccount(client);
        },
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.signup', async () => {
      await signup(client);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.signout', async () => {
      await signOut(auth);
      vscode.window.showInformationMessage('Signed out');
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.signin', async () => {
      await signin(client, () => signup(client));
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'serverize.release.logs',
      async (item: ReleaseItem) => {
        const flags = [
          `-p ${item.data.project.name}`,
          `-c ${item.data.channel}`,
          `-r ${item.data.name}`,
        ];
        const command = `${bin} logs ${flags.join(' ')}`;
        const task = new vscode.Task(
          { type: 'serverize' },
          vscode.TaskScope.Workspace,
          'logs',
          'serverize',
          new vscode.ShellExecution(command),
        );
        await vscode.tasks.executeTask(task);
      },
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'serverize.secrets.add',
      async (item: ChannelItem) => {
        const label = await vscode.window.showInputBox({
          title: 'Add secret',
          prompt: 'Enter secret name',
          placeHolder: 'Enter secret name',
          ignoreFocusOut: true,
        });
        if (!label) {
          vscode.window.showWarningMessage('Secret name is required');
          return;
        }
        const value = await vscode.window.showInputBox({
          title: 'Add secret',
          prompt: 'Enter secret value',
          placeHolder: 'Enter secret value',
          ignoreFocusOut: true,
        });
        if (!value) {
          vscode.window.showWarningMessage('Secret value is required');
          return;
        }
        const [, error] = await client.request('POST /secrets', {
          channel: item.data.name,
          projectId: item.data.projectId,
          secretLabel: label,
          secretValue: value,
        });
        if (error) {
          showError(error);
          return;
        }
        vscode.window.showInformationMessage('Secret added');
        await vscode.commands.executeCommand('serverize.secrets.refresh');
      },
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'serverize.secrets.set',
      async (item: SecretItem) => {
        const value = await vscode.window.showInputBox({
          title: 'Set secret',
          prompt: 'Enter secret value',
          placeHolder: 'Enter secret value',
          ignoreFocusOut: true,
        });
        if (!value) {
          vscode.window.showWarningMessage('Secret value is required');
          return;
        }
        const [, error] = await client.request('POST /secrets', {
          channel: item.data.channel!,
          projectId: item.data.projectId,
          secretLabel: item.data.label,
          secretValue: value,
        });
        if (error) {
          showError(error);
          return;
        }
        vscode.window.showInformationMessage('Secret updated');
        await vscode.commands.executeCommand('serverize.secrets.refresh');
      },
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'serverize.secrets.delete',
      async (item: SecretItem) => {
        const [, error] = await client.request('DELETE /secrets/{id}', {
          id: item.data.id,
        });
        if (error) {
          showError(error);
          return;
        }
        vscode.window.showInformationMessage('Secret deleted');
        await vscode.commands.executeCommand('serverize.secrets.refresh');
      },
    ),
  );

  function getCwd(resource?: vscode.Uri) {
    const [workspace] = resource
      ? [vscode.workspace.getWorkspaceFolder(resource)]
      : (vscode.workspace.workspaceFolders ?? []);
    if (!workspace) {
      return null;
    }
    return workspace.uri.fsPath;
  }

  async function shazam() {
    const cwd = getCwd();
    if (!cwd) {
      vscode.window.showWarningMessage('Please open a workspace');
      return;
    }

    const selectedProject = await showProjectSelector(client);
    if (!selectedProject) {
      vscode.window.showWarningMessage('Please select a project');
      return;
    }

    const flags = [
      `-p ${selectedProject.name}`,
      '--use-dockerfile-if-exists=true',
    ].filter(Boolean);
    const command = `${bin} ${flags.join(' ')}`;
    await runTask(command);
  }

  registerAuthCommands(
    context,
    'serverize.deploy',
    async (dockerFileUri?: vscode.Uri) => {
      if (!dockerFileUri) {
        return shazam();
      }
      const cwd = getCwd(dockerFileUri);
      if (!cwd) {
        vscode.window.showWarningMessage('Please open a workspace');
        return;
      }
      const selectedProject = await showProjectSelector(client);
      if (!selectedProject) {
        vscode.window.showWarningMessage('Please select a project');
        return;
      }

      const relativePath = relative(cwd, dockerFileUri.fsPath);
      const dockerfile = relativePath.split(sep).length > 1 ? relativePath : ``; // we only need relative path if not in workspace (cwd) level
      const flags = [
        `-p ${selectedProject.name}`,
        dockerfile ? `-f ${dockerfile}` : '',
      ].filter(Boolean);
      const command = `${bin} deploy ${flags.join(' ')}`;
      await runTask(command);
    },
  );
}

function runTask(command: string) {
  const task = new vscode.Task(
    { type: 'serverize' },
    vscode.TaskScope.Workspace,
    'deploy',
    'serverize',
    new vscode.ShellExecution(command),
  );
  return vscode.tasks.executeTask(task);
}

async function addAccount(serverize: Serverize) {
  const provider = await vscode.window.showQuickPick(
    ['Email & Password', 'Github'],
    {
      title: 'Add Account',
      placeHolder: 'Select a provider',
      ignoreFocusOut: true,
      canPickMany: false,
    },
  );
  if (!provider) {
    return;
  }
  if (provider === 'Email & Password') {
    const email = await vscode.window.showInputBox({
      title: 'Email',
      prompt: 'Enter email',
      placeHolder: 'Enter email',
      ignoreFocusOut: true,
    });

    if (!email) {
      vscode.window.showWarningMessage('Please enter correct email');
      return;
    }

    const password = await vscode.window.showInputBox({
      title: 'Password',
      prompt: 'Enter password',
      placeHolder: 'Enter password',
      ignoreFocusOut: true,
      password: true,
    });

    if (!password) {
      vscode.window.showWarningMessage('Please enter correct password');
      return;
    }

    await signOut(auth);
    const { user } = await signInWithEmail(email, password);
    vscode.window.showInformationMessage(`Welcome ${user.displayName || ''}`);
  } else {
    await signOut(auth);
    await signin(serverize, () => signup(serverize));
  }
}

async function signin(
  serverize: Serverize,
  onUserNotFound: () => Promise<void>,
) {
  const session = await getSession();
  const [result, error] = await serverize.request('POST /users/signin', {
    token: session.accessToken,
    providerId: 'github.com',
  });

  if (error) {
    if (error instanceof ServerError) {
      console.dir(error, { depth: null });
      console.log(JSON.stringify(error));
      if (error.status === 404) {
        await onUserNotFound();
      }
      return;
    } else {
      showError(error);
      return;
    }
  }
  const userCredential = await signInWithCustomToken(auth, result.accessToken);
  vscode.window.showInformationMessage(
    `Welcome ${userCredential.user.displayName || ''}`,
  );
}

async function signup(serverize: Serverize) {
  const session = await getSession();
  const orgName = await showOrgNameBox();
  if (!orgName) {
    vscode.window.showWarningMessage('Organization name is required');
    return;
  }

  const projectName = await showProjectNameBox();
  if (!projectName) {
    vscode.window.showWarningMessage('Project name is required');
    return;
  }

  const [result, error] = await serverize.request('POST /users/link', {
    providerId: 'github.com',
    orgName: orgName,
    projectName,
    token: session.accessToken,
  });

  if (error) {
    showError(error);
    return;
  }

  const userCredential = await signInWithCustomToken(auth, result.accessToken);
  vscode.window.showInformationMessage(
    `Welcome ${userCredential.user.displayName || ''}`,
  );
}

function getSession() {
  return vscode.authentication.getSession('github', ['user:email'], {
    createIfNone: true,
  });
}

function showProjectNameBox() {
  return vscode.window.showInputBox({
    title: 'Project name',
    prompt: 'Enter project name',
    placeHolder: 'Enter project name',
    ignoreFocusOut: true,
  });
}

function showOrgNameBox() {
  return vscode.window.showInputBox({
    title: 'Organization name',
    prompt: 'Enter organization name',
    placeHolder: 'Enter organization name',
    ignoreFocusOut: true,
  });
}
async function showProjectSelector(serverize: Serverize) {
  const [projects, error] = await serverize.request('GET /projects', {});
  if (error) {
    showError(error);
    return;
  }
  const values = projects.records.map((project) => ({
    ...project,
    label: project.name,
  }));

  return vscode.window.showQuickPick(values, {
    title: 'Deploy',
    placeHolder: 'Select a project',
    ignoreFocusOut: true,
    canPickMany: false,
  });
}

export function deactivate() {}

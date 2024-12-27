import { ServerError, Serverize } from '@serverize/client';
import {
  onIdTokenChanged,
  signInWithCustomToken,
  signOut,
} from 'firebase/auth';
import { relative, sep } from 'path';
import * as vscode from 'vscode';

import { auth, signInWithEmail } from './auth';
import { registerAuthCommands } from './commands/auth-command';
import { OrganizationDataProvider } from './data/accounts';
import { ProjectsDataProvider, ReleaseItem } from './data/projects';
import { showError } from './error-handler';

const outputChannel = vscode.window.createOutputChannel('Serverize', {
  log: true,
});

function isDevelopment(context: vscode.ExtensionContext) {
  return context.extensionMode === vscode.ExtensionMode.Development;
}

function getServerizeAPIUrl(context: vscode.ExtensionContext) {
  return isDevelopment(context)
    ? `http://localhost:3000`
    : `https://serverize-api.january.sh`;
}

export async function activate(context: vscode.ExtensionContext) {
  const bin = isDevelopment(context)
    ? 'NODE_ENV=development ./node_modules/.bin/serverize'
    : 'npx serverize@latest';
  const baseUrl = getServerizeAPIUrl(context);
  const logs = [
    `Extension mode: ${vscode.ExtensionMode[context.extensionMode]}`,
    `Workspace trusted: ${vscode.workspace.isTrusted}`,
    `API URL: ${baseUrl}`,
  ];
  logs.forEach((log) => outputChannel.info(log));

  const serverize = new Serverize({ token: '', baseUrl });
  await serverize.request('POST /projects', {
    name: 'test',
  });

  const projectDataProvider = new ProjectsDataProvider(context, serverize);
  const organizationDataProvider = new OrganizationDataProvider(
    context,
    serverize,
  );

  await vscode.commands.executeCommand(
    'setContext',
    'serverize:isSignedIn',
    false,
  );

  onIdTokenChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken();
      serverize.setOptions({ token });
      outputChannel.info('User signed in');

      await vscode.commands.executeCommand(
        'setContext',
        'serverize:isSignedIn',
        true,
      );
    } else {
      serverize.setOptions({ token: '' });
      outputChannel.info('User signed out');
      await vscode.commands.executeCommand(
        'setContext',
        'serverize:isSignedIn',
        false,
      );
    }
    await vscode.commands.executeCommand('serverize.orgs.refresh');
    await vscode.commands.executeCommand('serverize.projects.refresh');
  });

  vscode.window.registerTreeDataProvider(
    'serverizeOrgsView',
    organizationDataProvider,
  );

  vscode.window.registerTreeDataProvider(
    'serverizeProjectsView',
    projectDataProvider,
  );

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

    const [, error] = await serverize.request('POST /projects', {
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
          await addAccount(serverize);
        },
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.signup', async () => {
      await signup(serverize);
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
      await signin(serverize, () => signup(serverize));
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

  registerAuthCommands(
    context,
    'serverize.deploy',
    async (dockerFileUri: vscode.Uri) => {
      const [projects, error] = await serverize.request('GET /projects', {});
      if (error) {
        showError(error);
        return;
      }
      const values = projects.records.map((project) => ({
        ...project,
        label: project.name,
      }));

      const selectedProject = await vscode.window.showQuickPick(values, {
        title: 'Deploy',
        placeHolder: 'Select a project',
        ignoreFocusOut: true,
        canPickMany: false,
      });
      if (!selectedProject) {
        vscode.window.showWarningMessage('Please select a project');
        return;
      }
      const workspaceFolder =
        vscode.workspace.getWorkspaceFolder(dockerFileUri);
      const cwd = workspaceFolder?.uri.fsPath ?? dockerFileUri.fsPath;
      const absoluteDockerfile =
        dockerFileUri?.fsPath ??
        vscode.window.activeTextEditor?.document.fileName;
      const relativePath = relative(cwd, absoluteDockerfile);
      const dockerfile = relativePath.split(sep).length > 1 ? relativePath : ``;
      const flags = [
        `-p ${selectedProject.name}`,
        dockerfile ? `-f ${dockerfile}` : '',
      ].filter(Boolean);
      const command = `${bin} deploy ${flags.join(' ')}`;
      const task = new vscode.Task(
        { type: 'serverize' },
        vscode.TaskScope.Workspace,
        'deploy',
        'serverize',
        new vscode.ShellExecution(command),
      );
      await vscode.tasks.executeTask(task);
    },
  );
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

export function deactivate() {}

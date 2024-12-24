/// <reference types="vscode" />
import { ServerError, Serverize } from '@serverize/client';
import {
  User,
  onIdTokenChanged,
  signInWithCustomToken,
  signOut,
} from 'firebase/auth';
import { relative } from 'path';
import * as vscode from 'vscode';

import { auth, signInWithEmail } from './auth';
import { registerAuthCommands } from './commands/auth-command';
import { OrganizationDataProvider } from './data/accounts';
import { ProjectsDataProvider, ReleaseItem } from './data/projects';
import { showError } from './error-handler';

const outputChannel = vscode.window.createOutputChannel('Serverize', {
  log: true,
});

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

function isDevelopment(context: vscode.ExtensionContext) {
  return context.extensionMode === vscode.ExtensionMode.Development;
}

function getServerizeAPIUrl(context: vscode.ExtensionContext, endpoint = '') {
  return isDevelopment(context)
    ? `http://localhost:3000${endpoint}`
    : `https://serverize.fly.dev${endpoint}`;
}

export async function activate(context: vscode.ExtensionContext) {
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
      await vscode.commands.executeCommand(
        'setContext',
        'serverize:isSignedIn',
        true,
      );
    } else {
      serverize.setOptions({ token: '' });
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
      const command = `npx serverize setup`;
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
        vscode.env.openExternal(
          vscode.Uri.parse(`https://${item.data.domainPrefix}.january.sh`),
        );
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.addAccount', async () => {
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

        const { user } = await signInWithEmail(email, password);
        await setUser(serverize, context, user);
        vscode.window.showInformationMessage(
          `Welcome ${user.displayName || ''}`,
        );
      } else {
        await signin(serverize, context, () => signup(serverize, context));
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.signup', async () => {
      await signup(serverize, context);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.signout', async () => {
      await signOut(auth);
      serverize.setOptions({ token: '' });
      await context.secrets.store('tokenId', '');
      vscode.window.showInformationMessage('Signed out');
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('serverize.signin', async () => {
      const session = await vscode.authentication.getSession(
        'github',
        ['user:email'],
        { createIfNone: true },
      );

      const [result, error] = await serverize.request('POST /users/signin', {
        token: session.accessToken,
        providerId: 'github.com',
      });
      if (error) {
        showError(error);
        return;
      }
      const userCredential = await signInWithCustomToken(
        auth,
        result.accessToken,
      );
      const user = userCredential.user;
      await setUser(serverize, context, user);
      vscode.window.showInformationMessage(`Welcome ${session.account?.label}`);
    }),
  );

  registerAuthCommands(
    context,
    'serverize.deploy',
    async (dockerFileUri: vscode.Uri) => {
      vscode.window.showInformationMessage('Select a project');
      const suggestions = [
        { label: 'Option 1', description: 'This is the first option' },
        { label: 'Option 2', description: 'This is the second option' },
        { label: 'Option 3', description: 'This is the third option' },
      ];

      // Show the list of suggestions using showQuickPick
      const selected = await vscode.window.showQuickPick(suggestions, {
        placeHolder: 'Select a project',
        ignoreFocusOut: true,
        canPickMany: false, // Set to true if multiple selections are allowed
      });

      // Handle the selected option
      if (selected) {
        vscode.window.showInformationMessage(`You selected: ${selected.label}`);
      } else {
        vscode.window.showInformationMessage('No option selected');
      }

      const rootFolder = vscode.workspace.getWorkspaceFolder(dockerFileUri);
      const dockerfile = relative(
        rootFolder?.uri.fsPath || '',
        dockerFileUri.fsPath,
      );
      const wd = dockerFileUri?.fsPath || '';
      outputChannel.trace('Root folder: ' + rootFolder?.uri.fsPath);
      outputChannel.trace('Docker file: ' + dockerFileUri.fsPath);
      outputChannel.trace('Relative path: ' + dockerfile);
      outputChannel.trace('Working directory: ' + wd);

      const terminal =
        vscode.window.terminals.find((term) => term.exitStatus === undefined) ??
        vscode.window.createTerminal({
          name: 'Serverize',
          message: 'Deploying...',
        });

      terminal.show();
      const command = `npx serverize deploy -f ${dockerfile} -p devproj`;
      outputChannel.info('Running command: ' + command);
      terminal.sendText(command);
    },
  );
}

async function signin(
  serverize: Serverize,
  context: vscode.ExtensionContext,
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
  const user = userCredential.user;
  await sayHi(serverize, user, context);
}

async function signup(serverize: Serverize, context: vscode.ExtensionContext) {
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
  const user = userCredential.user;
  await sayHi(serverize, user, context);
}

async function sayHi(
  serverize: Serverize,
  user: User,
  context: vscode.ExtensionContext,
) {
  await setUser(serverize, context, user);
  vscode.window.showInformationMessage(`Welcome ${user.displayName || ''}`);
}

function getSession() {
  return vscode.authentication.getSession('github', ['user:email'], {
    createIfNone: true,
  });
}

async function setUser(
  serverize: Serverize,
  context: vscode.ExtensionContext,
  user: User,
) {
  const token = await user.getIdToken();
  serverize.setOptions({ token });
  await context.secrets.store('tokenId', token);
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

import * as vscode from 'vscode';

import { auth } from '../auth';

export function registerAuthCommands(
  context: vscode.ExtensionContext,
  id: string,
  callback: (...args: any[]) => void | Promise<void>,
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(id, async (...args: any[]) => {
      if (!vscode.workspace.isTrusted) {
        throw new Error('Workspace is not trusted');
      }

      if (!auth.currentUser) {
        vscode.window.showWarningMessage(
          'Please sign in to Serverize to continue or use the cli\nnpx serverize auth signin',
        );
        await vscode.commands.executeCommand('serverize.auth.addAccount');
        return;
      }

      await callback(...args);
    }),
  );
}

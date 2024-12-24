import * as vscode from 'vscode';

export function registerAuthCommands(
  context: vscode.ExtensionContext,
  id: string,
  callback: (...args: any[]) => void | Promise<void>,
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(id, async () => {
      if (!vscode.workspace.isTrusted) {
        throw new Error('Workspace is not trusted');
      }
      const session = await vscode.authentication.getSession(
        'github',
        ['user:email'],
        { createIfNone: true },
      );

      if (!session) {
        vscode.window.showWarningMessage(
          'Please sign in to GitHub to continue or use the cli\nnpx serverize auth signup',
        );
        return;
      }

      const token = await context.secrets.get('tokenId');
      if (!token) {
        vscode.window.showWarningMessage(
          'Please sign in to Serverize to continue or use the cli\nnpx serverize auth signin',
        );
        return;
      }

      await callback(session);
    }),
  );
}

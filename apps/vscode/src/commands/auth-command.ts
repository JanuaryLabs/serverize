import { client, initialise } from 'serverize';
import * as vscode from 'vscode';

export function registerAuthCommands(
  context: vscode.ExtensionContext,
  id: string,
  callback: (...args: any[]) => void | Promise<void>,
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(id, async (...args: any[]) => {
      const user = await initialise();
      if (!user) {
        vscode.window.showWarningMessage(
          'Please sign in to Serverize to continue or use the cli\nnpx serverize auth signin',
        );
        await vscode.commands.executeCommand('serverize.addAccount');
      } else {
        client.setOptions({ token: (await user.getIdToken()) || '' });
      }

      await callback(...args);
    }),
  );
}

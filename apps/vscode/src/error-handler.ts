import { ParseError, ProblematicResponse } from '@serverize/client';
import * as vscode from 'vscode';

export function showError(
  error?: ProblematicResponse | ParseError<any> | Error | null,
) {
  if (!error) {
    return;
  }
  if (typeof error === 'string') {
    return vscode.window.showErrorMessage(error);
  }

  if ('kind' in error) {
    if (error.kind === 'parse') {
      const flattened = Object.entries(error.fieldErrors).map(([key, it]) => ({
        path: key,
        message: (it as any[])[0].message,
      }));
      const message = `${flattened.map((it) => `${it.path}: ${it.message}`).join('\n')}`;
      return vscode.window.showErrorMessage(`${message}\n${message}`);
    }
    if (error.kind === 'response') {
      const { errors, detail, title } = error.body as any;
      const flattened = Object.entries(errors ?? {}).map(([key, it]) => ({
        path: key,
        message: (it as any[])[0].message,
      }));
      const validationMessage = `${flattened.map((it) => `${it.path}: ${it.message}`).join('\n')}`;
      return vscode.window.showErrorMessage(
        `${detail || title}\n${validationMessage}`,
      );
    }
  }

  if (error instanceof Error) {
    return vscode.window.showErrorMessage(error.message);
  }
  return vscode.window.showErrorMessage(JSON.stringify(error));
}

import { ValidationError } from '@serverize/client';
import * as vscode from 'vscode';

export function showError(error: unknown) {
  if (!error) {
    return;
  }
  if (typeof error === 'string') {
    vscode.window.showErrorMessage(error);
  } else if (error instanceof ValidationError) {
    const message = `${error.flattened.map((it) => `${it.path}: ${it.message}`).join('\n')}`;
    vscode.window.showErrorMessage(`${error.message}\n${message}`);
  } else if (error instanceof Error) {
    vscode.window.showErrorMessage(error.message);
  } else {
    vscode.window.showErrorMessage(JSON.stringify(error));
  }
}

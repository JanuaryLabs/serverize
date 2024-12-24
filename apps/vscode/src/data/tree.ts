import * as vscode from 'vscode';

export abstract class TreeItem extends vscode.TreeItem {
  abstract type: string;
}

export class LoadMoreItem extends TreeItem {
  type = 'loadMore';
  constructor() {
    super('Load more', vscode.TreeItemCollapsibleState.None);
    this.contextValue = 'loadMore';
  }
}

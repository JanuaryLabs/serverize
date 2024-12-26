import * as vscode from 'vscode';

export abstract class TreeItem extends vscode.TreeItem {
  abstract type: string;
  abstract data: any;
}

export class LoadMoreItem extends TreeItem {
  type = 'loadMore';
  data: any;
  constructor() {
    super('Load more', vscode.TreeItemCollapsibleState.None);
    this.contextValue = 'loadMore';
  }
}

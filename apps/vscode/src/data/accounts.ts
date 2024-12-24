import { Organizations, Serverize } from '@serverize/client';
import * as vscode from 'vscode';

import { showError } from '../error-handler';
import { TreeItem } from './tree';

export class OrganizationDataProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  data: vscode.TreeItem[] = [];
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | void
  > = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event as any;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  constructor(
    private context: vscode.ExtensionContext,
    private readonly serverize: Serverize,
  ) {}

  getTreeItem(
    element: vscode.TreeItem,
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  async getChildren(element?: TreeItem | undefined) {
    if (!this.serverize.options.token) {
      return [];
    }
    if (element === undefined) {
      const [data, error] = await this.serverize.request(
        'GET /users/organizations',
        {},
      );
      if (error) {
        showError(error);
        return [];
      }
      return data.records.map(
        (item) =>
          new OrgItem(item, {
            name: item.name,
            id: item.id,
            icon: new vscode.ThemeIcon('organization'),
          }),
      );
    }
    return [];
  }
}

export class OrgItem extends TreeItem {
  children: vscode.TreeItem[] | undefined;
  type = 'org';
  constructor(
    public data: Organizations,
    public options: {
      name: string;
      id: string;
      icon: vscode.ThemeIcon;
    },
  ) {
    super(options.name, vscode.TreeItemCollapsibleState.None);
    this.iconPath = options.icon;
    this.contextValue = 'release';
  }
}

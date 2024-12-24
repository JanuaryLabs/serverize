import { Projects, Releases, Serverize } from '@serverize/client';
import * as vscode from 'vscode';

import { showError } from '../error-handler';
import { TreeItem } from './tree';

export class ProjectsDataProvider
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
      const [data, error] = await this.serverize.request('GET /projects', {});
      if (error) {
        showError(error);
        return [];
      }
      return data.records.map(
        (project) =>
          new ProjectItem(project, {
            name: project.name,
            id: project.id,
            icon: new vscode.ThemeIcon('chip'),
            children: [],
          }),
      );
    }
    if (element.type === 'project') {
      const [releases, releasesError] = await this.serverize.request(
        'GET /releases',
        {
          channel: 'dev',
          projectId: element.id,
          pageSize: 10,
        },
      );
      if (releasesError) {
        showError(releasesError);
        return [];
      }
      return [
        ...releases.records.map(
          (release) =>
            new ReleaseItem(release, {
              name: release.name,
              id: release.id,
              icon: new vscode.ThemeIcon('package'),
            }),
        ),
        // TODO: Implement load more
        // new LoadMoreItem(),
      ];
    }
    return [];
  }
}

class ProjectItem extends TreeItem {
  children: vscode.TreeItem[] | undefined;
  type = 'project';

  constructor(
    public data: Projects,
    public options: {
      name: string;
      children: vscode.TreeItem[];
      id: string;
      icon: vscode.ThemeIcon;
    },
  ) {
    super(options.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.iconPath = options.icon;
  }
}

export class ReleaseItem extends TreeItem {
  children: vscode.TreeItem[] | undefined;
  type = 'release';
  constructor(
    public data: Releases,
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

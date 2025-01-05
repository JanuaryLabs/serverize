import { Projects, Releases, Secrets, Serverize } from '@serverize/client';
import * as vscode from 'vscode';

import { showError } from '../error-handler';
import { ReleaseItem } from './projects';
import { TreeItem } from './tree';

export class SecretsDataProvider
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
    private readonly client: Serverize,
  ) {}

  getTreeItem(
    element: vscode.TreeItem,
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  async getChildren(element?: TreeItem | undefined) {
    if (!this.client.options.token) {
      return [];
    }
    if (element === undefined) {
      const [data, error] = await this.client.request('GET /projects', {});
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
      return [
        new ChannelItem(
          { name: 'dev', projectId: element.data.id },
          {
            id: 'dev',
            name: 'dev',
          },
        ),
        new ChannelItem(
          { name: 'preview', projectId: element.data.id },
          {
            id: 'preview',
            name: 'preview',
          },
        ),
      ];
    }
    if (element.type === 'channel') {
      const [secrets, secretsError] = await this.client.request(
        'GET /secrets',
        {
          channel: element.data.name,
          projectId: element.data.projectId,
        },
      );
      if (secretsError) {
        showError(secretsError);
        return [];
      }
      return [
        ...secrets.map(
          (item) =>
            new SecretItem(
              { ...item, projectId: element.data.projectId },
              {
                id: item.id,
                name: item.label,
              },
            ),
        ),
      ];
    }
    return [];
  }
}

function getChannelIcon(channel: 'dev' | 'preview'): vscode.ThemeIcon {
  const colorMappings = {
    dev: 'charts.magenta',
    preview: 'charts.teal',
  };

  switch (channel) {
    case 'dev':
      return new vscode.ThemeIcon(
        'debug',
        new vscode.ThemeColor(colorMappings.dev),
      );
    case 'preview':
      return new vscode.ThemeIcon(
        'eye',
        new vscode.ThemeColor(colorMappings.preview),
      );
    default:
      return new vscode.ThemeIcon('package');
  }
}

class ProjectItem extends TreeItem {
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
    super(options.name, vscode.TreeItemCollapsibleState.Expanded);
    this.iconPath = options.icon;
  }
}

export class ChannelItem extends TreeItem {
  type = 'channel';
  constructor(
    public data: { name: 'dev' | 'preview'; projectId: string },
    public options: {
      name: string;
      id: string;
    },
  ) {
    super(options.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.iconPath = getChannelIcon(data.name);
    this.contextValue = 'channel';
  }
}

export class SecretItem extends TreeItem {
  type = 'secret';
  constructor(
    public data: Secrets,
    public options: {
      name: string;
      id: string;
    },
  ) {
    super(options.name, vscode.TreeItemCollapsibleState.None);
    this.contextValue = 'secret';
  }
}

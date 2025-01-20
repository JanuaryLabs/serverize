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
      const [releases, releasesError] = await this.client.request(
        'GET /releases',
        {
          projectId: element.data.id,
          pageSize: 10,
          conclusion: process.env.NODE_ENV === 'development' ? 'success' : '',
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
              name: `${release.channel}:${release.name} (${release.status})`,
              id: release.id,
            }),
        ),
        // TODO: Implement load more
        // new LoadMoreItem(),
      ];
    }
    return [];
  }
}

function getReleaseIcon(release: Releases): vscode.ThemeIcon {
  // TODO: pick an icon for terminated releases
  const { status, conclusion, channel } = release;

  // Determine the current theme kind
  const isDarkTheme =
    vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;

  // Define color mappings for dark and light themes
  const colorMappings = {
    inProgress: isDarkTheme ? 'charts.yellow' : 'charts.yellow',
    queued: isDarkTheme ? 'charts.blue' : 'charts.blue',
    successActive: isDarkTheme ? 'charts.green' : 'charts.green',
    successInactive: isDarkTheme ? 'charts.gray' : 'charts.gray',
    failure: isDarkTheme ? 'charts.red' : 'charts.red',
    cancelled: isDarkTheme ? 'charts.gray' : 'charts.gray',
    timedOut: isDarkTheme ? 'charts.orange' : 'charts.orange',
    published: isDarkTheme ? 'charts.purple' : 'charts.purple',
    requested: isDarkTheme ? 'charts.cyan' : 'charts.cyan',
    devChannel: isDarkTheme ? 'charts.magenta' : 'charts.magenta',
    previewChannel: isDarkTheme ? 'charts.teal' : 'charts.teal',
    default: isDarkTheme ? 'charts.gray' : 'charts.gray',
  };

  if (status === 'in_progress') {
    return new vscode.ThemeIcon(
      'sync~spin',
      new vscode.ThemeColor(colorMappings.inProgress),
    );
  }

  if (status === 'queued' || status === 'waiting') {
    return new vscode.ThemeIcon(
      'ellipsis',
      new vscode.ThemeColor(colorMappings.queued),
    );
  }

  if (status === 'completed') {
    switch (conclusion) {
      case 'success': {
        const isActive = true; // Replace with actual logic to determine if active
        if (isActive) {
          return new vscode.ThemeIcon(
            'pass-filled',
            new vscode.ThemeColor(colorMappings.successActive),
          );
        }
        return new vscode.ThemeIcon(
          'pass-filled',
          new vscode.ThemeColor(colorMappings.successInactive),
        );
      }
      case 'failure':
        return new vscode.ThemeIcon(
          'error',
          new vscode.ThemeColor(colorMappings.failure),
        );
      case 'cancelled':
        return new vscode.ThemeIcon(
          'circle-slash',
          new vscode.ThemeColor(colorMappings.cancelled),
        );
      case 'timed_out':
        return new vscode.ThemeIcon(
          'watch',
          new vscode.ThemeColor(colorMappings.timedOut),
        );
      case 'published':
        return new vscode.ThemeIcon(
          'rocket',
          new vscode.ThemeColor(colorMappings.published),
        );
      default:
        return new vscode.ThemeIcon(
          'circle-outline',
          new vscode.ThemeColor(colorMappings.default),
        );
    }
  }

  if (status === 'requested') {
    return new vscode.ThemeIcon(
      'play-circle',
      new vscode.ThemeColor(colorMappings.requested),
    );
  }

  if (channel === 'dev') {
    return new vscode.ThemeIcon(
      'debug',
      new vscode.ThemeColor(colorMappings.devChannel),
    );
  }

  if (channel === 'preview') {
    return new vscode.ThemeIcon(
      'eye',
      new vscode.ThemeColor(colorMappings.previewChannel),
    );
  }

  return new vscode.ThemeIcon(
    'package',
    new vscode.ThemeColor(colorMappings.default),
  );
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
    },
  ) {
    super(options.name, vscode.TreeItemCollapsibleState.None);
    this.iconPath = getReleaseIcon(data);
    const isReleaseActive =
      data.status === 'completed' && data.conclusion === 'success';
    this.contextValue = isReleaseActive ? 'release-active' : 'release';
  }
}

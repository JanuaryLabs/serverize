import { Command } from 'commander';

import { box } from '@january/console';

import { safeFail } from 'serverize/utils';

import { client } from './lib/api-client';
import {
  channelOption,
  getCurrentProject,
  projectOption,
  releaseOption,
  showError,
  spinner,
  tell,
} from './program';
import { streamLogs } from './view-logs';

const list = new Command('list')
  .alias('ls')
  .addOption(projectOption.makeOptionMandatory(true))
  .addOption(channelOption)
  .action(async ({ projectName, channel }) => {
    const currentProject = await getCurrentProject(projectName);
    const [releases = { records: [] }, error] = await client.request(
      'GET /releases',
      {
        projectId: currentProject.projectId,
        channel: channel,
      },
    );
    if (error) {
      showError(error);
      process.exit(1);
    }

    if (releases.records.length === 0) {
      box.print(
        'No releases found',
        'Create a release by running:',
        '$ npx serverize deploy -p <project-name>',
      );
      return;
    }
    console.table(
      releases.records.map((release) => ({
        // ID: token.id,
        Project: release.project.name,
        'Created At': release.createdAt,
        Status: release.status,
        Conclusion: release.conclusion,
        Name: release.name,
        Channel: release.channel,
      })),
    );
  });
const stop = new Command('stop')
  .addOption(channelOption.makeOptionMandatory(false))
  .addOption(releaseOption)
  .addOption(projectOption)
  .action(async ({ projectName, channel, release }) => {
    const currentProject = await getCurrentProject(projectName);
    const [, error] = await client.request('DELETE /releases', {
      channelName: channel,
      projectId: currentProject.projectId,
      releaseName: release,
    });
    if (error) {
      showError(error);
      process.exit(1);
    }
    spinner.succeed(`Release ${release} of ${channel} stopped successfully`);
  });

const restart = new Command('restart')
  .addOption(projectOption.makeOptionMandatory(true))
  .addOption(channelOption.makeOptionMandatory(true))
  .addOption(releaseOption.makeOptionMandatory(true))
  .action(async ({ project: projectName, channel, release: releaseName }) => {
    const currentProject = await getCurrentProject(projectName);

    const [data, error] = await client.request(
      'POST /operations/releases/{releaseName}/restart',
      {
        projectId: currentProject.projectId,
        projectName: currentProject.projectName,
        channel,
        releaseName,
      },
    );

    if (error) {
      showError(error || new Error('Failed to restart release'));
      process.exit(1);
    }

    streamLogs(data.traceId).subscribe({
      next: tell,
      error: (error) => {
        const message = safeFail(
          () => (typeof error === 'string' ? error : error.message).trim(),
          '',
        );
        if (message) {
          spinner.fail(`Failed to process image: ${message}`);
        } else {
          spinner.fail(`Failed to process image`);
          console.error(error);
        }
        process.exit(1);
      },
      complete: () => {
        spinner.succeed(`Release ${releaseName} restarted successfully`);
        box.print(
          `${currentProject.projectName} Restarted`,
          `- Accessible at ${data.finalUrl}`,
          `- Logs: npx serverize logs -p ${currentProject.projectName}`,
          `- Stuck? Join us at https://discord.gg/aj9bRtrmNt`,
        );
      },
    });
  });

export default new Command('releases')
  .addCommand(list)
  .addCommand(stop)
  .addCommand(restart);

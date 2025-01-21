import { Command } from 'commander';

import { safeFail } from 'serverize/utils';
import { client } from './lib/api-client';
import { streamLogs } from './lib/view-logs';
import {
  channelOption,
  getCurrentProject,
  projectOption,
  releaseOption,
  showError,
  spinner,
  tell,
} from './program';

import { box } from '@january/console';

const list = new Command('list')
  .alias('ls')
  .summary('List all releases for a project')
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

const terminate = new Command('terminate')
  .alias('delete')
  .alias('stop')
  .summary('Terminate a specific release')
  .usage('[options]')
  .addOption(channelOption)
  .addOption(releaseOption)
  .addOption(projectOption)
  .action(async ({ projectName, channel, release }) => {
    const currentProject = await getCurrentProject(projectName);
    const [, error] = await client.request(
      'DELETE /operations/releases/{releaseName}',
      {
        channel: channel,
        projectId: currentProject.projectId,
        releaseName: release,
      },
    );
    if (error) {
      showError(error);
      process.exit(1);
    }
    spinner.succeed(
      `Release "${release}" of channel "${channel}" terminate successfully`,
    );
  });

const restart = new Command('restart')
  .summary('Restart a specific release')
  .usage('[options]')
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
  .alias('r')
  .summary('Manage project releases')
  .description(
    `A release represents a specific version of your deployment within a channel. Each release has a unique name and URL, allowing you to manage multiple versions of your application.`,
  )
  .addCommand(list)
  .addCommand(terminate)
  .addCommand(restart);

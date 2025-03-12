import { existsSync } from 'fs';
import { confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { Command } from 'commander';
import { mkdir, writeFile } from 'fs/promises';

import { join } from 'path';
import {
  detectFramework,
  type framework,
  supportedFrameworks,
} from './lib/detect-framework';
import { ghAutomateWorkflow } from './lib/gh-automate';
import {
  discordNotification,
  ghPrWorkflow,
  slackNotification,
} from './lib/gh-preview';
import { cwdOption, dropdown, printDivider, spinner } from './program';
import { setupFramework } from './setup/setup-framework';

import { box } from './lib/console.ts';

const listCommand = new Command('list')
  .alias('ls')
  .summary('List all supported frameworks')
  .action(() => {
    const links: Partial<Record<framework, string>> = {
      'gh-pr-preview': 'deployment-previews',
      'gh-automate': 'ci-cd',
    };
    console.log(
      supportedFrameworks
        .map((it) =>
          `Framework: ${it} | https://serverize.sh/guides/${links[it] || it}`.trim(),
        )
        .join('\n'),
      '\n',
    );
    box.print('Example', '$ npx serverize setup astrojs');
  });

const init = new Command('init')
  .summary('Create Dockerfile for a framework')
  .argument('[framework]', 'Framework to setup')
  .allowUnknownOption()
  .option('-f, --force', 'Force setup')
  .addOption(cwdOption)
  .action(
    async (
      framework?: framework,
      options?: { force?: boolean; cwd: string },
    ) => {
      const projectDir = options?.cwd || process.cwd();

      framework ??= await detectFramework(projectDir).then(
        (it) => it?.framework,
      );
      framework ??= await dropdown({
        title: 'Select framework',
        choices: supportedFrameworks.map((it) => ({ name: it, value: it })),
        loop: false,
      }).catch(() => {
        return undefined;
      });
      if (!framework) {
        box.print(
          'Help',
          '- Run the command again with the framework name.',
          '- Example: $ npx serverize setup astrojs',
          '- Supported frameworks: $ npx serverize setup list',
          `- Tell us what framework you're using in [discord](https://discord.gg/aj9bRtrmNt)`,
        );
        spinner.fail(`Could not detect the framework in "${projectDir}"\n`);
        return;
      }

      if (framework === 'gh-pr-preview') {
        spinner.info(`Setting up preview deployment...`);
        const healthCheck = await dropdown({
          title: 'Select notification type',
          choices: [
            {
              name: 'Discord',
              value: 'discord',
            },
            {
              name: 'Slack',
              value: 'slack',
            },
            {
              name: `Don't setup notification`,
              value: 'ignore',
            },
          ],
        });
        const workflow = ghPrWorkflow(
          healthCheck === 'discord'
            ? discordNotification()
            : healthCheck === 'slack'
              ? slackNotification()
              : undefined,
        );
        const workflowsDir = join(projectDir, '.github', 'workflows');
        await mkdir(workflowsDir, {
          recursive: true,
        });
        const actionFile = join(workflowsDir, 'preview-deployment.yml');
        await writeFile(actionFile, workflow.content, 'utf-8');
        spinner.succeed(`Preview deployment workflow added.\n${actionFile}`);
        spinner.info(
          `Please add the following secrets to your repository:\n${workflow.vars.map((it) => `- ${chalk.blue.bold(it)}`).join('\n')}`,
        );
        return;
      }
      if (framework === 'gh-automate') {
        spinner.info(`Setting up preview deployment...`);
        const notification = await dropdown({
          title: 'Select notification type',
          choices: [
            {
              name: 'Discord',
              value: 'discord',
            },
            {
              name: 'Slack',
              value: 'slack',
            },
            {
              name: `Don't setup notification`,
              value: 'ignore',
            },
          ],
        });
        // TODO: ask the user if they w'd like to generate a token
        const serverizeToken = '';
        const channel = 'dev';
        const workflow = ghAutomateWorkflow(
          channel,
          notification === 'discord'
            ? discordNotification()
            : notification === 'slack'
              ? slackNotification()
              : undefined,
        );
        const workflowsDir = join(projectDir, '.github', 'workflows');
        await mkdir(workflowsDir, {
          recursive: true,
        });
        const actionFile = join(workflowsDir, 'deployment.yml');
        await writeFile(actionFile, workflow.content, 'utf-8');
        spinner.succeed(`Deployment workflow added.\n${actionFile}`);
        printDivider();
        spinner.info(
          `Please add the following secrets to your repository:\n${workflow.vars.map((it) => `- ${chalk.blue.bold(it)}`).join('\n')}`,
        );
        printDivider();
        return;
      }
      spinner.info(`Framework/Language: ${chalk.blue.bold(framework)}`);
      const dockerfilepath = join(projectDir, 'Dockerfile');
      if (existsSync(dockerfilepath)) {
        if (process.env.NODE_ENV === 'development') {
          spinner.warn(`Dockerfile already exists. Skipping...`);
        } else {
          const shouldContinue = await confirm({
            message:
              'Looks like you already have a Dockerfile. Do you want to continue?',
          });
          if (!shouldContinue) {
            return;
          }
        }
      }

      const setups = await setupFramework({
        framework,
        cwd: projectDir,
        dest: projectDir,
      });

      for (const setup of setups) {
        spinner.succeed(`Dockerfile: ${setup.dockerfile}`);
        spinner.succeed(`.dockerignore: ${setup.dockerignore}`);
      }

      spinner.succeed('Setup complete');
    },
  );

export default new Command('setup')
  .description(
    `The setup command inspects your project and sets up the necessary configurations.`,
  )
  .summary('Automatically create Dockerfile from your codebase')
  .addCommand(listCommand)
  .addCommand(init, { isDefault: true });

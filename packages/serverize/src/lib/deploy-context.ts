import { AsyncLocalStorage } from 'async_hooks';
import chalk from 'chalk';
import { writeFileSync } from 'fs';
import {
  from,
  lastValueFrom,
  map,
  mergeMap,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import { box } from '@january/console';

import { isDockerRunning } from 'serverize/docker';
import { safeFail } from 'serverize/utils';

import {
  type AST,
  getCurrentProject,
  showError,
  showProgressBar,
  spinner,
  tell,
  toAst,
} from '../program';
import { streamLogs } from '../view-logs';
import { client, makeImageName } from './api-client';
import { buildCompose, buildImage, saveImage } from './image';
import { pushImage } from './uploader';

interface ReleaseInfo {
  channel: 'dev' | 'preview';
  releaseName: string;
  projectId: string;
  projectName: string;
  serviceName?: string;
  image: string;
  volumes?: string[];
  environment?: Record<string, string>;
}

const als = new AsyncLocalStorage<{
  releaseInfo: ReleaseInfo;
  ast: AST;
  project: string;
}>();

export async function runInComposeContext(config: DeployContext) {
  const dockerRunning = await isDockerRunning();
  if (!dockerRunning) {
    spinner.fail('Docker is not running. Please start it then try again.');
    process.exit(1);
  }
  const currentProject = await getCurrentProject(config.projectName);
  const compose = await buildCompose(
    (serviceName) =>
      makeImageName(
        config.projectName,
        config.channel,
        `${config.release}-${serviceName}`,
      ),
    config.file,
    config.cwd,
  );
  tell('Preparing to deploy');
  const savedImages = await Promise.all(
    compose.services.map(async (service) => ({
      service,
      details: await saveImage(service.image),
    })),
  );
  const bar = showProgressBar(compose.services.map(({ name }) => name));
  const tars = await Promise.all(
    savedImages.map(async ({ service, details }, index) => {
      const result = await pushImage(details, (progress) => {
        bar[index].update(+progress);
      });
      return { tarLocation: result, ...service };
    }),
  );

  const urls: { name: string; url: string }[] = [];

  for (const tar of tars) {
    const port = tar.port ? parseInt(tar.port || '3000', 10) : undefined;
    spinner.prefixText = `Deploying ${chalk.green(tar.name)}`;
    const [data, error] = await client.request(
      'POST /operations/releases/start',
      {
        runtimeConfig: JSON.stringify({
          image: tar.image,
          Healthcheck: tar.healthcheck,
        }),
        port: port,
        image: tar.image,
        tarLocation: tar.tarLocation,
        channel: config.channel,
        projectName: currentProject.projectName,
        projectId: currentProject.projectId,
        volumes: tar.volumes,
        environment: tar.environment,
        serviceName: tar.name,
        releaseName: config.release,
      },
    );
    if (error) {
      showError(error);
      process.exit(1);
    }
    if (tar.port) {
      urls.push({
        name: tar.name,
        url: data.finalUrl,
      });
    }
    await lastValueFrom(
      streamLogs(data.traceId).pipe(
        tap({
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
        }),
      ),
    );
  }

  spinner.succeed('Deployed successfully');
  const lines = [
    ...urls.map(
      ({ name, url }) => `\t${chalk.green(name)} -> ${chalk.blue.bold(url)}`,
    ),
    chalk.redBright(`Stuck? Join us at https://discord.gg/aj9bRtrmNt`),
    '',
  ];
  console.log(lines.join('\n'));
}

export interface DeployContext {
  projectName: string;
  file: string;
  dockerignorepath: string;
  channel: 'dev' | 'preview';
  release: string;
  outputFile?: string;
  cwd: string;
}

export async function runInDeployContext(config: DeployContext) {
  const dockerRunning = await isDockerRunning();
  if (!dockerRunning) {
    spinner.fail('Docker is not running. Please start it then try again.');
    process.exit(1);
  }
  const currentProject = await getCurrentProject(config.projectName);
  const ast = await toAst(config.dockerignorepath, config.file);

  const releaseInfo: ReleaseInfo = {
    channel: config.channel,
    releaseName: config.release,
    projectId: currentProject.projectId,
    projectName: currentProject.projectName,
    image: makeImageName(
      currentProject.projectName,
      config.channel,
      config.release,
    ),
  };
  return als.run(
    { ast, project: currentProject.projectName, releaseInfo },
    async () => {
      if (!ast.expose) {
        spinner.warn('No exposed port found, use 3000 as default');
      }
      if (!ast.healthCheckOptions) {
        // NOTE: atm, serverize no longer wait for healthcheck
        // this might change in the future
        // spinner.warn(
        //   `No health check options found, using default health check`,
        // );
      }

      await buildImage(releaseInfo.image, ast.dockerfile);

      const finalUrl = await lastValueFrom(deployProject());
      spinner.succeed(chalk.yellow('Deployed successfully'));
      box.print(
        `${releaseInfo.projectName} Deployed`,
        `Accessible at ${finalUrl}`,
        `Logs: npx serverize logs -p ${releaseInfo.projectName}`,
        `Stuck? Join us at https://discord.gg/aj9bRtrmNt`,
      );

      if (config.outputFile) {
        writeFileSync(
          config.outputFile,
          JSON.stringify({
            project: releaseInfo.projectName,
            url: finalUrl,
          }),
          'utf-8',
        );
      }
    },
  );
}

export function getAst() {
  const value = als.getStore();
  if (!value) {
    throw new Error(
      `Couldn't parse the Dockerfile. This is most likely a bug. Please report it.`,
    );
  }
  return value.ast;
}

export function getProject() {
  const value = als.getStore();
  if (!value) {
    throw new Error(
      `Couldn't get project name. This is most likely a bug. Please report it.`,
    );
  }
  return value.project;
}

export function getReleaseInfo() {
  const value = als.getStore();
  if (!value) {
    throw new Error(
      `Couldn't get project name. This is most likely a bug. Please report it.`,
    );
  }
  return value.releaseInfo;
}

export function deployProject() {
  const releaseInfo = getReleaseInfo();
  const ast = getAst();

  tell('Pushing the image...');
  const port = parseInt(ast.expose || '3000', 10);
  return from(saveImage(releaseInfo.image)).pipe(
    switchMap((details) =>
      pushImage(details, (progress) => tell(`Uploading ${progress}%`)),
    ),
    tap({
      next: tell,
      error: (error) => {
        spinner.fail('Failed to push the image');
        console.error(error);
        process.exit(1);
      },
    }),
    switchMap((tarLocation) =>
      client.request('POST /operations/releases/start', {
        runtimeConfig: JSON.stringify({
          image: ast.finalImageName,
          Healthcheck: ast.healthCheckOptions,
        }),
        tarLocation: tarLocation,
        port: port,
        ...releaseInfo,
      }),
    ),
    mergeMap(([data, error]) => {
      console.log(''); // sometimes the logs are not printed. this fixes it.
      if (error || !data) {
        return throwError(() => error);
      }
      return streamLogs(data.traceId).pipe(
        tap({
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
        }),
        map(() => data.finalUrl),
      );
    }),
  );
}

export default als;

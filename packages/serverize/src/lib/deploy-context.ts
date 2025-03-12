import chalk from 'chalk';

import { AsyncLocalStorage } from 'async_hooks';
import {
  from,
  lastValueFrom,
  mergeMap,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { isDockerRunning } from 'serverize/docker';
import {
  type AST,
  ensureUser,
  getCurrentProject,
  inspectDockerfile,
  inspectImage,
  showError,
  showProgressBar,
  spinner,
  tell,
} from '../program';
import { client, makeImageName } from './api-client';
import { buildCompose, buildImage, saveImage } from './image';
import { pushImage } from './uploader';

import { execa } from 'execa';
import { writeFile } from 'fs/promises';
import { box } from './console.ts';
import { reportProgress } from './view-logs.ts';

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
        config.projectName!, // todo: needs a rework
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
    const port = tar.port ? Number.parseInt(tar.port || '3000', 10) : undefined;
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
    await reportProgress(data.traceId);
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
  projectName?: string;
  file: string;
  dockerignorepath: string;
  channel: 'dev' | 'preview';
  release: string;
  outputFile?: string;
  cwd: string;
  context: string;
  image?: string;
}

export async function runInDeployContext(config: DeployContext) {
  const dockerRunning = await isDockerRunning();
  if (!dockerRunning) {
    spinner.fail('Docker is not running. Please start it then try again.');
    process.exit(1);
  }
  const user = await ensureUser();
  if (!user) process.exit(1);

  let finalUrl: string;

  if (config.image) {
    const ast = await inspectImage(config.image);
    if (!ast.expose) {
      spinner.warn('No exposed port found, using 3000 as default');
    }
    const currentProject = await getCurrentProject(
      config.projectName || ast.projectName,
    );
    const channelName = config.channel || ast.channelName || 'dev';
    const releaseName = config.release || ast.releaseName || 'latest';
    const releaseInfo: ReleaseInfo = {
      channel: channelName,
      releaseName: releaseName,
      projectId: currentProject.projectId,
      projectName: currentProject.projectName,
      image: makeImageName(
        currentProject.projectName,
        channelName,
        releaseName,
      ),
    };
    spinner.info(
      `Deploying (${chalk.green(releaseInfo.projectName)}:${chalk.yellow(releaseInfo.releaseName)}) to ${chalk.blue(releaseInfo.channel)}`,
    );

    await execa('docker', ['tag', config.image, releaseInfo.image]);
    finalUrl = await lastValueFrom(
      deployProject(releaseInfo.image, ast, releaseInfo),
    );
    tellNews(releaseInfo, finalUrl);
    await writeOutput(releaseInfo.projectName, finalUrl, config.outputFile);
  } else {
    const ast = await inspectDockerfile(config.dockerignorepath, config.file);
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
    const currentProject = await getCurrentProject(
      config.projectName || ast.projectName,
    );
    const channelName = config.channel || ast.channelName || 'dev';
    const releaseName = config.release || ast.releaseName || 'latest';
    const releaseInfo: ReleaseInfo = {
      channel: channelName,
      releaseName: releaseName,
      projectId: currentProject.projectId,
      projectName: currentProject.projectName,
      image: makeImageName(
        currentProject.projectName,
        channelName,
        releaseName,
      ),
    };
    spinner.info(
      `Deploying (${chalk.green(releaseInfo.projectName)}:${chalk.yellow(releaseInfo.releaseName)}) to ${chalk.blue(releaseInfo.channel)}`,
    );
    await buildImage(config.context, releaseInfo.image, ast.dockerfile);
    finalUrl = await lastValueFrom(
      deployProject(releaseInfo.image, ast, releaseInfo),
    );
    tellNews(releaseInfo, finalUrl);
    await writeOutput(releaseInfo.projectName, finalUrl, config.outputFile);
  }

  spinner.succeed(chalk.yellow('Deployed successfully'));
}

export async function writeOutput(
  projectName: string,
  finalUrl: string,
  outputFile?: string,
) {
  if (outputFile) {
    await writeFile(
      outputFile,
      JSON.stringify({ project: projectName, url: finalUrl }),
      'utf-8',
    );
  }
}
export function tellNews(releaseInfo: ReleaseInfo, finalUrl: string) {
  const logsCommand = [
    'npx serverize logs',
    `-p ${releaseInfo.projectName}`,
    releaseInfo.channel !== 'dev' ? `-c ${releaseInfo.channel}` : '',
    releaseInfo.releaseName !== 'latest' ? `-r ${releaseInfo.releaseName}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  box.print(
    `${releaseInfo.projectName} Deployed`,
    `Accessible at ${finalUrl}`,
    `Logs: ${logsCommand}`,
    `Stuck? Join us at https://discord.gg/aj9bRtrmNt`,
  );
}

export function deployProject(
  imageName: string,
  ast: AST,
  releaseInfo: ReleaseInfo,
) {
  tell('Pushing the image...');
  const port = Number.parseInt(ast.expose || '3000', 10);
  return from(saveImage(imageName)).pipe(
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
        ...releaseInfo,
        runtimeConfig: JSON.stringify({
          image: ast.finalImageName,
          Healthcheck: ast.healthCheckOptions,
        }),
        tarLocation: tarLocation,
        port: port,
        protocol: ast.protocol === 'tcp' ? 'tcp' : 'https',
      }),
    ),

    mergeMap(([data, error]) => {
      console.log(''); // sometimes the logs are not printed. this fixes it.
      if (error || !data) {
        return throwError(() => error);
      }
      return of(data.finalUrl);
    }),
    // mergeMap(([data, error]) => {
    //   console.log(''); // sometimes the logs are not printed. this fixes it.
    //   if (error || !data) {
    //     return throwError(() => error);
    //   }
    //   return reportProgress(data.traceId).then(() => data.finalUrl);
    // }),
  );
}

export default als;

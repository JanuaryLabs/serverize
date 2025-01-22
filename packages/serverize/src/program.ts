import { platform } from 'os';
import ignore from '@balena/dockerignore';
import { checkbox, input, select } from '@inquirer/prompts';
import { ParseError, ProblematicResponse } from '@serverize/client';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import cliSpinners from 'cli-spinners';
import { Option } from 'commander';
import debug from 'debug';
import { type Dockerfile, DockerfileParser } from 'dockerfile-ast';
import glob from 'fast-glob';
import { signOut } from 'firebase/auth';
import { readFile } from 'fs/promises';
import ora from 'ora';
import validator from 'validator';

import parse from 'parse-duration';
import { coerceArray, nodeServer } from 'serverize/dockerfile';
import { exist } from 'serverize/utils';
import { client } from './lib/api-client';
import { initialise } from './lib/auth';
import { auth } from './lib/firebase';

import { box } from '@january/console';
import { getImageExposedPorts } from './lib/image';

export interface Healthcheck {
  Test?: string[];
  StartPeriod?: number;
  Interval?: number;
  Retries?: number;
  Timeout?: number;
}

export interface AST {
  healthCheckOptions: Healthcheck | undefined;
  getPaths: () => Promise<string[]>;
  expose?: string;
  finalImageName?: string | null;
  dockerfile: string;
}

export async function inspectDockerfile(
  dockerignorefilePath: string,
  dockerfilePath: string,
): Promise<AST> {
  let dockerignore = '';
  if (!(await exist(dockerfilePath))) {
    throw new Error(`No Dockerfile found at ${dockerfilePath}`);
  }
  if (!(await exist(dockerignorefilePath))) {
    spinner.warn(
      `No .dockerignore found at ${dockerignorefilePath}. Using defaults.`,
    );

    // throw new Error(`No .dockerignore found at ${dockerignorefilePath}`);
    dockerignore = nodeServer.dockerignore.join('\n');
  } else {
    logger('Reading .dockerignore at %s', dockerignorefilePath);
    dockerignore = await readFile(dockerignorefilePath, 'utf-8');
  }

  logger('Reading Dockerfile at %s', dockerfilePath);
  const dockerfile = await readFile(dockerfilePath, 'utf-8');
  const ast = DockerfileParser.parse(dockerfile);
  const exposeInstructions = ast
    .getInstructions()
    .find((instruction) => instruction.getInstruction() === 'EXPOSE');

  const [healthCheck] = ast.getHEALTHCHECKs();
  let healthCheckOptions: Record<string, any> = {};
  if (healthCheck) {
    const flags = healthCheck.getFlags();
    healthCheckOptions = refineHealthcheck({
      StartPeriod: flags
        .find((it) => it.getName() === 'start-period')
        ?.getValue(),
      Retries: flags.find((it) => it.getName() === 'retries')?.getValue(),
      Timeout: flags.find((it) => it.getName() === 'timeout')?.getValue(),
      Interval: flags.find((it) => it.getName() === 'interval')?.getValue(),
      Test: healthCheck.getRawArgumentsContent(),
    });
  }
  const portandimage = exposeInstructions
    ? {
        port: exposeInstructions
          .getArguments()
          .map((it) => it.getValue())[0]
          .split('/tcp')[0],
        image: getFinalStageImageName(ast),
      }
    : guessPort(ast);

  return {
    healthCheckOptions: Object.keys(healthCheckOptions).length
      ? (healthCheckOptions as Healthcheck)
      : undefined,
    getPaths: async () => {
      const copies = ast.getCOPYs();
      const paths = new Set<string>();
      for (const copy of copies) {
        if (copy.getFlags().length) continue;
        const [srcArg] = copy.getArguments();
        let path = srcArg.getValue();
        if (path === '.') {
          path = './';
        }
        paths.add(!path.endsWith('/') ? path : path + '**');
      }

      const filteredPaths = ignore({ ignorecase: true })
        .add(dockerignore)
        .filter(
          await glob(Array.from(paths), {
            cwd: process.cwd(),
          }),
        );
      return filteredPaths;
    },
    finalImageName: portandimage?.image,
    expose: portandimage?.port,
    dockerfile: dockerfilePath,
  };
}
export async function inspectImage(image: string): Promise<AST> {
  const [port] = await getImageExposedPorts(image);

  const portandimage = {
    port: port,
    image: image, // should we inspect the image layers, maybe use docker history?
  };

  return {
    healthCheckOptions: undefined,
    getPaths: async () => {
      return [];
    },
    expose: portandimage?.port,
    dockerfile: '',
  };
}

export const logger = debug('serverize');
const SPINNER_TYPE =
  platform() === 'win32' ? cliSpinners.material : cliSpinners.pipe;

export function createSpinner() {
  return ora({
    spinner: SPINNER_TYPE,
    prefixText: '─ Serverize',
  });
}

export const spinner = createSpinner();

export function printDivider(character = '─') {
  const columns = process.stdout.columns || 80;
  const line = character.repeat(columns);
  console.log(line);
}

export function tell(message: string, newLine = false) {
  if (!message && newLine !== true) {
    return;
  }
  spinner.text = `${message}${newLine ? '\n' : ''}`;
  spinner.render();
}
export const nameValidator = (value: string) =>
  validator.isAlpha(value, 'en-US', { ignore: '-' });

export const askForProjectName = () =>
  input({
    message: 'Project name',
    validate: (v) => {
      const isValid = nameValidator(v);
      if (!isValid) {
        return 'Project name can only contain letters and hyphens';
      }
      return true;
    },
  });

export const cwdOption = new Option('--cwd [cwd]', 'Project directory').default(
  process.cwd(),
);
export const outputOption = new Option(
  '-o, --output-file <outputFile>',
  'Write output to a file',
);

export const imageOption = new Option(
  '-i, --image [image]',
  `Docker image to deploy.`,
);

export const contextOption = new Option(
  '--context [context]',
  'Docker build context',
).default('.');
export const channelOption = new Option(
  '-c, --channel <channel>',
  'Channel name (dev or preview)',
).default('dev');
export const releaseOption = new Option(
  '-r, --release <release>',
  'Release name',
).default('latest');
export const projectOption = new Option(
  '-p, --project-name <projectName>',
  'The project name',
).makeOptionMandatory(true);
if (process.env.SERVERIZE_PROJECT) {
  projectOption.default(process.env.SERVERIZE_PROJECT);
}
if (process.env.SERVERIZE_PROJECT || process.env.SERVERIZE_API_TOKEN) {
  projectOption.makeOptionMandatory(false);
}

export async function ensureUser() {
  const user = await initialise();
  if (!user) {
    ensureUser.say();
    return null;
  }
  const { claims } = await user.getIdTokenResult(true);
  if (!claims.aknowledged) {
    // in case the user created but the server didn't process it correctly.
    await signOut(auth).catch(() => {
      // noop
    });
    await user.delete().catch(() => {
      // noop
    });
    ensureUser.say();
    return null;
  }
  if (!user.emailVerified) {
    // spinner.warn('Email not verified: Please verify your email.');
  }
  return { user, claims };
}
ensureUser.say = () => {
  tell('You need to sign in first', true);
  box.print(
    'Authentication',
    'Login $ npx serverize auth signin',
    'Signup $ npx serverize auth signup',
  );
};

export async function multiselect<
  T extends { name: string; value: string },
>(config: {
  title: string;
  loop?: boolean;
  choices: readonly T[];
  required?: boolean;
}): Promise<T['name'][]> {
  return checkbox({
    theme: {
      prefix: '─',
    },
    instructions: 'Press <space> to select. <enter> to submit',
    required: config.required,
    message: config.title,
    loop: config.loop ?? true,
    choices: config.choices,
  });
}
export async function dropdown<
  T extends { name: string; value: string },
>(config: {
  title: string;
  default?: string;
  loop?: boolean;
  choices: readonly T[];
}): Promise<T['name']> {
  return select({
    message: config.title,
    default: config.default,
    loop: config.loop ?? true,
    choices: config.choices,
  });
}

export async function getCurrentProject(project?: string) {
  const apiToken = process.env.SERVERIZE_API_TOKEN?.trim();

  const useProject = async () => {
    const user = await ensureUser();
    if (!user) {
      process.exit(1);
    }

    const [data, error] = await client.request('GET /projects', {
      name: project,
    });
    if (error) {
      showError(error);
      process.exit(1);
    }

    if (data.records.length === 0) {
      spinner.fail(`Project ${chalk.blue(project)} not found`);
      process.exit(1);
    }

    return {
      projectId: data.records[0].id,
      projectName: data.records[0].name,
      token: await user.user.getIdToken(),
    };
  };

  if (project && apiToken) {
    return await useProject();
  } else if (project) {
    return await useProject();
  } else if (apiToken) {
    // TODO: exchange token for custom jwt instead
    const [data, error] = await client.request('GET /tokens/{token}', {
      token: apiToken,
    });
    if (error) {
      showError(error);
      process.exit(1);
    }
    return {
      projectId: data.project.id,
      projectName: data.project.name,
      token: apiToken,
    };
  }
  spinner.fail('Missing project name. use --project-name');
  process.exit(1);
}

function getFinalStageImageName(ast: Dockerfile) {
  const froms = ast.getFROMs().slice(0, -1);
  const [finalStage] = ast.getFROMs().slice(-1);

  if (!finalStage) {
    throw new Error('Could not find FROM instruction');
  }
  let finalStageImage = finalStage.getImageName();
  if (!finalStage.getImageTag()) {
    // TODO: recursively find the base image
    const baseFrom = froms.find(
      (it) => it.getBuildStage() === finalStage.getImage(),
    );

    // if (!baseFrom) {
    //   throw new Error('Could not find base FROM instruction');
    // }

    finalStageImage = baseFrom ? baseFrom.getImageName() : null;
  }
  return finalStageImage;
}

function guessPort(ast: Dockerfile) {
  const imageToPortMap: Record<string, string> = {
    node: '3000', // Default port for Node.js apps
    bun: '3000', // Default port for Bun runtime
    deno: '3000', // Default port for Deno runtime
    nginxinc: '8080', // NGINX Inc official image, default HTTP port
    nginx: '80', // NGINX web server, default HTTP port
    httpd: '80', // Apache HTTP Server default HTTP port
    mysql: '3306', // MySQL database default port
    mariadb: '3306', // MariaDB (MySQL-compatible) database default port
    postgres: '5432', // PostgreSQL database default port
    mongo: '27017', // MongoDB database default port
    redis: '6379', // Redis cache default port
    cassandra: '9042', // Cassandra database default port
    elasticsearch: '9200', // Elasticsearch default HTTP port
    grafana: '3000', // Grafana visualization tool default port
    jenkins: '8080', // Jenkins CI server default port
    rabbitmq: '5672', // RabbitMQ message broker default port
    influxdb: '8086', // InfluxDB time-series database default port
    php: '9000', // PHP-FPM default port
    python: '8000', // Common default port for Python HTTP servers
    golang: '8080', // Common default for Go web servers
    tomcat: '8080', // Apache Tomcat server default HTTP port
    memcached: '11211', // Memcached caching system default port
    couchdb: '5984', // CouchDB database default port
    consul: '8500', // Consul service mesh default port
    vault: '8200', // HashiCorp Vault default port
    etcd: '2379', // etcd key-value store default port
    kafka: '9092', // Apache Kafka messaging service default port
    zookeeper: '2181', // Zookeeper coordination service default port
    prometheus: '9090', // Prometheus monitoring system default port
    minio: '9000', // MinIO object storage default port
    sonarqube: '9000', // SonarQube code quality default port
    traefik: '8080', // Traefik reverse proxy default port
    keycloak: '8080', // Keycloak identity provider default port
    openldap: '389', // OpenLDAP directory server default port
    nexus: '8081', // Nexus repository manager default port
    wordpress: '80', // WordPress default HTTP port
    drupal: '80', // Drupal CMS default HTTP port
    joomla: '80', // Joomla CMS default HTTP port
    prestashop: '80', // PrestaShop e-commerce platform default HTTP port
    apache: '80', // Another common name for Apache HTTP server
  };
  const finalStageImage = getFinalStageImageName(ast);
  if (finalStageImage) {
    const imageName = finalStageImage.split('/').shift() as string;
    return {
      image: finalStageImage,
      port: imageToPortMap[imageName],
    };
  }
  return undefined;
}

export function showError(
  error?: ProblematicResponse | ParseError<any> | Error,
) {
  if (!error) return;
  if (typeof error === 'string') {
    return spinner.fail(error);
  }

  if ('kind' in error) {
    if (error.kind === 'parse') {
      const flattened = Object.entries(error.fieldErrors).map(([key, it]) => ({
        path: key,
        message: (it as any[])[0].message,
      }));
      const message = `${flattened.map((it) => `${it.path}: ${it.message}`).join('\n')}`;
      return spinner.fail(`${message}\n${message}`);
    }
    if (error.kind === 'response') {
      const { errors, detail, title } = error.body as any;
      const flattened = Object.entries(errors ?? {}).map(([key, it]) => ({
        path: key,
        message: (it as any[])[0].message,
      }));
      const validationMessage = `${flattened.map((it) => `${it.path}: ${it.message}`).join('\n')}`;
      return spinner.fail(`${detail || title}\n${validationMessage}`);
    }
  }
  if (error instanceof Error) {
    return spinner.fail(error.message);
  }
  return spinner.fail(JSON.stringify(error));
}

export function showProgressBar(bars: string[]) {
  const multiBar = new cliProgress.MultiBar(
    {
      clearOnComplete: true,
      hideCursor: true,
      stopOnComplete: true,
      format: '- {name} |{bar}| {percentage}%',
    },
    cliProgress.Presets.shades_grey,
  );
  return bars.map((name) => {
    return multiBar.create(100, 0, { name: name });
  });
}

export function refineHealthcheck(healthcheck: {
  StartPeriod?: string | null;
  Retries?: string | null;
  Timeout?: string | null;
  Interval?: string | null;
  Test?: string | null;
}) {
  const mappers: Record<string, (...args: any[]) => any> = {
    StartPeriod: (value: string) => parse(value, 'nanosecond'),
    Retries: (value: string) => (value ? parseInt(value, 10) : null),
    Timeout: (value: string) => parse(value, 'nanosecond'),
    Interval: (value: string) => parse(value, 'nanosecond'),
    Test: (value: string) => coerceArray(value),
  };
  const refined: Record<string, unknown> = {};
  for (const key in healthcheck) {
    if (key in mappers) {
      refined[key] = mappers[key]((healthcheck as any)[key]);
    }
  }
  return refined;
}

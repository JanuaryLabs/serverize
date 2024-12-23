import yaml from 'js-yaml';

import { toKevValEnv, writeFiles } from 'serverize/utils';

export interface ComposeService {
  image: string;
  working_dir?: string;
  ports?: string[];
  ulimits?: Record<string, unknown>;
  volumes?: string[];
  networks?: string[];
  environment?: Record<string, string>;
  appEnvironment?: Record<string, string>;
  depends_on?: ComposeService[];
  build?: {
    context: string;
    dockerfile: string;
  };
  command?: string;
  restart?: 'unless-stopped' | 'no';
  env_file?: string[];
  develop?: {
    watch: (
      | {
          action: 'sync';
          path: string;
          target: string;
          ignore: string[];
        }
      | {
          action: 'rebuild';
          path: string;
        }
    )[];
  };
}

export interface Compose {
  volumes: Record<string, any>;
  networks: Record<string, any>;
  services: Record<string, any>;
}

export interface ServiceHelper {
  composeService: ComposeService;
  ports: { host: string; internal: string }[];
  volumes: { src: string; dest: string; isNamedVolume: boolean }[];
  networks: string[];
  dependsOn: (services: Record<string, ReturnType<typeof service>>) => string[];
}

export interface ComposePort {
  host: string;
  internal: string;
}

export function mapPorts(ports: string[]): ComposePort[] {
  return ports.map((it) => {
    const [host, internal] = it.split(':');
    return {
      host,
      internal,
    };
  });
}

export function service(serviceLike: ComposeService): ServiceHelper {
  const volumes = (serviceLike.volumes ?? []).map((it) => {
    const [src, dest] = it.split(':');
    return {
      src,
      dest,
      isNamedVolume: !(src.startsWith('/') || src.startsWith('./')),
    };
  });
  return {
    composeService: serviceLike,
    ports: mapPorts(serviceLike.ports ?? []),
    volumes,
    networks: serviceLike.networks ?? [],
    dependsOn: (services: Record<string, ReturnType<typeof service>>) => {
      const depends_on: string[] = [];
      for (const dependencie of serviceLike.depends_on ?? []) {
        for (const [serviceName, serviceLike] of Object.entries(services)) {
          if (serviceLike.composeService === dependencie) {
            depends_on.push(serviceName);
          }
        }
      }
      return depends_on;
    },
  };
}

export function compose(services: Record<string, ReturnType<typeof service>>) {
  const dockerCompose: Compose = {
    services: {},
    volumes: {},
    networks: {},
  };
  const appEnvironment: Record<string, string> = {};
  for (const [serviceName, it] of Object.entries(services)) {
    const depends_on = it.dependsOn(services);

    Object.assign(appEnvironment, it.composeService.appEnvironment ?? {});
    delete it.composeService.appEnvironment;

    dockerCompose.services[serviceName] = {
      ...it.composeService,
      environment: Object.keys(it.composeService.environment ?? {}).length
        ? it.composeService.environment
        : undefined,
      depends_on: depends_on.length ? depends_on : undefined,
    };

    dockerCompose.volumes = {
      ...dockerCompose.volumes,
      ...it.volumes
        .filter((it) => it.isNamedVolume)
        .reduce(
          (acc, it) => ({
            ...acc,
            [it.src]: {},
          }),
          {},
        ),
    };
    dockerCompose.networks = {
      ...dockerCompose.networks,
      ...it.networks.reduce(
        (acc, it) => ({
          ...acc,
          [it]: {},
        }),
        {},
      ),
    };
  }

  return {
    dockerCompose: dockerCompose,
    environment: appEnvironment,
    print() {
      return yaml.dump(dockerCompose, {
        skipInvalid: false,
        noRefs: true,
        forceQuotes: true,
        noCompatMode: true,
        schema: yaml.JSON_SCHEMA,
      });
    },
    write(
      config: { composeFilePath?: string; envFilePath?: string } = {
        composeFilePath: 'compose.dev.yml',
        envFilePath: '.env.compose',
      },
    ) {
      return writeFiles(process.cwd(), {
        [config.composeFilePath ?? 'compose.dev.yml']: this.print(),
        [config.envFilePath ?? '.env.compose']: toKevValEnv(appEnvironment),
      });
    },
    run: () => {
      //
    },
  };
}

export function writeCompose({
  dockerCompose,
  environment,
}: ReturnType<typeof compose>) {
  return writeFiles(process.cwd(), {
    'compose.dev.yml': yaml.dump(dockerCompose, {
      skipInvalid: false,
      noRefs: true,
      forceQuotes: true,
      noCompatMode: true,
      schema: yaml.JSON_SCHEMA,
    }),
    '.env.compose': toKevValEnv(environment),
  });
}

import { tables } from '@workspace/entities';

interface TraefikService {
  loadBalancer: {
    servers: { url: string }[];
  };
}

interface TraefikRouter {
  service: string;
  entrypoints: string[];
  rule: string;
  middlewares?: string[];
  tls?: {
    certresolver: string;
  };
}
export function safeFail<T>(fn: () => T, defaultValue: T): typeof defaultValue {
  try {
    return fn();
  } catch (error) {
    return defaultValue;
  }
}

export const SERVERIZE_DOMAIN =
  process.env.NODE_ENV === 'development' ? '127.0.0.1.nip.io' : 'january.sh';

export const PROTOCOL =
  process.env.NODE_ENV === 'development' ? 'http' : 'https';

export function toTraefikConfig(
  releases: InstanceType<typeof tables.releases>[],
) {
  const services = releases.reduce<Record<string, TraefikService>>(
    (acc, release) => {
      // TODO: guess the port instead of defaulting to 3000
      const port =
        release.port ||
        safeFail(() => JSON.parse(release.runtimeConfig || '{}').port, 3000);
      acc[release.domainPrefix] = {
        loadBalancer: {
          servers: [{ url: `http://${release.domainPrefix}:${port}` }],
        },
      };
      return acc;
    },
    {},
  );
  const defaultEntrypoint =
    process.env.NODE_ENV === 'development' ? 'web' : 'websecure';
  const productionRouteProps: Partial<TraefikRouter> =
    process.env.NODE_ENV === 'development'
      ? {}
      : {
          tls: {
            certresolver: 'letsencrypt',
          },
        };
  const sablierMiddlewares = releases.reduce<
    Record<string, ReturnType<typeof createSablierMiddleware>>
  >((acc, release) => {
    acc[`sablier-blocking-${release.domainPrefix}`] = createSablierMiddleware(
      release.domainPrefix,
    );
    return acc;
  }, {});
  const routers = releases.reduce<Record<string, TraefikRouter>>(
    (acc, release) => {
      acc[release.domainPrefix] = {
        service: release.domainPrefix,
        entrypoints: [defaultEntrypoint],
        rule: `Host(\`${release.domainPrefix}.${SERVERIZE_DOMAIN}\`)`,
        middlewares: [
          `sablier-blocking-${release.domainPrefix}@http`,
          'rate-limit@http',
        ],
        ...productionRouteProps,
      };
      return acc;
    },
    {},
  );

  return {
    http: {
      middlewares: {
        ...sablierMiddlewares,
        'sablier-blocking-whoami': createSablierMiddleware('whoami'),
        'rate-limit': {
          ratelimit: {
            average: 100,
            burst: 200,
            period: '1s',
          },
        },
      },
      services: {
        whoami: {
          loadBalancer: {
            servers: [{ url: 'http://whoami:80' }],
          },
        },
        tusd: {
          loadBalancer: {
            servers: [{ url: 'http://tusd:8080' }],
          },
        },
        'serverize-manager': {
          loadBalancer: {
            servers: [{ url: 'http://manager:3000' }],
          },
        },
        'serverize-api': {
          loadBalancer: {
            servers: [{ url: 'http://api:3000' }],
          },
        },
        ...services,
      },
      routers: {
        dashboard: {
          service: 'api@internal',
          rule: `Host(\`dashboard.${SERVERIZE_DOMAIN}\`)`,
          entrypoints: [defaultEntrypoint],
          ...productionRouteProps,
        },
        whoami: {
          service: 'whoami',
          entrypoints: [defaultEntrypoint],
          rule: `Host(\`whoami.${SERVERIZE_DOMAIN}\`)`,
          middlewares: ['sablier-blocking-whoami@http', 'rate-limit@http'],
          ...productionRouteProps,
        },
        tusd: {
          service: 'tusd',
          entrypoints: [defaultEntrypoint],
          rule: `Host(\`tusd.${SERVERIZE_DOMAIN}\`)`,
          middlewares: [],
          // middlewares: ['rate-limit@http'],
          ...productionRouteProps,
        },
        'serverize-manager': {
          service: 'serverize-manager',
          entrypoints: [defaultEntrypoint],
          rule: `Host(\`serverize-manager.${SERVERIZE_DOMAIN}\`)`,
          middlewares: ['rate-limit@http'],
          ...productionRouteProps,
        },
        'serverize-api': {
          service: 'serverize-api',
          entrypoints: [defaultEntrypoint],
          rule: `Host(\`serverize-api.${SERVERIZE_DOMAIN}\`)`,
          middlewares: ['rate-limit@http'],
          ...productionRouteProps,
        },
        ...routers,
      },
    },
    ...(process.env.NODE_ENV !== 'development'
      ? {
          tls: {
            stores: {
              default: {
                defaultGeneratedCert: {
                  resolver: 'letsencrypt',
                  domain: {
                    main: SERVERIZE_DOMAIN,
                    sans: [`*.${SERVERIZE_DOMAIN}`],
                  },
                },
              },
            },
          },
        }
      : {}),
  };
}

function createSablierMiddleware(groupName: string) {
  return {
    plugin: {
      sablier: {
        group: groupName,
        sablierUrl: 'http://sablier:10000',
        sessionDuration: process.env.NODE_ENV === 'development' ? '20s' : '20m',
        blocking: {
          defaultTimeout: '30s',
        },
      },
    },
  };
}

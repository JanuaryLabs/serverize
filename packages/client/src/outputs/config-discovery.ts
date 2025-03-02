export type ConfigDiscovery = {
  tls?:
    | {
        stores: {
          default: {
            defaultGeneratedCert: {
              resolver: string;
              domain: { main: string; sans: string[] };
            };
          };
        };
      }
    | undefined;
  tcp?:
    | {
        routers: Record<string, TraefikRouter>;
        services: Record<string, TraefikService>;
      }
    | undefined;
  http: {
    middlewares: {
      'sablier-blocking-whoami': {
        plugin: {
          sablier: {
            group: string;
            sablierUrl: string;
            sessionDuration: string;
            blocking: { defaultTimeout: string };
          };
        };
      };
      'rate-limit': {
        ratelimit: { average: number; burst: number; period: string };
      };
    };
    services: {
      whoami: { loadBalancer: { servers: { url: string }[] } };
      tusd: { loadBalancer: { servers: { url: string }[] } };
      'serverize-manager': { loadBalancer: { servers: { url: string }[] } };
      'serverize-api': { loadBalancer: { servers: { url: string }[] } };
    };
    routers: {
      dashboard: {
        service: string;
        entrypoints: string[];
        rule: string;
        middlewares?: string[] | undefined;
        tls?: { certresolver: string } | undefined;
      };
      whoami: {
        service: string;
        entrypoints: string[];
        rule: string;
        middlewares: string[];
        tls?: { certresolver: string } | undefined;
      };
      tusd: {
        service: string;
        entrypoints: string[];
        rule: string;
        middlewares: string[];
        tls?: { certresolver: string } | undefined;
      };
      'serverize-manager': {
        service: string;
        entrypoints: string[];
        rule: string;
        middlewares: string[];
        tls?: { certresolver: string } | undefined;
      };
      'serverize-api': {
        service: string;
        entrypoints: string[];
        rule: string;
        middlewares: string[];
        tls?: { certresolver: string } | undefined;
      };
    };
  };
};

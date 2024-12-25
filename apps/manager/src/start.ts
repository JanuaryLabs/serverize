import { Serverize } from '@serverize/client';
import type { Container } from 'dockerode';
import { tmpdir } from 'os';
import { join } from 'path';
import type { RuntimeConfig } from 'serverize';

import { docker, followProgress, getContainer } from 'serverize/docker';
import { extractError } from 'serverize/utils';

import { fileWriter } from './file';
import { ReleaseInfo, createRemoteServer } from './manager';

export const UPLOADS_DIR =
  process.env.UPLOAD_DIR ||
  (process.env.NODE_ENV === 'development'
    ? join(tmpdir(), 'uploads')
    : '/serverize/uploads');

interface LogEntry {
  type: 'progress' | 'logs' | 'complete' | 'error';
  message: string;
}

const imageToMemoryMap: Record<string, string> = {
  node: '64MB', // Lightweight Node.js server
  bun: '64MB', // Bun is lightweight, similar to Node.js
  deno: '64MB', // Minimal runtime for Deno
  nginxinc: '32MB', // Lightweight NGINX with static file serving
  nginx: '32MB', // Default NGINX server
  httpd: '64MB', // Apache HTTP server is slightly heavier
  mysql: '512MB', // Minimum memory for small database use
  mariadb: '512MB', // MariaDB similar to MySQL
  postgres: '512MB', // PostgreSQL minimum for small workloads
  mongo: '512MB', // MongoDB minimum for lightweight use
  redis: '64MB', // Redis is lightweight in memory usage
  cassandra: '1GB', // Cassandra needs higher memory for JVM
  elasticsearch: '2GB', // Elasticsearch is memory-intensive
  grafana: '128MB', // Grafana lightweight for small setups
  jenkins: '512MB', // Jenkins minimum for basic CI setup
  rabbitmq: '128MB', // RabbitMQ lightweight for messaging
  influxdb: '256MB', // InfluxDB for small datasets
  php: '64MB', // PHP runtime (FPM) for small apps
  python: '128MB', // Python lightweight HTTP server
  golang: '32MB', // Minimal Go HTTP server
  tomcat: '512MB', // Apache Tomcat needs more for Java apps
  memcached: '64MB', // Memcached is lightweight
  couchdb: '256MB', // CouchDB needs moderate memory
  consul: '128MB', // Lightweight Consul agent
  vault: '256MB', // HashiCorp Vault for secrets management
  etcd: '128MB', // etcd key-value store
  kafka: '2GB', // Apache Kafka is memory-intensive
  zookeeper: '512MB', // Zookeeper for coordination
  prometheus: '512MB', // Prometheus for lightweight monitoring
  minio: '128MB', // MinIO for object storage
  sonarqube: '1GB', // SonarQube for code analysis
  traefik: '64MB', // Lightweight Traefik reverse proxy
  keycloak: '512MB', // Keycloak for identity management
  openldap: '128MB', // Lightweight directory server
  nexus: '512MB', // Nexus repository manager
  wordpress: '128MB', // WordPress needs moderate memory
  drupal: '128MB', // Similar to WordPress
  joomla: '128MB', // Similar to WordPress and Drupal
  prestashop: '256MB', // Slightly heavier than WordPress
  apache: '64MB', // Apache HTTP server
};

export async function startServer(
  token: string,
  signal: AbortSignal,
  releaseInfo: ReleaseInfo,
  runtimeConfig: RuntimeConfig,
) {
  const session = fileWriter<LogEntry>(
    join(tmpdir(), releaseInfo.traceId + '.jsonl'),
    signal,
  );
  await session.write({ type: 'progress', message: 'Creating session...' });

  const release = makeRelease(releaseInfo.releaseId, token);

  // Get the current time in seconds since the Unix epoch
  const sinceTimestamp = Math.floor(Date.now() / 1000);
  const imageName = runtimeConfig.image
    ? (runtimeConfig.image.split('/').shift() as string)
    : null;

  const [containerName, error] = await extractError(() =>
    createRemoteServer(
      signal,
      releaseInfo,
      async () => {
        await session.write({
          type: 'progress',
          message: 'Processing image...',
        });
        const stream = await docker.loadImage(
          join(UPLOADS_DIR, releaseInfo.tarLocation),
          {
            t: releaseInfo.image,
            abortSignal: signal,
          },
        );
        await session.write({ type: 'progress', message: 'Image loaded...' });
        await followProgress(stream);
        await session.write({
          type: 'progress',
          message: 'Image processed...',
        });
        return releaseInfo.image;
      },
      {
        memory:
          parseInt(
            imageName ? imageToMemoryMap[imageName] || '96' : '96',
            10,
          ) || 96,
        Healthcheck: runtimeConfig.Healthcheck,
      },
    ),
  );

  if (error) {
    await session.write({
      type: 'error',
      message: `Server error: please try again later`,
    });
    await release.fail();
    return;
  }

  await release.waiting();
  const container = await getContainer({ name: containerName });
  if (!container) {
    await session.write({
      type: 'error',
      message: `Something went wrong. Container ${containerName} not found`,
    });
    await release.fail();
    return;
  }

  // if (runtimeConfig.Healthcheck?.Test?.length) {
  //   await session.write({
  //     type: 'progress',
  //     message: 'Checking container health...',
  //   });
  //   // TODO: health check should be streamed using SSE, file writer have problems
  //   const healthy = await lastValueFrom(
  //     listenToDockerEvents({
  //       filters: {
  //         container: [containerName],
  //         type: ['container'],
  //         event: ['health_status'],
  //       },
  //     }).pipe(
  //       switchMap(() => container.inspect().then((info) => info.State.Health)),
  //       map((event) => event?.Status === 'healthy'),
  //       take(1),
  //       catchError(() => of(false)),
  //     ),
  //   );
  //   if (!healthy) {
  //     await sendLogAndEnd(container);
  //     return;
  //   }
  // }

  await session.end({
    type: 'complete',
    message: 'Taking snapshot...',
  });
  await release.success({ containerName });

  async function sendLogAndEnd(container: Container) {
    const logs = await container.logs({
      since: sinceTimestamp,
      follow: false,
      details: true,
      stdout: true,
      stderr: true,
    });
    await session.write({
      type: 'logs',
      message: logs.toString('utf8'),
    });
    await session.end({
      type: 'error',
      message: `Container not healthy; Check that: \n- The dockerfile runs a server.\n- Exposes the correct port.\n- Specify a health check instruction.`,
    });
    console.log('Container not healthy', logs);
    await release.fail();
  }
}

function makeRelease(id: string, token: string) {
  const client = new Serverize({
    token,
    baseUrl: process.env.API_URL!,
  });
  return {
    waiting: () =>
      client.request('PATCH /releases/{releaseId}', {
        releaseId: id,
        status: 'waiting',
      }),
    fail: () =>
      client.request('PATCH /releases/complete/{releaseId}', {
        releaseId: id,
        conclusion: 'failure',
      }),
    success: (options: { containerName: string }) =>
      client.request('PATCH /releases/complete/{releaseId}', {
        releaseId: id,
        conclusion: 'success',
        containerName: options.containerName,
      }),
  };
}

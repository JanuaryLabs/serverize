import { tmpdir } from 'os';
import type { Container } from 'dockerode';

import { join } from 'path';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import type { RuntimeConfig } from 'serverize';
import { docker, followProgress, getContainer } from 'serverize/docker';
import { extractError } from 'serverize/utils';
import { tables } from '#entities';
import {
  createQueryBuilder,
  execute,
  patchEntity,
  useTransaction,
} from '#extensions/postgresql/execute.ts';
import { fileWriter } from './file.ts';
import { type ReleaseInfo, createRemoteServer } from './manager';

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
  signal: AbortSignal,
  releaseInfo: ReleaseInfo,
  runtimeConfig: RuntimeConfig,
) {
  const session = fileWriter<LogEntry>(
    join(tmpdir(), releaseInfo.traceId + '.jsonl'),
    signal,
  );
  await session.write({ type: 'progress', message: 'Creating session...' });

  const releaseManager = makeReleaseManager(releaseInfo.id);

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
        await loadImage(releaseInfo, signal);
        await session.write({
          type: 'progress',
          message: 'Image processed...',
        });
        return releaseInfo.image;
      },
      {
        memory:
          Number.parseInt(
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
    await releaseManager.fail();
    return;
  }

  await releaseManager.waiting();
  const container = await getContainer({ name: containerName });
  if (!container) {
    await session.write({
      type: 'error',
      message: `Something went wrong. Container ${containerName} not found`,
    });
    await releaseManager.fail();
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
  await releaseManager.success({ containerName });

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
    await releaseManager.fail();
  }
}

function makeReleaseManager(id: string) {
  return {
    waiting: () => {
      const qb = createQueryBuilder(tables.releases, 'releases').where(
        'releases.id = :releaseId',
        { releaseId: id },
      );
      return patchEntity(qb, { status: 'waiting' });
    },
    fail: () => {
      return useTransaction(async () => {
        const releaseQb = createQueryBuilder(tables.releases, 'releases').where(
          'releases.id = :releaseId',
          { releaseId: id },
        );
        const [release] = await execute(releaseQb);
        if (!release) {
          throw new ProblemDetailsException({
            status: 400,
            title: 'Release not found',
            detail: `Release with id ${id} not found`,
          });
        }
        await patchEntity(releaseQb, {
          status: 'completed',
          conclusion: 'failure',
        });
      });
    },
    success: (options: { containerName: string }) => {
      return useTransaction(async () => {
        const releaseQb = createQueryBuilder(tables.releases, 'releases').where(
          'releases.id = :releaseId',
          { releaseId: id },
        );
        const [release] = await execute(releaseQb);
        if (!release) {
          throw new ProblemDetailsException({
            status: 400,
            title: 'Release not found',
            detail: `Release with id ${id} not found`,
          });
        }
        await patchEntity(releaseQb, {
          status: 'completed',
          conclusion: 'success',
          containerName: options.containerName,
        });

        // Soft delete other releases with the same name
        const qb = createQueryBuilder(tables.releases, 'releases')
          .where('"releases"."projectId" = :projectId', {
            projectId: release.projectId,
          })
          .andWhere('releases.channel = :channel', {
            channel: release.channel,
          })
          .andWhere('releases.id != :releaseId', {
            releaseId: id,
          })
          .andWhere('releases.name = :name', { name: release.name });
        if (release.serviceName) {
          qb.andWhere('releases.serviceName = :serviceName', {
            serviceName: release.serviceName,
          });
        }

        await qb.softDelete().execute();
      });
    },
  };
}

async function loadImage(releaseInfo: ReleaseInfo, signal: AbortSignal) {
  const stream = await docker.loadImage(
    join(UPLOADS_DIR, releaseInfo.tarLocation),
    {
      t: releaseInfo.image,
      abortSignal: signal,
    },
  );
  await followProgress(stream);
}

import { tmpdir } from 'os';
import { join } from 'path';

import { followProgress } from '../utils';
import { docker } from '../instance';
import { startContainer, upsertNetwork, upsertVolume } from '../utils';

export async function imageExists(repoTag: string) {
  const images = await docker.listImages({ all: true });
  return images.some((it) => (it.RepoTags ?? []).includes(repoTag));
}

export async function runPostgres(config: { network?: string } = {}) {
  const pgRepo = 'postgres:17-alpine';
  const exists = await imageExists(pgRepo);
  if (!exists) {
    const image = await docker.pull(pgRepo);
    await followProgress(image);
  }

  const volumeName = 'postgres_data';
  await upsertVolume(volumeName);
  const user = 'youruser';
  const password = 'yourpassword';
  const database = 'yourdatabase';
  await startContainer('postgres', () =>
    docker.createContainer({
      Image: pgRepo,
      name: 'postgres',
      Env: [
        `POSTGRES_USER=${user}`,
        `POSTGRES_PASSWORD=${password}`,
        `POSTGRES_DB=${database}`,
        'POSTGRES_HOST_AUTH_METHOD=trust',
      ],
      HostConfig: {
        NetworkMode: config.network,
        Binds: [`${volumeName}:/var/lib/postgresql/data`],
        PortBindings: {
          '5432/tcp': [
            {
              HostPort: '5432',
            },
          ],
        },
      },
    }),
  );

  return `postgres://${user}:${password}@postgres:5432/${database}`;
}

export async function runPgAdmin(config: { network?: string } = {}) {
  const repoTag = 'dpage/pgadmin4';
  const exists = await imageExists(repoTag);
  if (!exists) {
    const image = await docker.pull(repoTag);
    await followProgress(image);
  }

  const serverConfigPath = join(tmpdir(), 'servers.json');
  const container = await startContainer('pgadmin', () =>
    docker.createContainer({
      Image: repoTag,
      name: 'pgadmin',
      Env: [
        'PGADMIN_DEFAULT_EMAIL=admin@admin.com',
        'PGADMIN_DEFAULT_PASSWORD=password',
      ],
      HostConfig: {
        NetworkMode: config.network,

        Binds: [`${serverConfigPath}:/pgadmin4/servers.json`],
        PortBindings: {
          '80/tcp': [
            {
              HostPort: '8080',
            },
          ],
        },
      },
    }),
  );
  return `http://localhost:8080`;
}

async function run() {
  await upsertNetwork('dev');
  console.log(await runPostgres({ network: 'dev' }));
  console.log(await runPgAdmin({ network: 'dev' }));
}

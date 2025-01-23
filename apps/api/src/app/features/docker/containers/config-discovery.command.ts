import { trigger } from '@january/declarative';
import { toTraefikConfig } from '@workspace/extensions/user';
import { docker } from 'serverize/docker';
import z from 'zod';

export async function configDiscovery(
  output: trigger.http.output,
  signal: AbortSignal,
) {
  // const qb = createQueryBuilder(tables.releases, 'releases')
  //   .select(['releases.port', 'releases.domainPrefix'])
  //   .where('releases.status = :status', { status: 'completed' })
  //   .andWhere('releases.conclusion = :conclusion', {
  //     conclusion: 'success',
  //   });
  // const releases = await execute(qb);
  // return toTraefikConfig(
  //   releases.map((it) => ({
  //     port: it.port || 3000,
  //     domainPrefix: it.domainPrefix,
  //   })),
  // );
  const containers = await docker.listContainers({
    all: true,
    filters: {
      label: ['serverize.enable=true'],
    },
  });
  return output.ok(
    await toTraefikConfig(
      containers.map((it) => ({
        domainPrefix: it.Labels['serverize.prefix'],
        port: it.Labels['serverize.port'],
      })),
    ),
  );
}

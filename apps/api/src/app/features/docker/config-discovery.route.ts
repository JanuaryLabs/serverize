import { Hono } from 'hono';
import { docker } from 'serverize/docker';
import z from 'zod';
import { type HonoEnv } from '#core/utils.ts';
import output from '#extensions/hono/output.ts';
import { toTraefikConfig } from '#extensions/user/index.ts';
import * as commonZod from '#extensions/zod/index.ts';

export default async function (router: Hono<HonoEnv>) {
  /**
   * @openapi ConfigDiscovery
   * @tags containers
   */
  router.get('/containers/discovery', async (context, next) => {
    const signal = context.req.raw.signal;

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
          protocol: it.Labels['serverize.protocol'],
        })),
      ),
    );
  });
}

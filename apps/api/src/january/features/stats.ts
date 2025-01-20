import { tables } from '@workspace/entities';
import { policies } from '@workspace/extensions/identity';
import {
  createQueryBuilder,
  execute,
  saveEntity,
  upsertEntity,
} from '@workspace/extensions/postgresql';
import {
  PROTOCOL,
  SERVERIZE_DOMAIN,
  clean,
  defaultHealthCheck,
  getChannelEnv,
  releaseCreatedDiscordWebhook,
  serverizeUrl,
  tellDiscord,
  toTraefikConfig,
} from '@workspace/extensions/user';
import { channelSchema, orgNameValidator } from '@workspace/extensions/zod';
import z from 'zod';

import axios from 'axios';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { feature, trigger, workflow } from '@january/declarative';
import { logMe } from 'serverize/utils';

export default feature({
  workflows: [],
});

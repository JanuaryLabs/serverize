import { tables } from '@workspace/entities';
import { firebaseApp } from '@workspace/extensions/firebase-auth';
import {
  createQueryBuilder,
  execute,
  saveEntity,
} from '@workspace/extensions/postgresql';
import { WebhookClient } from 'discord.js';
import { getAuth } from 'firebase-admin/auth';

export async function generateKey() {
  const sodium = await import('libsodium-wrappers').then(
    ({ default: sodium }) => sodium.ready.then(() => sodium),
  );
  return sodium.crypto_secretbox_keygen();
}

export async function encrypt(key: Uint8Array<ArrayBufferLike>, plain: string) {
  const sodium = await import('libsodium-wrappers').then(
    ({ default: sodium }) => sodium.ready.then(() => sodium),
  );
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const secret = sodium.crypto_secretbox_easy(plain, nonce, key);
  return {
    secret,
    nonce,
  };
}

export async function decrypt(
  secret: Uint8Array,
  nonce: Uint8Array,
  key: Uint8Array,
) {
  const sodium = await import('libsodium-wrappers').then(
    ({ default: sodium }) => sodium.ready.then(() => sodium),
  );
  return sodium.to_string(
    sodium.crypto_secretbox_open_easy(secret, nonce, key),
  );
}

export async function getProjectKey(projectId: string) {
  const secretKey = await createQueryBuilder(tables.secretsKeys, 'secrets')
    .where('secrets.projectId = :projectId', {
      projectId: projectId,
    })
    .select(['secrets.key'])
    .getOne();
  if (!secretKey) {
    await saveEntity(tables.secretsKeys, {
      projectId,
      key: await generateKey(),
    });
    return getProjectKey(projectId);
  }
  return secretKey.key;
}

export async function getChannelEnv(input: {
  projectId: string;
  channel: string;
}) {
  const qb = createQueryBuilder(tables.secrets, 'secrets')
    .where('secrets.projectId = :projectId', {
      projectId: input.projectId,
    })
    .andWhere('secrets.channel = :channel', {
      channel: input.channel,
    });
  const secrets = await execute(qb);

  const projectKey = await getProjectKey(input.projectId);

  const env: Record<string, string> = {};
  for (const secret of secrets) {
    const decrypted = await decrypt(
      new Uint8Array(secret.secret),
      new Uint8Array(secret.nonce),
      new Uint8Array(projectKey),
    );
    env[secret.label] = decrypted;
  }
  return env;
}

export const usersWebhook =
  'https://discord.com/api/webhooks/1333405042006425660/67tkFe6ITblJIyaPHw0DBUgQvJLWwFlghRvtyxWLXic3tldu_GOwLyq9gNrnSC1me04J';
export const releaseCreatedDiscordWebhook =
  'https://discord.com/api/webhooks/1333404174075035698/BIu2RhwpE3k_1exg6Kd1tgx8a5OA8_93Qwu3KgCqbWfpHrhQp_UWmfOPA1q9VEKEi1_c';
export async function tellDiscord(message: string, url: string) {
  const webhookClient = new WebhookClient({
    url,
  });
  await webhookClient.send({
    username: 'UsersBot',
    isWebhook: true,
    content: message,
  });
}

export const serverizeUrl = process.env.MANAGEMENT_API_URL;

export function clean(obj: Record<string, any>) {
  const cleaned: Record<string, any> = {};
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      continue;
    } else {
      cleaned[propName] = obj[propName];
    }
  }
  return cleaned;
}

export async function createUser(input: { uid: string }) {
  const user = await saveEntity(tables.users, {
    id: input.uid,
  });
}

export interface Claims {
  organizationId: string;
  workspaceId: string;
  // FIXME: use blocking functions instead of this
  aknowledged: boolean;
}

export async function setUserClaims(input: {
  uid: string;
  organizationId: string;
  workspaceId: string;
}) {
  const claims: Claims = {
    organizationId: input.organizationId,
    workspaceId: input.workspaceId,
    aknowledged: true,
  };
  await getAuth(firebaseApp).setCustomUserClaims(input.uid, claims);
  return claims;
}

export async function createDefaultOrg(input: {
  uid: string;
  name: string;
  projectName: string;
}) {
  const organization = await saveEntity(tables.organizations, {
    name: input.name,
  });
  const workspace = await saveEntity(tables.workspaces, {
    name: 'Default Workspace',
    organizationId: organization.id,
  });
  await createUser({ uid: input.uid });
  const member = await saveEntity(tables.members, {
    userId: input.uid,
    organizationId: organization.id,
  });
  const project = await saveEntity(tables.projects, {
    name: input.projectName,
    workspaceId: workspace.id,
  });
  await saveEntity(tables.preferences, {
    userId: input.uid,
    organizationId: organization.id,
    workspaceId: workspace.id,
  });
  return {
    organizationId: organization.id,
    workspaceId: workspace.id,
    memberId: member.id,
  };
}

export * from './docker';
export * from './traefik';
export * from './file';

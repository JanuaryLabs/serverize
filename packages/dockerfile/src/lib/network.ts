import { execa } from 'execa';

export interface NetworkFactory {
  create(): Promise<string>;
  upsert(): Promise<string>;
  remove(): Promise<void>;
  exists(): Promise<boolean>;
}
export function network(name: string): NetworkFactory {
  return {
    exists() {
      return execa({
        stdin: 'ignore',
      })`docker network inspect ${name}`
        .then((it) => it.exitCode === 0)
        .catch(() => false);
    },
    async create() {
      if (await this.exists()) {
        throw new Error(`Network ${name} already exists`);
      }
      await execa({ stdin: 'inherit' })`docker network create ${name}`;
      return name;
    },
    async upsert() {
      if (!(await this.exists())) {
        return this.create();
      }
      return name;
    },
    async remove() {
      await execa({ stdin: 'inherit' })`docker network rm ${name}`.catch(() => {
        // noop
      });
    },
  };
}

export async function withinNetwork(
  compution: (network: NetworkFactory) => Promise<void>,
) {
  const randomNetwork = network(crypto.randomUUID());
  const networkName = await randomNetwork.create();
  try {
    await compution(randomNetwork);
  } finally {
    await randomNetwork.remove();
  }

  return {
    [Symbol.asyncDispose]: async () => {
      await randomNetwork.remove();
    },
  };
}
import crypto from 'node:crypto';

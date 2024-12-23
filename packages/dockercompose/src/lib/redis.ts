import type { ComposeService } from './compose';

export const redis: ComposeService = {
  image: 'redis:alpine',
  ports: ['6379:6379'],
  environment: {},
  appEnvironment: {
    REDIS_URL: 'redis://redis:6379',
  },
  networks: ['development'],
  volumes: ['redis_data:/data'],
};
export const dragonfly: ComposeService = {
  image: 'docker.dragonflydb.io/dragonflydb/dragonfly',
  ports: ['6379:6379'],
  ulimits: {
    memlock: -1,
  },
  environment: {},
  appEnvironment: {
    REDIS_URL: 'redis://redis:6379',
  },
  networks: ['development'],
  volumes: ['redis_data:/data'],
};

import type { ComposeService } from './compose';

export const minio: ComposeService = {
  image: 'quay.io/minio/minio',
  ports: ['9000:9000', '9001:9001'],
  environment: {
    MINIO_ROOT_USER: 'ROOTUSER',
    MINIO_ROOT_PASSWORD: 'CHANGEME123',
  },
  get appEnvironment() {
    const { MINIO_ROOT_USER: accessKey, MINIO_ROOT_PASSWORD: secretKey } =
      this.environment ?? {};
    return {
      S3_HOST: 'localhost',
      S3_PORT: '9000',
      S3_ENDPOINT: 'http://localhost:9000',
      S3_ACCESS_KEY: accessKey,
      S3_SECRET_KEY: secretKey,
    };
  },
  command: 'server /data --console-address ":9001"',
  networks: ['development'],
  volumes: ['minio:/data'],
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

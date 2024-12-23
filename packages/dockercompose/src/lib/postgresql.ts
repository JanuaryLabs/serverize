import type { ComposeService } from './compose';

export const postgres: ComposeService = {
  image: 'postgres:17-alpine',
  ports: ['5432:5432'],
  volumes: ['postgres_data:/var/lib/postgresql/data'],
  networks: ['development'],
  environment: {
    POSTGRES_PASSWORD: 'yourpassword',
    POSTGRES_USER: 'youruser',
    POSTGRES_DB: 'yourdatabase',
  },
  get appEnvironment() {
    const {
      POSTGRES_PASSWORD: password,
      POSTGRES_USER: user,
      POSTGRES_DB: db,
    } = this.environment ?? {};
    const [host, internal] = (this.ports ?? [])[0].split(':');
    return {
      CONNECTION_STRING: `postgresql://${user}:${password}@database:${host}/${db}`,
    };
  },
};

export const pgadmin: ComposeService = {
  image: 'dpage/pgadmin4',
  ports: ['8080:8080'],
  networks: ['development'],
  environment: {
    PGADMIN_DEFAULT_EMAIL: 'admin@admin.com',
    PGADMIN_DEFAULT_PASSWORD: 'password',
  },
};

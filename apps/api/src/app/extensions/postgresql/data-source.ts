
import entities from '@workspace/entities';
import { DataSource, DefaultNamingStrategy } from 'typeorm';

class NamingStrategy extends DefaultNamingStrategy {
  override tableName(
    targetName: string,
    userSpecifiedName: string | undefined,
  ): string {
    return super.tableName(userSpecifiedName ?? targetName, undefined);
  }
}

export const dataSource = new DataSource({
  type: 'postgres',
});

export function initialize() {
	return dataSource
		.setOptions({
      useUTC: true,
url: process.env.CONNECTION_STRING,
ssl: process.env.NODE_ENV === 'production',
migrationsRun: process.env.ORM_MIGRATIONS_RUN,
logging: process.env.ORM_LOGGING,
synchronize: process.env.ORM_SYNCHRONIZE,
entityPrefix: process.env.ORM_ENTITY_PREFIX,
      entities: [...entities],
      namingStrategy: new NamingStrategy(),
		})
		.initialize();
}

    
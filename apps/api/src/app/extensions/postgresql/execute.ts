import { Transform } from 'stream';
import { AsyncLocalStorage } from 'async_hooks';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import sqlTag, { type RawValue } from 'sql-template-tag';
import {
  type DeepPartial,
  EntityManager,
  type EntityTarget,
  type ObjectLiteral,
  QueryFailedError,
  type QueryRunner,
  SelectQueryBuilder,
} from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

import { dataSource } from './data-source';

const asyncLocalStorage = new AsyncLocalStorage<QueryRunner>();

export type ExecutePipeline<I extends ObjectLiteral> = <
  O extends Record<string, any>,
>(
  domainEntity: I,
  rawEntity: Record<string, any>,
) => I;

export async function execute<U extends ObjectLiteral>(
  qb: SelectQueryBuilder<U>,
  ...mappers: ExecutePipeline<U>[]
) {
  const { entities, raw } = await qb.getRawAndEntities();
  return entities.map((entity, index) => {
    return mappers.reduce((acc, mapper) => {
      return mapper(acc, raw[index]);
    }, entity);
  });
}

/**
 * Begin a transaction and execute a computation. If the computation succeeds, the transaction is committed. If the computation fails, the transaction is rolled back.
 *
 * @param computation async function that takes a `EntityManager` and returns a `Promise`
 * @returns the result of the computation
 * @throws the error thrown by the computation or the error thrown by the transaction
 * @example
 *
 * // If the computation succeeds, the transaction is committed
 *
 * const result = await useTransaction(async (manager) => {
 *  const user = await manager.findOne(User, 1);
 *  user.name = 'New Name';
 *  await manager.save(user);
 *  return user;
 * });
 *
 * // result is the updated user
 *
 * // If the computation fails, the transaction is rolled back
 * const result = await useTransaction(async (manager) => {
 *  const user = await manager.findOne(User, 1);
 *  user.name = 'New Name';
 *  await manager.save(user);
 *  throw new Error('Something went wrong');
 * });
 *
 * // result is undefined
 * // If the transaction fails, the error is thrown
 * const result = await useTransaction(async (manager) => {
 *  const user = await manager.findOne(User, 1);
 *  user.name = 'New Name';
 *  await manager.save(user);
 *  await manager.query('DROP TABLE users');
 * });
 *
 */
export async function useTransaction<TResult>(
  computation: (manager: EntityManager) => Promise<TResult>,
): Promise<TResult> {
  const queryRunner = dataSource.createQueryRunner();
  return asyncLocalStorage.run(queryRunner, async () => {
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await computation(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  });
}

function getManager() {
  const queryRunner = asyncLocalStorage.getStore();
  return queryRunner?.manager ?? dataSource.manager;
}

export function getEntityById<Entity extends ObjectLiteral>(
  entity: EntityTarget<Entity>,
  id: string,
) {
  const qb = createQueryBuilder(entity, 'entity')
    .where('entity.id = :id', { id })
    .limit(1);
  return qb.getOne();
}

function getColumnNameWithoutAlias(column: string, alias: string) {
  return column.replace(`${alias}.`, '');
}

export function createQueryBuilder<Entity extends ObjectLiteral>(
  entity: EntityTarget<Entity>,
  alias: string,
) {
  const manager = getManager();
  const repo = manager.getRepository(entity);
  return repo.createQueryBuilder(alias);
}

export async function removeEntity<
  Entity extends ObjectLiteral,
  T extends DeepPartial<Entity>,
>(
  entityType: EntityTarget<Entity>,
  qbOrEntity: SelectQueryBuilder<T> | T | T[],
): Promise<Entity[]> {
  const manager = getManager();
  const repo = manager.getRepository(entityType);
  if (qbOrEntity instanceof SelectQueryBuilder) {
    return await repo.softRemove(await qbOrEntity.getMany());
  } else if (Array.isArray(qbOrEntity)) {
    return await repo.softRemove(qbOrEntity);
  } else {
    return [await repo.softRemove(qbOrEntity)];
  }
}

export async function patchEntity<
  Entity extends ObjectLiteral,
  T extends QueryDeepPartialEntity<Entity>,
>(
  qb: SelectQueryBuilder<T>,
  entity: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
) {
  const result = await qb
    .update()
    .set(entity as unknown as Entity)
    .execute();
  return (result.affected ?? 0) > 0;
}

export async function setEntity<
  Entity extends ObjectLiteral,
  T extends QueryDeepPartialEntity<Entity>,
>(
  qb: SelectQueryBuilder<T>,
  entity: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
) {
  // TODO: should throw an error if the entity does not exist or one of the required filed is missing
  // put replaces the whole record one met validation
  return patchEntity(qb, entity);
}

export async function increment<
  Entity extends ObjectLiteral,
  T extends QueryDeepPartialEntity<Entity>,
  Column extends Exclude<
    keyof Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
    symbol | number
  >,
>(qb: SelectQueryBuilder<T>, column: Column, value: number | string) {
  const setRecord: QueryDeepPartialEntity<Entity> = {
    [column]: () => `${column} + :incrementValue`,
  } as Entity;
  const result = await qb
    .update()
    .set(setRecord as never)
    .setParameter('incrementValue', value)
    .execute();
  return (result.affected ?? 0) > 0;
}

export async function decrement<
  Entity extends ObjectLiteral,
  T extends QueryDeepPartialEntity<Entity>,
  Column extends Exclude<
    keyof Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
    symbol | number
  >,
>(qb: SelectQueryBuilder<T>, column: Column, value: number | string) {
  const setRecord: QueryDeepPartialEntity<Entity> = {
    [column]: () => `${column} + :decrementValue`,
  } as Entity;
  const result = await qb
    .update()
    .set(setRecord as never)
    .setParameter('decrementValue', value)
    .execute();
  return (result.affected ?? 0) > 0;
}

export async function saveEntity<
  Entity extends ObjectLiteral,
  T extends DeepPartial<Entity>,
>(
  entityType: EntityTarget<Entity>,
  entity: Omit<T, 'createdAt' | 'updatedAt' | 'deletedAt'>,
) {
  const manager = getManager();
  const repo = manager.getRepository(entityType);
  try {
    return await repo.save(entity as T);
  } catch (error) {
    if (error instanceof QueryFailedError) {
      const { severity, code, table, detail } = error.driverError ?? {};
      throw new ProblemDetailsException({
        title: error.message,
        detail: `${severity} with code ${code} on table ${table}: ${detail}`,
        status: 400,
        engineCode: code,
      });
    }
    throw error;
  }
}

export async function upsertEntity<
  Entity extends ObjectLiteral,
  T extends QueryDeepPartialEntity<Entity>,
>(
  entityType: EntityTarget<Entity>,
  entity: Omit<T, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  options: {
    upsertColumns?: Extract<keyof (Entity & { id: string }), string>[];
    conflictColumns?: Extract<keyof (Entity & { id: string }), string>[];
  } = {},
) {
  const manager = getManager();
  const repo = manager.getRepository(entityType);
  await repo
    .createQueryBuilder()
    .insert()
    .into(entityType)
    .values(entity as T)
    .orUpdate(
      options.upsertColumns ??
        (Object.keys(entity) as Extract<
          keyof (Entity & { id: string }),
          string
        >[]),
      options.conflictColumns ?? ['id'],
    )
    .execute();
}

export function sql(
  strings: readonly string[],
  ...values: readonly RawValue[]
) {
  const manager = getManager();
  const serializedSQL = sqlTag(strings, ...values);
  return manager.query(serializedSQL.sql, serializedSQL.values);
}

export function exists<Entity extends ObjectLiteral>(
  qb: SelectQueryBuilder<Entity>,
) {
  return qb.getOne().then(Boolean);
}

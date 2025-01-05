import { camelCase } from 'lodash-es';
import {
  Brackets,
  type ObjectLiteral,
  SelectQueryBuilder,
  type WhereExpressionBuilder,
} from 'typeorm';

function getColumnNameWithoutAlias(column: string, alias: string) {
  return column.replace(`${alias}.`, '');
}

export interface PaginationMetadata {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: string | number | undefined;
  currentPage: string | number | undefined;
  totalCount: number;
  totalPages: number;
}

export class Pagination<T> {
  constructor(
    public records: T,
    public metadata: PaginationMetadata,
  ) {}
}

export function limitOffsetPagination<Entity extends ObjectLiteral>(
  qb: SelectQueryBuilder<Entity>,
  options: {
    pageNo?: number;
    pageSize?: number;
    count: number;
  },
) {
  const pageSize = Number(options.pageSize || 50);
  const pageNo = Number(options.pageNo || 1);
  const offset = (pageNo - 1) * pageSize;
  qb.take(pageSize);
  qb.skip(offset);

  return (result: Entity[]) => ({
    hasNextPage: result.length === pageSize,
    hasPreviousPage: offset > 0,
    pageSize: options.pageSize,
    currentPage: options.pageNo,
    totalCount: options.count,
    totalPages: Math.ceil(options.count / pageSize),
  });
}

export function deferredJoinPagination<Entity extends ObjectLiteral>(
  qb: SelectQueryBuilder<Entity>,
  options: {
    pageNo?: number | string | undefined;
    pageSize?: number | string | undefined;
    count: number;
  },
): (result: Entity[]) => PaginationMetadata {
  const pageSize = Number(options.pageSize || 50);
  const pageNo = Number(options.pageNo || 1);
  const offset = (pageNo - 1) * pageSize;

  const { tablePath: tableName } = qb.expressionMap.findAliasByName(qb.alias);
  if (!tableName) {
    throw new Error(`Could not find table path for alias ${qb.alias}`);
  }

  const subQueryAlias = `deferred_join_${tableName}`;

  qb.innerJoin(
    (subQuery) => {
      const subQueryTableAlias = `deferred_${tableName}`;
      const subQueryBuilder = subQuery
        .from(tableName, subQueryTableAlias)
        .select(`${subQueryTableAlias}.id`, 'id');

      subQueryBuilder.expressionMap.wheres = qb.expressionMap.wheres.map(
        (where) => {
          if (typeof where.condition !== 'string') {
            throw new Error('Only string conditions are supported');
          }
          const updatedCondition = where.condition.replace(
            new RegExp(`\\b${qb.alias}\\b`, 'g'),
            subQueryTableAlias,
          );
          return { ...where, condition: updatedCondition };
        },
      );

      subQueryBuilder.expressionMap.withDeleted = qb.expressionMap.withDeleted;

      return subQueryBuilder
        .orderBy(`${subQueryTableAlias}.createdAt`)
        .limit(pageSize)
        .offset(offset);
    },
    subQueryAlias,
    `${qb.alias}.id = ${subQueryAlias}.id`,
  );

  return (result: Entity[]) => ({
    hasNextPage: result.length === pageSize,
    hasPreviousPage: offset > 0,
    pageSize: options.pageSize,
    currentPage: options.pageNo,
    totalCount: options.count,
    totalPages: Math.ceil(options.count / pageSize),
  });
}

export function cursorPagination<Entity extends ObjectLiteral>(
  qb: SelectQueryBuilder<Entity>,
  options: {
    count: number;
    pageSize: number;
    /**
     * Base64 encoded string of the last record's cursor
     */
    cursor?: string; // we shouldn't need to specify before or after cursor, the cursor should be enough
  },
) {
  const cursorPayload = options.cursor
    ? JSON.parse(Buffer.from(options.cursor, 'base64').toString('utf-8'))
    : null;
  const alias = qb.alias;

  let orderByColumns = Object.keys(qb.expressionMap.orderBys);

  if (!orderByColumns.includes(`${alias}.createdAt`)) {
    // always order by createdAt to ensure a consistent order
    // createdAt will be either first order by in case no order by is specified by the caller function or last order by in case the caller function specified an order by
    qb.addOrderBy(`${alias}.createdAt`);
  }
  if (!orderByColumns.includes(`${alias}.id`)) {
    // fallback to order by id if more than one record is duplicated (have the same attributes used in order by clause)
    qb.addOrderBy(`${alias}.id`);
  }

  orderByColumns = Object.keys(qb.expressionMap.orderBys);

  if (cursorPayload) {
    qb.andWhere(
      new Brackets((qb) => {
        function withCurrentColumn(qb: WhereExpressionBuilder, index: number) {
          const column = orderByColumns[index];
          const paramName = camelCase(
            `last ${getColumnNameWithoutAlias(column, alias)}`,
          );
          qb.andWhere(`${column} > :${paramName}`, {
            [paramName]: cursorPayload[paramName],
          });
        }

        for (let index = 0; index < orderByColumns.length; index++) {
          if (index === 0) {
            withCurrentColumn(qb, index);
            continue;
          }
          qb.orWhere(
            new Brackets((qb) => {
              for (let j = 0; j < index; j++) {
                const previousColumn = orderByColumns[j];
                const paramName = camelCase(
                  `last ${getColumnNameWithoutAlias(previousColumn, alias)}`,
                );
                qb.andWhere(`${previousColumn} = :${paramName}`, {
                  [paramName]: cursorPayload[paramName],
                });
              }
              withCurrentColumn(qb, index);
            }),
          );
        }
      }),
    );
  }

  qb.take(options.pageSize + 1);
  return (result: Entity[]) => ({
    nextCursor: Buffer.from(
      JSON.stringify(
        orderByColumns.reduce<Record<string, any>>((acc, column) => {
          const paramName = camelCase(
            `last ${getColumnNameWithoutAlias(column, alias)}`,
          );
          return {
            ...acc,
            [paramName]: qb.expressionMap.parameters[paramName],
          };
        }, {}),
      ),
    ).toString('base64'),
    previousCursor: null,
    startCursor: null, // always null
    endCursor: '', // think of it as startCursor but the order is reversed
    hasNextPage: false, // if there is nextCursor, then there is a next page
    hasPreviousPage: false, // if there is previousCursor, then there is a previous page
    pageSize: options.pageSize,
    totalCount: options.count,
  });
}

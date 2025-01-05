import { Transform } from 'stream';
import { type ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

export async function stream<
	Entity extends ObjectLiteral,
	T extends QueryDeepPartialEntity<Entity>,
>(qb: SelectQueryBuilder<T>) {
	const stream = await qb.stream();
	return stream.pipe(
		new Transform({
			objectMode: true,
			transform(record, encoding, callback) {
				callback(
					null,
					JSON.stringify(
						Object.fromEntries(
							Object.entries(record).map(([key, value]) => [
								key.replace(/projects_/g, ''),
								value,
							])
						)
					)
				);
			},
		})
	);
}

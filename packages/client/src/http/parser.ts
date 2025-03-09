import { z } from 'zod';

export type ParseError<T extends z.ZodType<any, any, any>> = {
  kind: 'parse';
} & z.inferFlattenedErrors<T>;

export function parse<T extends z.ZodType>(schema: T, input: unknown) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const errors = result.error.flatten((issue) => issue);
    return [null, errors];
  }
  return [result.data as z.infer<T>, null];
}

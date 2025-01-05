import { z } from 'zod';

import { ProblemDetailsException } from 'rfc-7807-problem-details';

export function parse<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  input: unknown,
) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const errors = result.error.flatten((issue) => ({
      message: issue.message,
      code: issue.code,
      fatel: issue.fatal,
      path: issue.path.join('.'),
    })).fieldErrors;
    return [null, errors];
  }
  return [result.data, null];
}

export function parseOrThrow<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  input: unknown,
): z.infer<z.ZodObject<T>> {
  const [data, errors] = parse(schema, input);
  if (errors) {
    const exception = new ProblemDetailsException({
      type: 'validation-failed',
      status: 400,
      title: 'Bad Request.',
      detail: 'Validation failed.',
    });
    exception.Details.errors = errors;
    throw exception;
  }
  return data as z.infer<z.ZodObject<T>>;
}

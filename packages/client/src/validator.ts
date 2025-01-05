import { z } from 'zod';

export function validate<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  input: unknown,
) {
  const result = schema.safeParse(input);
  if (!result.success) {
    return result.error.flatten((issue) => ({
      message: issue.message,
      code: issue.code,
      fatel: issue.fatal,
      path: issue.path.join('.'),
    })).fieldErrors;
  }
  return null;
}

export class ValidationError extends Error {
  flattened: { path: string; message: string }[];
  constructor(
    public override message: string,
    public errors: ReturnType<typeof validate>,
  ) {
    super(message);
    this.name = 'ValidationError';
    Error.captureStackTrace(this, ValidationError);
    this.flattened = Object.entries(this.errors ?? {}).map(([key, it]) => ({
      path: key,
      message: (it as any[])[0].message,
    }));
  }
}

export class ServerError extends Error {
  flattened: { path: string; message: string }[];
  constructor(
    public override message: string,
    public status: number,
    public errors: ReturnType<typeof validate>,
  ) {
    super(message);
    this.name = 'ServerError';
    Error.captureStackTrace(this, ServerError);
    this.flattened = Object.entries(this.errors ?? {}).map(([key, it]) => ({
      path: key,
      message: (it as any[])[0].message,
    }));
  }
}

export function validateOrThrow<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  input: unknown,
): asserts input is z.infer<z.ZodObject<T>> {
  const errors = validate(schema, input);
  if (errors) {
    throw new ValidationError('Validation failed', errors);
  }
}

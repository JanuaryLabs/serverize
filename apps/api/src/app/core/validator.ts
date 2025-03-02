import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import z from 'zod';

type ValidatorConfig = Record<
  string,
  { select: unknown; against: z.ZodTypeAny }
>;

type ExtractInput<T extends ValidatorConfig> = {
  [K in keyof T]: z.infer<T[K]['against']>;
};

export const validate = <T extends ValidatorConfig>(
  selector: (payload: {
    body: Record<string, unknown>;
    query: Record<string, string>;
    queries: Record<string, string[]>;
    params: Record<string, string>;
    headers: Record<string, string>;
  }) => T,
) => {
  return createMiddleware<{
    Variables: {
      input: ExtractInput<T>;
    };
  }>(async (c, next) => {
    const contentType = c.req.header('content-type') ?? '';
    let body: unknown = null;

    switch (contentType) {
      case 'application/json':
        body = await c.req.json();
        break;
      case 'application/x-www-form-urlencoded':
        body = await c.req.parseBody();
        break;
      default:
        body = {};
    }

    const payload = {
      body: body as Record<string, unknown>,
      query: c.req.query(),
      queries: c.req.queries(),
      params: c.req.param(),
      headers: Object.fromEntries(
        Object.entries(c.req.header()).map(([k, v]) => [k, v ?? '']),
      ),
    };

    const config = selector(payload);
    const schema = z.object(
      Object.entries(config).reduce(
        (acc, [key, value]) => {
          acc[key] = value.against;
          return acc;
        },
        {} as Record<string, z.ZodTypeAny>,
      ),
    );

    const input = Object.entries(config).reduce(
      (acc, [key, value]) => {
        acc[key] = value.select;
        return acc;
      },
      {} as Record<string, unknown>,
    );

    const parsed = parse(schema, input);
    c.set('input', parsed as ExtractInput<T>);
    await next();
  });
};

export function parse<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  input: unknown,
) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const error = new HTTPException(400, {
      message: 'Validation failed',
      cause: {
        code: 'api/validation-failed',
        details: result.error.flatten((issue) => ({
          message: issue.message,
          code: issue.code,
          fatel: issue.fatal,
          path: issue.path.join('.'),
        })).fieldErrors,
      },
    });
    throw error;
  }
  return result.data;
}

export const openapi = validate;

import z from 'zod';
import type { Interceptor } from './interceptors.ts';
import { buffered } from './parse-response.ts';
import { parseInput } from './parser.ts';
import type { RequestConfig } from './request.ts';
import { APIError, APIResponse } from './response.ts';

export interface Type<T> {
  new (...args: any[]): T;
}
export type Parser = (
  response: Response,
) => Promise<unknown> | ReadableStream<any>;
export type OutputType =
  | Type<APIResponse>
  | { parser: Parser; type: Type<APIResponse> };

export interface RequestSchema {
  schema: z.ZodType;
  toRequest: (input: any) => RequestConfig;
  output: OutputType[];
}

export const fetchType = z
  .function()
  .args(z.instanceof(Request))
  .returns(z.promise(z.instanceof(Response)))
  .optional();

export async function dispatch(
  input: unknown,
  route: RequestSchema,
  options: {
    fetch?: z.infer<typeof fetchType>;
    interceptors?: Interceptor[];
    signal?: AbortSignal;
  },
) {
  const { interceptors = [] } = options;
  const [parsedInput, parseError] = parseInput(route.schema, input);
  if (parseError) {
    return [null as never, parseError as never] as const;
  }

  let config = route.toRequest(parsedInput as never);
  for (const interceptor of interceptors) {
    if (interceptor.before) {
      config = await interceptor.before(config);
    }
  }

  let response = await (options.fetch ?? fetch)(
    new Request(config.url, config.init),
    {
      ...config.init,
      signal: options.signal,
    },
  );

  for (let i = interceptors.length - 1; i >= 0; i--) {
    const interceptor = interceptors[i];
    if (interceptor.after) {
      response = await interceptor.after(response.clone());
    }
  }
  return await parse(route, response);
}

export async function parse(route: RequestSchema, response: Response) {
  let output: typeof APIResponse | null = null;
  let parser: Parser = buffered;
  for (const outputType of route.output) {
    if ('parser' in outputType) {
      parser = outputType.parser;
      if (isTypeOf(outputType.type, APIResponse)) {
        if (response.status === outputType.type.status) {
          output = outputType.type;
          break;
        }
      }
    } else if (isTypeOf(outputType, APIResponse)) {
      if (response.status === outputType.status) {
        output = outputType;
        break;
      }
    }
  }

  if (response.ok) {
    const apiresponse = (output || APIResponse).create(
      response.status,
      await parser(response),
    );

    return [apiresponse.data, null] as const;
  }

  const data = (output || APIError).create(
    response.status,
    await parser(response),
  );
  return [null as never, data as never] as const;
}

export function isTypeOf<T extends Type<APIResponse>>(
  instance: any,
  baseType: T,
): instance is T {
  if (instance === baseType) {
    return true;
  }
  const prototype = Object.getPrototypeOf(instance);
  if (prototype === null) {
    return false;
  }
  return isTypeOf(prototype, baseType);
}

import z from 'zod';
import type { Endpoints } from './api/endpoints.ts';
import schemas from './api/schemas.ts';
import {
  createBaseUrlInterceptor,
  createHeadersInterceptor,
} from './http/interceptors.ts';
import type { HeadersInit, RequestConfig } from './http/request.ts';
import { dispatch, fetchType, parse } from './http/send-request.ts';

import { type ParseError, parseInput } from './http/parser.ts';

export const servers = [
  'https://serverize-api.january.sh',
  'http://localhost:3000',
] as const;
const optionsSchema = z.object({
  token: z
    .string()
    .optional()
    .transform((val) => (val ? `Bearer ${val}` : undefined)),
  fetch: fetchType,
  baseUrl: z.enum(servers).default(servers[0]),
});
export type Servers = (typeof servers)[number];

type ServerizeOptions = z.infer<typeof optionsSchema>;

export class Serverize {
  public options: ServerizeOptions;
  constructor(options: ServerizeOptions) {
    this.options = optionsSchema.parse(options);
  }

  async request<E extends keyof Endpoints>(
    endpoint: E,
    input: Endpoints[E]['input'],
    options?: { signal?: AbortSignal; headers?: HeadersInit },
  ): Promise<readonly [Endpoints[E]['output'], Endpoints[E]['error'] | null]> {
    const route = schemas[endpoint];
    const result = await dispatch(
      Object.assign(this.#defaultInputs, input),
      route,
      {
        fetch: this.options.fetch,
        interceptors: [
          createHeadersInterceptor(
            () => this.defaultHeaders,
            options?.headers ?? {},
          ),
          createBaseUrlInterceptor(() => this.options.baseUrl),
        ],
        signal: options?.signal,
      },
    );
    return result as [Endpoints[E]['output'], Endpoints[E]['error'] | null];
  }

  async prepare<E extends keyof Endpoints>(
    endpoint: E,
    input: Endpoints[E]['input'],
    options?: { headers?: HeadersInit },
  ): Promise<
    readonly [
      RequestConfig & {
        parse: (response: Response) => ReturnType<typeof parse>;
      },
      ParseError<(typeof schemas)[E]['schema']> | null,
    ]
  > {
    const route = schemas[endpoint];

    const interceptors = [
      createHeadersInterceptor(
        () => this.defaultHeaders,
        options?.headers ?? {},
      ),
      createBaseUrlInterceptor(() => this.options.baseUrl),
    ];
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
    const prepared = {
      ...config,
      parse: (response: Response) => parse(route, response),
    };
    return [prepared, null as never] as const;
  }

  get defaultHeaders() {
    return { authorization: this.options['token'] };
  }

  get #defaultInputs() {
    return {};
  }

  setOptions(options: Partial<ServerizeOptions>) {
    const validated = optionsSchema.partial().parse(options);

    for (const key of Object.keys(validated) as (keyof ServerizeOptions)[]) {
      if (validated[key] !== undefined) {
        (this.options[key] as (typeof validated)[typeof key]) = validated[key]!;
      }
    }
  }
}

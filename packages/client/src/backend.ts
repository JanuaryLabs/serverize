import z from 'zod';
import { handleError, parseResponse } from './client';
import type { Endpoints } from './endpoints';
import schemas from './schemas';
import type { StreamEndpoints } from './stream-endpoints';
import { validateOrThrow } from './validator';

const optionsSchema = z.object({
  baseUrl: z.string().url(),
  token: z.string().optional(),
});
type ServerizeOptions = z.infer<typeof optionsSchema>;
export class Serverize {
  constructor(public options: ServerizeOptions) {}

  async stream<E extends keyof StreamEndpoints>(
    endpoint: E,
    input: StreamEndpoints[E]['input'],
  ): Promise<readonly [ReadableStream, Error | null]> {
    try {
      const route = schemas[endpoint];
      validateOrThrow(route.schema, input);
      const response = await fetch(
        route.toRequest(input as never, {
          headers: this.defaultHeaders,
          baseUrl: this.options.baseUrl,
        }),
      );

      if (response.ok) {
        return [response.body!, null] as const;
      }
      const error = await handleError(response);
      return [null as never, error] as const;
    } catch (error) {
      return [null as never, error as Error] as const;
    }
  }

  async request<E extends keyof Endpoints>(
    endpoint: E,
    input: Endpoints[E]['input'],
  ): Promise<readonly [Endpoints[E]['output'], Error | null]> {
    try {
      const route = schemas[endpoint];
      validateOrThrow(route.schema, input);
      const response = await fetch(
        route.toRequest(input as never, {
          headers: this.defaultHeaders,
          baseUrl: this.options.baseUrl,
        }),
      );

      if (response.ok) {
        const data = await parseResponse(response);
        return [data as Endpoints[E]['output'], null] as const;
      }
      const error = await handleError(response);
      return [null, error] as const;
    } catch (error) {
      return [null, error as Error] as const;
    }
  }

  get defaultHeaders() {
    return { Authorization: `Bearer ${this.options.token}` };
  }

  setOptions(options: Partial<ServerizeOptions>) {
    const validated = optionsSchema.partial().parse(options);

    for (const key of Object.keys(validated) as (keyof ServerizeOptions)[]) {
      if (validated[key] !== undefined) {
        this.options[key] = validated[key]!;
      }
    }
  }
}

import z from 'zod';
import { handleError, parseResponse } from './client';
import type { Endpoints } from './endpoints';
import { parse } from './parser';
import schemas from './schemas';
import type { StreamEndpoints } from './stream-endpoints';

const optionsSchema = z.object({
  fetch: z
    .function()
    .args(z.instanceof(Request))
    .returns(z.promise(z.instanceof(Response)))
    .optional(),
  baseUrl: z.string().url(),
  token: z.string().optional(),
});
type ServerizeOptions = z.infer<typeof optionsSchema>;
export class Serverize {
  constructor(public options: ServerizeOptions) {}

  async request<E extends keyof Endpoints>(
    endpoint: E,
    input: Endpoints[E]['input'],
  ): Promise<readonly [Endpoints[E]['output'], Endpoints[E]['error'] | null]> {
    const route = schemas[endpoint];
    const [parsedInput, parseError] = parse(route.schema, input);
    if (parseError) {
      return [
        null as never,
        { ...parseError, kind: 'parse' } as never,
      ] as const;
    }
    const request = route.toRequest(parsedInput as never, {
      headers: this.defaultHeaders,
      baseUrl: this.options.baseUrl,
    });
    const response = await (this.options.fetch ?? fetch)(request);
    if (response.ok) {
      const data = await parseResponse(response);
      return [data as Endpoints[E]['output'], null] as const;
    }
    const error = await handleError(response);
    return [null as never, { ...error, kind: 'response' }] as const;
  }

  get defaultHeaders() {
    return { Authorization: `Bearer ${this.options.token}` };
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

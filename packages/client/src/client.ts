import z from 'zod';
import type { Endpoints } from './endpoints.ts';
import { fetchType, sendRequest } from './http/send-request.ts';
import schemas from './schemas.ts';
export const servers = [
  'https://serverize-api.january.sh',
  'http://localhost:3000',
] as const;
const optionsSchema = z.object({
  token: z.string().optional(),
  fetch: fetchType,
  baseUrl: z.enum(servers).default(servers[0]),
});
export type Servers = (typeof servers)[number];

type ServerizeOptions = z.infer<typeof optionsSchema>;

export class Serverize {
  constructor(public options: ServerizeOptions) {}

  async request<E extends keyof Endpoints>(
    endpoint: E,
    input: Endpoints[E]['input'],
  ): Promise<readonly [Endpoints[E]['output'], Endpoints[E]['error'] | null]> {
    const route = schemas[endpoint];
    return sendRequest(Object.assign(this.#defaultInputs, input), route, {
      baseUrl: this.options.baseUrl,
      fetch: this.options.fetch,
      headers: this.defaultHeaders,
    });
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

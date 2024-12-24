
import z from 'zod';
import type { Endpoints } from './endpoints';
import schemas from './schemas';
import { validateOrThrow } from './validator';
import { handleError, parseResponse } from './client';

      const optionsSchema = z.object({baseUrl: z.string().url(), token: z.string().optional()});
      type ServerizeOptions = z.infer<typeof optionsSchema>;
    export class Serverize {

      constructor(public options: ServerizeOptions) {}

async request<E extends keyof Endpoints>(
		endpoint: E,
		input: Endpoints[E]['input']
	): Promise<readonly [Endpoints[E]['output'], Error | null]> {
		try {
			const route = schemas[endpoint];
			validateOrThrow(route.schema, input);
			const response = await fetch(
				route.toRequest(input as never, {
					headers: this.defaultHeaders,
					baseUrl: this.options.baseUrl,
				})
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
        return {Authorization: `Bearer ${this.options.token}`}
      }

  setOptions(options: Partial<ServerizeOptions>) {
		for (const key in this.options) {
			if (
				key in options &&
				options[key as keyof ServerizeOptions] !== undefined
			) {
				this.options[key as keyof ServerizeOptions] =
					options[key as keyof ServerizeOptions]!;
			}
		}
	}
    }
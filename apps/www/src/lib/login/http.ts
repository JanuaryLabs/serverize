import { auth } from './firebase';
import { join, normalize } from 'path';

export const baseUrl = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://serverize.fly.dev';

export namespace request {
  async function makeHeaders(withAuth = true) {
    const headers: [string, string][] = [
      ['Content-Type', 'application/json'],
      ['x-request-id', crypto.randomUUID()],
    ];
    if (withAuth) {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        headers.push(['Authorization', `Bearer ${token}`]);
      }
    }
    return headers;
  }
  export async function get<R>(
    path: string,
    config: {
      withAuth?: boolean;
      headers?: Record<string, string | undefined>;
      baseUrl?: string;
    } = { withAuth: true },
  ) {
    const [response, error] = await request(path, 'GET', undefined, config);
    if (error || !response) {
      return [undefined, error] as const;
    }
    const result = await response.json();
    return [result as R, null] as const;
  }

  export async function put<R>(
    path: string,
    data: Record<string, unknown>,
    config?: Omit<RequestInit, 'method' | 'body' | 'headers'> & {
      headers?: Record<string, string | undefined>;
      baseUrl?: string;
    },
  ) {
    const [response, error] = await request(path, 'PUT', data, config);
    if (error || !response) {
      return [undefined, error] as const;
    }
    const result = await response.json();
    return [result as R, null] as const;
  }
  export async function patch<T extends Record<string, unknown>>(
    path: string,
    data: T,
    config?: Omit<RequestInit, 'method' | 'body' | 'headers'> & {
      headers?: Record<string, string | undefined>;
      baseUrl?: string;
    },
  ) {
    const [response, error] = await request(path, 'PATCH', data, config);
    if (error || !response) {
      return [null, error];
    }
    const result = await response.json();
    return [result, null];
  }
  export async function post<R>(
    path: string,
    data: Record<string, unknown>,
    config?: Omit<RequestInit, 'method' | 'body' | 'headers'> & {
      headers?: Record<string, string | undefined>;
      baseUrl?: string;
    },
  ) {
    const [response, error] = await request(path, 'POST', data, config);
    if (error || !response) {
      return [undefined, error] as const;
    }
    const result = await response.json();
    return [result as R, null] as const;
  }

  export async function request<T extends Record<string, unknown>>(
    path: string,
    method: 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE',
    data?: T,
    config?: Omit<RequestInit, 'method' | 'body' | 'headers'> & {
      headers?: Record<string, string | undefined>;
      baseUrl?: string;
    },
  ) {
    const extraHeaders = (
      config?.headers
        ? Object.entries(config.headers).filter(([_, value]) =>
            notNullOrUndefined(value),
          )
        : []
    ) as [string, string][];
    try {
      const response = await fetch(
        `${config?.baseUrl || baseUrl}${addLeadingSlash(path)}`,
        {
          method: method,
          body: data ? JSON.stringify(data) : undefined,
          headers: [...(await makeHeaders()), ...extraHeaders],
        },
      );

      if (response.ok) {
        return [response] as const;
      }

      const error = await handleError(response);
      return [null, error] as const;
    } catch (error) {
      return [null, error] as const;
    }
  }

  export async function remove<T extends Record<string, unknown>>(
    path: string,
    data: T,
    config: {
      withAuth?: boolean;
      headers?: Record<string, string | undefined>;
      baseUrl?: string;
    } = { withAuth: true },
  ) {
    const [response, error] = await request(path, 'DELETE', data, config);
    if (error || !response) {
      return [null, error];
    }
    const result = await response.json();
    return [result, null];
  }
}

async function handleError(response: Response) {
  try {
    if (response.status >= 400 && response.status < 500) {
      const body = await response.json();
      return new Error(body.detail);
    }
    return new Error(
      `An error occurred while fetching the data. Status: ${response.status}`,
    );
  } catch (error) {
    // in case the response is not a json
    // this is a workaround but we should change
    // it from the server to always return json

    return error;
  }
}

export function isNullOrUndefined(value: any): value is undefined | null {
  return value === undefined || value === null;
}
export function notNullOrUndefined<T>(
  value: T,
): value is Exclude<T, null | undefined> {
  return !isNullOrUndefined(value);
}
export function addLeadingSlash(path: string) {
  return normalize(join('/', path));
}

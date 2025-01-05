import { parse } from 'fast-content-type-parse';

import type { Endpoints } from './endpoints';
import schemas from './schemas';
import { ServerError, validateOrThrow } from './validator';

export interface RequestInterface<D extends object = object> {
  /**
   * Sends a request based on endpoint options
   *
   * @param {string} route Request method + URL. Example: 'GET /orgs/{org}'
   * @param {object} [parameters] URL, query or body parameters, as well as headers, mediaType.{format|previews}, request, or baseUrl.
   */
  <R extends keyof Endpoints>(
    route: R,
    options?: Endpoints[R]['input'],
  ): Promise<Endpoints[R]['output']>;
}

export async function handleError(response: Response) {
  try {
    if (response.status >= 400 && response.status < 500) {
      const body = (await response.json()) as Record<string, any>;
      return new ServerError(
        body.title || body.detail,
        response.status,
        body.errors ?? {},
      );
    }
    return new Error(
      `An error occurred while fetching the data. Status: ${response.status}`,
    );
  } catch (error) {
    // in case the response is not a json
    // this is a workaround but we should change
    // it from the server to always return json

    return error as Error;
  }
}

export async function parseResponse(response: Response) {
  const contentType = response.headers.get('Content-Type');
  if (!contentType) {
    throw new Error('Content-Type header is missing');
  }

  if (response.status === 204) {
    return null;
  }

  const { type } = parse(contentType);
  switch (type) {
    case 'application/json':
      return response.json();
    case 'text/plain':
      return response.text();
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}

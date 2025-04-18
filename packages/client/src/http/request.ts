export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ContentType = 'xml' | 'json' | 'urlencoded' | 'multipart';
export type Endpoint =
  | `${ContentType} ${Method} ${string}`
  | `${Method} ${string}`;

export type BodyInit =
  | ArrayBuffer
  | AsyncIterable<Uint8Array>
  | Blob
  | FormData
  | Iterable<Uint8Array>
  | NodeJS.ArrayBufferView
  | URLSearchParams
  | null
  | string;

export function createUrl(path: string, query: URLSearchParams) {
  const url = new URL(path, `local://`);
  url.search = query.toString();
  return url;
}

function template(
  templateString: string,
  templateVariables: Record<string, any>,
): string {
  const nargs = /{([0-9a-zA-Z_]+)}/g;
  return templateString.replace(nargs, (match, key: string, index: number) => {
    // Handle escaped double braces
    if (
      templateString[index - 1] === '{' &&
      templateString[index + match.length] === '}'
    ) {
      return key;
    }

    const result = key in templateVariables ? templateVariables[key] : null;
    return result === null || result === undefined ? '' : String(result);
  });
}

type Input = Record<string, any>;
type Props = {
  inputHeaders: string[];
  inputQuery: string[];
  inputBody: string[];
  inputParams: string[];
};

abstract class Serializer {
  constructor(
    protected input: Input,
    protected props: Props,
  ) {}
  abstract getBody(): BodyInit | null;
  abstract getHeaders(): Record<string, string>;
  serialize(): Serialized {
    const headers = new Headers({});
    for (const header of this.props.inputHeaders) {
      headers.set(header, this.input[header]);
    }

    const query = new URLSearchParams();
    for (const key of this.props.inputQuery) {
      const value = this.input[key];
      if (value !== undefined) {
        query.set(key, String(value));
      }
    }

    const params = this.props.inputParams.reduce<Record<string, any>>(
      (acc, key) => {
        acc[key] = this.input[key];
        return acc;
      },
      {},
    );

    return {
      body: this.getBody(),
      query,
      params,
      headers: this.getHeaders(),
    };
  }
}

interface Serialized {
  body: BodyInit | null;
  query: URLSearchParams;
  params: Record<string, any>;
  headers: Record<string, string>;
}

class JsonSerializer extends Serializer {
  getBody(): BodyInit | null {
    const body: Record<string, any> = {};
    for (const prop of this.props.inputBody) {
      body[prop] = this.input[prop];
    }
    return JSON.stringify(body);
  }
  getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }
}

class UrlencodedSerializer extends Serializer {
  getBody(): BodyInit | null {
    const body = new URLSearchParams();
    for (const prop of this.props.inputBody) {
      body.set(prop, this.input[prop]);
    }
    return body;
  }
  getHeaders(): Record<string, string> {
    return {};
  }
}

class NoBodySerializer extends Serializer {
  getBody(): BodyInit | null {
    return null;
  }
  getHeaders(): Record<string, string> {
    return {};
  }
}

class FormDataSerializer extends Serializer {
  getBody(): BodyInit | null {
    const body = new FormData();
    for (const prop of this.props.inputBody) {
      body.append(prop, this.input[prop]);
    }
    return body;
  }
  getHeaders(): Record<string, string> {
    return {};
  }
}

export function json(input: Input, props: Props) {
  return new JsonSerializer(input, props).serialize();
}
export function urlencoded(input: Input, props: Props) {
  return new UrlencodedSerializer(input, props).serialize();
}
export function nobody(input: Input, props: Props) {
  return new NoBodySerializer(input, props).serialize();
}
export function formdata(input: Input, props: Props) {
  return new FormDataSerializer(input, props).serialize();
}

export function toRequest<T extends Endpoint>(
  endpoint: T,
  input: Serialized,
): Request {
  const [method, path] = endpoint.split(' ');
  const pathVariable = template(path, input.params);

  const url = createUrl(pathVariable, input.query);
  return new Request(url, {
    method: method,
    headers: input.headers,
    body: method === 'GET' ? undefined : input.body,
  });
}

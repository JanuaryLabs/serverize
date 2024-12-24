type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type Endpoint = `${Method} ${string}`;

export function createUrl(base: string, path: string, query: URLSearchParams) {
	const url = new URL(path, base);
	url.search = query.toString();
	return url;
}
function template(
	templateString: string,
	templateVariables: Record<string, any>
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
export function toRequest<T extends Endpoint>(
	endpoint: T,
	input: Record<string, any>,
	props: {
		inputHeaders: string[];
		inputQuery: string[];
		inputBody: string[];
		inputParams: string[];
	},
	defaults: {
		baseUrl: string;
		headers?: Record<string, string>;
	}
) {
	const [method, path] = endpoint.split(' ');

	const headers = new Headers({
		...defaults?.headers,
		'Content-Type': 'application/json',
		Accept: 'application/json',
	});

	for (const header of props.inputHeaders) {
		headers.set(header, input[header]);
	}

	const query = new URLSearchParams();
	for (const key of props.inputQuery) {
		const value = input[key];
		if (value !== undefined) {
			query.set(key, String(value));
		}
	}

	const body = props.inputBody.reduce<Record<string, any>>((acc, key) => {
		acc[key] = input[key];
		return acc;
	}, {});

	const params = props.inputParams.reduce<Record<string, any>>((acc, key) => {
		acc[key] = input[key];
		return acc;
	}, {});

	const init = {
		path: template(path, params),
		method,
		headers,
		query,
		body: JSON.stringify(body),
	};

	const url = createUrl(defaults.baseUrl, init.path, init.query);
	return new Request(url, {
		method: init.method,
		headers: init.headers,
		body: method === 'GET' ? undefined : JSON.stringify(body),
	});
}

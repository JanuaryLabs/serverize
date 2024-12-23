import { join, normalize } from 'path';
import retry, { type OperationOptions } from 'retry';
import { snakecase, spinalcase } from 'stringcase';

export function orThrow<T>(fn: () => T, message?: string): NonNullable<T> {
  const result = fn() as any;
  if ([undefined, null].includes(result)) {
    const error = new Error(message);
    Error.captureStackTrace(error, orThrow);
    throw error;
  }
  return result;
}
export function isNullOrUndefined(value: any): value is undefined | null {
  return value === undefined || value === null;
}
export function notNullOrUndefined<T>(
  value: T,
): value is Exclude<T, null | undefined> {
  return !isNullOrUndefined(value);
}

export function upsert<T extends { id: string }>(
  array: T[],
  id: string,
  insert: (current: T, isNew: boolean) => T,
) {
  const [index, item] = byId<T>(array, id);
  if (item) {
    array[index] = insert(item, false);
    return array;
  } else {
    return [...array, insert({ id } as T, true)];
  }
}
export async function upsertAsync<T extends { id: string }>(
  array: T[],
  id: string,
  insert: (current: T) => Promise<T> | T,
): Promise<T[]> {
  const [index, item] = byId<T>(array, id);
  if (item) {
    array[index] = await insert(item);
    return array;
  } else {
    return [...array, await insert({ id } as T)];
  }
}

export function byId<T extends { id: string }>(
  array: T[],
  id: string,
): [number, T | undefined] {
  const index = array.findIndex((it) => it.id === id);
  return [index, array[index]];
}

const removeEmpty = (obj: any) => {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] === Object(obj[key]) && !Array.isArray(obj[key]))
      newObj[key] = removeEmpty(obj[key]);
    else if (obj[key] !== undefined) newObj[key] = obj[key];
  });
  return newObj;
};

export function assertNotNullOrUndefined<T>(
  value: T,
  debugLabel: string,
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(`${debugLabel} is undefined or null.`);
  }
}
export type Omit<T, P> = Pick<
  T,
  {
    [key in keyof T]: T[key] extends P ? never : key;
  }[keyof T]
>;

export async function profile<T>(
  {
    label,
    seconds = false,
  }: {
    label: string;
    seconds?: boolean;
    logData?: any;
  },
  fn: () => Promise<T> | T,
): Promise<T> {
  const startTime = performance.now();

  try {
    return await fn(); // Await the function if it's a promise
  } finally {
    const endTime = performance.now();
    const time = endTime - startTime;
    const formattedTime = seconds ? (time / 1000).toFixed(6) : time.toFixed(6);
    const timeUnit = seconds ? 'seconds' : 'milliseconds';

    console.log(`Execution time => [${label}]: ${formattedTime} ${timeUnit}`);
  }
}
const colors = {
  green: (message: string) => `\x1b[32m${message}\x1b[0m`,
  blue: (message: string) => `\x1b[34m${message}\x1b[0m`,
  magenta: (message: string) => `\x1b[35m${message}\x1b[0m`,
};

export function createRecorder(
  options: {
    label?: string;
    seconds?: boolean;
    verbose?: boolean;
  } = { seconds: false },
) {
  const startedAt = performance.now();
  function log(...args: any[]) {
    if (!process.env['RECORD_OFF']) {
      console.log(...args);
    }
  }
  log(colors.green(`Recording started => [${options.label}]`));
  const operations = new Map<string, number>();
  return {
    record: (label: string) => {
      operations.set(label, performance.now());
      if (options.verbose) {
        log(
          colors.blue(`Recording => [${options.label ? `${options.label} => ` : ''}${label}]
        `),
        );
      }
    },
    recordEnd: (label: string, result?: unknown) => {
      const endTime = performance.now();
      const time = endTime - (operations.get(label) as number);
      const formattedTime = options.seconds
        ? (time / 1000).toFixed(6)
        : time.toFixed(6);
      const timeUnit = options.seconds ? 'seconds' : 'milliseconds';
      log(
        colors.blue(
          `Execution time => [${options.label ? `${options.label} => ` : ''}${label}]: ${formattedTime} ${timeUnit}`,
        ),
        ...[result].filter((item) => typeof item !== 'undefined'),
      );
      operations.delete(label);
    },
    end: () => {
      const endTime = performance.now();
      const time = endTime - startedAt;
      const lastEntry = Array.from(operations.entries()).at(-1);

      if (lastEntry) {
        // log missing end

        const [label, start] = lastEntry;
        const time = performance.now() - start;
        const formattedTime = options.seconds
          ? (time / 1000).toFixed(6)
          : time.toFixed(6);
        const timeUnit = options.seconds ? 'seconds' : 'milliseconds';
        log(
          colors.magenta(
            `Recording Total time => [${options.label ? `${options.label} => ` : ''}${label}]: ${formattedTime} ${timeUnit}`,
          ),
        );
        operations.delete(label);
      }

      const formattedTime = options.seconds
        ? (time / 1000).toFixed(6)
        : time.toFixed(6);
      const timeUnit = options.seconds ? 'seconds' : 'milliseconds';
      log(
        colors.magenta(
          `Recording end => [${options.label}]: ${formattedTime} ${timeUnit}`,
        ),
      );
    },
  };
}

export const logMe = (object: any) =>
  console.dir(object, {
    showHidden: false,
    depth: Infinity,
    maxArrayLength: Infinity,
    colors: true,
  });

export type InferRecordValue<T> = T extends Record<string, infer U> ? U : any;
export function toLitObject<T extends Record<string, any>>(
  obj: T,
  accessor: (value: InferRecordValue<T>) => string = (value) => value,
) {
  return `{${Object.keys(obj)
    .map((key) => `${key}: ${accessor(obj[key])}`)
    .join(', ')}}`;
}

export function toLiteralObject<T extends { value: any } | string>(
  obj: Record<string, T> | (readonly [string, T])[],
) {
  if (Array.isArray(obj)) {
    return toLitObject(Object.fromEntries(obj), (value) => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if ('value' in value) {
          return value.value;
        }
      } catch (e) {
        return value;
      }
    });
  }
  return toLitObject(obj, (value) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if ('value' in value) {
        return value.value;
      }
    } catch (e) {
      return value;
    }
  });
}

export function addLeadingSlash(path: string) {
  return normalize(join('/', path));
}

export function removeTrialingSlashes(path: string, keepLastOne = false) {
  while (path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path + (keepLastOne ? '/' : '');
}

export function retryPromise<T>(
  promise: () => Promise<T>,
  options: OperationOptions = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const operation = retry.operation({
      factor: 2,
      randomize: true,
      minTimeout: 1000,
      maxTimeout: 2000,
      ...options,
    });

    operation.attempt(async (currentAttempt) => {
      try {
        const result = await promise();
        resolve(result);
      } catch (error) {
        const canRetry = operation.retry(error as any);
        if (!canRetry) {
          reject(error);
        }
      }
    });
  });
}
export function uniquify<T>(data: T[], accessor: (item: T) => unknown): T[] {
  return [...new Map(data.map((x) => [accessor(x), x])).values()];
}

export function toRecord<T>(
  array: T[],
  config: {
    accessor: (item: T) => string;
    map: (item: T) => any;
  },
) {
  return array.reduce<Record<string, T>>((acc, item) => {
    return {
      ...acc,
      [config.accessor(item)]: config.map(item),
    };
  }, {});
}

export function hasProperty<
  T extends Record<string, unknown>,
  K extends keyof T,
>(obj: T, key: K): obj is T & Record<K, unknown> {
  if (typeof obj !== 'object') {
    return false;
  }
  return key in obj;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function safeFail<T>(fn: () => T, defaultValue: T): typeof defaultValue {
  try {
    return fn();
  } catch (error) {
    return defaultValue;
  }
}

export async function extractError<T>(
  fn: () => Promise<T>,
): Promise<readonly [Awaited<T>, undefined | unknown]> {
  try {
    return [await fn(), undefined] as const;
  } catch (error) {
    return [undefined as any, error] as const;
  }
}

function toCurlyBraces(path: string) {
  return path
    .replace(':', '$:')
    .split('$')
    .map((it) => {
      if (!it.startsWith(':')) {
        return it.split('/').filter(Boolean).join('/');
      }
      const [param, ...rest] = it.split('/');
      return [`{${param.slice(1)}}`, ...rest].join('/');
    })
    .join('/');
}

export function normalizeWorkflowPath(config: {
  featureName: string;
  workflowTag: string;
  workflowPath: string;
  workflowMethod?: string;
}) {
  const path = removeTrialingSlashes(
    addLeadingSlash(
      join(
        spinalcase(config.featureName),
        snakecase(config.workflowTag),
        toCurlyBraces(config.workflowPath),
      ),
    ),
  );
  return config.workflowMethod ? `${config.workflowMethod} ${path}` : path;
}

/**
 * Removes duplicate items from an array based on a specified accessor function
 * @param data The array to remove duplicates from
 * @param accessor The accessor function to determine uniqueness
 * @returns An array with unique items
 * @example
 * removeDuplicates([1, 2, 3, 2, 4], (x) => x); // [1, 2, 3, 4]
 * removeDuplicates([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 1, name: 'John' }], (x) => x.id); // [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
 */
export function removeDuplicates<T>(
  data: T[],
  accessor: (item: T) => T[keyof T],
): T[] {
  return [...new Map(data.map((x) => [accessor(x), x])).values()];
}

export function scan<T>(
  array: T[],
  accumulator: (element: T, previous: T[]) => unknown,
) {
  const scanned = [];
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    const acc: T[] = [];
    for (let j = i - 1; j >= 0; j--) {
      acc.unshift(array[j]);
    }
    scanned.push(accumulator(element, acc));
  }
  return scanned;
}

export function partition<T>(
  array: T[],
  ...predicates: [(item: T) => boolean, ...((item: T) => boolean)[]]
): T[][] {
  const result: T[][] = Array.from({ length: predicates.length + 1 }, () => []);
  for (const item of array) {
    let found = false;
    for (let i = 0; i < predicates.length; i++) {
      const fn = predicates[i];
      if (fn(item)) {
        result[i].push(item);
        found = true;
      }
    }
    if (!found) {
      // no predicate matched, push to the non-matched array
      result.at(-1)!.push(item);
    }
  }
  return result;
}

/**
 * Checks if an object is a literal object
 * @param obj The object to check
 * @returns True if the object is a literal object, false otherwise
 * @example
 * isLiteralObject({ a: 1, b: 2 }); // true
 * isLiteralObject([1, 2, 3]); // false
 * isLiteralObject(null); // false
 */
export function isLiteralObject(obj: unknown): obj is Record<string, unknown> {
  return (
    obj !== null &&
    !Array.isArray(obj) &&
    typeof obj === 'object' &&
    obj.constructor === Object
  );
}

/**
 * Converts an object to a string in the format of key=value
 * @param obj The object to convert
 * @returns The string in the format of key=value
 */
export function toKevValEnv(obj: Record<string, string>) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

export function msToNs(ms: number) {
  return ms * 1000_000;
}
export function nsToMs(nano: string | number) {
  return (
    parseInt(typeof nano === 'number' ? String(nano) : nano, 10) / 1_000_000
  );
}

export const getExt = (fileName?: string) => {
  if (!fileName) {
    return ''; // shouldn't happen as there will always be a file name
  }
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) {
    return '';
  }
  const ext = fileName
    .slice(lastDot + 1)
    .split('/')
    .filter(Boolean)
    .join('');
  if (ext === fileName) {
    // files that have no extension
    return '';
  }
  return ext || 'txt';
};

export function toJson(obj: Record<string, any>) {
  return JSON.stringify(obj, null, 2);
}

export function substring(input: string, sub: string) {
  const index = input.indexOf(sub);
  if (index === -1) {
    return input;
  }
  return input.slice(sub.length);
}

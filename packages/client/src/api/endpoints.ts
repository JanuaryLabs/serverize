import type z from 'zod';
import type { ParseError } from '../http/parser.ts';
import type {
  ProblematicResponse,
  SuccessfulResponse,
} from '../http/response.ts';
import type { OutputType, Parser, Type } from '../http/send-request.ts';

import schemas from './schemas.ts';

type Output<T extends OutputType> = T extends {
  parser: Parser;
  type: Type<unknown>;
}
  ? InstanceType<T['type']>
  : T extends Type<unknown>
    ? InstanceType<T>
    : never;

type Unionize<T> = T extends [infer Single extends OutputType]
  ? Output<Single>
  : T extends readonly [...infer Tuple extends OutputType[]]
    ? { [I in keyof Tuple]: Output<Tuple[I]> }[number]
    : never;

type EndpointOutput<K extends keyof typeof schemas> = Extract<
  Unionize<(typeof schemas)[K]['output']>,
  SuccessfulResponse
>;

type EndpointError<K extends keyof typeof schemas> = Extract<
  Unionize<(typeof schemas)[K]['output']>,
  ProblematicResponse
>;

export type Endpoints = {
  [K in keyof typeof schemas]: {
    input: z.infer<(typeof schemas)[K]['schema']>;
    output: EndpointOutput<K>['data'];
    error: EndpointError<K> | ParseError<(typeof schemas)[K]['schema']>;
  };
};

export interface ApiResponse<Status extends number, Body extends unknown> {
  kind: 'response';
  status: Status;
  body: Body;
}

// 4xx Client Errors
export type BadRequest = ApiResponse<400, { message: string }>;
export type Unauthorized = ApiResponse<401, { message: string }>;
export type PaymentRequired = ApiResponse<402, { message: string }>;
export type Forbidden = ApiResponse<403, { message: string }>;
export type NotFound = ApiResponse<404, { message: string }>;
export type MethodNotAllowed = ApiResponse<405, { message: string }>;
export type NotAcceptable = ApiResponse<406, { message: string }>;
export type Conflict = ApiResponse<409, { message: string }>;
export type Gone = ApiResponse<410, { message: string }>;
export type UnprocessableEntity = ApiResponse<
  422,
  { message: string; errors?: Record<string, string[]> }
>;
export type TooManyRequests = ApiResponse<
  429,
  { message: string; retryAfter?: string }
>;
export type PayloadTooLarge = ApiResponse<413, { message: string }>;
export type UnsupportedMediaType = ApiResponse<415, { message: string }>;

// 5xx Server Errors
export type InternalServerError = ApiResponse<500, { message: string }>;
export type NotImplemented = ApiResponse<501, { message: string }>;
export type BadGateway = ApiResponse<502, { message: string }>;
export type ServiceUnavailable = ApiResponse<
  503,
  { message: string; retryAfter?: string }
>;
export type GatewayTimeout = ApiResponse<504, { message: string }>;

export type ClientError =
  | BadRequest
  | Unauthorized
  | PaymentRequired
  | Forbidden
  | NotFound
  | MethodNotAllowed
  | NotAcceptable
  | Conflict
  | Gone
  | UnprocessableEntity
  | TooManyRequests;

export type ServerError =
  | InternalServerError
  | NotImplemented
  | BadGateway
  | ServiceUnavailable
  | GatewayTimeout;

export type ProblematicResponse = ClientError | ServerError;

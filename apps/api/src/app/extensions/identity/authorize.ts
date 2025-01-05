import {
  ProblemDetails,
  ProblemDetailsException,
} from 'rfc-7807-problem-details';

export function authorize<T>(
  ...routePolicies: ((context: T) => Promise<boolean> | boolean)[]
) {
  return async (context: T, next: any) => {
    for (const policy of routePolicies) {
      if (!await policy(context)) {
        throw new ForbiddenException();
      }
    }
    await next();
  };
}

export class UnauthorizedException extends ProblemDetailsException {
  constructor(detail?: string) {
    super(
      new ProblemDetails(
        'Unauthorized',
        detail ?? 'Authentication is required to access this resource.',
        401
      )
    );
    Error.captureStackTrace(this, UnauthorizedException);
  }
}

export class ForbiddenException extends ProblemDetailsException {
  constructor(detail?: string) {
    super(
      new ProblemDetails('Forbidden', detail ?? 'You do not have permission to access this resource.', 403)
    );
    Error.captureStackTrace(this, ForbiddenException);
  }
}
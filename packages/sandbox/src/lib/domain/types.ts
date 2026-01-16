export type SupportedLanguage = 'python' | 'nodejs' | 'ruby' | 'go';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  executionTimeMs: number;
}

export interface ExecutionOptions {
  timeout?: number;
  workingDir?: string;
  env?: Record<string, string>;
}

export class ExecutionTimeoutError extends Error {
  public readonly timeout: number;

  constructor(timeout: number) {
    super(`Execution timed out after ${timeout}ms`);
    this.name = 'ExecutionTimeoutError';
    this.timeout = timeout;
  }
}

export class SandboxError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, { cause });
    this.name = 'SandboxError';
  }
}

export class UnsupportedLanguageError extends SandboxError {
  public readonly language: string;

  constructor(language: string) {
    super(
      `Unsupported language: ${language}. Supported: python, nodejs, ruby, go`,
    );
    this.name = 'UnsupportedLanguageError';
    this.language = language;
  }
}

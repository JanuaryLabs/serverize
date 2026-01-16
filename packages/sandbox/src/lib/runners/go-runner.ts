import type { ExecutionOptions } from '../domain/types.js';
import { BaseLanguageRunner } from './base-runner.js';

export class GoRunner extends BaseLanguageRunner {
  readonly language = 'go' as const;
  readonly image = 'golang:alpine';
  readonly systemDependencies = ['go'];

  toCMD(code: string, options?: ExecutionOptions): string {
    const encodedCode = this.encode(code);
    const workingDir = options?.workingDir ?? '/tmp';

    return `cd ${JSON.stringify(workingDir)} && echo ${encodedCode} | base64 -d > main.go && go run main.go`;
  }
}

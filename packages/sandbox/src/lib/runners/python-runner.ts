import type { ExecutionOptions } from '../domain/types.js';
import { BaseLanguageRunner } from './base-runner.js';

export class PythonRunner extends BaseLanguageRunner {
  readonly language = 'python' as const;
  readonly image = 'python:alpine';
  readonly systemDependencies = ['python3'];

  toCMD(code: string, options?: ExecutionOptions): string {
    const encodedCode = this.encode(code);
    const cdCommand = this.cd(options?.workingDir);

    return `${cdCommand}echo ${encodedCode} | base64 -d | python3 -c "import sys; exec(sys.stdin.read())"`;
  }
}

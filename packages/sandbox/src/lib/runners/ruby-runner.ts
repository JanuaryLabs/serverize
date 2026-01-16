import type { ExecutionOptions } from '../domain/types.js';
import { BaseLanguageRunner } from './base-runner.js';

export class RubyRunner extends BaseLanguageRunner {
  readonly language = 'ruby' as const;
  readonly image = 'ruby:alpine';
  readonly systemDependencies = ['ruby'];

  toCMD(code: string, options?: ExecutionOptions): string {
    const encodedCode = this.encode(code);
    const cdCommand = this.cd(options?.workingDir);

    return `${cdCommand}echo ${encodedCode} | base64 -d | ruby -e "eval(STDIN.read)"`;
  }
}

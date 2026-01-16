import type { ExecutionOptions } from '../domain/types.js';
import { BaseLanguageRunner } from './base-runner.js';

export class NodeJSRunner extends BaseLanguageRunner {
  readonly language = 'nodejs' as const;
  readonly image = 'node:lts-alpine';
  readonly systemDependencies = ['nodejs'];

  toCMD(code: string, options?: ExecutionOptions): string {
    const encodedCode = this.encode(code);
    const cdCommand = this.cd(options?.workingDir);

    return `${cdCommand}echo ${encodedCode} | base64 -d | node -e "const fs=require('fs');eval(fs.readFileSync(0,'utf-8'))"`;
  }
}

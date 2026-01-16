import type { ExecutionOptions, SupportedLanguage } from '../domain/types.js';

export interface ILanguageRunner {
  readonly language: SupportedLanguage;
  readonly image: string;
  readonly systemDependencies: string[];
  toCMD(code: string, options?: ExecutionOptions): string;
}

export abstract class BaseLanguageRunner implements ILanguageRunner {
  abstract readonly language: SupportedLanguage;
  abstract readonly image: string;
  abstract readonly systemDependencies: string[];

  abstract toCMD(code: string, options?: ExecutionOptions): string;

  /**
   * Base64 encode the code to avoid shell escaping issues.
   * Handles all special characters: backticks, $, quotes, newlines, etc.
   */
  protected encode(code: string): string {
    return Buffer.from(code, 'utf-8').toString('base64');
  }

  protected cd(workingDir?: string): string {
    if (!workingDir) {
      return '';
    }
    return `cd ${JSON.stringify(workingDir)} && `;
  }
}

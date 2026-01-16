import type { SupportedLanguage } from '../domain/types.js';
import { UnsupportedLanguageError } from '../domain/types.js';
import type { ILanguageRunner } from './base-runner.js';
import { GoRunner } from './go-runner.js';
import { NodeJSRunner } from './nodejs-runner.js';
import { PythonRunner } from './python-runner.js';
import { RubyRunner } from './ruby-runner.js';

const runners = new Map<SupportedLanguage, ILanguageRunner>([
  ['python', new PythonRunner()],
  ['nodejs', new NodeJSRunner()],
  ['ruby', new RubyRunner()],
  ['go', new GoRunner()],
]);

export class RunnerFactory {
  static getRunner(language: SupportedLanguage): ILanguageRunner {
    const runner = runners.get(language);
    if (!runner) {
      throw new UnsupportedLanguageError(language);
    }
    return runner;
  }

  static isSupported(language: string): language is SupportedLanguage {
    return runners.has(language as SupportedLanguage);
  }

  static getSupportedLanguages(): SupportedLanguage[] {
    return Array.from(runners.keys());
  }

  static getImage(language: SupportedLanguage): string {
    const runner = RunnerFactory.getRunner(language);
    return runner.image;
  }

  static registerRunner(runner: ILanguageRunner): void {
    runners.set(runner.language, runner);
  }
}

export const LANGUAGE_IMAGES: Record<SupportedLanguage, string> = {
  python: 'python:alpine',
  nodejs: 'node:lts-alpine',
  ruby: 'ruby:alpine',
  go: 'golang:alpine',
};

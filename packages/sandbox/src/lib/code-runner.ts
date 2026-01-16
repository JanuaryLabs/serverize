import type {
  ExecutionOptions,
  ExecutionResult,
  SupportedLanguage,
} from './domain/types.js';
import { RunnerFactory } from './runners/runner-factory.js';
import type { Sandbox } from './sandbox.js';

/**
 * Executes code in a specific programming language
 *
 * @example
 * ```typescript
 * const sandbox = new Sandbox();
 * const runner = await sandbox.code('python');
 *
 * const result = await runner.run(`
 * x = 10
 * y = 20
 * print(f"Sum: {x + y}")
 * `);
 *
 * console.log(result.stdout); // "Sum: 30"
 * ```
 */
export class CodeRunner {
  readonly #sandbox: Sandbox;
  readonly #language: SupportedLanguage;
  readonly #packages: string[];

  constructor(
    sandbox: Sandbox,
    language: SupportedLanguage,
    packages?: string[],
  ) {
    this.#sandbox = sandbox;
    this.#language = language;
    this.#packages = packages ?? [];
  }

  get language(): SupportedLanguage {
    return this.#language;
  }

  get packages(): readonly string[] {
    return this.#packages;
  }

  /**
   * Run code in the specified language
   *
   * @param code - Source code to execute
   * @param options - Execution options (timeout, env, etc.)
   * @returns Execution result with stdout, stderr, exitCode
   *
   * @example
   * ```typescript
   * // Python
   * await runner.run('print("Hello, World!")');
   *
   * // Node.js
   * await runner.run('console.log("Hello, World!")');
   *
   * // Ruby
   * await runner.run('puts "Hello, World!"');
   *
   * // Go (requires full program structure)
   * await runner.run(`
   * package main
   *
   * import "fmt"
   *
   * func main() {
   *     fmt.Println("Hello, World!")
   * }
   * `);
   * ```
   */
  async run(
    code: string,
    options?: ExecutionOptions,
  ): Promise<ExecutionResult> {
    const runner = RunnerFactory.getRunner(this.#language);
    const command = runner.toCMD(code, options);

    return this.#sandbox.exec(command, options);
  }

  async destroy(): Promise<void> {
    await this.#sandbox.destroy();
  }
}

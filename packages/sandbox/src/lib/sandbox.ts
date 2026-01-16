import type { Container } from 'dockerode';

import { CodeRunner } from './code-runner.js';
import type {
  ExecutionOptions,
  ExecutionResult,
  SupportedLanguage,
} from './domain/types.js';
import { SandboxError } from './domain/types.js';
import { ContainerManager } from './infrastructure/container-manager.js';
import { CommandExecutor } from './infrastructure/executor.js';
import { LANGUAGE_IMAGES, RunnerFactory } from './runners/runner-factory.js';
import type { ResourceLimits } from './security/resource-limits.js';
import type { SecurityConfig } from './security/security-config.js';
import {
  DEFAULT_SECURITY_CONFIG,
  SecurityConfigBuilder,
} from './security/security-config.js';

export interface SandboxOptions {
  verbose?: boolean;
  image?: string;
  dependencies?: string[];
  timeoutMs?: number;
  memoryLimitMb?: number;
  cpuPercent?: number;
  pidsLimit?: number;
  securityConfig?: Partial<SecurityConfig>;
}

/**
 * Secure sandbox environment for executing code
 *
 * @example
 * ```typescript
 * const sandbox = new Sandbox({ verbose: true });
 *
 * // Execute a shell command
 * const result = await sandbox.exec('echo "Hello"');
 * console.log(result.stdout); // "Hello"
 *
 * // Run Python code
 * const runner = await sandbox.code('python');
 * const pyResult = await runner.run('print(2 + 2)');
 * console.log(pyResult.stdout); // "4"
 *
 * await sandbox.destroy();
 * ```
 */
export class Sandbox {
  readonly #containerManager: ContainerManager;
  readonly #executor: CommandExecutor;
  readonly #securityConfig: SecurityConfig;
  readonly #image: string;
  readonly #dependencies: string[];
  readonly #verbose: boolean;

  #container: Container | null = null;

  constructor(options: SandboxOptions = {}) {
    this.#verbose = options.verbose ?? false;
    this.#image = options.image ?? 'alpine:latest';
    this.#dependencies = options.dependencies ?? [];

    this.#securityConfig = this.#buildSecurityConfig(options);

    this.#containerManager = new ContainerManager(this.#verbose);
    this.#executor = new CommandExecutor({
      defaultTimeoutMs: this.#securityConfig.timeoutMs,
    });

    this.#debug('Sandbox created with config:', {
      image: this.#image,
      dependencies: this.#dependencies,
      timeoutMs: this.#securityConfig.timeoutMs,
    });
  }

  #debug(...args: any[]): void {
    if (this.#verbose) {
      console.log('[Sandbox]', ...args);
    }
  }

  #buildSecurityConfig(options: SandboxOptions): SecurityConfig {
    if (options.securityConfig) {
      return {
        ...DEFAULT_SECURITY_CONFIG,
        ...options.securityConfig,
      };
    }

    const builder = new SecurityConfigBuilder();

    if (options.timeoutMs !== undefined) {
      builder.withTimeout(options.timeoutMs);
    }

    const resourceLimits: ResourceLimits = {};

    if (options.memoryLimitMb !== undefined) {
      resourceLimits.memory = {
        max: options.memoryLimitMb * 1024 * 1024,
        swap: 0,
      };
    }

    if (options.cpuPercent !== undefined) {
      resourceLimits.cpu = {
        quota: options.cpuPercent * 1000,
        period: 100000,
      };
    }

    if (options.pidsLimit !== undefined) {
      resourceLimits.pids = {
        max: options.pidsLimit,
      };
    }

    if (Object.keys(resourceLimits).length > 0) {
      builder.withResourceLimits({
        ...DEFAULT_SECURITY_CONFIG.resourceLimits,
        ...resourceLimits,
      });
    }

    return builder.build();
  }

  async #ensureContainer(): Promise<Container> {
    if (this.#container) {
      const running = await this.#containerManager.isRunning(this.#container);
      if (running) {
        return this.#container;
      }
      try {
        await this.#containerManager.startContainer(this.#container);
        return this.#container;
      } catch {
        this.#container = null;
      }
    }

    this.#debug('Creating sandbox container...');
    this.#container = await this.#containerManager.ensureContainer({
      image: this.#image,
      securityConfig: this.#securityConfig,
      dependencies: this.#dependencies,
      verbose: this.#verbose,
    });

    return this.#container;
  }

  /**
   * Execute a shell command in the sandbox
   *
   * @param command - Shell command to execute
   * @param options - Execution options (timeout, etc.)
   * @returns Execution result with stdout, stderr, exitCode
   *
   * @example
   * ```typescript
   * const result = await sandbox.exec('ls -la /tmp');
   * console.log(result.stdout);
   * ```
   */
  async exec(
    command: string,
    options?: ExecutionOptions,
  ): Promise<ExecutionResult> {
    const container = await this.#ensureContainer();
    this.#debug(`Executing: ${command}`);
    return this.#executor.execute(container, command, options);
  }

  /**
   * Create a code runner for a specific language
   *
   * @param language - Programming language (python, nodejs, ruby, go)
   * @param packages - Optional language-specific packages to install
   * @returns CodeRunner instance for executing code
   *
   * @example
   * ```typescript
   * const runner = await sandbox.code('python');
   * const result = await runner.run('print("Hello!")');
   * ```
   */
  async code(
    language: SupportedLanguage,
    packages?: string[],
  ): Promise<CodeRunner> {
    if (!RunnerFactory.isSupported(language)) {
      throw new SandboxError(
        `Unsupported language: ${language}. Supported: ${RunnerFactory.getSupportedLanguages().join(', ')}`,
      );
    }

    const languageImage = LANGUAGE_IMAGES[language];

    const languageSandbox = new Sandbox({
      verbose: this.#verbose,
      image: languageImage,
      dependencies: packages,
      securityConfig: this.#securityConfig,
    });

    return new CodeRunner(languageSandbox, language, packages);
  }

  getSecurityConfig(): Readonly<SecurityConfig> {
    return this.#securityConfig;
  }

  /**
   * Stop and remove the sandbox container
   * Should be called when done to clean up resources
   *
   * @example
   * ```typescript
   * try {
   *   await sandbox.exec('some command');
   * } finally {
   *   await sandbox.destroy();
   * }
   * ```
   */
  async destroy(): Promise<void> {
    if (this.#container) {
      this.#debug('Destroying sandbox container...');
      await this.#containerManager.destroyContainer(this.#container);
      this.#container = null;
      this.#debug('Sandbox destroyed');
    }
  }
}

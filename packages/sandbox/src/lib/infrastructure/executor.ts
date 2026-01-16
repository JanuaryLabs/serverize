import { PassThrough } from 'node:stream';

import type { Container, Exec } from 'dockerode';

import type { ExecutionOptions, ExecutionResult } from '../domain/types.js';
import { SandboxError } from '../domain/types.js';

export interface ExecutorConfig {
  defaultTimeoutMs: number;
  pollIntervalMs: number;
  maxOutputSize: number;
}

export const DEFAULT_EXECUTOR_CONFIG: ExecutorConfig = {
  defaultTimeoutMs: 30000, // 30 seconds
  pollIntervalMs: 50, // 50ms polling
  maxOutputSize: 10 * 1024 * 1024, // 10MB max output
};

export class CommandExecutor {
  readonly #config: ExecutorConfig;

  constructor(config: Partial<ExecutorConfig> = {}) {
    this.#config = { ...DEFAULT_EXECUTOR_CONFIG, ...config };
  }

  async execute(
    container: Container,
    command: string,
    options?: ExecutionOptions,
  ): Promise<ExecutionResult> {
    const timeoutMs = options?.timeout ?? this.#config.defaultTimeoutMs;
    const startTime = Date.now();

    try {
      const env = options?.env
        ? Object.entries(options.env).map(([k, v]) => `${k}=${v}`)
        : undefined;

      const exec = await container.exec({
        Cmd: ['sh', '-c', command],
        Env: env,
        AttachStdout: true,
        AttachStderr: true,
        Privileged: false,
        Tty: false,
      });

      const stream = await exec.start({
        Tty: false,
        stdin: false,
        hijack: false,
        Detach: false,
      });

      const outStream = new PassThrough();
      const errStream = new PassThrough();
      container.modem.demuxStream(stream, outStream, errStream);

      let stdout = '';
      let stderr = '';
      let outputSize = 0;

      const onData = (target: 'stdout' | 'stderr') => (chunk: Buffer) => {
        const chunkStr = chunk.toString('utf8');
        outputSize += chunk.length;

        if (outputSize > this.#config.maxOutputSize) {
          const truncationMsg = '\n... output truncated (max size exceeded)';
          if (target === 'stdout') {
            stdout += truncationMsg;
          } else {
            stderr += truncationMsg;
          }
          return;
        }

        if (target === 'stdout') {
          stdout += chunkStr;
        } else {
          stderr += chunkStr;
        }
      };

      outStream.on('data', onData('stdout'));
      errStream.on('data', onData('stderr'));

      const result = await this.#waitForCompletion(
        exec,
        container,
        timeoutMs,
        startTime,
      );

      const executionTimeMs = Date.now() - startTime;

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        executionTimeMs,
      };
    } catch (error) {
      throw new SandboxError(
        'Failed to execute command in container',
        error instanceof Error ? error : undefined,
      );
    }
  }

  async #waitForCompletion(
    exec: Exec,
    container: Container,
    timeoutMs: number,
    startTime: number,
  ): Promise<{ exitCode: number; timedOut: boolean }> {
    while (true) {
      const inspectData = await exec.inspect();

      if (!inspectData.Running) {
        return {
          exitCode: inspectData.ExitCode ?? 0,
          timedOut: false,
        };
      }

      const elapsed = Date.now() - startTime;
      if (elapsed > timeoutMs) {
        try {
          await container.kill({ signal: 'SIGKILL' });
        } catch {
          // Container may already be stopped
        }

        return {
          exitCode: 137,
          timedOut: true,
        };
      }

      await new Promise((resolve) =>
        setTimeout(resolve, this.#config.pollIntervalMs),
      );
    }
  }

  async executeStreaming(
    container: Container,
    command: string,
    onStdout: (data: string) => void,
    onStderr: (data: string) => void,
    options?: ExecutionOptions,
  ): Promise<ExecutionResult> {
    const timeoutMs = options?.timeout ?? this.#config.defaultTimeoutMs;
    const startTime = Date.now();

    try {
      const env = options?.env
        ? Object.entries(options.env).map(([k, v]) => `${k}=${v}`)
        : undefined;

      const exec = await container.exec({
        Cmd: ['sh', '-c', command],
        Env: env,
        AttachStdout: true,
        AttachStderr: true,
        Privileged: false,
        Tty: false,
      });

      const stream = await exec.start({
        Tty: false,
        stdin: false,
        hijack: false,
        Detach: false,
      });

      const outStream = new PassThrough();
      const errStream = new PassThrough();
      container.modem.demuxStream(stream, outStream, errStream);

      let stdout = '';
      let stderr = '';

      outStream.on('data', (chunk: Buffer) => {
        const str = chunk.toString('utf8');
        stdout += str;
        onStdout(str);
      });

      errStream.on('data', (chunk: Buffer) => {
        const str = chunk.toString('utf8');
        stderr += str;
        onStderr(str);
      });

      const result = await this.#waitForCompletion(
        exec,
        container,
        timeoutMs,
        startTime,
      );

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      throw new SandboxError(
        'Failed to execute streaming command',
        error instanceof Error ? error : undefined,
      );
    }
  }
}

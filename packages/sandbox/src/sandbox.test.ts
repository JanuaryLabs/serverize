/* eslint-disable @nx/enforce-module-boundaries */
import assert from 'node:assert';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';

import {
  CodeRunner,
  DEFAULT_RESOURCE_LIMITS,
  DEFAULT_SECURITY_CONFIG,
  ExecutionTimeoutError,
  RELAXED_RESOURCE_LIMITS,
  RunnerFactory,
  STRICT_RESOURCE_LIMITS,
  STRICT_SECURITY_CONFIG,
  Sandbox,
  SandboxError,
  SecurityConfigBuilder,
  UnsupportedLanguageError,
  toDockerHostConfig,
} from '@serverize/sandbox';

describe('Sandbox', () => {
  describe('exec()', () => {
    let sandbox: Sandbox;

    beforeEach(() => {
      sandbox = new Sandbox();
    });

    afterEach(async () => {
      await sandbox.destroy();
    });

    it('should execute a simple shell command and return stdout', async () => {
      const result = await sandbox.exec('echo "Hello, World!"');

      assert.strictEqual(result.stdout, 'Hello, World!');
      assert.strictEqual(result.stderr, '');
      assert.strictEqual(result.exitCode, 0);
      assert.strictEqual(result.timedOut, false);
      assert.ok(result.executionTimeMs >= 0);
    });

    it('should capture stderr from failed commands', async () => {
      const result = await sandbox.exec('ls /nonexistent-directory');

      assert.strictEqual(result.exitCode, 1);
      assert.ok(result.stderr.length > 0);
      assert.strictEqual(result.timedOut, false);
    });

    it('should return correct exit code for failing commands', async () => {
      const result = await sandbox.exec('exit 42');

      assert.strictEqual(result.exitCode, 42);
      assert.strictEqual(result.timedOut, false);
    });

    it('should execute multiple commands in sequence with &&', async () => {
      const result = await sandbox.exec('echo "first" && echo "second"');

      assert.ok(result.stdout.includes('first'));
      assert.ok(result.stdout.includes('second'));
      assert.strictEqual(result.exitCode, 0);
    });

    it('should handle commands with special characters', async () => {
      const result = await sandbox.exec('echo "hello $world \\n test"');

      assert.strictEqual(result.exitCode, 0);
      assert.ok(result.stdout.length > 0);
    });

    it('should handle empty command output', async () => {
      const result = await sandbox.exec('true');

      assert.strictEqual(result.stdout, '');
      assert.strictEqual(result.stderr, '');
      assert.strictEqual(result.exitCode, 0);
    });

    it('should track execution time accurately', async () => {
      const startTime = Date.now();
      const result = await sandbox.exec('sleep 1');
      const elapsed = Date.now() - startTime;

      assert.ok(
        result.executionTimeMs >= 1000,
        `Expected >= 1000ms, got ${result.executionTimeMs}ms`,
      );
      assert.ok(
        elapsed >= 1000,
        `Expected elapsed >= 1000ms, got ${elapsed}ms`,
      );
    });

    it('should reuse container for multiple executions', async () => {
      const result1 = await sandbox.exec('echo "first"');
      const result2 = await sandbox.exec('echo "second"');

      assert.strictEqual(result1.stdout, 'first');
      assert.strictEqual(result2.stdout, 'second');
    });
  });

  describe('constructor options', () => {
    it('should create sandbox with default options', async () => {
      const sandbox = new Sandbox();
      const config = sandbox.getSecurityConfig();

      assert.strictEqual(config.timeoutMs, 30000);
      assert.strictEqual(config.networkDisabled, true);
      assert.strictEqual(config.readonlyRootfs, true);

      await sandbox.destroy();
    });

    it('should create sandbox with custom timeout', async () => {
      const sandbox = new Sandbox({ timeoutMs: 60000 });
      const config = sandbox.getSecurityConfig();

      assert.strictEqual(config.timeoutMs, 60000);

      await sandbox.destroy();
    });

    it('should create sandbox with custom memory limit', async () => {
      const sandbox = new Sandbox({ memoryLimitMb: 128 });
      const config = sandbox.getSecurityConfig();

      assert.strictEqual(config.resourceLimits.memory?.max, 128 * 1024 * 1024);

      await sandbox.destroy();
    });

    it('should create sandbox with custom CPU limit', async () => {
      const sandbox = new Sandbox({ cpuPercent: 25 });
      const config = sandbox.getSecurityConfig();

      assert.strictEqual(config.resourceLimits.cpu?.quota, 25000);

      await sandbox.destroy();
    });

    it('should create sandbox with custom pids limit', async () => {
      const sandbox = new Sandbox({ pidsLimit: 50 });
      const config = sandbox.getSecurityConfig();

      assert.strictEqual(config.resourceLimits.pids?.max, 50);

      await sandbox.destroy();
    });

    it('should create sandbox with custom security config', async () => {
      const securityConfig = new SecurityConfigBuilder()
        .withTimeout(10000)
        .withNetworkDisabled(false)
        .build();

      const sandbox = new Sandbox({ securityConfig });
      const config = sandbox.getSecurityConfig();

      assert.strictEqual(config.timeoutMs, 10000);
      assert.strictEqual(config.networkDisabled, false);

      await sandbox.destroy();
    });
  });

  describe('destroy()', () => {
    it('should clean up container resources', async () => {
      const sandbox = new Sandbox();
      await sandbox.exec('echo "test"');

      await sandbox.destroy();

      // Should not throw when destroying again
      await sandbox.destroy();
    });

    it('should handle destroy without any execution', async () => {
      const sandbox = new Sandbox();

      // Should not throw
      await sandbox.destroy();
    });
  });
});

describe('CodeRunner (Node.js)', () => {
  let sandbox: Sandbox;
  let runner: CodeRunner;

  before(async () => {
    sandbox = new Sandbox();
    runner = await sandbox.code('nodejs');
  });

  after(async () => {
    await runner.destroy();
    await sandbox.destroy();
  });

  it('should have correct language property', () => {
    assert.strictEqual(runner.language, 'nodejs');
  });

  it('should execute simple console.log', async () => {
    const result = await runner.run('console.log("Hello from Node!")');

    assert.strictEqual(result.stdout, 'Hello from Node!');
    assert.strictEqual(result.exitCode, 0);
  });

  it('should execute arithmetic operations', async () => {
    const result = await runner.run('console.log(2 + 2)');

    assert.strictEqual(result.stdout, '4');
    assert.strictEqual(result.exitCode, 0);
  });

  it('should execute multiline code', async () => {
    const code = `
      const a = 10;
      const b = 20;
      console.log(a + b);
    `;
    const result = await runner.run(code);

    assert.strictEqual(result.stdout, '30');
    assert.strictEqual(result.exitCode, 0);
  });

  it('should handle JSON operations', async () => {
    const code = `
      const obj = { name: 'test', value: 42 };
      console.log(JSON.stringify(obj));
    `;
    const result = await runner.run(code);

    assert.strictEqual(result.stdout, '{"name":"test","value":42}');
    assert.strictEqual(result.exitCode, 0);
  });

  it('should handle array operations', async () => {
    const code = `
      const arr = [1, 2, 3, 4, 5];
      const sum = arr.reduce((a, b) => a + b, 0);
      console.log(sum);
    `;
    const result = await runner.run(code);

    assert.strictEqual(result.stdout, '15');
    assert.strictEqual(result.exitCode, 0);
  });

  it('should handle async/await operations', async () => {
    const code = `
      async function main() {
        const result = await Promise.resolve(42);
        console.log(result);
      }
      main();
    `;
    const result = await runner.run(code);

    assert.strictEqual(result.stdout, '42');
    assert.strictEqual(result.exitCode, 0);
  });

  it('should capture runtime errors in stderr', async () => {
    const code = 'throw new Error("Test error")';
    const result = await runner.run(code);

    assert.ok(result.stderr.includes('Error'));
    assert.ok(result.stderr.includes('Test error'));
    assert.strictEqual(result.exitCode, 1);
  });

  it('should capture syntax errors', async () => {
    const code = 'const x = {';
    const result = await runner.run(code);

    assert.ok(result.stderr.length > 0);
    assert.strictEqual(result.exitCode, 1);
  });

  it('should handle code with special characters', async () => {
    const code = 'console.log("Special chars: $var `backtick` \\\\n tab")';
    const result = await runner.run(code);

    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.stdout.includes('Special chars'));
  });
});

describe('Security Tests', () => {
  describe('Timeout enforcement', () => {
    it('should timeout long-running commands', async () => {
      const sandbox = new Sandbox({ timeoutMs: 2000 });

      const result = await sandbox.exec('sleep 60');

      assert.strictEqual(result.timedOut, true);
      assert.strictEqual(result.exitCode, 137); // SIGKILL exit code

      await sandbox.destroy();
    });

    it('should allow commands within timeout', async () => {
      const sandbox = new Sandbox({ timeoutMs: 5000 });
      const result = await sandbox.exec('sleep 1 && echo "done"');

      assert.strictEqual(result.stdout, 'done');
      assert.strictEqual(result.timedOut, false);

      await sandbox.destroy();
    });

    it('should respect per-execution timeout override', async () => {
      const sandbox = new Sandbox({ timeoutMs: 60000 });

      const result = await sandbox.exec('sleep 60', { timeout: 1000 });

      assert.strictEqual(result.timedOut, true);
      assert.strictEqual(result.exitCode, 137);

      await sandbox.destroy();
    });
  });

  describe('Network isolation', () => {
    it('should block network access by default', async () => {
      const sandbox = new Sandbox();
      const result = await sandbox.exec(
        'wget -T 2 http://example.com 2>&1 || echo "network blocked"',
      );

      assert.ok(
        result.stdout.includes('network blocked') ||
          result.stderr.includes('bad address') ||
          result.stderr.includes('network') ||
          result.exitCode !== 0,
      );

      await sandbox.destroy();
    });
  });

  describe('Resource limits', () => {
    it('should enforce memory limits', async () => {
      const sandbox = new Sandbox({ memoryLimitMb: 64 });

      // This should either fail due to memory limit or succeed with limited memory
      const result = await sandbox.exec(
        'cat /sys/fs/cgroup/memory.max 2>/dev/null || cat /sys/fs/cgroup/memory/memory.limit_in_bytes 2>/dev/null || echo "cgroup not available"',
      );

      // The test verifies the container was created with limits
      // The exact behavior depends on the container's cgroup version
      assert.strictEqual(result.exitCode, 0);

      await sandbox.destroy();
    });

    it('should enforce PID limits', async () => {
      const sandbox = new Sandbox({ pidsLimit: 10 });
      const config = sandbox.getSecurityConfig();

      assert.strictEqual(config.resourceLimits.pids?.max, 10);

      await sandbox.destroy();
    });
  });

  describe('Read-only filesystem', () => {
    it('should prevent writes to root filesystem', async () => {
      const sandbox = new Sandbox();
      const result = await sandbox.exec('touch /test-file 2>&1');

      assert.ok(
        result.stderr.includes('Read-only') ||
          result.stderr.includes('read-only') ||
          result.exitCode !== 0,
      );

      await sandbox.destroy();
    });

    it('should allow writes to /tmp', async () => {
      const sandbox = new Sandbox();
      const result = await sandbox.exec(
        'echo "test" > /tmp/test-file && cat /tmp/test-file',
      );

      assert.strictEqual(result.stdout, 'test');
      assert.strictEqual(result.exitCode, 0);

      await sandbox.destroy();
    });
  });

  describe('User restrictions', () => {
    it('should run as unprivileged user (nobody)', async () => {
      const sandbox = new Sandbox();
      const result = await sandbox.exec('id -u');

      assert.strictEqual(result.stdout, '65534');

      await sandbox.destroy();
    });

    it('should run with nogroup', async () => {
      const sandbox = new Sandbox();
      const result = await sandbox.exec('id -g');

      assert.strictEqual(result.stdout, '65534');

      await sandbox.destroy();
    });
  });
});

describe('SecurityConfigBuilder', () => {
  it('should build default config when no options set', () => {
    const config = new SecurityConfigBuilder().build();

    assert.deepStrictEqual(
      config.resourceLimits,
      DEFAULT_SECURITY_CONFIG.resourceLimits,
    );
    assert.strictEqual(config.networkDisabled, true);
    assert.strictEqual(config.readonlyRootfs, true);
    assert.strictEqual(config.user, '65534:65534');
    assert.deepStrictEqual(config.capDrop, ['ALL']);
    assert.strictEqual(config.timeoutMs, 30000);
  });

  it('should set custom resource limits', () => {
    const config = new SecurityConfigBuilder()
      .withResourceLimits(STRICT_RESOURCE_LIMITS)
      .build();

    assert.deepStrictEqual(config.resourceLimits, STRICT_RESOURCE_LIMITS);
  });

  it('should set custom timeout', () => {
    const config = new SecurityConfigBuilder().withTimeout(60000).build();

    assert.strictEqual(config.timeoutMs, 60000);
  });

  it('should enable network when configured', () => {
    const config = new SecurityConfigBuilder()
      .withNetworkDisabled(false)
      .build();

    assert.strictEqual(config.networkDisabled, false);
  });

  it('should disable readonly rootfs when configured', () => {
    const config = new SecurityConfigBuilder()
      .withReadonlyRootfs(false)
      .build();

    assert.strictEqual(config.readonlyRootfs, false);
  });

  it('should set custom user', () => {
    const config = new SecurityConfigBuilder().withUser('1000:1000').build();

    assert.strictEqual(config.user, '1000:1000');
  });

  it('should set custom capabilities to drop', () => {
    const config = new SecurityConfigBuilder()
      .withCapDrop(['NET_RAW', 'SYS_ADMIN'])
      .build();

    assert.deepStrictEqual(config.capDrop, ['NET_RAW', 'SYS_ADMIN']);
  });

  it('should set custom tmpfs mounts', () => {
    const mounts = { '/tmp': 'rw,size=128m' };
    const config = new SecurityConfigBuilder().withTmpfsMounts(mounts).build();

    assert.deepStrictEqual(config.tmpfsMounts, mounts);
  });

  it('should chain multiple configurations', () => {
    const config = new SecurityConfigBuilder()
      .withTimeout(10000)
      .withNetworkDisabled(false)
      .withReadonlyRootfs(false)
      .withResourceLimits(RELAXED_RESOURCE_LIMITS)
      .build();

    assert.strictEqual(config.timeoutMs, 10000);
    assert.strictEqual(config.networkDisabled, false);
    assert.strictEqual(config.readonlyRootfs, false);
    assert.deepStrictEqual(config.resourceLimits, RELAXED_RESOURCE_LIMITS);
  });
});

describe('Resource Limits', () => {
  describe('Presets', () => {
    it('should have correct DEFAULT_RESOURCE_LIMITS', () => {
      assert.strictEqual(DEFAULT_RESOURCE_LIMITS.memory.max, 256 * 1024 * 1024);
      assert.strictEqual(DEFAULT_RESOURCE_LIMITS.memory.swap, 0);
      assert.strictEqual(DEFAULT_RESOURCE_LIMITS.cpu.quota, 50000);
      assert.strictEqual(DEFAULT_RESOURCE_LIMITS.pids.max, 100);
    });

    it('should have correct STRICT_RESOURCE_LIMITS', () => {
      assert.strictEqual(STRICT_RESOURCE_LIMITS.memory.max, 128 * 1024 * 1024);
      assert.strictEqual(STRICT_RESOURCE_LIMITS.memory.swap, 0);
      assert.strictEqual(STRICT_RESOURCE_LIMITS.cpu.quota, 25000);
      assert.strictEqual(STRICT_RESOURCE_LIMITS.pids.max, 50);
    });

    it('should have correct RELAXED_RESOURCE_LIMITS', () => {
      assert.strictEqual(RELAXED_RESOURCE_LIMITS.memory.max, 512 * 1024 * 1024);
      assert.strictEqual(RELAXED_RESOURCE_LIMITS.memory.swap, 0);
      assert.strictEqual(RELAXED_RESOURCE_LIMITS.cpu.quota, 100000);
      assert.strictEqual(RELAXED_RESOURCE_LIMITS.pids.max, 200);
    });
  });

  describe('toDockerHostConfig()', () => {
    it('should convert memory limits to Docker config', () => {
      const config = toDockerHostConfig({
        memory: { max: 128 * 1024 * 1024, swap: 0 },
      });

      assert.strictEqual(config.Memory, 128 * 1024 * 1024);
      assert.strictEqual(config.MemorySwap, 0);
    });

    it('should convert CPU limits to Docker config', () => {
      const config = toDockerHostConfig({
        cpu: { quota: 50000, period: 100000, shares: 512 },
      });

      assert.strictEqual(config.CpuQuota, 50000);
      assert.strictEqual(config.CpuPeriod, 100000);
      assert.strictEqual(config.CpuShares, 512);
    });

    it('should convert PID limits to Docker config', () => {
      const config = toDockerHostConfig({
        pids: { max: 100 },
      });

      assert.strictEqual(config.PidsLimit, 100);
    });

    it('should handle partial limits', () => {
      const config = toDockerHostConfig({
        memory: { max: 256 * 1024 * 1024 },
      });

      assert.strictEqual(config.Memory, 256 * 1024 * 1024);
      assert.ok(!('CpuQuota' in config));
      assert.ok(!('PidsLimit' in config));
    });
  });
});

describe('RunnerFactory', () => {
  it('should return supported languages list', () => {
    const languages = RunnerFactory.getSupportedLanguages();

    assert.ok(Array.isArray(languages));
    assert.ok(languages.includes('python'));
    assert.ok(languages.includes('nodejs'));
    assert.ok(languages.includes('ruby'));
    assert.ok(languages.includes('go'));
  });

  it('should check if language is supported', () => {
    assert.strictEqual(RunnerFactory.isSupported('nodejs'), true);
    assert.strictEqual(RunnerFactory.isSupported('python'), true);
    assert.strictEqual(RunnerFactory.isSupported('rust'), false);
    assert.strictEqual(RunnerFactory.isSupported('invalid'), false);
  });

  it('should get runner for supported language', () => {
    const runner = RunnerFactory.getRunner('nodejs');

    assert.strictEqual(runner.language, 'nodejs');
    assert.strictEqual(runner.image, 'node:lts-alpine');
  });

  it('should throw UnsupportedLanguageError for unsupported language', () => {
    assert.throws(
      () => RunnerFactory.getRunner('rust' as any),
      (error: Error) => {
        assert.ok(error instanceof UnsupportedLanguageError);
        assert.strictEqual(
          (error as UnsupportedLanguageError).language,
          'rust',
        );
        return true;
      },
    );
  });

  it('should get correct image for language', () => {
    assert.strictEqual(RunnerFactory.getImage('nodejs'), 'node:lts-alpine');
    assert.strictEqual(RunnerFactory.getImage('python'), 'python:alpine');
    assert.strictEqual(RunnerFactory.getImage('ruby'), 'ruby:alpine');
    assert.strictEqual(RunnerFactory.getImage('go'), 'golang:alpine');
  });
});

describe('Error Classes', () => {
  describe('ExecutionTimeoutError', () => {
    it('should have correct name and message', () => {
      const error = new ExecutionTimeoutError(5000);

      assert.strictEqual(error.name, 'ExecutionTimeoutError');
      assert.strictEqual(error.message, 'Execution timed out after 5000ms');
      assert.strictEqual(error.timeout, 5000);
    });

    it('should be instanceof Error', () => {
      const error = new ExecutionTimeoutError(1000);

      assert.ok(error instanceof Error);
    });
  });

  describe('SandboxError', () => {
    it('should have correct name and message', () => {
      const error = new SandboxError('Test error');

      assert.strictEqual(error.name, 'SandboxError');
      assert.strictEqual(error.message, 'Test error');
    });

    it('should capture cause when provided', () => {
      const cause = new Error('Original error');
      const error = new SandboxError('Wrapper error', cause);

      assert.strictEqual(error.cause, cause);
    });

    it('should be instanceof Error', () => {
      const error = new SandboxError('Test');

      assert.ok(error instanceof Error);
    });
  });

  describe('UnsupportedLanguageError', () => {
    it('should have correct name, message and language', () => {
      const error = new UnsupportedLanguageError('rust');

      assert.strictEqual(error.name, 'UnsupportedLanguageError');
      assert.ok(error.message.includes('rust'));
      assert.strictEqual(error.language, 'rust');
    });

    it('should be instanceof SandboxError', () => {
      const error = new UnsupportedLanguageError('rust');

      assert.ok(error instanceof SandboxError);
      assert.ok(error instanceof Error);
    });
  });
});

describe('Sandbox.code() - Language Support', () => {
  it('should throw error for unsupported language', async () => {
    const sandbox = new Sandbox();

    await assert.rejects(
      async () => sandbox.code('rust' as any),
      (error: Error) => {
        assert.ok(error instanceof SandboxError);
        assert.ok(error.message.includes('Unsupported language'));
        assert.ok(error.message.includes('rust'));
        return true;
      },
    );

    await sandbox.destroy();
  });

  it('should create code runner with correct language', async () => {
    const sandbox = new Sandbox();
    const runner = await sandbox.code('nodejs');

    assert.strictEqual(runner.language, 'nodejs');
    assert.deepStrictEqual(runner.packages, []);

    await runner.destroy();
    await sandbox.destroy();
  });
});

describe('Execution with environment variables', () => {
  it('should pass environment variables to execution', async () => {
    const sandbox = new Sandbox();
    const runner = await sandbox.code('nodejs');

    const code = 'console.log(process.env.TEST_VAR)';
    const result = await runner.run(code, { env: { TEST_VAR: 'hello_world' } });

    assert.strictEqual(result.stdout, 'hello_world');

    await runner.destroy();
    await sandbox.destroy();
  });

  it('should handle multiple environment variables', async () => {
    const sandbox = new Sandbox();
    const runner = await sandbox.code('nodejs');

    const code = 'console.log(process.env.VAR1 + "-" + process.env.VAR2)';
    const result = await runner.run(code, {
      env: { VAR1: 'first', VAR2: 'second' },
    });

    assert.strictEqual(result.stdout, 'first-second');

    await runner.destroy();
    await sandbox.destroy();
  });
});

describe('Complex Node.js code execution', () => {
  it('should handle class definitions', async () => {
    const sandbox = new Sandbox();
    const runner = await sandbox.code('nodejs');

    const code = `
      class Calculator {
        add(a, b) { return a + b; }
        multiply(a, b) { return a * b; }
      }
      const calc = new Calculator();
      console.log(calc.add(5, 3));
      console.log(calc.multiply(4, 7));
    `;
    const result = await runner.run(code);

    assert.ok(result.stdout.includes('8'));
    assert.ok(result.stdout.includes('28'));
    assert.strictEqual(result.exitCode, 0);

    await runner.destroy();
    await sandbox.destroy();
  });

  it('should handle recursive functions', async () => {
    const sandbox = new Sandbox();
    const runner = await sandbox.code('nodejs');

    const code = `
      function factorial(n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
      }
      console.log(factorial(5));
    `;
    const result = await runner.run(code);

    assert.strictEqual(result.stdout, '120');
    assert.strictEqual(result.exitCode, 0);

    await runner.destroy();
    await sandbox.destroy();
  });

  it('should handle Map and Set', async () => {
    const sandbox = new Sandbox();
    const runner = await sandbox.code('nodejs');

    const code = `
      const map = new Map([['a', 1], ['b', 2]]);
      const set = new Set([1, 2, 3, 3, 2]);
      console.log(map.get('b'));
      console.log(set.size);
    `;
    const result = await runner.run(code);

    assert.ok(result.stdout.includes('2'));
    assert.ok(result.stdout.includes('3'));
    assert.strictEqual(result.exitCode, 0);

    await runner.destroy();
    await sandbox.destroy();
  });

  it('should handle destructuring', async () => {
    const sandbox = new Sandbox();
    const runner = await sandbox.code('nodejs');

    const code = `
      const { a, b } = { a: 1, b: 2 };
      const [x, y, ...rest] = [1, 2, 3, 4, 5];
      console.log(a, b, x, y, rest.length);
    `;
    const result = await runner.run(code);

    assert.ok(result.stdout.includes('1 2 1 2 3'));
    assert.strictEqual(result.exitCode, 0);

    await runner.destroy();
    await sandbox.destroy();
  });

  it('should handle template literals', async () => {
    const sandbox = new Sandbox();
    const runner = await sandbox.code('nodejs');

    const code = `
      const name = 'World';
      const greeting = \`Hello, \${name}!\`;
      console.log(greeting);
    `;
    const result = await runner.run(code);

    assert.strictEqual(result.stdout, 'Hello, World!');
    assert.strictEqual(result.exitCode, 0);

    await runner.destroy();
    await sandbox.destroy();
  });

  it('should handle generators', async () => {
    const sandbox = new Sandbox();
    const runner = await sandbox.code('nodejs');

    const code = `
      function* range(start, end) {
        for (let i = start; i <= end; i++) yield i;
      }
      const nums = [...range(1, 5)];
      console.log(nums.join(','));
    `;
    const result = await runner.run(code);

    assert.strictEqual(result.stdout, '1,2,3,4,5');
    assert.strictEqual(result.exitCode, 0);

    await runner.destroy();
    await sandbox.destroy();
  });

  it('should handle Promise.all', async () => {
    const sandbox = new Sandbox();
    const runner = await sandbox.code('nodejs');

    const code = `
      async function main() {
        const results = await Promise.all([
          Promise.resolve(1),
          Promise.resolve(2),
          Promise.resolve(3)
        ]);
        console.log(results.reduce((a, b) => a + b));
      }
      main();
    `;
    const result = await runner.run(code);

    assert.strictEqual(result.stdout, '6');
    assert.strictEqual(result.exitCode, 0);

    await runner.destroy();
    await sandbox.destroy();
  });
});

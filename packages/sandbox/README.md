# @serverize/sandbox

Secure Docker-based sandbox for executing untrusted code with configurable resource limits and timeouts.

## Installation

```bash
npm install @serverize/sandbox
```

Requires Docker.

## Quick Start

```typescript
import { Sandbox } from '@serverize/sandbox';

const sandbox = new Sandbox();
const result = await sandbox.exec('echo "Hello"');
console.log(result.stdout); // "Hello"
await sandbox.destroy();
```

## Running Code

```typescript
const sandbox = new Sandbox();

// Python
const py = await sandbox.code('python');
const result = await py.run('print(2 + 2)');
console.log(result.stdout); // "4"
await py.destroy();

// Node.js
const node = await sandbox.code('nodejs');
await node.run('console.log("hello")');
await node.destroy();

// Ruby
const ruby = await sandbox.code('ruby');
await ruby.run('puts "hello"');
await ruby.destroy();

// Go (requires full program)
const go = await sandbox.code('go');
await go.run(`
package main
import "fmt"
func main() { fmt.Println("hello") }
`);
await go.destroy();

await sandbox.destroy();
```

## Configuration

```typescript
const sandbox = new Sandbox({
  verbose: true, // debug logging
  image: 'python:alpine', // base Docker image
  dependencies: ['curl'], // Alpine packages to install
  timeoutMs: 60000, // execution timeout (default: 30s)
  memoryLimitMb: 128, // memory limit (default: 256MB)
  cpuPercent: 50, // CPU limit (default: 50%)
  pidsLimit: 50, // max processes (default: 100)
});
```

## Execution Result

```typescript
interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  executionTimeMs: number;
}
```

## Security

Default security configuration:

- Network disabled
- Read-only root filesystem
- Runs as `nobody:nogroup` (UID 65534)
- All Linux capabilities dropped
- Seccomp profile enabled
- Tmpfs mounts with noexec (64MB /tmp, 16MB /run, 64MB /app)

### Custom Security Config

```typescript
import {
  STRICT_RESOURCE_LIMITS,
  Sandbox,
  SecurityConfigBuilder,
} from '@serverize/sandbox';

const sandbox = new Sandbox({
  securityConfig: new SecurityConfigBuilder()
    .withResourceLimits(STRICT_RESOURCE_LIMITS)
    .withTimeout(10000)
    .build(),
});
```

### Resource Limit Presets

```typescript
import {
  DEFAULT_RESOURCE_LIMITS,
  RELAXED_RESOURCE_LIMITS,
  STRICT_RESOURCE_LIMITS,
} from '@serverize/sandbox';

// DEFAULT: 256MB memory, 50% CPU, 100 pids
// STRICT: 128MB memory, 25% CPU, 50 pids
// RELAXED: 512MB memory, 100% CPU, 200 pids
```

### Security Tradeoffs

**Network during dependency installation:** When using the `dependencies` option, network access is temporarily enabled to download packages via `apk add`. The execution container itself remains network-isolated.

**Disk I/O limits:** Docker blkio limits require device-specific paths that vary by host. Tmpfs mounts provide size limits (64MB /tmp, 16MB /run, 64MB /app) but no I/O rate limiting.

**Fresh containers per execution:** Each sandbox execution creates a new container to prevent data leakage between runs. This adds ~100-200ms overhead but ensures complete isolation.

## Timeout Handling

Timeouts return a result with `timedOut: true` instead of throwing:

```typescript
const result = await sandbox.exec('sleep 60', { timeout: 5000 });

if (result.timedOut) {
  console.log('Execution timed out');
  console.log(result.exitCode); // 137 (SIGKILL)
}
```

## Error Handling

```typescript
import { Sandbox, SandboxError } from '@serverize/sandbox';

try {
  const result = await sandbox.exec('echo hello');
} catch (error) {
  if (error instanceof SandboxError) {
    console.log('Sandbox error:', error.message);
  }
}
```

## Custom Language Runners

```typescript
import { BaseLanguageRunner, RunnerFactory } from '@serverize/sandbox';

class DenoRunner extends BaseLanguageRunner {
  readonly language = 'deno' as const;
  readonly image = 'denoland/deno:alpine';
  readonly systemDependencies = [];

  toCMD(code: string) {
    return `echo ${this.escape(code)} | deno run -`;
  }
}

RunnerFactory.registerRunner(new DenoRunner());
```

## API

### Sandbox

```typescript
new Sandbox(options?: SandboxOptions)

sandbox.exec(command: string, options?: ExecutionOptions): Promise<ExecutionResult>
sandbox.code(language: SupportedLanguage, packages?: string[]): Promise<CodeRunner>
sandbox.destroy(): Promise<void>
```

### CodeRunner

```typescript
runner.run(code: string, options?: ExecutionOptions): Promise<ExecutionResult>
runner.destroy(): Promise<void>
```

### Supported Languages

- `python` → `python:alpine`
- `nodejs` → `node:lts-alpine`
- `ruby` → `ruby:alpine`
- `go` → `golang:alpine`

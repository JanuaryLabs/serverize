# @serverize/sandbox

A secure, Docker-based sandboxed code execution environment for running untrusted code with strong isolation guarantees.

## Overview

`@serverize/sandbox` provides a safe environment for executing code in isolated Docker containers with security-first design principles. It supports multiple programming languages and custom dependencies while enforcing strict security boundaries through network isolation, read-only filesystems, and capability restrictions.

## Features

- **Multi-language Support** - Python, Node.js, Ruby, and Go out of the box
- **Security-First Design** - Network disabled, read-only root filesystem, dropped capabilities
- **Dependency Management** - Install custom Alpine packages as needed
- **Container Caching** - Reuses containers based on dependency hash for performance
- **Unprivileged Execution** - Runs as nobody user (UID 65534)
- **Resource Isolation** - Limited tmpfs mounts with size restrictions
- **Simple API** - Execute shell commands or run code in specific languages

## Installation

```bash
npm install @serverize/sandbox
```

**Requirements:**

- Docker must be installed and running

## Quick Start

### 1. Basic Shell Command (Default Configuration)

Start with the simplest usage - using all defaults:

```typescript
import { Sandbox } from '@serverize/sandbox';

const sandbox = new Sandbox();

// Execute a shell command
const result = await sandbox.exec('echo "Hello from sandbox"');
console.log(result.stdout); // "Hello from sandbox"

// Clean up
await sandbox.destroy();
```

### 2. Enable Debug Logging

Add verbose mode to see what's happening:

```typescript
const sandbox = new Sandbox({
  verbose: true, // Enable debug logging
});

const result = await sandbox.exec('whoami');
console.log(result.stdout); // "nobody"

await sandbox.destroy();
```

### 3. Custom Base Image

Use a specific Docker image:

```typescript
const sandbox = new Sandbox({
  image: 'python:alpine',
  verbose: true,
});

const result = await sandbox.exec('python3 --version');
console.log(result.stdout); // "Python 3.x.x"

await sandbox.destroy();
```

### 4. Installing Dependencies

Add Alpine packages to your sandbox:

```typescript
const sandbox = new Sandbox({
  image: 'alpine:latest',
  dependencies: ['curl', 'jq'], // Install packages
  verbose: true,
});

const result = await sandbox.exec('curl --version');
console.log(result.stdout);

await sandbox.destroy();
```

### 5. Language-Specific Execution (Basic)

Run code in a specific language runtime:

```typescript
const sandbox = new Sandbox();

const runner = await sandbox.code({
  language: 'python',
});

const result = await runner.run(`
print("Hello from Python!")
print(2 + 2)
`);

console.log(result.stdout);
// Hello from Python!
// 4

await sandbox.destroy();
```

### 6. Language-Specific with Custom Packages

Combine custom image, dependencies, and language-specific packages:

```typescript
const sandbox = new Sandbox({
  image: 'python:latest',
  verbose: true,
});

const runner = await sandbox.code({
  language: 'python',
  packages: ['pandas', 'numpy'], // Install Python packages
});

const result = await runner.run(`
import pandas as pd
import numpy as np
data = {'product': ['A', 'B', 'C'], 'sales': [100, 200, 150]}
df = pd.DataFrame(data)
print(f"Total sales: {df['sales'].sum()}")
print(f"Average: {np.mean(df['sales'])}")
`);

console.log(result.stdout);
// Total sales: 450
// Average: 150.0

await sandbox.destroy();
```

## API Reference

### `Sandbox`

The main class for creating and managing sandbox containers.

#### Constructor

```typescript
new Sandbox(options?: SandboxOptions)
```

**SandboxOptions:**

| Option         | Type       | Default           | Description                                                        |
| -------------- | ---------- | ----------------- | ------------------------------------------------------------------ |
| `image`        | `string`   | `'alpine:latest'` | Base Docker image to use                                           |
| `verbose`      | `boolean`  | `false`           | Enable debug logging                                               |
| `dependencies` | `string[]` | `[]`              | Alpine packages to install (e.g., `['python3', 'nodejs', 'curl']`) |

#### Methods

##### `exec(command: string): Promise<{ stdout: string, stderr: string }>`

Execute a shell command in the sandbox container.

```typescript
const result = await sandbox.exec('ls -la /tmp');
console.log(result.stdout);
console.log(result.stderr);
```

##### `code(config: { language: string, packages?: string[] }): Promise<CodeRunner>`

Create a language-specific code runner.

**Supported languages:**

- `python` - Uses `python:alpine` image
- `nodejs` - Uses `node:lts-alpine` image
- `ruby` - Uses `ruby:lts-alpine` image
- `go` - Uses `golang:lts-alpine` image

```typescript
const runner = await sandbox.code({
  language: 'python',
  packages: ['numpy', 'scipy'], // Optional Python packages
});
```

##### `destroy(): Promise<void>`

Stop and remove the sandbox container.

```typescript
await sandbox.destroy();
```

### `CodeRunner`

Returned by `sandbox.code()` for language-specific execution.

#### Methods

##### `run(code: string): Promise<{ stdout: string, stderr: string }>`

Execute code in the specified language runtime.

```typescript
const result = await runner.run('print("Hello, World!")');
```

## Security Features

The sandbox enforces multiple layers of security:

### Container Isolation

- **Network Disabled**: No network access by default (enabled only during dependency installation)
- **Read-only Root Filesystem**: Prevents modifications to system files
- **Unprivileged User**: Runs as `nobody:nogroup` (UID/GID 65534)
- **Capabilities Dropped**: All Linux capabilities are removed

### Resource Limits

The sandbox uses restricted tmpfs mounts:

- `/tmp` - 64MB, read-write, no-exec, no-suid
- `/run` - 16MB, read-write, no-exec, no-suid
- `/app` - 64MB, read-write, no-exec, no-suid

### Container Configuration

```typescript
{
  User: '65534:65534',           // nobody:nogroup
  NetworkDisabled: true,          // No network access
  HostConfig: {
    ReadonlyRootfs: true,         // Read-only filesystem
    CapDrop: ['ALL'],             // Drop all capabilities
    AutoRemove: false,            // Manual cleanup
  }
}
```

## Advanced Usage

### Container Reuse and Caching

Containers are automatically cached based on their configuration. The same options will reuse existing containers:

```typescript
// First call creates the container
const sandbox1 = new Sandbox({ dependencies: ['python3', 'curl'] });
await sandbox1.exec('python3 --version');

// Second call reuses the same container (same dependencies)
const sandbox2 = new Sandbox({ dependencies: ['python3', 'curl'] });
await sandbox2.exec('curl --version');
```

Container names are generated using SHA-256 hashes (via the `cid` function at index.ts:245-246) of the base image and dependencies, ensuring deterministic naming and efficient reuse.

### Custom Dependencies with Multiple Tools

Install a combination of Alpine packages:

```typescript
const sandbox = new Sandbox({
  image: 'alpine:latest',
  dependencies: ['curl', 'jq', 'git', 'bash'],
  verbose: true,
});

// Complex command using multiple tools
const result = await sandbox.exec(`
  echo '{"name":"test","value":42}' | jq '.value'
`);
console.log(result.stdout); // "42"

await sandbox.destroy();
```

### Multiple Language Execution

Work with different languages in the same application:

```typescript
// Python sandbox
const pythonSandbox = new Sandbox();
const pythonRunner = await pythonSandbox.code({ language: 'python' });
const pythonResult = await pythonRunner.run('print("Python:", 2 + 2)');

// Node.js sandbox (separate container)
const nodeSandbox = new Sandbox();
const nodeRunner = await nodeSandbox.code({ language: 'nodejs' });
const nodeResult = await nodeRunner.run('console.log("Node:", 2 + 2)');

console.log(pythonResult.stdout); // "Python: 4"
console.log(nodeResult.stdout); // "Node: 4"

// Cleanup
await pythonSandbox.destroy();
await nodeSandbox.destroy();
```

### Error Handling and Debugging

Implement robust error handling with verbose logging:

```typescript
const sandbox = new Sandbox({
  image: 'python:alpine',
  verbose: true, // See detailed execution logs
});

try {
  const result = await sandbox.exec('python3 -c "1/0"');
  console.log(result.stdout);
} catch (error) {
  console.error('Execution failed:', error);
}

// Check stderr for runtime errors
const result = await sandbox.exec(
  'python3 -c "import sys; sys.stderr.write(\'warning\\n\')"',
);
console.log('Stderr:', result.stderr); // "warning"

await sandbox.destroy();
```

## Examples

### Simple Text Processing (Default)

Start with basic text operations using defaults:

```typescript
const sandbox = new Sandbox();

const result = await sandbox.exec('echo "hello world" | tr "a-z" "A-Z"');
console.log(result.stdout); // "HELLO WORLD"

await sandbox.destroy();
```

### File Operations with Temporary Storage

Use writable tmpfs directories:

```typescript
const sandbox = new Sandbox();

// Write to /tmp (writable tmpfs)
await sandbox.exec('echo "data" > /tmp/test.txt');
const result = await sandbox.exec('cat /tmp/test.txt');
console.log(result.stdout); // "data"

// Try to write to root (fails - read-only)
const failResult = await sandbox.exec('touch /test.txt');
console.log(failResult.stderr); // Read-only file system error

await sandbox.destroy();
```

### Adding External Tools

Install additional packages for specific tasks:

```typescript
const sandbox = new Sandbox({
  dependencies: ['coreutils'],
});

const result = await sandbox.exec('echo "test" | sha256sum');
console.log(result.stdout); // Hash output

await sandbox.destroy();
```

### Data Processing with Custom Image

Use a language-specific image with system dependencies:

```typescript
const sandbox = new Sandbox({
  image: 'python:alpine',
  dependencies: ['py3-numpy'],
  verbose: true,
});

const result = await sandbox.exec(`python3 -c "
import numpy as np
arr = np.array([1, 2, 3, 4, 5])
print(f'Mean: {np.mean(arr)}')
print(f'Sum: {np.sum(arr)}')
"`);

console.log(result.stdout);
// Mean: 3.0
// Sum: 15

await sandbox.destroy();
```

### Complex Multi-Step Workflow

Combine multiple operations with full configuration:

```typescript
const sandbox = new Sandbox({
  image: 'python:alpine',
  dependencies: ['curl', 'jq', 'py3-requests'],
  verbose: true,
});

// Step 1: Download data (during dependency install, network available)
// Step 2: Process with Python
const result = await sandbox.exec(`python3 -c "
import json
data = {'users': [{'name': 'Alice', 'score': 95}, {'name': 'Bob', 'score': 87}]}
# Process data
total = sum(u['score'] for u in data['users'])
print(f'Total score: {total}')
print(f'Average: {total / len(data['users'])}')
"`);

console.log(result.stdout);
// Total score: 182
// Average: 91.0

await sandbox.destroy();
```

## Troubleshooting

### Docker Not Running

```
Error: Docker daemon not running
```

**Solution**: Start Docker Desktop or the Docker daemon:

```bash
# macOS/Windows
# Start Docker Desktop

# Linux
sudo systemctl start docker
```

### Permission Denied Errors

```
Error: Permission denied
```

**Solution**: The sandbox runs as an unprivileged user. Ensure operations only touch writable directories (`/tmp`, `/run`, `/app`).

### Network Access Required

If you need network access for specific operations, consider installing dependencies at container creation time or modifying the network configuration.

### Container Cleanup

Containers are not auto-removed. Always call `destroy()` when done:

```typescript
try {
  await sandbox.exec(command);
} finally {
  await sandbox.destroy();
}
```

## License

Part of the Serverize monorepo. See repository root for license information.

## Related Packages

- `@serverize/docker` - Docker utilities used by this package
- `@serverize/serverize` - Main Serverize package

## Contributing

See the main [Serverize repository](https://github.com/JanuaryLabs/serverize) for contribution guidelines.

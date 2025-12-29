# Serverize

One-step Docker deployment for any framework.

[![npm version](https://img.shields.io/npm/v/serverize.svg)](https://www.npmjs.com/package/serverize)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Node.js LTS](https://img.shields.io/badge/node-LTS-brightgreen.svg)](https://nodejs.org/)

## Overview

Serverize packages your application in Docker and deploys it to a unique URL. Create development, testing, and preview environments without the complexity.

- **Zero config** - Auto-detects your framework and generates Dockerfiles
- **Any framework** - Works with Node.js, Python, .NET, and more
- **Instant URLs** - Get a shareable URL for every deployment
- **Secrets management** - Securely inject environment variables

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Node.js LTS](https://nodejs.org/)
- npm, yarn, or pnpm

## Quick Start

```sh
# Deploy your app (auto-detects framework)
npx serverize
```

That's it. Serverize will:

1. Detect your framework
2. Generate a Dockerfile (if needed)
3. Build and deploy your app
4. Return a unique URL

### Manual Setup

If you prefer to set up manually or customize the Dockerfile:

```sh
# Generate Dockerfile for your framework
npx serverize setup [framework]

# Examples
npx serverize setup next      # Next.js
npx serverize setup nuxt      # Nuxt
npx serverize setup astro     # Astro
npx serverize setup deno      # Deno
```

## Supported Frameworks

| Framework | Command                         | Status    |
| --------- | ------------------------------- | --------- |
| Node.js   | `npx serverize setup node`      | Supported |
| Deno      | `npx serverize setup deno`      | Supported |
| Bun       | `npx serverize setup bun`       | Supported |
| Next.js   | `npx serverize setup next`      | Supported |
| Nuxt      | `npx serverize setup nuxt`      | Supported |
| Astro     | `npx serverize setup astro`     | Supported |
| Remix     | `npx serverize setup remix`     | Supported |
| Angular   | `npx serverize setup angular`   | Supported |
| Vite      | `npx serverize setup vite`      | Supported |
| FastAPI   | `npx serverize setup fastapi`   | Supported |
| Streamlit | `npx serverize setup streamlit` | Supported |
| .NET      | `npx serverize setup dotnet`    | Supported |

Custom Dockerfiles are always supported - just create a `Dockerfile` that exposes an HTTP port.

## CLI Commands

| Command                           | Description                       |
| --------------------------------- | --------------------------------- |
| `npx serverize`                   | Deploy with auto-detection        |
| `npx serverize setup [framework]` | Generate Dockerfile for framework |
| `npx serverize deploy`            | Deploy using existing Dockerfile  |
| `npx serverize releases`          | List and manage releases          |
| `npx serverize logs`              | View deployment logs              |
| `npx serverize secrets`           | Manage secrets/env variables      |
| `npx serverize tokens`            | Manage API tokens                 |
| `npx serverize auth`              | Authentication commands           |

## Configuration

### Custom Dockerfile

The generated Dockerfile can be customized to fit your needs. Serverize respects any modifications you make.

### Docker Compose

For multi-container setups, Serverize supports Docker Compose files:

```sh
npx serverize deploy --compose
```

### Secrets

Manage environment variables securely:

```sh
# Add a secret
npx serverize secrets set API_KEY=your-key

# List secrets
npx serverize secrets list
```

## Project Structure

This is a monorepo with the following packages:

| Package                                                | Description                     |
| ------------------------------------------------------ | ------------------------------- |
| [`serverize`](./packages/serverize)                    | CLI tool                        |
| [`@serverize/client`](./packages/client)               | API client library              |
| [`@serverize/dockerfile`](./packages/dockerfile)       | Dockerfile generation utilities |
| [`@serverize/docker`](./packages/docker)               | Docker runtime utilities        |
| [`@serverize/dockercompose`](./packages/dockercompose) | Docker Compose utilities        |
| [`@serverize/utils`](./packages/utils)                 | Shared utilities                |

## Troubleshooting

### Docker not running

```
Error: Cannot connect to Docker daemon
```

Make sure Docker Desktop is running or the Docker daemon is started.

### Port already in use

If your app's port is already in use, modify the `EXPOSE` directive in your Dockerfile or configure your app to use a different port.

### Build fails

1. Check that your Dockerfile is valid
2. Ensure all dependencies are properly declared
3. Run `docker build .` locally to debug

## Contributing

Contributions are welcome! This project uses [Nx](https://nx.dev/) for monorepo management.

### Development Setup

```sh
# Clone the repo
git clone https://github.com/JanuaryLabs/serverize.git
cd serverize

# Install dependencies
npm install

# Build all packages
npx nx run-many -t build

# Run the CLI in dev mode
npm run serverize
```

### Reporting Issues

Found a bug or have a feature request? [Open an issue](https://github.com/JanuaryLabs/serverize/issues).

## License

Apache 2.0 - see [LICENSE](LICENSE) for details.

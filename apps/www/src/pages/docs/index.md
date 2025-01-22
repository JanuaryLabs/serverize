---
layout: ../../layouts/DocsLayout.astro
title: 'Documentation'
subtitle: 'Learn how to deploy and manage your applications with Serverize'
---

Serverize facilitates the creation of **development**, **testing**, and **preview** environments, each tailored to empower different phases of the product lifecycle without unnecessary complexity. It uses Docker to package your application and deploy it to a unique URL, allowing you to share your work with others or test it in a production-like environment.

The simplest way to get started is with our zero-config deployment:

```sh frame=none
npx serverize
```

Serverize will automatically detect your framework and set up the appropriate configuration. If it can't detect your framework, it will prompt you to choose one.

Or tell it where your Dockerfile is:

```sh frame=none
npx serverize -f ./Dockerfile
```

Or deploy an existing local image:

```sh frame=none
npx serverize -i docker.io/a
```

## Core Concepts

- [Projects](./concepts/projects) - Organize your deployments
- [Channels](./concepts/channels) - Manage different environments
- [Releases](./concepts/releases) - Version your deployments
- [Secrets](./concepts/secrets) - Handle environment variables
<!--

## Framework Guides

Deploy your application based on your framework:

- [Next.js](./framework/nextjs)
- [React](./framework/react)
- [Vue](./framework/vue)
- [Angular](./framework/angular)
- [Svelte](./framework/svelte)
- [Astro](./framework/astro)
- [Node.js](./framework/nodejs)
- [Deno](./framework/deno)
- [Nuxt.js](./framework/nuxtjs) -->

## Deployment

- [CI/CD Integration](./deploy/ci-cd)
- [Deployment Previews](./deploy/deployment-previews)
- [Auto Setup](./deploy/serverize)

## CLI Reference

Manage your deployments using our CLI:

- [`auth`](./cli/auth) - Authentication commands
- [`projects`](./cli/projects) - Project management
- [`deploy`](./cli/deploy) - Deployment commands
- [`releases`](./cli/releases) - Release management
- [`secrets`](./cli/secrets) - Secret management
- [`logs`](./cli/logs) - View deployment logs

## Need Help?

- Join our [Discord community](https://discord.gg/aj9bRtrmNt) for support
- Check out our [example projects](https://github.com/serverize) on GitHub
- Follow us on [Twitter](https://twitter.com/serverize) for updates

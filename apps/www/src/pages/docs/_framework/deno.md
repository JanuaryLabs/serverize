---
layout: ../../../layouts/DocsLayout.astro
title: 'Deploy Deno to Serverize'
subtitle: 'Learn how to Serverize your Deno application'
---

> [!IMPORTANT]
> You need Docker installed on your machine to follow this guide, if it isn't installed yet, follow the [Docker installation guide](https://docs.docker.com/engine/install/) to set it up for your computer.

## Start Here

Serverize can deploy your project without any manual setup.

```sh
npx serverize --framework deno
```

Or use the `setup` command to further customize the Dockerfile.

```sh
npx serverize setup deno
```

> [!TIP]
> Check the [source code](https://github.com/serverize/example-deno) for a complete example.

## Understanding Deno Deployment

Deno applications typically follow these patterns:

1. `HTTP Server`: Using Oak or other HTTP frameworks
2. `Deploy`: Deno Deploy compatible applications
3. `Script`: Stand-alone Deno scripts

Ensure your application listens on the port specified by the `PORT` environment variable (defaults to 3000).

## Automating Deployments with CI/CD

You can automate the deployment of your application to Serverize through tools like GitHub Actions whenever new code is pushed to the remote repository.

For detailed instructions on configuring CI/CD with Serverize and GitHub Actions, refer to our [CI/CD guide](../deploy/ci-cd.md).

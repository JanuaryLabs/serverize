---
layout: ../../../layouts/DocsLayout.astro
title: 'Deploy Node.js to Serverize'
subtitle: 'Learn how to Serverize your Node.js application'
author: 'Adam Koskovki'
date: '2024-10-22T00:00:00.000Z'
---

> [!IMPORTANT]
> You need Docker installed on your machine to follow this guide, if it isn't installed yet, follow the [Docker installation guide](https://docs.docker.com/engine/install/) to set it up for your computer.

## Start Here

Serverize can deploy your project without any manual setup.

```sh
npx serverize --framework nodejs
```

Or use the `setup` command to further customize the Dockerfile.

```sh
npx serverize setup nodejs
```

> [!TIP]
> Check the [source code](https://github.com/serverize/example-nodejs) for a complete example.

## Understanding Node.js Deployment

Node.js applications can be deployed in various ways depending on your setup:

1. `Express/Koa/Fastify`: HTTP server based applications
2. `Serverless`: Function-based applications
3. `Worker`: Background processing applications

The key is ensuring your application listens on the port specified by the `PORT` environment variable (defaults to 3000).

## Automating Deployments with CI/CD

You can automate the deployment of your application to Serverize through tools like GitHub Actions whenever new code is pushed to the remote repository.

For detailed instructions on configuring CI/CD with Serverize and GitHub Actions, refer to our [CI/CD guide](../deploy/ci-cd.md).

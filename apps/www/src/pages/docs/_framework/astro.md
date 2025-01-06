---
layout: ../../../layouts/DocsLayout.astro
title: 'Deploy Astro to Serverize'
subtitle: 'Learn how to Serverize your Astro with different build modes (server, hybrid, and static)'
---

> [!IMPORTANT]
> You need Docker installed on your machine to follow this guide, if it isn't installed yet, follow the [Docker installation guide](https://docs.docker.com/engine/install/) to set it up for your computer.

## Start Here

Serverize can deploy your project without any manual setup.

```sh
npx serverize --framework astro
```

Or use the `setup` command to further customize the Dockerfile.

```sh
npx serverize setup astro
```

> [!TIP]
> Check the [source code](https://github.com/serverize/example-astro) for a complete example.

## Understanding Astro build modes

Astro supports 3 build mode:

1. `server`: Server-Side Rendering (SSR)
2. `static`: Static Site Generation (SSG)
3. `hybrid`: [Mix between SSR and SSG for optimal experience](https://astro.build/blog/hybrid-rendering/)

The **static** modes generate a static site that can be served using a static file server like Nginx or Apache whereas the server and hybrid mode requires an adpater like Node.js to serve the application.

The difference between them is how the app is rendered:

- `server`: The app is rendered on the server-side.
- `static`: The app is rendered at build time.
- `hybrid`: Some pages are rendered at the build time and some pages are rendered on the server-side.

You can read more about the build modes in the [Astro deployment](https://docs.astro.build/en/guides/integrations-guide/node).

## Automating Deployments with CI/CD

You can automate the deployment of your application to Serverize through tools like GitHub Actions whenever new code is pushed to the remote repository.

For detailed instructions on configuring CI/CD with Serverize and GitHub Actions, refer to our [CI/CD guide](../deploy/ci-cd.md).

---
layout: ../../layouts/BlogPostLayout.astro
title: 'Deploy Astro to Serverize'
subtitle: 'Learn how to Serverize your Astro with different build modes (server, hybrid, and static)'
author: 'Adam Koskovki'
date: '2024-10-22T00:00:00.000Z'
---

## TL;DR

Use serverzie setup to auto configure your project.

```sh
npx serverize setup astro
```

Continue if you'd like to understand the steps in more detail and customize the setup further.

## Project Structure

Once you've finished adding the required files, your project should look like this:

```
.
├─── .dockerignore
├─── Dockerfile
└─── package.json
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

## Prerequisites

You need Docker installed on your machine to follow this guide, if it isn't installed yet, follow the [Docker installation guide](https://docs.docker.com/engine/install/) to set it up for your computer.

## Add Dockerfile

To put your Astro project in a container, you need to create a Dockerfile in your project's main folder. This file tells Docker how to build and run your app.

In the root of your project, create a file named `Dockerfile` and add the following content:

```dockerfile title="Dockerfile"
FROM node:alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
 	if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
 	elif [ -f package-lock.json ]; then npm ci; \
 	elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
 	else echo "Lockfile not found." && exit 1; \
 	fi

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN \
	if [ -f yarn.lock ]; then yarn run build; \
	elif [ -f package-lock.json ]; then npm run build; \
	elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
	else echo "Lockfile not found." && exit 1; \
 	fi
```

It consists of four stages (the last one in the next section):

1. **base**: This stage creates a base image for all subsequent stages. It sets the working directory to `/app` and ensures that essential utilities are available for use.

2. **deps**: Install dependencies based using the preferred package manager.

   - Auto detects the package manager.
   - Installs dependencies only when corresponding package manager lock file is present.

3. **builder**: Build the source code.

   - Rebuilds the source code only when needed.
   - Assumes the `build` script is defined in `package.json`.
   - The `build` script is executed based on the used package manager.

> [!NOTE]
> The Dockerfile tries to automatically pick the right package manager (yarn, npm, or pnpm). You can change it to only use the one you prefer.

### Server and Hybrid

Continuing from the previous section Dockerfile, add the following content at the end of the Dockerfile:

```dockerfile title="Dockerfile"
FROM base AS start
WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY --from=builder /app/dist .
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
USER node
EXPOSE 3000
CMD ["node", "server/entry.mjs"]
```

It does the following:

1. Copy the `node_modules` directory from the `deps` stage.
2. Copy the built files from the **builder** stage.
3. Set the environment variables.
4. Expose the port.
5. Start the Node.js server.

### Serve (SPA and Static)

The **static** build mode can be served using a static file server like Nginx or Apache.

At the end of the Dockerfile, add the following content:

```dockerfile title="Dockerfile"
FROM nginxinc/nginx-unprivileged AS start
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist .
ENV PORT=8080
USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

It does the following:

1. Uses an optimized nginx image to serve the application in non-root mode for better security.
2. Copy the built files from the **builder** stage.
3. Expose the port.
4. Start the Nginx server.

## Dockerignore

To make your Docker build faster, create a `.dockerignore` file to tell Docker which files to ignore in order to reduce the size of the image and speeds up the build process and deployment process.

Create a `.dockerignore` file in the root of your project and add the following content:

```dockerignore title=".dockerignore"
.dockerignore
node_modules
npm-debug.log
README.md
.next
.git
```

This list excludes directories like `node_modules`, which can be quite large, as well as other files like `.git`, `.env`, and configuration files that aren't needed within the Docker container or might contain sensitive information.

> [!NOTE]
> The smaller the image size, the quicker the deployment; only transfer the bare minimum of files to the final stage.

## Deploy Your Astro Project

After completing all the previous steps, you are now ready to deploy your application to Serverize.

```sh frame=none
npx serverize deploy -p <project-name>
```

Replace `<project-name>` with the actual name of your project. This command will package and deploy your Astro application, leveraging Serverize to handle the setup and deployment seamlessly.

## Automating Deployments with CI/CD

You can automate the deployment of your application to Serverize through tools like GitHub Actions whenever new code is pushed to the remote repository.

For detailed instructions on configuring CI/CD with Serverize and GitHub Actions, refer to our [CI/CD guide](./ci-cd).

## Takeaways

- Astro support 3 build modes: SSR (Server), Hybrid, and Static.
- Server and Hybrid needs a node.js server whereas Static can run behind a static file server like Nginx or Apache.
- The `CMD` instruction presume you're using default configurations.

Happy deploying! If you run into any issues or need further assistance, feel free to drop a message in our [Discord community](https://discord.gg/aj9bRtrmNt).

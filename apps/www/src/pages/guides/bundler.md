---
layout: ../../layouts/BlogPostLayout.astro
title: 'Using Bundlers with Serverize'
subtitle: 'Bundle that code, deploy that app'
author: 'Adam Koskovki'
date: '2024-10-22T00:00:00.000Z'
---

## TL;DR

Use serverzie setup to auto configure your project.

```sh
npx serverize setup vite
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
> Check the [source code](https://github.com/serverize/example-vite) for a complete example.

### Start here

This guide applies on projects that use a bundler like [esbuild](https://esbuild.github.io/), [webpack](https://webpack.js.org/), [rollup](https://rollupjs.org/), [parcel](https://parceljs.org/), [vite](https://vitejs.dev/), ...etc.

A bundler is a tool that bundles your code and dependencies into a single file which can be served by a static file server like Nginx or Apache or might bundle an API server.

It's very similar to the [Node.js guide](./node) but with one difference: you need to run `npm run build` before the `COPY` command.

> [!IMPORTANT]
> The guide assumes that you're using the `build` script to build your project, aka `npm run build` or `yarn run build` and that the output is in the `dist` directory.

## Prerequisites

You need Docker installed on your machine to follow this guide, if it isn't installed yet, follow the [Docker installation guide](https://docs.docker.com/engine/install/) to set it up for your computer.

## Adding a Dockerfile

To put your project in a container, you need to create a Dockerfile in your project's main folder. This file tells Docker how to build and run your app.

In the root of your project, create a file named `Dockerfile` and add the following content:

```dockerfile title="Dockerfile"
FROM node:alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
	if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
	elif [ -f package-lock.json ]; then npm ci; \
	elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
	else echo "Lockfile not found." && exit 1; \
	fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Assuming the "build" script is defined in package.json
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

#### Run Node.js server

Continuing from the previous section Dockerfile, add the following content at the end of the Dockerfile to run a Node.js server:

```dockerfile title="Dockerfile"
FROM base AS release
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./

ENV NODE_ENV=production
ENV PORT=3000

USER node

EXPOSE 3000

# Start the application
CMD ["node", "server/index.mjs"]
```

It does the following:

1. Copy the `node_modules` directory from the `deps` stage.
2. Copy the built files from the **builder** stage.
3. Set the environment variables.
4. Expose the port.
5. Start the Node.js server.

#### Serve (SPA and Static)

In case you're dling a frontend framework like React, Vue, Svelte, or something else, you can serve the application using a static file server like Nginx or Apache.

At the end of the Dockerfile, add the following content:

```dockerfile title="Dockerfile"
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

RUN addgroup --system --gid 1001 mygroup
RUN adduser --system --uid 1001 myuser

RUN mkdir -p /var/cache/nginx/client_temp
RUN chown -R myuser:mygroup /var/cache/nginx /var/run /var/log/nginx

COPY --from=builder --chown=myuser:mygroup /app/dist .

USER myuser
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

It does the following:

1. Add new group and a user to it to set the permissions (run it as non-root).
2. Copy the built files from the **builder** stage.
3. Expose the port.
4. Start the Nginx server.

## Dockerignore

To make your Docker build faster, create a `.dockerignore` file to tell Docker which files to ignore in order to reduce the size of the image and speeds up the build process and deployment process.

Create a `.dockerignore` file in the root of your project and add the following content:

```dockerignore title=".dockerignore"
node_modules
docker-compose*
.dockerignore
.git
.gitignore
README.md
LICENSE
.vscode
Makefile
helm-charts
.env
.editorconfig
.idea
coverage*
```

This list excludes directories like `node_modules`, which can be quite large, as well as other files like `.git`, `.env`, and configuration files that aren't needed within the Docker container or might contain sensitive information.

> [!NOTE]
> The smaller the image size, the quicker the deployment; only transfer the bare minimum of files to the final stage.

## Deploy Your Project

After completing all the previous steps, you are now ready to deploy your application to Serverize.

```sh frame=none
npx serverize deploy -p <project-name>
```

Replace `<project-name>` with the actual name of your project. This command will package and deploy your application, leveraging Serverize to handle the setup and deployment seamlessly.

## Automating Deployments with CI/CD

You can automate the deployment of your application to Serverize by using Continuous Integration and Continuous Deployment (CI/CD) tools like GitHub Actions. This setup ensures that your application is deployed whenever new code is pushed to the main branch.

For detailed instructions on configuring CI/CD with Serverize and GitHub Actions, refer to our [CI/CD guide](./ci-cd).

## Takeaways

- Make sure to expose the correct port in your Dockerfile.
- The `CMD` command in your Dockerfile should start your application.
- package.json should have a `build` script that bundles your code.

Happy deploying! If you run into any issues or need further assistance, feel free to drop a message in our [Discord community](https://discord.gg/aj9bRtrmNt).

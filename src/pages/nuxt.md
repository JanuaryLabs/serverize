---
layout: ../layouts/BlogPostLayout.astro
title: 'Deploy Nuxt.js to Serverize'
subtitle: 'Learn how to deploy Serverize your Nuxt.js with different build modes (SSG, SSR, SPA)'
author: 'Adam Koskovki'
date: '2024-10-22T00:00:00.000Z'
---

### Table of contents

- Prerequisites
- Add Dockerfile
- Deploy

### Project Structure

Once finished adding the required files, your project should contain the following files:

```
.
├─── .dockerignore
├─── Dockerfile
└─── package.json
```

### Understanding Nuxt.js build modes

Nuxt supports 3 build mode:

1. `server`: Server-Side Rendering (SSR)
2. `spa`: Single Page Application (SPA)
3. `static`: Static Site Generation (SSG)

The spa and static modes generate a static site that can be served using a static file server like Nginx or Apache whereas the server mode requires technology like Node.js to serve the application.

The difference between them is how the app is rendered:

- `spa`: The app is rendered on the client-side.
- `static`: The app is rendered at build time.
- `server`: The app is rendered on the server-side.

You can read more about the build modes in the [Nuxt.js deployment](https://nuxt.com/docs/getting-started/deployment).

### Prerequisites

You need Docker installed on your machine to follow this guide, if it isn't installed yet, follow the [Docker installation guide](https://docs.docker.com/engine/install/) to set it up for your computer.

### Add Dockerfile

To put your Nuxt.js project in a container, you need to create a Dockerfile in your project's main folder. This file tells Docker how to build and run your app.

In the root of your project, create a file named `Dockerfile` and add the following content:

```Dockerfile title="Dockerfile"
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

ENV NUXT_TELEMETRY_DISABLED=1
RUN \
	if [ -f yarn.lock ]; then yarn run build; \
	elif [ -f package-lock.json ]; then npm run build; \
	elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
	else echo "Lockfile not found." && exit 1; \
	fi
```

It consists of four stages (the last one in the next section):

1. `base`: The base image for all stages.

2. `deps`: Install dependencies based using the preferred package manager.

   - Auto detects the package manager.
   - Installs dependencies only when corresponding package manager lock file is present.

3. `builder`: Build the source code.

   - Rebuilds the source code only when needed.
   - Assumes the `build` script is defined in `package.json`.
   - The `build` script is executed based on the used package manager.

Note: The Dockerfile tries to automatically pick the right package manager (yarn, npm, or pnpm). You can change it to only use the one you prefer.

#### Serve (SSR)

Continuing from the previous section Dockerfile, add the following content at the end of the Dockerfile:

```Dockerfile title="Dockerfile"
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 runtime

COPY --from=builder --chown=runtime:nodejs /app/.output ./

ENV NUXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST="0.0.0.0"

USER runtime

EXPOSE 3000

# Start the application
CMD ["node", "server/index.mjs"]
```

It does the following:

1. Add new group and a user to it to set the permissions (run it as non-root).
2. Copy the built files from the `builder` stage.
3. Set the environment variables.
4. Expose the port.

#### Serve (SPA and Static)

If you use the `spa` or `static` build mode, you can serve the application using a static file server like Nginx or Apache.

At the end of the Dockerfile, add the following content:

```Dockerfile title="Dockerfile"
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

RUN addgroup --system --gid 1001 mygroup
RUN adduser --system --uid 1001 myuser

RUN mkdir -p /var/cache/nginx/client_temp
RUN chown -R myuser:mygroup /var/cache/nginx /var/run /var/log/nginx

COPY --from=builder --chown=myuser:mygroup /app/.output/public .

USER myuser
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

It does the following:

1. Add new group and a user to it to set the permissions (run it as non-root).
2. Copy the built files from the `builder` stage.
3. Expose the port.
4. Start the Nginx server.

### Dockerignore

To make your Docker build faster, create a `.dockerignore` file to tell Docker which files to ignore in order to reduce the size of the image and speeds up the build process and deployment process.

Create a `.dockerignore` file in the root of your project and add the following content:

```.dockerignore title=".dockerignore"
.dockerignore
node_modules
npm-debug.log
README.md
.next
.git

```

### Deploy

Once all the steps have been completed, you are now ready to deploy your Bun application to Serverize.

```sh frame=none
npx serverize deploy -p <project-name>
```

Replace `<project-name>` with the actual name of your project. This command will package and deploy your Bun application

---
layout: ../layouts/BlogPostLayout.astro
title: 'Step-by-Step Guide to Deploying Your Bun Project Using Serverize'
subtitle: 'A Comprehensive Tutorial to Containerizing and Deploying Your Bun Project with Ease Using Serverize'
author: 'Adam Koskovki'
date: '2024-10-25T00:00:00.000Z'
---

### Table of Contents

- Prerequisites
- Add Dockerfile
- Deploy

### Project Structure

Once you've finished adding the required files, your project should contain the following files:

```
.
├─── .dockerignore
├─── Dockerfile
└─── package.json
```

### Understanding the `bun run` Command

Bun has the capability to run TypeScript code directly without needing a separate build step. This feature significantly reduces the overall build time and makes development faster and smoother.

This means that copying the code into the container and running it is essentially all it takes, unless you have a different setup that requires more customization.

### Prerequisites

You need Docker installed on your machine to follow this guide, if it isn't installed yet, follow the [Docker installation guide](https://docs.docker.com/engine/install/) to set it up for your computer.

### Adding a Dockerfile

To put your Bun project in a container, you need to create a Dockerfile in your project's main folder. This file tells Docker how to build and run your app.

In the root of your project, create a file named `Dockerfile` and add the following content:

```Dockerfile title="Dockerfile"
FROM oven/bun:1 AS base
WORKDIR /app

# Make sure wget is available so healthcheck works
RUN apt-get update && apt-get install -y wget

FROM base AS install

# install dependencies into temp directory
# this will cache them and speed up future builds
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev
RUN bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod
RUN bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app .

# run the app
USER bun
EXPOSE 3000

# Assuming the "start" script is defined in package.json
# and starts the server
CMD [ "bun", "start" ]
```

It consists of four stages

1. **`base`**: This stage creates a base image for all subsequent stages. It sets the working directory to `/app` and ensures that essential utilities like `wget` are available for use.

2. **`install`**: Install dev dependencies and production dependencies separately which should speed up subsequent builds according to [Bun's docs](https://bun.sh/guides/ecosystem/docker).

3. **`prerelease`**:

   - Copies the development dependencies from the `install` stage.
   - Copies the source code from the current directory into the image.

4. **`release`**:
   - Copies the production dependencies from the `install` stage.
   - Copies the source code from the `prerelease` stage.
   - Sets the user to `bun` to ensure the app runs as a non-root user for better security.
   - Exposes port `3000`.
   - Assumes the `start` script in `package.json` will start the server.

### Dockerignore

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

## Deploy Your Bun Project

After completing all the previous steps, you are now ready to deploy your Bun application to Serverize.

```sh frame=none
npx serverize deploy -p <project-name>
```

Replace `<project-name>` with the actual name of your project. This command will package and deploy your Bun application, leveraging Serverize to handle the setup and deployment seamlessly.

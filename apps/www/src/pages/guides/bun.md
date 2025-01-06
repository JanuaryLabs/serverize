---
layout: ../../layouts/BlogPostLayout.astro
title: 'Deploy Bun to Serverize'
subtitle: 'Learn how to Serverize your Bun project'
author: 'Adam Koskovki'
date: '2024-10-22T00:00:00.000Z'
---

## TL;DR

Use serverzie setup to auto configure your project.

```sh
npx serverize setup bun
```

Continue if you'd like to understand the steps in more detail and customize the setup further.

## Prerequisites

- You need Docker installed on your machine to follow this guide, if it isn't installed yet, follow the [Docker installation guide](https://docs.docker.com/engine/install/) to set it up for your computer.
- You need serverize account, if you don't have one, follow the [serverize sign up guide](./cli#authentication).

## Project Structure

Once you've finished adding the required files, your project should look like this:

```
.
├─── .dockerignore
├─── Dockerfile
└─── package.json
```

> [!TIP]
> Check the [source code](https://github.com/serverize/example-bun) for a complete example.

## Adding a Dockerfile

To put your Bun project in a container, you need to create a Dockerfile in your project's main folder. This file tells Docker how to build and run your app.

In the root of your project, create a file named `Dockerfile` and add the following content:

```dockerfile title="Dockerfile"
FROM oven/bun:1 AS base
WORKDIR /app

# Make sure wget is available so healthcheck works
RUN apt-get update && apt-get install -y wget

FROM base AS install

# install dependencies into temp directory
# this will cache them and speed up future builds
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --production --frozen-lockfile

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
ENV PORT=3000
EXPOSE 3000

CMD [ "bun", "index.ts" ]
```

It consists of four stages

1. **base**: This stage creates a base image for all subsequent stages. It sets the working directory to `/app` and ensures that essential utilities are available for use.

2. **`install`**: Install dev dependencies and production dependencies separately which should speed up subsequent builds according to [Bun's docs](https://bun.sh/guides/ecosystem/docker).

3. **`prerelease`**:

   - Copies the development dependencies from the `install` stage.
   - Copies the source code from the current directory into the image.

4. **`release`**:
   - Copies the production dependencies from the `install` stage.
   - Copies the source code from the `prerelease` stage.
   - Sets the user to `bun` to ensure the app runs as a non-root user for better security.
   - Exposes port `3000`.
   - Runs the `index.ts` script which starts a server.

> [!NOTE]
> Adjust the `CMD` to point to the project entrypoint file.

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

## Deploy Your Bun Project

After completing all the previous steps, you are now ready to deploy your application to Serverize.

```sh frame=none
npx serverize deploy -p <project-name>
```

Replace `<project-name>` with the actual name of your project. This command will package and deploy your Bun application, leveraging Serverize to handle the setup and deployment seamlessly.

## Automating Deployments with CI/CD

You can automate the deployment of your application to Serverize through tools like GitHub Actions whenever new code is pushed to the remote repository.

For detailed instructions on configuring CI/CD with Serverize and GitHub Actions, refer to our [CI/CD guide](./ci-cd).

## Takeaways

- Make sure to expose the correct port in your Dockerfile.
- The `CMD` command in your Dockerfile should start your application.
- Bun doesn't need a build step as it supports TypeScript out of the box.

Happy deploying! If you run into any issues or need further assistance, feel free to drop a message in our [Discord community](https://discord.gg/aj9bRtrmNt).

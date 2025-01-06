---
layout: ../../layouts/BlogPostLayout.astro
title: 'Deploy Deno to Serverize'
subtitle: 'Learn how to Serverize your Deno project'
author: 'Adam Koskovki'
date: '2024-10-22T00:00:00.000Z'
---

## TL;DR

Use serverzie setup to auto configure your project.

```sh
npx serverize setup deno
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

## Adding a Dockerfile

To put your Deno project in a container, you need to create a Dockerfile in your project's main folder. This file tells Docker how to build and run your app.

In the root of your project, create a file named `Dockerfile` and add the following content:

```dockerfile title="Dockerfile"
FROM denoland/deno:alpine AS base
WORKDIR /app

FROM base AS deps
WORKDIR /app
COPY deno.json .
RUN deno install --entrypoint deno.json

FROM deps AS builder
WORKDIR /app
COPY . .
RUN deno compile --allow-net --allow-env --output entry main.ts

FROM base AS start
COPY --from=builder /app/entry ./entry
USER deno
EXPOSE 8000
CMD ["./entry"]
```

It consists of four stages

1. **base**: This stage creates a base image for all subsequent stages and sets the working directory to `/app`.

2. **deps**: Install dependencies to be compiled later.

3. **builder**: Compiles the source code and outputs it as an executable.

4. **start**:
   - Copies the compiled executable from the `builder` stage.
   - Sets the user to `deno` to ensure the app runs as a non-root user for better security.
   - Exposes port `3000`.
   - Runs the executable which starts the server.

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

You can automate the deployment of your application to Serverize through tools like GitHub Actions whenever new code is pushed to the remote repository.

For detailed instructions on configuring CI/CD with Serverize and GitHub Actions, refer to our [CI/CD guide](./ci-cd).

## Takeaways

- Make sure to expose the correct port in your Dockerfile.
- The `CMD` command in your Dockerfile should start your application.

Happy deploying! If you run into any issues or need further assistance, feel free to drop a message in our [Discord community](https://discord.gg/aj9bRtrmNt).

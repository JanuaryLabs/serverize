---
layout: ../../layouts/BlogPostLayout.astro
title: 'Deploy Node.js to Serverize'
subtitle: 'Learn how to Serverize your Node.js project'
author: 'Adam Koskovki'
date: '2024-10-22T00:00:00.000Z'
---

## TL;DR

Use serverzie setup to auto configure your project.

```sh
npx serverize setup nodejs
```

Continue if you'd like to understand the steps in more detail and customize the setup further.

## Project Structure

Once you've finished adding the required files, your project should look like this:

```
.
├─── .dockerignore
├─── Dockerfile
├─── src/index.js
└─── package.json
```

## Prerequisites

You need Docker installed on your machine to follow this guide, if it isn't installed yet, follow the [Docker installation guide](https://docs.docker.com/engine/install/) to set it up for your computer.

## Adding a Dockerfile

To put your Node.js project in a container, you need to create a Dockerfile in your project's main folder. This file tells Docker how to build and run your app.

In the root of your project, create a file named `Dockerfile` and add the following content:

```dockerfile title="Dockerfile"
# Stage 1: Install dependencies
FROM node:alpine AS install

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit

# Stage 2: Run the app
FROM install AS run

WORKDIR /app
COPY --from=install /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

# Expose the port your app runs on
USER node
EXPOSE 3000
# Start the application
CMD ["node", "src/index.js"]
```

It consists of two stages:

1. **`install`**: Install dependencies using `npm ci` and omit the `dev` dependencies presuming there is no build step.

2. **`run`**: Copy the dependencies from the `install` stage and the source code from the current directory into the image.

   - The `USER node` command sets the user to `node` to ensure the app runs as a non-root user for better security.

   - The `EXPOSE 3000` command exposes port `3000` for the application to listen on.

   - The `CMD ["node", "src/index.js"]` command starts the application by running the `src/index.js` script.

## Dockerignore

To make your Docker build faster, create a `.dockerignore` file to tell Docker which files to ignore in order to reduce the size of the image and speeds up the build process and deployment process.

Create a `.dockerignore` file in the root of your project and add the following content:

```dockerignore title=".dockerignore"
**/node_modules/
**/.git
**/README.md
**/LICENSE
**/.vscode
**/npm-debug.log
**/coverage
**/.env
**/.editorconfig
**/.aws
**/dist
```

This list excludes directories like `node_modules`, which can be quite large, as well as other files like `.git`, `.env`, and configuration files that aren't needed within the Docker container or might contain sensitive information.

> [!NOTE]
> The smaller the image size, the quicker the deployment; only transfer the bare minimum of files to the final stage.

## Deploy Your Node.js Project

After completing all the previous steps, you are now ready to deploy your application to Serverize.

```sh frame=none
npx serverize deploy -p <project-name>
```

Replace `<project-name>` with the actual name of your project. This command will package and deploy your Bun application, leveraging Serverize to handle the setup and deployment seamlessly.

## Automating Deployments with CI/CD

You can automate the deployment of your application to Serverize by using Continuous Integration and Continuous Deployment (CI/CD) tools like GitHub Actions. This setup ensures that your application is deployed whenever new code is pushed to the main branch.

For detailed instructions on configuring CI/CD with Serverize and GitHub Actions, refer to our [CI/CD guide](./ci-cd).

## Takeaways

- Make sure to expose the correct port in your Dockerfile.
- The `CMD` command in your Dockerfile should start your application.
- The setup presume that you're not using a bundler like webpack or esbuild.

---
layout: ../../layouts/BlogPostLayout.astro
title: 'Serverize CLI'
subtitle: 'API Reference for the Serverize CLI'
author: 'Adam Koskovki'
date: '2024-10-22T00:00:00.000Z'
---

<!-- NOTE for the AI: this is informative text, not a tutorial -->

## Introduction

Serverize CLI is a command-line tool that allows you to deploy, manage, monitor, and interact with your projects.

It's currently distributed as an npm package, so you need to have Node.js installed on your machine (or CI/CD environment) to use it.

Before accessing any of Serverize's features, you need to create an account or log in to your existing one.

## Authentication

To create an account, run the following command:

```sh frame=none
npx serverize auth signup
```

You'll be prompted to enter your email and password, followed by an organization name and your first project name.

Once your account is successfully created, you need to verify your email address through a link sent to your inbox.

### Login

To log in to your account, run:

```sh frame=none
npx serverize auth signin
```

This will prompt you to enter your email and password.

### Logout

To log out from your account, run:

```sh frame=none
npx serverize auth signout
```

This will clear your authentication token from your machine.

## Projects

To list all your projects:

```sh frame=none
npx serverize projects list
```

To create a new project:

```sh frame=none
npx serverize projects create <project-name>
```

Note: `<project-name>` is an argument, not a flag.

## Understanding the Deployment Process

Every Serverize project has two essential components:

- **Channels**
- **Releases**

Channels, or environments, are collections of project release histories and their configurations.

When you create a new project, it gets a default channel named `dev` and a default release named `latest`.

Running:

```sh frame=none
npx serverize deploy -p <project-name>
```

will deploy the project and tag it as the latest release of the `dev` channel.

## Releases

When you deploy a project, it creates a new release behind the scene and associate it with a channel.

Unless you specify a release name, the release will be named `latest`.

```sh frame=none
npx serverize deploy -p <project-name> -r <release-name>
```

You can only have one release per name; deploying with the same release name will overwrite the previous one.

### Listing Releases

```sh frame=none
npx serverize releases list -p <project-name>
```

## Channels

Managing channels is not supported at the moment, however you get 2 channels when you signup, **dev**, **preview**

## Deployments

> Before deploying a project, ensure your Dockerfile is ready and works as expected; it should expose the port your server is listening on.

You can deploy a project by running:

```sh frame=none
npx serverize deploy -p <project-name>
```

The resulting URL will be:

```
https://<project-name>-<channel-name>-<release-name>.beta.january.sh
```

**Examples:**

1. **Deploying to the `dev` channel with the `latest` release (default options):**

   ```sh frame=none
   npx serverize deploy -p winter
   ```

   Resulting URL:

   ```
   https://winter-dev.beta.january.sh
   ```

   _Note:_ For the `latest` release, the release name doesn't appear in the URL.

2. **Deploying to the `dev` channel with a named release `demo`:**

   ```sh frame=none
   npx serverize deploy -p winter -r demo
   ```

   Resulting URL:

   ```
   https://winter-dev-demo.beta.january.sh
   ```

3. **Deploying to the `preview` channel with the `regression` release:**

   ```sh frame=none
   npx serverize deploy -p winter -c preview -r regression
   ```

   Resulting URL:

   ```
   https://winter-preview-regression.beta.january.sh
   ```

As mentioned, to deploy to a named release, specify the release name:

```sh frame=none
npx serverize deploy -p <project-name> -r <release-name>
```

_Note:_ The default channel is `dev`.

To deploy to a specific channel, such as `preview`, add the channel name:

```sh frame=none
npx serverize deploy -p <project-name> -c preview
```

### Authentication Tokens

To deploy a project in a CI/CD pipeline, you need to create a new token and store it in your CI/CD environment.

To create a new token, run:

```sh frame=none
npx serverize tokens create --project <project-name>
```

Store this token securely as it will only be displayed once. [See a complete guide on how to use Serverize with GitHub Actions](./ci-cd).

---

## Setup

To auto setup your project (add dockerfile, dockerignore, etc) run:

```sh frame=none
npx serverize setup [framework]
```

Where `framework` is the framework you want to setup, if not provided, serverize will try to guess it otherwise it'll ask you.

**Example:**

1. **Setup Deno**

```sh frame=none
npx serverize setup deno
```

This command will add Dockerfile as well as dockerignore to your project.

2. **Setup Astro**

```sh frame=none
npx serverize setup astro
```

3. **Setup Nuxt**

```sh frame=none
npx serverize setup nuxt
```

4. **Auto setup:**

```sh frame=none
npx serverize setup
```

Auto setup works by inspecting your project and guessing the framework.

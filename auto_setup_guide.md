---
title: Auto Setup Guide
description: A comprehensive guide on using Serverize's auto-setup feature to detect frameworks and generate Dockerfiles.
---

# Auto Setup Guide

## Introduction

Serverize's auto-setup feature simplifies the process of creating Dockerfiles for your projects. This guide will walk you through how to use the auto-setup command, explain how it detects frameworks, and provide examples for different supported frameworks.

## Using the Auto Setup Command

To use Serverize's auto-setup feature, you can run the following command in your project directory:

```sh
npx serverize setup
```

This command will attempt to detect the framework you're using and create an appropriate Dockerfile for your project.

## How Auto Setup Works

The auto-setup feature works by:

1. Detecting the framework used in your project
2. Generating a suitable Dockerfile based on the detected framework
3. Creating a .dockerignore file to exclude unnecessary files from the Docker build

### Framework Detection

Serverize uses a built-in detection mechanism to identify the framework used in your project. It looks for specific files and patterns that are characteristic of different frameworks.

If the framework cannot be automatically detected, you will be prompted to select from a list of supported frameworks.

## Supported Frameworks

Serverize supports auto-setup for various frameworks, including:

- Node.js
- Deno
- Bun
- Nuxt.js
- Astro
- Next.js

To see a full list of supported frameworks, you can use the following command:

```sh
npx serverize setup list
```

## Examples

Let's walk through a few examples of using the auto-setup feature with different frameworks.

### Setting up an Astro Project

To set up an Astro project:

```sh
npx serverize setup astro
```

This command will create a Dockerfile and .dockerignore file tailored for an Astro project.

### Setting up a Deno Project

For a Deno project:

```sh
npx serverize setup deno
```

This will generate the necessary Docker configuration files for a Deno application.

### Setting up a Nuxt.js Project

To set up a Nuxt.js project:

```sh
npx serverize setup nuxt
```

This command will create Docker configuration files optimized for a Nuxt.js application.

## Customizing the Dockerfile

After the auto-setup process, you can further customize the generated Dockerfile to fit your specific needs. The generated Dockerfile serves as a starting point, which you can modify as required.

## Troubleshooting

If you encounter any issues with the auto-setup process:

1. Ensure you're running the command in the root directory of your project.
2. Check if your project structure matches the standard layout for your framework.
3. If auto-detection fails, try specifying the framework explicitly in the setup command.

If problems persist, you can seek help in the [Serverize Discord community](https://discord.gg/aj9bRtrmNt).

## Conclusion

Serverize's auto-setup feature significantly simplifies the process of containerizing your applications. By automatically detecting your project's framework and generating appropriate Docker configuration files, it allows you to focus more on development and less on deployment setup.

Remember, while the auto-setup provides a great starting point, you can always customize the generated files to better suit your specific requirements.
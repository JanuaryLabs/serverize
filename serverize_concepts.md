---
title: Serverize Concepts
description: Understanding the core concepts of Serverize and how they relate to Docker deployments
---

# Serverize Concepts

## Introduction

Serverize is a powerful tool designed to simplify the deployment process for developers. It leverages Docker to package and deploy applications to unique URLs, enabling easy sharing and testing in production-like environments. This document will explore the core concepts of Serverize and how they work together to provide a seamless deployment experience.

## Key Concepts

### Projects

A project in Serverize represents your application or service. It's the top-level container for all your deployment-related activities. When you use Serverize, you're working within the context of a project.

### Channels

Channels in Serverize allow you to manage different deployment environments or versions of your application. They can represent different stages of your development process, such as:

- Development
- Testing
- Preview
- Production

Each channel can have its own configuration and deployment settings, allowing you to tailor the environment to specific needs.

### Releases

A release in Serverize is a specific version of your application that has been deployed. Releases are associated with channels and allow you to track the history of your deployments. You can create new releases, rollback to previous ones, and manage the lifecycle of your application versions.

### Docker Deployments

At the heart of Serverize is its integration with Docker. Serverize uses Docker to package your application and its dependencies into a container, ensuring consistency across different environments. Here's how it works:

1. You provide a Dockerfile that defines your application's environment and dependencies.
2. Serverize builds a Docker image from your Dockerfile.
3. The image is deployed to a unique URL, making your application accessible.

## Zero Config Deployment

One of Serverize's key features is its "Zero Config Deployment" capability. This means that in many cases, you can deploy your application with minimal configuration. Serverize attempts to detect your project's framework and set up the deployment automatically.

To use this feature, you can simply run:

```sh
npx serverize
```

Serverize currently supports auto-detection and setup for several frameworks, including:

- Node.js
- Deno
- Bun
- Nuxt.js
- Astro
- Next.js
- And more

## Auto Setup

For more control over the setup process, Serverize offers an auto-setup command:

```sh
npx serverize setup [framework]
```

This command allows you to specify your framework or let Serverize guess it. It will then create a Dockerfile and .dockerignore file tailored to your project.

Examples:

```sh
npx serverize setup deno
npx serverize setup astro
npx serverize setup nuxt
```

## CLI Tool

Serverize provides a comprehensive CLI tool for managing your projects, channels, releases, and more. Some key commands include:

- `deploy`: Deploy your application
- `secrets`: Manage environment secrets
- `logs`: View deployment logs
- `project`: Manage project settings
- `releases`: Manage releases
- `setup`: Set up your project for Serverize
- `shazam`: Auto-detect and deploy (default command)

## Conclusion

Serverize simplifies the deployment process by combining powerful concepts like projects, channels, and releases with Docker containerization. Its zero-config and auto-setup features make it accessible to developers of various skill levels, while still providing the flexibility for more advanced customization when needed.

By understanding these core concepts, you can leverage Serverize to streamline your development workflow and easily manage different environments for your applications.
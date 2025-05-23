---
title: Deployment Workflow in Serverize
description: A comprehensive guide to the deployment workflow in Serverize, including project creation, CLI deployment, release management, and log access.
---

# Deployment Workflow in Serverize

This guide provides an overview of the deployment workflow in Serverize, covering the process from creating a project to deploying an application, managing releases, and accessing logs.

## Table of Contents

1. [Creating a Project](#creating-a-project)
2. [Deploying an Application](#deploying-an-application)
3. [Managing Releases](#managing-releases)
4. [Accessing Logs](#accessing-logs)

## Creating a Project

Before deploying an application, you need to create a project in Serverize. While the provided code snippets don't explicitly show the project creation process, it's an essential first step. You can create a project using the Serverize dashboard or API.

## Deploying an Application

Serverize provides a powerful CLI tool for deploying applications. The `deploy` command allows you to deploy an application using a Dockerfile or Docker Compose file.

### Basic Usage

To deploy an application, use the following command:

```bash
npx serverize deploy [options]
```

### Options

- `-f, --file [dockerfilepath]`: Path to a Dockerfile relative to the current working directory. Ignored if `--image` is present. Default is `Dockerfile`.
- `--image [image]`: Docker image to deploy.
- `--context [context]`: Build context for the Docker image.
- `--output [output]`: Output file for deployment results.
- `--cwd [cwd]`: Current working directory.
- `--channel [channel]`: Deployment channel (optional).
- `--release [release]`: Release name (optional).
- `-p, --project [project]`: Project name (optional).

### Example

```bash
npx serverize deploy -f ./Dockerfile -p my-project --channel production --release v1.0.0
```

This command deploys the application using the specified Dockerfile, targeting the "my-project" project, in the "production" channel with the release name "v1.0.0".

## Managing Releases

Serverize allows you to manage multiple releases of your application within different channels. The `releases` command provides various subcommands for release management.

### Listing Releases

To list all releases for a project:

```bash
npx serverize releases list -p <project-name> [--channel <channel-name>]
```

This command displays a table of releases, including information such as project name, creation date, status, conclusion, release name, and channel.

### Terminating a Release

To terminate a specific release:

```bash
npx serverize releases terminate -p <project-name> --channel <channel-name> --release <release-name>
```

This command stops and removes the specified release from the given channel.

### Restarting a Release

To restart a specific release:

```bash
npx serverize releases restart -p <project-name> --channel <channel-name> --release <release-name>
```

This command restarts the specified release and provides information about the restarted release, including the accessible URL and how to view logs.

## Accessing Logs

Serverize provides easy access to application logs through the CLI.

To view logs for a specific project and release:

```bash
npx serverize logs -p <project-name> --channel <channel-name> --release <release-name>
```

This command streams the logs for the specified project, channel, and release directly to your console.

## Conclusion

The Serverize deployment workflow offers a streamlined process for deploying, managing, and monitoring your applications. By leveraging the CLI commands for deployment, release management, and log access, you can efficiently manage your application lifecycle within the Serverize ecosystem.

For more detailed information on specific commands or advanced usage, refer to the individual command documentation or reach out to the Serverize support team.
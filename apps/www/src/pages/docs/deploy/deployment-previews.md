---
layout: ../../../layouts/BlogPostLayout.astro
title: 'PR Preview Deployments'
subtitle: 'Preview Deployments let you test and iterate on project changes in a live environment, isolated from other deployments.'
author: 'Adam Koskovki'
date: '2024-11-15T00:00:00.000Z'
---

Deployment Previews enable developers to deploy and test changes in a live environment, separate from other deployments. This is an inherent feature in Serverize, utilizing preview channels and releases.

> [!IMPORTANT]
> Preview channel releases remain live for 5 minutes before going to sleep to save on resources, as they are not intended to be always available. If you require an always-on server, consider creating a dedicated project for that purpose.

## Use Cases

- **Pull Request Reviews**
  Test changes introduced in a Pull Request in a live environment, eliminating the need to clone, build, and run locally.

- **Code Experimentation**
  Iterate on new features, configurations, or architectural ideas in an isolated environment without impacting ongoing work.

- **Demos**
  Quickly spin up live instances to showcase progress, workflows, or proof-of-concepts to teams or collaborators.

- **Point-in-Time Deployments**
  Deploy and preserve specific versions or states of your project for debugging, historical comparisons, or reference.

## Get Started

A preview deployment is executed on a preview channel with a named release. Suppose we want to demo a feature named "autumn":

```bash
npx serverize deploy -p <project-name> -c preview -r autumn
```

This command returns a URL to a server running the code containing that feature, following this format:

```sh
https://<project-name>-preview-autumn.january.sh
# Example: https://foo-preview-autumn.january.sh
```

This works for any use case you might have, as long as the release name is unique. Keep in mind that deploying with the same release name will overwrite the deployment associated with that release.

## Environment Variables

To set environment variables, use the `secrets set` command along with the project name flag `-p` or `--project`.

```sh
npx serverize secrets set NAME=VALUE -p <project-name> -c preview
```

This command sets the `NAME` environment variable to `VALUE` for the `preview` channel.

All releases within the `preview` channel will have access to the `NAME` environment variable.

Refer to the [Secret Management guide](https://serverize.sh/guides/cli/#secrets-management) for more information.

## Terminate Release Deployment

Deployments do not have an expiry date by default, meaning they will persist indefinitely. To remove a deployment, you can use the stop command or specify a termination flag during deployment:

```sh
npx serverize releases stop -p <project-name> -c preview -r autumn
```

> [!IMPORTANT]
> The release, channel, and project name are required.

Another option is to specify a lifetime for the release during deployment:

```sh
npx serverize deploy -p <project-name> -c preview -r autumn --terminate-after 5m
```

This command will automatically remove the deployment 5 minutes after it first runs.

> [!NOTE]
> To change the termination time, you will need to redeploy.

## Live Deployments for Pull Requests

A key use case for deployment previews is deploying Pull Request (PR) changes to simplify the review process. You can use the PR ID as the release name, so each PR gets a unique URL, with new commits to the PR overwriting the same deployment.

Using GitHub Actions, you can add a workflow that listens to GitHub PR events to create and terminate deployments automatically for you and send notifications to Slack, Discord, etc.

You can use the CLI to configure it:

1. **Setup GitHub**

   ```sh
   npx serverize setup gh-pr-preview
   ```

   This command will set up the GitHub Action workflow.

2. **Create Project**

   ```sh
   npx serverize projects create <project-name>
   # Example: npx serverize projects create winter
   ```

3. **Create Token**

   ```sh
   npx serverize tokens create -p <project-name>
   ```

   Store the resulting token in the GitHub repository secrets under the name `SERVERIZE_API_TOKEN`.

4. **That's it!**
   Each PR will receive a comment including the preview URL.

> [!TIP]
> The setup command helps with all the required steps and also configures notifications to Discord or Slack.

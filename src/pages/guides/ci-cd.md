---
layout: ../../layouts/BlogPostLayout.astro
title: 'Automate Serverize Deployments with GitHub Actions'
subtitle: 'Use GitHub Actions to automate your Serverize deployments. Step-by-step guide to setting up workflows, creating tokens, and deploying your projects'
author: 'Adam Koskovki'
date: '2024-10-22T00:00:00.000Z'
---

## Project Structure

Once you've finished adding the required files, your project should look like this:

```
.
├─── .github/workflows/deploy-serverize.yml
├─── Dockerfile
└─── .dockerignore
```

These files are essential for configuring your GitHub Actions workflow and building your Docker image properly. The .github/workflows directory contains automation scripts, while Dockerfile helps create container images, and .dockerignore ensures irrelevant files aren't included in your Docker build.

### Understanding GitHub Actions

GitHub Actions is a powerful tool that allows you to automate workflows and run logic on your repository when specific events occur. For example, you can trigger deployments upon pushing new code to the main branch, schedule maintenance tasks, test code during pull requests, or respond to custom webhook events.

In this guide, we'll use GitHub Actions to serverize your project whenever there's a push to the main branch. This ensures your changes are deployed promptly without manual intervention.

### Pick your project

We have written several [guides](./) on deploying different frameworks to Serverize. Refer to the guide that fits your project and add docker related files.

These guides provide framework-specific deployment instructions to make the process easier for you.

### Create a Serverize token

Serverize uses a token to authenticate your deployments, ensuring that only authorized processes can initate deployments.

To create a new token, run the following command:

```sh frame=none
npx serverize tokens create --project <project-name>
```

Store this token securely as it will only be displayed once. You will need this token for authentication in GitHub Actions.

Since we're using GitHub Actions, you need to create a new secret in your repository's settings:

- Go to your repository's settings
  e.g https://github.com/<org>/<repo>/settings
- Go to the "Secrets and Variables" tab.
- Click on "New repository secret".
- Name the secret `SERVERIZE_API_TOKEN`.
- Paste the token you generated in the "Value" field.

This step is crucial as it ensures that sensitive information like API tokens is not exposed directly in the workflow file.

### Add a GitHub Actions workflow

Next, we need to set up a GitHub Actions workflow that will handle your Serverize deployments. Navigate to your repository's `.github/workflows` folder (or create new one) and create a new file named `deploy-serverize.yml`.

Copy the following content into the file:

```yaml title=".github/workflows/deploy-serverize.yml"
name: Serverize

on:
  push:
    branches:
      - main

concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref}}
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: npm

      # Assuming the build and other processes are happening in the Dockerfile
      - name: Deploy
        run: npx serverize deploy
        env:
          SERVERIZE_API_TOKEN: ${{ secrets.SERVERIZE_API_TOKEN }}
```

**_This workflow assumes that the build and other processes are happening in the Dockerfile._**

Explanation:

- `name`: The name of the workflow.
- `on`: The event that triggers the workflow which in this case is a push to the main branch.
- `concurrency`: This ensures that only one deployment is running at a time and cancels any previous deployments if new pushes are made.
- `jobs`: This is a collection of jobs that are executed in parallel. You only have one job in this case.
- `deploy`: This is the name of the job
  - `runs-on`: The operating system on which the job runs.
  - `steps`: This is a collection of steps that are executed in order.
  - It fetches the code from the repository using the `actions/checkout@v3` action.
  - It sets up the Node.js environment using the `actions/setup-node@v3` action.
  - It runs the `npx serverize deploy` command to deploy the project.

> Note: _Make sure to add the `SERVERIZE_API_TOKEN` secret to your repository's settings._

### Send Notifications

It's preferable to send notifications to ensure that everyone knows about the current status of deployments without having to check GitHub manually. This becomes even more important when something goes wrong.

You can get feedback on your deployment by sending a notification to your communication system, whether it is Microsoft Teams, Slack, Discord, or any other tool you prefer.

Check [GitHub Actions Marketplace](https://github.com/marketplace?type=actions) for more options and relevant actions.

Taking Slack as an example, you can add the following step to your workflow to send a notification when the deployment is successful or failed:

```yaml title=".github/workflows/deploy-serverize.yml" collapse={1-5, 12-14}
- name: Slack Notification
   uses: rtCamp/action-slack-notify@v2
   env:
      SLACK_CHANNEL: general
      SLACK_COLOR: ${{ job.status }}
      SLACK_MESSAGE: ${{ job.status == 'success' && 'Deployment successful' || 'Deployment failed' }}
      SLACK_TITLE: 'Deployment Status'
      SLACK_USERNAME: deployment
      SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

> Make sure to add `SLACK_WEBHOOK` as a repository secret, similar to SERVERIZE_API_TOKEN.

This simple addition can save a lot of time and provide peace of mind for your team.

### Outro

You can customize the workflow further to fit the unique needs of your project and make use of the GitHub Actions Marketplace to explore additional integrations.

Happy deploying! If you run into any issues or need further assistance, feel free to drop a message in our [Discord community](https://discord.gg/aj9bRtrmNt).

---
layout: ../../layouts/BlogPostLayout.astro
title: 'Secrets Management'
subtitle: 'Learn how to manage your project secrets'
author: 'Adam Koskovki'
date: '2024-10-22T00:00:00.000Z'
---

Secrets are secure pieces of data you can store and use at runtime, such as API keys, database passwords, or plaintext values. These are made available to your project as environment variables for use as needed.

> [!IMPORTANT]
> Secrets are encrypted before being stored in the database. However, due to the nature of Serverize, **avoid storing sensitive production data** (e.g., production database connection strings or API keys) as secrets.

## How Secrets Work

Serverize assigns secrets to channels, making them accessible to any release made under those channels.

## Setting Secrets

To set secrets for a channel, use the `secrets set` command along with the project name flag and channel.

```sh
npx serverize secrets set NAME=VALUE NAME=VALUE -p <project-name> -c <channel-name>
```

**Example: set single secret**

```sh
npx serverize secrets set API_KEY=12345 DB_PASSWORD=secret -p my-project -c dev
```

This command sets the `API_KEY` secret to `12345` for channel dev.

> [!NOTE]
> if channel not specified then it defaults to "dev"

**Example: set multiple secrets**

```sh
npx serverize secrets set API_KEY=12345 DB_PASSWORD=secret -p my-project
```

This command sets the `API_KEY` and `DB_PASSWORD` secrets for the project `my-project`.

## Setting Secrets from a File

You can also set secrets from a file, such as an `.env` file, using the `secrets set-file` command.

```sh
npx serverize secrets set-file <path-to-env-file> -p <project-name> -c preview
```

**Example:**

```sh
npx serverize secrets set-file .env -p my-project -c preview
```

This command reads the `.env` file and sets all the environment variables as secrets for the project `my-project` and channel `dev`

**Note:** Ensure that your `.env` file is properly formatted with `KEY=VALUE` pairs, each on a new line.

## List Secrets

List secrets that are set for your project channel. The list shows only the secret name; the value is not shown as it is a secret.

```sh
npx serverize secrets list -p <project-name> -c <channel-name>
```

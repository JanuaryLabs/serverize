---
navName: "`tokens`"
layout: ../../../layouts/DocsLayout.astro
title: npx serverize tokens
---
Manage deployment access tokens
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
## Usage
```sh frame="none"
npx serverize tokens [options] [command]
```
## Subcommands


### create
Generate a new access token for deploying projects in CI environment
#### Usage
```sh frame="none"
npx serverize tokens create [options]
```
#### Options


- `-p, --project-name <projectName>` (required): The project name
### list
List all active access tokens
#### Usage
```sh frame="none"
npx serverize tokens list [options]
```
### revoke
Permanently revoke an access token
#### Usage
```sh frame="none"
npx serverize tokens revoke [options] <token>
```
#### Arguments


- `token` **(required)**: Token to revoke
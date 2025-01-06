---
layout: ../../../layouts/DocsLayout.astro
title: npx serverize secrets
---
Manage project channel secrets
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
## Usage
```sh frame="none"
npx serverize secrets [options] [command]
```
## Subcommands


### set
Set one or more environment variables for a project channel
#### Usage
```sh frame="none"
npx serverize secrets set [options] <secrets...>
```
#### Arguments


- `secrets (variadic)` **(required)**: Secrets in format NAME=VALUE
#### Options


- `-p, --project-name <projectName>` (required): The project name
- `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)
### set-file
Import environment variables from a .env file
#### Usage
```sh frame="none"
npx serverize secrets set-file [options] <envFile>
```
#### Arguments


- `envFile` **(required)**: Path to the file with secrets
#### Options


- `-p, --project-name <projectName>` (required): The project name
- `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)
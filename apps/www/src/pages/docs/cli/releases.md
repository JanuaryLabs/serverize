---
navName: "`releases`"
layout: ../../../layouts/DocsLayout.astro
title: npx serverize releases
---
Manage project releases
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
## Usage
```sh frame="none"
npx serverize releases [options] [command]
```
## Subcommands


### list
List all releases for a project
#### Usage
```sh frame="none"
npx serverize releases list [options]
```
#### Options


- `-p, --project-name <projectName>` (required): The project name
- `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)
### terminate
Terminate a specific release
#### Usage
```sh frame="none"
npx serverize releases terminate [options]
```
#### Options


- `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)
- `-r, --release <release>` (required): Release name (default: `latest`)
- `-p, --project-name <projectName>` (required): The project name
### restart
Restart a specific release
#### Usage
```sh frame="none"
npx serverize releases restart [options]
```
#### Options


- `-p, --project-name <projectName>` (required): The project name
- `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)
- `-r, --release <release>` (required): Release name (default: `latest`)
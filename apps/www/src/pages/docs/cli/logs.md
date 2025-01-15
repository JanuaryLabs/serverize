---
navName: "`logs`"
layout: ../../../layouts/DocsLayout.astro
title: npx serverize logs
---
View logs for a specific project and release
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
## Usage
```sh frame="none"
npx serverize logs [options]
```
## Options


- `-p, --project-name <projectName>` (required): The project name
- `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)
- `-r, --release <release>` (required): Release name (default: `latest`)
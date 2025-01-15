---
navName: "`deploy`"
layout: ../../../layouts/DocsLayout.astro
title: npx serverize deploy
---
Deploy an application using a Dockerfile or Docker Compose file
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
## Usage
```sh frame="none"
npx serverize deploy [options]
```
## Options


- `-f, --file [dockerfilepath]`: Path to Dockerfile or Compose file (default: `Dockerfile`)
- `-o, --output-file <outputFile>` (required): Write output to a file
- `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)
- `--cwd [cwd]`: Project directory (default: `$(pwd)`)
- `-r, --release <release>` (required): Release name (default: `latest`)
- `-p, --project-name <projectName>` (required): The project name
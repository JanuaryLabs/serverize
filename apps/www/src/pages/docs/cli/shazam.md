---
navName: "`shazam`"
layout: ../../../layouts/DocsLayout.astro
title: npx serverize shazam
---
Detect and deploy a project using a Dockerfile or framework
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
## Usage
```sh frame="none"
npx serverize shazam [options]
```
## Options


- `-o, --output [file]`: Write output to a file
- `--cwd [cwd]`: Project directory (default: `$(pwd)`)
- `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)
- `-r, --release <release>` (required): Release name (default: `latest`)
- `-p, --project-name <projectName>` (required): The project name
- `--framework [framework]`: Framework to setup
- `--save`: Save the setup
- `--use-dockerfile-if-exists [useDockerfile]`: No description
- `-f, --file [dockerfilepath]`: Name of the Dockerfile or Compose file (default:"$(pwd)/Dockerfile")
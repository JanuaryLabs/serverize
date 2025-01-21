---
navName: "`deploy`"
layout: ../../../layouts/DocsLayout.astro
title: npx serverize deploy
---


| **Description** |  |
|------------------|----------------------------------|
| **Usage**        | `npx serverize deploy [options]` |

    
Deploy an application using a Dockerfile or Docker Compose file
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
| **Option** | **Description** | **Default** |
|------------|-----------------|-------------|
| `-f, --file [dockerfilepath]` | Path to Dockerfile or Compose file | `Dockerfile` |
| `-o, --output-file <outputFile>` | Write output to a file |  |
| `-c, --channel <channel>` | Channel name (dev or preview) | `dev` |
| `--cwd [cwd]` | Project directory | `$(pwd)` |
| `-r, --release <release>` | Release name | `latest` |
| `-p, --project-name <projectName>` | The project name |  |
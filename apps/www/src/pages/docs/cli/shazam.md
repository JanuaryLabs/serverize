---
navName: "`shazam`"
layout: ../../../layouts/DocsLayout.astro
title: npx serverize shazam
---


| **Description** |  |
|------------------|----------------------------------|
| **Usage**        | `npx serverize shazam [options]` |

    
Detect and deploy a project using a Dockerfile or framework
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
| **Option** | **Description** | **Default** |
|------------|-----------------|-------------|
| `--context [context]` | Docker build context | `.` |
| `-o, --output-file <outputFile>` | Write output to a file |  |
| `--cwd [cwd]` | Project directory | `$(pwd)` |
| `-c, --channel <channel>` | Channel name (dev or preview) | `dev` |
| `-r, --release <release>` | Release name | `latest` |
| `-p, --project-name <projectName>` | The project name |  |
| `-i, --image [image]` | Docker image to deploy. |  |
| `--framework [framework]` | Framework to setup |  |
| `--save` | Save the setup |  |
| `--use-dockerfile-if-exists` | Use existing Dockerfile if found in [cwd] | `false` |
| `-f, --file [dockerfilepath]` | Path to a Dockerfile relative to --cwd. ignored if --image is present (default:"$(pwd)/Dockerfile") |  |
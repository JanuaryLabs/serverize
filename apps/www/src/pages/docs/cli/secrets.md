---
navName: "`secrets`"
layout: ../../../layouts/DocsLayout.astro
title: npx serverize secrets
---


| **Description** | Manage project channel secrets |
|------------------|----------------------------------|
| **Usage**        | `npx serverize secrets [options] [command]` |

    
Secrets are secure pieces of data you can store and use at runtime, such as API keys, database passwords, or plaintext values. These are made available to your project as environment variables for use as needed.
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
### `set`


| **Description** |  |
|------------------|----------------------------------|
| **Usage**        | `npx serverize secrets set [options] <secrets...>` |

    
Set one or more environment variables for a project channel
| **Option** | **Description** | **Default** |
|------------|-----------------|-------------|
| `-p, --project-name <projectName>` | The project name |  |
| `-c, --channel <channel>` | Channel name (dev or preview) | `dev` |
### `set-file`


| **Description** |  |
|------------------|----------------------------------|
| **Usage**        | `npx serverize secrets set-file [options] <envFile>` |

    
Import environment variables from a .env file
| **Option** | **Description** | **Default** |
|------------|-----------------|-------------|
| `-p, --project-name <projectName>` | The project name |  |
| `-c, --channel <channel>` | Channel name (dev or preview) | `dev` |
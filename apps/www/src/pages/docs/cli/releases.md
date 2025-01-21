---
navName: "`releases`"
layout: ../../../layouts/DocsLayout.astro
title: npx serverize releases
---


| **Description** | Manage project releases |
|------------------|----------------------------------|
| **Usage**        | `npx serverize releases [options] [command]` |

    
A release represents a specific version of your deployment within a channel. Each release has a unique name and URL, allowing you to manage multiple versions of your application.
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
### `list`


| **Description** | List all releases for a project |
|------------------|----------------------------------|
| **Usage**        | `npx serverize releases list [options]` |

    
| **Option** | **Description** | **Default** |
|------------|-----------------|-------------|
| `-p, --project-name <projectName>` | The project name |  |
| `-c, --channel <channel>` | Channel name (dev or preview) | `dev` |
### `terminate`


| **Description** | Terminate a specific release |
|------------------|----------------------------------|
| **Usage**        | `npx serverize releases terminate [options]` |

    
| **Option** | **Description** | **Default** |
|------------|-----------------|-------------|
| `-c, --channel <channel>` | Channel name (dev or preview) | `dev` |
| `-r, --release <release>` | Release name | `latest` |
| `-p, --project-name <projectName>` | The project name |  |
### `restart`


| **Description** | Restart a specific release |
|------------------|----------------------------------|
| **Usage**        | `npx serverize releases restart [options]` |

    
| **Option** | **Description** | **Default** |
|------------|-----------------|-------------|
| `-p, --project-name <projectName>` | The project name |  |
| `-c, --channel <channel>` | Channel name (dev or preview) | `dev` |
| `-r, --release <release>` | Release name | `latest` |
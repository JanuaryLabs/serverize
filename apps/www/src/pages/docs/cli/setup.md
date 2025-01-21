---
navName: "`setup`"
layout: ../../../layouts/DocsLayout.astro
title: npx serverize setup
---


| **Description** | Automatically create Dockerfile from your codebase |
|------------------|----------------------------------|
| **Usage**        | `npx serverize setup [options] [command]` |

    
The setup command inspects your project and sets up the necessary configurations.
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
### `list`


| **Description** | List all supported frameworks |
|------------------|----------------------------------|
| **Usage**        | `npx serverize setup list [options]` |

    
### `init`


| **Description** | Create Dockerfile for a framework |
|------------------|----------------------------------|
| **Usage**        | `npx serverize setup init [options] [framework]` |

    
| **Option** | **Description** | **Default** |
|------------|-----------------|-------------|
| `-f, --force` | Force setup |  |
| `--cwd [cwd]` | Project directory | `$(pwd)` |
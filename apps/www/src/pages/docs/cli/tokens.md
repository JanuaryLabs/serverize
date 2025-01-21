---
navName: "`tokens`"
layout: ../../../layouts/DocsLayout.astro
title: npx serverize tokens
---


| **Description** | Manage access tokens for CI/CD |
|------------------|----------------------------------|
| **Usage**        | `npx serverize tokens [options] [command]` |

    
Tokens are used to authenticate and authorize deployments in continuous integration environments, allowing secure automated deployments without exposing sensitive credentials.
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
### `create`


| **Description** | Generate a new token |
|------------------|----------------------------------|
| **Usage**        | `npx serverize tokens create [options]` |

    
| **Option** | **Description** | **Default** |
|------------|-----------------|-------------|
| `-p, --project-name <projectName>` | The project name |  |
### `list`


| **Description** | List all active access tokens |
|------------------|----------------------------------|
| **Usage**        | `npx serverize tokens list [options]` |

    
### `revoke`


| **Description** | Permanently revoke an access token |
|------------------|----------------------------------|
| **Usage**        | `npx serverize tokens revoke [options] <token>` |
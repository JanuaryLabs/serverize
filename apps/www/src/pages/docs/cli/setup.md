---
layout: ../../../layouts/DocsLayout.astro
title: npx serverize setup
---
Automatically create Dockerfile from your codebase
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
## Usage
```sh frame="none"
npx serverize setup [options] [command]
```
## Subcommands


### list
List all supported frameworks
#### Usage
```sh frame="none"
npx serverize setup list [options]
```
### init
Create Dockerfile for a framework
#### Usage
```sh frame="none"
npx serverize setup init [options] [framework]
```
#### Arguments


- `framework` **(required)**: Framework to setup
#### Options


- `-f, --force`: Force setup
- `--cwd [cwd]`: Project directory (default: `$(pwd)`)
---
navName: "`auth`"
layout: ../../../layouts/DocsLayout.astro
title: npx serverize auth
---
Access Serverize by signing up for a new account using the auth signup command or logging in with the auth signin command if you already have an account. To disconnect, use the auth logout command.
> [!TIP]
> Arguments or options enclosed in `<>` are required, while those enclosed in `[]` are optional.
 
## Usage
```sh frame="none"
npx serverize auth [options] [command]
```
## Subcommands


### signin
Sign in to your Serverize account
#### Usage
```sh frame="none"
npx serverize auth signin [options]
```
### signup
Sign up for a new Serverize account
#### Usage
```sh frame="none"
npx serverize auth signup [options]
```
### signout
Sign out of your Serverize account
#### Usage
```sh frame="none"
npx serverize auth signout [options]
```
### whoami
Show the currently authenticated user
#### Usage
```sh frame="none"
npx serverize auth whoami [options]
```
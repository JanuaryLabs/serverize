---
layout: ../../../layouts/DocsLayout.astro
title: 'Deploy Nuxt.js to Serverize'
subtitle: 'Learn how to deploy your Nuxt.js application to Serverize'
---

## Quick Start

Automatically configure your Nuxt.js project:

```sh
npx serverize --framework nuxtjs
```

Or use the setup command:

```sh
npx serverize setup nuxtjs
```

> [!TIP]
> Check the [source code](https://github.com/serverize/example-nuxtjs) for a complete example.

## Manual Setup

1. Create a Dockerfile:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.output ./
EXPOSE 3000
CMD ["node", "server/index.mjs"]
```

2. Add .dockerignore:

```
node_modules
.nuxt
.output
.git
```

## Environment Variables

Set runtime config in your nuxt.config.ts:

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE
    },
    dbUrl: process.env.DATABASE_URL
  }
})
```

Then set the variables:

```sh
npx serverize secrets set API_BASE=https://api.example.com DATABASE_URL=postgres://... -p <project-name>
```

## Deploy

Deploy your Nuxt.js application:

```sh
npx serverize deploy -p <project-name>
```
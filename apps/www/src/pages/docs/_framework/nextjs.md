
---
layout: ../../../layouts/DocsLayout.astro
title: 'Deploy Next.js to Serverize'
subtitle: 'Learn how to deploy your Next.js application to Serverize'
---

## Quick Start

Automatically configure your Next.js project:

```sh
npx serverize --framework nextjs
```

Or use the setup command:

```sh
npx serverize setup nextjs
```

> [!TIP]
> Check the [source code](https://github.com/serverize/example-nextjs) for a complete example.

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
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

2. Update next.config.js:

```js
/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone'
}
```

3. Add .dockerignore:

```
node_modules
.next
.git
```

## Environment Variables

Set environment variables for your Next.js app:

```sh
npx serverize secrets set DATABASE_URL=postgres://... NEXT_PUBLIC_API_URL=https://api.example.com -p <project-name>
```

## Deploy

Deploy your Next.js application:

```sh
npx serverize deploy -p <project-name>
```
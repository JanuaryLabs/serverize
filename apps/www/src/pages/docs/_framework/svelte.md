---
layout: ../../../layouts/DocsLayout.astro
title: 'Deploy Svelte to Serverize'
subtitle: 'Learn how to deploy your Svelte application to Serverize'
---

## Quick Start

Automatically configure your Svelte project:

```sh
npx serverize --framework svelte
```

Or use the setup command for more options:

```sh
npx serverize setup svelte
```

> [!TIP]
> Check the [source code](https://github.com/serverize/example-svelte) for a complete example.

## Manual Setup

1. Create a Dockerfile:

```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
```

2. Create nginx.conf:

```nginx
server {
    listen 3000;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

3. Add .dockerignore:

```
node_modules
build
.git
```

## Environment Variables

For SvelteKit with Vite, prefix your variables with `VITE_`:

```sh
npx serverize secrets set VITE_API_URL=https://api.example.com -p <project-name>
```

## Deploy

Deploy your Svelte application:

```sh
npx serverize deploy -p <project-name>
```

## CI/CD Integration

For automated deployments using GitHub Actions, refer to our [CI/CD guide](../deploy/ci-cd.md).

---
layout: ../../../layouts/DocsLayout.astro
title: 'Deploy Angular to Serverize'
subtitle: 'Learn how to deploy your Angular application to Serverize'
---

## Quick Start

Automatically configure your Angular project:

```sh
npx serverize --framework angular
```

Or use the setup command for customization:

```sh
npx serverize setup angular
```

> [!TIP]
> Check the [source code](https://github.com/serverize/example-angular) for a complete example.

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
COPY --from=builder /app/dist/*/browser /usr/share/nginx/html
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
dist
.git
```

## Environment Variables

For Angular, create an environment configuration:

```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  apiUrl: process.env['API_URL']
};
```

Then set it:

```sh
npx serverize secrets set API_URL=https://api.example.com -p <project-name>
```

## Deploy

Deploy your Angular application:

```sh
npx serverize deploy -p <project-name>
```

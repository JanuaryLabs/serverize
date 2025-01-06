---
layout: ../../../layouts/DocsLayout.astro
title: 'Deploy React to Serverize'
subtitle: 'Learn how to deploy your React application to Serverize'
---

## Quick Start

Serverize can automatically configure your React project for deployment:

```sh
npx serverize --framework react
```

Or use the setup command for more customization options:

```sh
npx serverize setup react
```

> [!TIP]
> Check the [source code](https://github.com/serverize/example-react) for a complete example.

## Manual Setup

1. Create a Dockerfile in your project root:

```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
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

For Create React App, prefix your environment variables with `REACT_APP_`:

```sh
npx serverize secrets set REACT_APP_API_URL=https://api.example.com -p <project-name>
```

For Vite, use the `VITE_` prefix:

```sh
npx serverize secrets set VITE_API_URL=https://api.example.com -p <project-name>
```

## Deploy

Deploy your React application:

```sh
npx serverize deploy -p <project-name>
```

## CI/CD Integration

For automated deployments with GitHub Actions, refer to our [CI/CD guide](../deploy/ci-cd.md).

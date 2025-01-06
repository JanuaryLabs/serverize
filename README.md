## Serverize - One step Docker deployment

Serverize facilitates the creation of **development**, **testing**, and **preview** environments, each tailored to empower different phases of the product lifecycle without unnecessary complexity.

It uses Docker to package your application and deploy it to a unique URL, allowing you to share your work with others or test it in a production-like environment.

## Zero Config Deployment

Serverize is built to be as simple as possible and aspires to simplify the deployment process for developers. It can be used with any framework or language, as long as you have a Dockerfile that exposes a HTTP port.

Core part of Serverize is the implicit auto setup feature, which can detect the framework you are using and try to set the project up.

The logic is encapsulated in the following command.

```sh
npx serverize
```

That is being said, only number of frameworks are supported at the moment including:

- Node.js
- Deno
- Bun
- Nuxt.js
- Astro
- Next.js
- [and more](./packages/dockerfile/src/lib/frameworks)


Bear in mind that you still can customize the Dockerfile to fit your needs.

## Auto Setup

Building on the zero config concept you can use the setup command to choose the framework you are using and let Serverize write the Dockerfile for that can be customized later.

```sh frame=none
npx serverize setup [framework]
```

Where `framework` is the framework you want to setup, if not provided, serverize will try to guess it otherwise it'll ask you.

**Example:**

1. **Setup Deno**

```sh frame=none
npx serverize setup deno
```

This command will add Dockerfile as well as dockerignore to your project.

2. **Setup Astro**

```sh frame=none
npx serverize setup astro
```

3. **Setup Nuxt**

```sh frame=none
npx serverize setup nuxt
```

4. **Auto setup:**

```sh frame=none
npx serverize setup
```


## Project structure

1. [CLI tool](./packages/serverize) to manage your projects, channels, releases, ...etc.
2. [API](./apps/api/) that handles the deployment process.
3. [API client](./packages/client) to interact with serverize through the API.
4. [dockerfile primitives](./packages/dockerfile) to help you build your dockerfile.

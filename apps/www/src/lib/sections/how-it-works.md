# How it works

Serverize makes your local setup available in the cloud. You’ve got your Dockerfile? Great. With one command, Serverize builds your image, deploys it, and sends you the access details.

Here’s a typical flow:

1. The developer writes code and prepares their Dockerfile.
2. Command `npx serverize deploy -p project-winter` deploys the project.
3. Serverize builds and hosts the environment in the cloud, making it immediately accessible for testing and integration.

Sample Commands:

- To deploy a project: `npx serverize -p project-winter deploy`
- Watch mode: `npx serverize -p project-winter deploy --watch`
- Set secrets: `npx serverize -p project-winter secrets set NAME=VALUE`

_FYI, watch mode doesn’t work with big images. See below_

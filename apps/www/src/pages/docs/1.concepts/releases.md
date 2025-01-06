---
layout: ../../../layouts/DocsLayout.astro
title: 'Releases'
subtitle: 'Managing different versions of your deployments'
---

A release represents a specific version of your deployment within a channel. Each release has a unique name and URL, allowing you to manage multiple versions of your application.

## Release Concepts

- Default Release

  - Every channel has a default release named `latest`
  - The `latest` release name is omitted from URLs

- Named Releases
  - Custom names for specific versions
  - Useful for feature branches or pull requests
  - Appear in the deployment URL

## URL Structure

Release URLs follow this pattern:

```
https://<project>-<channel>-<org>-<release>.january.sh
```

Examples:

```
https://api-dev-acme.january.sh         # Latest release (default)
https://api-dev-acme-clientwinter.january.sh      # Named release
https://api-preview-acme-pr123.january.sh  # PR preview
```

> [!IMPORTANT]
> When using the default `latest` release, the release name is omitted from the URL.

## Managing Releases

### Creating Releases

A release is created when you deploy your project.

```sh frame=none
npx serverize deploy -p <project> -c <channel> -r <release-name>
```

Optional parameters:

- `-c <channel>`: Target channel (default: `dev`)
- `-r <release-name>`: Release name (default: `latest`)

### List Releases

```sh frame=none
npx serverize releases list -p <project> -c <channel>
```

### Terminate Releases

```sh frame=none
npx serverize releases terminate -p <project> -c <channel> -r <release-name>
```

### Auto-Termination

```sh frame=none
# Release will terminate after 1 hour
npx serverize deploy -p backend-api -c preview -r test --terminate-after 1h
```

---

- Learn about [CI/CD Integration](../deploy/ci-cd)
- Configure [Preview Deployments](../deploy/deployment-previews)
- Explore [Secrets Management](./secrets)

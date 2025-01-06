---
layout: ../../../layouts/DocsLayout.astro
title: 'Channels'
subtitle: 'Understanding deployment channels in Serverize'
---

Channels in Serverize help organize your deployments into distinct environments. Each project comes with two built-in channels that serve different purposes.

- `dev`: Your primary development environment for main/trunk branches
- `preview`: Temporary deployments for testing features, pull requests, or demos

Each of which maintains its own:

- Secrets (aka environment variables)
- Release history
- Configuration settings

> [!NOTE]
> Channel creation is not currently supported. You get `dev` and `preview` channels by default.
> [!TIP]
> The channel name is optional in the CLI commands. If omitted, the default channel (dev) is used.

<!-- ### Channel Behavior -->

<!-- **Development Channel (`dev`)**

- Primary deployment environment
- Always-on deployments
- Used for main/trunk branch deployments

**Preview Channel (`preview`)**

- Temporary deployments
- Auto-sleeps after 5 minutes of inactivity
- Ideal for feature branches and pull requests -->

## Managing Secrets

Each channel has its own secrets:

```sh frame=none
# Development secrets
npx serverize secrets set DATABASE_URL=dev-db -p api -c dev

# Preview secrets
npx serverize secrets set DATABASE_URL=preview-db -p api -c preview
```

See the [Secrets](./secrets) page for more information.

---

- Learn about [Releases](./releases) for version management
- Explore [CI/CD Integration](../deploy/ci-cd) for automated deployments

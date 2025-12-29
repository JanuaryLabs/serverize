# Self-Hosting Serverize

Run Serverize on your own infrastructure for full control over your deployments.

## Overview

Self-hosting Serverize gives you:

- Full control over your data and deployments
- Custom domain support with automatic SSL
- No usage limits or restrictions
- Private network deployments

### Architecture

```
                    ┌─────────────┐
                    │   Traefik   │ :80, :443
                    │ (proxy/SSL) │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌───────────┐    ┌───────────┐    ┌───────────┐
   │    API    │    │    TUS    │    │  Sablier  │
   │   :3000   │    │   :8080   │    │  :10000   │
   └─────┬─────┘    └───────────┘    └───────────┘
         │           (uploads)      (lifecycle)
         ▼
   ┌───────────┐
   │ PostgreSQL│
   │   :5432   │
   └───────────┘
```

## Requirements

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Node.js LTS](https://nodejs.org/)
- PostgreSQL 16+
- [Firebase project](https://console.firebase.google.com/) (for authentication)
- Domain with wildcard DNS (recommended for production)

## Quick Start

### 1. Clone the repository

```sh
git clone https://github.com/JanuaryLabs/serverize.git
cd serverize
```

### 2. Configure environment

Create `.env.api` in the `docker/` directory:

```sh
# Required
CONNECTION_STRING=postgresql://serverize:serverize@postgres:5432/serverize
FIREBASE_AUTH_SERVICE_ACCOUNT_KEY=<base64-encoded-service-account-json>

# Optional
NODE_ENV=production
PORT=3000
```

### 3. Start services

```sh
cd docker
docker compose up -d
```

The API will be available at `http://localhost:3000`.

## Environment Variables

### Required

| Variable                            | Description                                  |
| ----------------------------------- | -------------------------------------------- |
| `CONNECTION_STRING`                 | PostgreSQL connection URL                    |
| `FIREBASE_AUTH_SERVICE_ACCOUNT_KEY` | Base64-encoded Firebase service account JSON |

### Optional

| Variable             | Default              | Description                   |
| -------------------- | -------------------- | ----------------------------- |
| `PORT`               | `3000`               | API server port               |
| `NODE_ENV`           | `development`        | Environment mode              |
| `UPLOAD_DIR`         | `/serverize/uploads` | Directory for uploaded images |
| `ORM_SYNCHRONIZE`    | `false`              | Auto-sync database schema     |
| `ORM_MIGRATIONS_RUN` | `false`              | Run migrations on startup     |
| `ORM_LOGGING`        | `false`              | Enable database query logging |

## Services

| Service    | Port    | Purpose                                        |
| ---------- | ------- | ---------------------------------------------- |
| API        | 3000    | Main Serverize API                             |
| Traefik    | 80, 443 | Reverse proxy, SSL termination, routing        |
| PostgreSQL | 5432    | Database                                       |
| TUS        | 8080    | Chunked file uploads                           |
| Sablier    | 10000   | Container lifecycle management (idle shutdown) |

## Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Go to Project Settings > Service Accounts
3. Generate a new private key (JSON)
4. Base64 encode the JSON file:

```sh
base64 -i service-account.json
```

5. Set the output as `FIREBASE_AUTH_SERVICE_ACCOUNT_KEY`

### Database Setup

For development, PostgreSQL runs in Docker. For production, use a managed database:

```sh
# Connection string format
postgresql://user:password@host:5432/database
```

Run migrations on first setup:

```sh
ORM_MIGRATIONS_RUN=true docker compose up -d api
```

### Custom Domain

1. Point your domain's DNS to your server:

   - `A` record: `yourdomain.com` -> `your-server-ip`
   - `A` record: `*.yourdomain.com` -> `your-server-ip`

2. Update Traefik configuration in `docker/traefik.yml`:

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

3. Update domain references in `docker/compose.yml`

### SSL/TLS

Traefik handles SSL automatically with Let's Encrypt. Certificates are stored in `docker/letsencrypt/`.

For local development, use the provided `traefik.local.yml` which skips SSL.

## Docker Compose Files

| File                          | Purpose                                  |
| ----------------------------- | ---------------------------------------- |
| `docker/compose.yml`          | Production configuration                 |
| `docker/compose.override.yml` | Development overrides (local PostgreSQL) |
| `docker/traefik.yml`          | Production Traefik config                |
| `docker/traefik.local.yml`    | Development Traefik config               |

### Development

```sh
cd docker
docker compose up -d
```

This uses `compose.override.yml` automatically, which includes a local PostgreSQL instance.

### Production

```sh
cd docker
docker compose -f compose.yml up -d
```

## Production Considerations

### Resource Limits

Default container limits in `compose.yml`:

```yaml
deploy:
  resources:
    limits:
      memory: 96M
```

Adjust based on your workload.

### Log Management

Logs are configured with rotation:

```yaml
logging:
  options:
    max-size: '50m'
    max-file: '5'
```

### Backups

Back up your PostgreSQL database regularly:

```sh
docker exec postgres pg_dump -U serverize serverize > backup.sql
```

### Health Checks

The API exposes a health endpoint:

```sh
curl http://localhost:3000/health
```

## Troubleshooting

### Database connection fails

1. Verify PostgreSQL is running: `docker compose ps`
2. Check connection string format
3. Ensure database exists and user has permissions

### Firebase authentication errors

1. Verify service account JSON is valid
2. Ensure it's properly base64 encoded
3. Check Firebase project settings

### Traefik not routing

1. Check Traefik logs: `docker compose logs traefik`
2. Verify DNS records
3. Check SSL certificate status in `docker/letsencrypt/`

## Updating

```sh
git pull
docker compose down
docker compose build
docker compose up -d
```

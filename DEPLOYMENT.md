# Deployment Guide

## Live Instance

**URL**: https://commitquest.webartisan.id

**Stack**:
- Next.js 15.1 (Docker)
- PostgreSQL 16
- Caddy (auto SSL)

## Quick Deploy (From Local)

```bash
# Push to main branch - GitHub Actions auto-deploys
git push origin main
# Takes ~3-4 minutes
```

## Quick Deploy (From VPS)

```bash
# SSH into VPS
ssh webartisan

# Run deploy script
cd ~/commitquest && ./deploy.sh
```

## What the deploy script does:

1. Pulls latest code from GitHub
2. Builds new Docker image
3. Restarts the app container
4. Updates database schema
5. Shows container status and logs

## GitHub Actions CI/CD

The `.github/workflows/deploy.yml` workflow:
1. Triggers on push to `main`
2. Builds Docker image
3. Pushes to `ghcr.io/devtama101/commitquest:latest`
4. SSHs into VPS
5. Pulls new image
6. Restarts containers
7. Runs Prisma migrations

## VPS Access

### SSH Configuration

Your local `~/.ssh/config` should have:
```
Host webartisan
    HostName 103.189.234.117
    User tamatopik
    Port 22
    IdentityFile ~/.ssh/id_ed25519
```

### Quick Commands

```bash
# SSH into VPS
ssh webartisan

# View all containers
cd ~/commitquest && docker compose ps

# View app logs
cd ~/commitquest && docker compose logs -f app

# Restart all services
cd ~/commitquest && docker compose restart

# Stop all services
cd ~/commitquest && docker compose down
```

## Environment Variables (on VPS)

Located in `~/commitquest/.env`:

```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/commitquest
AUTH_SECRET=your-secret-key
AUTH_URL=https://commitquest.webartisan.id
WEBHOOK_BASE_URL=https://commitquest.webartisan.id
AUTH_GITHUB_ID=xxx
AUTH_GITLAB_ID=xxx
AUTH_GITLAB_SECRET=xxx
DOMAIN=commitquest.webartisan.id
POSTGRES_PASSWORD=xxx
```

See `VPS_CREDENTIALS.md` for actual credentials.

## Docker Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| app | commitquest-app | 3000 | Next.js application |
| postgres | commitquest-postgres | 5432 | PostgreSQL database |
| caddy | commitquest-caddy | 80, 443 | Reverse proxy with auto SSL |

## Database

- **Type**: PostgreSQL 16
- **Container**: commitquest-postgres
- **Database**: commitquest
- **User**: postgres
- **Password**: See `VPS_CREDENTIALS.md`

### Access Database

```bash
ssh webartisan
cd ~/commitquest
docker compose exec postgres psql -U postgres -d commitquest
```

## Troubleshooting

### App not responding

```bash
ssh webartisan
cd ~/commitquest
docker compose logs app --tail 50
```

### Database issues

```bash
ssh webartisan
cd ~/commitquest
docker compose restart postgres
docker compose logs postgres --tail 50
```

### Redeploy previous version

```bash
ssh webartisan
cd ~/commitquest
# Check image history
docker images | grep commitquest
# Edit docker-compose.yml to use specific image tag
docker compose pull
docker compose up -d
```

## SSL/TLS

Caddy automatically handles SSL certificates via Let's Encrypt. No manual configuration needed.

## GitHub Actions Secrets

Repository: `devtama101/commitquest`

| Secret | Description |
|--------|-------------|
| VPS_HOST | 103.189.234.117 |
| VPS_USER | tamatopik |
| VPS_PORT | 22 |
| VPS_SSH_KEY | Private SSH key |
| APP_URL | https://commitquest.webartisan.id |
| DOMAIN | commitquest.webartisan.id |
| AUTH_SECRET | Auth.js secret |
| POSTGRES_PASSWORD | PostgreSQL password |
| AUTH_GITHUB_ID | GitHub OAuth client ID |
| AUTH_GITHUB_SECRET | GitHub OAuth client secret |
| AUTH_GITLAB_ID | GitLab OAuth app ID |
| AUTH_GITLAB_SECRET | GitLab OAuth app secret |

## Deployment Time

- **GitHub Actions build**: ~2 minutes
- **VPS pull & restart**: ~1 minute
- **Total**: ~3-4 minutes from push to live

# Deployment Guide

## Quick Deploy (VPS)

SSH into your VPS and run:
```bash
~/commitquest/deploy.sh
```

Or from your local machine:
```bash
ssh webartisan
cd ~/commitquest && ./deploy.sh
```

## What the deploy script does:

1. Pulls latest code from GitHub
2. Builds new Docker image
3. Restarts the app container
4. Updates database schema
5. Shows container status and logs

## Access the App

- **URL**: https://commitquest.webartisan.id
- **SSH**: `ssh webartisan` (uses ~/.ssh/config alias)

## Container Management

```bash
# SSH into VPS
ssh webartisan

# View all containers
cd ~/commitquest && docker compose ps

# View logs
cd ~/commitquest && docker compose logs -f app

# Restart all services
cd ~/commitquest && docker compose restart

# Stop all services
cd ~/commitquest && docker compose down
```

## Database

- **Type**: PostgreSQL 16
- **Container**: commitquest-postgres
- **Password**: vs3bOR9oE+7g2L4ArMl+P7ubnNk44nZR

## Secrets (save these!)

```
PostgreSQL Password: vs3bOR9oE+7g2L4ArMl+P7ubnNk44nZR
Auth Secret: acm2fwrBv+kZw0t7tX1RxTpJc8BPW8aBTwi5sO7+Dgk=
```

## Environment Variables (on VPS)

Located in `~/commitquest/.env`:
- `DATABASE_URL` - PostgreSQL connection
- `AUTH_SECRET` - NextAuth secret
- `AUTH_URL` - https://commitquest.webartisan.id
- `WEBHOOK_BASE_URL` - https://commitquest.webartisan.id
- `AUTH_GITHUB_ID/SECRET` - GitHub OAuth
- `AUTH_GITLAB_ID/SECRET` - GitLab OAuth

## SSH Config (on your local machine)

Located at `~/.ssh/config`:
```
Host webartisan
    HostName 103.189.234.117
    User tamatopik
    Port 22
    IdentityFile ~/.ssh/id_ed25519
```

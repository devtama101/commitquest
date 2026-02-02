# Automated Deployment Workflow for CommitQuest

## Status: ✅ COMPLETED

**Live URL**: https://commitquest.webartisan.id

---

## Summary

Automated deployment to Ubuntu/Debian VPS using GitHub Actions + Docker Compose with PostgreSQL database and automatic SSL via Caddy reverse proxy.

## Architecture (Implemented)

```
GitHub (push to main)
    ↓
GitHub Action (build & push Docker image to ghcr.io)
    ↓
VPS (SSH + pull image)
    ↓
Docker Compose runs:
    - Next.js app (port 3000)
    - PostgreSQL (port 5432)
    - Caddy reverse proxy (ports 80/443) → auto SSL
```

---

## Files Created

### 1. ✅ `Dockerfile`
Multi-stage Node.js build for Next.js production with Turbopack.

### 2. ✅ `docker-compose.yml`
Orchestrates 3 services:
- `app`: Next.js application
- `postgres`: PostgreSQL database
- `caddy`: Reverse proxy with automatic HTTPS

### 3. ✅ `.dockerignore`
Excludes dev files from Docker build context.

### 4. ✅ `.github/workflows/deploy.yml`
GitHub Actions workflow that:
- Triggers on push to `main`
- Builds Docker image
- Pushes to `ghcr.io/devtama101/commitquest:latest`
- SSH into VPS to deploy
- Runs Prisma migrations

### 5. ✅ `deploy.sh`
Manual deployment script on VPS for fallback.

---

## Configuration Details

### Database
- **Provider**: PostgreSQL 16
- **Connection**: Via Docker network
- **Persistence**: Docker volume `postgres-data`

### SSL/HTTPS
- **Provider**: Caddy
- **Method**: Automatic Let's Encrypt
- **Domains**: commitquest.webartisan.id

### Environment Variables
Located in `~/commitquest/.env` on VPS:
```bash
DATABASE_URL=postgresql://postgres:password@postgres:5432/commitquest
AUTH_SECRET=xxx
AUTH_URL=https://commitquest.webartisan.id
WEBHOOK_BASE_URL=https://commitquest.webartisan.id
DOMAIN=commitquest.webartisan.id
AUTH_GITHUB_ID=xxx
AUTH_GITHUB_SECRET=xxx
AUTH_GITLAB_ID=xxx
AUTH_GITLAB_SECRET=xxx
POSTGRES_PASSWORD=xxx
```

---

## Deployment Process

### Automatic (CI/CD)
```bash
git push origin main
# ~3-4 minutes later, site is updated
```

### Manual (VPS)
```bash
ssh webartisan
cd ~/commitquest && ./deploy.sh
```

---

## VPS Details

- **IP**: 103.189.234.117
- **User**: tamatopik
- **SSH Alias**: `webartisan`
- **OS**: Ubuntu 24.x
- **Location**: ~/commitquest

See `VPS_CREDENTIALS.md` for full credentials.

---

## Verification

- [x] Docker build works
- [x] GitHub Actions workflow runs
- [x] VPS can pull from ghcr.io
- [x] PostgreSQL persists data
- [x] Caddy provides SSL
- [x] Webhooks work (https://commitquest.webartisan.id/api/webhooks/...)
- [x] OAuth callbacks work
- [x] GitLab token refresh works

---

## Rollback Plan

If deployment fails:
1. GitHub Action retains previous Docker image tags
2. Run `docker-compose down && docker-compose pull && docker-compose up -d` with previous tag
3. Database migrations can be reverted if needed

---

## File Checklist

- [x] `Dockerfile` ✅
- [x] `docker-compose.yml` ✅
- [x] `.dockerignore` ✅
- [x] `.github/workflows/deploy.yml` ✅
- [x] `deploy.sh` ✅
- [x] `next.config.ts` (standalone output) ✅
- [x] `prisma/schema.prisma` (PostgreSQL URL) ✅

---

**Deploy Date**: February 2025
**Status**: ✅ Production Ready

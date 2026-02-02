# Automated Deployment Workflow for CommitQuest

## Summary
Automated deployment to your Ubuntu/Debian VPS using GitHub Actions + Docker Compose with PostgreSQL database and automatic SSL via Caddy reverse proxy.

## Architecture

```
GitHub (push to main)
    ↓
GitHub Action (build & push Docker image)
    ↓
VPS (pulls image via SSH or watchtower)
    ↓
Docker Compose runs:
    - Next.js app (port 3000)
    - PostgreSQL (port 5432)
    - Caddy reverse proxy (ports 80/443) → auto SSL
```

## Files to Create

### 1. `Dockerfile` (new)
Multi-stage Node.js build for Next.js production with Turbopack.

### 2. `docker-compose.yml` (new)
Orchestrates 3 services:
- `app`: Next.js application
- `postgres`: PostgreSQL database
- `caddy`: Reverse proxy with automatic HTTPS

### 3. `.dockerignore` (new)
Excludes dev files from Docker build context.

### 4. `.github/workflows/deploy.yml` (new)
GitHub Actions workflow that:
- Triggers on push to `main`
- Builds Docker image
- Pushes to container registry (GitHub Packages)
- SSH into VPS to deploy
- Runs Prisma migrations

### 5. `.env.production` template (new)
Production environment variables template.

## Critical Files to Modify

### 1. `prisma/schema.prisma`
- Update `DATABASE_URL` to point to PostgreSQL
- Change from `file:./dev.db` to PostgreSQL connection string

### 2. `next.config.ts`
- Ensure `AUTH_URL` and `WEBHOOK_BASE_URL` use production domain
- Add `output: 'standalone'` for optimal Docker image size

### 3. `.env` on VPS
- Set `DATABASE_URL=postgresql://postgres:password@postgres:5432/commitquest`
- Set `AUTH_URL=https://your-domain.com`
- Set `WEBHOOK_BASE_URL=https://your-domain.com`
- Add production `AUTH_SECRET`
- Add GitHub/GitLab OAuth credentials

## Step-by-Step Implementation

### Phase 1: VPS Preparation (one-time manual setup)
1. Install Docker and Docker Compose on VPS
2. Create `deploy` user or use existing SSH access
3. Set up SSH key for GitHub Actions
4. Configure firewall (allow 80, 443)

### Phase 2: Create Docker Configuration
1. Create `Dockerfile` with:
   - Node 20 Alpine base
   - Multi-stage build (deps → build → production)
   - Prisma generation during build
   - Standalone output for minimal image

2. Create `docker-compose.yml` with:
   - App service (build context, env vars, depends on postgres)
   - PostgreSQL service (persistent volume, credentials)
   - Caddy service (reverse proxy, auto SSL, volume for certs)

### Phase 3: Create CI/CD Pipeline
1. Create `.github/workflows/deploy.yml` with:
   - Trigger: push to `main`
   - Build and push Docker image to GitHub Container Registry
   - SSH step to run `docker-compose pull && docker-compose up -d`
   - Run `npx prisma migrate deploy` for database migrations

### Phase 4: Domain & SSL
1. Caddy automatically handles SSL via Let's Encrypt
2. Configure `Caddyfile` (in docker-compose) to:
   - Proxy `http://app:3000` to `https://your-domain.com`

### Phase 5: Environment Variables
Create `.env.production` on VPS with:
```bash
DATABASE_URL=postgresql://postgres:your-password@postgres:5432/commitquest
AUTH_SECRET=your-production-secret
AUTH_URL=https://your-domain.com
WEBHOOK_BASE_URL=https://your-domain.com
AUTH_GITHUB_ID=xxx
AUTH_GITHUB_SECRET=xxx
AUTH_GITLAB_ID=xxx
AUTH_GITLAB_SECRET=xxx
```

## Verification Steps

1. **Local Test**: Build Docker image locally and test
2. **Deploy Test**: Push to `main`, verify GitHub Action succeeds
3. **Database Check**: Connect to PostgreSQL, verify schema via Prisma Studio
4. **SSL Check**: Visit `https://your-domain.com`, verify certificate
5. **Auth Test**: Login with GitHub/GitLab OAuth
6. **Webhook Test**: Configure GitHub webhook to push commits

## Rollback Plan

If deployment fails:
1. GitHub Action retains previous Docker image tags
2. Run `docker-compose down && docker-compose pull && docker-compose up -d` with previous tag
3. Database migrations can be reverted if needed

## File Checklist

- [ ] `Dockerfile`
- [ ] `docker-compose.yml`
- [ ] `.dockerignore`
- [ ] `.github/workflows/deploy.yml`
- [ ] `.env.production.template`
- [ ] Update `next.config.ts` (add standalone output)
- [ ] Update `prisma/schema.prisma` (PostgreSQL URL)

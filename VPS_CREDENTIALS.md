# VPS Credentials

## Server Info
- **IP Address**: 103.189.234.117
- **Username**: tamatopik
- **Domain**: commitquest.webartisan.id (webartisan.id)

## SSH Access
```bash
ssh tamatopik@103.189.234.117
```

Or use the SSH alias:
```bash
ssh artisan
```

## Project Location on VPS
- **Directory**: ~/commitquest
- **Docker Compose**: ~/commitquest/docker-compose.yml
- **Environment**: ~/commitquest/.env

## Useful Commands

### Check container status
```bash
ssh tamatopik@103.189.234.117 "cd ~/commitquest && docker compose ps"
```

### View app logs
```bash
ssh tamatopik@103.189.234.117 "cd ~/commitquest && docker compose logs app --tail 50"
```

### Restart app
```bash
ssh tamatopik@103.189.234.117 "cd ~/commitquest && docker compose restart app"
```

### Pull latest and restart
```bash
ssh tamatopik@103.189.234.117 "cd ~/commitquest && docker compose pull && docker compose up -d"
```

### Access PostgreSQL
```bash
ssh tamatopik@103.189.234.117 "cd ~/commitquest && docker compose exec postgres psql -U postgres -d commitquest"
```

## GitHub Actions Secrets
Repository: devtama101/commitquest

Required secrets for new projects:
- `VPS_HOST`: 103.189.234.117
- `VPS_USER`: tamatopik
- `VPS_PORT`: 22
- `VPS_SSH_KEY`: (your private SSH key)
- `APP_URL`: https://your-domain.webartisan.id
- `DOMAIN`: your-domain.webartisan.id
- `AUTH_SECRET`: (generate with `openssl rand -base64 32`)
- `POSTGRES_PASSWORD`: (your PostgreSQL password)
- `AUTH_GITHUB_ID`: (GitHub OAuth app client ID)
- `AUTH_GITHUB_SECRET`: (GitHub OAuth app client secret)
- `AUTH_GITLAB_ID`: (GitLab OAuth app client ID)
- `AUTH_GITLAB_SECRET`: (GitLab OAuth app client secret)

## Docker Services
- **app**: Next.js application (port 3000)
- **postgres**: PostgreSQL database (port 5432)
- **caddy**: Reverse proxy with auto SSL (ports 80/443)

## Notes
- Caddy automatically handles SSL certificates via Let's Encrypt
- Database persists in Docker volume `postgres-data`
- GitHub Actions auto-deploys on push to `main` branch

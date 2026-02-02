# CommitQuest - Product Requirements Document

> 🎮 Gamify your Git commits. Track progress, build streaks, unlock achievements.

**Status**: ✅ **LIVE** at https://commitquest.webartisan.id

---

## 1. Project Overview

### Vision
CommitQuest transforms the mundane act of committing code into an engaging game. Developers connect their GitHub/GitLab accounts, track commits in real-time via webhooks, and unlock achievements based on their coding habits.

### Target Users
- Developers who want to build consistent coding habits
- Teams looking for fun ways to encourage regular commits
- Anyone who loves gamification and achievement hunting

### Key Differentiators
- Real-time tracking via webhooks (not polling)
- Multi-platform support (GitHub + GitLab simultaneously)
- Beautiful, playful UI inspired by comic/game aesthetics
- Achievement system with rarity tiers

---

## 2. Core Features

### 2.1 Authentication & Account Connection
| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| GitHub OAuth | Login and connect GitHub account | P0 | ✅ Complete |
| GitLab OAuth | Login and connect GitLab account | P0 | ✅ Complete |
| Multi-platform | Support both platforms simultaneously | P0 | ✅ Complete |
| Email/Password | Traditional auth option | P0 | ✅ Complete |
| Token storage | Securely store access tokens (encrypted) | P0 | ✅ Complete |
| Token refresh | GitLab tokens auto-refresh when expired | P0 | ✅ Complete |

### 2.2 Repository Management
| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| List repos | Fetch user's repos from GitHub/GitLab | P0 | ✅ Complete |
| Track repo | Select repos to track + register webhook | P0 | ✅ Complete |
| Untrack repo | Remove tracking + delete webhook | P0 | ✅ Complete |
| Webhook status | Show webhook health/status | P1 | ✅ Complete |

### 2.3 Real-time Commit Tracking
| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| Webhook receiver | Endpoints for GitHub/GitLab push events | P0 | ✅ Complete |
| Signature verification | Validate webhook payloads | P0 | ✅ Complete |
| Commit parsing | Extract commit data from payloads | P0 | ✅ Complete |
| Live updates | Show new commits without refresh | P1 | ✅ Complete |

### 2.4 Dashboard & Statistics
| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| Today's commits | Count of commits today | P0 | ✅ Complete |
| Current streak | Consecutive days with commits | P0 | ✅ Complete |
| Longest streak | Personal best streak | P0 | ✅ Complete |
| Total commits | All-time commit count | P0 | ✅ Complete |
| Commit calendar | GitHub-style heatmap | P0 | ✅ Complete |
| Recent activity | Timeline of recent commits | P1 | ✅ Complete |

### 2.5 Achievement System
| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| Achievement definitions | Predefined achievements with rules | P0 | ✅ Complete |
| Auto-unlock | Check & unlock after each commit | P0 | ✅ Complete |
| Progress tracking | Show progress toward locked achievements | P0 | ✅ Complete |
| Toast notifications | Celebrate new unlocks | P1 | ✅ Complete |
| Achievement showcase | Badge wall / collection view | P0 | ✅ Complete |

### 2.6 Analytics & Insights
| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| Time analytics | Most productive hours/days | P1 | ✅ Complete |
| Word cloud | Commit message visualization | P1 | ✅ Complete |
| Repo distribution | Pie chart by repository | P1 | ✅ Complete |
| Code stats | Lines added/deleted | P1 | ✅ Complete |

---

## 3. Achievement Definitions

### Streak Achievements
| Slug | Name | Description | Threshold | Rarity |
|------|------|-------------|-----------|--------|
| streak-7 | Week Warrior | 7-day commit streak | 7 | Common |
| streak-30 | Monthly Master | 30-day commit streak | 30 | Rare |
| streak-100 | Centurion | 100-day commit streak | 100 | Legendary |

### Volume Achievements
| Slug | Name | Description | Threshold | Rarity |
|------|------|-------------|-----------|--------|
| commits-1 | First Blood | Your first tracked commit | 1 | Common |
| commits-100 | Century | 100 total commits | 100 | Common |
| commits-500 | Prolific | 500 total commits | 500 | Rare |
| commits-1000 | Thousand Club | 1000 total commits | 1000 | Epic |

### Time-based Achievements
| Slug | Name | Description | Condition | Rarity |
|------|------|-------------|-----------|--------|
| night-owl | Night Owl | Commit between 00:00-05:00 | Time check | Rare |
| early-bird | Early Bird | Commit between 05:00-07:00 | Time check | Rare |
| weekend-warrior | Weekend Warrior | Commit on Sat & Sun same week | Day check | Common |

### Special Achievements
| Slug | Name | Description | Condition | Rarity |
|------|------|-------------|-----------|--------|
| multi-platform | Multiverse | Connect both GitHub and GitLab | Account check | Rare |
| first-repo | Pioneer | Track your first repository | Repo check | Common |

---

## 4. Tech Stack (Actual Versions Used)

| Layer | Technology | Version | Status |
|-------|------------|---------|--------|
| Framework | Next.js | **15.1** | ✅ Installed |
| Runtime | React | **19.0** | ✅ Installed |
| Language | TypeScript | **5.x** | ✅ Installed |
| Styling | Tailwind CSS | **4.0** | ✅ Installed |
| ORM | Prisma | **6.1** | ✅ Installed |
| Database | PostgreSQL | **16** | ✅ Production |
| Auth | Auth.js (NextAuth) | **v5** | ✅ Installed |
| Charts | Recharts | **2.15** | ✅ Installed |
| Deployment | Docker + Caddy | **latest** | ✅ Configured |

---

## 5. Database Schema

**Database**: PostgreSQL (production), SQLite (development)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // "sqlite" for dev
  url      = env("DATABASE_URL")
}

// ==================== AUTH ====================

model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  password      String?
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  repos         TrackedRepo[]
  commits       Commit[]
  achievements  UserAchievement[]
  stats         UserStats?
  challenges    UserChallenge[]
  profile       Profile?
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  provider          String  // "github" | "gitlab"
  providerAccountId String
  access_token      String? @db.Text
  refresh_token     String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

// ==================== REPOS ====================

model TrackedRepo {
  id            String   @id @default(cuid())
  userId        String
  provider      String   // "github" | "gitlab"
  repoId        String   // external repo ID
  repoName      String   // "owner/repo"
  repoUrl       String
  webhookId     String?
  webhookSecret String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  commits Commit[]

  @@unique([userId, provider, repoId])
  @@index([userId])
}

// ==================== COMMITS ====================

model Commit {
  id          String   @id @default(cuid())
  userId      String
  repoId      String
  provider    String
  sha         String
  message     String
  committedAt DateTime
  receivedAt  DateTime @default(now())
  branch      String?
  additions   Int?
  deletions   Int?

  user User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  repo TrackedRepo @relation(fields: [repoId], references: [id], onDelete: Cascade)

  @@unique([provider, sha])
  @@index([userId, committedAt])
  @@index([repoId])
}

// ==================== ACHIEVEMENTS ====================

model Achievement {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String
  icon        String
  category    String   // "streak" | "volume" | "time" | "special"
  threshold   Int
  rarity      String   @default("common") // "common" | "rare" | "epic" | "legendary"

  users UserAchievement[]
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
  @@index([userId])
}

// ==================== STATS ====================

model UserStats {
  id             String    @id @default(cuid())
  userId         String    @unique
  xp             Int       @default(0)
  level          Int       @default(1)
  currentStreak  Int       @default(0)
  longestStreak  Int       @default(0)
  totalCommits   Int       @default(0)
  lastCommitDate DateTime?
  updatedAt      DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ==================== CHALLENGES ====================

model Challenge {
  id          String   @id @default(cuid())
  type        String   // "daily" | "weekly"
  title       String
  description String
  target      Int      // Target commits
  xpReward    Int      // XP reward
  startDate   DateTime
  endDate     DateTime

  users UserChallenge[]
}

model UserChallenge {
  id          String   @id @default(cuid())
  userId      String
  challengeId String
  progress    Int      @default(0)
  completed   Boolean  @default(false)
  completedAt DateTime?

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  challenge Challenge @relation(fields: [challengeId], references: [id])

  @@unique([userId, challengeId])
  @@index([userId])
}

// ==================== PROFILE ====================

model Profile {
  id                String   @id @default(cuid())
  userId            String   @unique
  displayName       String?
  bio               String?
  showCommits       Boolean  @default(true)
  showStreak        Boolean  @default(true)
  showAchievements  Boolean  @default(true)
  badgeStyle        String   @default("default")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 6. Deployment

### Production Status: ✅ LIVE

**URL**: https://commitquest.webartisan.id

### Infrastructure
- **VPS**: Ubuntu 24.x (103.189.234.117)
- **Container Runtime**: Docker + Docker Compose
- **Database**: PostgreSQL 16
- **Reverse Proxy**: Caddy (auto SSL via Let's Encrypt)
- **CI/CD**: GitHub Actions (auto-deploy on push to main)

### Deployment Files
- `Dockerfile` - Multi-stage Node.js build
- `docker-compose.yml` - 3 services (app, postgres, caddy)
- `.github/workflows/deploy.yml` - CI/CD pipeline
- `deploy.sh` - Manual deployment script on VPS

### Deployment Time
- GitHub Actions build: ~2 minutes
- VPS pull & restart: ~1 minute
- **Total**: ~3-4 minutes from push to live

See `DEPLOYMENT.md` for detailed deployment instructions.

---

## 7. Success Criteria

### MVP Launch Checklist
- [x] User can login with GitHub OAuth
- [x] User can login with GitLab OAuth (with read_api scope)
- [x] User can sign up with email/password
- [x] User can connect additional platform after initial login
- [x] User can view list of their repos from connected platforms
- [x] User can track repos (webhook auto-registered)
- [x] User can untrack repos (webhook auto-removed)
- [x] Commits appear in real-time when pushing to tracked repos
- [x] Dashboard shows accurate stats (today, streak, total)
- [x] Commit calendar displays correct heatmap data
- [x] Achievements unlock automatically based on rules
- [x] Toast notification appears on new achievement unlock
- [x] Achievement page shows all achievements with progress
- [x] Manual sync button works as fallback
- [x] Mobile-responsive design
- [x] No TypeScript/linter errors
- [x] Production deployment with SSL
- [x] GitLab token auto-refresh

### Bonus Features Completed
- [x] Multiple accounts per platform support
- [x] Profile pictures for each account in repos/settings
- [x] Relative time display for last commit activity
- [x] Repos auto-sorted by last activity
- [x] Commit filtering by user (only user's commits counted)
- [x] Timezone support (Asia/Jakarta)
- [x] Provider filter for repo selection
- [x] Public profiles at `/u/[username]`
- [x] Badge embed code generator
- [x] Daily & weekly challenges
- [x] Analytics with charts (time of day, day of week, word cloud)
- [x] Custom favicon
- [x] Z-index fixes for modals

---

## 8. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/commitquest"

# Auth.js v5
AUTH_SECRET="your-secret-key"  # Generate: openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# GitHub OAuth
AUTH_GITHUB_ID="your_github_client_id"
AUTH_GITHUB_SECRET="your_github_client_secret"

# GitLab OAuth (read_api scope included)
AUTH_GITLAB_ID="your_gitlab_app_id"
AUTH_GITLAB_SECRET="your_gitlab_app_secret"

# Webhooks (use public URL in production)
WEBHOOK_BASE_URL="http://localhost:3000"
```

---

## 9. Future Enhancements (Post-MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| Leaderboards | Compare with friends or globally | P2 |
| Teams | Team-based achievement tracking | P2 |
| Custom achievements | User-defined achievement rules | P3 |
| Notifications | Email/push for streak reminders | P2 |
| Historical import | Import all past commits on connect | P3 |
| More analytics | Language breakdown, file type stats | P2 |

---

## 10. Documentation Files

- `README.md` - Main project documentation
- `DEPLOYMENT.md` - Deployment guide
- `ralph.md` - Current state reference
- `VPS_CREDENTIALS.md` - VPS access info (keep private!)

---

Made with ☕ and 🔥 by [Tama](https://github.com/devtama101)

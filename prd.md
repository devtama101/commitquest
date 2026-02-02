# CommitQuest - Product Requirements Document

> 🎮 Gamify your Git commits. Track progress, build streaks, unlock achievements.

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
| Feature | Description | Priority |
|---------|-------------|----------|
| GitHub OAuth | Login and connect GitHub account | P0 |
| GitLab OAuth | Login and connect GitLab account | P0 |
| Multi-platform | Support both platforms simultaneously | P0 |
| Token storage | Securely store access tokens (encrypted) | P0 |

### 2.2 Repository Management
| Feature | Description | Priority |
|---------|-------------|----------|
| List repos | Fetch user's repos from GitHub/GitLab | P0 |
| Track repo | Select repos to track + register webhook | P0 |
| Untrack repo | Remove tracking + delete webhook | P0 |
| Webhook status | Show webhook health/status | P1 |

### 2.3 Real-time Commit Tracking
| Feature | Description | Priority |
|---------|-------------|----------|
| Webhook receiver | Endpoints for GitHub/GitLab push events | P0 |
| Signature verification | Validate webhook payloads | P0 |
| Commit parsing | Extract commit data from payloads | P0 |
| Live updates | Show new commits without refresh | P1 |

### 2.4 Dashboard & Statistics
| Feature | Description | Priority |
|---------|-------------|----------|
| Today's commits | Count of commits today | P0 |
| Current streak | Consecutive days with commits | P0 |
| Longest streak | Personal best streak | P0 |
| Total commits | All-time commit count | P0 |
| Commit calendar | GitHub-style heatmap | P0 |
| Recent activity | Timeline of recent commits | P1 |

### 2.5 Achievement System
| Feature | Description | Priority |
|---------|-------------|----------|
| Achievement definitions | Predefined achievements with rules | P0 |
| Auto-unlock | Check & unlock after each commit | P0 |
| Progress tracking | Show progress toward locked achievements | P0 |
| Toast notifications | Celebrate new unlocks | P1 |
| Achievement showcase | Badge wall / collection view | P0 |

### 2.6 Manual Sync (Fallback)
| Feature | Description | Priority |
|---------|-------------|----------|
| Sync button | Manually fetch recent commits | P1 |
| Initial import | Import historical commits on first connect | P2 |

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

## 4. Tech Stack (Latest 2025 Versions)

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| Framework | Next.js | **16.1** | Turbopack default, Cache Components, PPR |
| Runtime | React | **19.2** | Activity component, useEffectEvent, Server Components |
| Language | TypeScript | **5.7+** | Type safety, better tooling |
| Styling | Tailwind CSS | **4.1** | CSS-first config, @theme directive |
| UI Components | shadcn/ui | **latest** | Tailwind v4 + React 19 compatible |
| ORM | Prisma | **7.2** | Rust-free, TypeScript/WASM core, faster |
| Database | PostgreSQL | **16+** | Robust, scalable |
| Auth | Auth.js (NextAuth) | **v5** | Universal auth(), built-in OAuth providers |
| Charts | Recharts | **2.x** | Lightweight, React-native |
| Deployment | VPS / Vercel | - | Flexible options |

### Stack Highlights

**Next.js 16.1 Features Used:**
- Turbopack (default bundler) - 5-10x faster builds
- Cache Components with `use cache` for instant navigation
- Partial Pre-Rendering (PPR) for static + dynamic content
- React 19.2 support out of the box

**Tailwind CSS 4.1 Features:**
- CSS-first configuration using `@theme` directive
- No `tailwind.config.js` needed
- Automatic content detection
- OKLCH color space for vibrant colors

**Prisma 7 Features:**
- Rust-free architecture (TypeScript/WASM)
- 90% smaller bundle size (~1.6MB vs ~14MB)
- Up to 3.4x faster queries
- New `prisma.config.ts` configuration

**Auth.js v5 Features:**
- Universal `auth()` method for all contexts
- Simplified config in `auth.ts`
- Built-in GitHub and GitLab providers

---

## 5. Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== AUTH ====================

model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  repos         TrackedRepo[]
  commits       Commit[]
  achievements  UserAchievement[]
  stats         UserStats?
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  provider          String  // "github" | "gitlab"
  providerAccountId String
  accessToken       String  // encrypted
  refreshToken      String?
  expiresAt         Int?
  username          String?

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

// ==================== STATS (CACHED) ====================

model UserStats {
  id             String    @id @default(cuid())
  userId         String    @unique
  currentStreak  Int       @default(0)
  longestStreak  Int       @default(0)
  totalCommits   Int       @default(0)
  lastCommitDate DateTime?
  updatedAt      DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 6. API Routes Structure

```
/app/api/
├── auth/
│   └── [...nextauth]/route.ts      # Auth.js handlers
│
├── webhooks/
│   ├── github/route.ts             # POST: receive GitHub push events
│   └── gitlab/route.ts             # POST: receive GitLab push events
│
├── repos/
│   ├── route.ts                    # GET: list available repos from provider
│   ├── tracked/route.ts            # GET: list user's tracked repos
│   ├── track/route.ts              # POST: track repo + register webhook
│   └── untrack/route.ts            # POST: untrack repo + remove webhook
│
├── commits/
│   ├── route.ts                    # GET: list commits (paginated, filtered)
│   ├── calendar/route.ts           # GET: heatmap data (aggregated by day)
│   └── recent/route.ts             # GET: recent commits for timeline
│
├── stats/
│   └── route.ts                    # GET: user stats (streak, total, etc.)
│
├── achievements/
│   ├── route.ts                    # GET: all achievements + user progress
│   └── check/route.ts              # POST: recalculate (internal use)
│
└── sync/
    └── route.ts                    # POST: manual sync from provider API
```

---

## 7. Webhook Flow

### Registration Flow
```
User clicks "Track Repo"
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  POST /api/repos/track                              │
│  1. Generate unique webhook secret                  │
│  2. Call GitHub/GitLab API to create webhook        │
│     - URL: https://commitquest.com/api/webhooks/... │
│     - Events: push                                  │
│     - Secret: generated secret                      │
│  3. Store TrackedRepo with webhookId + secret       │
│  4. Return success                                  │
└─────────────────────────────────────────────────────┘
```

### Receiving Commits Flow
```
GitHub/GitLab Push Event
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  POST /api/webhooks/github (or /gitlab)             │
│  1. Verify signature using stored secret            │
│  2. Parse commits array from payload                │
│  3. Find TrackedRepo by repo ID                     │
│  4. For each commit:                                │
│     - Create Commit record (skip if exists)         │
│  5. Update UserStats (streak, total)                │
│  6. Check & unlock achievements                     │
│  7. Return 200 OK                                   │
└─────────────────────────────────────────────────────┘
```

---

## 8. Design System

### Color Palette (Tailwind v4 @theme)
```css
@theme {
  /* Primary */
  --color-sky-top: oklch(0.83 0.08 220);
  --color-sky-bottom: oklch(0.82 0.12 60);
  --color-sand: oklch(0.88 0.15 95);
  --color-sand-dark: oklch(0.82 0.15 90);
  
  /* Accent */
  --color-teal: oklch(0.7 0.12 180);
  --color-teal-dark: oklch(0.6 0.12 180);
  --color-orange: oklch(0.7 0.18 30);
  --color-orange-dark: oklch(0.62 0.18 30);
  
  /* Neutral */
  --color-cream: oklch(0.98 0.01 90);
  --color-dark: oklch(0.25 0.02 240);
  
  /* Rarity */
  --color-rarity-common: oklch(0.65 0.02 240);
  --color-rarity-rare: oklch(0.6 0.15 250);
  --color-rarity-epic: oklch(0.55 0.2 300);
  --color-rarity-legendary: oklch(0.8 0.18 85);
}
```

### Typography
```css
@theme {
  --font-display: 'Bangers', cursive;  /* Headers, titles */
  --font-body: 'Comic Neue', cursive;  /* Body text */
}
```

### Component Style Guidelines

#### Cards
- Background: `bg-cream` or white
- Border: `border-4 border-dark`
- Border radius: `rounded-2xl`
- Box shadow: `shadow-[6px_6px_0_var(--color-dark)]`
- Hover: Slight lift or rotation reset

#### Buttons
- Border: `border-3 border-dark`
- Border radius: `rounded-full`
- Box shadow: `shadow-[4px_4px_0_var(--color-dark)]`
- Hover: `translate-x-0.5 translate-y-0.5` + reduce shadow

#### Section Dividers
- SVG wave patterns between sections
- Each section has distinct background color

#### Animations
- Floating: Subtle up/down for hero elements
- Pulse: For streak fire icon
- Flicker: For achievement unlock celebration

---

## 9. Pages & Components

### Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page (unauthenticated) |
| `/dashboard` | Main dashboard with stats, calendar, timeline |
| `/repos` | Manage tracked repositories |
| `/achievements` | Achievement showcase / badge wall |
| `/settings` | Account connections, preferences |

### Key Components
```
/components
├── layout/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── WaveDivider.tsx
│
├── dashboard/
│   ├── StatsCards.tsx
│   ├── CommitCalendar.tsx      # Heatmap
│   ├── RecentCommits.tsx       # Timeline
│   └── StreakCounter.tsx
│
├── repos/
│   ├── RepoList.tsx
│   ├── RepoCard.tsx
│   ├── TrackRepoModal.tsx
│   └── WebhookStatus.tsx
│
├── achievements/
│   ├── AchievementGrid.tsx
│   ├── AchievementCard.tsx
│   ├── ProgressBar.tsx
│   ├── RarityBadge.tsx
│   └── UnlockToast.tsx
│
└── ui/
    ├── Button.tsx              # Comic-style buttons
    ├── Card.tsx                # Chunky bordered cards
    ├── CharacterCard.tsx       # Floating avatar cards
    └── ... (shadcn/ui base)
```

---

## 10. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/commitquest"

# Auth.js v5
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"

# GitHub OAuth
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# GitLab OAuth
AUTH_GITLAB_ID="your-gitlab-app-id"
AUTH_GITLAB_SECRET="your-gitlab-app-secret"

# App
WEBHOOK_BASE_URL="https://your-domain.com"
```

---

## 11. Success Criteria

### MVP Launch Checklist
- [x] User can login with GitHub OAuth
- [x] User can login with GitLab OAuth
- [x] User can connect additional platform after initial login (multiple accounts per platform)
- [x] User can view list of their repos from connected platforms
- [x] User can track repos (webhook auto-registered, skipped for localhost)
- [x] User can untrack repos (webhook auto-removed)
- [x] Commits appear in real-time when pushing to tracked repos (via sync on localhost)
- [x] Dashboard shows accurate stats (today, streak, total)
- [x] Commit calendar displays correct heatmap data
- [x] Achievements unlock automatically based on rules
- [x] Toast notification appears on new achievement unlock
- [x] Achievement page shows all achievements with progress
- [x] Manual sync button works as fallback (syncs all time, filters by user)
- [x] Mobile-responsive design
- [x] No TypeScript/linter errors

### Bonus Features Completed
- [x] Multiple accounts per platform support
- [x] Profile pictures for each account in repos/settings
- [x] Relative time display for last commit activity
- [x] Repos auto-sorted by last activity
- [x] Commit filtering by user (only user's commits counted)
- [x] Timezone support (Asia/Jakarta)
- [x] Provider filter for repo selection (All/GitHub/GitLab)

---

## 12. Future Enhancements (Post-MVP)

| Feature | Description |
|---------|-------------|
| Leaderboards | Compare with friends or globally |
| Teams | Team-based achievement tracking |
| Custom achievements | User-defined achievement rules |
| Notifications | Email/push for streak reminders |
| Public profiles | Shareable achievement showcase |
| GitHub README badge | Embed stats in profile README |
| Historical import | Import all past commits on connect |

---

## Appendix: Reference Design

The UI style is inspired by "Los Lunas" game website:
- Comic book / cartoon aesthetic
- Chunky borders with offset shadows
- Wavy section dividers
- Playful color blocking (sky → sand → teal → orange)
- Character cards with floating animations
- Achievement cards with rarity-based styling

See `/index.html` for the implemented style reference.
# CommitQuest - Project Documentation (Current State)

**Repository**: https://github.com/devtama101/commitquest
**Live**: https://commitquest.webartisan.id

## 📋 Overview

A gamified Git commit tracker where developers connect GitHub/GitLab, track commits via webhooks in real-time, earn XP, level up, and unlock achievements. The UI uses a playful, comic-book inspired design with chunky borders, offset shadows, and colorful sections.

## ✨ Current Features

### Gamification
- **XP System**: Earn XP for every commit (base 10 XP + bonuses)
- **Leveling**: 20+ levels with unique titles (Code Novice → Commit God)
- **13 Achievements**: Unlock badges for streaks, milestones, time-based feats
- **Daily & Weekly Challenges**: Complete challenges for bonus XP rewards
- **Title System**: Unlock titles as you progress

### Analytics
- **Commit Calendar**: GitHub-style contribution heatmap
- **Time Analytics**: Most productive hours, best day of week
- **Commit Word Cloud**: Visualize commit message patterns
- **Repository Distribution**: Pie chart of contributions by repo
- **Code Stats**: Lines added/deleted tracking

### Platform Features
- **Multi-Account**: Connect unlimited GitHub + GitLab accounts
- **Auto Token Refresh**: GitLab tokens refresh automatically when expired
- **GitLab read_api Scope**: Properly configured for repo fetching
- **Real-time Webhooks**: Commits captured instantly via webhooks
- **Public Profiles**: Share progress at `/u/[username]`
- **Badge Embeds**: Add stats to GitHub README
- **Privacy Controls**: Toggle visibility of profile sections

## 🛠 Tech Stack (Actual Versions)

| Technology | Version | Notes |
|------------|---------|-------|
| **Framework** | Next.js 15.1 | App Router, Turbopack |
| **React** | 19.0 | Server Components |
| **Language** | TypeScript 5.x | - |
| **Styling** | Tailwind CSS 4.0 | CSS-first with @theme |
| **Database** | PostgreSQL (prod) | via Prisma 6.1 |
| **ORM** | Prisma 6.1 | - |
| **Auth** | Auth.js v5 | next-auth@5 |
| **Charts** | Recharts 2.15 | - |
| **Fonts** | Bangers + Comic Neue | Google Fonts |
| **Deployment** | Docker Compose | + Caddy (auto SSL) |

## 📁 Project Structure

```
commitquest/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                     # API Routes
│   │   │   ├── achievements/        # Achievement endpoints
│   │   │   ├── auth/[...nextauth]/  # NextAuth handlers
│   │   │   ├── badge/[username]/    # SVG badge generator
│   │   │   ├── challenges/          # Challenge endpoints
│   │   │   ├── commits/             # Commit endpoints
│   │   │   ├── insights/            # Analytics endpoints
│   │   │   ├── profile/             # Public profile endpoints
│   │   │   ├── repos/               # Repository management
│   │   │   ├── settings/            # Account settings
│   │   │   ├── stats/               # User statistics
│   │   │   ├── sync/                # Manual sync trigger
│   │   │   ├── webhooks/            # GitHub/GitLab webhooks
│   │   │   └── xp/                  # XP & leveling system
│   │   ├── dashboard/               # Dashboard page
│   │   ├── achievements/            # Achievements page
│   │   ├── challenges/              # Challenges page
│   │   ├── insights/                # Insights page
│   │   ├── repos/                   # Repositories page
│   │   ├── settings/                # Settings page (tabbed)
│   │   ├── u/[username]/            # Public profiles
│   │   ├── icon.svg                 # Favicon
│   │   ├── favicon.ico              # Favicon
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Landing page
│   ├── components/
│   │   ├── achievements/            # Achievement cards, grid
│   │   ├── challenges/              # Challenge cards, list
│   │   ├── dashboard/               # Stats cards, calendar, etc.
│   │   ├── insights/                # Charts (DayOfWeek, Hourly, PieChart)
│   │   ├── layout/                  # Navbar, Footer, SignOut
│   │   ├── profile/                 # PublicProfile, BadgeEmbed
│   │   ├── repos/                   # RepoList, AddRepoModal
│   │   ├── settings/                # AccountSettings, ProfileSettings
│   │   └── ui/                      # Shared UI components
│   └── lib/
│       ├── achievements.ts          # Achievement definitions & logic
│       ├── auth.ts                  # NextAuth configuration
│       ├── challenges.ts            # Challenge generation
│       ├── prisma.ts                # Prisma client
│       ├── token-refresh.ts         # GitLab token auto-refresh
│       ├── webhooks.ts              # Webhook utilities
│       └── xp.ts                   # XP & leveling system
├── prisma/
│   ├── schema.prisma                # Database schema (PostgreSQL)
│   └── seed.ts                     # Seed achievements & challenges
├── Dockerfile                       # Docker config for production
├── docker-compose.yml               # Docker compose for VPS
└── package.json
```

## 🔐 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/commitquest"

# Auth
AUTH_SECRET="$(openssl rand -base64 32)"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth
AUTH_GITHUB_ID="your_github_client_id"
AUTH_GITHUB_SECRET="your_github_client_secret"

# GitLab OAuth (with read_api scope)
AUTH_GITLAB_ID="your_gitlab_app_id"
AUTH_GITLAB_SECRET="your_gitlab_app_secret"

# Webhooks (public URL in production)
WEBHOOK_BASE_URL="http://localhost:3000"
```

## 🏆 Achievement List

| Icon | Name | Description | Category | Rarity | XP |
|------|------|-------------|----------|--------|-----|
| 🎯 | First Blood | First tracked commit | volume | Common | 10 |
| 💯 | Century | 100 total commits | volume | Common | 100 |
| ⚡ | Prolific | 500 total commits | volume | Rare | 500 |
| 🏆 | Thousand Club | 1000 total commits | volume | Epic | 1000 |
| 🔥 | Week Warrior | 7-day streak | streak | Common | 50 |
| 💪 | Monthly Master | 30-day streak | streak | Rare | 200 |
| 👑 | Centurion | 100-day streak | streak | Legendary | 1000 |
| 🦉 | Night Owl | Commit midnight-5am | time | Rare | 50 |
| 🐦 | Early Bird | Commit 5am-7am | time | Rare | 50 |
| ⚔️ | Weekend Warrior | Commit Sat & Sun | time | Common | 30 |
| 🌐 | Multiverse | Connect GitHub + GitLab | special | Rare | 100 |
| 🚀 | Pioneer | Track first repo | special | Common | 20 |

## 📊 XP & Leveling

**Base XP:**
- 10 XP per commit
- Bonus for large commits (>100, >500, >1000 lines)
- Streak bonus: 0.5 XP per streak day

**Level Thresholds (Sample):**
- Level 1: 0 XP (Code Novice)
- Level 5: 5,000 XP (Code Warrior)
- Level 10: 25,000 XP (Merge Master)
- Level 20: 250,000 XP (Master Coder)
- Level 50: 1,000,000 XP (Code Immortal)
- Level 100: 10,000,000 XP (Commit God)

## 🎯 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page (redirects to /dashboard if logged in) |
| `/dashboard` | Stats, level progress, calendar, recent commits |
| `/repos` | Track/untrack repositories |
| `/achievements` | View all achievements with progress |
| `/challenges` | Daily & weekly challenges |
| `/insights` | Analytics and charts |
| `/settings` | Account, profile, badge settings (tabbed) |
| `/u/[username]` | Public profile |

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |
| `/api/achievements` | GET | Get achievements with user progress |
| `/api/achievements/check` | POST | Check for new achievements |
| `/api/badge/[username]` | GET | SVG badge generator |
| `/api/challenges` | GET | Get active challenges |
| `/api/challenges/history` | GET | Get challenge history |
| `/api/commits` | GET | Get user commits |
| `/api/commits/calendar` | GET | Get calendar data |
| `/api/insights` | GET | Get analytics data |
| `/api/profile/[username]` | GET | Get public profile |
| `/api/profile/settings` | POST | Update profile settings |
| `/api/repos` | GET | Get available repos |
| `/api/repos/track` | POST | Track a repo |
| `/api/repos/tracked` | GET | Get tracked repos |
| `/api/repos/untrack` | POST | Untrack a repo |
| `/api/settings/accounts` | GET | Get connected accounts |
| `/api/settings/disconnect` | POST | Disconnect account |
| `/api/stats` | GET | Get user stats |
| `/api/sync` | POST | Manual sync trigger |
| `/api/webhooks/github` | POST | GitHub webhook |
| `/api/webhooks/gitlab` | POST | GitLab webhook |
| `/api/xp` | GET | Get XP and level info |

## 🎨 Design System

**Colors:**
- `--color-cream`: #fff8e7 (background)
- `--color-dark`: #2d3436 (text/borders)
- `--color-orange`: #f97316 (accent)
- Heatmap colors: `bg-heat-0` through `bg-heat-4`

**Component Styling:**
- Cards: `bg-cream border-4 border-dark rounded-2xl shadow-[6px_6px_0_var(--color-dark)]`
- Buttons: `border-3 border-dark rounded-full shadow-[4px_4px_0_var(--color-dark)]`
- Tabs: `bg-cream rounded-full border-2 border-dark`
- Modals: `z-[999]` (above navbar at `z-40`)

## 🚀 Development

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push
npm run db:seed

# Run dev server
npm run dev

# Build for production
npm run build
npm start
```

## 🚀 Production Deployment

**CI/CD**: GitHub Actions auto-deploys on push to `main`
- Build time: ~2 minutes
- Deploy time: ~1 minute
- Total: ~3-4 minutes

**Manual deploy**:
```bash
ssh webartisan
cd ~/commitquest && ./deploy.sh
```

## 📝 Recent Updates

- **GitLab read_api scope**: Fixed repo fetching by adding `read_api` to OAuth authorization URL
- **Favicon**: Added custom sword/quest-themed favicon
- **Modal z-index**: Fixed overlapping issues (modals: z-[999], navbar: z-40)
- **Token refresh**: GitLab tokens auto-refresh when expired
- **Multiple accounts**: Support connecting multiple GitHub/GitLab accounts

## 📝 Notes

- **Token Refresh**: GitLab tokens refresh automatically using the refresh token flow
- **Re-auth Warning**: Users see a warning banner when token refresh fails
- **Multiple Accounts**: Users can connect multiple GitHub and GitLab accounts
- **Public Profiles**: Each user has a shareable profile at `/u/[username]`
- **Badge Generator**: Dynamic SVG badges for embedding in README files
- **GitLab Scopes**: The app requests `read_user` and `read_api` scopes for full functionality

## 👤 Author

Made with ☕ and 🔥 by [Tama](https://github.com/devtama101) at [WebArtisan.id](https://webartisan.id)

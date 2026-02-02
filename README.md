# CommitQuest 🎮

A gamified Git commit tracker that turns your coding journey into an epic adventure. Connect GitHub/GitLab or sign up with email, track commits via webhooks in real-time, earn XP, level up, and unlock achievements.

![CommitQuest](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?style=flat-square&logo=prisma)

## ✨ Features

### 🔐 Authentication
- **Email/Password** - Create an account with just email and password
- **GitHub OAuth** - One-click login with GitHub
- **GitLab OAuth** - One-click login with GitLab

### 🎮 Gamification
- **XP & Leveling System** - Earn XP for every commit, unlock titles as you level up
- **Achievements** - Unlock badges for streaks, milestones, and special feats
- **Daily & Weekly Challenges** - Complete challenges to earn bonus XP
- **20+ Level Titles** - From "Code Novice" to "Commit God"

### 📊 Analytics & Insights
- **Commit Calendar** - GitHub-style contribution heatmap
- **Time Analytics** - Discover your most productive hours and days
- **Commit Word Cloud** - Visualize your commit message patterns
- **Repository Distribution** - See contribution breakdown by repo

### 🔗 Multi-Platform Support
- **GitHub** - Connect unlimited GitHub accounts
- **GitLab** - Connect unlimited GitLab accounts
- **Auto Token Refresh** - GitLab tokens refresh automatically when expired
- **Real-time Webhooks** - Commits appear instantly when you push

### 👥 Social Features
- **Public Profiles** - Share your progress at `/u/[username]`
- **Badge Embeds** - Add your stats to your GitHub README
- **Privacy Controls** - Choose what to show on your public profile

## 🛠 Tech Stack

| Technology | Version |
|------------|---------|
| **Framework** | Next.js 15 (App Router) |
| **React** | 19 |
| **Language** | TypeScript 5.x |
| **Styling** | Tailwind CSS 4.0 |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **ORM** | Prisma 6.x |
| **Auth** | Auth.js v5 (next-auth@5) |
| **Charts** | Recharts 2.x |

## 📦 Installation

### Prerequisites

- Node.js 20+
- npm or yarn or pnpm

### Setup Steps

1. **Clone and install**
   ```bash
   git clone https://github.com/your-username/commitquest.git
   cd commitquest
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update the values in `.env`:
   ```env
   # Database (SQLite for local development)
   DATABASE_URL="file:./dev.db"

   # Auth.js v5 - Generate with: openssl rand -base64 32
   AUTH_SECRET="your-secret-key-here"
   AUTH_URL="http://localhost:3000"

   # GitHub OAuth (https://github.com/settings/developers)
   AUTH_GITHUB_ID="your_github_client_id"
   AUTH_GITHUB_SECRET="your_github_client_secret"

   # GitLab OAuth (https://gitlab.com/-/profile/applications)
   AUTH_GITLAB_ID="your_gitlab_app_id"
   AUTH_GITLAB_SECRET="your_gitlab_app_secret"

   # Webhooks (use your public URL in production)
   WEBHOOK_BASE_URL="http://localhost:3000"
   ```

3. **Database setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🌐 OAuth Setup

### GitHub
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set:
   - **Application name**: CommitQuest
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

### GitLab
1. Go to [GitLab Applications](https://gitlab.com/-/profile/applications)
2. Click "New Application"
3. Set:
   - **Name**: CommitQuest
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/gitlab`
4. Check **Confidential** (this is correct for server-side apps)
5. Check scopes: `api`, `read_user`, `read_repository`
6. Copy Application ID and Secret to `.env`

## 📁 Project Structure

```
commitquest/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── achievements/  # Achievement endpoints
│   │   │   ├── challenges/    # Challenge endpoints
│   │   │   ├── commits/       # Commit endpoints
│   │   │   ├── insights/      # Analytics endpoints
│   │   │   ├── profile/       # Public profile endpoints
│   │   │   ├── repos/         # Repository management
│   │   │   ├── settings/      # Account settings
│   │   │   ├── stats/         # User statistics
│   │   │   ├── webhooks/      # GitHub/GitLab webhooks
│   │   │   └── xp/            # XP & leveling
│   │   ├── dashboard/         # Dashboard page
│   │   ├── achievements/      # Achievements page
│   │   ├── challenges/        # Challenges page
│   │   ├── insights/          # Insights page
│   │   ├── repos/             # Repositories page
│   │   └── settings/          # Settings page
│   ├── components/
│   │   ├── achievements/      # Achievement components
│   │   ├── challenges/        # Challenge components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── insights/          # Analytics charts
│   │   ├── layout/            # Navbar, Footer
│   │   ├── repos/             # Repository components
│   │   ├── settings/          # Settings components
│   │   └── ui/                # UI components
│   └── lib/
│       ├── achievements.ts    # Achievement logic
│       ├── auth.ts            # Auth configuration
│       ├── challenges.ts      # Challenge generation
│       ├── xp.ts              # XP & leveling system
│       ├── prisma.ts          # Prisma client
│       └── webhooks.ts        # Webhook handlers
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── dev.db                # SQLite database (local)
└── package.json
```

## 🏆 Achievements

| Icon | Name | Description | Rarity |
|------|------|-------------|--------|
| 🎯 | First Blood | Your first tracked commit | Common |
| 💯 | Century | 100 total commits | Common |
| ⚡ | Prolific | 500 total commits | Rare |
| 🏆 | Thousand Club | 1000 total commits | Epic |
| 🔥 | Week Warrior | 7-day commit streak | Common |
| 💪 | Monthly Master | 30-day commit streak | Rare |
| 👑 | Centurion | 100-day commit streak | Legendary |
| 🦉 | Night Owl | Commit between midnight-5am | Rare |
| 🐦 | Early Bird | Commit between 5am-7am | Rare |
| ⚔️ | Weekend Warrior | Commit on Sat & Sun | Common |
| 🌐 | Multiverse | Connect GitHub + GitLab | Rare |
| 🚀 | Pioneer | Track your first repository | Common |

## 🎖 Level Titles

Unlock titles as you level up:
- Level 1-5: Code Novice → App Developer → Bug Hunter
- Level 6-10: Code Apprentice → Merge Apprentice → Committer
- Level 11-15: Git Knight → Code Crusader → Streak Legend
- Level 16-20: Git Champion → Code Warlord → Streak God
- Level 25+: Elite Developer → Git Grandmaster → Code Immortal → Commit God (Level 100)

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (use PostgreSQL for production)
4. Deploy!

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
AUTH_SECRET="your-production-secret"
AUTH_URL="https://your-domain.com"
WEBHOOK_BASE_URL="https://your-domain.com"
```

## 📜 License

MIT License - feel free to use this for your own projects!

---

Made with ☕ and 🔥

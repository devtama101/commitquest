import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CharacterCard } from "@/components/ui/CharacterCard";
import { AchievementCard } from "@/components/ui/AchievementCard";
import { WaveDivider } from "@/components/layout/WaveDivider";
import { Footer } from "@/components/layout/Footer";
import { SignInButton } from "@/components/ui/SignInButton";
import { AuthButtons } from "@/components/ui/AuthButtons";
import { CTAAuthButtons } from "@/components/ui/CTAAuthButtons";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      {/* Navbar - Landing */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream border-b-3 border-dark py-3 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-display text-2xl md:text-3xl text-orange text-shadow-sm tracking-wider">
            Commit<span className="text-teal">Quest</span>
          </Link>

          <ul className="hidden md:flex items-center gap-6">
            <li>
              <a href="#stats" className="font-body font-bold text-dark hover:text-orange transition-colors text-lg">
                Stats
              </a>
            </li>
            <li>
              <a href="#calendar" className="font-body font-bold text-dark hover:text-orange transition-colors text-lg">
                Calendar
              </a>
            </li>
            <li>
              <a href="#achievements" className="font-body font-bold text-dark hover:text-orange transition-colors text-lg">
                Achievements
              </a>
            </li>
            <li>
              <a href="#challenges" className="font-body font-bold text-dark hover:text-orange transition-colors text-lg">
                Challenges
              </a>
            </li>
            <li>
              <a href="#features" className="font-body font-bold text-dark hover:text-orange transition-colors text-lg">
                Features
              </a>
            </li>
          </ul>

          <SignInButton
            provider="github"
            className="font-body font-bold px-6 py-3 border-3 border-dark rounded-full bg-orange text-white shadow-[4px_4px_0_var(--color-dark)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-dark)] transition-all"
          >
            Start Quest
          </SignInButton>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-sky-top to-sky-bottom pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="bg-purple text-white px-6 py-2 rounded-full border-3 border-dark font-body font-bold shadow-[3px_3px_0_var(--color-dark)]">
              🎮 Gamify Your Git
            </div>
          </div>

          {/* Hero Title */}
          <h1 className="font-display text-5xl md:text-7xl text-cream text-shadow-outline leading-tight mb-6">
            LEVEL UP YOUR<br />
            <span className="text-sand">COMMIT GAME</span>
          </h1>

          {/* Subtitle */}
          <p className="font-body font-bold text-dark text-xl md:text-2xl max-w-2xl mx-auto mb-10">
            Track commits, build streaks, earn XP, unlock achievements. Turn your coding
            journey into an epic adventure!
          </p>

          {/* Auth Buttons */}
          <AuthButtons />

          {/* Character Cards */}
          <div className="flex flex-wrap justify-center gap-6">
            <CharacterCard
              icon="🔥"
              name="Week Warrior"
              title="7-Day Legend"
              rotate="left"
              delay={0}
            />
            <CharacterCard
              icon="🦉"
              name="Night Owl"
              title="Midnight Coder"
              rotate="right"
              delay={0.5}
            />
            <CharacterCard
              icon="🏆"
              name="1K Club"
              title="Commit Legend"
              rotate="left"
              delay={1}
            />
          </div>
        </div>
      </section>

      {/* Stats Preview Section */}
      <section id="stats" className="bg-purple py-16 pb-40 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-cream text-center text-shadow-md mb-12">
            📊 YOUR QUEST STATS
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* Sample Stat Cards */}
            <div className="bg-cream border-4 border-dark rounded-2xl p-8 text-center shadow-[6px_6px_0_var(--color-dark)] hover:-translate-y-1 transition-transform">
              <div className="text-5xl mb-4">🎯</div>
              <div className="font-display text-5xl text-orange text-shadow-sm mb-2">24</div>
              <div className="font-body font-bold text-dark text-lg">Today&apos;s Commits</div>
            </div>

            <div className="bg-cream border-4 border-dark rounded-2xl p-8 text-center shadow-[6px_6px_0_var(--color-dark)] hover:-translate-y-1 transition-transform">
              <div className="text-5xl mb-4 animate-flicker">🔥</div>
              <div className="font-display text-5xl text-orange text-shadow-sm mb-2">47</div>
              <div className="font-body font-bold text-dark text-lg">Day Streak</div>
            </div>

            <div className="bg-cream border-4 border-dark rounded-2xl p-8 text-center shadow-[6px_6px_0_var(--color-dark)] hover:-translate-y-1 transition-transform">
              <div className="text-5xl mb-4">💻</div>
              <div className="font-display text-5xl text-orange text-shadow-sm mb-2">1,842</div>
              <div className="font-body font-bold text-dark text-lg">Total Commits</div>
            </div>

            <div className="bg-cream border-4 border-dark rounded-2xl p-8 text-center shadow-[6px_6px_0_var(--color-dark)] hover:-translate-y-1 transition-transform">
              <div className="text-5xl mb-4">🏅</div>
              <div className="font-display text-5xl text-orange text-shadow-sm mb-2">12</div>
              <div className="font-body font-bold text-dark text-lg">Achievements</div>
            </div>
          </div>

          {/* XP Preview */}
          <div className="mt-12 max-w-md mx-auto bg-cream border-4 border-dark rounded-2xl p-6 shadow-[6px_6px_0_var(--color-dark)]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-xl text-dark">Level 5</span>
              <span className="font-body font-bold text-orange">Code Warrior</span>
            </div>
            <div className="h-4 bg-sand rounded-full border-2 border-dark overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange to-orange-dark w-3/5"></div>
            </div>
            <div className="flex justify-between mt-2 text-sm font-body font-bold text-dark">
              <span>3,240 XP</span>
              <span>5,000 XP</span>
            </div>
          </div>
        </div>

        <WaveDivider fillColor="#FFF8E7" />
      </section>

      {/* Commit Calendar Preview */}
      <section id="calendar" className="bg-cream py-16 pb-40 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-dark text-center mb-12">
            📅 COMMIT CALENDAR
          </h2>

          <div className="bg-cream border-4 border-dark rounded-2xl p-6 shadow-[8px_8px_0_var(--color-dark)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl">Your Contribution Graph</h3>
              <div className="flex items-center gap-2 text-sm font-body font-bold">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded border border-dark ${
                      level === 0
                        ? "bg-heat-0"
                        : level === 1
                          ? "bg-heat-1"
                          : level === 2
                            ? "bg-heat-2"
                            : level === 3
                              ? "bg-heat-3"
                              : "bg-heat-4"
                    }`}
                  />
                ))}
                <span>More</span>
              </div>
            </div>

            {/* Sample heatmap grid */}
            <div className="grid grid-cols-[repeat(26,minmax(10px,1fr))] gap-1">
              {Array.from({ length: 182 }).map((_, i) => {
                const level = Math.floor(Math.random() * 5);
                const colorClass =
                  level === 0
                    ? "bg-heat-0"
                    : level === 1
                      ? "bg-heat-1"
                      : level === 2
                        ? "bg-heat-2"
                        : level === 3
                          ? "bg-heat-3"
                          : "bg-heat-4";
                return <div key={i} className={`aspect-square rounded-sm border border-dark/10 ${colorClass}`} />;
              })}
            </div>
          </div>
        </div>

        <WaveDivider fillColor="#24b6a1" />
      </section>

      {/* Achievements Preview Section */}
      <section id="achievements" className="bg-teal py-16 pb-40 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-cream text-center text-shadow-md mb-12">
            🏆 ACHIEVEMENTS
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AchievementCard
              icon="👑"
              name="Centurion"
              description="100-day commit streak"
              rarity="legendary"
              isUnlocked={true}
            />
            <AchievementCard
              icon="🏆"
              name="Thousand Club"
              description="1000 total commits"
              rarity="epic"
              isUnlocked={true}
            />
            <AchievementCard
              icon="🦉"
              name="Night Owl"
              description="Commit between midnight and 5am"
              rarity="rare"
              isUnlocked={true}
            />
            <AchievementCard
              icon="🔥"
              name="Week Warrior"
              description="7-day commit streak"
              rarity="common"
              isUnlocked={true}
            />
            <AchievementCard
              icon="💯"
              name="Century"
              description="100 total commits"
              rarity="common"
              isUnlocked={true}
            />
            <AchievementCard
              icon="🔒"
              name="???"
              description="Keep committing to unlock!"
              rarity="common"
              isUnlocked={false}
            />
          </div>

          {/* XP Rewards Info */}
          <div className="mt-12 bg-cream/20 border-4 border-dark rounded-2xl p-6 text-center">
            <p className="font-body font-bold text-cream text-lg">
              ⚡ Earn XP with every achievement unlock • Level up to unlock new titles
            </p>
          </div>
        </div>

        <WaveDivider fillColor="#FA6A57" />
      </section>

      {/* Challenges Section */}
      <section id="challenges" className="bg-orange py-16 pb-40 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-cream text-center text-shadow-md mb-12">
            ⚔️ DAILY & WEEKLY CHALLENGES
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Challenge Cards */}
            <div className="bg-white border-4 border-dark rounded-2xl p-6 shadow-[6px_6px_0_var(--color-dark)] text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="font-display text-xl text-dark mb-2">Commit Streak</h3>
              <p className="font-body text-dark mb-4">Make commits every day for 7 days</p>
              <div className="inline-block bg-orange text-white px-4 py-1 rounded-full font-body font-bold text-sm">
                +100 XP
              </div>
            </div>

            <div className="bg-white border-4 border-dark rounded-2xl p-6 shadow-[6px_6px_0_var(--color-dark)] text-center">
              <div className="text-5xl mb-4">🌙</div>
              <h3 className="font-display text-xl text-dark mb-2">Night Owl</h3>
              <p className="font-body text-dark mb-4">Commit between midnight and 5am</p>
              <div className="inline-block bg-orange text-white px-4 py-1 rounded-full font-body font-bold text-sm">
                +50 XP
              </div>
            </div>

            <div className="bg-white border-4 border-dark rounded-2xl p-6 shadow-[6px_6px_0_var(--color-dark)] text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="font-display text-xl text-dark mb-2">Code Warrior</h3>
              <p className="font-body text-dark mb-4">Make 50 commits this week</p>
              <div className="inline-block bg-orange text-white px-4 py-1 rounded-full font-body font-bold text-sm">
                +200 XP
              </div>
            </div>
          </div>
        </div>

        <WaveDivider fillColor="#8AD4EB" />
      </section>

      {/* Features Section */}
      <section id="features" className="bg-sky-top py-16 pb-40 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-dark text-center mb-12">
            ⚡ QUEST FEATURES
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white border-4 border-dark rounded-2xl p-8 shadow-[6px_6px_0_var(--color-dark)]">
              <h3 className="font-display text-2xl text-teal-dark mb-4 flex items-center gap-2">
                🔄 Real-time Tracking
              </h3>
              <p className="font-body text-lg leading-relaxed">
                Webhooks capture every commit instantly. Push to GitHub or GitLab and
                watch your stats update in real-time!
              </p>
            </div>

            <div className="bg-white border-4 border-dark rounded-2xl p-8 shadow-[6px_6px_0_var(--color-dark)]">
              <h3 className="font-display text-2xl text-teal-dark mb-4 flex items-center gap-2">
                🌐 Multi-Platform
              </h3>
              <p className="font-body text-lg leading-relaxed">
                Connect both GitHub and GitLab accounts. Track all your repositories
                in one epic dashboard.
              </p>
            </div>

            <div className="bg-white border-4 border-dark rounded-2xl p-8 shadow-[6px_6px_0_var(--color-dark)]">
              <h3 className="font-display text-2xl text-teal-dark mb-4 flex items-center gap-2">
                📈 Analytics Insights
              </h3>
              <p className="font-body text-lg leading-relaxed">
                Discover your coding patterns with beautiful charts. See your most productive
                hours, days, and commit patterns.
              </p>
            </div>

            <div className="bg-white border-4 border-dark rounded-2xl p-8 shadow-[6px_6px_0_var(--color-dark)]">
              <h3 className="font-display text-2xl text-teal-dark mb-4 flex items-center gap-2">
                👥 Share Your Journey
              </h3>
              <p className="font-body text-lg leading-relaxed">
                Public profiles and embeddable badges let you share your progress
                with the world.
              </p>
            </div>
          </div>
        </div>

        <WaveDivider fillColor="#9B59B6" />
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-purple to-purple-dark py-20 px-6 text-center relative">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-cream text-center text-shadow-md mb-12">
            BEGIN YOUR QUEST
          </h2>
          <p className="font-body font-bold text-cream text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of developers leveling up their coding game. It&apos;s free
            and takes 30 seconds!
          </p>

          <CTAAuthButtons />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

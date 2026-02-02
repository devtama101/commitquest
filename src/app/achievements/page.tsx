import { ClientNavbar } from "@/components/layout/ClientNavbar";
import { Footer } from "@/components/layout/Footer";
import { AchievementGrid } from "@/components/achievements/AchievementGrid";

export default function AchievementsPage() {
  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <ClientNavbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-5xl md:text-6xl text-dark mb-4">
              Achievement Hall
            </h1>
            <p className="font-body font-bold text-dark text-lg">
              Unlock badges by building streaks, making commits, and coding at special times!
            </p>
          </div>

          {/* Achievement Grid */}
          <AchievementGrid />
        </div>
      </main>

      <Footer />
    </div>
  );
}

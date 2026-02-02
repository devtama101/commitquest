import { Card } from "./Card";
import { cn } from "./cn";

interface AchievementCardProps {
  icon: string;
  name: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const rarityStyles = {
  common: "bg-rarity-common",
  rare: "bg-rarity-rare",
  epic: "bg-rarity-epic",
  legendary: "bg-gradient-to-r from-yellow-400 to-orange-500",
};

const rarityBadgeStyles = {
  common: "bg-[#95A5A6] text-white",
  rare: "bg-[#3498DB] text-white",
  epic: "bg-[#9B59B6] text-white",
  legendary: "bg-gradient-to-r from-yellow-400 to-orange-500 text-dark",
};

export function AchievementCard({
  icon,
  name,
  description,
  rarity,
  isUnlocked,
  progress,
  maxProgress,
}: AchievementCardProps) {
  return (
    <Card
      variant="achievement"
      className={cn(
        "p-6 flex items-center gap-4",
        !isUnlocked && "opacity-60 grayscale"
      )}
    >
      <div
        className={cn(
          "w-16 h-16 min-w-16 border-3 border-dark rounded-2xl flex items-center justify-center text-4xl",
          rarityStyles[rarity],
          rarity === "legendary" && "shadow-[0_0_20px_rgba(255,215,0,0.5)]"
        )}
      >
        {isUnlocked ? icon : "🔒"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-display text-xl text-dark mb-1">{name}</div>
        <div className="font-body text-sm text-gray-600 mb-2">{description}</div>

        {progress !== undefined && maxProgress !== undefined && !isUnlocked && (
          <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-dark">
            <div
              className="bg-teal h-full rounded-full"
              style={{ width: `${Math.min((progress / maxProgress) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>

      <div className="px-3 py-1 rounded-full text-xs font-bold uppercase">
        <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase", rarityBadgeStyles[rarity])}>
          {rarity}
        </span>
      </div>
    </Card>
  );
}

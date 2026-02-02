"use client";

import { useEffect, useState } from "react";

interface AchievementToastProps {
  icon: string;
  name: string;
  rarity: string;
  onClose: () => void;
}

export function AchievementToast({ icon, name, rarity, onClose }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const rarityColors = {
    common: "from-gray-500 to-gray-600",
    rare: "from-blue-500 to-blue-600",
    epic: "from-purple-500 to-purple-600",
    legendary: "from-yellow-400 to-orange-500",
  };

  return (
    <div
      className={`fixed top-24 right-6 z-50 transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-cream border-4 border-dark rounded-2xl shadow-[6px_6px_0_var(--color-dark)] p-4 flex items-center gap-4 min-w-[300px]">
        <div
          className={`w-16 h-16 border-3 border-dark rounded-xl flex items-center justify-center text-4xl bg-gradient-to-br ${rarityColors[rarity as keyof typeof rarityColors]} animate-pulse-slow`}
        >
          {icon}
        </div>

        <div className="flex-1">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Achievement Unlocked!
          </div>
          <div className="font-display text-xl text-dark">{name}</div>
        </div>

        <button
          onClick={onClose}
          className="text-dark hover:text-orange transition-colors p-1 text-xl font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function AchievementToastProvider() {
  const [toasts, setToasts] = useState<Array<{ id: string; icon: string; name: string; rarity: string }>>([]);

  useEffect(() => {
    // Listen for achievement unlock events
    const handleAchievementUnlock = (event: any) => {
      const { achievement } = event.detail;
      setToasts((prev) => [...prev, { id: Date.now().toString(), ...achievement }]);
    };

    window.addEventListener("achievement-unlocked", handleAchievementUnlock);
    return () => window.removeEventListener("achievement-unlocked", handleAchievementUnlock);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {toasts.map((toast) => (
        <AchievementToast
          key={toast.id}
          icon={toast.icon}
          name={toast.name}
          rarity={toast.rarity}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}

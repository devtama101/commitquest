import { ReactNode } from "react";
import { Card } from "./Card";
import { cn } from "./cn";

interface CharacterCardProps {
  icon: ReactNode;
  name: string;
  title: string;
  rotate?: "left" | "right" | "none";
  delay?: number;
}

export function CharacterCard({ icon, name, title, rotate = "none", delay = 0 }: CharacterCardProps) {
  const rotations = {
    left: "-rotate-2",
    right: "rotate-2",
    none: "rotate-0",
  };

  return (
    <Card
      variant="character"
      className={cn(
        "p-6 w-[150px] text-center animate-float",
        rotations[rotate],
        delay > 0 && `[animation-delay:${delay}s]`
      )}
    >
      <div className="w-20 h-20 bg-teal border-3 border-dark rounded-full mx-auto mb-4 flex items-center justify-center text-5xl">
        {icon}
      </div>
      <div className="font-display text-xl text-dark">{name}</div>
      <div className="font-body font-bold text-teal-dark text-sm">{title}</div>
    </Card>
  );
}

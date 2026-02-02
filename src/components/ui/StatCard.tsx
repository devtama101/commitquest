import { ReactNode } from "react";
import { Card } from "./Card";
import { cn } from "./cn";

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  className?: string;
  animate?: boolean;
}

export function StatCard({ icon, value, label, className, animate = false }: StatCardProps) {
  return (
    <Card className={cn("p-8 text-center", className)}>
      <div className={cn("text-5xl mb-4", animate && "animate-flicker")}>{icon}</div>
      <div className="font-display text-5xl text-orange text-shadow-sm mb-2">{value}</div>
      <div className="font-body font-bold text-dark text-lg">{label}</div>
    </Card>
  );
}

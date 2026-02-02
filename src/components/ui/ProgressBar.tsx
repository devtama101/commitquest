import { cn } from "./cn";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max, className, showLabel = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-2 font-body font-bold text-sm">
          <span>Progress</span>
          <span>
            {value} / {max}
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-dark overflow-hidden">
        <div
          className="bg-gradient-to-r from-teal to-teal-dark h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

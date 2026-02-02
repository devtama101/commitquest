import { HTMLAttributes, forwardRef } from "react";
import { cn } from "./cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "achievement" | "character";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const baseStyles = "bg-cream border-4 border-dark rounded-2xl transition-all duration-200";

    const variants = {
      default: "shadow-[6px_6px_0_var(--color-dark)] hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--color-dark)]",
      achievement: "shadow-[5px_5px_0_var(--color-dark)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--color-dark)]",
      character: "shadow-[6px_6px_0_var(--color-dark)] hover:rotate-0 hover:scale-105",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

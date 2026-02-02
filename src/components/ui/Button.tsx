import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "./cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "github" | "gitlab" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "font-body font-bold border-3 border-dark rounded-full transition-all duration-200 inline-flex items-center justify-center gap-2";
    const shadowStyles = "shadow-[4px_4px_0_var(--color-dark)]";

    const variants = {
      primary: "bg-orange text-white hover:bg-orange-dark hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-dark)] active:translate-x-1 active:translate-y-1 active:shadow-none",
      secondary: "bg-teal text-white hover:bg-teal-dark hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-dark)]",
      github: "bg-[#333] text-white hover:bg-[#444] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-dark)]",
      gitlab: "bg-[#FC6D26] text-white hover:bg-[#e85d2a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-dark)]",
      ghost: "bg-transparent text-dark hover:bg-cream hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-dark)]",
      danger: "bg-red-500 text-white hover:bg-red-600 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-dark)]",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, shadowStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

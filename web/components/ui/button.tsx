import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md";
}

const variants = {
  primary:
    "bg-accent text-white hover:opacity-95 shadow-md shadow-accent/20 active:scale-[0.98] font-semibold dark:bg-gradient-to-r dark:from-violet-600 dark:to-indigo-600",
  secondary:
    "bg-surface-raised hover:bg-border text-ink border border-border hover:border-border-strong active:scale-[0.98]",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface-raised",
  outline:
    "border border-border text-ink bg-surface hover:bg-surface-raised hover:border-border-strong active:scale-[0.98]",
};

const sizes = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-9.5 px-4 text-sm rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

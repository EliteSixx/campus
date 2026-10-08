import { SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-border bg-surface pl-3 pr-8 text-sm font-medium text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none shadow-sm autofill:bg-transparent",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-md border border-border bg-surface px-3 text-sm font-medium text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none shadow-sm autofill:bg-transparent",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-border bg-surface p-3 text-sm font-medium text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none shadow-sm autofill:bg-transparent",
        className
      )}
      {...props}
    />
  );
}

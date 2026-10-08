import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-md border border-border bg-surface px-3 text-sm font-medium text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none shadow-sm",
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
        "w-full rounded-md border border-border bg-surface p-3 text-sm font-medium text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none shadow-sm",
        className
      )}
      {...props}
    />
  );
}

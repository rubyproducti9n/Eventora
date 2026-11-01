import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-stone-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-rose-600 focus-visible:ring-rose-600",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />
        {error && <p className="text-xs text-rose-700">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

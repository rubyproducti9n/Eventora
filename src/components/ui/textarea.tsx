import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-stone-700">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-rose-600 focus-visible:ring-rose-600",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && <p id={errorId} className="text-xs text-rose-700" role="alert">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

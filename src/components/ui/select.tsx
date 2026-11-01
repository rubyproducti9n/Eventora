import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, options, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-stone-700">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-rose-600 focus-visible:ring-rose-600",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p id={errorId} className="text-xs text-rose-700" role="alert">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

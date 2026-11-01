import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

    const variantStyles = {
      primary: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 focus-visible:ring-slate-900 border border-slate-900/10 shadow-xs",
      secondary: "bg-stone-100 text-stone-900 hover:bg-stone-200 active:bg-stone-300 focus-visible:ring-stone-400 border border-stone-200/60",
      outline: "border border-stone-300 bg-transparent text-stone-800 hover:bg-stone-100 focus-visible:ring-stone-400",
      ghost: "bg-transparent text-stone-700 hover:bg-stone-100 focus-visible:ring-stone-400",
      destructive: "bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900 focus-visible:ring-rose-700 shadow-xs",
      accent: "bg-orange-700 text-white hover:bg-orange-800 active:bg-orange-900 focus-visible:ring-orange-700 shadow-xs",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-base gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

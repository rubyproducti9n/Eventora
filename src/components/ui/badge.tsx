import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "accent";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-stone-200/80 text-stone-800 border-stone-300",
    secondary: "bg-stone-100 text-stone-700 border-stone-200",
    outline: "bg-transparent text-stone-700 border-stone-300",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-900 border-amber-200",
    destructive: "bg-rose-50 text-rose-800 border-rose-200",
    accent: "bg-orange-50 text-orange-800 border-orange-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-normal normal-case",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

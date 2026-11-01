import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  colorClass?: string;
}

export function Progress({ className, value = 0, max = 100, colorClass = "bg-stone-800", ...props }: ProgressProps) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-stone-200/60", className)}
      {...props}
    >
      <div
        className={cn("h-full", colorClass)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

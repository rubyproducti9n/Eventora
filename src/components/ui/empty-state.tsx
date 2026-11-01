import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = <Sparkles className="h-6 w-6 text-stone-400" />,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-stone-300 rounded-md bg-stone-50/60",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white border border-stone-200 mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      <p className="mt-1 text-xs text-stone-500 max-w-sm">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

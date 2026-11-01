import * as React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "destructive";
  title?: string;
  children: React.ReactNode;
}

export function Alert({ variant = "info", title, children, className, ...props }: AlertProps) {
  const icons = {
    info: <Info className="h-4 w-4 text-stone-600 shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />,
    destructive: <AlertCircle className="h-4 w-4 text-rose-700 shrink-0" />,
  };

  const variants = {
    info: "bg-stone-100 border-stone-200 text-stone-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    destructive: "bg-rose-50 border-rose-200 text-rose-900",
  };

  return (
    <div
      role="alert"
      className={cn("flex gap-2.5 rounded-md border p-3.5 text-xs leading-relaxed", variants[variant], className)}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        <div className="opacity-90">{children}</div>
      </div>
    </div>
  );
}

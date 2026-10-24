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
    info: <Info className="h-5 w-5 text-indigo-600 shrink-0" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
    destructive: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
  };

  const variants = {
    info: "bg-indigo-50/70 border-indigo-200 text-indigo-900",
    success: "bg-emerald-50/70 border-emerald-200 text-emerald-900",
    warning: "bg-amber-50/70 border-amber-200 text-amber-900",
    destructive: "bg-rose-50/70 border-rose-200 text-rose-900",
  };

  return (
    <div
      role="alert"
      className={cn("flex gap-3 rounded-lg border p-4 text-sm leading-relaxed", variants[variant], className)}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-medium mb-0.5">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}

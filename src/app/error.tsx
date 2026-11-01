"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log unexpected client runtime errors safely
    console.error("Eventora application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-md border border-stone-200 bg-white p-6 shadow-sm text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-700">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-stone-900">Something went wrong</h2>
          <p className="text-xs text-stone-600">
            An unexpected error occurred while loading this view. Your saved planning data remains safe in storage.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Button size="sm" onClick={() => reset()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </Button>
          <Link href="/">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Home className="h-3.5 w-3.5" />
              Return home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

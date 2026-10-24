"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { EventWizard } from "@/components/event-wizard/event-wizard";

export default function NewEventPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/events" className="text-slate-500 hover:text-slate-900 transition-colors">
          <Button variant="ghost" size="sm" className="gap-1.5 pl-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold">
          <Sparkles className="h-4 w-4" />
          <span>Assisted Planning Engine</span>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create a New Celebration
        </h1>
        <p className="text-sm text-slate-500">
          Enter your celebration specifications to configure your event foundation.
        </p>
      </div>

      <EventWizard />
    </div>
  );
}

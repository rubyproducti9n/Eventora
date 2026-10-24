"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useEvents } from "@/lib/hooks/use-events";
import { Button, EmptyState } from "@/components/ui";
import { EventWizard } from "@/components/event-wizard/event-wizard";

export function EditEventContent() {
  const params = useParams();
  const eventId = params?.id as string;
  const { events, isLoading } = useEvents();

  const event = events.find((e) => e.id === eventId);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded-md" />
        <div className="h-10 w-64 bg-slate-200 rounded-lg" />
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/events">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        <EmptyState
          title="Event Not Found"
          description="The event you are attempting to edit cannot be found or was removed."
          action={
            <Link href="/events">
              <Button>View All Events</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/events/${eventId}`} className="text-slate-500 hover:text-slate-900 transition-colors">
          <Button variant="ghost" size="sm" className="gap-1.5 pl-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Event Plan
          </Button>
        </Link>
        <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold">
          <Sparkles className="h-4 w-4" />
          <span>Edit Mode</span>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Edit Event Details
        </h1>
        <p className="text-sm text-slate-500">
          Update the foundation details and financial parameters for {event.title}.
        </p>
      </div>

      <EventWizard initialData={event} isEditing={true} />
    </div>
  );
}

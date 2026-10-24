import { Suspense } from "react";
import { Metadata } from "next";
import { EventDetailContent } from "@/components/events/event-detail-content";

export const metadata: Metadata = {
  title: "Event Details - Eventora",
  description: "View timeline milestones, budget allocations, and vendor coordination.",
};

export default function EventDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-slate-200 rounded-md" />
          <div className="h-40 bg-slate-200 rounded-2xl" />
        </div>
      }
    >
      <EventDetailContent />
    </Suspense>
  );
}

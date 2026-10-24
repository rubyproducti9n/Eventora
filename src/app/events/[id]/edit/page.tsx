import { Suspense } from "react";
import { Metadata } from "next";
import { EditEventContent } from "@/components/events/edit-event-content";

export const metadata: Metadata = {
  title: "Edit Event - Eventora",
  description: "Modify parameters and preferences for your event.",
};

export default function EditEventPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-slate-200 rounded-md" />
          <div className="h-40 bg-slate-200 rounded-2xl" />
        </div>
      }
    >
      <EditEventContent />
    </Suspense>
  );
}

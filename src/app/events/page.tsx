import { Metadata } from "next";
import { EventsListContent } from "@/components/events/events-list-content";

export const metadata: Metadata = {
  title: "My Events - Eventora",
  description: "View and manage all your saved celebrations and event planning roadmaps.",
};

export default function EventsPage() {
  return <EventsListContent />;
}

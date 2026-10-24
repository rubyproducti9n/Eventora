import { Metadata } from "next";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard - Eventora",
  description: "Overview of your planned events, budgets, timelines, and pending tasks.",
};

export default function HomePage() {
  return <DashboardContent />;
}

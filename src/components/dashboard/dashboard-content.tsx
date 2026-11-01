"use client";

import Link from "next/link";
import { PlusCircle, Calendar, RefreshCw } from "lucide-react";
import { useEvents } from "@/lib/hooks/use-events";
import { calculateDashboardMetrics, sortEventsByDate, isEventUpcoming, getPendingTasks } from "@/lib/dashboard/metrics";
import { Button, EmptyState, Alert } from "@/components/ui";
import { OverviewMetrics } from "@/components/dashboard/overview-metrics";
import { UpcomingEventsList } from "@/components/dashboard/upcoming-events-list";
import { PendingTasksCard } from "@/components/dashboard/pending-tasks-card";

export function DashboardContent() {
  const { events, isLoading, error, refreshEvents, resetSampleEvents } = useEvents();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 bg-stone-200/60 rounded-md w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-20 bg-stone-200/60 rounded-md" />
          <div className="h-20 bg-stone-200/60 rounded-md" />
          <div className="h-20 bg-stone-200/60 rounded-md" />
          <div className="h-20 bg-stone-200/60 rounded-md" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-stone-200/60 rounded-md lg:col-span-2" />
          <div className="h-64 bg-stone-200/60 rounded-md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" title="Unable to load dashboard">
          {error}
        </Alert>
        <Button onClick={refreshEvents} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry loading
        </Button>
      </div>
    );
  }

  const metrics = calculateDashboardMetrics(events);
  const upcomingEvents = sortEventsByDate(events.filter((e) => isEventUpcoming(e.date)));
  const pendingTasks = getPendingTasks(events, 5);

  return (
    <div className="space-y-8">
      {/* 1. Header / Hero section - grounded editorial presentation */}
      <section className="border-b border-stone-200/80 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
              Event overview
            </h1>
            <p className="text-sm text-stone-600 max-w-xl">
              Organize preparation milestones, monitor budget utilization, and track vendor requirements.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/events/new">
              <Button size="sm" className="gap-1.5">
                <PlusCircle className="h-3.5 w-3.5" />
                New event
              </Button>
            </Link>
            <Link href="/events">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                All events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* First-Time Empty State if user has zero events */}
      {events.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-8 w-8 text-stone-400" />}
          title="No events yet"
          description="Create your first event plan or load sample demo data to see Eventora in action."
          action={
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/events/new">
                <Button size="sm">
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  Create event
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={resetSampleEvents}>
                Load sample demo data
              </Button>
            </div>
          }
        />
      ) : (
        <>
          {/* 2. Key Metrics Bar */}
          <OverviewMetrics metrics={metrics} />

          {/* 3. Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming events column */}
            <div className="lg:col-span-2">
              <UpcomingEventsList events={upcomingEvents} />
            </div>

            {/* Quick action items column */}
            <div>
              <PendingTasksCard tasks={pendingTasks} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

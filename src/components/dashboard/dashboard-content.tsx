"use client";

import Link from "next/link";
import { Sparkles, PlusCircle, Calendar, RefreshCw } from "lucide-react";
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
        <div className="h-44 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 rounded-xl lg:col-span-2" />
          <div className="h-64 bg-slate-200 rounded-xl" />
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
          Retry Loading
        </Button>
      </div>
    );
  }

  const metrics = calculateDashboardMetrics(events);
  const upcomingEvents = sortEventsByDate(events.filter((e) => isEventUpcoming(e.date)));
  const pendingTasks = getPendingTasks(events, 5);

  return (
    <div className="space-y-8">
      {/* 1. Welcome Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-10 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs border border-white/15">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              Event Planning Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome to Eventora
            </h1>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Organize timelines, allocate budgets, and coordinate vendor checklists for your weddings, parties, and milestones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/events/new">
              <Button size="md" className="bg-white text-indigo-950 hover:bg-indigo-50 font-semibold shadow-sm">
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Create New Event
              </Button>
            </Link>
            <Link href="/events">
              <Button size="md" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                <Calendar className="h-4 w-4 mr-1.5" />
                All Saved Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* First-Time Empty State if user has zero events */}
      {events.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-10 w-10 text-indigo-500" />}
          title="No events yet"
          description="Your dashboard is currently quiet. Create your first event plan or load sample demo data to see Eventora in action."
          action={
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/events/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Event
                </Button>
              </Link>
              <Button variant="outline" onClick={resetSampleEvents}>
                Load Sample Events
              </Button>
            </div>
          }
        />
      ) : (
        <>
          {/* 2. Overview Metrics */}
          <section>
            <OverviewMetrics metrics={metrics} />
          </section>

          {/* 3. Upcoming Events & Recent Planning Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {upcomingEvents.length > 0 ? (
                <UpcomingEventsList events={upcomingEvents} />
              ) : (
                <EmptyState
                  icon={<Calendar className="h-8 w-8 text-slate-400" />}
                  title="No upcoming events"
                  description="You have saved past events, but no upcoming celebrations scheduled. Schedule a new one to continue planning."
                  action={
                    <Link href="/events/new">
                      <Button size="sm">
                        <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                        Schedule Upcoming Event
                      </Button>
                    </Link>
                  }
                />
              )}
            </div>

            <div className="space-y-6">
              <PendingTasksCard tasks={pendingTasks} />

              {/* Quick Actions Helper */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Planning Quick Actions</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/events/new">
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs font-normal">
                      <PlusCircle className="h-3.5 w-3.5 mr-2 text-indigo-600" />
                      Plan another celebration
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs font-normal text-slate-600"
                    onClick={resetSampleEvents}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-2 text-slate-400" />
                    Reset to Demo Sample Events
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

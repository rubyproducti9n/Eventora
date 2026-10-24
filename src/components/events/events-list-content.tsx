"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlusCircle, Calendar, MapPin, Users, DollarSign, ArrowRight, Trash2, Edit3, AlertTriangle } from "lucide-react";
import { useEvents } from "@/lib/hooks/use-events";
import { formatDate, formatCurrency } from "@/lib/utils";
import { isEventUpcoming, sortEventsByDate } from "@/lib/dashboard/metrics";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, EmptyState, Modal } from "@/components/ui";
import { EventDetails } from "@/types/event";

export function EventsListContent() {
  const { events, isLoading, deleteEvent, resetSampleEvents } = useEvents();

  // State for deletion confirmation dialog
  const [eventToDelete, setEventToDelete] = useState<EventDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-md w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-slate-200 rounded-xl" />
          <div className="h-48 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const sortedEvents = sortEventsByDate(events, false); // Latest events first

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      deleteEvent(eventToDelete.id);
      setEventToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">My Events</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and manage all your planned celebrations ({events.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/events/new">
            <Button className="w-full sm:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-10 w-10 text-indigo-500" />}
          title="No events found"
          description="You don't have any saved events yet. Start by generating an event plan or loading sample celebrations."
          action={
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/events/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create First Event
                </Button>
              </Link>
              <Button variant="outline" onClick={resetSampleEvents}>
                Load Sample Events
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event) => {
            const upcoming = isEventUpcoming(event.date);
            const totalMilestones = event.plan?.timeline?.length || 0;
            const completedMilestones = event.plan?.timeline?.filter((m) => m.isCompleted).length || 0;

            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow flex flex-col justify-between border-slate-200">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="capitalize text-xs">
                      {event.eventType}
                    </Badge>
                    <Badge variant={upcoming ? "success" : "outline"} className="text-[11px]">
                      {upcoming ? "Upcoming" : "Past Event"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {event.guestCount} Guests
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-900">
                        <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                        {formatCurrency(event.targetBudget, event.currency)}
                      </span>
                    </div>
                  </div>

                  {totalMilestones > 0 ? (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-medium text-slate-700">{completedMilestones}/{totalMilestones}</span> milestones completed
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                      Plan not yet generated
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Link href={`/events/${event.id}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full text-xs">
                        Open Plan
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </Link>
                    <Link href={`/events/${event.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-slate-500 hover:text-slate-800 p-2 h-8 w-8"
                        title="Edit event details"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 h-8 w-8"
                      onClick={() => setEventToDelete(event)}
                      title="Delete event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <Modal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        title="Confirm Event Deletion"
        description="Are you sure you want to delete this event?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">
                {eventToDelete?.title}
              </p>
              <p className="mt-0.5">
                This will permanently delete this event, along with all associated milestones, budget items, and vendor lists. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEventToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Delete Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

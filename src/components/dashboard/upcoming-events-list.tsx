import Link from "next/link";
import { Calendar, MapPin, Users, DollarSign, ArrowRight, CheckCircle2 } from "lucide-react";
import { EventDetails } from "@/types/event";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Progress } from "@/components/ui";

interface UpcomingEventsListProps {
  events: EventDetails[];
}

export function UpcomingEventsList({ events }: UpcomingEventsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Events</h2>
          <p className="text-xs sm:text-sm text-slate-500">Ordered chronologically by nearest event date</p>
        </div>
        <Link href="/events">
          <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-800">
            View All ({events.length})
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => {
          // Calculate task progress
          const milestones = event.plan?.timeline || [];
          const completedCount = milestones.filter((m) => m.isCompleted).length;
          const totalMilestones = milestones.length;
          const progressPercentage = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

          return (
            <Card key={event.id} className="hover:shadow-md transition-all flex flex-col justify-between border-slate-200">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="secondary" className="capitalize mb-2 text-[11px]">
                      {event.eventType}
                    </Badge>
                    <CardTitle className="text-base sm:text-lg line-clamp-1">{event.title}</CardTitle>
                  </div>
                  <Badge variant={event.status === "planning" ? "default" : "outline"} className="capitalize shrink-0 text-xs">
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{event.guestCount} Guests</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-slate-900">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatCurrency(event.targetBudget)}</span>
                    </div>
                  </div>
                </div>

                {totalMilestones > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-indigo-500" />
                        Milestones Progress
                      </span>
                      <span>
                        {completedCount} of {totalMilestones} done ({progressPercentage}%)
                      </span>
                    </div>
                    <Progress value={completedCount} max={totalMilestones} />
                  </div>
                )}

                <div className="pt-2">
                  <Link href={`/events/${event.id}`} className="block">
                    <Button variant="secondary" size="sm" className="w-full justify-center group text-xs font-semibold">
                      Open Event Plan
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

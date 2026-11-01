import Link from "next/link";
import { Calendar, MapPin, Users, DollarSign, ArrowRight } from "lucide-react";
import { EventDetails } from "@/types/event";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Progress } from "@/components/ui";

interface UpcomingEventsListProps {
  events: EventDetails[];
}

export function UpcomingEventsList({ events }: UpcomingEventsListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-stone-900 tracking-tight">Upcoming events</h2>
          <p className="text-xs text-stone-500">Ordered chronologically by nearest date</p>
        </div>
        <Link href="/events">
          <Button variant="ghost" size="sm" className="text-xs text-stone-700 hover:text-stone-900">
            View all ({events.length})
            <ArrowRight className="h-3 w-3 ml-1" />
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
            <Card key={event.id} className="flex flex-col justify-between border-stone-200">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="capitalize text-[11px]">
                      {event.eventType}
                    </Badge>
                    <CardTitle className="text-base line-clamp-1">{event.title}</CardTitle>
                  </div>
                  <Badge variant={event.status === "planning" ? "default" : "outline"} className="capitalize shrink-0 text-[11px]">
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-stone-700">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-stone-400" />
                      <span>{event.guestCount} guests</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-stone-900">
                      <DollarSign className="h-3.5 w-3.5 text-stone-400" />
                      <span>{formatCurrency(event.targetBudget)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-stone-100">
                  <div className="flex justify-between text-[11px] text-stone-500">
                    <span>Preparation progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-1.5 bg-stone-100" />
                </div>

                <div className="pt-2">
                  <Link href={`/events/${event.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-center">
                      Manage plan
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

import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { PendingTaskItem } from "@/lib/dashboard/metrics";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@/components/ui";

interface PendingTasksCardProps {
  tasks: PendingTaskItem[];
}

export function PendingTasksCard({ tasks }: PendingTasksCardProps) {
  if (tasks.length === 0) {
    return (
      <Card className="border-stone-200">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Pending action items</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-md bg-stone-50 border border-stone-200/60">
            <CheckCircle2 className="h-6 w-6 text-stone-400 mb-2" />
            <p className="text-xs font-medium text-stone-800">All caught up</p>
            <p className="text-[11px] text-stone-500 mt-0.5">No outstanding milestones or vendor bookings pending.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-stone-200">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold">Priority planning items</CardTitle>
          <p className="text-[11px] text-stone-500 mt-0.5">Milestones needing attention</p>
        </div>
        <Badge variant="warning" className="text-[10px]">
          {tasks.length} items
        </Badge>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="divide-y divide-stone-100">
          {tasks.map((task) => (
            <div key={`${task.eventId}-${task.id}`} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Badge variant={task.type === "milestone" ? "secondary" : "outline"} className="text-[10px] px-1 py-0">
                    {task.type === "milestone" ? "milestone" : "vendor"}
                  </Badge>
                  <span className="text-[11px] text-stone-600 truncate">
                    {task.eventTitle}
                  </span>
                </div>
                <p className="text-xs font-medium text-stone-800 leading-snug truncate">{task.taskTitle}</p>
                <div className="flex items-center gap-1 text-[11px] text-stone-400">
                  <Clock className="h-3 w-3" />
                  <span>{task.timeframe}</span>
                </div>
              </div>

              <Link href={`/events/${task.eventId}`} className="shrink-0 self-center">
                <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-stone-700">
                  View
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

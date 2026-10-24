import Link from "next/link";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { PendingTaskItem } from "@/lib/dashboard/metrics";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@/components/ui";

interface PendingTasksCardProps {
  tasks: PendingTaskItem[];
}

export function PendingTasksCard({ tasks }: PendingTasksCardProps) {
  if (tasks.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-semibold">Pending Action Items</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-lg bg-slate-50 border border-slate-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-slate-800">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">No outstanding milestones or vendor bookings pending.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">Priority Planning Items</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Key milestones needing your attention</p>
        </div>
        <Badge variant="warning" className="text-[10px]">
          {tasks.length} Action Items
        </Badge>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        <div className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <div key={`${task.eventId}-${task.id}`} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={task.type === "milestone" ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">
                    {task.type === "milestone" ? "Milestone" : "Vendor"}
                  </Badge>
                  <span className="text-[11px] font-medium text-indigo-600 truncate max-w-[150px]">
                    {task.eventTitle}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800 leading-snug">{task.taskTitle}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{task.timeframe}</span>
                </div>
              </div>

              <Link href={`/events/${task.eventId}`} className="shrink-0 self-center">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

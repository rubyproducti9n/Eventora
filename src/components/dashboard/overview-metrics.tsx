import { Calendar, CheckCircle2, DollarSign, Sparkles } from "lucide-react";
import { DashboardMetrics } from "@/lib/dashboard/metrics";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui";

interface OverviewMetricsProps {
  metrics: DashboardMetrics;
}

export function OverviewMetrics({ metrics }: OverviewMetricsProps) {
  const cards = [
    {
      title: "Total events",
      value: metrics.totalEvents.toString(),
      description: "Planned celebrations",
      icon: Sparkles,
    },
    {
      title: "Upcoming events",
      value: metrics.upcomingEventsCount.toString(),
      description: "Scheduled ahead",
      icon: Calendar,
    },
    {
      title: "Pending tasks",
      value: metrics.pendingTasksCount.toString(),
      description: "Milestones and vendors",
      icon: CheckCircle2,
    },
    {
      title: "Planned budget",
      value: formatCurrency(metrics.totalPlannedBudget),
      description: "For upcoming events",
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="border-stone-200/90">
            <CardContent className="p-4 flex items-baseline justify-between">
              <div className="space-y-1">
                <p className="text-xs text-stone-500 font-normal">{card.title}</p>
                <p className="text-xl font-semibold tracking-tight text-stone-900">{card.value}</p>
                <p className="text-[11px] text-stone-500">{card.description}</p>
              </div>
              <div className="h-8 w-8 rounded-md bg-stone-100 flex items-center justify-center shrink-0 text-stone-600">
                <Icon className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

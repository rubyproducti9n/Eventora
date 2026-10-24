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
      title: "Total Events",
      value: metrics.totalEvents.toString(),
      description: "Planned celebrations",
      icon: Sparkles,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Upcoming Events",
      value: metrics.upcomingEventsCount.toString(),
      description: "Scheduled ahead",
      icon: Calendar,
      color: "text-sky-600 bg-sky-50",
    },
    {
      title: "Pending Tasks",
      value: metrics.pendingTasksCount.toString(),
      description: "Milestones & vendors",
      icon: CheckCircle2,
      color: "text-amber-600 bg-amber-50",
    },
    {
      title: "Planned Budget",
      value: formatCurrency(metrics.totalPlannedBudget),
      description: "For upcoming events",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="border-slate-200/80 hover:border-slate-300 transition-all shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500">{card.description}</p>
              </div>
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

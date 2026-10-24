import { EventDetails } from "@/types/event";

export interface DashboardMetrics {
  totalEvents: number;
  upcomingEventsCount: number;
  pendingTasksCount: number;
  totalPlannedBudget: number;
  totalActualBudget: number;
}

/**
 * Checks if an event is upcoming (scheduled today or in the future).
 */
export function isEventUpcoming(dateString: string): boolean {
  if (!dateString) return false;
  const eventDate = new Date(dateString);
  if (isNaN(eventDate.getTime())) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

/**
 * Sorts events chronologically (earliest first).
 */
export function sortEventsByDate(events: EventDetails[], ascending: boolean = true): EventDetails[] {
  return [...events].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    return ascending ? timeA - timeB : timeB - timeA;
  });
}

/**
 * Calculates high-level dashboard metrics across all saved events.
 */
export function calculateDashboardMetrics(events: EventDetails[]): DashboardMetrics {
  let pendingTasksCount = 0;
  let totalPlannedBudget = 0;
  let totalActualBudget = 0;
  let upcomingEventsCount = 0;

  for (const event of events) {
    const upcoming = isEventUpcoming(event.date);
    if (upcoming) {
      upcomingEventsCount += 1;
      totalPlannedBudget += event.targetBudget || 0;
    }

    // Count pending tasks across timeline & vendor checklists
    if (event.plan?.timeline) {
      for (const item of event.plan.timeline) {
        if (!item.isCompleted) {
          pendingTasksCount += 1;
        }
      }
    }

    if (event.plan?.vendorChecklist) {
      for (const vendor of event.plan.vendorChecklist) {
        if (vendor.status !== "confirmed") {
          pendingTasksCount += 1;
        }
      }
    }

    // Accumulate actual budget if items logged
    if (event.plan?.budgetBreakdown) {
      for (const item of event.plan.budgetBreakdown) {
        if (typeof item.actualAmount === "number") {
          totalActualBudget += item.actualAmount;
        }
      }
    }
  }

  return {
    totalEvents: events.length,
    upcomingEventsCount,
    pendingTasksCount,
    totalPlannedBudget,
    totalActualBudget,
  };
}

/**
 * Extracts upcoming milestones / pending tasks across upcoming events.
 */
export interface PendingTaskItem {
  id: string;
  eventId: string;
  eventTitle: string;
  taskTitle: string;
  timeframe: string;
  type: "milestone" | "vendor";
}

export function getPendingTasks(events: EventDetails[], limit: number = 5): PendingTaskItem[] {
  const upcomingEvents = sortEventsByDate(events.filter((e) => isEventUpcoming(e.date)));
  const tasks: PendingTaskItem[] = [];

  for (const event of upcomingEvents) {
    if (event.plan?.timeline) {
      for (const milestone of event.plan.timeline) {
        if (!milestone.isCompleted) {
          tasks.push({
            id: milestone.id,
            eventId: event.id,
            eventTitle: event.title,
            taskTitle: milestone.title,
            timeframe: milestone.timeframe,
            type: "milestone",
          });
          if (tasks.length >= limit) return tasks;
        }
      }
    }

    if (event.plan?.vendorChecklist) {
      for (const vendor of event.plan.vendorChecklist) {
        if (vendor.status !== "confirmed") {
          tasks.push({
            id: vendor.id,
            eventId: event.id,
            eventTitle: event.title,
            taskTitle: `Book / Confirm ${vendor.role}`,
            timeframe: vendor.status.toUpperCase(),
            type: "vendor",
          });
          if (tasks.length >= limit) return tasks;
        }
      }
    }
  }

  return tasks;
}

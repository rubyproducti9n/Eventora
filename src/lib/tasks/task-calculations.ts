import { TimelineMilestone, VendorChecklistItem } from "@/types/event";

export interface TaskProgressMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  taskPercentage: number;
  totalVendors: number;
  confirmedVendors: number;
  pendingVendors: number;
  vendorPercentage: number;
}

/**
 * Checks whether a task milestone is overdue.
 * A task is overdue only if it is NOT completed and its explicit due date or event date has passed.
 */
export function isTaskOverdue(task: TimelineMilestone, fallbackEventDate?: string): boolean {
  if (task.isCompleted) return false;

  const targetDateStr = task.dueDate || fallbackEventDate;
  if (!targetDateStr) return false;

  const targetDate = new Date(targetDateStr);
  if (isNaN(targetDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return targetDate < today;
}

/**
 * Calculates planning and vendor progress deterministically.
 */
export function calculatePlanningProgress(
  milestones: TimelineMilestone[] = [],
  vendors: VendorChecklistItem[] = [],
  eventDate?: string
): TaskProgressMetrics {
  const totalTasks = milestones.length;
  let completedTasks = 0;
  let overdueTasks = 0;

  for (const m of milestones) {
    if (m.isCompleted) {
      completedTasks += 1;
    } else {
      if (isTaskOverdue(m, eventDate)) {
        overdueTasks += 1;
      }
    }
  }

  const pendingTasks = totalTasks - completedTasks;
  const taskPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalVendors = vendors.length;
  let confirmedVendors = 0;

  for (const v of vendors) {
    if (v.status === "confirmed" || v.status === "booked") {
      confirmedVendors += 1;
    }
  }

  const pendingVendors = totalVendors - confirmedVendors;
  const vendorPercentage = totalVendors > 0 ? Math.round((confirmedVendors / totalVendors) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    taskPercentage,
    totalVendors,
    confirmedVendors,
    pendingVendors,
    vendorPercentage,
  };
}

/**
 * Sorts milestones chronologically:
 * 1. Tasks with explicit due dates
 * 2. Uncompleted before completed
 */
export function sortMilestones(milestones: TimelineMilestone[]): TimelineMilestone[] {
  return [...milestones].sort((a, b) => {
    // If completion differs, uncompleted first
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    // If due dates exist, sort by date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });
}

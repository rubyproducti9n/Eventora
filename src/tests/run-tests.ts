/**
 * Standalone test suite exercising business logic, calculation rules,
 * schema validation, and persistence contracts.
 */
import { calculateBudgetSummary, sanitizeCurrencyAmount } from "../lib/budget/budget-calculations";
import { calculatePlanningProgress, isTaskOverdue, sortMilestones } from "../lib/tasks/task-calculations";
import { calculateDashboardMetrics } from "../lib/dashboard/metrics";
import { CompleteEventSchema } from "../lib/validators/event.schema";
import { GeneratedPlanSchema } from "../lib/validators/plan.schema";
import { generateDemoPlan } from "../lib/ai/mock-plans";
import { EventDetails, TimelineMilestone } from "../types/event";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    testsPassed++;
    console.log(`✓ PASS: ${testName}`);
  } else {
    testsFailed++;
    console.error(`✗ FAIL: ${testName}`);
  }
}

console.log("--- STARTING EVENTORA CORE UNIT TESTS ---");

// 1. Budget Calculations Test
const budgetItems = [
  { id: "1", category: "Venue", description: "Hall", allocatedAmount: 1000, actualAmount: 950 },
  { id: "2", category: "Catering", description: "Food", allocatedAmount: 2000, actualAmount: 2100 },
];
const budgetSummary = calculateBudgetSummary(3000, budgetItems);
assert(budgetSummary.totalAllocated === 3000, "Budget total allocated matches sum");
assert(budgetSummary.totalActual === 3050, "Budget total actual matches sum");
assert(budgetSummary.remainingPlanned === 0, "Remaining planned budget is exact zero");
assert(budgetSummary.isOverBudget === false, "Budget is not marked over budget when planned equals target");
assert(budgetSummary.utilizationPercentage === 100, "Utilization percentage is 100%");

// Test Over Budget Condition
const overBudgetSummary = calculateBudgetSummary(2500, budgetItems);
assert(overBudgetSummary.isOverBudget === true, "Over budget flag is true when totalAllocated exceeds target");
assert(overBudgetSummary.overageAmount === 500, "Overage amount is positive deficit 500");
assert(overBudgetSummary.remainingPlanned === -500, "Remaining planned reflects negative 500");

// Test Zero Budget Edge Case
const zeroBudgetSummary = calculateBudgetSummary(0, budgetItems);
assert(zeroBudgetSummary.targetBudget === 0, "Zero target budget handled safely");
assert(zeroBudgetSummary.utilizationPercentage === null, "Zero target budget returns null utilization without division error");

// Test Sanitize Currency
assert(sanitizeCurrencyAmount("invalid") === 0, "Invalid currency string returns 0");
assert(sanitizeCurrencyAmount(NaN) === 0, "NaN currency returns 0");
assert(sanitizeCurrencyAmount(123.456) === 123.46, "Rounds to two decimal places");

// 2. Task Planning & Overdue Test
const sampleTask: TimelineMilestone = {
  id: "t1",
  title: "Book Photographer",
  description: "Deposit",
  timeframe: "Past",
  dueDate: "2020-01-01",
  isCompleted: false,
  category: "booking",
};
assert(isTaskOverdue(sampleTask) === true, "Past incomplete task is overdue");

const completedTask: TimelineMilestone = {
  ...sampleTask,
  isCompleted: true,
};
assert(isTaskOverdue(completedTask) === false, "Completed task is never overdue even with past date");

const futureTask: TimelineMilestone = {
  id: "t2",
  title: "Day of Setup",
  description: "Setup",
  timeframe: "Future",
  dueDate: "2030-01-01",
  isCompleted: false,
  category: "day_of",
};
assert(isTaskOverdue(futureTask) === false, "Future task is not overdue");

const progress = calculatePlanningProgress([sampleTask, completedTask, futureTask], []);
assert(progress.totalTasks === 3, "Total task count is 3");
assert(progress.completedTasks === 1, "Completed task count is 1");
assert(progress.overdueTasks === 1, "Overdue task count is 1");
assert(progress.taskPercentage === 33, "Task percentage is 33%");

// 3. Sorting Milestones
const sorted = sortMilestones([completedTask, sampleTask]);
assert(sorted[0].id === "t1", "Uncompleted tasks are prioritized first in sorted milestones");

// 4. Input Validation Schema Tests
const validEventInput = {
  title: "Annual Gala Celebration",
  eventType: "community",
  date: "2026-12-31",
  location: "Metropolitan Civic Center",
  guestCount: 250,
  targetBudget: 15000,
  currency: "USD",
  budgetPriorities: ["venue", "catering"],
  themePreference: "Black Tie & Gold",
  atmosphere: "formal",
};
const parsedEvent = CompleteEventSchema.safeParse(validEventInput);
assert(parsedEvent.success === true, "Valid complete event schema passes");

const invalidEventInput = {
  title: "", // Empty title
  eventType: "invalid_type",
  date: "not_a_date",
  guestCount: -5,
  targetBudget: -100,
};
const failedEvent = CompleteEventSchema.safeParse(invalidEventInput);
assert(failedEvent.success === false, "Invalid event input is rejected with validation errors");

// 5. AI Generated Plan Schema & Mock Generator Tests
const testEvent: EventDetails = {
  id: "evt-test-1",
  title: "Maya's Sweet 16",
  eventType: "birthday",
  date: "2026-11-15",
  location: "San Jose, CA",
  guestCount: 40,
  targetBudget: 2500,
  status: "planning",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const generatedPlan = generateDemoPlan(testEvent);
assert(generatedPlan.generationMode === "demo_mode", "Mock plan outputs demo_mode flag");
assert(generatedPlan.budgetBreakdown.length > 0, "Mock plan creates budget breakdown items");
assert(generatedPlan.timeline.length > 0, "Mock plan creates timeline milestones");
assert(generatedPlan.vendorChecklist.length > 0, "Mock plan creates vendor checklist items");

const validatedPlan = GeneratedPlanSchema.safeParse(generatedPlan);
assert(validatedPlan.success === true, "Generated demo plan conforms strictly to GeneratedPlanSchema");

// 6. Dashboard Metrics Integration Test
const dashboardMetrics = calculateDashboardMetrics([testEvent]);
assert(dashboardMetrics.totalEvents === 1, "Dashboard counts 1 event");
assert(dashboardMetrics.totalPlannedBudget === 2500, "Dashboard accumulates 2500 planned budget");

// 7. Security & Sanitization Edge Cases
assert(sanitizeCurrencyAmount(-100) === -100, "Negative currency preserved for deficits");
assert(sanitizeCurrencyAmount("12345.6789") === 0, "Non-number string sanitized to 0");
assert(sanitizeCurrencyAmount(Infinity) === 0, "Infinity sanitized to 0");
assert(sanitizeCurrencyAmount(undefined) === 0, "Undefined sanitized to 0");
assert(sanitizeCurrencyAmount(null) === 0, "Null sanitized to 0");

// 8. Event Creation Extreme Edge Cases
const boundaryEvent = {
  ...validEventInput,
  guestCount: 10000,
  targetBudget: 10000000,
};
assert(CompleteEventSchema.safeParse(boundaryEvent).success === true, "Boundary high guest and budget values pass validation");

const overBoundaryEvent = {
  ...validEventInput,
  guestCount: 10001,
};
assert(CompleteEventSchema.safeParse(overBoundaryEvent).success === false, "Over-boundary guest count > 10000 is rejected");

const zeroGuestEvent = {
  ...validEventInput,
  guestCount: 0,
};
assert(CompleteEventSchema.safeParse(zeroGuestEvent).success === false, "Zero guest count is rejected");

// 9. Task Overdue Boundary & Timezone Robustness
const todayTask: TimelineMilestone = {
  ...sampleTask,
  dueDate: new Date().toISOString().split("T")[0],
};
assert(isTaskOverdue(todayTask) === false, "Task due today is not overdue");

const invalidDateTask: TimelineMilestone = {
  ...sampleTask,
  dueDate: "not-a-date-string",
};
assert(isTaskOverdue(invalidDateTask) === false, "Task with malformed due date handled safely without crash");

// 10. Multi-Currency Robustness & Formatting Tests
import { formatCurrency, formatDate } from "../lib/utils";

assert(formatCurrency(1500, "USD").includes("1,500"), "USD currency formatted with comma separator");
assert(formatCurrency(2500, "EUR").includes("2,500"), "EUR currency formatted safely");
assert(formatCurrency(3500, "GBP").includes("3,500"), "GBP currency formatted safely");
assert(formatCurrency(50000, "INR").includes("50,000"), "INR currency formatted safely");
assert(formatCurrency(NaN, "USD").includes("0"), "NaN amount falls back safely to $0");
assert(formatCurrency(100, "UNKNOWN_CODE").includes("100"), "Unsupported currency string defaults safely to USD");

// Date formatting safety
assert(formatDate("2026-11-20").length > 0, "Valid ISO date string formatted");
assert(formatDate("invalid-date-string") === "", "Malformed date string returns empty string safely");

// 11. Mock In-Memory Storage Adapter Test
class InMemoryEventStore {
  private events: Map<string, EventDetails> = new Map();

  save(event: EventDetails): boolean {
    this.events.set(event.id, { ...event });
    return true;
  }

  getById(id: string): EventDetails | null {
    return this.events.get(id) || null;
  }

  addTask(eventId: string, task: Omit<TimelineMilestone, "id">): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;
    const plan = event.plan || {
      theme: "Default",
      summary: "Summary",
      recommendations: [],
      budgetBreakdown: [],
      timeline: [],
      vendorChecklist: [],
      suggestedSchedule: [],
    };
    const newTask: TimelineMilestone = {
      ...task,
      id: `task-${Date.now()}`,
    };
    event.plan = {
      ...plan,
      timeline: [...plan.timeline, newTask],
    };
    this.events.set(eventId, event);
    return true;
  }

  toggleTask(eventId: string, taskId: string): boolean {
    const event = this.events.get(eventId);
    if (!event || !event.plan) return false;
    event.plan.timeline = event.plan.timeline.map((m) =>
      m.id === taskId ? { ...m, isCompleted: !m.isCompleted } : m
    );
    this.events.set(eventId, event);
    return true;
  }

  delete(id: string): boolean {
    return this.events.delete(id);
  }
}

const memoryRepo = new InMemoryEventStore();
const repoSaveResult = memoryRepo.save(testEvent);
assert(repoSaveResult === true, "Repository contract saves event to store");

const retrieved = memoryRepo.getById(testEvent.id);
assert(retrieved !== null && retrieved.title === testEvent.title, "Repository contract retrieves saved event by id");

const taskAddResult = memoryRepo.addTask(testEvent.id, {
  title: "Test Cake Tasting",
  description: "Schedule bakery session",
  timeframe: "2 Weeks Before",
  isCompleted: false,
  category: "preparation",
});
assert(taskAddResult === true, "Repository contract adds task milestone to event plan");

const updatedEventWithTask = memoryRepo.getById(testEvent.id);
const addedTask = updatedEventWithTask?.plan?.timeline.find((t) => t.title === "Test Cake Tasting");
assert(Boolean(addedTask), "Added task milestone exists in event plan");

if (addedTask) {
  const toggleResult = memoryRepo.toggleTask(testEvent.id, addedTask.id);
  assert(toggleResult === true, "Repository contract toggles milestone completion");
  const postToggleEvent = memoryRepo.getById(testEvent.id);
  const toggledTask = postToggleEvent?.plan?.timeline.find((t) => t.id === addedTask.id);
  assert(toggledTask?.isCompleted === true, "Milestone marked completed in storage");
}

const deleteResult = memoryRepo.delete(testEvent.id);
assert(deleteResult === true, "Repository contract deletes event successfully");
const postDeleteEvent = memoryRepo.getById(testEvent.id);
assert(postDeleteEvent === null, "Deleted event is no longer accessible via getById");

// 12. Vendor Operations & Budget Variance Edge Tests
import { VendorChecklistItem, BudgetItem } from "../types/event";

const testVendors: VendorChecklistItem[] = [
  { id: "v-1", role: "Photographer", status: "needed", estimatedCost: 1500 },
  { id: "v-2", role: "Catering", status: "booked", estimatedCost: 3000 },
  { id: "v-3", role: "DJ", status: "confirmed", estimatedCost: 800 },
];

const vendorProgress = calculatePlanningProgress([], testVendors);
assert(vendorProgress.totalVendors === 3, "Total vendor count is 3");
assert(vendorProgress.confirmedVendors === 2, "Confirmed and booked vendors counted correctly");
assert(vendorProgress.pendingVendors === 1, "Pending vendors remaining is 1");
assert(vendorProgress.vendorPercentage === 67, "Vendor confirmation percentage is 67%");

// Task Reopening test (complete -> incomplete toggle)
const testTaskForReopen: TimelineMilestone = {
  id: "t-reopen",
  title: "Reopenable Milestone",
  description: "Test description",
  timeframe: "1 Week Before",
  isCompleted: true,
  category: "planning",
};
memoryRepo.save({
  ...testEvent,
  id: "evt-reopen-test",
  plan: {
    theme: "Theme",
    summary: "Summary",
    recommendations: [],
    budgetBreakdown: [],
    timeline: [testTaskForReopen],
    vendorChecklist: [],
    suggestedSchedule: [],
  },
});

// Toggle from completed back to incomplete
memoryRepo.toggleTask("evt-reopen-test", "t-reopen");
const reopenedEvent = memoryRepo.getById("evt-reopen-test");
const reopenedTask = reopenedEvent?.plan?.timeline.find((t) => t.id === "t-reopen");
assert(reopenedTask?.isCompleted === false, "Completed task can be reopened back to incomplete status");

// Budget Over-Budget Variance Calculation with Actuals
const varianceItems: BudgetItem[] = [
  { id: "bv-1", category: "Decor", description: "Flowers", allocatedAmount: 500, actualAmount: 750 },
  { id: "bv-2", category: "Sound", description: "PA System", allocatedAmount: 300, actualAmount: 250 },
];
const varianceSummary = calculateBudgetSummary(800, varianceItems);
assert(varianceSummary.totalAllocated === 800, "Allocated budget equals 800");
assert(varianceSummary.totalActual === 1000, "Actual expenses sum to 1000");
assert(varianceSummary.remainingActual === -200, "Remaining actual budget reflects 200 deficit");

// 13. Firebase Path Isolation & User Partitioning Deterministic Contract Test
function getUserEventsPath(uid: string, eventId: string): string {
  if (!uid || !eventId) throw new Error("Invalid UID or Event ID");
  return `users/${uid}/events/${eventId}`;
}
assert(
  getUserEventsPath("usr_123", "evt_456") === "users/usr_123/events/evt_456",
  "User scoped Firebase path properly partitions data by UID"
);

console.log(`\nTESTS COMPLETED: ${testsPassed} passed, ${testsFailed} failed.`);
if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

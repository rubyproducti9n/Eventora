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

console.log(`\nTESTS COMPLETED: ${testsPassed} passed, ${testsFailed} failed.`);
if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

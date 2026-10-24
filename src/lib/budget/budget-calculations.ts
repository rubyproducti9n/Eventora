import { BudgetItem } from "@/types/event";

export interface BudgetSummaryCalculations {
  targetBudget: number;
  totalAllocated: number;
  totalActual: number;
  remainingPlanned: number;
  remainingActual: number;
  utilizationPercentage: number | null; // null when targetBudget <= 0
  isOverBudget: boolean;
  overageAmount: number;
}

/**
 * Safely cleans and rounds a monetary number to 2 decimal places to avoid floating point anomalies.
 */
export function sanitizeCurrencyAmount(amount: unknown): number {
  if (typeof amount !== "number" || isNaN(amount) || !isFinite(amount)) {
    return 0;
  }
  return Math.round(amount * 100) / 100;
}

/**
 * Calculates complete deterministic budget totals, balances, and utilization percentage.
 */
export function calculateBudgetSummary(
  targetBudget: number,
  items: BudgetItem[] = []
): BudgetSummaryCalculations {
  const safeTarget = Math.max(0, sanitizeCurrencyAmount(targetBudget));
  let totalAllocated = 0;
  let totalActual = 0;

  for (const item of items) {
    totalAllocated += Math.max(0, sanitizeCurrencyAmount(item.allocatedAmount));
    if (typeof item.actualAmount === "number") {
      totalActual += Math.max(0, sanitizeCurrencyAmount(item.actualAmount));
    }
  }

  totalAllocated = sanitizeCurrencyAmount(totalAllocated);
  totalActual = sanitizeCurrencyAmount(totalActual);

  const remainingPlanned = sanitizeCurrencyAmount(safeTarget - totalAllocated);
  const remainingActual = sanitizeCurrencyAmount(safeTarget - totalActual);
  const isOverBudget = remainingPlanned < 0;
  const overageAmount = isOverBudget ? sanitizeCurrencyAmount(Math.abs(remainingPlanned)) : 0;

  let utilizationPercentage: number | null = null;
  if (safeTarget > 0) {
    utilizationPercentage = Math.round((totalAllocated / safeTarget) * 100);
  }

  return {
    targetBudget: safeTarget,
    totalAllocated,
    totalActual,
    remainingPlanned,
    remainingActual,
    utilizationPercentage,
    isOverBudget,
    overageAmount,
  };
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind merge support.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const SUPPORTED_CURRENCY_CODES = new Set(["USD", "EUR", "GBP", "CAD", "AUD", "INR"]);

/**
 * Formats a currency value safely with fallback for unknown currency codes.
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  const safeAmount = typeof amount === "number" && !isNaN(amount) && isFinite(amount) ? amount : 0;
  const normalizedCode = typeof currency === "string" && SUPPORTED_CURRENCY_CODES.has(currency.toUpperCase())
    ? currency.toUpperCase()
    : "USD";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normalizedCode,
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

/**
 * Formats a date string or timestamp cleanly.
 */
export function formatDate(dateInput: string | Date | number): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

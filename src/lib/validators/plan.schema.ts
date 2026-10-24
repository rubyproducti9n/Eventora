import { z } from "zod";

export const BudgetItemSchema = z.object({
  id: z.string().default(() => `b-${Math.random().toString(36).substring(2, 7)}`),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  allocatedAmount: z.number().nonnegative("Budget allocation must be non-negative"),
  actualAmount: z.number().nonnegative().optional(),
  isPaid: z.boolean().default(false),
});

export const TimelineMilestoneSchema = z.object({
  id: z.string().default(() => `m-${Math.random().toString(36).substring(2, 7)}`),
  timeframe: z.string().min(1, "Timeframe is required"),
  title: z.string().min(1, "Milestone title is required"),
  description: z.string().min(1, "Description is required"),
  isCompleted: z.boolean().default(false),
  category: z.enum(["planning", "booking", "preparation", "day_of"]).default("planning"),
});

export const VendorChecklistItemSchema = z.object({
  id: z.string().default(() => `v-${Math.random().toString(36).substring(2, 7)}`),
  role: z.string().min(1, "Vendor role is required"),
  status: z.enum(["needed", "contacted", "booked", "confirmed"]).default("needed"),
  notes: z.string().optional(),
  estimatedCost: z.number().nonnegative().optional(),
  contactName: z.string().optional(),
});

export const ScheduleItemSchema = z.object({
  time: z.string().min(1, "Time is required"),
  activity: z.string().min(1, "Activity is required"),
});

/**
 * Strict schema for AI generated plan responses
 */
export const GeneratedPlanSchema = z.object({
  theme: z.string().min(1, "Theme is required"),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  recommendations: z.array(z.string()).min(1, "At least one recommendation is required"),
  budgetBreakdown: z.array(BudgetItemSchema).min(1, "Budget breakdown is required"),
  timeline: z.array(TimelineMilestoneSchema).min(1, "Timeline is required"),
  vendorChecklist: z.array(VendorChecklistItemSchema).min(1, "Vendor checklist is required"),
  suggestedSchedule: z.array(ScheduleItemSchema).default([]),
  practicalNotes: z.array(z.string()).optional().default([]),
});

export type GeneratedPlanOutput = z.infer<typeof GeneratedPlanSchema>;

import { z } from "zod";

export const EventTypeEnum = z.enum(["wedding", "birthday", "community", "other"], {
  message: "Please select a valid event type",
});

export const CurrencyEnum = z.enum(["USD", "EUR", "GBP", "CAD", "AUD", "INR"], {
  message: "Please select a supported currency",
});

export const AtmosphereEnum = z.enum(["casual", "formal", "traditional", "contemporary", "festive"], {
  message: "Please select an event atmosphere",
});

export const BudgetPriorityEnum = z.enum([
  "venue",
  "catering",
  "decor",
  "entertainment",
  "photography",
  "contingency",
]);

/**
 * Step 1: Basic Event Information Schema
 */
export const EventBasicSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Event name must be at least 3 characters")
    .max(100, "Event name cannot exceed 100 characters"),
  eventType: EventTypeEnum,
  date: z
    .string()
    .min(1, "Event date is required")
    .refine((val) => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Please provide a valid date"),
  location: z
    .string()
    .trim()
    .min(2, "Location or city is required")
    .max(150, "Location cannot exceed 150 characters"),
  guestCount: z
    .coerce
    .number({ message: "Guest count must be a number" })
    .int("Guest count must be a whole number")
    .min(1, "Guest count must be at least 1")
    .max(10000, "Guest count cannot exceed 10,000"),
});

/**
 * Step 2: Budget Information Schema
 */
export const EventBudgetSchema = z.object({
  targetBudget: z
    .coerce
    .number({ message: "Budget must be a valid amount" })
    .min(10, "Budget must be at least $10")
    .max(10000000, "Budget cannot exceed $10,000,000"),
  currency: CurrencyEnum.default("USD"),
  budgetPriorities: z.array(BudgetPriorityEnum).optional().default([]),
});

/**
 * Step 3: Theme and Preferences Schema (Optional personalization)
 */
export const EventPreferencesSchema = z.object({
  themePreference: z.string().trim().max(100, "Theme cannot exceed 100 characters").optional().default(""),
  atmosphere: AtmosphereEnum.optional().default("casual"),
  cateringRequirements: z.string().trim().max(200, "Catering notes cannot exceed 200 characters").optional().default(""),
  dietaryRestrictions: z.string().trim().max(200, "Dietary restrictions cannot exceed 200 characters").optional().default(""),
  entertainmentPreferences: z.string().trim().max(200, "Entertainment notes cannot exceed 200 characters").optional().default(""),
  notes: z.string().trim().max(500, "Additional notes cannot exceed 500 characters").optional().default(""),
});

/**
 * Complete Event Creation & Validation Schema
 */
export const CompleteEventSchema = EventBasicSchema.merge(EventBudgetSchema).merge(EventPreferencesSchema);

export type EventFormData = z.infer<typeof CompleteEventSchema>;
export type EventBasicFormData = z.infer<typeof EventBasicSchema>;
export type EventBudgetFormData = z.infer<typeof EventBudgetSchema>;
export type EventPreferencesFormData = z.infer<typeof EventPreferencesSchema>;

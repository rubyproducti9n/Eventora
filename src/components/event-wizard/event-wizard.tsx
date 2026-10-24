"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Palette,
  FileCheck,
} from "lucide-react";
import {
  CompleteEventSchema,
  EventBasicSchema,
  EventBudgetSchema,
  EventPreferencesSchema,
  EventFormData,
} from "@/lib/validators/event.schema";
import { EventDetails } from "@/types/event";
import { saveEvent } from "@/lib/storage/event-storage";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Alert,
} from "@/components/ui";

interface EventWizardProps {
  initialData?: EventDetails;
  isEditing?: boolean;
}

const STEPS = [
  { id: 1, title: "Basics", description: "Date, venue & guest count", icon: Calendar },
  { id: 2, title: "Budget", description: "Financial allocation", icon: DollarSign },
  { id: 3, title: "Preferences", description: "Theme, style & food", icon: Palette },
  { id: 4, title: "Review", description: "Confirm & create", icon: FileCheck },
];

export function EventWizard({ initialData, isEditing = false }: EventWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || "",
    eventType: initialData?.eventType || "wedding",
    date: initialData?.date || "",
    location: initialData?.location || "",
    guestCount: initialData?.guestCount || 50,
    targetBudget: initialData?.targetBudget || 5000,
    currency: (initialData?.currency as "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "INR") || "USD",
    budgetPriorities: (initialData?.budgetPriorities as ("venue" | "catering" | "decor" | "entertainment" | "photography" | "contingency")[]) || ["catering", "venue"],
    themePreference: initialData?.themePreference || "",
    atmosphere: (initialData?.atmosphere as "casual" | "formal" | "traditional" | "contemporary" | "festive") || "casual",
    cateringRequirements: initialData?.cateringRequirements || "",
    dietaryRestrictions: initialData?.dietaryRestrictions || "",
    entertainmentPreferences: initialData?.entertainmentPreferences || "",
    notes: initialData?.notes || "",
  });

  // Validation Errors per Step
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const toggleBudgetPriority = (priority: "venue" | "catering" | "decor" | "entertainment" | "photography" | "contingency") => {
    setFormData((prev) => {
      const exists = prev.budgetPriorities?.includes(priority);
      const updated = exists
        ? prev.budgetPriorities?.filter((p) => p !== priority)
        : [...(prev.budgetPriorities || []), priority];
      return { ...prev, budgetPriorities: updated };
    });
  };

  // Validate Step before advancing
  const validateStep = (stepNumber: number): boolean => {
    setFieldErrors({});
    if (stepNumber === 1) {
      const result = EventBasicSchema.safeParse({
        title: formData.title,
        eventType: formData.eventType,
        date: formData.date,
        location: formData.location,
        guestCount: formData.guestCount,
      });
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          errors[field] = issue.message;
        }
        setFieldErrors(errors);
        return false;
      }
    } else if (stepNumber === 2) {
      const result = EventBudgetSchema.safeParse({
        targetBudget: formData.targetBudget,
        currency: formData.currency,
        budgetPriorities: formData.budgetPriorities,
      });
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          errors[field] = issue.message;
        }
        setFieldErrors(errors);
        return false;
      }
    } else if (stepNumber === 3) {
      const result = EventPreferencesSchema.safeParse({
        themePreference: formData.themePreference,
        atmosphere: formData.atmosphere,
        cateringRequirements: formData.cateringRequirements,
        dietaryRestrictions: formData.dietaryRestrictions,
        entertainmentPreferences: formData.entertainmentPreferences,
        notes: formData.notes,
      });
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          errors[field] = issue.message;
        }
        setFieldErrors(errors);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setFieldErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Final full schema validation
    const validationResult = CompleteEventSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      setSubmitError(firstIssue ? firstIssue.message : "Please review all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const eventId = initialData?.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const normalizedEvent: EventDetails = {
        id: eventId,
        title: formData.title.trim(),
        eventType: formData.eventType,
        date: formData.date,
        location: formData.location.trim(),
        guestCount: Number(formData.guestCount),
        targetBudget: Number(formData.targetBudget),
        currency: formData.currency,
        budgetPriorities: formData.budgetPriorities,
        themePreference: formData.themePreference?.trim() || undefined,
        atmosphere: formData.atmosphere,
        cateringRequirements: formData.cateringRequirements?.trim() || undefined,
        dietaryRestrictions: formData.dietaryRestrictions?.trim() || undefined,
        entertainmentPreferences: formData.entertainmentPreferences?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        status: initialData?.status || "planning",
        plan: initialData?.plan, // Preserve existing plan if editing
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // If creating a new event or regenerating, request plan generation from API endpoint
      if (!initialData?.plan) {
        try {
          const res = await fetch("/api/plan/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: normalizedEvent }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.plan) {
              normalizedEvent.plan = data.plan;
            }
          }
        } catch (genErr) {
          console.warn("AI generation call failed, saving event foundation:", genErr);
        }
      }

      // Persist to storage
      saveEvent(normalizedEvent);

      // Navigate to event view
      router.push(`/events/${eventId}`);
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitError("Failed to save event. Please check your storage settings and try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stepper Progress Bar */}
      <nav aria-label="Progress" className="w-full">
        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => {
                    // Allow navigating backwards or jumping if steps up to target are valid
                    if (step.id < currentStep) {
                      setCurrentStep(step.id);
                    } else if (step.id === currentStep + 1 && validateStep(currentStep)) {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                      : isCompleted
                      ? "border-slate-200 bg-white hover:border-slate-300"
                      : "border-slate-100 bg-slate-50/60 opacity-60 cursor-not-allowed"
                  }`}
                  disabled={step.id > currentStep + 1}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? "bg-indigo-600 text-white"
                          : isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent ? "text-indigo-950" : isCompleted ? "text-slate-800" : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{step.description}</p>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Main Wizard Form Card */}
      <Card className="border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          {/* STEP 1: BASIC INFORMATION */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Step 1 of 4</span>
                </div>
                <CardTitle>Basic Event Information</CardTitle>
                <CardDescription>
                  Tell us what you are celebrating and the core details of your gathering.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <Input
                  label="Event Name *"
                  placeholder="e.g. Maya & Daniel's Wedding, Sarah's 30th Birthday Bash"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  error={fieldErrors.title}
                  maxLength={100}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Event Type *"
                    value={formData.eventType}
                    onChange={(e) => updateField("eventType", e.target.value as "wedding" | "birthday" | "community" | "other")}
                    options={[
                      { value: "wedding", label: "Wedding Celebration" },
                      { value: "birthday", label: "Birthday Party" },
                      { value: "community", label: "Community Gathering / Meetup" },
                      { value: "other", label: "Other Celebration" },
                    ]}
                    error={fieldErrors.eventType}
                  />

                  <Input
                    label="Event Date *"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    error={fieldErrors.date}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Location / Venue City *"
                    placeholder="e.g. Austin, TX or The Grand Conservatory"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    error={fieldErrors.location}
                    maxLength={150}
                    required
                  />

                  <Input
                    label="Expected Guest Count *"
                    type="number"
                    min={1}
                    max={10000}
                    placeholder="50"
                    value={formData.guestCount}
                    onChange={(e) => updateField("guestCount", parseInt(e.target.value, 10) || 0)}
                    error={fieldErrors.guestCount}
                    required
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 2: BUDGET ALLOCATION */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Step 2 of 4</span>
                </div>
                <CardTitle>Budget & Financial Allocation</CardTitle>
                <CardDescription>
                  Define your spending ceiling and designate key priorities for intelligent budget distribution.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Total Target Budget *"
                      type="number"
                      min={10}
                      step={50}
                      placeholder="5000"
                      value={formData.targetBudget}
                      onChange={(e) => updateField("targetBudget", parseFloat(e.target.value) || 0)}
                      error={fieldErrors.targetBudget}
                      required
                    />
                  </div>

                  <Select
                    label="Currency *"
                    value={formData.currency}
                    onChange={(e) => updateField("currency", e.target.value as "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "INR")}
                    options={[
                      { value: "USD", label: "USD ($)" },
                      { value: "EUR", label: "EUR (€)" },
                      { value: "GBP", label: "GBP (£)" },
                      { value: "CAD", label: "CAD ($)" },
                      { value: "AUD", label: "AUD ($)" },
                      { value: "INR", label: "INR (₹)" },
                    ]}
                    error={fieldErrors.currency}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Budget Priorities (Optional)
                  </label>
                  <p className="text-xs text-slate-500">
                    Select the categories where you would prefer the AI assistant to invest the largest budget share:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {[
                      { id: "venue", label: "Venue & Ambiance" },
                      { id: "catering", label: "Food & Bar" },
                      { id: "decor", label: "Florals & Decor" },
                      { id: "entertainment", label: "Music & Shows" },
                      { id: "photography", label: "Photography / Video" },
                      { id: "contingency", label: "Safety / Emergency Buffer" },
                    ].map((item) => {
                      const isSelected = formData.budgetPriorities?.includes(
                        item.id as "venue" | "catering" | "decor" | "entertainment" | "photography" | "contingency"
                      );
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            toggleBudgetPriority(
                              item.id as "venue" | "catering" | "decor" | "entertainment" | "photography" | "contingency"
                            )
                          }
                          className={`flex items-center gap-2 p-3 text-xs font-semibold rounded-lg border text-left transition-colors ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-sm border flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="h-3 w-3" />}
                          </div>
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 3: THEME & PREFERENCES */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <Palette className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Step 3 of 4</span>
                </div>
                <CardTitle>Theme & Personalization Preferences</CardTitle>
                <CardDescription>
                  Help tailor the generated plan with vibe, food, and entertainment specifics.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Theme or Aesthetic (Optional)"
                    placeholder="e.g. Rustic Autumn, Neon Retro 80s, Bohemian Garden"
                    value={formData.themePreference}
                    onChange={(e) => updateField("themePreference", e.target.value)}
                    error={fieldErrors.themePreference}
                    maxLength={100}
                  />

                  <Select
                    label="Atmosphere / Vibe"
                    value={formData.atmosphere}
                    onChange={(e) =>
                      updateField(
                        "atmosphere",
                        e.target.value as "casual" | "formal" | "traditional" | "contemporary" | "festive"
                      )
                    }
                    options={[
                      { value: "casual", label: "Casual & Relaxed" },
                      { value: "formal", label: "Formal & Black Tie" },
                      { value: "festive", label: "Festive & High Energy" },
                      { value: "traditional", label: "Traditional & Classic" },
                      { value: "contemporary", label: "Contemporary & Chic" },
                    ]}
                    error={fieldErrors.atmosphere}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Catering / Food Style (Optional)"
                    placeholder="e.g. Buffet, 3-course plated, Food trucks, Cocktail tapas"
                    value={formData.cateringRequirements}
                    onChange={(e) => updateField("cateringRequirements", e.target.value)}
                    error={fieldErrors.cateringRequirements}
                    maxLength={200}
                  />

                  <Input
                    label="Dietary Restrictions (Optional)"
                    placeholder="e.g. Vegetarian, Gluten-free, Nut allergies, Halal"
                    value={formData.dietaryRestrictions}
                    onChange={(e) => updateField("dietaryRestrictions", e.target.value)}
                    error={fieldErrors.dietaryRestrictions}
                    maxLength={200}
                  />
                </div>

                <Input
                  label="Entertainment Preferences (Optional)"
                  placeholder="e.g. Live jazz trio, DJ, Photo booth, Science craft stations"
                  value={formData.entertainmentPreferences}
                  onChange={(e) => updateField("entertainmentPreferences", e.target.value)}
                  error={fieldErrors.entertainmentPreferences}
                  maxLength={200}
                />

                <Textarea
                  label="Special Notes or Requirements (Optional)"
                  placeholder="e.g. Needs wheelchair access, surprise entry at 7:00 PM, outdoor curfew at 10 PM"
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  error={fieldErrors.notes}
                  rows={3}
                  maxLength={500}
                />
              </CardContent>
            </>
          )}

          {/* STEP 4: REVIEW BEFORE SUBMISSION */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <FileCheck className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Step 4 of 4</span>
                </div>
                <CardTitle>Review Your Event Plan Details</CardTitle>
                <CardDescription>
                  Confirm the parameters before creating the event plan. You can return to any section to make adjustments.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {submitError && (
                  <Alert variant="destructive" title="Submission Issue">
                    {submitError}
                  </Alert>
                )}

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 divide-y divide-slate-200 space-y-4">
                  {/* Basics Review */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        1. Basic Details
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-indigo-600 h-7 px-2"
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div>
                        <span className="text-slate-500">Event Title:</span>{" "}
                        <strong className="text-slate-900">{formData.title}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Type:</span>{" "}
                        <Badge variant="secondary" className="capitalize text-xs">
                          {formData.eventType}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-slate-500">Scheduled Date:</span>{" "}
                        <strong className="text-slate-900">{formatDate(formData.date)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Location:</span>{" "}
                        <strong className="text-slate-900">{formData.location}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Guest Count:</span>{" "}
                        <strong className="text-slate-900">{formData.guestCount} guests</strong>
                      </div>
                    </div>
                  </div>

                  {/* Budget Review */}
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        2. Financial Allocation
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs text-indigo-600 h-7 px-2"
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="text-xs sm:text-sm space-y-1">
                      <div>
                        <span className="text-slate-500">Target Budget:</span>{" "}
                        <strong className="text-emerald-700 text-base">
                          {formatCurrency(formData.targetBudget, formData.currency)}
                        </strong>
                      </div>
                      {formData.budgetPriorities && formData.budgetPriorities.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                          <span className="text-slate-500 mr-1">Priorities:</span>
                          {formData.budgetPriorities.map((p) => (
                            <Badge key={p} variant="outline" className="text-[11px] capitalize">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preferences Review */}
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        3. Style & Preferences
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs text-indigo-600 h-7 px-2"
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div>
                        <span className="text-slate-500">Theme:</span>{" "}
                        <span className="text-slate-800">{formData.themePreference || "Default / Open"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Atmosphere:</span>{" "}
                        <span className="text-slate-800 capitalize">{formData.atmosphere}</span>
                      </div>
                      {formData.cateringRequirements && (
                        <div>
                          <span className="text-slate-500">Catering:</span>{" "}
                          <span className="text-slate-800">{formData.cateringRequirements}</span>
                        </div>
                      )}
                      {formData.dietaryRestrictions && (
                        <div>
                          <span className="text-slate-500">Dietary:</span>{" "}
                          <span className="text-slate-800">{formData.dietaryRestrictions}</span>
                        </div>
                      )}
                      {formData.entertainmentPreferences && (
                        <div>
                          <span className="text-slate-500">Entertainment:</span>{" "}
                          <span className="text-slate-800">{formData.entertainmentPreferences}</span>
                        </div>
                      )}
                    </div>
                    {formData.notes && (
                      <div className="pt-2 text-xs text-slate-600 bg-white p-2.5 rounded-md border border-slate-200">
                        <span className="font-semibold text-slate-700">Special Notes:</span> {formData.notes}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Card Navigation Controls */}
          <CardFooter className="flex items-center justify-between border-t border-slate-100 p-5 bg-slate-50/50">
            <div>
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <Link href="/events">
                  <Button type="button" variant="ghost" size="sm" className="text-slate-500">
                    Cancel
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep < 4 ? (
                <Button type="button" size="md" onClick={handleNext} className="gap-1.5">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="md"
                  variant="accent"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  className="gap-2 shadow-md"
                >
                  <Sparkles className="h-4 w-4" />
                  {isEditing ? "Save Changes" : "Save & Create Event"}
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

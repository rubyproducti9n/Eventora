import { GoogleGenAI } from "@google/genai";
import { EventDetails, GeneratedEventPlan } from "@/types/event";
import { buildEventPlanningPrompt } from "./prompts";
import { generateDemoPlan } from "./mock-plans";
import { GeneratedPlanSchema } from "@/lib/validators/plan.schema";

export interface PlanGenerationResult {
  plan: GeneratedEventPlan;
  mode: "live_ai" | "demo_mode";
  error?: string;
}

/**
 * Service to orchestrate event plan generation using Gemini AI with fallback to deterministic Demo Mode.
 * Ensures the API key remains strictly server-side.
 */
export async function generateEventPlan(event: EventDetails): Promise<PlanGenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  // If no API key is provided, execute Demo Mode immediately
  if (!apiKey) {
    return {
      plan: generateDemoPlan(event),
      mode: "demo_mode",
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildEventPlanningPrompt(event);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI service");
    }

    // Parse and validate structured output
    const rawParsed = JSON.parse(responseText);
    const parsed = GeneratedPlanSchema.parse(rawParsed);

    // Enforce business rules: budget recalculation & allocation alignment
    const validatedBudget = parsed.budgetBreakdown.map((item, index) => {
      return {
        ...item,
        id: `b-ai-${index + 1}`,
        isPaid: false,
      };
    });

    // Normalize timeline items
    const validatedTimeline = parsed.timeline.map((m, index) => ({
      ...m,
      id: `m-ai-${index + 1}`,
      isCompleted: false,
    }));

    // Normalize vendor checklist
    const validatedVendors = parsed.vendorChecklist.map((v, index) => ({
      ...v,
      id: `v-ai-${index + 1}`,
      status: v.status || "needed",
    }));

    const finalPlan: GeneratedEventPlan = {
      theme: parsed.theme,
      summary: parsed.summary,
      recommendations: parsed.recommendations,
      budgetBreakdown: validatedBudget,
      timeline: validatedTimeline,
      vendorChecklist: validatedVendors,
      suggestedSchedule: parsed.suggestedSchedule,
      practicalNotes: parsed.practicalNotes || [],
      generationMode: "live_ai",
      generatedAt: new Date().toISOString(),
    };

    return {
      plan: finalPlan,
      mode: "live_ai",
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "AI generation failed";
    console.warn(`[Eventora AI] Provider failed (${errorMessage}), safely falling back to Demo Mode.`);

    // Graceful fallback to Demo Mode
    const fallbackPlan = generateDemoPlan(event);
    return {
      plan: fallbackPlan,
      mode: "demo_mode",
      error: `Live AI could not be contacted (${errorMessage}). Demo mode plan provided.`,
    };
  }
}

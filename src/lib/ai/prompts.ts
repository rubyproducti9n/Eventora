import { EventDetails } from "@/types/event";

export function buildEventPlanningPrompt(event: EventDetails): string {
  const priorities = event.budgetPriorities?.length
    ? event.budgetPriorities.join(", ")
    : "balanced across venue, catering, and entertainment";

  return `You are a professional event planning director and financial producer. Create a detailed, highly practical event plan for the following celebration:

Event Details:
- Title: "${event.title}"
- Event Type: ${event.eventType}
- Scheduled Date: ${event.date}
- Location: ${event.location}
- Expected Guests: ${event.guestCount}
- Available Budget: ${event.targetBudget} ${event.currency || "USD"}
- Budget Priorities: ${priorities}
- Theme / Aesthetic Preference: ${event.themePreference || "None specified (propose an elegant theme)"}
- Desired Atmosphere: ${event.atmosphere || "casual"}
- Catering & Food Requirements: ${event.cateringRequirements || "Standard catering for event type"}
- Dietary Restrictions: ${event.dietaryRestrictions || "None specified"}
- Entertainment Preferences: ${event.entertainmentPreferences || "Standard music/entertainment"}
- Special Notes: ${event.notes || "None"}

Requirements for the plan:
1. Provide a cohesive theme name and concise summary.
2. Provide at least 3 actionable, specific recommendations tailored to the guest count (${event.guestCount}) and budget.
3. Suggest a realistic budget breakdown where the sum of allocatedAmounts equals approximately ${event.targetBudget} ${event.currency || "USD"}.
4. Provide an ordered preparation timeline with milestones (from weeks before down to day-of).
5. Provide a realistic vendor checklist of essential providers needed.
6. Provide a day-of run sheet schedule.
7. Note any important assumptions or constraints.

Respond strictly in valid JSON format matching this exact schema:
{
  "theme": "string",
  "summary": "string",
  "recommendations": ["string", "string", "string"],
  "budgetBreakdown": [
    {
      "category": "string",
      "description": "string",
      "allocatedAmount": number
    }
  ],
  "timeline": [
    {
      "timeframe": "string (e.g. 6 Weeks Before)",
      "title": "string",
      "description": "string",
      "category": "planning | booking | preparation | day_of"
    }
  ],
  "vendorChecklist": [
    {
      "role": "string",
      "status": "needed",
      "estimatedCost": number
    }
  ],
  "suggestedSchedule": [
    {
      "time": "string",
      "activity": "string"
    }
  ],
  "practicalNotes": ["string"]
}`;
}

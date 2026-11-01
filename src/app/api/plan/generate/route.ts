import { NextRequest, NextResponse } from "next/server";
import { generateEventPlan } from "@/lib/ai/ai-service";
import { CompleteEventSchema } from "@/lib/validators/event.schema";
import { EventDetails } from "@/types/event";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventCandidate = body?.event;

    if (!eventCandidate || typeof eventCandidate !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload: event object required" },
        { status: 400 }
      );
    }

    // Server-side input validation using CompleteEventSchema
    const validationResult = CompleteEventSchema.safeParse(eventCandidate);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Event validation failed", 
          details: validationResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") 
        },
        { status: 400 }
      );
    }

    const event = eventCandidate as EventDetails;
    const result = await generateEventPlan(event);

    return NextResponse.json({
      success: true,
      plan: result.plan,
      mode: result.mode,
      notice: result.error || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Plan generation error";
    return NextResponse.json(
      { error: "Failed to process planning request", details: message },
      { status: 500 }
    );
  }
}

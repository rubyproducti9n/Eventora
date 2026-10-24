import { NextRequest, NextResponse } from "next/server";
import { generateEventPlan } from "@/lib/ai/ai-service";
import { EventDetails } from "@/types/event";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body?.event as EventDetails;

    if (!event || !event.title || !event.eventType || !event.date) {
      return NextResponse.json(
        { error: "Invalid event parameters provided" },
        { status: 400 }
      );
    }

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

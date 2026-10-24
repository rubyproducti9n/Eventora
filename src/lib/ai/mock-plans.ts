import { EventDetails, GeneratedEventPlan } from "@/types/event";

/**
 * Generates an intelligent, deterministic rule-based event plan when live AI is unavailable.
 * Ensures strict compliance with application schemas, budget constraints, and user preferences.
 */
export function generateDemoPlan(event: EventDetails): GeneratedEventPlan {
  const { eventType, targetBudget, guestCount, title, themePreference } = event;

  // Calculate budget proportions based on priorities
  const total = targetBudget > 0 ? targetBudget : 5000;
  
  // Custom templates per event type
  if (eventType === "wedding") {
    const venueAmount = Math.round(total * 0.35);
    const cateringAmount = Math.round(total * 0.30);
    const photoAmount = Math.round(total * 0.15);
    const decorAmount = Math.round(total * 0.10);
    const entertainmentAmount = total - (venueAmount + cateringAmount + photoAmount + decorAmount);

    return {
      theme: themePreference || "Timeless Romance & Botanical Elegance",
      summary: `A personalized wedding celebration plan for ${title} with ${guestCount} guests, optimizing venue ambiance and guest dining.`,
      generationMode: "demo_mode",
      generatedAt: new Date().toISOString(),
      recommendations: [
        `Design table arrangements to comfortably accommodate ${guestCount} guests while maintaining open sightlines.`,
        "Incorporate ambient acoustic ceremony music transitioning into curated evening entertainment.",
        "Set up an interactive signature cocktail or beverage station tailored to the season.",
        "Establish an emergency weather contingency plan 3 weeks in advance.",
      ],
      budgetBreakdown: [
        { id: `b-${Date.now()}-1`, category: "Venue & Rentals", description: "Ceremony & reception hall rental", allocatedAmount: venueAmount, isPaid: false },
        { id: `b-${Date.now()}-2`, category: "Catering & Bar", description: `Dinner & refreshments for ${guestCount} attendees`, allocatedAmount: cateringAmount, isPaid: false },
        { id: `b-${Date.now()}-3`, category: "Photography & Video", description: "Full day ceremony & reception coverage", allocatedAmount: photoAmount, isPaid: false },
        { id: `b-${Date.now()}-4`, category: "Florals & Decor", description: "Arbor florals, bouquets, and table centerpieces", allocatedAmount: decorAmount, isPaid: false },
        { id: `b-${Date.now()}-5`, category: "Music & Entertainment", description: "Ceremony musician & evening DJ/band", allocatedAmount: entertainmentAmount, isPaid: false },
      ],
      timeline: [
        { id: `m-${Date.now()}-1`, timeframe: "12 Weeks Before", title: "Finalize Venue Contract & Floorplan", description: "Confirm guest capacity, load-in times, and rental inclusions.", isCompleted: false, category: "booking" },
        { id: `m-${Date.now()}-2`, timeframe: "8 Weeks Before", title: "Send Formal Invitations & Track RSVPs", description: "Collect meal choices and dietary restrictions.", isCompleted: false, category: "planning" },
        { id: `m-${Date.now()}-3`, timeframe: "4 Weeks Before", title: "Schedule Menu & Cake Tasting", description: `Lock in meal selections and service style for ${guestCount} guests.`, isCompleted: false, category: "preparation" },
        { id: `m-${Date.now()}-4`, timeframe: "1 Week Before", title: "Final Vendor Confirmation & Rehearsal", description: "Distribute contact list and run through ceremony timing.", isCompleted: false, category: "preparation" },
        { id: `m-${Date.now()}-5`, timeframe: "Day Of - Morning", title: "Bridal Suite & Setup Supervision", description: "Inspect floral arrival and sound system setup.", isCompleted: false, category: "day_of" },
      ],
      vendorChecklist: [
        { id: `v-${Date.now()}-1`, role: "Venue Coordinator", status: "needed", estimatedCost: venueAmount },
        { id: `v-${Date.now()}-2`, role: "Catering & Bar Service", status: "needed", estimatedCost: cateringAmount },
        { id: `v-${Date.now()}-3`, role: "Wedding Photographer", status: "needed", estimatedCost: photoAmount },
        { id: `v-${Date.now()}-4`, role: "Floral Designer", status: "needed", estimatedCost: decorAmount },
        { id: `v-${Date.now()}-5`, role: "Ceremony & Reception DJ", status: "needed", estimatedCost: entertainmentAmount },
      ],
      suggestedSchedule: [
        { time: "01:00 PM", activity: "Vendor Arrival & Floral Placement" },
        { time: "03:30 PM", activity: "Guest Seating & Prelude Music" },
        { time: "04:00 PM", activity: "Wedding Ceremony" },
        { time: "04:45 PM", activity: "Cocktail Hour & Wedding Portraits" },
        { time: "06:00 PM", activity: "Dinner Reception & Welcome Speeches" },
        { time: "08:00 PM", activity: "Cake Cutting & First Dances" },
      ],
      practicalNotes: [
        "Plan generated via deterministic Demo Mode (no API key configured).",
        "Budget calculations enforce the user's allocated spending ceiling.",
      ],
    };
  }

  if (eventType === "birthday") {
    const venueAmount = Math.round(total * 0.25);
    const foodAmount = Math.round(total * 0.35);
    const activityAmount = Math.round(total * 0.20);
    const cakeAmount = Math.round(total * 0.10);
    const favorsAmount = total - (venueAmount + foodAmount + activityAmount + cakeAmount);

    return {
      theme: themePreference || "Celebration Extravaganza & Vibrant Joy",
      summary: `Birthday party plan for ${title} accommodating ${guestCount} guests with interactive entertainment and festive catering.`,
      generationMode: "demo_mode",
      generatedAt: new Date().toISOString(),
      recommendations: [
        `Prepare themed party favors for ${guestCount} guests to create lasting memories.`,
        "Organize interactive group games or performance segments to keep energy lively.",
        "Coordinate birthday cake delivery 2 hours prior to guest arrival.",
      ],
      budgetBreakdown: [
        { id: `b-${Date.now()}-1`, category: "Venue & Space Rental", description: "Party space or reserved lounge", allocatedAmount: venueAmount, isPaid: false },
        { id: `b-${Date.now()}-2`, category: "Food, Snacks & Drinks", description: `Catering or buffet for ${guestCount} attendees`, allocatedAmount: foodAmount, isPaid: false },
        { id: `b-${Date.now()}-3`, category: "Games & Entertainment", description: "Interactive host, music, or activity station", allocatedAmount: activityAmount, isPaid: false },
        { id: `b-${Date.now()}-4`, category: "Custom Birthday Cake", description: "Themed multi-tiered or custom bakery design", allocatedAmount: cakeAmount, isPaid: false },
        { id: `b-${Date.now()}-5`, category: "Decorations & Favors", description: "Balloons, signage, and guest gift bags", allocatedAmount: favorsAmount, isPaid: false },
      ],
      timeline: [
        { id: `m-${Date.now()}-1`, timeframe: "4 Weeks Before", title: "Book Party Location & Theme Concept", description: "Reserve date and order custom invitations.", isCompleted: false, category: "booking" },
        { id: `m-${Date.now()}-2`, timeframe: "2 Weeks Before", title: "Order Cake & Confirm Headcount", description: `Confirm RSVPs for approx ${guestCount} guests.`, isCompleted: false, category: "planning" },
        { id: `m-${Date.now()}-3`, timeframe: "3 Days Before", title: "Pick Up Decor & Assemble Favor Bags", description: "Organize party supplies and game materials.", isCompleted: false, category: "preparation" },
        { id: `m-${Date.now()}-4`, timeframe: "Day Of - 2 Hours Before", title: "Room Setup & Balloon Placement", description: "Decorate main activity area and prepare dessert table.", isCompleted: false, category: "day_of" },
      ],
      vendorChecklist: [
        { id: `v-${Date.now()}-1`, role: "Space Rental Coordinator", status: "needed", estimatedCost: venueAmount },
        { id: `v-${Date.now()}-2`, role: "Party Catering Service", status: "needed", estimatedCost: foodAmount },
        { id: `v-${Date.now()}-3`, role: "Specialty Baker", status: "needed", estimatedCost: cakeAmount },
        { id: `v-${Date.now()}-4`, role: "Party Entertainer / Host", status: "needed", estimatedCost: activityAmount },
      ],
      suggestedSchedule: [
        { time: "02:00 PM", activity: "Guest Arrival & Welcome Refreshments" },
        { time: "02:30 PM", activity: "Party Activities & Interactive Games" },
        { time: "03:45 PM", activity: "Food & Refreshment Service" },
        { time: "04:30 PM", activity: "Birthday Song & Cake Cutting" },
        { time: "05:00 PM", activity: "Gift Opening & Farewell Favors" },
      ],
      practicalNotes: [
        "Plan generated via deterministic Demo Mode (no API key configured).",
      ],
    };
  }

  // Community / Other
  const venueAmount = Math.round(total * 0.30);
  const cateringAmount = Math.round(total * 0.35);
  const avAmount = Math.round(total * 0.20);
  const promoAmount = total - (venueAmount + cateringAmount + avAmount);

  return {
    theme: themePreference || "Community Harmony & Inspiring Connection",
    summary: `Structured community event plan for ${title} uniting ${guestCount} attendees with engaging programming and collaborative hospitality.`,
    generationMode: "demo_mode",
    generatedAt: new Date().toISOString(),
    recommendations: [
      `Design check-in signage and name badges for ${guestCount} attendees.`,
      "Test audio/visual equipment and microphones 2 hours in advance of opening remarks.",
      "Set up open networking areas alongside seating.",
    ],
    budgetBreakdown: [
      { id: `b-${Date.now()}-1`, category: "Community Venue / Hall", description: "Space rental & staging", allocatedAmount: venueAmount, isPaid: false },
      { id: `b-${Date.now()}-2`, category: "Refreshments & Snacks", description: `Beverage station and light lunch for ${guestCount}`, allocatedAmount: cateringAmount, isPaid: false },
      { id: `b-${Date.now()}-3`, category: "Audio/Visual & Staging", description: "Projector, speakers, and wireless microphones", allocatedAmount: avAmount, isPaid: false },
      { id: `b-${Date.now()}-4`, category: "Signage & Print Materials", description: "Welcome banner, program schedules, and badges", allocatedAmount: promoAmount, isPaid: false },
    ],
    timeline: [
      { id: `m-${Date.now()}-1`, timeframe: "6 Weeks Before", title: "Reserve Community Hall & Speaker Roster", description: "Establish agenda topics and room requirements.", isCompleted: false, category: "booking" },
      { id: `m-${Date.now()}-2`, timeframe: "3 Weeks Before", title: "Publicize Gathering & Open Registration", description: "Distribute community bulletins and collect RSVPs.", isCompleted: false, category: "planning" },
      { id: `m-${Date.now()}-3`, timeframe: "1 Week Before", title: "Print Agendas & Coordinate Volunteers", description: "Assign setup and check-in greeting roles.", isCompleted: false, category: "preparation" },
      { id: `m-${Date.now()}-4`, timeframe: "Day Of - 8:00 AM", title: "AV Setup & Registration Table Ready", description: "Test microphones and lay out attendee materials.", isCompleted: false, category: "day_of" },
    ],
    vendorChecklist: [
      { id: `v-${Date.now()}-1`, role: "Venue Facility Manager", status: "needed", estimatedCost: venueAmount },
      { id: `v-${Date.now()}-2`, role: "Coffee & Refreshment Vendor", status: "needed", estimatedCost: cateringAmount },
      { id: `v-${Date.now()}-3`, role: "AV Technician", status: "needed", estimatedCost: avAmount },
    ],
    suggestedSchedule: [
      { time: "09:00 AM", activity: "Check-in & Welcome Coffee" },
      { time: "09:30 AM", activity: "Opening Remarks & Community Keynote" },
      { time: "11:00 AM", activity: "Interactive Discussion & Working Groups" },
      { time: "12:15 PM", activity: "Networking Lunch & Community Showcase" },
    ],
    practicalNotes: [
      "Plan generated via deterministic Demo Mode (no API key configured).",
    ],
  };
}

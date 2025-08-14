import { all } from "@/lib/db";

export async function GET() {
  // Get all events
  const events = await all("SELECT id, title, form_schema FROM events ORDER BY created_at DESC");
  // For each event, get sign-ins and their answers
  const result = [];
  for (const event of events) {
    // Get sign-ins for this event
    const signins = await all(
      `SELECT s.*, v.name, v.email, v.phone, v.budget, v.timeline, v.preapproved, v.neighborhoods, v.consent
       FROM signins s
       LEFT JOIN visitors v ON s.visitor_id = v.id
       WHERE s.event_id = ?
       ORDER BY s.created_at DESC`,
      [event.id]
    );
    // Parse extra_answers JSON if present
    const signInsWithAnswers = signins.map(s => {
      let extra = {};
      if (s.extra_answers) {
        try { extra = JSON.parse(s.extra_answers); } catch {}
      }
      return { ...s, ...extra };
    });
    result.push({
      eventId: event.id,
      eventName: event.title,
      signIns: signInsWithAnswers
    });
  }
  return Response.json(result);
}

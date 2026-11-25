import { NextResponse } from "next/server";
import { validateRsvp } from "@/lib/rsvp";
import { isSameOrigin } from "@/lib/origin";
import { invitation } from "@/config/invitation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!invitation.rsvp.enabled) return NextResponse.json({ error: "RSVP is not enabled for this invitation." }, { status: 404 });
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Please submit your response from the invitation." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Please submit a valid response." }, { status: 415 });
  }

  let input: unknown;
  try {
    const body = await request.text();
    if (body.length > 8_192) return NextResponse.json({ error: "Your response is too long." }, { status: 413 });
    input = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Please check your response and try again." }, { status: 400 });
  }

  if (input && typeof input === "object" && "website" in input && input.website) {
    return NextResponse.json({ error: "Unable to submit this response." }, { status: 400 });
  }
  const result = validateRsvp(input);
  if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 400 });

  const endpoint = process.env.RSVP_WEBHOOK_URL;
  if (!endpoint) {
    return NextResponse.json({ error: "RSVP delivery hasn’t been connected yet. Your response has not been sent. Please contact the hosts." }, { status: 503 });
  }
  let webhook: URL;
  try {
    webhook = new URL(endpoint);
    if (webhook.protocol !== "https:") throw new Error("HTTPS is required");
  } catch {
    return NextResponse.json({ error: "RSVP delivery is temporarily unavailable. Please contact the hosts." }, { status: 503 });
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.RSVP_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.RSVP_WEBHOOK_SECRET}` } : {}),
      },
      body: JSON.stringify({ ...result.data, submittedAt: new Date().toISOString(), source: "sacred-garden" }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Delivery failed");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We couldn’t send your response. Please try again in a moment or contact the hosts." }, { status: 502 });
  }
}

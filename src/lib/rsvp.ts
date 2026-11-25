export type Rsvp = {
  name: string;
  attending: "yes" | "no";
  guests: number;
  song: string;
  children: string;
};

export type RsvpValidation =
  | { ok: true; data: Rsvp }
  | { ok: false; errors: Record<string, string> };

export function validateRsvp(input: unknown): RsvpValidation {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: { form: "Please check your response and try again." } };
  }
  const value = input as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const song = typeof value.song === "string" ? value.song.trim() : "";
  const children = typeof value.children === "string" ? value.children.trim() : "";
  if (name.length < 2 || name.length > 120) errors.name = "Please enter your name (2–120 characters).";
  if (value.attending !== "yes" && value.attending !== "no") errors.attending = "Please let us know whether you can attend.";
  const rawGuests = typeof value.guests === "number" || typeof value.guests === "string" ? value.guests : "";
  const guests = value.attending === "no" ? 0 : Number(rawGuests);
  if (value.attending === "yes" && (!Number.isInteger(guests) || guests < 1 || guests > invitation.rsvp.maxGuests)) {
    errors.guests = `Please enter a guest count between 1 and ${invitation.rsvp.maxGuests}, including yourself.`;
  }
  if (song.length > 200) errors.song = "Please keep the song suggestion under 200 characters.";
  if (children.length > 500) errors.children = "Please keep the children’s details under 500 characters.";
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: { name, attending: value.attending as Rsvp["attending"], guests, song: value.attending === "yes" ? song : "", children: value.attending === "yes" ? children : "" },
  };
}
import { invitation } from "../config/invitation.ts";

import assert from "node:assert/strict";
import test from "node:test";
import { validateRsvp } from "../src/lib/rsvp.ts";
import { countdownParts } from "../src/lib/countdown.ts";
import { isSameOrigin } from "../src/lib/origin.ts";

test("accepts a valid attendance response and trims guest details", () => {
  const result = validateRsvp({ name: "  Amina Khan  ", attending: "yes", guests: "2", song: "Song", children: "" });
  assert.equal(result.ok, true);
  if (result.ok) { assert.equal(result.data.name, "Amina Khan"); assert.equal(result.data.guests, 2); }
});
test("a decline does not require guest, song or child details", () => {
  const result = validateRsvp({ name: "Amina Khan", attending: "no" });
  assert.equal(result.ok, true);
  if (result.ok) { assert.equal(result.data.guests, 0); assert.equal(result.data.children, ""); }
});
test("rejects fractional, missing and excessive guest counts", () => {
  for (const guests of [0, -1, 1.5, 21, "not a number", undefined, true]) {
    const result = validateRsvp({ name: "Amina Khan", attending: "yes", guests });
    assert.equal(result.ok, false, `guests=${String(guests)}`);
    if (!result.ok) assert.ok(result.errors.guests);
  }
});
test("rejects unknown input shape and omitted attendance", () => {
  for (const input of [null, [], "text", { name: "Amina Khan", guests: 2 }]) assert.equal(validateRsvp(input).ok, false);
});
test("does not accept oversized guest text", () => {
  const result = validateRsvp({ name: "Amina Khan", attending: "yes", guests: 1, children: "x".repeat(501) });
  assert.equal(result.ok, false);
});
test("countdown uses the event offset consistently and never becomes negative", () => {
  const event = "2027-09-27T17:00:00-04:00";
  assert.deepEqual(countdownParts(event, Date.parse("2027-09-26T19:30:15Z")), { days: "01", hours: "01", minutes: "29", seconds: "45", complete: false });
  assert.deepEqual(countdownParts(event, Date.parse("2027-10-01T00:00:00Z")), { days: "00", hours: "00", minutes: "00", seconds: "00", complete: true });
});
test("same-origin checks support Next's localhost normalization without accepting other sites", () => {
  assert.equal(isSameOrigin(new Request("http://localhost:3000/api/rsvp", { headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" } })), true);
  assert.equal(isSameOrigin(new Request("https://invitation.vercel.app/api/rsvp", { headers: { host: "invitation.vercel.app", origin: "https://example.com" } })), false);
});

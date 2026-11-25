export function countdownParts(eventDate: string, now: number) {
  const target = Date.parse(eventDate);
  const remaining = Number.isFinite(target) ? Math.max(0, target - now) : 0;
  return {
    days: String(Math.floor(remaining / 86_400_000)).padStart(2, "0"),
    hours: String(Math.floor((remaining / 3_600_000) % 24)).padStart(2, "0"),
    minutes: String(Math.floor((remaining / 60_000) % 60)).padStart(2, "0"),
    seconds: String(Math.floor((remaining / 1_000) % 60)).padStart(2, "0"),
    complete: remaining === 0,
  };
}

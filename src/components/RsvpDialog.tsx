"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { invitation } from "@/config/invitation";
import { validateRsvp } from "@/lib/rsvp";

export function RsvpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const [attending, setAttending] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current?.close();
  }, [open]);

  useEffect(() => {
    if (Object.keys(errors).length) summary.current?.focus();
  }, [errors]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const fields = new FormData(event.currentTarget);
    const payload = Object.fromEntries(fields.entries());
    const validation = validateRsvp(payload);
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validation.data, website: payload.website }),
        signal: AbortSignal.timeout(15_000),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setErrors(result.errors || { form: result.error || "Your response couldn’t be sent. Please try again." });
        return;
      }
      setSent(true);
    } catch {
      setErrors({ form: "Your response couldn’t be sent. Please check your connection and try again." });
    } finally {
      setSending(false);
    }
  }

  const fieldError = (name: string) => errors[name] ? <span className="field-error" id={`${name}-error`}>{errors[name]}</span> : null;

  return (
    <dialog ref={dialog} className="rsvp-dialog" aria-labelledby="rsvp-title" onClose={onClose} onClick={(event) => { if (event.target === dialog.current) onClose(); }}>
      <div className="rsvp-panel">
        <button type="button" className="dialog-close" aria-label="Close RSVP form" onClick={onClose}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
        </button>
        <header className="rsvp-header">
          <h2 id="rsvp-title">{invitation.rsvp.title}</h2>
          <p>{invitation.rsvpDeadline ? `Please RSVP before ${invitation.rsvpDeadline}` : "We look forward to celebrating with you."}</p>
        </header>
        {sent ? (
          <div className="rsvp-success" role="status">
            <p className="success-flourish">Thank you!</p>
            <p>{attending === "yes" ? "We look forward to celebrating with you." : "You will be with us in spirit."}</p>
            <button className="submit-button" type="button" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form ref={form} onSubmit={submit} noValidate>
            {Object.keys(errors).length > 0 && (
              <div className="error-summary" tabIndex={-1} ref={summary} role="alert">
                {errors.form ? <p>{errors.form}</p> : <><p>Please check your response:</p><ul>{Object.entries(errors).map(([name, message]) => <li key={name}><a href={`#rsvp-${name}`}>{message}</a></li>)}</ul></>}
              </div>
            )}
            <label className="form-field" htmlFor="rsvp-name">
              <span>Your name</span>
              <input id="rsvp-name" name="name" autoComplete="name" required maxLength={120} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />
              {fieldError("name")}
            </label>
            <fieldset className="form-field attendance-field" id="rsvp-attending" tabIndex={-1} aria-describedby={errors.attending ? "attending-error" : undefined}>
              <legend>Will you be attending?</legend>
              <label><input type="radio" name="attending" value="yes" required checked={attending === "yes"} onChange={() => setAttending("yes")} />Accepts with pleasure</label>
              <label><input type="radio" name="attending" value="no" required checked={attending === "no"} onChange={() => setAttending("no")} />Declines with regret</label>
              {fieldError("attending")}
            </fieldset>
            {attending !== "no" && <>
              <label className="form-field" htmlFor="rsvp-guests">
                <span>Number of Guests Attending</span>
                <input id="rsvp-guests" name="guests" type="number" inputMode="numeric" min={1} max={invitation.rsvp.maxGuests} required aria-invalid={Boolean(errors.guests)} aria-describedby={errors.guests ? "guests-error" : undefined} />
                {fieldError("guests")}
              </label>
              <label className="form-field" htmlFor="rsvp-children">
                <span>Children Attending</span>
                <span className="field-hint" id="children-hint">Please include names and ages, if applicable.</span>
                <input id="rsvp-children" name="children" maxLength={500} aria-invalid={Boolean(errors.children)} aria-describedby={errors.children ? "children-hint children-error" : "children-hint"} />
                {fieldError("children")}
              </label>
            </>}
            <div className="honeypot" aria-hidden="true"><label>Website<input name="website" autoComplete="off" tabIndex={-1} /></label></div>
            <button className="submit-button" type="submit" disabled={sending}>{sending ? "Sending…" : "Submit"}</button>
          </form>
        )}
      </div>
    </dialog>
  );
}

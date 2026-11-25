"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { invitation } from "@/config/invitation";
import { countdownParts } from "@/lib/countdown";

function CountdownDigit({ value }: { value: string }) {
  const [displayed, setDisplayed] = useState(value);
  const [phase, setPhase] = useState("");
  const current = useRef(value);
  useEffect(() => {
    if (current.current === value) return;
    setPhase("digit-out");
    const timer = window.setTimeout(() => {
      current.current = value;
      setDisplayed(value);
      setPhase("digit-in");
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase("")));
    }, 520);
    return () => window.clearTimeout(timer);
  }, [value]);
  return <span className="countdown-number-window"><span className={`countdown-number ${phase}`}>{displayed}</span></span>;
}

export function Countdown() {
  const [parts, setParts] = useState(() => countdownParts(invitation.eventDate, Date.parse(invitation.eventDate)));
  const root = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setRevealed(true); observer.disconnect(); }
    }, { threshold: .4 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const tick = () => setParts(countdownParts(invitation.eventDate, Date.now()));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const blocks = [
    { value: parts.days, label: "Days" },
    { value: parts.hours, label: "Hours" },
    { value: parts.minutes, label: "Minutes" },
    { value: parts.seconds, label: "Seconds" },
  ];

  return (
    <div ref={root} className={`countdown ${revealed ? "countdown-revealed" : ""}`} role="timer" aria-label={parts.complete ? "The wedding date has arrived" : `${parts.days} days, ${parts.hours} hours and ${parts.minutes} minutes until the wedding`}>
      {blocks.map((block, index) => (
        <Fragment key={block.label}>
          {index > 0 && <span className="countdown-separator" aria-hidden="true">:</span>}
          <div className="countdown-block" aria-hidden="true" style={{ "--digit-index": index } as React.CSSProperties}>
            <CountdownDigit value={block.value} />
            <span className="countdown-label">{block.label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

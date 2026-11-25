"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { invitation } from "@/config/invitation";
import { measureScratchCoverage } from "@/lib/scratch";

const CANVAS_SIZE = 512;
const REVEAL_AT = .48;

export function ScratchDateReveal() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const originalPixels = useRef<Uint8ClampedArray | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const pointerId = useRef<number | null>(null);
  const lastCheck = useRef(0);
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = canvas.current;
    const context = node?.getContext("2d", { willReadFrequently: true });
    if (!node || !context) return;
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      // Same complete wax cutout and pose as the opening's first frame.
      const width = 227.727 * 1.035 / 310 * CANVAS_SIZE;
      const height = 247.603 * 1.035 / 310 * CANVAS_SIZE;
      context.drawImage(image, 65, 26, 1132, 1205,
        (CANVAS_SIZE - width) / 2, (CANVAS_SIZE - height) / 2, width, height);
      originalPixels.current = context.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;
      setReady(true);
    };
    image.src = "/assets/images/wax-seal-ah-v2.png";
    return () => { cancelled = true; };
  }, []);

  function revealDate() {
    pointerId.current = null;
    lastPoint.current = null;
    setProgress(1);
    setRevealed(true);
  }

  function checkProgress() {
    const context = canvas.current?.getContext("2d");
    if (!context || !originalPixels.current || revealed) return;
    const cleared = measureScratchCoverage(originalPixels.current,
      context.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data);
    setProgress(cleared);
    if (cleared >= REVEAL_AT) revealDate();
  }

  function scratch(event: PointerEvent<HTMLCanvasElement>) {
    if (!ready || revealed) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const point = {
      x: (event.clientX - bounds.left) / bounds.width * CANVAS_SIZE,
      y: (event.clientY - bounds.top) / bounds.height * CANVAS_SIZE,
    };
    context.globalCompositeOperation = "destination-out";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 88;
    context.beginPath();
    if (lastPoint.current) {
      context.moveTo(lastPoint.current.x, lastPoint.current.y);
      context.lineTo(point.x, point.y);
      context.stroke();
    } else {
      context.arc(point.x, point.y, 44, 0, Math.PI * 2);
      context.fill();
    }
    lastPoint.current = point;
    if (performance.now() - lastCheck.current > 100) {
      lastCheck.current = performance.now();
      checkProgress();
    }
  }

  function startScratch(event: PointerEvent<HTMLCanvasElement>) {
    if (revealed || !ready || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    pointerId.current = event.pointerId;
    lastPoint.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);
    scratch(event);
  }

  function stopScratch(event: PointerEvent<HTMLCanvasElement>) {
    if (pointerId.current !== event.pointerId) return;
    checkProgress();
    pointerId.current = null;
    lastPoint.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const date = new Date(invitation.eventDate);
  const day = new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: "Asia/Kolkata" }).format(date);
  const month = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "Asia/Kolkata" }).format(date);
  const year = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Asia/Kolkata" }).format(date);

  return <div className="home-date-reveal">
    <button type="button" className={`home-scratch-seal ${ready ? "is-ready" : ""} ${revealed ? "is-revealed" : ""}`}
      data-revealed={revealed} data-scratch-progress={progress.toFixed(2)}
      aria-label={revealed ? `Wedding date: ${invitation.weekday}, ${invitation.fullDate}` : "Scratch the A and H seal to reveal our wedding date, or press Enter"}
      onClick={(event) => { if (event.detail === 0 || !ready) revealDate(); }}>
      <span className="scratch-date-medallion" aria-hidden="true">
        <span className="scratch-date-day">{day}</span>
        <span className="scratch-date-month">{month}</span>
        <span className="scratch-date-year">{year}</span>
      </span>
      <canvas ref={canvas} className="scratch-seal-canvas" width={CANVAS_SIZE} height={CANVAS_SIZE} aria-hidden="true"
        onPointerDown={startScratch}
        onPointerMove={(event) => { if (pointerId.current === event.pointerId) scratch(event); }}
        onPointerUp={stopScratch} onPointerCancel={stopScratch}
        onLostPointerCapture={() => { pointerId.current = null; lastPoint.current = null; }} />
    </button>
    <p className="home-scratch-caption" aria-live="polite">{revealed ? `${invitation.weekday}, ${invitation.fullDate}` : "Scratch to reveal our wedding date"}</p>
  </div>;
}

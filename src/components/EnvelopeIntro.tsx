"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type InvitationPhase = "closed" | "opening" | "revealing" | "open";

const DURATION = 4_800;
const REVEAL_AT = 4_000;
const PAPER = "/assets/images/burgundy-floral-theme-v1.webp";
const SEAL = "/assets/images/wax-seal-ah-v2.png";
const at = (milliseconds: number) => milliseconds / DURATION;

// Fixed, deterministic particles: no hydration differences or continuous loops.
const sparkles = Array.from({ length: 24 }, (_, index) => ({
  x: 130 + (index * 113) % 460,
  y: 120 + (index * 167) % 480,
  size: index % 3 === 0 ? 9 : 4,
  delay: (index % 6) * 65,
}));

type Props = {
  phase: InvitationPhase;
  reducedMotion: boolean;
  onStart: () => void;
  onRevealing: () => void;
  onComplete: () => void;
};

/** All geometry lives in one 720 × 1280 space. Only the outer stage is scaled. */
export function EnvelopeIntro({ phase, reducedMotion, onStart, onRevealing, onComplete }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLSpanElement>(null);
  const stage = useRef<HTMLSpanElement>(null);
  const [missingPaper, setMissingPaper] = useState(false);
  const [missingSeal, setMissingSeal] = useState(false);
  const running = phase === "opening" || phase === "revealing";

  useEffect(() => {
    const viewport = frame.current;
    const scene = stage.current;
    if (!viewport || !scene) return;
    const resize = () => scene.style.setProperty("--envelope-scale", String(viewport.clientWidth / 720));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const overlay = root.current;
    if (!running || !overlay) return;
    const animations: Animation[] = [];
    let frameId = 0;
    let fallbackId = 0;
    let live = true;
    let revealed = false;
    const reveal = () => {
      if (!live || revealed) return;
      revealed = true;
      onRevealing();
    };
    const complete = () => { if (live) { reveal(); onComplete(); } };
    const artworkReady = Array.from(overlay.querySelectorAll("img")).every((image) => image.complete && image.naturalWidth > 0);
    const fast = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches
      || !artworkReady || missingPaper || missingSeal || typeof overlay.animate !== "function"
      || !CSS.supports("transform-style", "preserve-3d");

    // Every effect uses this same document-timeline epoch and full duration.
    const epoch = document.timeline?.currentTime ?? null;
    const animate = (element: HTMLElement, frames: Keyframe[], duration = DURATION) => {
      const animation = element.animate(frames, { duration, fill: "both", easing: "linear" });
      if (epoch !== null) animation.startTime = epoch;
      animations.push(animation);
      return animation;
    };

    try {
      if (fast) {
        reveal();
        if (typeof overlay.animate === "function") {
          void animate(overlay, [{ opacity: 1 }, { opacity: 0 }], 400).finished.then(complete, () => {});
        } else {
          overlay.classList.add("envelope-intro-fallback");
          fallbackId = window.setTimeout(complete, 400);
        }
      } else {
        const master = animate(overlay, [
          { opacity: 1, offset: 0 },
          { opacity: 1, offset: at(REVEAL_AT), easing: "ease-in-out" },
          { opacity: 0, offset: 1 },
        ]);
        const flap = overlay.querySelector<HTMLElement>(".envelope-flap")!;
        animate(flap, [
          { transform: "rotateX(0deg)", offset: 0 },
          { transform: "rotateX(0deg)", offset: at(200), easing: "cubic-bezier(.4,0,.2,1)" },
          { transform: "rotateX(180deg)", offset: at(2800) },
          { transform: "rotateX(180deg)", offset: 1 },
        ]);
        animate(overlay.querySelector<HTMLElement>(".envelope-tap-hint")!, [
          { opacity: 1, offset: 0 }, { opacity: 0, offset: at(200) }, { opacity: 0, offset: 1 },
        ]);
        animate(overlay.querySelector<HTMLElement>(".envelope-flap-shadow")!, [
          { opacity: .65, transform: "scaleY(1)", offset: 0 },
          { opacity: .65, transform: "scaleY(1)", offset: at(200) },
          { opacity: .18, transform: "scaleY(.12)", offset: at(1600) },
          { opacity: 0, transform: "scaleY(0)", offset: at(2800) },
          { opacity: 0, transform: "scaleY(0)", offset: 1 },
        ]);
        for (const selector of [".envelope-light", ".envelope-bloom"]) {
          animate(overlay.querySelector<HTMLElement>(selector)!, [
            { opacity: 0, transform: "scale(.8)", offset: 0 },
            { opacity: 0, transform: "scale(.8)", offset: at(2800), easing: "ease-out" },
            { opacity: .95, transform: "scale(1)", offset: at(3600) },
            { opacity: .8, transform: "scale(1.12)", offset: at(4200) },
            { opacity: 0, transform: "scale(1.25)", offset: 1 },
          ]);
        }
        overlay.querySelectorAll<HTMLElement>(".envelope-sparkle").forEach((particle, index) => {
          const delay = sparkles[index].delay;
          animate(particle, [
            { opacity: 0, transform: "translateY(100px) scale(.2)", offset: 0 },
            { opacity: 0, transform: "translateY(100px) scale(.2)", offset: at(2850 + delay) },
            { opacity: .95, transform: "translateY(0) scale(1)", offset: at(3300 + delay) },
            { opacity: 0, transform: "translateY(-110px) scale(.35)", offset: at(4400 + delay) },
            { opacity: 0, transform: "translateY(-110px) scale(.35)", offset: 1 },
          ]);
        });
        const update = () => {
          if (!live) return;
          if (Number(master.currentTime) >= REVEAL_AT) reveal();
          frameId = requestAnimationFrame(update);
        };
        frameId = requestAnimationFrame(update);
        void master.finished.then(complete, () => {});
      }
    } catch {
      // Partial WAAPI/3D support must never leave the invitation inaccessible.
      animations.forEach((animation) => animation.cancel());
      reveal();
      overlay.classList.add("envelope-intro-fallback");
      fallbackId = window.setTimeout(complete, 400);
    }
    return () => {
      live = false;
      cancelAnimationFrame(frameId);
      window.clearTimeout(fallbackId);
      animations.forEach((animation) => animation.cancel());
    };
  }, [running, reducedMotion, missingPaper, missingSeal, onRevealing, onComplete]);

  return <div ref={root} className="envelope-intro" data-envelope-phase={phase}>
    <button type="button" className="envelope-open-button" onClick={onStart} disabled={phase !== "closed"} aria-label="Open Abdul Hameed and Heeba’s wedding invitation">
      <span ref={frame} className="envelope-viewport" aria-hidden="true">
        <span ref={stage} className="envelope-stage">
          <img className="envelope-paper-base" src={PAPER} width={720} height={1280} alt="" fetchPriority="high" onError={() => setMissingPaper(true)} />
          <span className="envelope-lining" />
          <span className="envelope-flap-shadow" />
          <span className="envelope-flap">
            <span className="envelope-flap-front"><span className="envelope-flap-paper" />
              {missingSeal ? <span className="envelope-seal-fallback">A &amp; H</span> : <img className="envelope-wax" src={SEAL} width={1261} height={1247} alt="" fetchPriority="high" onError={() => setMissingSeal(true)} />}
            </span>
            <span className="envelope-flap-back"><span className="envelope-flap-paper" /></span>
          </span>
          <span className="envelope-light" />
          <span className="envelope-pocket"><span className="envelope-pocket-left" /><span className="envelope-pocket-right" /><span className="envelope-pocket-bottom" /></span>
          <span className="envelope-bloom" />
          <span className="envelope-sparkles">{sparkles.map((particle, index) => <span key={index} className="envelope-sparkle" style={{ left: particle.x, top: particle.y, width: particle.size, height: particle.size } as CSSProperties} />)}</span>
          <span className="envelope-tap-hint"><span className="envelope-chevron" /><span>Tap to open</span></span>
        </span>
      </span>
    </button>
    <span className="visually-hidden" role="status">{running ? "Opening your invitation…" : ""}</span>
  </div>;
}

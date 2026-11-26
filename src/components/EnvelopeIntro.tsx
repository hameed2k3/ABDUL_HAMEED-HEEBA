"use client";

import { useEffect, useRef, useState } from "react";

export type InvitationPhase = "closed" | "opening" | "revealing" | "open";

const MOVIE = "/assets/media/envelope-opening-remotion-v5.mp4";
const POSTER = "/assets/images/envelope-poster-remotion-v5.webp";

type Props = {
  phase: InvitationPhase;
  reducedMotion: boolean;
  onStart: () => void;
  onRevealing: () => void;
  onComplete: () => void;
};

/** Remotion-polished rising motion, rendered locally with the supplied artwork. */
export function EnvelopeIntro({ phase, reducedMotion, onStart, onRevealing, onComplete }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const started = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const running = phase === "opening" || phase === "revealing";

  useEffect(() => {
    const overlay = root.current;
    const movie = video.current;
    if (!running || !overlay || !movie) return;
    let live = true;
    let revealed = false;
    let completed = false;
    let frameId = 0;
    let fallbackId = 0;
    let fade: Animation | undefined;
    const reveal = () => {
      if (!live || revealed) return;
      revealed = true;
      onRevealing();
    };
    const complete = () => {
      if (!live || completed) return;
      completed = true;
      reveal();
      onComplete();
    };
    const fast = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches || failed;
    if (fast) {
      movie.pause();
      setPlaying(false);
      reveal();
      try {
        fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" });
        void fade.finished.then(complete, () => {});
      } catch {
        overlay.classList.add("envelope-intro-fallback");
      }
      // Also covers an interrupted/unavailable fade animation.
      fallbackId = window.setTimeout(complete, 450);
    } else {
      const update = () => {
        if (!live) return;
        const duration = Number.isFinite(movie.duration) ? movie.duration : 4.3;
        const remaining = duration - movie.currentTime;
        if (remaining <= .8) {
          reveal();
          const progress = Math.min(1, Math.max(0, 1 - remaining / .8));
          // The video's clock drives the crossfade, including after buffering.
          overlay.style.opacity = String(1 - progress * progress * (3 - 2 * progress));
        }
        if (movie.ended) { complete(); return; }
        frameId = requestAnimationFrame(update);
      };
      movie.addEventListener("ended", complete);
      frameId = requestAnimationFrame(update);
    }
    return () => {
      live = false;
      cancelAnimationFrame(frameId);
      window.clearTimeout(fallbackId);
      fade?.cancel();
      movie.removeEventListener("ended", complete);
    };
  }, [running, reducedMotion, failed, onRevealing, onComplete]);

  function open() {
    if (started.current) return;
    started.current = true;
    onStart();
    if (reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches || failed) return;
    const movie = video.current;
    if (!movie) { setFailed(true); return; }
    // Both music and muted inline video begin within the same user gesture.
    void movie.play().catch(() => setFailed(true));
  }

  return <div ref={root} className="envelope-intro" data-envelope-phase={phase} data-playing={playing}>
    <button type="button" className="envelope-open-button" onClick={open} disabled={phase !== "closed"} aria-label="Open Abdul Hameed and Heeba’s wedding invitation">
      <span className="envelope-viewport" aria-hidden="true">
        <img className="envelope-poster" src={POSTER} width={1080} height={1920} alt="" fetchPriority="high" />
        <video ref={video} className="envelope-movie" src={MOVIE} poster={POSTER} width={1080} height={1920}
          preload="auto" muted playsInline disablePictureInPicture disableRemotePlayback
          controlsList="nodownload nofullscreen noremoteplayback"
          onPlaying={() => setPlaying(true)}
          onError={() => setFailed(true)}
          onPause={() => { if (started.current && video.current && !video.current.ended) { setPlaying(false); setFailed(true); } }} />
        <span className="envelope-tap-hint"><span className="envelope-chevron" /><span>Tap to open</span></span>
      </span>
    </button>
    <span className="visually-hidden" role="status">{running ? "Opening your invitation…" : ""}</span>
  </div>;
}

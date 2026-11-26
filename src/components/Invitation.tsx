"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { invitation } from "@/config/invitation";
import sceneData from "@/data/scenes.json";
import media from "@/data/media.json";
import { Countdown } from "./Countdown";
import { EnvelopeIntro, type InvitationPhase } from "./EnvelopeIntro";
import { ScratchDateReveal } from "./ScratchDateReveal";
import { ReferenceVenueMap, VenueDirectory } from "./ReferenceDetails";

type Element = (typeof sceneData)[number]["elements"][number];

function useSceneMotion(element: Element, active: boolean, reducedMotion: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    const motion = element.motion;
    if (!node || !active || reducedMotion || motion.frames.length < 2) return;

    if (motion.event === "scroll") {
      let frame = 0;
      let currentY = 0;
      const update = () => {
        frame = 0;
        const baseTop = node.getBoundingClientRect().top - currentY;
        const progress = Math.max(0, Math.min(1, (innerHeight * motion.trigger - baseTop) / motion.duration));
        const endIndex = motion.frames.findIndex((keyframe) => keyframe.offset >= progress);
        const end = motion.frames[Math.max(1, endIndex)];
        const start = motion.frames[Math.max(0, endIndex - 1)];
        const part = Math.max(0, Math.min(1, (progress - start.offset) / (end.offset - start.offset)));
        currentY = start.y + (end.y - start.y) * part;
        node.style.transform = `translate3d(0,${currentY}px,0)`;
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
      update();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      return () => {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        cancelAnimationFrame(frame);
        node.style.removeProperty("transform");
      };
    }

    let animation: Animation | undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      animation = node.animate(motion.frames.map((keyframe) => ({
        offset: keyframe.offset,
        transform: `translate3d(${keyframe.x}px,${keyframe.y}px,0) scale(${keyframe.scaleX},${keyframe.scaleY}) rotate(${keyframe.rotation}deg)`,
        opacity: keyframe.opacity,
      })), { duration: motion.duration, easing: "linear", iterations: motion.loop ? Infinity : 1, fill: "forwards" });
      observer.disconnect();
    }, { threshold: 0 });
    observer.observe(motion.event === "blockintoview" ? node.closest("section") || node : node);
    return () => { observer.disconnect(); animation?.cancel(); };
  }, [element.motion, active, reducedMotion]);
  return ref;
}

/** Image-based motion has no native video play overlay, including on iOS. */
function GardenAnimation({ closing = false }: { closing?: boolean }) {
  return <picture className="garden-picture">
    <source media="(prefers-reduced-motion: reduce)" srcSet={media.gardenStill} />
    <img
      className={`garden-animation${closing ? " closing-garden-image" : ""}`}
      src={media.gardenMotion}
      width={450}
      height={800}
      alt={closing ? "A peaceful garden lake framed by flowers" : "Swans on a garden lake"}
      loading={closing ? "lazy" : "eager"}
      decoding="async"
    />
  </picture>;
}

function personalizedCopy(scene: string, id: string): ReactNode | undefined {
  if (scene === "rec4227041103") {
    if (id === "1763402147625") return <><span className="couple-person couple-groom"><span>{invitation.couple.first}</span><small>{invitation.qualifications.first}</small></span><span className="couple-person couple-bride"><span>{invitation.couple.second}</span><small>{invitation.qualifications.second}</small></span></>;
    if (id === "176340398328864790") return "Nikah Ceremony";
    if (id === "176340401720454780") return <ScratchDateReveal />;
    if (id === "1780748008617000005") return <>{invitation.introduction}<br />{invitation.welcome}</>;
  }
  if (scene === "rec2487446223") {
    if (id === "1772813849329000001") return invitation.rsvp.description;
    if (id === "1763405219328") return invitation.rsvp.title;
  }
  if (scene === "rec2487446153") {
    if (id === "1772804808869") return "Reception, Nikah & Walima";
    if (id === "1772813480591000001") return invitation.hometown;
    if (id === "1771277026942000001") return "Location";
  }
  if (scene === "rec2487446253" && id === "1772813849329000001") return <>{invitation.couple.first} &amp; {invitation.couple.second}<span className="reference-family-caption">{invitation.familyMessage}<br />{invitation.hometown}</span></>;
}

function SceneElement({ element, scene, reducedMotion, active, selectedVenue, onSelectVenue }: { element: Element; scene: string; reducedMotion: boolean; active: boolean; selectedVenue: number; onSelectVenue: (index: number) => void }) {
  const motionRef = useSceneMotion(element, active, reducedMotion);
  const atomClass = element.classes.join(" ");
  const copy = personalizedCopy(scene, element.id);
  const isNames = scene === "rec4227041103" && element.id === "1763402147625";
  const isHeading = element.kind === "text" && (element.id === "1763405219328" || element.id === "1771277026942000001" || element.id === "1778524751695000002");
  const Atom = isNames ? "h1" : isHeading ? "h2" : "div";
  let content: ReactNode;
  const eventIndex = invitation.schedule.findIndex((_, index) => Math.round(index * 4 / Math.max(1, invitation.schedule.length - 1)) === element.slot);
  if (element.kind.startsWith("event-") && eventIndex === -1) return null;

  if (element.kind === "image") {
    const image = <img className={"imageClass" in element ? element.imageClass : "tn-atom__img"} src={element.src} alt={element.alt} width={"width" in element ? element.width : undefined} height={"height" in element ? element.height : undefined} loading={scene === "rec4227041103" ? "eager" : "lazy"} decoding="async" />;
    content = <div className={atomClass}>{image}</div>;
  } else if (element.kind === "swans") {
    content = <div className={atomClass}><GardenAnimation /></div>;
  } else if (element.kind === "countdown") {
    content = <div className={atomClass}><Countdown /></div>;
  } else if (element.kind === "map") {
    content = <div className={atomClass}><ReferenceVenueMap selected={selectedVenue} onSelect={onSelectVenue} /></div>;
  } else if (element.kind === "venue-directory") {
    content = <div className={atomClass}><VenueDirectory onSelect={(index) => { onSelectVenue(index); document.getElementById("rec2487446163")?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "center" }); }} /></div>;
  } else if (element.kind === "closing-garden") {
    content = <div className={`${atomClass} reference-closing-garden`}><GardenAnimation closing /></div>;
  } else if (element.kind === "event-time" || element.kind === "event-label") {
    content = <div className={atomClass}>{invitation.schedule[eventIndex][element.kind === "event-time" ? "time" : "label"]}</div>;
  } else if (copy !== undefined) {
    content = <Atom className={atomClass}>{copy}</Atom>;
  } else {
    // This markup contains only the locally archived text, spans and SVG artwork.
    // The source extraction removes scripts, frames and event attributes.
    content = <Atom className={atomClass} dangerouslySetInnerHTML={{ __html: element.html }} />;
  }

  return (
    <div
      ref={motionRef}
      className={`t396__elem tn-elem ${element.animation ? `reveal reveal-${element.animation}` : ""} ${element.float ? "floating-decoration" : ""}`}
      data-elem-id={element.id}
      data-elem-type={element.kind}
      style={{ "--reveal-delay": `${element.delay}s`, "--reveal-duration": `${element.duration}s` } as CSSProperties}
    >{content}</div>
  );
}

export function Invitation() {
  const [phase, setPhase] = useState<InvitationPhase>("closed");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(0);
  const audio = useRef<HTMLAudioElement>(null);
  const main = useRef<HTMLElement>(null);
  const entered = useRef(false);
  const entranceStarted = phase === "revealing" || phase === "open";
  const openingActive = phase === "opening" || phase === "revealing";
  const beginReveal = useCallback(() => setPhase((current) => current === "opening" ? "revealing" : current), []);
  const finishOpening = useCallback(() => {
    setPhase("open");
    // A keyboard guest can continue into the invitation after the button leaves.
    requestAnimationFrame(() => main.current?.focus({ preventScroll: true }));
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);


  useEffect(() => {
    const previous = document.body.style.overflow;
    if (phase !== "open") document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [phase]);

  useEffect(() => {
    if (phase === "open") return;
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    return () => { history.scrollRestoration = previous; };
  }, [phase === "open"]);

  useEffect(() => {
    if (!entranceStarted) return;
    const elements = main.current?.querySelectorAll<HTMLElement>(".reveal");
    if (!elements) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08, rootMargin: "0px 0px 40px 0px" });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [entranceStarted]);

  useEffect(() => {
    if (!openingActive) return;
    const fallback = window.setTimeout(finishOpening, 6_500);
    return () => window.clearTimeout(fallback);
  }, [openingActive, finishOpening]);

  function startInvitation() {
    if (entered.current) return;
    entered.current = true;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (audio.current) audio.current.volume = 0.7;
    void audio.current?.play().catch(() => {});
    setPhase("opening");
  }


  return (
    <div className="invitation-root" data-phase={phase} data-reduced-motion={reducedMotion}>
      <audio ref={audio} src={media.music} loop preload="none" />
      <main ref={main} id="invitation" className="invitation-content" tabIndex={-1} inert={phase !== "open"} aria-label={`${invitation.couple.first} and ${invitation.couple.second} wedding invitation`}>
        {sceneData.map((scene) => <div key={scene.id}>
          <section id={scene.id} key={scene.id} className="t-rec" aria-label={scene.label}>
            <div className="t396"><div className="t396__artboard">
              {scene.elements.map((element) => <SceneElement key={element.id} element={element} scene={scene.id} reducedMotion={reducedMotion} active={entranceStarted} selectedVenue={selectedVenue} onSelectVenue={setSelectedVenue} />)}
            </div></div>
          </section>
        </div>)}
      </main>
      {phase !== "open" && <EnvelopeIntro phase={phase} reducedMotion={reducedMotion} onStart={startInvitation} onRevealing={beginReveal} onComplete={finishOpening} />}

      <noscript><div className="noscript-message">Please enable JavaScript to open this invitation.</div></noscript>
    </div>
  );
}

"use client";

import { type RefObject } from "react";
import { eventVenues } from "@/config/invitation";

export const venues = eventVenues;

export function VenueDirectory({ onSelect }: { onSelect: (index: number) => void }) {
  return <div className="reference-venue-directory" data-venue-count={venues.length}>
    {venues.map((venue, index) => <button type="button" className="reference-venue-card" data-event={venue.label} key={venue.label} onClick={() => onSelect(index)} aria-label={`Show ${venue.name} on the map`}>
      <span className="venue-card-ornament" aria-hidden="true">✧</span>
      <span className="venue-card-event">{venue.label}</span>
      <span className="venue-card-time">{venue.time}</span>
      <span className="venue-card-name">{venue.name}</span>
      <span className="venue-card-town">{venue.address}</span>
    </button>)}
  </div>;
}

export function ReferenceVenueMap({ selected, onSelect }: { selected: number; onSelect: (index: number) => void }) {
  const venue = venues[selected];
  return <div className="reference-map-panel">
    <nav className="reference-map-tabs" aria-label="Choose a venue map">
      {venues.map((item, index) => <button type="button" key={item.label} aria-pressed={selected === index} onClick={() => onSelect(index)}>{item.label}</button>)}
    </nav>
    <iframe key={venue.coordinates} title={`Map to ${venue.name}, ${venue.address}`} src={`https://maps.google.com/maps?q=${venue.coordinates}&z=18&output=embed`} width="335" height="285" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
    <a className="reference-map-open" href={venue.mapUrl} target="_blank" rel="noopener noreferrer">Open {venue.label} location</a>
  </div>;
}

type OpeningProps = {
  phase: "closed" | "opening" | "open";
  videoRef: RefObject<HTMLVideoElement | null>;
  onReveal: () => void;
};

/** One finished video keeps the complete seal and lettering in the same frame. */
export function ReferenceOpening({ phase, videoRef, onReveal }: OpeningProps) {
  return <div className={`opening-overlay reference-opening ${phase === "opening" ? "is-opening" : phase === "open" ? "is-exiting" : ""}`} aria-hidden="true">
    <div className="reference-opening-frame">
      <video
        ref={videoRef}
        src="/assets/media/envelope-opening-ah-v2.mp4"
        poster="/assets/images/envelope-poster-ah-v2.jpg"
        width="720"
        height="1280"
        preload="auto"
        muted
        playsInline
        disablePictureInPicture
        onEnded={onReveal}
        onError={onReveal}
        onTimeUpdate={() => {
          const video = videoRef.current;
          if (video?.duration && video.currentTime >= video.duration - .4) onReveal();
        }}
      />
    </div>
  </div>;
}

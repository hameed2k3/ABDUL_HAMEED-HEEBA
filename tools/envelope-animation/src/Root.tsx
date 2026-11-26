import { Composition } from "remotion";
import { EnvelopeOpening } from "./EnvelopeOpening";

export function Root() {
  return <Composition id="AHEnvelopeOpening" component={EnvelopeOpening}
    width={1080} height={1920} fps={60} durationInFrames={258} />;
}

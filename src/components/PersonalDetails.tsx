export function PersonalEnvelope() {
  return <span className="reference-envelope" aria-hidden="true">
    <img className="reference-envelope-artwork" src="/assets/images/envelope-poster-ah-v2.jpg" width={720} height={1280} alt="" fetchPriority="high" />
    <span className="reference-tap-hint"><span className="reference-chevron" /><span>Tap to open</span></span>
  </span>;
}

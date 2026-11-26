import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const PAPER = staticFile("assets/images/burgundy-floral-theme-v1.webp");
const SEAL = staticFile("assets/images/wax-seal-ah-v2.png");
const full: CSSProperties = { position: "absolute", inset: 0, width: 720, height: 1280 };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

function Layer({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...full, ...style }}>{children}</div>;
}

function Paper({ style }: { style?: CSSProperties }) {
  return <Img src={PAPER} style={{ ...full, ...style }} />;
}

/** Clean paper geometry, authored from a single deterministic frame clock. */
export function EnvelopeOpening() {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const time = frame / fps;
  const lift = interpolate(time, [.2, 3.4], [0, 1], { ...clamp, easing: Easing.bezier(.6, 0, .35, 1) });
  const light = interpolate(time, [2.6, 4], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const tip = interpolate(lift, [0, 1], [653, 308]);
  const tipPercent = tip / 1280 * 100;
  const flap = `polygon(0 0,100% 0,50% ${tipPercent}%)`;
  const lining = `polygon(0 0,50% ${tipPercent}%,100% 0,50% 55%)`;
  const seam = `M0 0 L360 ${tip} L720 0`;
  const waxWidth = interpolate(lift, [0, 1], [236, 294]);
  const waxHeight = interpolate(lift, [0, .55, 1], [254, 253, 205]);
  const shadowBlur = interpolate(lift, [0, 1], [3, 8]);

  return <AbsoluteFill style={{ backgroundColor: "#f5eddd" }}>
    <div style={{ ...full, transform: `scale(${width / 720})`, transformOrigin: "0 0" }}>
      <Paper />

      {/* Side folds retain their print alignment with the front pocket. */}
      <Layer style={{ clipPath: "polygon(0 0,50% 55%,0 100%)", background: "linear-gradient(105deg,#ffffff0a,#4b283214)" }}>{null}</Layer>
      <Layer style={{ clipPath: "polygon(100% 0,50% 55%,100% 100%)", background: "linear-gradient(255deg,#ffffff06,#4b28321b)" }}>{null}</Layer>

      {/* Opening reveals the same ivory paper, with depth confined to the liner. */}
      <Layer style={{ clipPath: lining }}>
        <Paper />
        <Layer style={{ background: `linear-gradient(180deg,rgba(93,62,45,${.06 + lift * .14}),rgba(93,62,45,${.18 + lift * .18}))` }}>{null}</Layer>
        <Layer style={{ background: "radial-gradient(ellipse at 50% 55%,#fff4d5bf,transparent 57%)", opacity: light * .75 }}>{null}</Layer>
      </Layer>

      {/* A separate shadow never blurs the printed material or fold edges. */}
      <svg style={full} viewBox="0 0 720 1280">
        <defs>
          <filter id="flap-shadow" x="-100" y="-100" width="920" height="1480" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation={2 + lift * 5} />
          </filter>
        </defs>
        <path d={`${seam} Z`} fill="#4d3231" opacity={.19 + lift * .12}
          transform={`translate(0 ${3 + lift * 13})`} filter="url(#flap-shadow)" />
      </svg>

      {/* Affine projection preserves the earlier front-facing rising-flap style. */}
      <Layer style={{ clipPath: flap }}>
        <Paper style={{ transform: `scaleY(${tip / 653})`, transformOrigin: "50% 0" }} />
        <Layer style={{ background: `linear-gradient(165deg,#fffdf817,rgba(103,72,52,${.025 + lift * .07}))` }}>{null}</Layer>
      </Layer>

      <Layer style={{ clipPath: "polygon(50% 55%,100% 100%,0 100%)" }}>
        <Paper />
        <Layer style={{ background: "linear-gradient(180deg,#fffaef1a,transparent 75%)" }}>{null}</Layer>
      </Layer>

      <svg style={full} viewBox="0 0 720 1280" fill="none">
        <defs>
          <filter id="edge-light"><feGaussianBlur stdDeviation="2.5" /></filter>
        </defs>
        <path d="M0 1280 L360 704 L720 1280" stroke="#725448" strokeOpacity=".17" strokeWidth="1" />
        <path d="M1 1280 L360 706 L719 1280" stroke="#fffaf1" strokeOpacity=".58" strokeWidth="1" />
        <path d={seam} stroke="#6d4e3d" strokeOpacity={.2 + lift * .12} strokeWidth="1.3" />
        <path d={`M0 1 L360 ${tip + 1.4} L720 1`} stroke="#fffdf5" strokeOpacity=".7" strokeWidth="1.1" />
        <path d="M0 0 L360 704 L720 0" stroke="#ffe0a4" strokeWidth="7" opacity={light * .6} filter="url(#edge-light)" />
      </svg>

      {/* Restrained warm light is behind the seal; the gold letters stay legible. */}
      <Layer style={{ clipPath: lining, opacity: light }}>
        <Layer style={{ background: "radial-gradient(ellipse at 50% 55%,#fff7ddcf 0%,#ffe0a440 20%,transparent 48%)" }}>{null}</Layer>
      </Layer>

      {/* Exact existing PNG, cropped only to its transparent margins. */}
      <div style={{ position: "absolute", left: 360 - waxWidth / 2, top: tip - waxHeight / 2,
        width: waxWidth, height: waxHeight,
        filter: `drop-shadow(0 ${5 + lift * 7}px ${shadowBlur}px rgba(53,20,26,${.24 - lift * .05}))` }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <Img src={SEAL} style={{ position: "absolute", maxWidth: "none", width: waxWidth * 1261 / 1132,
            height: waxHeight * 1247 / 1205, left: -waxWidth * 65 / 1132, top: -waxHeight * 26 / 1205 }} />
        </div>
      </div>
    </div>
  </AbsoluteFill>;
}

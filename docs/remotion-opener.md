# Remotion opener — preview release

Prepared 26 November 2026 on `feat/reel-style-opener` for draft PR #1. Production remains on `main` until visual review, including real iPhone Safari and Android Chrome checks.

The selected earlier rising-envelope style is rebuilt from clean layers in Remotion 4.0.547. The user's ivory embossing and burgundy flowers cover the envelope throughout. The existing complete A & H seal remains front-facing and moves with the flap tip; its original PNG is unchanged. No video tracking, letter replacement, 180-degree flip or generated artwork is used in this revision.

## Timeline and rendering

- 0–0.2s: website tap cue fades.
- 0.2–3.4s: a single eased frame clock raises the flap and full seal.
- 2.6–4.0s: restrained warm lining light develops behind the seal.
- 4.0–4.8s: the website's currentTime-driven crossfade reveals the home entrance.

Paper, pocket, flap, lining, fold edges, contact shadows, warm light and wax are separately authored. Texture edges remain sharp; only shadows/light are softened. The 720 × 1280 composition coordinates scale uniformly to the 1080 × 1920 output.

The output is 288 frames at 60fps, exactly 4.8 seconds, H.264/yuv420p/BT.709, CRF 20, faststart, without an audio track. File size: 1,399,130 bytes. The lossless WebP poster is extracted after encoding and explicit RGB conversion. Comparing RGB24 decodes of the poster and first video frame gives a maximum pixel difference of zero.

## Integration and isolation

The standalone project is in `tools/envelope-animation`, with pinned matching Remotion packages, its own lockfile and type check, and reproducible Studio/still/render commands. Root TypeScript and Vercel uploads exclude it. GitHub Actions adds a separate authoring type-check job; the normal website build does not install or run Remotion.

`EnvelopeIntro` serves the new versioned MP4 and WebP, using 1080 × 1920 intrinsic dimensions. Its existing interfaces, state machine, touch/mouse/keyboard button, repeated-tap guard, music gesture, reduced-motion fade, media recovery and independent 6.5-second completion timeout are retained. The poster stays visible until playback actually begins, and media controls remain hidden.

The ivory/burgundy theme, home scratch date, garden motion, event details and all three map links are retained. Source seal SHA256: `da2d87ea97894b2d22c0348a70097d9a784ad3880a8e7639dec13c08019ceb2d`.

## Verification

Six rendered checkpoints were reviewed: closed (0), early lift (48), halfway (108), raised (204), illuminated (240), final hold/reveal (287). The flap texture and wax stay aligned; the rim and letters share the same pose. Browser proofs and render metadata are in workspace `outputs/remotion-opener-review`.

The production website was inspected in the available Chromium browser at 390 × 844, 320 × 568, 844 × 390 and 1440 × 900. Closed and playing frame rectangles are identical. Enter, Space and double-click opening work; the main stays inert during revealing, then unlocks at scrollY 0. No playback controls are visible, and the normal browser console is clean. The keyboard scratch reveal displays Sunday, 03 January 2027.

A temporary local fixture tested reduced-motion input, failed video, interrupted playback and a deliberately stalled play promise in the actual Invitation component. Every path reaches open; the stalled case releases scroll/inert through the parent timeout. The fixture was removed before release.

Both project type checks, the existing nine application tests and the Next.js production build pass. Deployment/CI status is recorded alongside the review artifacts after publishing the preview. Real iPhone Safari and Android Chrome devices are unavailable in this Windows environment and remain required before production merge.

Reproduction instructions: `tools/envelope-animation/README.md`. Asset provenance and checksums: `ASSET-SOURCES.json`. The previous v3 video is retained for rollback, with its earlier implementation documented in `classic-opening-new-background.md`.

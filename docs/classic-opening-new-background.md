# Earlier opening animation with the new background

On 26 November 2026 the user requested the earlier opening animation with their new ivory embossed/burgundy floral background. This supersedes the native 3D fold on the same feature branch, `feat/reel-style-opener`.

The new background is rendered into the moving envelope itself. It is present in the cover, moving flap and open-envelope frames. The earlier 4.8-second timing, rising A & H seal and warm light are preserved; the native 180-degree flip is no longer mounted.

## Media

- Source motion: `public/assets/media/envelope-opening-ah-v2.mp4`, 720 × 1280, 30fps, 144 frames.
- New paper: `public/assets/images/burgundy-floral-theme-v1.webp`, supplied by the user.
- Finished animation: `public/assets/media/envelope-opening-burgundy-v3.mp4`, H.264/yuv420p, faststart, no audio, 1,396,421 bytes.
- Matching cover: `public/assets/images/envelope-poster-burgundy-v3.jpg`, extracted from the first encoded frame.
- Reproducible offline compositor: `docs/compose_burgundy_opening.py`. It uses the source's fold shading and light, maps the new paper onto the lifting top flap, and retains the complete existing wax object from each source frame. No AI regeneration or separate lettering animation is used. Python, OpenCV, NumPy and FFmpeg are only needed to re-render this asset, not to build or run the website.
- The new and old clips have exactly the same frame count, frame rate and duration. Six sampled frames verify that the wax pixels differ by less than 3/255 on average after the new H.264 encode. Checksums are in `ASSET-SOURCES.json`.

## Browser behavior

The native opening button starts music and muted inline video in the user gesture. The poster remains visible until actual video playback begins, with the video hidden before then. There are no controls or standalone play buttons; Safari start-playback controls are explicitly hidden for this decorative video. The home and closing gardens remain animated WebP images.

The video's currentTime drives the final 0.8-second crossfade and revealing phase. The home entrance starts during that fade; scrolling and interaction unlock when opening completes. Reduced motion, a failed video or interrupted playback use a short fade. The independent 6.5-second parent timeout remains active so guests cannot stay trapped behind the cover. Enter, Space and the synchronous repeated-tap guard remain in place.

The ivory/burgundy application theme, scratch date inside the invitation, music, all three events and supplied map links are preserved.

## Verification and release

Type checking, all nine existing tests and the production build pass. Browser checks cover normal playback, Enter/Space, matching cover/video layout, hidden controls, 390 × 844 and 320 × 568 phones, and 844 × 390 landscape. The reveal finishes at the top of the invitation and releases the main's inert state. Browser console is clean on the normal path. A temporary local harness verified reduced motion, missing video and interrupted playback; it was removed before commit.

Detailed results: `docs/classic-opening-verification.json`. Visual proofs: workspace `outputs/reel-opener-review/old-animation`. Real iPhone Safari and Android Chrome checks remain for preview review.

Publish this change to the existing Vercel preview branch and draft PR #1. Production stays on `main` pending review. `docs/reel-preview.json` records the previous native-fold preview and should not be interpreted as the current animation.

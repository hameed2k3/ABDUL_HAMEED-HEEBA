# A & H envelope authoring

An isolated Remotion 4.0.547 project. The website serves the finished MP4 and poster; it does not import Remotion or render videos on Vercel.

From the repository root, using Node 24:

```sh
npm ci --prefix tools/envelope-animation
npm --prefix tools/envelope-animation run typecheck
npm --prefix tools/envelope-animation run studio
npm --prefix tools/envelope-animation run stills
npm --prefix tools/envelope-animation run render
```

`studio` previews the composition locally. `stills` renders six review frames without changing the website media. `render` renders those frames and the final video, remuxes it with faststart, and extracts a lossless WebP cover from its first decoded frame. FFmpeg must be available on PATH for the last two export steps.

The 720 × 1280 design space is scaled uniformly to 1080 × 1920, 60fps, 258 frames (4.3 seconds). All visual motion is driven by `useCurrentFrame()` and `useVideoConfig()`. The existing `burgundy-floral-theme-v1.webp` and transparent `wax-seal-ah-v2.png` are loaded from the repository's public directory. Only transparent seal margins are cropped; letters and rim remain one image with one transform.

Paper, pocket, flap, lining, shadow, light and seal are separate layers. The flap uses a controlled front-facing affine projection to preserve the selected rising motion. Fold boundaries stay sharp while shadows are rendered separately. The website retains its tap cue, music and final crossfade; these are not baked into the video.

Output:

- `public/assets/media/envelope-opening-remotion-v5.mp4`: H.264, yuv420p, BT.709, CRF 20, no audio, faststart.
- `public/assets/images/envelope-poster-remotion-v5.webp`: lossless RGB first-frame cover. Explicit BGRA conversion before WebP encoding prevents a BT.709/YUV color shift.
- Workspace `outputs/remotion-opener-review-v5`: six PNG checkpoints, render metadata and browser proofs.

The review directory is a sibling of this repository. On Windows, the renderer uses installed Chrome in an isolated headless session when available, avoiding executable-path limits in deeply nested checkouts. `REMOTION_BROWSER_EXECUTABLE` can select another compatible Chromium executable. Other platforms use Remotion's normal browser provisioning.

The authoring project has its own lockfile and type check. It is excluded from the root TypeScript project and Vercel uploads. GitHub CI installs and type-checks it in a separate job; video rendering is an explicit local step. Do not add these packages to the website's runtime dependencies.

Media filenames are immutable/cache-versioned. For a later visual revision, bump the asset names in `render.mjs` and the website's `EnvelopeIntro` together. Earlier video versions remain available for rollback.

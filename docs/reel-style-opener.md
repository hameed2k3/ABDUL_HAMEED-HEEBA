# Native envelope opener and burgundy theme

Feature branch: `feat/reel-style-opener`. Prepared 26 November 2026 for preview review; production remains on `main`.

The reference reel's on-screen sequence is recreated with local artwork. Hands, phone footage, sample couple details and branding are excluded. The user's subsequent theme direction applies their ivory embossing and burgundy flowers throughout the cover, headings, countdown, event cards, map controls and closing text. Gold remains a restrained accent in the original A & H wax artwork and retained garden ornaments.

## Implementation

- A single 720 × 1280 stage, uniformly scaled by ResizeObserver, contains aligned paper, lining, V-shaped pocket and front/back flap faces. The hinge is at y=384 and flap tip at y=704; opening reverses the tip to y=64, keeping it visible on short screens.
- The full transparent seal is a child of the flap front. Its lettering and rim are never separated, tracked, redrawn or morphed. Front/back faces use backface visibility; only the paper faces are clipped, preserving the seal that extends beyond the flap tip.
- Web Animations API effects use the same document-timeline startTime and 4800ms duration. Tap cue fades by 200ms; flap folds from 200–2800ms; warm light and deterministic particles emerge after 2800ms; the cover fades from 4000–4800ms.
- State progresses through closed → opening → revealing → open. The master animation's currentTime starts the home entrance during revealing. The home observer/motion does not restart on the transition to open. The main stays inert and scrolling locked until completion.
- A native button supports touch, mouse, Enter and Space. A synchronous ref guard ignores repeated activation. Music starts in the original user gesture. Focus moves into the invitation when opening finishes.
- Reduced motion, unavailable/unloaded artwork and unsupported animation/3D use a 400ms fade. An independent 6500ms watchdog survives both opening phases and unlocks the invitation if animation completion is lost.
- Opening resets scroll to the top, disables restoration while the cover is present and reserves stable scrollbar space to avoid a horizontal shift during unlock.
- No opening video is rendered. The garden remains animated WebP, with a static reduced-motion source. Scratch-to-reveal stays inside the invitation. All three existing event times and maps are unchanged.

## Artwork and provenance

- `public/assets/images/burgundy-floral-theme-v1.webp`: the user-supplied 675 × 1200 ivory embossed/burgundy floral background, optimized by FFmpeg libwebp quality 92. Original retained at `docs/artwork/burgundy-floral-theme-v1.png`.
- `public/assets/images/ivory-floral-paper-v3.webp`: clean paper for the lining and back of the flap, optimized by FFmpeg libwebp quality 88. Built-in image_gen edit, original retained at `docs/artwork/ivory-floral-paper-v3.png`.
- `public/assets/images/wax-seal-ah-v2.png`: existing artwork unchanged. SHA256 `da2d87ea97894b2d22c0348a70097d9a784ad3880a8e7639dec13c08019ceb2d`.
- Asset checksums are recorded in `ASSET-SOURCES.json`. The earlier opening MP4/poster are retained as archived assets but are no longer requested by the UI.

Built-in image generation prompt, using the existing ivory envelope poster as the edit target:

> Use case: precise-object-edit. Asset type: clean ivory embossed floral paper texture for a layered wedding envelope animation. Edit target: the provided ivory envelope photograph. Produce a flat, front-facing, full-bleed portrait sheet, aspect ratio 9:16, in the EXACT same creamy ivory paper, delicate deeply embossed white botanical branches and small flowers. Preserve the original floral character, scale, warm fine-grain paper and restrained light/shadows. Remove the entire burgundy wax seal and ALL lettering completely, reconstructing clean paper beneath. Remove ALL diagonal envelope folds, seams, flap edges, cast fold shadows, bottom rim, and envelope geometry: this must be one continuous FLAT sheet of embossed paper, not an envelope photograph. Arrange delicate symmetrical ivory floral vines along the left and right edges with slight inward branches; keep the central 45% mostly empty paper to accept the existing separate wax seal in code. Florals may continue near top and bottom edges. No text, initials, monogram, seal, logo, hands, people, border, cutout, or drawn envelope. Uniform paper fills entire image. The layer geometry will be built deterministically in CSS; do not draw folds.

## Verification

- Type checking, existing nine tests, and optimized Next.js production build pass.
- Browser visual checks: closed cover, front face with seal during rotation, turned-away seal/back face, fully opened flap, light/sparkles, crossfade and final home. Frame proofs saved in the workspace's `outputs/reel-opener-review` folder. Temporary local seek controls used to inspect exact timestamps were removed before commit.
- Responsive checks in the available Chromium browser: 390 × 844 phone, 320 × 568 narrow phone, 844 × 390 short/landscape and desktop. The same scene geometry scales without separate layer offsets.
- Enter and Space open the envelope. Keyboard scratch reveal shows Sunday, 03 January 2027. All three map tabs switch to the supplied URLs/pins. There are zero video elements and no media controls.
- Reduced-motion path tested using the component preference input; failed artwork path tested with a missing paper source. Both reach open and release inert/scroll locking. Cancelling all opener animations verified watchdog recovery.
- Production-build smoke check verifies the normal 4.8-second opening and top-of-page reveal with no QA controls.
- Real iPhone Safari and Android Chrome devices are not available in this Windows environment. Responsive Chromium and standard cross-browser APIs were checked; device-specific visual confirmation is still needed on the preview before production merge.

## Release

Deploy this branch as a Vercel preview. Do not merge into `main` or deploy with `--prod` until the visual review is complete. Preview URL and deployment identifier are recorded in `reel-preview.json` once deployment is ready.

# ABDUL_HAMEED-HEEBA

[![CI](https://github.com/hameed2k3/ABDUL_HAMEED-HEEBA/actions/workflows/ci.yml/badge.svg)](https://github.com/hameed2k3/ABDUL_HAMEED-HEEBA/actions/workflows/ci.yml)

Abdul Hameed & Heeba’s personalized wedding invitation.

**Live invitation:** [abdul-hameed-heeba.vercel.app](https://abdul-hameed-heeba.vercel.app)

Connected to Vercel with `main` as the production branch. Pushes to `main` deploy automatically.

Next.js 16.4.6, React 19 and TypeScript implementation of the supplied Sacred Garden reference. The original decorative artwork, local fonts, animation keyframes, paper textures and portrait composition are retained. The site renders through React without Tilda runtime or tracking scripts.

## Run locally

Requires Node.js 24.x (pinned in `.nvmrc` and `package.json`).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The same invitation is available at `/thesacredgarden`.

For a production server reachable from another device on the same network:

```sh
npm run build
npm start -- --hostname 0.0.0.0
```

Use the computer's Wi-Fi IPv4 address and port 3000.

## Personalized details

Edit `src/config/invitation.ts` for names, qualifications, date, events, venue names and map links. The countdown uses the Nikah instant with the explicit India Standard Time offset.

- Abdul Hameed, B.Tech and Heeba, M.Com.
- Sunday, 3 January 2027.
- Reception: 9:00 AM, Groom’s House, Adirampattinam.
- Nikah: 10:00 AM, Beach Street Masjid, Adirampattinam.
- Walima: 1:00 PM, Beach Street Madrasah, Adirampattinam.
- All three venue links are the exact Google Maps links supplied by the user; separate coordinates drive the framed embedded maps.

Three events appear in chronological order: Reception at 9:00 AM, Nikah at 10:00 AM and Walima at 1:00 PM. The original 570-pixel timeline remains spacious, using its first, middle and last positions with the scroll-driven rose. Up to five entries can be placed across the existing timeline slots by editing the schedule. Each event uses a venueKey, and both the arched cards and map tabs derive from that event-to-venue mapping so their labels and pins remain paired.

Dress code, gift information and RSVP were omitted at the user's request. The RSVP form is not mounted; `/api/rsvp` returns 404 while disabled. Its validation/delivery code remains dormant for a possible later request; setting a delivery environment variable alone does not expose a form.

## Reference design and motion

Six sections retain the spacious reference composition: invitation (1327px, extended from 1240px to fit the scratch date), countdown (257px / 247px on phones), timeline (570px), location (650px / 628px on phones, extended for three arched venue cards), framed map (343px) and closing (673px). The original guest-information and RSVP sections are intentionally omitted.

- Ivory embossed envelope with the supplied burgundy floral artwork, complete A & H seal and accessible Tap to open button. One tap starts the earlier opening animation, now rendered with the new floral paper, and the existing music.
- Inside the invitation home section, below Nikah Ceremony and above the names, scratch the A & H seal to reveal Sunday, 3 January 2027. Keyboard users can focus the same seal and press Enter or Space. No scratching is required on the opening envelope.
- The earlier 4.8-second opening motion is restored using a new finished video with the supplied burgundy floral paper throughout. Its original complete A & H seal, movement and warm light are retained. A first-frame poster matches the video. The video stays hidden until playback starts and has no visible controls. Reduced motion, failed media or interrupted playback use a short fade; a 6.5-second watchdog prevents a stuck cover.
- Garden/swans motion rendered as an animated WebP, so iOS cannot show a native video play icon over it. The floating music play/pause button is removed as requested; background music still starts on opening. A static garden image is selected for reduced-motion preferences.
- Original scroll reveals, floating florals, petals, parchment edges, ornaments and moving timeline rose.
- Animated countdown digits, original ornate map frame and venue-selection tabs.
- Full-height floral closing with garden/swans in place of the sample human photo.

No human photograph or unrelated New York venue illustration is served. Three arched venue cards fill the extended former illustration area, with Reception centered above the Nikah and Walima cards. The original reference is adapted to the user's content and exclusions; personalized text and artwork are not a literal pixel-for-pixel copy.

`src/data/scenes.json` contains positioned layers and animation keyframes. `src/app/reference.css` retains responsive source layout rules; `src/app/globals.css` supplies personalized text fitting and React component styling. `src/components/EnvelopeIntro.tsx` and `src/app/envelope.css` implement the video opener; `src/app/theme.css` applies the ivory and burgundy palette. The existing seal PNG is reused unchanged. `docs/classic-opening-new-background.md` documents the restored animation and verification. `docs/reel-style-opener.md` records the superseded native-fold iteration and paper generation prompt. Earlier offline video-compositing files remain as history; raw reference footage remains in the separate original-site archive. `ASSET-SOURCES.json` records retained source URLs and checksums. The A & H artwork edit prompts are saved in `docs/envelope-artwork.txt` and `docs/seal-animation-fix.txt`.

## Verify

```sh
npm run typecheck
npm test
npm run build
```

See `docs/classic-opening-new-background.md` for current feature-preview checks; `docs/production-verification.json` records the earlier production release. Phone checks used 375 × 812 and 393 × 852 viewports. Checks covered the restored tap-to-open flow, scratch reveal inside home and keyboard access. The latest update verified all three event times, the reception pin, switching all three map tabs, reception-card navigation, the social preview, and mobile/desktop card spacing. Both media buttons remain absent. Desktop composition was also inspected previously.

## GitHub and Vercel production

Repository: [hameed2k3/ABDUL_HAMEED-HEEBA](https://github.com/hameed2k3/ABDUL_HAMEED-HEEBA). The application is at the repository root; use **Root Directory `.`**, not an `outputs/` subdirectory.

`vercel.json` selects Next.js, installs the locked dependencies with `npm ci`, and builds with `npm run build`. Node.js is pinned to 24.x. Keep the default Next.js output directory. Every push and pull request to `main` runs the GitHub Actions type check, nine unit tests, and production build on Linux.

To connect the existing repository in the Vercel dashboard:

1. Import `hameed2k3/ABDUL_HAMEED-HEEBA` as a Next.js project named `abdul-hameed-heeba`.
2. Keep Root Directory `.` and the build settings from `vercel.json`.
3. Use `main` as the production branch. Once connected, pushes to `main` create production deployments; pull requests create previews.
4. No environment variables are required for this version. Vercel's production-domain variable supplies metadata URLs automatically. For a custom domain, optionally set `NEXT_PUBLIC_SITE_URL` to its complete HTTPS origin and redeploy.

The Vercel CLI can also deploy the project after account sign-in:

```sh
npx --yes vercel@66.6.0 login
npx --yes vercel@66.6.0 deploy --prod --project abdul-hameed-heeba --create-if-missing --yes
npx --yes vercel@66.6.0 link --project abdul-hameed-heeba --yes
npx --yes vercel@66.6.0 git connect https://github.com/hameed2k3/ABDUL_HAMEED-HEEBA.git --yes
```

The invitation needs no database or paid asset service. Hosting remains subject to the chosen Vercel plan's terms and limits. No local environment secrets, build output or dependencies are committed. Read the live deployment status in `docs/github-vercel-status.json`.

import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { spawnSync } from "node:child_process";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { browserOptions } from "./browser.ts";

const directory = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(directory, "../..");
const proof = path.resolve(project, "../remotion-opener-review");
const movie = path.join(project, "public/assets/media/envelope-opening-remotion-v4.mp4");
const poster = path.join(project, "public/assets/images/envelope-poster-remotion-v4.webp");
const stillsOnly = process.argv.includes("--stills");
const browser = browserOptions();
await mkdir(proof, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(directory, "src/index.ts"),
  publicDir: path.join(project, "public"), outDir: path.join(directory, ".cache/bundle") });
const composition = await selectComposition({ serveUrl, id: "AHEnvelopeOpening", ...browser });
const checkpoints = [[0, "01-closed"], [48, "02-early-lift"], [108, "03-halfway"],
  [204, "04-raised"], [240, "05-illuminated"], [287, "06-final-reveal"]];

for (const [frame, label] of checkpoints) {
  await renderStill({ composition, serveUrl, frame, imageFormat: "png", output: path.join(proof, `${label}.png`), ...browser });
  console.log(`Reviewed frame ${frame}: ${label}`);
}
if (stillsOnly) process.exit(0);

let lastProgress = -1;
await renderMedia({ composition, serveUrl, outputLocation: movie, codec: "h264", pixelFormat: "yuv420p",
  crf: 20, imageFormat: "png", colorSpace: "bt709", concurrency: 2, muted: true, ...browser,
  onProgress: ({ progress }) => {
    const step = Math.floor(progress * 10);
    if (step !== lastProgress) { console.log(`Rendering ${step * 10}%`); lastProgress = step; }
  } });
// Faststart and poster extraction operate only on the finished Remotion output.
const faststart = path.join(proof, "faststart.mp4");
function ffmpeg(args) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || "FFmpeg failed");
}
ffmpeg(["-i", movie, "-c", "copy", "-an", "-movflags", "+faststart", faststart]);
const { copyFile } = await import("node:fs/promises");
await copyFile(faststart, movie);
// Convert BT.709 to RGB before libwebp; passing YUV directly changes its colors.
ffmpeg(["-i", movie, "-frames:v", "1", "-pix_fmt", "bgra", "-c:v", "libwebp", "-lossless", "1", poster]);
await writeFile(path.join(proof, "render.json"), JSON.stringify({ remotion: "4.0.547", composition: composition.id,
  width: composition.width, height: composition.height, fps: composition.fps, durationInFrames: composition.durationInFrames,
  durationSeconds: composition.durationInFrames / composition.fps, codec: "h264", pixelFormat: "yuv420p", crf: 20,
  audio: false, faststart: true, movie, movieBytes: (await stat(movie)).size, poster,
  checkpoints: checkpoints.map(([frame, label]) => ({ frame, label })) }, null, 2) + "\n");
console.log(`Rendered ${movie}`);

"""Retexture the existing 4.8-second opening video with the supplied floral paper.

Preserves the earlier video's timing, full wax seal, fold shading and warm light.
The top paper follows the seal/flap pose; the output is one finished H.264 video.
Run from the repository root with Python, OpenCV, NumPy and FFmpeg available.
"""
from pathlib import Path
import json
import shutil
import subprocess

import cv2
import numpy as np

PROJECT = Path(__file__).resolve().parents[1]
PUBLIC = PROJECT / "public"
SOURCE = PUBLIC / "assets/media/envelope-opening-ah-v2.mp4"
PAPER = PUBLIC / "assets/images/burgundy-floral-theme-v1.webp"
OUTPUT = PUBLIC / "assets/media/envelope-opening-burgundy-v3.mp4"
POSTER = PUBLIC / "assets/images/envelope-poster-burgundy-v3.jpg"


def wax_mask(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    red = cv2.inRange(hsv, np.array([0, 75, 10]), np.array([10, 255, 255]))
    red |= cv2.inRange(hsv, np.array([160, 75, 10]), np.array([179, 255, 255]))
    contours, _ = cv2.findContours(red, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    candidates = [c for c in contours if 160 < cv2.boundingRect(c)[2] < 400 and 110 < cv2.boundingRect(c)[3] < 350]
    contour = max(candidates, key=cv2.contourArea)
    mask = np.zeros(frame.shape[:2], np.uint8)
    cv2.drawContours(mask, [contour], -1, 255, -1)
    x, y, w, h = cv2.boundingRect(contour)
    return mask, (x + w / 2, y + h / 2)


def clean_paper(frame, mask):
    expanded = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (35, 35)))
    x, y, w, h = cv2.boundingRect(expanded)
    x0, y0 = max(0, x - 30), max(0, y - 30)
    x1, y1 = min(720, x + w + 30), min(1280, y + h + 30)
    clean = frame.copy()
    clean[y0:y1, x0:x1] = cv2.inpaint(frame[y0:y1, x0:x1], expanded[y0:y1, x0:x1], 7, cv2.INPAINT_TELEA)
    return clean


def main():
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("FFmpeg is required")
    capture = cv2.VideoCapture(str(SOURCE))
    fps = capture.get(cv2.CAP_PROP_FPS)
    total = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    assert capture.get(cv2.CAP_PROP_FRAME_WIDTH) == 720
    assert capture.get(cv2.CAP_PROP_FRAME_HEIGHT) == 1280
    paper = cv2.resize(cv2.imread(str(PAPER)), (720, 1280), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
    yy, xx = np.mgrid[0:1280, 0:720].astype(np.float32)
    encoder = subprocess.Popen([
        ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pixel_format", "bgr24",
        "-video_size", "720x1280", "-framerate", str(fps), "-i", "-", "-an", "-c:v", "libx264",
        "-preset", "medium", "-crf", "18", "-profile:v", "high", "-level:v", "3.1", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", str(OUTPUT),
    ], stdin=subprocess.PIPE)
    first_tip = None
    for index in range(total):
        ok, frame = capture.read()
        if not ok:
            raise RuntimeError(f"Missing source frame {index}")
        mask, (cx, cy) = wax_mask(frame)
        if first_tip is None:
            first_tip = cy
        clean = clean_paper(frame, mask).astype(np.float32)
        # Remove the old fine embossed texture while retaining its broad crease
        # shadows. The supplied artwork remains the only sharp paper texture.
        shade = cv2.GaussianBlur(cv2.cvtColor(clean, cv2.COLOR_BGR2GRAY), (0, 0), 9)
        shade = np.clip(shade / 222.0, .48, 1.12)
        # The old flap raises its point rather than performing the new 3D flip.
        # Its paper contracts with that same point, carrying the top floral print.
        flap = ((xx >= cx * yy / max(cy, 1)) & (xx <= 720 - (720 - cx) * yy / max(cy, 1)) & (yy <= cy))
        map_y = np.minimum(1279, yy * first_tip / max(cy, 1)).astype(np.float32)
        lifted = cv2.remap(paper, xx, map_y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        texture = np.where(flap[:, :, None], lifted, paper)
        rendered = texture * shade[:, :, None]
        # Retain the source's moving golden light outside the entire wax object.
        warmth = cv2.GaussianBlur(clean[:, :, 2] - clean[:, :, 0], (0, 0), 3)
        glow = np.clip((warmth - 42) / 125, 0, .8)[:, :, None]
        rendered = rendered * (1 - glow) + np.array([153, 229, 255], np.float32) * glow
        # Composite the exact complete wax object from the earlier animation.
        # No lettering/rim tracking or independent motion is introduced.
        alpha = cv2.GaussianBlur(mask, (3, 3), .55).astype(np.float32)[:, :, None] / 255
        shadow = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 8) * .2
        rendered *= (1 - shadow[:, :, None])
        rendered = rendered * (1 - alpha) + frame.astype(np.float32) * alpha
        encoder.stdin.write(np.clip(rendered, 0, 255).astype(np.uint8).tobytes())
        if index % 30 == 0:
            print(f"Rendered {index}/{total} frames", flush=True)
    capture.release()
    encoder.stdin.close()
    if encoder.wait() != 0:
        raise RuntimeError("Video encoding failed")
    # Poster must come from the encoded output, so tapping cannot swap artwork.
    subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(OUTPUT), "-frames:v", "1", "-q:v", "2", str(POSTER)], check=True)
    print(json.dumps({"frames": total, "seconds": total / fps, "videoBytes": OUTPUT.stat().st_size, "poster": str(POSTER)}, indent=2), flush=True)


if __name__ == "__main__":
    main()

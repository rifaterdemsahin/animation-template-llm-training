# Render: Remotion Video Rendering (No Asset Regeneration)

**Command:** `render`

Renders all 5 Remotion compositions to MP4 using existing assets in `generated-assets/`. Does NOT regenerate SVG or audio — uses whatever is already saved.

## Usage

```
/render
```

Or render individual scenes:

```
/render scene1
/render scene2
/render scene3
/render scene4
/render full
```

## What it does

1. Reads `generated-assets/infographic.svg` (if exists) and pre-computes base64 data URI
2. Reads `generated-assets/narration.txt` (if exists) as script prop
3. Renders each composition via `npx remotion render` with `--overwrite`
4. Outputs MP4s to `remotion/exports/`
5. Prints summary table with file sizes

## Execution

```bash
# All 5 compositions
cd remotion && npm run render:all

# Individual scenes
cd remotion && npm run render:scene1
cd remotion && npm run render:scene4
```

## Output

| Composition | File | Frames | Duration |
|-------------|------|--------|----------|
| Scene1 | `exports/scene1.mp4` | 120 | 4s |
| Scene2 | `exports/scene2.mp4` | 240 | 8s |
| Scene3 | `exports/scene3.mp4` | 300 | 10s |
| Scene4 | `exports/scene4.mp4` | 180 | 6s |
| FullVideo | `exports/full-video.mp4` | 840 | 28s |

All at 1920×1080, 30fps, h264 codec.

## Props Passed

Each composition receives:
- `svgData` — raw SVG string
- `svgDataUri` — pre-computed base64 data URI
- `audioSrc` — `undefined` (audio disabled; use `staticFile()` for audio)
- `script` — narration text

## Fallback

If `generated-assets/infographic.svg` is missing, renders still work — compositions use their default hardcoded content.

# Agent Instructions

## Asset Generation Workflow

When generating assets (infographics, audio, animation, etc.):
1. Record the input prompt used for generation alongside the generated assets (e.g., `generated-assets/prompts/`)
2. Commit all changes with a descriptive message including the prompt context
3. Push to origin

## Remotion Video Pipeline

When generating videos with Remotion, use this full pipeline:

### Pipeline: `npm run pipeline -- "<topic>"`
(from `remotion/` directory)

This runs end-to-end:
1. **Starts Flask server** (server.py on port 5177) with Gemini API
2. **Generates SVG infographic** via `POST /api/generate/infographic` → saves to `generated-assets/infographic.svg`
3. **Generates narration script** via `POST /api/generate/audio` → saves to `generated-assets/narration.txt`
4. **Converts narration to MP3 audio** using macOS `say` command + ffmpeg → `generated-assets/narration.mp3`
5. **Renders all 5 Remotion videos** (Scene1-4 + FullVideo) with generated content as input props:
   - `svgData` — rendered as background `<Img>` in all scenes
   - `audioSrc` — played as narration `<Audio>` in all scenes
   - `script` — available for display overlay
6. **Saves prompt record** to `generated-assets/prompts/`

### Individual steps:
- `npm run generate:assets -- "<topic>"` — generate SVG + narration + audio only
- `npm run render:scene1` through `render:scene4` — render individual scenes
- `npm run render:full` — render combined 28s video

### Scene Compositions (input props):
Each scene accepts these optional props:
- `svgData` (string) — SVG markup rendered as background image via data URI
- `audioSrc` (string) — path to MP3 file for narration audio
- `script` (string) — narration text for potential display
- Additional scene-specific content props (title, description, badges, pillars, metrics, etc.)

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

## Embedding Rendered MP4 Walkthroughs

When using this template to generate architectural content, embed the rendered Remotion MP4 after each corresponding scene section. The MP4 files are produced at `remotion/out/`:

| Scene | MP4 File | Content |
|-------|----------|---------|
| Scene1 | `remotion/out/scene1.mp4` | Introduction / overview |
| Scene2 | `remotion/out/scene2.mp4` | Architecture pillars breakdown |
| Scene3 | `remotion/out/scene3.mp4` | Technical metrics / details |
| Scene4 | `remotion/out/scene4.mp4` | Key features / badges |
| Full  | `remotion/out/full-video.mp4` | Combined 28s walkthrough |

**Embedding rule:** After each architectural scene section in the generated output (Markdown, HTML, or documentation), insert the corresponding MP4 as a video embed:

```markdown
<!-- After Scene1 description -->
<video src="remotion/out/scene1.mp4" controls width="100%"></video>
```

For full combined walkthrough, embed at the end of the document:

```markdown
<video src="remotion/out/full-video.mp4" controls width="100%"></video>
```

**Pipeline integration:** The `npm run pipeline` command already renders all MP4s. After running the pipeline, reference the `remotion/out/` files for embedding in the template output.

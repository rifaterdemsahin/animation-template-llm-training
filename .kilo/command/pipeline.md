# Pipeline: Full Asset Generation + Video Render

**Command:** `pipeline`

Runs the complete end-to-end pipeline: starts Flask server, generates SVG infographic and narration via Gemini API, converts narration to MP3 audio, and renders all 5 Remotion compositions to MP4.

## Usage

```
/pipeline "<topic>"
```

## What it does

1. Starts Flask server (`server.py`) on port **5177**
2. Generates SVG infographic via `POST /api/generate/infographic` with `{topic, theme:"dark", animated:true}`
3. Generates narration script via `POST /api/generate/audio` with `{topic}`
4. Converts narration to MP3 using macOS `say` + ffmpeg
5. Renders all 5 Remotion compositions (Scene1-4 + FullVideo) with generated assets as input props
6. Saves prompt record to `generated-assets/prompts/`

## Prerequisites

- **Gemini API key** — retrieved from **Azure Key Vault** (`cfg.getSecret("GEMINI_API_KEY")`) or set via `GEMINI_API_KEY` env var
- **Azure CLI login** — `az login` must be completed (already logged in, keys in Azure Key Vault)
- **macOS** — `say` command for TTS
- **ffmpeg** — for MP3 conversion
- **Remotion dependencies** — installed in `remotion/node_modules/`

## Execution

```bash
cd remotion && npm run pipeline -- "<topic>"
```

## Output

| Asset | Path |
|-------|------|
| SVG infographic | `generated-assets/infographic.svg` |
| Narration text | `generated-assets/narration.txt` |
| Narration audio | `generated-assets/narration.mp3` |
| Scene 1 MP4 | `remotion/exports/scene1.mp4` |
| Scene 2 MP4 | `remotion/exports/scene2.mp4` |
| Scene 3 MP4 | `remotion/exports/scene3.mp4` |
| Scene 4 MP4 | `remotion/exports/scene4.mp4` |
| Full video MP4 | `remotion/exports/full-video.mp4` |
| Prompt record | `generated-assets/prompts/full-pipeline-{timestamp}.md` |

## Embedding

After running, embed MP4s in `index.html` and `README.md`:

```html
<video src="remotion/exports/scene1.mp4" controls width="100%"></video>
```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Verify server + Gemini readiness |
| `/api/generate/infographic` | POST | Generate SVG infographic |
| `/api/generate/audio` | POST | Generate narration script |
| `/api/generate/animation` | POST | Generate animation config JSON |

# Agent Instructions

## Template Usage: LLM Decision Patterns

When using this template to generate architectural demonstration projects, first read `llm_thinking_log.md` — it records 15 reusable decision patterns for:
- Project naming from root cause analysis
- Duck-typed agent contracts (proving config-over-code)
- Heuristic LLM models for reproducible benchmarks
- Token calculation formulas for cost quantification
- Visual design rules (4-color palette, 4-scene timeline)
- Image/MP4 fallback strategies when APIs are unavailable
- Web Speech API narration patterns
- Interactive widget construction (vanilla stack)
- QA audit overclaim identification
- Module file split conventions
- GitHub Pages deployment verification

## Environment Setup

### Gemini API Key via Azure Key Vault
The Express server (`server.js`) retrieves the Gemini API key from **Azure Key Vault**:
- **Authentication:** `DefaultAzureCredential` (uses `az login` — already logged in on CLI)
- **Key Vault URL:** Set via `AZURE_KEY_VAULT_URL` env var
- **Secret name:** `GEMINI_API_KEY_PRIMARY` (default, override with `GEMINI_SECRET_NAME` env var)
- **Fallback:** `GEMINI_API_KEY` env var (used by Flask `server.py`)

### Python Flask Server (Primary)
```bash
# Requires GEMINI_API_KEY in .env
python3 server.py          # port 5000
python3 -m flask run       # alternative
```

### Node.js Express Server (Azure Key Vault)
```bash
# Uses az login + Azure Key Vault
AZURE_KEY_VAULT_URL="https://<vault>.vault.azure.net/" node server.js
```

### Kilo Commands
This project includes Kilo command specs in `.kilo/command/`:
| Command | File | Purpose |
|---------|------|---------|
| `/pipeline "<topic>"` | `pipeline.md` | Full pipeline: generate assets + render all videos |
| `/render [scene]` | `render.md` | Render-only: render Remotion MP4s from existing assets |
| `/generate-assets "<topic>"` | `generate-assets.md` | Generate SVG + narration + MP3 via Gemini |
| `/serve` | `serve.md` | Start Flask dev server |

### Kilo Agents
| Agent | File | Specializes in |
|-------|------|---------------|
| `remotion-dev` | `remotion-dev.md` | Remotion composition development, debugging, scene creation |
| `infographic-builder` | `infographic-builder.md` | SVG infographic generation, narration scripts, API calls |

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

When using this template to generate architectural content, embed the rendered Remotion MP4 after each corresponding scene section. The MP4 files are produced at `remotion/exports/`:

| Scene | MP4 File | Content |
|-------|----------|---------|
| Scene1 | `remotion/exports/scene1.mp4` | Introduction / overview |
| Scene2 | `remotion/exports/scene2.mp4` | Architecture pillars breakdown |
| Scene3 | `remotion/exports/scene3.mp4` | Technical metrics / details |
| Scene4 | `remotion/exports/scene4.mp4` | Key features / badges |
| Full  | `remotion/exports/full-video.mp4` | Combined 28s walkthrough |

**Embedding rule:** After each architectural scene section in the generated output (Markdown, HTML, or documentation), insert the corresponding MP4 as a video embed:

```markdown
<!-- After Scene1 description -->
<video src="remotion/exports/scene1.mp4" controls width="100%"></video>
```

For full combined walkthrough, embed at the end of the document:

```markdown
<video src="remotion/exports/full-video.mp4" controls width="100%"></video>
```

**Pipeline integration:** The `npm run pipeline` command already renders all MP4s to `remotion/exports/`. After running the pipeline, reference the `remotion/exports/` files for embedding in the template output. The exports directory is tracked by git so MP4s deploy to GitHub Pages.

### Render-only (no asset regeneration):
- `npm run render:all` — renders all 5 videos to `remotion/exports/` using existing assets in `generated-assets/`
- `npm run render:scene1` through `render:scene4` — render individual scenes
- `npm run render:full` — render combined 28s video

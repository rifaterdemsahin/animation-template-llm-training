# Generate Assets: SVG Infographic + Narration + MP3

**Command:** `generate-assets`

Generates visual and audio assets using the Flask server's Gemini API endpoints. Does NOT render Remotion videos.

## Usage

```
/generate-assets "<topic>"
```

## What it does

1. Starts Flask server (`server.py`) on port **5177**
2. Generates SVG infographic via Gemini 2.5 Flash → `generated-assets/infographic.svg`
3. Generates narration script via Gemini 2.5 Flash → `generated-assets/narration.txt`
4. Converts narration to MP3 via macOS `say` + ffmpeg → `generated-assets/narration.mp3`
5. Saves prompt record to `generated-assets/prompts/`

## Gemini API Key

Retrieved from **Azure Key Vault** via `server.js` (`@azure/keyvault-secrets` + `DefaultAzureCredential`):
- **Key Vault URL:** `AZURE_KEY_VAULT_URL` env var
- **Secret name:** `GEMINI-API-KEY-PRIMARY` (default) or `GEMINI_SECRET_NAME` env var
- **Prerequisite:** `az login` must be completed (already logged in)

Fallback: `GEMINI_API_KEY` env var (for `server.py`).

## Execution

```bash
cd remotion && npm run generate:assets -- "<topic>"
```

## Output

| Asset | Path | Description |
|-------|------|-------------|
| SVG | `generated-assets/infographic.svg` | 800×600 SVG infographic |
| Script | `generated-assets/narration.txt` | Narration text (30-60s) |
| Audio | `generated-assets/narration.mp3` | TTS MP3 audio |
| Record | `generated-assets/prompts/generation-{timestamp}.md` | Prompt record |

## Design Constraints

- **Show don't tell** — ≤7 words per concept, graphics carry the explanation
- **Color palette:** Dark theme: `#1a1a2e` bg, `#e0e0e0` text, accents `#00d4aa` / `#e94560` / `#e8c766`
- **Animation groups:** `<g class="anim-fade-in">`, `<g class="anim-scale">`, `<g class="anim-slide-up">` for GSAP targets
- **Counter values:** `data-target="VALUE"` attributes on numeric elements

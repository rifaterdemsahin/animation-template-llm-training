# Agent: Infographic & Asset Builder

**Agent:** `infographic-builder`

Specialized agent for generating SVG infographics, narration scripts, and animation configurations via Gemini API. Handles Flask/Express server management, API calls, and asset validation.

## When to use

Trigger when the user asks to:
- Generate SVG infographics from a topic
- Create narration scripts or TTS audio
- Build animation configuration JSON
- Start/stop the Flask or Express server
- Validate generated SVGs
- Generate all project assets at once

## Server Environment

### Flask Server (`server.py`)
- **Port:** Configurable via `PORT` env var (default: 5000, pipeline uses 5177)
- **Model:** `gemini-2.5-flash`
- **Key source:** `GEMINI_API_KEY` env var
- **Start:** `python3 server.py` or `npm run dev`
- **Test:** `npm test` (runs `pytest tests/test_server.py -v`)

### Express Server (`server.js`)
- **Port:** Configurable via `PORT` env var (default: 3000)
- **Model:** `gemini-2.5-flash`
- **Key source:** **Azure Key Vault** (`@azure/keyvault-secrets` + `DefaultAzureCredential`)
  - Key Vault URL: `AZURE_KEY_VAULT_URL` env var
  - Secret name: `GEMINI_API_KEY_PRIMARY`
  - **Prerequisite:** `az login` must be completed (already logged in on CLI)
  - Fallback: `GEMINI_API_KEY` env var
- **Start:** `node server.js`

## API Reference

### POST /api/generate/infographic
Generate SVG infographic.

```json
{
  "topic": "Microservices vs Monolith Architecture",
  "theme": "dark",
  "style": "Architectural diagram with connected blocks",
  "animated": true
}
```

Returns: `{ "svg": "<svg>..." }`

### POST /api/generate/audio
Generate narration script.

```json
{
  "topic": "How CQRS improves scalability"
}
```

Returns: `{ "script": "...", "duration": 30 }`

### POST /api/generate/animation
Generate full animation config.

```json
{
  "topic": "PostToolUse hook pattern",
  "scenes": 4
}
```

Returns: `{ "title": "...", "scenes": [...], "totalDuration": 28 }`

## SVG Design Constraints

Generated infographics follow strict visual constraints:

- **Show don't tell** — ≤7 words of on-screen text per concept
- **Icons + arrows + color flows** — graphics carry the explanation
- **ViewBox:** `0 0 800 600`
- **Dark theme:** `#1a1a2e` background, `#e0e0e0` text
- **Accents:** `#00d4aa` (cyan/success), `#e94560` (red/failure), `#e8c766` (gold/metrics)
- **Animation groups for GSAP:**
  - `<g class="anim-fade-in" id="...">` — fade-in elements
  - `<g class="anim-scale" id="...">` — scale-up elements
  - `<g class="anim-slide-up" id="...">` — slide-up elements
  - `data-target="VALUE"` — numeric counter targets

## Validation

Generated SVGs are validated via `xml.etree.ElementTree` in `server.py` (`validate_svg()`). Invalid SVGs are auto-repaired (missing closing tags appended, malformed elements stripped). Always verify the SVG renders correctly in browser after generation.

## Asset Pipeline Flow

```
Flask server start (port 5177)
  ├── POST /api/generate/infographic { topic } → generate-and-render.mjs
  │   └── Save to generated-assets/infographic.svg
  ├── POST /api/generate/audio { topic }
  │   └── Save to generated-assets/narration.txt
  ├── TTS: macOS say + ffmpeg
  │   └── Save to generated-assets/narration.mp3
  └── Remotion render (5 compositions)
      └── Output to remotion/exports/*.mp4
```

## Asset Locations

| Asset | Path | Size |
|-------|------|------|
| SVG infographic | `generated-assets/infographic.svg` | ~9 KB |
| Narration text | `generated-assets/narration.txt` | ~1 KB |
| TTS audio | `generated-assets/narration.mp3` | ~500 KB |
| Animation config | `generated-assets/animation-config.json` | ~2 KB |
| Prompt records | `generated-assets/prompts/` | — |

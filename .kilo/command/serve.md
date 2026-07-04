# Serve: Start Development Server

**Command:** `serve`

Starts the Flask development server with Gemini API enabled. Serve at http://localhost:5000.

## Usage

```
/serve
```

## What it does

1. Loads `.env` for `GEMINI_API_KEY` and `PORT`
2. Initializes Gemini 2.5 Flash model
3. Starts Flask on `0.0.0.0:5000` (configurable via `PORT` env var)
4. Serves static files from project root (including `index.html`)

## API Endpoints Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | `{status, geminiReady}` |
| `/api/generate/infographic` | POST | Generate SVG infographic |
| `/api/generate/audio` | POST | Generate narration script |
| `/api/generate/animation` | POST | Generate animation config JSON |
| `/` | GET | Serve `index.html` |

## Gemini API Key

The Flask server (`server.py`) reads from `GEMINI_API_KEY` env var.
The Express server (`server.js`) uses **Azure Key Vault** (`@azure/keyvault-secrets` + `DefaultAzureCredential` with `az login`).

## Execution

```bash
# Flask (Python) — default
python3 server.py
npm run dev

# Express (Node.js) — if Azure Key Vault needed
node server.js
```

## Testing

```bash
npm test
# → pytest tests/test_server.py -v
```

Tests cover: health check, infographic generation (with/without API key), audio generation, animation config, CORS, and error handling.

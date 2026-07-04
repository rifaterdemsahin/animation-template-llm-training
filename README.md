# 🎬 GSAP Cinematic Animation Template for LLM Training

> https://rifaterdemsahin.github.io/animation-template-llm-training/

[![🎬 GSAP](https://img.shields.io/badge/🎬-GSAP%20Animation-88ce02?style=flat-square)](https://gsap.com)
[![🤖 LLM-Ready](https://img.shields.io/badge/🤖-LLM%20Ready-00d4aa?style=flat-square)](https://github.com/rifaterdemsahin/animation-template-llm-training)
[![🚀 Fly.io](https://img.shields.io/badge/🚀-Fly.io-24175C?style=flat-square)](https://animation-template-llm-training.fly.dev)
[![📄 License: MIT](https://img.shields.io/badge/📄%20License-MIT-yellow?style=flat-square)](LICENSE)

A **generic, self-contained HTML scaffold** for creating cinematic auto-playing architectural demo animations. Designed to be used by **LLMs (Large Language Models)** to rapidly generate polished exam-question demos for the Claude AI Architect certification (or any system-design problem).

## 🚀 Quickstart

```bash
# Option A — static only (no AI generators)
open index.html

# Option B — full server with AI generators
npm install
npm start
# → http://localhost:3000
```

---

## 🧠 How to Use This Template with an LLM

### Option 1: Give an LLM this README + the template

Copy the contents of `index.html` and give the LLM this prompt:

````markdown
You are an expert animation designer. Use the GSAP template at
`index.html` to create a cinematic architectural demo for the
following exam question:

## 🎯 Exam Question
[Paste your exam question here]

## ✅ Recommended Answer
[Paste the answer/architectural solution here]

## Instructions
1. Search for every `CUSTOMIZE` comment in the template.
2. Replace placeholder text, metrics, colors, and visuals with
   content derived from the question and answer above.
3. Set the `data-target` values on the metric cards to match
   your actual simulation or claimed improvement percentages.
4. Replace the terminal scripts with before/after CLI output.
5. Update the calculator parameters to model your domain.
6. Keep the GSAP 4-scene timeline structure.
7. Return the complete, updated `index.html`.
````

### Option 2: Copy-paste the template with your scenario

Open `index.html` and search for **`CUSTOMIZE`** — every tag is a place to inject your specific content:

| Tag | What to Replace |
|-----|----------------|
| `[Model Name]` | The LLM generating this (e.g., DeepSeek V4 Flash) |
| `[Architecture Pattern Name]` | Your exam topic |
| `[Anti-pattern name]` | The naive approach |
| `[Solution name]` | The recommended approach |
| `[Metric 1-3]` | Your comparison metrics |
| `[Pillar 1-3]` | The three pillars of your solution |
| `data-target="75"` | Counter animation targets |
| Terminal script arrays | Before/after CLI output |
| Calculator parameters | Your domain's inputs |

---

## 🎬 Template Structure

```
animation-template-llm-training/
├── index.html          # 🎬 The main template (self-contained)
├── server.js           # 🧠 Express server — AI generators + key vault
├── Dockerfile          # 🐳 Container image for Fly.io
├── fly.toml            # 🚀 Fly.io deployment config
├── .env.example        # 🔑 Environment variables reference
├── gh-pages/           # 📄 GitHub Pages redirect → Fly.io
│   └── index.html
├── favicon.svg         # 🖼️ Play-button favicon
├── package.json        # 📦 Dependencies (Express, Gemini, Azure)
├── .dockerignore
├── .gitignore
└── README.md           # 📘 This file
```

### What's Included

| Feature | Description | CUSTOMIZE? |
|---------|-------------|------------|
| **Cinematic Overlay** | 4-scene GSAP auto-playing video (28s) | ✅ Replace all text |
| **Modal Lightbox** | Click-to-enlarge for diagrams/images | ✅ Add your SVGs |
| **Comparison Table** | Side-by-side metric comparison | ✅ Rows & values |
| **Interactive Calculator** | Slider-driven parametric estimator | ✅ Formulas & params |
| **Terminal Simulator** | Typing-effect before/after CLI output | ✅ Script arrays |
| **Web Speech API** | Narration buttons (optional) | ✅ Speech text |
| **Reduced Motion** | `prefers-reduced-motion` support | ✅ Built-in |
| **Dark Theme** | Cyan/crimson/gold aesthetic | ✅ CSS variables |
| **🤖 Infographics Generator** | AI-powered SVG infographics on any topic via Gemini API | Gemini API key |
| **🎤 Audio Generator** | AI-generated narration scripts with browser speech playback | Gemini API key |

---

## 🎯 Example Prompt for ChatGPT / Claude

> **Copy this entire block when asking an LLM to create a demo:**

````
You have access to the file `index.html` which is a GSAP cinematic
animation template. Every section is marked with `CUSTOMIZE` comments.

Create a complete architectural demo for this exam question:

**Question:** [Paste question]

**Answer:** [Paste answer]

Do the following:
1. Replace all `CUSTOMIZE` placeholders with content from the Q&A.
2. Set data-target counters to reasonable improvement percentages.
3. Write the before/after terminal scripts as typed CLI output.
4. Populate the comparison table with realistic metrics.
5. Add any SVG diagrams as inline SVG inside diagram cards.
6. Keep the GSAP timeline structure. Return the full index.html.
````

---

## 🎨 Color Theme Customization

Edit the CSS `:root` variables to rebrand:

```css
:root {
  --cyan: #00d4aa;     /* Primary accent */
  --crimson: #e94560;  /* Error/failure */
  --bg: #0a0e27;       /* Background */
  --card: #1a1f4e;     /* Card background */
  --text: #c8d6e5;     /* Body text */
  --gold: #e8c766;     /* Headings */
  --green: #66ff99;    /* Success */
}
```

---

## 📐 GSAP Timeline Control

The 4-scene timeline in `startCinema()` uses precise time-coded sequencing:

```javascript
const tl = gsap.timeline();
// Scene 1: 0-4s
tl.to('#scene-1', { opacity: 1, duration: 0.8 });
// Scene 2: 4-12s
tl.to('#scene-2', { opacity: 1, duration: 0.8 }, '+=0.2');
// Scene 3: 12-22s
tl.to('#scene-3', { opacity: 1, duration: 0.8 }, '+=0.2');
// Scene 4: 22-28s
tl.to('#scene-4', { opacity: 1, duration: 0.8 }, '+=0.2');
```

Adjust `duration` and `+=` offsets to change pacing for your content.

---

## 🖥️ Live Demo

- **Fly.io (full app with AI generators):** [animation-template-llm-training.fly.dev](https://animation-template-llm-training.fly.dev)
- **GitHub Pages (static redirect → Fly.io):** [rifaterdemsahin.github.io/animation-template-llm-training](https://rifaterdemsahin.github.io/animation-template-llm-training)

> The Fly.io deployment serves the full app with AI generators. GitHub Pages automatically redirects to Fly.io.

---

## 🚀 Deployment

### Fly.io

```bash
# Install Flyctl
brew install flyctl

# Login and launch
flyctl auth login
flyctl launch   # first time — creates the app on Fly.io

# Set secrets (Gemini key from Azure Key Vault or direct)
flyctl secrets set AZURE_KEY_VAULT_URL=https://your-vault.vault.azure.net
# OR
flyctl secrets set GEMINI_API_KEY=your_gemini_api_key

# Deploy
flyctl deploy

# Open
flyctl open
```

Push to `main` auto-deploys via the [fly-deploy workflow](.github/workflows/fly-deploy.yml).  
Add `FLY_API_TOKEN` to your GitHub repository secrets to enable CI/CD.

### Azure Key Vault (recommended)

The server fetches the Gemini API key from Azure Key Vault at startup:

1. Store your Gemini key as a secret (e.g., `GEMINI-API-KEY-PRIMARY`) in your vault
2. Set `AZURE_KEY_VAULT_URL` environment variable on Fly.io
3. The server authenticates via `DefaultAzureCredential` (Managed Identity on Fly.io)

### GitHub Pages Redirect

The [static workflow](.github/workflows/static.yml) deploys the `gh-pages/` folder — a meta-refresh redirect page pointing to Fly.io. This means the original GitHub Pages URL always redirects to the live Fly.io app.

---

## 🤖 Attribution

| Field | Value |
|-------|-------|
| **Template by** | rifaterdemsahin |
| **Animation Engine** | GSAP 3.12.5 (CDN) |
| **AI Backend** | Google Gemini 2.5 Flash |
| **Key Vault** | Azure Key Vault |
| **Hosting** | Fly.io |
| **License** | MIT |

---

## 📄 License

MIT — use freely, attribute appreciated.

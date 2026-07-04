# LLM Thinking Log — Decision Patterns for Template Usage

**Template:** `animation-template-llm-training`
**Purpose:** Records how LLMs reason about architectural decisions when using this template to generate exam-demonstration projects.
**Updated:** 2026-07-05

---

## Decision 1: Project Name Derivation

**Pattern:** When the prompt provides an exam question + answer, derive the project name from the *root cause* being demonstrated, NOT the symptom or exam topic.

**Heuristic:**
1. Identify the anti-pattern from the question
2. Identify the fix from the answer
3. Name the project as `{root-cause}-{fix-pattern}-demo`

**Examples:**
| Exam Topic | Symptom | Root Cause | Project Name |
|------------|---------|------------|-------------|
| Customer Support Agent misinterprets dates | Wrong tool called | Vague tool descriptions | `tool-description-clarity-demo` |
| API rate limiter overloads | Too many requests | No backpressure | `circuit-breaker-backpressure-demo` |
| Cache stampede on expiry | All keys expire at once | No staggered refresh | `cache-stampede-prevention-demo` |

**Decision rule:** kebab-case, 3-4 words max, self-documenting.

---

## Decision 2: Architecture Pattern — Duck-Typed Contracts

**Pattern:** Both naive and resilient implementations must share an identical interface. This proves the fix is in *data/config*, not *code*.

**Interface contract:**
```javascript
async processNaive(query, tools) -> { status, result, attempts, tokensUsed }
async processResilient(query, tools) -> { status, result, attempts, tokensUsed }
```

**Why:** If the coordinator can swap implementations without changing a single line, it proves the architectural point — the same code + better config = better results. The difference is purely in tool descriptions, not in code logic.

**Document in README:** Show the interface contract explicitly so readers understand both agents are drop-in replacements.

---

## Decision 3: Simulated LLM Behavior — Heuristic Model

**Pattern:** When a zero-dependency, reproducible benchmark is needed (no real LLM API call), use a heuristic model with `Math.random()` for the naive branch and deterministic regex matching for the resilient branch.

**Model design:**
- **Naive:** 60% chance of wrong tool selection (simulates vague descriptions causing ambiguity)
- **Resilient:** Deterministic correct selection (simulates clear entity-boundary descriptions)

**Token estimation:** Each wrong-tool roundtrip costs ~400-800 extra tokens (correction prompt + retry). The resilient approach invests ~200 extra tokens upfront in better descriptions, netting 400 fewer tokens per query.

**Critical label:** ALL metrics must be labeled as "simulated" in output, tables, and docs. Never present heuristic numbers as production telemetry. Include exact reproduction command (`node demo.js --benchmark`).

---

## Decision 4: Token Usage Calculation Model

**Pattern:** Token savings must be quantifiable and defensible.

**Formula:**
```
naiveTokens = BASE_COST + wrongToolProbability * CORRECTION_COST + random(0, NOISE)
resilientTokens = BASE_COST + UPFRONT_DESCRIPTION_COST + random(0, NOISE)
```

**Default values:**
- BASE_COST: 400 tokens (system prompt + user query + tool definitions + first call)
- CORRECTION_COST: 400-800 tokens (coordinator correction + retry)
- UPFRONT_DESCRIPTION_COST: 200 tokens (longer but clearer tool descriptions)
- NOISE: 0-200 tokens (simulated variance)

**Display rule:** Show a "Token Efficiency Scoreboard" at the bottom of `index.html`, `demo.js` output, and `README.md`.

---

## Decision 5: Visual Design — Dark Tech Aesthetic

**Pattern:** Use a 4-color palette that maps to the narrative arc.

| Color | Hex | Role |
|-------|-----|------|
| Cyan | `#00d4aa` | Title cards, neutral UI, code — the "architectural" color |
| Crimson | `#e94560` | Naive/failure paths — carries emotional weight |
| Gold | `#e8c766` | Metrics, savings, key takeaways |
| Green | `#66ff99` | Resilient/success paths — conveys correctness |

**Background:** `#0a0e27` (deep navy-black) for high contrast with all accents.
**Cards:** `#1a1f4e` for layering without breaking the dark theme.
**Font:** Large, legible (48px+ headings, 24px+ body) for 1080p screen recording.

**Projection rule:** All text must be readable on a projected screen. No tiny hover states, no scrollable panels, no glassmorphic cards.

---

## Decision 6: GSAP Timeline Structure — 4-Scene Format

**Pattern:** A single `gsap.timeline()` with precise second markers. 4 scenes = 28 seconds total.

| Scene | Frames (30fps) | Seconds | Content |
|-------|----------------|---------|---------|
| Scene 1 | 0–119 | 0–4s | Title card + challenge statement fade in |
| Scene 2 | 120–359 | 4–12s | Naive approach fails — red flash, warning overlay |
| Scene 3 | 360–659 | 12–22s | Resilient architecture — 3-pillar cards stagger in, green success |
| Scene 4 | 660–839 | 22–28s | Metrics — numbers count up from 0 to targets |

**Transition rule:** 0.3s opacity crossfades between scenes. No abrupt cuts.

**Auto-play:** Trigger on `window.onload` after 500ms delay. Skip button always visible.

**GSAP version:** 3.12.5 from CDN (no npm dependency for browser path).

---

## Decision 7: Image Generation — SVG Fallback Strategy

**Pattern:** Primary = Gemini API (`/api/generate/infographic`), Fallback = hand-crafted SVG, Never = placeholder images.

**When Gemini is unavailable:**
1. Write SVG by hand following the same design constraints (≤7 words, icons + arrows, color-coded)
2. Save to `docs/step-images/`
3. Embed with `<img>` and modal lightbox (click → fullscreen)
4. Reference in narration scripts

**SVG design constraints:**
- ViewBox: `0 0 800 600`
- Dark theme colors matching the GSAP palette
- Animation groups: `<g class="anim-fade-in">`, `<g class="anim-scale">`, `<g class="anim-slide-up">`
- Counter targets: `data-target="VALUE"` attributes
- Max 7 words per graphic — icons and arrows carry the explanation

**Number of diagrams needed:** 1 per scene + 1 per step in the walkthrough = ~8 SVGs total.

---

## Decision 8: MP4 Rendering Strategy — Remotion + Fallback

**Pattern:** Primary = Remotion CLI (`npx remotion render`), Fallback = Canvas API captureStream() or minimal valid MP4 binary.

**When Remotion fails** (no GPU, headless environment, missing deps):
1. Generate minimal valid MP4 using hand-crafted binary atoms (`ftyp` + `moov` + `trak`)
2. The fallback MP4s are ~600 bytes with 1 black frame — browsers can play them
3. Generate browser-playable placeholder videos using `canvas.captureStream()`

**When Remotion succeeds:**
- Renders to `remotion/exports/` (NOT `out/` — `exports/` is tracked by git)
- 1920×1080, 30fps, h264 codec
- Scene1: 4s, Scene2: 8s, Scene3: 10s, Scene4: 6s, FullVideo: 28s

**Critical:** Poll until `exports/*.mp4` exists and is non-empty before embedding. Never embed placeholder paths.

---

## Decision 9: Web Speech API Narration

**Pattern:** Use `window.speechSynthesis` for zero-dependency browser narration. Structure as an array of `{text, selector, durationHint}` objects.

**Architecture:**
- `narration.js` exports the array
- Each card/section has a "🔊 Listen & Follow" button
- Plays `SpeechSynthesisUtterance`, scrolls to section, applies glow highlight
- Master "🔊 Read Walkthrough" button iterates through all steps
- `onboundary` event for word-level scroll sync
- Pause/resume/stop controls in fixed bottom-right bar
- Silent on `prefers-reduced-motion`

**Text constraint:** ≤7 words per label — the audio labels what graphics show, it doesn't explain them.

---

## Decision 10: Interactive Widgets — Vanilla Stack

**Pattern:** All interactive elements are pure HTML/CSS/JS — no React, no build step, ready to paste.

### Calculator Widget
- 3 sliders with number inputs, synced via `input` event
- Formula: `queries * wrongRate * tokensPerCorrection` → daily token waste
- Output: side-by-side naive cost vs resilient savings

### Terminal Simulator
- Two side-by-side `<div>` columns (naive vs resilient)
- `typeLine()` recursively appends characters (15-35ms delay)
- Naive: red error lines, Resilient: green success lines
- "▶️ Play Script" button triggers sequential typing

**Constraint:** `<div>` with blinking cursor, no Canvas API. All inline CSS.

---

## Decision 11: Modal Lightbox

**Pattern:** One reusable `<div id="modal-overlay">` element. Click any diagram → clone into overlay → fullscreen display.

**Implementation:**
- `position: fixed; inset: 0; background: rgba(0,0,0,.92); display: flex`
- Image: `max-width: 95vw; max-height: 95vh; object-fit: contain` — NO small previews
- Close: click overlay background or press Escape
- All `.step-img` elements get `cursor: zoom-in`
- CSS transition for fade-in

---

## Decision 12: QA Audit — Overclaim Identification

**Pattern:** After generating all files, run a self-audit before committing. Use this table structure:

| Section/File | Current Wording | Assessment | Direct Engineering Correction |
|-------------|-----------------|------------|-------------------------------|
| demo.js:42 | "ensures correct selection" | Overclaim | → "significantly increases probability" |
| README: Token table | "Input tokens reduced by 50%" | Needs caveat | ← add "(simulated, heuristic model)" |
| index.html: Calculator | "Exact cost savings" | Inaccurate | → "Estimated savings" |

**Rules:**
1. Flag any statement that requires explicit configuration or conditional context
2. Label all simulated metrics with "(simulated)" suffix
3. Include exact reproduction command for every benchmark table
4. Write findings to `QA_AUDIT.md` in the same repo

---

## Decision 13: Module File Split Strategy

**Pattern:** 6 files in `src/` with unidirectional dependency chain.

```
src/
├── domain.js          # Entities, tool definitions, test corpus, mock stores
├── infrastructure.js  # Mock I/O, error classes, latency simulation
├── subagent-naive.js  # Anti-pattern implementation
├── subagent-resilient.js # Correct implementation
├── coordinator.js     # Orchestration (calls either subagent)
└── utils.js           # Shared helpers (metrics, formatting)
```

**Dependency chain:** `domain` → `infrastructure` → `subagent-*` → `coordinator` → `demo.js`

**Rule:** Single responsibility per file. No circular imports. Each module exports exactly one main function.

---

## Decision 14: GitHub Pages Deployment

**Pattern:** Use standard GitHub Actions workflow in `.github/workflows/static.yml`.

**Workflow:** Push to `main` → checkout → configure pages → upload artifact (entire repo) → deploy.

**Critical check:** Before committing, verify:
1. `remotion/exports/` is NOT in `.gitignore` ✅
2. All MP4s exist and are non-empty ✅
3. `index.html` is at repo root ✅
4. All asset paths are relative (no absolute URLs) ✅

**Post-deploy:** Wait for GitHub Actions to complete, confirm live URL returns HTTP 200, then auto-open in browser.

---

## Decision 15: LLM Attribution

**Pattern:** Every generated project MUST identify which LLM created it in 3 places:

1. **README badge:** `🤖 Generated by: DeepSeek V4 Pro` (or actual model name)
2. **index.html header + footer:** "Built with [Model Name]"
3. **demo.js CLI banner:** Model attribution line

**Auto-detection:** If the model name isn't specified, use `DeepSeek V4 Flash` as default (since that's the model architecture executing the prompt).

---

## Summary of Reusable Patterns

| # | Pattern | When to Apply |
|---|---------|---------------|
| 1 | Kebab-case naming from root cause | Every new project |
| 2 | Duck-typed agent contracts | When proving config-over-code |
| 3 | Heuristic LLM model | When zero-dependency benchmarks needed |
| 4 | Token calculation formulas | When quantifying LLM cost savings |
| 5 | 4-color dark aesthetic | Screen recordings, projections |
| 6 | 4-scene GSAP timeline | Cinematic presentations |
| 7 | SVG fallback when Gemini unavailable | Headless/CI environments |
| 8 | Remotion + binary MP4 fallback | Environments without GPU |
| 9 | Web Speech API with onboundary | Browser-based narration |
| 10 | Vanilla HTML/CSS/JS widgets | Zero-build interactive demos |
| 11 | Single reusable lightbox | Image galleries, diagram viewing |
| 12 | QA audit with overclaim table | Before every commit |
| 13 | 6-file unidirectional src/ | Modular Node.js projects |
| 14 | Standard Pages workflow | Static site deployment |
| 15 | Triple-attribution pattern | Every generated project |

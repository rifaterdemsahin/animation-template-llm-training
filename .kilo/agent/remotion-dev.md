# Agent: Remotion Video Developer

**Agent:** `remotion-dev`

Specialized agent for Remotion video composition development. Handles scene creation, composition registration, render pipeline debugging, and MP4 output verification.

## When to use

Trigger when the user asks to:
- Create or modify Remotion scenes/compositions
- Debug Remotion render failures
- Add new compositions to the registry
- Fix `spring()`, `interpolate()`, or `Sequence` issues
- Adjust scene timing (durationInFrames, fps)
- Wire `svgData`, `audioSrc`, or `script` props into compositions
- Fix `Buffer.from()` or base64 encoding in scene files

## Project Context

### Composition Registry
All compositions are registered in `remotion/src/Root.tsx` at `remotion/src/Root.tsx:19`:
- `Scene1` — 120 frames (4s) — Title card with spring-entrance
- `Scene2` — 240 frames (8s) — Problem/naive approach fails, warning overlay
- `Scene3` — 300 frames (10s) — Solution/resilient architecture, 3-pillar grid
- `Scene4` — 180 frames (6s) — Metrics with animated counters
- `FullVideo` — 840 frames (28s) — Concatenated via `<Sequence>`

### Shared Props
All scenes accept:
```typescript
{
  svgData?: string;      // Raw SVG markup
  svgDataUri?: string;   // Pre-computed base64 data URI (preferred)
  audioSrc?: string;     // "narration.mp3" (public/ dir) or staticFile()
  script?: string;       // Narration text
}
```

### Scene-Specific Props
- Scene1: `title`, `subtitle`, `description`, `badges`, `antiPattern`, `solutionName`
- Scene2: `title`, `description`, `badges`, `failureScenario`, `failureConsequence`, `warningMessage`
- Scene3: `title`, `description`, `pillars[]` (icon, title, description), `successMessage`
- Scene4: `title`, `metrics[]` (label, unit, target, icon), `modelName`

## Key Conventions

### Cross-platform Base64
Use the `toBase64()` helper (defined in each scene file):
```typescript
function toBase64(str: string): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(str).toString('base64');
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
```

Prefer passing `svgDataUri` pre-computed from the render scripts — avoids base64 conversion in Remotion context entirely.

### Spring API (v4.0.484)
```typescript
spring({ frame, fps, config: { damping: 12, mass: 0.5 } });
```
Used in Scene1, Scene3 pillar cards, Scene4 metric cards. Supports `damping`, `mass`, `stiffness` config.

### Interpolate API
```typescript
interpolate(frame, [inMin, inMax], [outMin, outMax]);
```
Used for opacity transitions and animated counters. Always check frame range boundaries.

## Render Scripts

| Script | Path | Purpose |
|--------|------|---------|
| `render-all.mjs` | `remotion/render-all.mjs` | Standalone: renders all 5 compositions from existing assets |
| `generate-assets.mjs` | `remotion/generate-assets.mjs` | Generates SVG + narration + MP3 via Flask/Gemini |
| `generate-and-render.mjs` | `remotion/generate-and-render.mjs` | Full pipeline: generate assets + render videos |

## Debugging

### Render fails with audio error
Audio is disabled by default (`audioSrc: undefined`). To enable audio:
1. Place MP3 in `remotion/public/narration.mp3`
2. Use `staticFile('narration.mp3')` in composition
3. Or pass absolute path if serving from elsewhere

### TypeScript compile errors
```bash
cd remotion && npx tsc --noEmit
```

### Single scene test render
```bash
cd remotion && npx remotion render src/index.ts Scene1 exports/test.mp4 --overwrite
```

## Remotion Version

All packages pinned to **4.0.484**:
- `remotion: "4.0.484"`
- `@remotion/bundler: "4.0.484"`
- `@remotion/renderer: "4.0.484"`
- `@remotion/cli: "4.0.484"`

React 18.3.1, TypeScript 5.6.3.

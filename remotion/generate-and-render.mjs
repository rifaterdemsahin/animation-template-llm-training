import { spawn, execSync } from 'child_process';
import { writeFile, copyFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'generated-assets');
const promptsDir = path.join(assetsDir, 'prompts');
const exportsDir = path.join(__dirname, 'exports');
const publicDir = path.join(__dirname, 'public');
const FLASK_PORT = 5177;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await sleep(500);
  }
  throw new Error(`Server did not start within ${timeoutMs}ms`);
}

function startFlaskServer() {
  const serverPy = path.join(projectRoot, 'server.py');
  const proc = spawn('python3', [serverPy], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(FLASK_PORT) },
  });

  proc.stdout.on('data', (d) => process.stdout.write(`[flask] ${d}`));
  proc.stderr.on('data', (d) => process.stderr.write(`[flask] ${d}`));

  return proc;
}

async function generateInfographic(topic) {
  const url = `http://localhost:${FLASK_PORT}/api/generate/infographic`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, theme: 'dark', animated: true }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Infographic generation failed: ${err.error || res.statusText}`);
  }
  const data = await res.json();
  return data.svg;
}

async function generateNarration(topic) {
  const url = `http://localhost:${FLASK_PORT}/api/generate/audio`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Narration generation failed: ${err.error || res.statusText}`);
  }
  const data = await res.json();
  return data;
}

async function textToSpeech(text, outputPath) {
  const aiffPath = outputPath.replace(/\.mp3$/i, '.aiff');

  await new Promise((resolve, reject) => {
    const say = spawn('say', [text, '-o', aiffPath], { stdio: 'inherit' });
    say.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`say exited with code ${code}`))));
  });

  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-y', '-i', aiffPath, '-codec:a', 'libmp3lame', '-b:a', '64k', outputPath,
    ], { stdio: 'inherit' });
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`))));
  });

  const { rm } = await import('fs/promises');
  await rm(aiffPath).catch(() => {});
}

async function renderVideo(compositionId, inputProps) {
  const entryPoint = path.join(__dirname, 'src', 'index.ts');
  const output = path.join(exportsDir, `${compositionId.toLowerCase()}.mp4`);
  const propsJson = JSON.stringify(inputProps).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  console.log(`Rendering ${compositionId} → ${output}...`);

  execSync(
    `npx remotion render "${entryPoint}" ${compositionId} "${output}" --props='${propsJson}' --overwrite`,
    { cwd: __dirname, stdio: 'inherit', timeout: 600000 }
  );

  const s = existsSync(output) ? (await import('fs/promises')).stat(output).then(st => st.size) : 0;
  console.log(`  Done: ${output} (${s ? (s / 1024).toFixed(1) + ' KB' : 'empty'})`);
}

async function main() {
  const topic = process.argv[2] || 'CQRS and Event Sourcing in Microservices';
  console.log(`\n=== Asset Generation & Video Render Pipeline ===`);
  console.log(`Topic: "${topic}"\n`);

  await mkdir(assetsDir, { recursive: true });
  await mkdir(promptsDir, { recursive: true });
  await mkdir(exportsDir, { recursive: true });
  await mkdir(publicDir, { recursive: true });

  // 1. Start Flask server
  console.log('Starting Flask server...');
  const flaskProc = startFlaskServer();
  let stopped = false;
  const stopFlask = () => { if (!stopped) { stopped = true; flaskProc.kill('SIGTERM'); } };
  process.on('exit', stopFlask);
  process.on('SIGINT', () => { stopFlask(); process.exit(1); });
  process.on('SIGTERM', () => { stopFlask(); process.exit(1); });

  let svgData, svgDataUri, narrationScript;

  try {
    await waitForServer(`http://localhost:${FLASK_PORT}/api/health`);
    console.log('Flask server ready.\n');

    // 2. Generate SVG infographic
    console.log('[1/4] Generating infographic SVG via Gemini...');
    svgData = await generateInfographic(topic);
    svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svgData).toString('base64')}`;
    const svgPath = path.join(assetsDir, 'infographic.svg');
    await writeFile(svgPath, svgData, 'utf-8');
    console.log(`  Saved: ${svgPath}\n`);

    // 3. Generate narration script
    console.log('[2/4] Generating narration script via Gemini...');
    const narration = await generateNarration(topic);
    narrationScript = narration.script;
    const scriptPath = path.join(assetsDir, 'narration.txt');
    await writeFile(scriptPath, narrationScript, 'utf-8');
    console.log(`  Saved: ${scriptPath}\n`);

    // 4. Convert narration to speech
    console.log('[3/4] Converting narration to speech...');
    const audioOutputPath = path.join(assetsDir, 'narration.mp3');
    await textToSpeech(narrationScript, audioOutputPath);
    console.log(`  Saved: ${audioOutputPath} (${narration.duration}s estimated)\n`);

    // 5. Render videos with generated assets (audio disabled — use staticFile() for audio)
    const inputProps = {
      svgData,
      svgDataUri,
      audioSrc: undefined,
      script: narrationScript,
    };

    console.log('[4/4] Rendering Remotion videos with generated assets...');
    await renderVideo('Scene1', inputProps);
    await renderVideo('Scene2', inputProps);
    await renderVideo('Scene3', inputProps);
    await renderVideo('Scene4', inputProps);
    await renderVideo('FullVideo', inputProps);

    // 6. Save prompt record
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const promptRecord = `# Asset Generation & Render Record

**Date:** ${new Date().toISOString()}
**Topic:** ${topic}
**Pipeline:**
1. Gemini API → SVG infographic (infographic.svg)
2. Gemini API → Narration script (narration.txt)
3. macOS say + ffmpeg → MP3 audio (narration.mp3)
4. Remotion render → MP4 videos (scene1-4.mp4, full-video.mp4)

**Generated Video Outputs:**
- scene1.mp4 — Title / Setup card
- scene2.mp4 — Problem / Naive approach failure
- scene3.mp4 — Solution / Resilient architecture
- scene4.mp4 — Metrics / Results
- full-video.mp4 — All scenes concatenated
`;
    const promptPath = path.join(promptsDir, `full-pipeline-${timestamp}.md`);
    await writeFile(promptPath, promptRecord, 'utf-8');
    console.log(`\nPrompt record saved: ${promptPath}`);

    console.log('\n=== Full pipeline completed successfully ===');
  } finally {
    stopFlask();
  }
}

main().catch((err) => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});

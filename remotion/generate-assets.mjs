import { spawn } from 'child_process';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'generated-assets');
const promptsDir = path.join(assetsDir, 'prompts');
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

async function main() {
  const topic = process.argv[2] || 'CQRS and Event Sourcing in Microservices';
  console.log(`Generating assets for topic: "${topic}"`);

  await mkdir(assetsDir, { recursive: true });
  await mkdir(promptsDir, { recursive: true });

  console.log('Starting Flask server...');
  const flaskProc = startFlaskServer();
  let stopped = false;
  const stopFlask = () => { if (!stopped) { stopped = true; flaskProc.kill('SIGTERM'); } };
  process.on('exit', stopFlask);
  process.on('SIGINT', () => { stopFlask(); process.exit(1); });
  process.on('SIGTERM', () => { stopFlask(); process.exit(1); });

  try {
    await waitForServer(`http://localhost:${FLASK_PORT}/api/health`);
    console.log('Flask server ready.');

    // --- Generate SVG infographic ---
    console.log('Generating infographic SVG...');
    const svg = await generateInfographic(topic);
    const svgPath = path.join(assetsDir, 'infographic.svg');
    await writeFile(svgPath, svg, 'utf-8');
    console.log(`  SVG saved: ${svgPath}`);

    // --- Generate narration script ---
    console.log('Generating narration script...');
    const narration = await generateNarration(topic);
    const scriptPath = path.join(assetsDir, 'narration.txt');
    await writeFile(scriptPath, narration.script, 'utf-8');
    console.log(`  Script saved: ${scriptPath}`);

    // --- Convert to speech ---
    console.log('Converting narration to speech (say) → MP3...');
    const audioPath = path.join(assetsDir, 'narration.mp3');
    await textToSpeech(narration.script, audioPath);
    console.log(`  Audio saved: ${audioPath} (${narration.duration}s estimated)`);

    // --- Save prompt record ---
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const promptRecord = `# Asset Generation Record

**Date:** ${new Date().toISOString()}
**Topic:** ${topic}
**Generated:**
- SVG infographic (infographic.svg)
- Narration script (narration.txt)
- Narration audio (narration.mp3)

**Source:** Generative pipeline via server.py → Gemini API → say TTS + ffmpeg
`;
    const promptPath = path.join(promptsDir, `generation-${timestamp}.md`);
    await writeFile(promptPath, promptRecord, 'utf-8');
    console.log(`  Prompt record saved: ${promptPath}`);

    console.log('\nAll assets generated successfully.');
  } finally {
    stopFlask();
  }
}

main().catch((err) => {
  console.error('Asset generation failed:', err);
  process.exit(1);
});

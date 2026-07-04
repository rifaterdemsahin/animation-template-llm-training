import { execSync } from 'child_process';
import { readFile, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'generated-assets');
const exportsDir = path.join(__dirname, 'exports');
const publicDir = path.join(__dirname, 'public');

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function getFileSize(filePath) {
  try {
    const s = await stat(filePath);
    return s.size;
  } catch {
    return 0;
  }
}

async function renderComposition(compositionId, inputProps, outputFile) {
  const entryPoint = path.join(__dirname, 'src', 'index.ts');
  const propsJson = JSON.stringify(inputProps);

  console.log(`  Rendering ${compositionId}...`);

  try {
    execSync(
      `npx remotion render "${entryPoint}" ${compositionId} "${outputFile}" --props='${propsJson}' --overwrite`,
      { cwd: __dirname, stdio: 'pipe', timeout: 600000 }
    );
  } catch (err) {
    console.error(`  Failed to render ${compositionId}: ${err.message}`);
    return false;
  }

  const size = await getFileSize(outputFile);
  return size > 0;
}

async function main() {
  const topic = process.argv[2];
  console.log(`\n=== Remotion Video Render ===`);
  if (topic) console.log(`Topic: "${topic}"\n`);
  else console.log();

  await mkdir(exportsDir, { recursive: true });
  await mkdir(publicDir, { recursive: true });

  let svgData = null;
  let svgDataUri = null;
  let scriptText = null;

  const svgFile = path.join(assetsDir, 'infographic.svg');
  if (existsSync(svgFile)) {
    svgData = await readFile(svgFile, 'utf-8');
    svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svgData).toString('base64')}`;
    console.log('Found infographic.svg (pre-computed data URI)');
  }

  const narrationFile = path.join(assetsDir, 'narration.txt');
  if (existsSync(narrationFile)) {
    scriptText = await readFile(narrationFile, 'utf-8');
    console.log('Found narration.txt');
  }

  const inputProps = {
    svgData: svgData || undefined,
    svgDataUri: svgDataUri || undefined,
    audioSrc: undefined,
    script: scriptText || undefined,
  };

  const compositions = [
    { id: 'Scene1', file: 'scene1.mp4', label: 'Scene1 — Title/Setup' },
    { id: 'Scene2', file: 'scene2.mp4', label: 'Scene2 — Problem/Naive' },
    { id: 'Scene3', file: 'scene3.mp4', label: 'Scene3 — Solution/Resilient' },
    { id: 'Scene4', file: 'scene4.mp4', label: 'Scene4 — Metrics' },
    { id: 'FullVideo', file: 'full-video.mp4', label: 'FullVideo — Combined' },
  ];

  console.log('\n[Render] Starting video renders...\n');

  const results = [];

  for (const comp of compositions) {
    const outputFile = path.join(exportsDir, comp.file);
    const success = await renderComposition(comp.id, inputProps, outputFile);
    const size = await getFileSize(outputFile);

    let status = 'Failed';
    if (success && size > 0) status = 'Rendered';

    results.push({
      composition: comp.id,
      label: comp.label,
      file: comp.file,
      size,
      status,
    });

    console.log(`  Done: ${comp.id} → exports/${comp.file} (${formatSize(size)}) [${status}]`);
  }

  console.log('\n=== Render Summary ===');
  console.log('Composition      File                  Size       Status');
  console.log('─────────────────────────────────────────────────────────');

  let totalSize = 0;
  let successCount = 0;

  for (const r of results) {
    const idPad = r.composition.padEnd(16);
    const filePad = r.file.padEnd(22);
    const sizePad = formatSize(r.size).padStart(10);
    const icon = r.status === 'Rendered' ? 'Done' : 'Failed';
    console.log(`${idPad}${filePad}${sizePad}  ${icon}`);
    totalSize += r.size;
    if (r.status === 'Rendered') successCount++;
  }

  console.log('─────────────────────────────────────────────────────────');
  console.log(`Total: ${successCount}/${results.length} rendered (${formatSize(totalSize)})`);

  if (successCount < results.length) {
    console.error('\nSome renders failed. Check Remotion logs above for details.');
    process.exit(1);
  }

  console.log('\nAll videos rendered successfully to remotion/exports/');
}

main().catch((err) => {
  console.error('Render failed:', err);
  process.exit(1);
});

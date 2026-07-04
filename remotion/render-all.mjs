import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'out');
const entryPoint = path.join(__dirname, 'src', 'index.ts');

fs.mkdirSync(outDir, { recursive: true });

console.log('Bundling project...');
const serveUrl = await bundle({ entryPoint });

const compositions = ['Scene1', 'Scene2', 'Scene3', 'Scene4', 'FullVideo'];

for (const id of compositions) {
  console.log(`Rendering ${id}...`);
  const composition = await selectComposition({ serveUrl, id, inputProps: {} });
  const outputLocation = path.join(outDir, `${id.toLowerCase()}.mp4`);

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    inputProps: {},
  });

  console.log(`  Done: ${outputLocation}`);
}

console.log('\nAll renders complete!');

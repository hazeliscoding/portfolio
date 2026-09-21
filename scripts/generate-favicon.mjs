// Generates the KAIRO favicon set: a right-pointing terminal caret in
// signal red on graphite — no frame, no gradient — drawn as 16x16 pixel art
// (five overlapping 3x3 blocks) and scaled up losslessly
// (shape-rendering: crispEdges). It reads as terminal pixel art rather than
// an anonymous coloured square, and stays legible at 16px in a way the full
// wordmark cannot.
//
// Outputs: favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png,
// android-chrome-192x192.png, android-chrome-512x512.png, favicon.ico
// (ICO wraps 16/32/48 PNG entries). Run: node scripts/generate-favicon.mjs
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// A right-pointing caret — signal red on the KAIRO canvas surface, built
// from five overlapping 3x3 blocks so the steps join without gaps.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <rect width="16" height="16" fill="#0b0e12" shape-rendering="crispEdges"/>
  <rect x="4" y="3" width="3" height="3" fill="#e8382c" shape-rendering="crispEdges"/>
  <rect x="6" y="5" width="3" height="3" fill="#e8382c" shape-rendering="crispEdges"/>
  <rect x="8" y="7" width="3" height="3" fill="#e8382c" shape-rendering="crispEdges"/>
  <rect x="6" y="9" width="3" height="3" fill="#e8382c" shape-rendering="crispEdges"/>
  <rect x="4" y="11" width="3" height="3" fill="#e8382c" shape-rendering="crispEdges"/>
</svg>`;

const render = (size) =>
  sharp(Buffer.from(svg)).resize(size, size, { kernel: 'nearest' }).png().toBuffer();

const outputs = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
};

for (const [name, size] of Object.entries(outputs)) {
  await writeFile(join(publicDir, name), await render(size));
  console.log(`wrote ${name} (${size}x${size})`);
}

// ICO container with PNG-compressed entries (supported since Windows Vista).
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map(render));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(pngs.length, 4);

const entries = [];
let offset = 6 + 16 * pngs.length;
pngs.forEach((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(icoSizes[i] === 256 ? 0 : icoSizes[i], 0); // width
  e.writeUInt8(icoSizes[i] === 256 ? 0 : icoSizes[i], 1); // height
  e.writeUInt8(0, 2); // palette colors
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  entries.push(e);
});

await writeFile(join(publicDir, 'favicon.ico'), Buffer.concat([header, ...entries, ...pngs]));
console.log('wrote favicon.ico (16+32+48)');

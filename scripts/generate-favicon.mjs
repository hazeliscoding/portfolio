// Generates the favicon set: the site's "H" monogram, the stand-in for a photo
// on the About, Projects and Home pages, in the accent purple on its lavender
// gradient. The H is drawn as shapes rather than set in Bricolage Grotesque,
// because sharp can't load webfonts (see scripts/check-og-image.mjs); its two
// stems and bar are the heavy weight's proportions, and they hold at 16 px.
// One path, not three rectangles, so no antialiased seam shows where they meet.
//
// Outputs: favicon.svg, favicon-16x16.png, favicon-32x32.png,
// apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png
// and favicon.ico (16, 32 and 48 px PNG entries). Run: node scripts/generate-favicon.mjs
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// The avatar's 150deg gradient (#efe7ff, #d9ccff, #f6d6e8) and --h-purple.
// `radius` rounds the tile; iOS rounds the touch icon itself, so it is square.
const icon = (radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0.25" y1="0.07" x2="0.75" y2="0.93">
      <stop offset="0" stop-color="#efe7ff"/>
      <stop offset="0.55" stop-color="#d9ccff"/>
      <stop offset="1" stop-color="#f6d6e8"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="${radius}" fill="url(#g)"/>
  <path fill="#6651cf" d="M15 14h11v13.5h12V14h11v36H38V36.5H26V50H15z"/>
</svg>`;

const rounded = icon(14);
const square = icon(0);

// Drawn at 512 px and scaled down, so every size is antialiased from one shape.
const render = (svg, size) =>
  sharp(Buffer.from(svg), { density: 72 * 8 }).resize(size, size).png().toBuffer();

await writeFile(join(publicDir, 'favicon.svg'), rounded);
console.log('wrote favicon.svg');

const outputs = {
  'favicon-16x16.png': [rounded, 16],
  'favicon-32x32.png': [rounded, 32],
  'apple-touch-icon.png': [square, 180],
  'android-chrome-192x192.png': [rounded, 192],
  'android-chrome-512x512.png': [rounded, 512],
};

for (const [name, [svg, size]] of Object.entries(outputs)) {
  await writeFile(join(publicDir, name), await render(svg, size));
  console.log(`wrote ${name} (${size}x${size})`);
}

// ICO container with PNG-compressed entries (supported since Windows Vista).
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map((size) => render(rounded, size)));
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

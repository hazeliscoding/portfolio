// Verifies the committed social card. It does NOT generate one — see below.
//
// This replaced a generator that rasterised public/og-image.svg with sharp.
// That generator shipped a card in the wrong typeface for months: sharp's
// rasteriser has no access to the site's Google webfonts, so "Saira Condensed"
// and "IBM Plex Mono" silently fell back to a generic face. Proven by rendering
// the same text three ways through sharp — as Saira Condensed, as IBM Plex
// Mono, and as a font name that cannot exist — and hashing the output:
//
//   Saira Condensed : 6fcf98422079989f
//   bogus fallback  : 6fcf98422079989f
//   IBM Plex Mono   : 6fcf98422079989f
//
// Byte-identical. The SVG asked for the right fonts and nothing resolved them,
// and the result still looked plausibly on-brand because the colours and layout
// were right. Nothing failed; it just quietly used the wrong font.
//
// The card is now scripts/og-card.html, rendered by a real browser, which loads
// the same webfonts the site does. Regeneration instructions are in that file.
//
// Run: npm run check:og
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const png = path.join(root, 'public', 'og-image.png');
const source = path.join(root, 'scripts', 'og-card.html');

const EXPECTED_WIDTH = 1200;
const EXPECTED_HEIGHT = 630;

const fail = (message) => {
  console.error(`check:og FAILED — ${message}`);
  console.error('');
  console.error('To regenerate: open scripts/og-card.html in a browser at');
  console.error('1200x630, screenshot at 1x, save over public/og-image.png.');
  process.exit(1);
};

if (!(await fs.access(source).then(() => true, () => false))) {
  fail('scripts/og-card.html is missing — that file IS the card');
}

const buf = await fs.readFile(png).catch(() => null);
if (!buf) fail('public/og-image.png is missing');

// PNG signature, then the IHDR chunk carries the dimensions as big-endian
// uint32s at byte 16 and 20. Read them directly rather than adding an image
// library for eight bytes.
const signature = buf.subarray(0, 8).toString('hex');
if (signature !== '89504e470d0a1a0a') fail('public/og-image.png is not a PNG');

const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);

if (width !== EXPECTED_WIDTH || height !== EXPECTED_HEIGHT) {
  fail(
    `public/og-image.png is ${width}x${height}, expected ` +
      `${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}. A screenshot taken at a device ` +
      'pixel ratio above 1 lands at exactly double this — re-take it at 1x.',
  );
}

console.log(`check:og OK — public/og-image.png is ${width}x${height}`);

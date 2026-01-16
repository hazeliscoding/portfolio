import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const svgPath = path.join(projectRoot, 'public', 'og-image.svg');
const outPath = path.join(projectRoot, 'public', 'og-image.png');

const svg = await fs.readFile(svgPath);

// Ensure deterministic output sizing for OG previews.
const image = sharp(svg, {
  density: 144,
});

await image
  .resize(1200, 630, { fit: 'cover' })
  .png({
    compressionLevel: 9,
    adaptiveFiltering: true,
  })
  .toFile(outPath);

console.log(`Generated ${outPath}`);

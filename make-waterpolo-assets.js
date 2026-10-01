// Builds web-sized derivatives for the water polo senior night gallery.
// Follows the conventions in make-gallery-assets.js (sharp, progressive mozjpeg)
// and watermarked/compress.js.
//
// Two tiers, because a purchasable gallery has two jobs:
//   grid/ 600px  -> the responsive photo grid (page weight)
//   full/ 1600px -> the lightbox, loaded only when a photo is opened

const fs = require('fs');
const path = require('path');
const sharp = require('./watermarked/node_modules/sharp');

const ROOT = __dirname;
const SRC_DIR = path.join(ROOT, 'waterpolo pics');
const GRID_DIR = path.join(ROOT, 'waterpolo', 'grid');
const FULL_DIR = path.join(ROOT, 'waterpolo', 'full');
const MANIFEST = path.join(ROOT, 'waterpolo-manifest.json');

const GRID_W = 600;   // responsive grid cells
const FULL_W = 1600;  // lightbox, matches the graduation gallery resolution

if (!fs.existsSync(SRC_DIR)) {
  console.error(`Source folder not found: ${SRC_DIR}`);
  process.exit(1);
}

[GRID_DIR, FULL_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const files = fs.readdirSync(SRC_DIR)
  .filter(f => /\.(jpg|jpeg)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (files.length === 0) {
  console.log('No JPG files found in the water polo folder!');
  process.exit(1);
}

(async () => {
  const manifest = [];
  let totalIn = 0;
  let totalOut = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const input = path.join(SRC_DIR, file);
      const inSize = fs.statSync(input).size;
      totalIn += inSize;

      const meta = await sharp(input, { failOn: 'none' }).metadata();

      // EXIF orientation decides the true visual ratio.
      const swap = meta.orientation && meta.orientation >= 5;
      const w = swap ? meta.height : meta.width;
      const h = swap ? meta.width : meta.height;

      const gridOut = path.join(GRID_DIR, file);
      const fullOut = path.join(FULL_DIR, file);

      await sharp(input, { failOn: 'none' })
        .rotate()
        .resize({ width: GRID_W, withoutEnlargement: true })
        .jpeg({ quality: 72, progressive: true, mozjpeg: true })
        .toFile(gridOut);

      await sharp(input, { failOn: 'none' })
        .rotate()
        .resize({ width: FULL_W, withoutEnlargement: true })
        .jpeg({ quality: 78, progressive: true, mozjpeg: true })
        .toFile(fullOut);

      const gMeta = await sharp(gridOut).metadata();
      const fMeta = await sharp(fullOut).metadata();
      const outSize = fs.statSync(gridOut).size + fs.statSync(fullOut).size;
      totalOut += outSize;

      manifest.push({
        file,
        w, h,
        gw: gMeta.width, gh: gMeta.height,
        fw: fMeta.width, fh: fMeta.height,
        ratio: +(w / h).toFixed(4),
        inKB: Math.round(inSize / 1024),
        gridKB: Math.round(fs.statSync(gridOut).size / 1024),
        fullKB: Math.round(fs.statSync(fullOut).size / 1024)
      });

      const saved = Math.round((1 - outSize / inSize) * 100);
      console.log(
        `  ${file.padEnd(30)} ${String(w).padStart(4)}x${String(h).padEnd(4)} ` +
        `grid ${String(gMeta.width).padStart(4)}x${String(gMeta.height).padEnd(4)} ` +
        `${String(Math.round(inSize / 1024)).padStart(7)}KB -> ` +
        `${String(Math.round(fs.statSync(gridOut).size / 1024)).padStart(4)}KB + ` +
        `${String(Math.round(fs.statSync(fullOut).size / 1024)).padStart(4)}KB (${saved}% smaller)`
      );
    } catch (err) {
      failed++;
      console.log(`  FAILED: ${file} - ${err.message}`);
    }
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

  const gridTotal = manifest.reduce((s, m) => s + m.gridKB, 0);
  console.log(`\n${manifest.length} photos processed, ${failed} failed.`);
  console.log(`Total: ${(totalIn / 1e6).toFixed(1)}MB -> ${(totalOut / 1e6).toFixed(1)}MB (${Math.round((1 - totalOut / totalIn) * 100)}% smaller)`);
  console.log(`Grid tier: ${(gridTotal / 1024).toFixed(2)}MB across ${manifest.length} photos`);
  console.log('Manifest: waterpolo-manifest.json');
})();
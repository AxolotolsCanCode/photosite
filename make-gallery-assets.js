// Builds web-sized derivatives for the Selected work contact sheet.
// Follows the conventions in watermarked/compress.js (sharp, progressive JPEG).
// The hero (DSC_2584-Edit.jpg) is deliberately excluded: it is the LCP image
// and must stay full-resolution.

const fs = require('fs');
const path = require('path');
const sharp = require('./watermarked/node_modules/sharp');

const ROOT = __dirname;
const SM_DIR = path.join(ROOT, 'thumbs', 'sm');
const THUMB_DIR = path.join(ROOT, 'thumbs');
const FULL_DIR = path.join(ROOT, 'full');
const MANIFEST = path.join(ROOT, 'gallery-manifest.json');

const HERO = 'DSC_2584-Edit.jpg';
const SM_W = 520;     // ~2x for the smallest grid cells
const THUMB_W = 900;   // ~2x for the largest grid cells
const FULL_W = 1800;   // full-screen viewer

[SM_DIR, THUMB_DIR, FULL_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const files = fs.readdirSync(ROOT)
  .filter(f => /\.(jpg|jpeg)$/i.test(f))
  .filter(f => f !== HERO)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

(async () => {
  const manifest = [];
  let totalIn = 0;
  let totalOut = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const input = path.join(ROOT, file);
      const inSize = fs.statSync(input).size;
      totalIn += inSize;

      const img = sharp(input, { failOn: 'none' });
      const meta = await img.metadata();

      // EXIF orientation decides the true visual ratio.
      const swap = meta.orientation && meta.orientation >= 5;
      const w = swap ? meta.height : meta.width;
      const h = swap ? meta.width : meta.height;

      const smOut = path.join(SM_DIR, file);
      const thumbOut = path.join(THUMB_DIR, file);
      const fullOut = path.join(FULL_DIR, file);

      await sharp(input, { failOn: 'none' })
        .rotate()
        .resize({ width: SM_W, withoutEnlargement: true })
        .jpeg({ quality: 72, progressive: true, mozjpeg: true })
        .toFile(smOut);

      await sharp(input, { failOn: 'none' })
        .rotate()
        .resize({ width: THUMB_W, withoutEnlargement: true })
        .jpeg({ quality: 72, progressive: true, mozjpeg: true })
        .toFile(thumbOut);

      await sharp(input, { failOn: 'none' })
        .rotate()
        .resize({ width: FULL_W, withoutEnlargement: true })
        .jpeg({ quality: 78, progressive: true, mozjpeg: true })
        .toFile(fullOut);

      const tMeta = await sharp(thumbOut).metadata();
      const outSize = fs.statSync(smOut).size + fs.statSync(thumbOut).size + fs.statSync(fullOut).size;
      totalOut += outSize;

      manifest.push({
        file,
        w, h,
        sw: SM_W, sh: Math.round(SM_W * h / w),
        tw: tMeta.width, th: tMeta.height,
        ratio: +(w / h).toFixed(4),
        inKB: Math.round(inSize / 1024),
        outKB: Math.round(outSize / 1024)
      });

      const saved = Math.round((1 - outSize / inSize) * 100);
      console.log(
        `  ${file.padEnd(34)} ${String(w).padStart(4)}x${String(h).padEnd(4)} ` +
        `thumb ${String(tMeta.width).padStart(4)}x${String(tMeta.height).padEnd(4)} ` +
        `${String(Math.round(inSize / 1024)).padStart(6)}KB -> ${String(Math.round(outSize / 1024)).padStart(5)}KB (${saved}% smaller)`
      );
    } catch (err) {
      failed++;
      console.log(`  FAILED: ${file} - ${err.message}`);
    }
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

  console.log(`\n${manifest.length} photos processed, ${failed} failed.`);
  console.log(`Total: ${(totalIn / 1e6).toFixed(1)}MB -> ${(totalOut / 1e6).toFixed(1)}MB`);
  console.log('Manifest: gallery-manifest.json');
})();

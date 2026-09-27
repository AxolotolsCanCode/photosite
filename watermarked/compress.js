const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Auto-install sharp if missing
try {
  require('sharp');
} catch(e) {
  console.log('Installing sharp...');
  execSync('npm install sharp', { stdio: 'inherit' });
  console.log('Sharp installed!\n');
}

const sharp = require('sharp');

const INPUT_DIR = './';
const OUTPUT_DIR = './compressed';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const files = fs.readdirSync(INPUT_DIR).filter(f => /\.(jpg|jpeg)$/i.test(f));
const total = files.length;

if (total === 0) {
  console.log('No JPG files found in this folder!');
  process.exit(1);
}

console.log(`\nFound ${total} photos. Starting compression...\n`);

let done = 0;
let failed = 0;

function printProgress() {
  const pct = Math.round((done / total) * 100);
  const filled = Math.round(pct / 2);
  const bar = '█'.repeat(filled) + '░'.repeat(50 - filled);
  process.stdout.write(`\r[${bar}] ${pct}% (${done}/${total})`);
}

printProgress();

// Process one at a time so progress is clear
(async () => {
  for (const file of files) {
    try {
      const inputPath = path.join(INPUT_DIR, file);
      const outputPath = path.join(OUTPUT_DIR, file);
      
      const inputSize = fs.statSync(inputPath).size;
      
      await sharp(inputPath)
        .resize({ width: 1600, withoutEnlargement: true })
        .jpeg({ quality: 75, progressive: true })
        .toFile(outputPath);
      
      const outputSize = fs.statSync(outputPath).size;
      const saved = Math.round((1 - outputSize / inputSize) * 100);
      
      done++;
      printProgress();
      process.stdout.write(`  ${file} (${saved}% smaller)\n`);
      printProgress();
    } catch (err) {
      failed++;
      done++;
      printProgress();
      process.stdout.write(`  FAILED: ${file} — ${err.message}\n`);
      printProgress();
    }
  }

  const totalIn  = files.reduce((s, f) => s + fs.statSync(path.join(INPUT_DIR, f)).size, 0);
  const totalOut = fs.readdirSync(OUTPUT_DIR)
    .filter(f => /\.(jpg|jpeg)$/i.test(f))
    .reduce((s, f) => s + fs.statSync(path.join(OUTPUT_DIR, f)).size, 0);

  console.log(`\n\n✅ Done! ${done - failed}/${total} compressed, ${failed} failed.`);
  console.log(`📦 Total size: ${(totalIn/1e6).toFixed(0)}MB → ${(totalOut/1e6).toFixed(0)}MB (saved ${Math.round((1 - totalOut/totalIn)*100)}%)`);
  console.log(`📁 Files saved to: ./compressed`);
})();
// Emits the Selected work contact-sheet markup from gallery-manifest.json.
// Kept as a script so the 35 frames always carry correct intrinsic
// width/height (no layout shift) and matching srcset/sizes.

const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'gallery-manifest.json'), 'utf8')
);

const byFile = new Map(manifest.map(m => [m.file, m]));

// The six hand-picked frames that already had titles and copy, kept in front
// so the sheet still leads with the strongest work. Everything else follows
// in filename order. Subjects for the rest are unknown, so no caption or
// description is invented for them.
const LEAD = [
  { file: 'DSC_2452.jpg',              title: 'Six months',   cat: 'Portrait · Roseville',      alt: 'Baby at six months · portrait session' },
  { file: 'Z62_0078-Enhanced-NR.jpg',  title: 'Basketball',   cat: 'Sports · Sacramento',       alt: 'Basketball action · sports photography' },
  { file: 'IMG_3874-Enhanced.png.jpg', title: 'Fireworks',    cat: 'Events',                    alt: 'Fireworks · event photography' },
  { file: 'IMG_6940-Enhanced-NR.jpg',  title: 'Car session',  cat: 'Automotive · Sacramento',   alt: 'Car session · automotive photography' },
  { file: 'DSC_1522-Enhanced-NR.jpg',  title: 'Space Needle', cat: 'Landscape · Sacramento',    alt: 'Skyline · landscape photography' },
  { file: 'DSC_4057.jpg',              title: 'Flamingo',     cat: 'Wildlife',                  alt: 'Flamingo · wildlife photography' }
];

const leadFiles = new Set(LEAD.map(l => l.file));
const meta = new Map(LEAD.map(l => [l.file, l]));

const ordered = [
  ...LEAD.map(l => l.file),
  ...manifest.map(m => m.file).filter(f => !leadFiles.has(f))
];

const SIZES = '(max-width:560px) 47vw, (max-width:900px) 32vw, (max-width:1020px) 24vw, 20vw';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const frames = ordered.map((file, i) => {
  const m = byFile.get(file);
  if (!m) throw new Error('missing manifest entry: ' + file);
  const k = meta.get(file);
  const n = String(i + 1).padStart(2, '0');

  const dataAttrs = [
    `class="frame"`,
    `type="button"`,
    `data-full="full/${esc(file)}"`,
    k ? `data-title="${esc(k.title)}"` : '',
    k ? `data-cat="${esc(k.cat)}"` : '',
    `aria-label="Open photo ${n} of ${ordered.length} full screen"`
  ].filter(Boolean).join(' ');

  const alt = k ? k.alt : 'Photograph by Cameron Schindler';

  return `        <button ${dataAttrs}>
          <img src="thumbs/${esc(file)}" srcset="thumbs/sm/${esc(file)} 520w, thumbs/${esc(file)} 900w" sizes="${SIZES}" alt="${esc(alt)}" loading="lazy" decoding="async" width="${m.tw}" height="${m.th}">
          <span class="no" aria-hidden="true">${n}</span>
        </button>`;
});

const html = `    <section id="work">
      <div class="kicker-row">
        <h2>Selected&nbsp;work<span class="dot">.</span></h2>
        <span class="caps">Portrait · landscape · sports · wildlife · automotive · events</span>
      </div>
      <p class="sheet-note">${ordered.length} frames from recent sessions. Select any one to open it full screen.</p>
      <div class="sheet">
${frames.join('\n')}
      </div>
    </section>`;

fs.writeFileSync(path.join(__dirname, '_work-section.html'), html + '\n', 'utf8');

// Splice the generated block into index.html, replacing whatever currently sits
// between <section id="work"> and its closing </section>. Idempotent: the
// generated block's own </section> is the first one found on a re-run.
const INDEX = path.join(__dirname, 'index.html');
const src = fs.readFileSync(INDEX, 'utf8');
const open = src.indexOf('<section id="work">');
if (open === -1) throw new Error('could not find <section id="work"> in index.html');
const close = src.indexOf('</section>', open);
if (close === -1) throw new Error('could not find the closing </section> for #work');
fs.writeFileSync(INDEX, src.slice(0, open) + html + '\n' + src.slice(close + '</section>'.length), 'utf8');

const portrait = ordered.filter(f => byFile.get(f).ratio < 1).length;
console.log(`${ordered.length} frames written to _work-section.html and spliced into index.html`);
console.log(`  ${portrait} portrait (2:3), ${ordered.length - portrait} landscape (3:2, centre-cropped in the grid)`);
console.log('  lightbox titles: ' + LEAD.length + ' of ' + ordered.length + ' (the rest have no known subject)');

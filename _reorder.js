// Reorder within the gallery sheet ONLY.
//
// Last time this operation destroyed the page because the sheet's end was
// located with lastIndexOf('</button>') against the whole document. Here the
// end is the first '</div>' after the sheet opens, which is correct because the
// sheet contains only <button> and <img> children - no nested divs. That is
// asserted below rather than assumed.
//
// Safety: the multiset of data-full values is compared before and after, so any
// frame lost or duplicated by the move throws instead of silently shipping.

const fs = require('fs');
const FILE = 'index.html';

let s = fs.readFileSync(FILE, 'utf8');

const OPEN = '<div class="sheet">';
const sheetStart = s.indexOf(OPEN);
if (sheetStart < 0) throw new Error('sheet open tag not found');
const sheetEnd = s.indexOf('</div>', sheetStart);
if (sheetEnd < 0) throw new Error('sheet close tag not found');

const sheet = s.slice(sheetStart, sheetEnd);

// Test the content AFTER the opening tag - the slice still contains the
// sheet's own "<div class=" which would match a naive test.
if (/<div[\s>]/.test(sheet.slice(OPEN.length))) throw new Error('sheet contains a nested div - end detection unsafe');
const frames = [...sheet.matchAll(/<button class="frame"[\s\S]*?<\/button>/g)].map(m => m[0]);
if (frames.length !== 29) throw new Error('expected 29 frames, found ' + frames.length);

const noOf = f => +(f.match(/<span class="no" aria-hidden="true">(\d+)<\/span>/) || [])[1];
const fileOf = f => (f.match(/data-full="([^"]+)"/) || [])[1];

// Current slot order must be 1..29.
frames.forEach((f, i) => {
  if (noOf(f) !== i + 1) throw new Error(`slot ${i + 1} holds frame ${noOf(f)}`);
});

const before = frames.map(fileOf).sort();
const slotOf = n => {
  const i = frames.findIndex(f => noOf(f) === n);
  if (i < 0) throw new Error('no frame numbered ' + n);
  return frames[i];
};

const f18 = slotOf(18), f12 = slotOf(12), f20 = slotOf(20);
const rest = frames.filter(f => f !== f18 && f !== f12 && f !== f20);

const order = [
  f18,                 // slot 1
  f12,                 // slot 2
  ...rest.slice(0, 4), // slots 3-6
  f20,                 // slot 7
  ...rest.slice(4),    // slots 8-29
];
if (order.length !== 29) throw new Error('reorder produced ' + order.length + ' frames');

const after = order.map(fileOf).sort();
if (before.join('|') !== after.join('|')) throw new Error('frame set changed - aborting');

const total = order.length;
const out = order.map((f, i) => {
  const n = i + 1;
  const r = f
    .replace(/(<span class="no" aria-hidden="true">)\d+(<\/span>)/, `$1${n}$2`)
    .replace(/aria-label="Open photo \d+ of \d+/, `aria-label="Open photo ${String(n).padStart(2, '0')} of ${total}`);
  if (noOf(r) !== n) throw new Error('renumber failed at slot ' + n);
  if (!new RegExp(`aria-label="Open photo ${String(n).padStart(2, '0')} of ${total}`).test(r)) {
    throw new Error('aria rewrite failed at slot ' + n);
  }
  return r;
});

s = s.slice(0, sheetStart) + OPEN + '\n' + out.join('\n') + '\n      ' + s.slice(sheetEnd);
s = s.replace(/(<span class="lb-count" id="lbCount">1 \/ )\d+(<\/span>)/, `$1${total}$2`);

fs.writeFileSync(FILE, s, 'utf8');

console.log('moved: 18 -> slot 1, 12 -> slot 2, 20 -> slot 7');
console.log('new order (first 9 slots):');
out.slice(0, 9).forEach((f, i) => console.log('  ' + (i + 1) + '. ' + fileOf(f).replace('full/', '')));
console.log('total ' + total + ', frame set unchanged, all renumbered + aria rewritten');

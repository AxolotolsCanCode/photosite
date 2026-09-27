const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');
const out = [];
const log = (...a) => out.push(a.join(' '));
const style = s.slice(s.indexOf('<style>') + 7, s.indexOf('</style>'));

const sheetStart = s.indexOf('<div class="sheet">');
const sheetEnd = s.indexOf('</div>', sheetStart);
const sheet = s.slice(sheetStart, sheetEnd);
const frames = [...sheet.matchAll(/<button class="frame"[\s\S]*?<\/button>/g)].map(m => m[0]);

log('=== sheet ===');
log('frames: ' + frames.length + '  ' + (frames.length === 29 ? 'ok' : '***'));
const nos = frames.map(f => +(f.match(/<span class="no"[^>]*>(\d+)<\/span>/) || [])[1]);
log('.no sequential 1..29 : ' + (nos.every((n, i) => n === i + 1) ? 'yes' : '*** ' + nos.join(',')));
const aria = frames.map(f => +(f.match(/aria-label="Open photo (\d+) of (\d+)/) || [])[1]);
log('aria sequential 1..29: ' + (aria.every((n, i) => n === i + 1) ? 'yes' : '*** ' + aria.join(',')));
const den = [...new Set(frames.map(f => (f.match(/aria-label="Open photo \d+ of (\d+)/) || [])[1]))];
log('aria denominator      : ' + den.join(','));
log('duplicates            : ' + (frames.length - new Set(frames.map(f => (f.match(/data-full="([^"]+)"/) || [])[1])).size));
log('curated titles kept   : ' + frames.filter(f => /data-title="[^"]+"/.test(f)).length);

log('', '=== requested moves landed ===');
const want = { 1: 'Z62_0824.jpg', 2: 'Z62_9352.jpg', 7: 'Z62_9091-Edit.jpg' };
for (const [slot, file] of Object.entries(want)) {
  const got = (frames[slot - 1].match(/data-full="([^"]+)"/) || [])[1].replace('full/', '');
  log('  slot ' + slot + ': ' + (got === file ? 'OK ' : '*** ') + got);
}

log('', '=== no collateral damage from this edit ===');
log('file lines        : ' + s.split('\n').length + '  (was 655 before the reorder)');
log('CSS braces        : ' + (style.match(/\{/g) || []).length + '/' + (style.match(/\}/g) || []).length);
for (const t of ['div', 'section', 'button', 'form', 'header', 'nav']) {
  const a = (s.match(new RegExp('<' + t + '(\\s|>)', 'g')) || []).length;
  const b = (s.match(new RegExp('</' + t + '>', 'g')) || []).length;
  log('  ' + t.padEnd(8) + a + ' / ' + b);
}
try { new Function(s.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/<\/?script>/g, '')); log('script            : parses OK'); }
catch (e) { log('script            : *** ' + e.message); }
log('sheet-note        : ' + (s.match(/<p class="sheet-note">([^<]*)/) || [])[1]);
log('U+00B7 ' + (s.match(/\u00b7/g) || []).length + '  U+FFFD ' + (s.match(/\ufffd/g) || []).length);

log('', '=== still missing from the earlier corruption (unchanged, not re-broken) ===');
for (const [l, re] of [['services', /<section id="services">/], ['pricing', /<section id="pricing">/],
  ['bookingForm', /id="bookingForm"/], ['cta-band', /class="cta-band"/], ['lightbox', /id="lb"/]]) {
  log('  ' + l.padEnd(12) + (re.test(s) ? 'present' : 'still missing'));
}

fs.writeFileSync('_rv.txt', out.join('\n'), 'utf8');
console.log('done');

// Which surviving copies contain the blocks the bad splice destroyed?
const fs = require('fs');
const out = [];
const log = (...a) => out.push(a.join(' '));

const files = fs.readdirSync('.').filter(f => /\.html?$/i.test(f) && f !== 'index.html');
const marks = [
  ['services', /<section id="services">/],
  ['cta-band', /class="cta-band"/],
  ['lb overlay', /id="lb"[^>]*class="lb"|class="lb"[^>]*id="lb"/],
  ['lbCount', /id="lbCount"/],
  ['bookingForm', /id="bookingForm"/],
  ['pricing', /<section id="pricing">/],
  ['assure list', /class="assure"/],
  ['sheet frames', /class="frame"/],
  ['frame count', /class="sheet"/],
  ['lb-arrow', /class="lb-arrow"/],
];

const hdr = ['file'.padEnd(24), ...marks.map(m => m[0].slice(0, 9).padEnd(9))].join(' ');
log(hdr);
log('-'.repeat(hdr.length));

for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const row = [f.padEnd(24)];
  for (const [, re] of marks) {
    let n = 0;
    try { n = (s.match(new RegExp(re.source, 'g')) || []).length; } catch { n = 0; }
    row.push((n > 0 ? String(n) : '-').padEnd(9));
  }
  log(row.join(' '));
}

log('');
log('current index.html:');
const cur = fs.readFileSync('index.html', 'utf8');
for (const [label, re] of marks) {
  const n = (cur.match(new RegExp(re.source, 'g')) || []).length;
  log('  ' + label.padEnd(13) + (n > 0 ? n : 'MISSING'));
}
log('  frames: ' + ([...cur.matchAll(/class="frame"/g)]).length);

fs.writeFileSync('_m.txt', out.join('\n'), 'utf8');
console.log('done');

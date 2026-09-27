const fs = require('fs');
const out = [];
const log = (...a) => out.push(a.join(' '));

const cur = fs.readFileSync('index.html', 'utf8');
const aud = fs.readFileSync('_audit.html', 'utf8');

log('=== CSS rules needing markup: cta / booking / assure / formp ===');
const style = cur.slice(cur.indexOf('<style>') + 7, cur.indexOf('</style>'));
for (const m of style.matchAll(/[^{}]*\.[^{}]*(\{|\}|\n)[^}]*\}/g)) {
  // crude: collect selectors referencing the classes we care about
  const line = m[0];
  if (/(\.cta|\.assure|\.booking|\.formp|\.form-body|\.fine\b|\.alt-line)/.test(line)) {
    log('  ' + line.split('\n')[0].trim().slice(0, 110) + ' …' + line.slice(-70).replace(/\s+/g, ' ').trim());
  }
}

log('');
log('=== booking/cta HTML in _audit.html (best surviving template) ===');
const blk = aud.slice(aud.indexOf('<section id="booking">'), aud.indexOf('</section>', aud.indexOf('<section id="booking">')) + 10);
log(blk.slice(0, 3000));
if (blk.length > 3000) log('  … (' + blk.length + ' chars total)');

log('');
log('=== does _audit.html have cta-band markup? ===');
log('  cta-band: ' + (/class="cta-band"/.test(aud) ? 'yes' : 'no'));
log('  cta-go  : ' + (/class="cta-go"/.test(aud) ? 'yes' : 'no'));

fs.writeFileSync('_c1.txt', out.join('\n'), 'utf8');
console.log('done');
// Recover the block of body that was destroyed by the bad splice.
// The committed version is the source: none of this HTML was edited this
// session, only the CSS, so HEAD's markup is byte-identical to what was lost.

const fs = require('fs');
const { execSync } = require('child_process');

const committed = execSync('git show HEAD:index.html', { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const cur = fs.readFileSync('index.html', 'utf8');

// In the committed doc the work section is the 4th section; find its close,
// then take everything from there up to the <script> tag.
const workOpen = committed.indexOf('<section id="work">');
const afterWork = committed.indexOf('</section>', workOpen) + '</section>'.length;
const scriptAt = committed.indexOf('<script>');

if (workOpen < 0 || afterWork < 10 || scriptAt < afterWork) throw new Error('markers not found in HEAD');

const block = committed.slice(afterWork, scriptAt);
fs.writeFileSync('_recovered.html', block, 'utf8');

const out = [];
const log = (...a) => out.push(a.join(' '));
log('recovered block bytes : ' + block.length);
log('recovered block lines : ' + block.split('\n').length);
log('');
log('markers present in recovered block:');
for (const [label, re] of [
  ['services section', /<section id="services">/],
  ['pricing section', /<section id="pricing">/],
  ['cta band', /class="cta-band"/],
  ['booking section', /<section id="booking">/],
  ['booking form', /id="bookingForm"/],
  ['footer', /<footer/],
  ['lightbox', /id="lb"/],
  ['lb-count', /id="lbCount"/],
  ['</body>', /<\/body>/],
]) log((re.test(block) ? '  yes  ' : '  NO   ') + label);

log('');
log('head of block:');
log(block.slice(0, 220).replace(/\n/g, '\\n'));
log('');
log('tail of block:');
log(block.slice(-260).replace(/\n/g, '\\n'));
log('');
log('current file splice anchor (end of .wrap):');
const anchor = cur.indexOf('</div>\n</div>\n\n<script>');
log('  anchor index: ' + anchor + (anchor < 0 ? '  *** NOT FOUND' : ''));
log('  chars before anchor that would be kept: ' + (anchor < 0 ? 'n/a' : cur.slice(0, anchor).length));

fs.writeFileSync('_r.txt', out.join('\n'), 'utf8');
console.log('done');

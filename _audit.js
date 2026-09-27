window.addEventListener('load', function () {
  setTimeout(function () {
    var pre = document.createElement('pre');
    pre.id = 'audit';
    pre.style.cssText = 'position:fixed;left:0;top:0;z-index:9999;background:#000;color:#0f0;font:11px monospace;white-space:pre;max-width:100%;';
    document.body.appendChild(pre);
    var out = [];
    function push(s) { out.push(s); }

    push('VIEWPORT ' + window.innerWidth + 'x' + window.innerHeight);
    push('DOC scrollW=' + document.documentElement.scrollWidth + ' scrollH=' + document.documentElement.scrollHeight);
    push('H_OVERFLOW ' + (document.documentElement.scrollWidth > window.innerWidth + 1 ? 'YES' : 'no'));
    push('IMG_ERRORS ' + Array.from(document.images).filter(function (i) { return i.complete && i.naturalWidth === 0; }).map(function (i) { return i.getAttribute('src'); }).join(','));

    push('--- HERO ---');
    var hero = document.querySelector('.hero');
    var hov = document.getElementById('heroMedia');
    var hi = document.querySelector('.hero img.photo');
    var hb = hi.getBoundingClientRect();
    var hs = hero.getBoundingClientRect();
    push('hero box=' + Math.round(hs.width) + 'x' + Math.round(hs.height) + ' ratio=' + (hs.width / hs.height).toFixed(3));
    push('hero img natural=' + hi.naturalWidth + 'x' + hi.naturalHeight + ' ratio=' + (hi.naturalWidth / hi.naturalHeight).toFixed(3));
    push('object-position=' + getComputedStyle(hi).objectPosition);
    push('hero-media --py=' + hov.style.getPropertyValue('--py') + ' gate=' + document.getElementById('heroGate').style.getPropertyValue('--gate'));
    push('hero media transform=' + getComputedStyle(hov).transform);
    push('hero img transform=' + getComputedStyle(hi).transform);
    var coverScale = Math.max(hs.width / hi.naturalWidth, hs.height / hi.naturalHeight);
    var fitScale = Math.min(hs.width / hi.naturalWidth, hs.height / hi.naturalHeight);
    push('cover scale=' + coverScale.toFixed(4) + ' fit scale=' + fitScale.toFixed(4) + ' overflow=' + ((coverScale / fitScale - 1) * 100).toFixed(1) + '%');
    var recR = document.querySelector('.rec').getBoundingClientRect();
    var ctaR = document.querySelector('.bar nav a.cta').getBoundingClientRect();
    var slateR = document.querySelector('.slate').getBoundingClientRect();
    var h1R = document.querySelector('.hero h1').getBoundingClientRect();
    function hit(a, b) { return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom); }
    push('overlaps: rec/cta=' + hit(recR, ctaR) + ' slate/h1=' + hit(slateR, h1R) + ' slate/cta=' + hit(slateR, ctaR) + ' rec/h1=' + hit(recR, h1R));
    push('slate text="' + document.getElementById('slateTC').textContent + '"');

    push('--- WORK SHOTS (crop audit) ---');
    document.querySelectorAll('.shot').forEach(function (s, i) {
      var img = s.querySelector('img');
      var r = s.getBoundingClientRect();
      var arF = r.width / r.height;
      var arI = img.naturalWidth / img.naturalHeight;
      var vis = Math.min(arF, arI) / Math.max(arF, arI) * 100;
      push('shot' + i + ' ' + img.getAttribute('src') +
           ' nat=' + img.naturalWidth + 'x' + img.naturalHeight +
           ' box=' + Math.round(r.width) + 'x' + Math.round(r.height) +
           ' CROP=' + (100 - vis).toFixed(1) + '%' +
           ' area=' + Math.round(r.width * r.height / 1000) + 'kpx' +
           ' ar=' + s.style.getPropertyValue('--ar'));
    });

    push('--- CTA AUDIT ---');
    ['.bar nav a.cta', '.hero .cta', '.cta-go', '.lb-go', '.btn', '.email-line', '.alt-line a'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) { push(sel + ' MISSING'); return; }
      var r = el.getBoundingClientRect();
      push(sel + ' "' + el.textContent.trim().replace(/\s+/g, ' ').slice(0, 42) + '" box=' + Math.round(r.width) + 'x' + Math.round(r.height) + ' visible=' + (r.width > 0 && r.height > 0));
    });

    push('--- HEADER NAV ---');
    document.querySelectorAll('.bar nav a').forEach(function (a) {
      var r = a.getBoundingClientRect();
      push('  "' + a.textContent.trim() + '" display=' + getComputedStyle(a).display + ' visible=' + (r.width > 0 && r.height > 0) + ' h=' + Math.round(r.height));
    });

    push('--- BOOKING ---');
    var fa = document.querySelector('.formp').getBoundingClientRect();
    var fb = document.querySelector('.book-info').getBoundingClientRect();
    push('form top=' + Math.round(fa.top + window.scrollY) + ' h=' + Math.round(fa.height));
    push('bookinfo top=' + Math.round(fb.top + window.scrollY) + ' h=' + Math.round(fb.height));
    ['#booking h2', '.assure', '.formp .sub', '.fine', '.alt-line'].forEach(function (s) {
      var el = document.querySelector(s);
      push(s + ' ' + (el ? 'top=' + Math.round(el.getBoundingClientRect().top + window.scrollY) + ' h=' + Math.round(el.getBoundingClientRect().height) : 'MISSING'));
    });
    var fR = fa;
    var last = document.querySelector('.alt-line').getBoundingClientRect();
    push('form bottom=' + Math.round(fR.bottom + window.scrollY) + ' lastChild bottom=' + Math.round(last.bottom + window.scrollY) + ' overflowPast=' + (last.bottom > fR.bottom + 1 ? 'YES' : 'no'));

    push('--- CONTRAST ---');
    function lum(c) {
      var m = c.match(/[\d.]+/g).map(Number);
      var f = m.slice(0, 3).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
    }
    function ratio(fg, bg) { var a = lum(fg), b = lum(bg); return ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2); }
    function bgOf(el) {
      var n = el;
      while (n && n !== document.documentElement) {
        var c = getComputedStyle(n).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
        n = n.parentElement;
      }
      return 'rgb(10, 10, 11)';
    }
    ['.work-copy p', '.assure span', '.formp .sub', '.fine', '.alt-line', '.lb-meta .c', '.lb-count', '.formp .t .caps', '.ledger-row .d', '.slate', '.slate-tc', '.hero .sub .caps'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) { push(sel + ' MISSING'); return; }
      var fg = getComputedStyle(el).color, bg = bgOf(el);
      push(sel + ' ' + fg + ' on ' + bg + ' = ' + ratio(fg, bg) + (parseFloat(ratio(fg, bg)) >= 4.5 ? ' OK' : ' FAIL'));
    });
    var ph = document.querySelector('.fd input');
    var pfg = getComputedStyle(ph, '::placeholder').color;
    push('.fd::placeholder ' + pfg + ' on ' + bgOf(ph) + ' = ' + ratio(pfg, bgOf(ph)));
    var btn = document.querySelector('.btn');
    push('.btn ' + getComputedStyle(btn).color + ' on ' + getComputedStyle(btn).backgroundColor + ' = ' + ratio(getComputedStyle(btn).color, getComputedStyle(btn).backgroundColor));

    push('--- LIGHTBOX ---');
    var lb = document.getElementById('lb');
    shot0 = document.querySelector('.shot');
    shot0.click();
    setTimeout(function () {
      var lbi = document.getElementById('lbImg');
      var r = lbi.getBoundingClientRect();
      var arB = r.width / r.height, arI2 = lbi.naturalWidth / lbi.naturalHeight;
      push('open=' + lb.classList.contains('open') + ' aria-hidden=' + lb.getAttribute('aria-hidden'));
      push('lbImg natural=' + lbi.naturalWidth + 'x' + lbi.naturalHeight + ' box=' + Math.round(r.width) + 'x' + Math.round(r.height) + ' CROP=' + ((1 - Math.min(arB, arI2) / Math.max(arB, arI2)) * 100).toFixed(1) + '% fitsViewport=' + (r.height <= window.innerHeight && r.width <= window.innerWidth));
      push('lb title="' + document.getElementById('lbTitle').textContent + '" cat="' + document.getElementById('lbCat').textContent + '" pos="' + document.getElementById('lbPos').textContent + '"');
      push('html overflow=' + document.documentElement.style.overflow + ' focus=' + document.activeElement.id);
      document.getElementById('audit').textContent = out.join('\n');
    }, 600);
  }, 1500);
});

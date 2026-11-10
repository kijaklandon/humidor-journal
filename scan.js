// ============================================================
//  Scan a cigar band
//  Take a photo of the band. The read-band server function (see
//  supabase/functions/read-band) reads the brand and line, and this
//  file matches that to the Vault so you can pick the right cigar.
// ============================================================

const SCAN_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';

// Words that say little about which cigar it is
const SCAN_SKIP = new Set(['the', 'de', 'la', 'el', 'y', 'and', 'by', 'cigar', 'cigars', 'tabacos', 'hecho', 'a', 'mano', 'handmade', 'made', 'in', 'of', 'no', 'serie', 'series']);
const scanWords = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ').split(' ').filter(w => w && !SCAN_SKIP.has(w));

// Best Vault matches for what was read on the band
function matchBand(read) {
  const brandW = scanWords(read.brand), lineW = scanWords(read.line), allW = new Set(scanWords(`${read.brand} ${read.line} ${read.text}`));
  if (!allW.size) return [];
  const has = (words, w) => words.some(x => x === w || (w.length > 3 && x.length > 3 && (x.startsWith(w) || w.startsWith(x))));
  return visibleCatalog().map(c => {
    const cb = scanWords(c.b), cn = scanWords(c.n);
    const brandHit = cb.length ? cb.filter(w => has([...allW], w)).length / cb.length : 0;
    const lineHit = cn.length ? cn.filter(w => has([...allW], w)).length / cn.length : 0;
    // Words the band says the line has but this cigar doesn't
    const extra = lineW.length ? lineW.filter(w => !has(cn, w) && !has(cb, w)).length / lineW.length : 0;
    const brandSaid = brandW.length && cb.filter(w => has(brandW, w)).length / cb.length;
    return { c, score: brandHit * 2 + (brandSaid ? 0.5 : 0) + lineHit * 3 - extra };
  }).filter(m => m.score > 1.5).sort((a, b) => b.score - a.score).slice(0, 5).map(m => m.c);
}

// Take or choose a photo, shrink it so it uploads fast
function pickBandPhoto() {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');
    input.onchange = () => resolve(input.files[0] || null);
    input.click();
  });
}
async function bandToJpeg(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = url; });
    const scale = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
    const cv = document.createElement('canvas');
    cv.width = Math.round(img.naturalWidth * scale);
    cv.height = Math.round(img.naturalHeight * scale);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/jpeg', 0.85).split(',')[1];
  } finally { URL.revokeObjectURL(url); }
}

// onPick(cigar) gets a Vault entry, or { b, n } when the band isn't in the Vault
async function scanBand(onPick) {
  let signedIn = false;
  try { signedIn = !!account; } catch {}
  if (!sb || !signedIn) return toast('Sign in to scan bands');
  const file = await pickBandPhoto();
  if (!file) return;

  const body = $('#sheet-body');
  body.onclick = null;
  body.onchange = null;
  body.innerHTML = `<div class="scan-wait"><div class="spinner"></div><p>Reading the band…</p></div>`;
  $('#sheet').classList.add('open');

  let read;
  try {
    const image = await bandToJpeg(file);
    const { data, error } = await sb.functions.invoke('read-band', { body: { image } });
    if (error) {
      let msg = '';
      try { msg = (await error.context?.json?.())?.error; } catch {}
      throw new Error(msg || "Couldn't reach the scanner. Check your connection and try again.");
    }
    read = data;
  } catch (e) {
    return showScanResult(onPick, null, e.message || "Couldn't read that photo.");
  }
  showScanResult(onPick, read);
}

function showScanResult(onPick, read, problem) {
  const body = $('#sheet-body');
  const seen = read && read.found ? [read.brand, read.line].filter(Boolean).join(' ') : '';
  const matches = seen ? matchBand(read) : [];
  body.innerHTML = `
    <h2 style="margin:0 0 4px">${matches.length ? 'Is it one of these?' : 'No match found'}</h2>
    <p class="muted" style="font-size:14px;margin:0 0 12px">${problem ? esc(problem)
      : seen ? `The band says <b>${esc(seen)}</b>.`
      : "Couldn't make out a cigar band. Get close, fill the frame with the band, and use good light."}</p>
    ${matches.map((c, i) => `
      <button type="button" class="card tap scan-pick" data-pick="${i}">
        <div class="card-title">${esc(c.n)}</div>
        <div class="card-sub">${esc(c.b)} · ${esc(c.w)} · ${esc(c.o)}</div>
      </button>`).join('')}
    ${seen ? `<button type="button" class="btn ghost" data-act="raw" style="width:100%;margin-top:4px">${matches.length ? 'None of these. ' : ''}Use "${esc(seen)}"</button>` : ''}
    <div class="btn-row">
      <button class="btn ghost" data-act="close">Cancel</button>
      <button class="btn" data-act="again">${SCAN_ICON} Scan again</button>
    </div>`;
  body.onclick = e => {
    const pick = e.target.closest('[data-pick]');
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (pick) { closeSheet(); return onPick(matches[+pick.dataset.pick]); }
    if (act === 'raw') { closeSheet(); return onPick({ b: read.brand || '', n: read.line || read.brand || '' }); }
    if (act === 'again') return scanBand(onPick);
    if (act === 'close') closeSheet();
  };
}

// A known cigar goes in by its full name so the usual autofill runs
function fillNameField(nameSel, brandSel, c) {
  const name = $(nameSel);
  if (CATALOG.includes(c)) {
    name.value = fullName(c);
    name.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    name.value = c.n;
    if (brandSel && c.b) $(brandSel).value = c.b;
  }
}

// Log form
$('#f-scan').addEventListener('click', () => scanBand(c => fillNameField('#f-name', '#f-brand', c)));
// Vault: open the cigar, or search for what the band said
$('#b-scan').addEventListener('click', () => scanBand(c => {
  if (CATALOG.includes(c)) return openCigar(fullName(c));
  $('#b-search').value = c.n;
  renderBrowse();
}));
// Smoke timer start sheet (its scan button is drawn by timer.js)
document.addEventListener('click', e => {
  if (!e.target.closest('#t-scan')) return;
  e.stopPropagation();
  scanBand(c => {
    openSmokeStart();
    fillNameField('#t-name', '#t-brand', c);
  });
}, true);

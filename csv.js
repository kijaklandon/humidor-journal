// Spreadsheet (CSV) export and import for the journal.
// Export: one row per cigar, opens in Excel, Google Sheets or Numbers.
// Import: reads a spreadsheet from anywhere (our export, the blank template, or
// someone's own tracking sheet), matches the columns by name and shows a preview first.

const CSV_COLS = [
  { k: 'date', h: 'Date', get: l => l.date || '' },
  { k: 'name', h: 'Cigar', get: l => l.name },
  { k: 'brand', h: 'Brand', get: l => l.brand || '' },
  { k: 'wrapper', h: 'Wrapper', get: l => l.wrapper || '' },
  { k: 'origin', h: 'Country', get: l => l.origin || '' },
  { k: 'strength', h: 'Strength', get: l => STRENGTHS[l.strength - 1] || '' },
  { k: 'size', h: 'Size', get: l => l.size || '' },
  { k: 'place', h: 'Where', get: l => l.place || '' },
  { k: 'rating', h: 'Rating', get: l => l.rating || '' },
  { k: 'flavors', h: 'Flavors', get: l => (l.notes || []).join('; ') },
  { k: 'enjoyed', h: 'Notes', get: l => l.enjoyed || '' },
  { k: 'pairing', h: 'Paired with', get: l => l.pairing || '' },
  { k: 'aged', h: 'Aged', get: l => fmtAged(l.aged) },
  { k: 'time', h: 'Smoke time (min)', get: l => smokeTime(l) || '' },
  { k: 'again', h: 'Smoke again', get: l => l.again ? 'Yes' : '' },
  { k: 'private', h: 'Private', get: l => l.private ? 'Yes' : '' },
];

// Other names people use for the same columns (compared without spaces or punctuation)
const CSV_ALIASES = {
  date: ['date', 'datesmoked', 'smoked', 'smokedon', 'day'],
  name: ['cigar', 'name', 'cigarname', 'line', 'blend', 'cigarline'],
  brand: ['brand', 'maker', 'manufacturer', 'company', 'brandname'],
  wrapper: ['wrapper', 'wrapperleaf', 'wrappertype', 'wrappercolor'],
  origin: ['country', 'origin', 'countryoforigin', 'madein'],
  strength: ['strength', 'body', 'strengthbody'],
  size: ['size', 'vitola', 'shape', 'sizevitola'],
  place: ['where', 'place', 'location', 'wheresmoked', 'spot'],
  rating: ['rating', 'stars', 'score', 'myrating', 'grade'],
  flavors: ['flavors', 'flavours', 'flavor', 'flavour', 'tastingnotes', 'tastes'],
  enjoyed: ['notes', 'comments', 'review', 'thoughts', 'mynotes', 'description'],
  pairing: ['pairedwith', 'pairing', 'drink', 'pairings'],
  aged: ['aged', 'aging', 'agetime', 'rested', 'humidortime'],
  time: ['smoketime', 'smoketimemin', 'smoketimeminutes', 'duration', 'minutes', 'time'],
  again: ['smokeagain', 'again', 'wouldsmokeagain', 'buyagain', 'repurchase'],
  private: ['private', 'keepprivate'],
};

const csvKey = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const csvCell = v => {
  const s = String(v ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvText = rows => '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n');

function downloadFile(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

$('#csv-export-btn').addEventListener('click', () => {
  if (!logs.length) { toast('Your journal is empty'); return; }
  const list = [...logs].sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.created - a.created);
  downloadFile(`mywrap-journal-${today()}.csv`, csvText([CSV_COLS.map(c => c.h), ...list.map(l => CSV_COLS.map(c => c.get(l)))]), 'text/csv');
});

$('#csv-template-btn').addEventListener('click', e => {
  e.preventDefault();
  const example = { date: today(), name: '1964 Anniversary Maduro', brand: 'Padrón', wrapper: 'Maduro', origin: 'Nicaragua', strength: 4,
    size: 'Robusto', place: 'Patio', rating: 5, notes: ['Cocoa', 'Coffee', 'Earth'], enjoyed: 'Rich and smooth, perfect burn',
    pairing: 'Bourbon', aged: { n: 3, u: 'm' }, time: 75, again: true };
  downloadFile('mywrap-template.csv', csvText([CSV_COLS.map(c => c.h), CSV_COLS.map(c => c.get(example))]), 'text/csv');
});

// ---------- Reading a spreadsheet ----------
// Handles quoted cells, commas inside quotes, and sheets saved with ; or tabs between cells
function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const first = text.split(/\r?\n/, 1)[0];
  const count = ch => first.split(ch).length;
  const sep = [',', ';', '\t'].reduce((best, ch) => count(ch) > count(best) ? ch : best, ',');
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim()));
}

// Matches "Connecticut Shade", "Ecuador Habano", "dominican" and so on to our lists
function matchList(value, list) {
  const v = csvKey(value);
  if (!v) return '';
  const exact = list.find(x => csvKey(x) === v);
  if (exact) return exact;
  // Most specific first, so "Connecticut Broadleaf" is Broadleaf and "Habano Maduro" is Maduro
  const order = list === WRAPPERS
    ? ['Broadleaf', 'San Andrés', 'Candela', 'Cameroon', 'Sumatra', 'Corojo', 'Rosado', 'Maduro', 'Habano', 'Connecticut']
    : list;
  const inside = order.find(x => x !== 'Other' && v.includes(csvKey(x)));
  if (inside) return inside;
  if (list === ORIGINS && /^(dr|dominican.*)$/.test(v)) return 'Dominican Republic';
  if (list === ORIGINS && /^(us|unitedstates|america)$/.test(v)) return 'USA';
  if (list === ORIGINS && v.startsWith('nicaragua')) return 'Nicaragua';
  if (list === ORIGINS && v.startsWith('hondur')) return 'Honduras';
  if (list === ORIGINS && v.startsWith('cuba')) return 'Cuba';
  if (list === ORIGINS && v.startsWith('mexic')) return 'Mexico';
  return 'Other';
}

function parseStrength(value) {
  const v = csvKey(value).replace(/bodied|body|strength/g, '');
  if (!v) return undefined;
  if (/^[1-5]$/.test(v)) return +v;
  const words = { mild: 1, light: 1, mildmedium: 2, mildmed: 2, mildtomedium: 2, lightmedium: 2, medium: 3, med: 3,
    mediumfull: 4, medfull: 4, mediumtofull: 4, mediumplus: 4, full: 5, strong: 5, heavy: 5 };
  return words[v];
}

// Ratings out of 5, 10 or 100 all come in as 1-5 stars
function parseRating(value) {
  const n = parseFloat(String(value).replace(',', '.'));
  const stars = (String(value).match(/★/g) || []).length;
  if (stars) return Math.min(5, stars);
  if (!(n > 0)) return 0;
  const five = n <= 5 ? n : n <= 10 ? n / 2 : n <= 100 ? n / 20 : 5;
  return Math.min(5, Math.max(1, Math.round(five)));
}

// 2026-11-03, 11/3/2026, 11/3/26, "Nov 3, 2026" all become 2026-11-03
function parseDate(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  let m = v.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = v.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (m) {
    const y = m[3].length === 2 ? '20' + m[3] : m[3];
    // Month first, unless the first number can only be a day
    const [mo, d] = +m[1] > 12 ? [m[2], m[1]] : [m[1], m[2]];
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const t = Date.parse(v);
  if (isNaN(t)) return '';
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// "4 months", "6 mo", "1 year", "3 weeks"; a bare number means months
function parseAged(value) {
  const v = String(value || '').trim().toLowerCase();
  const n = parseFloat(v.replace(',', '.'));
  if (!(n > 0)) return undefined;
  const unit = v.replace(/^[\d.,\s]+/, '');
  const u = /^d|day/.test(unit) ? 'd' : /^w/.test(unit) ? 'w' : /^y/.test(unit) ? 'y' : 'm';
  return { n, u };
}

// "75", "1:15", "1h 15m", "1 hr 15 min"
function parseMinutes(value) {
  const v = String(value || '').trim().toLowerCase();
  if (!v) return undefined;
  let m = v.match(/^(\d+):(\d{1,2})$/);
  if (m) return +m[1] * 60 + +m[2] || undefined;
  const h = v.match(/(\d+(?:\.\d+)?)\s*h/), min = v.match(/(\d+)\s*m/);
  if (h || min) return Math.round((h ? +h[1] * 60 : 0) + (min ? +min[1] : 0)) || undefined;
  return Math.round(parseFloat(v)) || undefined;
}

const parseYes = v => /^(y|yes|true|1|x|✓|✔)$/i.test(String(v || '').trim());

// Turns a spreadsheet into logs, plus counts for the preview
function readJournalCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return { error: "That spreadsheet doesn't have any rows" };
  const header = rows[0].map(csvKey);
  const col = {};
  for (const [k, names] of Object.entries(CSV_ALIASES)) {
    const i = header.findIndex(h => names.includes(h));
    if (i >= 0) col[k] = i;
  }
  if (col.name === undefined) return { error: 'Couldn\'t find a "Cigar" column. Try the blank template.' };
  const ignored = rows[0].filter((h, i) => h.trim() && !Object.values(col).includes(i));

  const have = new Set(logs.map(l => `${csvKey(l.brand)}|${csvKey(l.name)}|${l.date || ''}`));
  const result = { add: [], noName: 0, dupes: 0, noRating: 0, ignored };
  rows.slice(1).forEach((r, i) => {
    const get = k => col[k] === undefined ? '' : (r[col[k]] || '').trim();
    let name = get('name'), brand = get('brand');
    if (!name) { result.noName++; return; }
    // Fill brand, wrapper and country from the vault when the cigar is in it
    const c = findCatalog(brand ? `${brand} ${name}` : name) || (!brand && CATALOG.find(x => csvKey(x.n) === csvKey(name)));
    if (c) { name = c.n; brand = c.b; }
    const date = parseDate(get('date'));
    const key = `${csvKey(brand)}|${csvKey(name)}|${date}`;
    if (have.has(key)) { result.dupes++; return; }
    have.add(key);

    let rating = parseRating(get('rating'));
    if (!rating) { rating = 3; result.noRating++; }
    // Flavors we know become flavor tags; any others are kept in the notes
    const words = get('flavors').split(/[;,/|]+/).map(s => s.trim()).filter(Boolean);
    const notes = [...new Set(words.map(w => NOTES.find(n => csvKey(n) === csvKey(w))).filter(Boolean))];
    const extra = words.filter(w => !NOTES.some(n => csvKey(n) === csvKey(w)));
    const enjoyed = [get('enjoyed'), extra.length ? `Flavors: ${extra.join(', ')}` : ''].filter(Boolean).join('\n');

    result.add.push({
      id: Date.now().toString(36) + i.toString(36) + Math.random().toString(36).slice(2, 6),
      name, brand,
      wrapper: get('wrapper') ? matchList(get('wrapper'), WRAPPERS) : c?.w || 'Other',
      origin: get('origin') ? matchList(get('origin'), ORIGINS) : c?.o || 'Other',
      strength: parseStrength(get('strength')),
      size: get('size'),
      date,
      rating,
      notes,
      enjoyed,
      pairing: get('pairing'),
      place: get('place') || undefined,
      aged: parseAged(get('aged')),
      time: parseMinutes(get('time')),
      again: parseYes(get('again')),
      private: parseYes(get('private')) || undefined,
      created: Date.now() + i,
    });
  });
  return result;
}

$('#csv-import-btn').addEventListener('click', () => $('#csv-file').click());
$('#csv-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  if (/\.(xlsx?|numbers)$/i.test(file.name)) {
    toast('Save it as CSV first (File > Export or Download as CSV)');
    return;
  }
  let r;
  try { r = readJournalCsv(await file.text()); } catch { r = { error: "Couldn't read that file" }; }
  if (r.error) { toast(r.error); return; }
  showCsvPreview(r);
});

function showCsvPreview(r) {
  const n = r.add.length;
  const plural = (k, word) => `${k} ${word}${k === 1 ? '' : 's'}`;
  const lines = [
    r.dupes && `${plural(r.dupes, 'cigar')} already in your journal, skipped`,
    r.noName && `${plural(r.noName, 'row')} with no cigar name, skipped`,
    r.noRating && `${plural(r.noRating, 'cigar')} had no rating, so ${r.noRating === 1 ? 'it gets' : 'they get'} 3 stars. You can change that later.`,
    r.ignored.length && `Columns not used: ${r.ignored.map(esc).join(', ')}`,
  ].filter(Boolean);
  $('#sheet-body').innerHTML = `
    <h2 style="margin-top:0">Import spreadsheet</h2>
    <p style="margin:0 0 10px"><b>${n ? `Found ${plural(n, 'cigar')} to add` : 'Nothing new to add'}</b></p>
    ${lines.map(t => `<p class="muted" style="font-size:14px;margin:0 0 6px">${t}</p>`).join('')}
    ${n ? `<div style="margin-top:12px">${r.add.slice(0, 5).map(l => `
      <div class="card" style="padding:10px 12px;margin-bottom:6px">
        <div class="row"><div class="card-title" style="font-size:15px">${esc(l.name)}</div>${starsHtml(l.rating)}</div>
        <div class="card-sub">${esc([l.brand, l.wrapper, fmtDate(l.date)].filter(Boolean).join(' · '))}</div>
      </div>`).join('')}
      ${n > 5 ? `<p class="muted" style="font-size:14px;margin:4px 0 0">and ${n - 5} more</p>` : ''}</div>` : ''}
    <div class="btn-row" style="margin-top:16px">
      <button class="btn ghost" data-act="close">Cancel</button>
      ${n ? `<button class="btn" data-act="add">Add ${plural(n, 'cigar')}</button>` : ''}
    </div>`;
  $('#sheet-body').onclick = e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') closeSheet();
    if (act === 'add') {
      logs = logs.concat(r.add);
      save();
      closeSheet();
      toast(`Added ${plural(n, 'cigar')} to your journal`);
      journalSeg = 'smoked';
      show('journal');
    }
  };
  $('#sheet').classList.add('open');
}

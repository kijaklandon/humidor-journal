// ============================================================
//  Monthly recap
//  One month of the journal on one screen, plus a picture of it to
//  share. Loads before the main script so the Journal can call it on
//  its first draw; everything it uses is looked up when it runs.
// ============================================================

const prevMonth = ym => {
  const [y, m] = ym.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
};
const monthDate = ym => new Date(ym + '-15T00:00');
const monthName = ym => monthDate(ym).toLocaleDateString(undefined, { month: 'long' });
const monthLabel = ym => monthDate(ym).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
const recapMonths = () => [...new Set(logs.map(l => (l.date || '').slice(0, 7)).filter(Boolean))].sort().reverse();
const logsIn = ym => logs.filter(l => (l.date || '').startsWith(ym));
const recapNewest = (a, b) => b.rating - a.rating || (b.date || '').localeCompare(a.date || '');

// What one logged cigar was worth: what you paid for it, else the typical US price
function logPrice(l) {
  const own = inventory.find(i => i.price && i.name === l.name && (i.brand || '') === (l.brand || ''));
  if (own) return own.price;
  return currency() === 'USD' ? typicalPrice(l.brand, l.name) : null;
}

function recapData(ym) {
  const list = logsIn(ym);
  const tally = values => {
    const counts = {};
    values.filter(Boolean).forEach(v => counts[v] = (counts[v] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };
  const ranked = [...list].sort(recapNewest);
  const brands = tally(list.map(brandOf));
  return {
    list,
    count: list.length,
    avg: list.length ? (list.reduce((s, l) => s + l.rating, 0) / list.length).toFixed(1) : '–',
    days: new Set(list.map(l => l.date)).size,
    countries: new Set(list.map(l => l.origin).filter(Boolean)).size,
    topBrand: brands[0] || null,
    wrapper: tally(list.map(l => l.wrapper))[0]?.[0] || '',
    flavors: tally(list.flatMap(l => l.notes || [])).slice(0, 4).map(f => f[0]),
    best: ranked[0] || null,
    // The picture can leave the app, so it never names a private entry
    bestPublic: ranked.find(l => !l.private) || null,
    topBrandPublic: tally(list.filter(l => !l.private).map(brandOf))[0] || null,
    newBrands: brands.filter(([b]) => !logs.some(l => brandOf(l) === b && (l.date || '') < ym + '-01')).length,
    value: list.reduce((s, l) => s + (logPrice(l) || 0), 0),
    lastMonth: logsIn(prevMonth(ym)).length,
  };
}

// In the first days of a month, the Journal points at last month's recap until it's opened
function recapDue() {
  const now = today().slice(0, 7), prev = prevMonth(now);
  return Number(today().slice(8)) <= 10 && logsIn(prev).length ? prev : null;
}
function recapNudgeHtml() {
  try {
    const due = recapDue();
    if (!due || getPref('recapSeen') === due) return '';
    return `
      <div class="card tap" onclick="openRecap('${due}')">
        <div class="row">
          <div><div class="card-title">Your ${esc(monthName(due))} recap is ready</div><div class="card-sub">See how your month in cigars went</div></div>
          <span class="chev">›</span>
        </div>
      </div>`;
  } catch { return ''; }   // first draw can come before settings have loaded
}

function openRecap(ym) {
  const months = recapMonths();
  if (!months.length) return toast('Log a cigar to get your first recap');
  const due = recapDue();
  if (!months.includes(ym)) ym = due || (months.includes(today().slice(0, 7)) ? today().slice(0, 7) : months[0]);
  if (ym === due && getPref('recapSeen') !== due) {
    setPref('recapSeen', due);
    if (typeof journalSeg !== 'undefined' && journalSeg === 'smoked') renderSmoked();
  }

  const r = recapData(ym), i = months.indexOf(ym), newer = months[i - 1], older = months[i + 1];
  const change = r.count - r.lastMonth;
  const row = (label, value) => `<div class="ach-row"><div class="grow"><div class="ach-desc">${label}</div><div class="ach-title">${value}</div></div></div>`;
  const body = $('#sheet-body');
  body.onchange = null;
  body.innerHTML = `
    <div class="row" style="margin-bottom:10px">
      <button class="btn small ghost" data-month="${older || ''}" aria-label="Earlier month"${older ? '' : ' disabled'}>‹</button>
      <h2 style="margin:0;text-align:center">${esc(monthLabel(ym))}</h2>
      <button class="btn small ghost" data-month="${newer || ''}" aria-label="Later month"${newer ? '' : ' disabled'}>›</button>
    </div>
    <div class="recap-hero">
      <b>${r.count}</b>
      <div><div class="card-title">${r.count === 1 ? 'cigar' : 'cigars'} smoked</div>
      ${r.lastMonth ? `<div class="card-sub">${change > 0 ? `${change} more than` : change < 0 ? `${-change} fewer than` : 'Same as'} ${esc(monthName(prevMonth(ym)))}</div>` : ''}</div>
    </div>
    <div class="stats" style="margin-top:12px">
      <div class="stat"><b>${r.avg}</b><small>Avg rating</small></div>
      <div class="stat"><b>${r.days}</b><small>${r.days === 1 ? 'Day' : 'Days'} smoked</small></div>
      <div class="stat"><b>${r.countries}</b><small>${r.countries === 1 ? 'Country' : 'Countries'}</small></div>
    </div>
    ${r.best ? `
      <div class="ach-row" data-log="${esc(r.best.id)}" style="cursor:pointer">
        <div class="grow"><div class="ach-desc">Best of the month</div><div class="ach-title">${esc(r.best.name)}</div>
        ${r.best.brand ? `<div class="ach-desc">${esc(r.best.brand)}</div>` : ''}</div>
        ${starsHtml(r.best.rating)}
      </div>` : ''}
    ${r.topBrand ? row('Top brand', `${esc(r.topBrand[0])} · ${r.topBrand[1]}`) : ''}
    ${r.wrapper ? row('Favorite wrapper', esc(r.wrapper)) : ''}
    ${r.newBrands ? row('New brands tried', r.newBrands) : ''}
    ${r.value ? row('Value smoked', `≈ ${money(r.value)}`) : ''}
    ${r.flavors.length ? `<div class="chips" style="margin-top:12px">${r.flavors.map(f => `<span class="chip">${esc(f)}</span>`).join('')}</div>` : ''}
    <div class="btn-row" style="margin-top:16px">
      <button class="btn ghost" data-act="close">Close</button>
      <button class="btn" data-act="share">Share</button>
    </div>`;
  body.onclick = e => {
    const month = e.target.closest('[data-month]')?.dataset.month;
    if (month) return openRecap(month);
    const log = e.target.closest('[data-log]')?.dataset.log;
    if (log) return openDetail(log);
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') closeSheet();
    if (act === 'share') openRecapShare(ym);
  };
  $('#sheet').classList.add('open');
}

function drawRecapCard(ym, opts) {
  const r = recapData(ym), c = cardColors();
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  const x = CARD_PAD, W = CARD_W - CARD_PAD * 2;
  const spaced = (s, px, color, at) => {
    ctx.font = `700 ${px}px ${CARD_SANS}`;
    ctx.fillStyle = color;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
    ctx.fillText(s, x, at);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  };
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, CARD_W, canvas.height);
  ctx.fillStyle = c.accent;
  ctx.fillRect(0, 0, CARD_W, 14);
  ctx.textBaseline = 'top';

  spaced('MY MONTH IN CIGARS', 28, c.accent, 78);
  ctx.font = `700 88px ${CARD_SERIF}`;
  ctx.fillStyle = c.text;
  ctx.fillText(cardLines(ctx, monthLabel(ym), W, 1)[0], x, 124);

  ctx.font = `700 230px ${CARD_SERIF}`;
  ctx.fillStyle = c.accent;
  ctx.fillText(r.count, x - 6, 232);
  const numW = ctx.measureText(r.count).width;
  ctx.font = `700 54px ${CARD_SANS}`;
  ctx.fillStyle = c.text;
  ctx.fillText(r.count === 1 ? 'cigar' : 'cigars', x + numW + 34, 300);
  ctx.fillText('smoked', x + numW + 34, 364);

  // Three boxes across
  const gap = 24, boxW = (W - gap * 2) / 3, boxY = 492, boxH = 168;
  [[r.avg, 'Avg rating'], [r.days, r.days === 1 ? 'Day smoked' : 'Days smoked'], [r.countries, r.countries === 1 ? 'Country' : 'Countries']].forEach(([n, label], i) => {
    const bx = x + i * (boxW + gap);
    roundRect(ctx, bx, boxY, boxW, boxH, 20);
    ctx.fillStyle = c.surface;
    ctx.fill();
    ctx.font = `700 70px ${CARD_SERIF}`;
    ctx.fillStyle = c.accent;
    ctx.fillText(n, bx + 28, boxY + 24);
    ctx.font = `500 28px ${CARD_SANS}`;
    ctx.fillStyle = c.muted;
    ctx.fillText(label, bx + 28, boxY + 112);
  });

  let y = 712;
  if (r.bestPublic) {
    spaced('BEST OF THE MONTH', 26, c.accent, y);
    ctx.font = `700 54px ${CARD_SERIF}`;
    ctx.fillStyle = c.text;
    ctx.fillText(cardLines(ctx, r.bestPublic.name, W, 1)[0], x, y + 42);
    cardStars(ctx, x, y + 114, r.bestPublic.rating, 46, c);
    y += 204;
  }
  if (r.topBrandPublic) {
    spaced('TOP BRAND', 26, c.accent, y);
    ctx.font = `700 54px ${CARD_SERIF}`;
    ctx.fillStyle = c.text;
    ctx.fillText(cardLines(ctx, r.topBrandPublic[0], W, 1)[0], x, y + 42);
    y += 138;
  }
  if (r.flavors.length) {
    spaced('TOP FLAVORS', 26, c.accent, y);
    y += 46;
    ctx.font = `500 32px ${CARD_SANS}`;
    let px = x;
    for (const f of r.flavors) {
      const w = ctx.measureText(f).width + 52;
      if (px + w > x + W) break;
      roundRect(ctx, px, y, w, 62, 31);
      ctx.fillStyle = c.surface; ctx.fill();
      ctx.strokeStyle = c.border; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.fillText(f, px + 26, y + 15);
      px += w + 14;
    }
  }

  // Footer, matching the cigar share card
  const fy = 1252;
  ctx.fillStyle = c.border;
  ctx.fillRect(x, fy - 30, W, 2);
  ctx.font = `600 26px ${CARD_SANS}`;
  const siteW = ctx.measureText(APP_SITE).width;
  ctx.fillStyle = c.muted;
  ctx.fillText(APP_SITE, x + W - siteW, fy + 46);
  ctx.font = `700 42px ${CARD_SERIF}`;
  const brandW = ctx.measureText('MyWrap').width;
  ctx.fillStyle = c.accent;
  ctx.fillText('MyWrap', x + W - brandW, fy - 4);
  const leftW = W - Math.max(brandW, siteW) - 30;
  const showName = opts.name && profile.name;
  const title = showName ? [iAmFounder() && 'Founder', myTitle()].filter(Boolean).join(' · ') : '';
  ctx.font = `400 30px ${CARD_SANS}`;
  ctx.fillStyle = c.muted;
  ctx.fillText(cardLines(ctx, showName ? `${profile.name}${iAmFounder() ? ' ✦' : ''}` : 'My cigar journal', leftW, 1)[0], x, title ? fy : fy + 22);
  if (title) {
    ctx.font = `700 24px ${CARD_SANS}`;
    ctx.fillStyle = c.accent;
    ctx.fillText(cardLines(ctx, title.toUpperCase(), leftW, 1)[0], x, fy + 44);
  }
  return new Promise(res => canvas.toBlob(res, 'image/png'));
}

// The picture is drawn before the Share tap, because phones only open the share menu right after a tap
async function openRecapShare(ym) {
  const opts = { name: getPref('shareName') ?? false };
  const text = `My ${monthName(ym)} in cigars, tracked on MyWrap, my personal cigar journal. Start logging your cigars today!\nhttps://mywrapcigars.com`;
  let file = null, previewUrl = null;
  const body = $('#sheet-body');
  body.innerHTML = `
    <h2>Share your recap</h2>
    <div class="share-preview" id="share-preview"><span class="card-sub">Making your card…</span></div>
    <label class="toggle field"><input type="checkbox" id="share-name"${opts.name ? ' checked' : ''}${profile.name ? '' : ' disabled'}> <span style="margin:0;color:var(--text)">Show my name${profile.name ? '' : ' (add one in your profile)'}</span></label>
    <div class="btn-row" style="margin-top:14px">
      <button class="btn ghost" data-act="back">Back</button>
      <button class="btn" data-act="share" id="share-go" disabled>Share</button>
    </div>`;

  async function render() {
    $('#share-go').disabled = true;
    const blob = await drawRecapCard(ym, opts);
    if (!body.contains($('#share-preview'))) return;   // sheet moved on while drawing
    file = new File([blob], `mywrap-recap-${ym}.png`, { type: 'image/png' });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(blob);
    $('#share-preview').innerHTML = `<img alt="Recap card for ${esc(monthLabel(ym))}" src="${previewUrl}">`;
    $('#share-go').textContent = navigator.canShare?.({ files: [file] }) ? 'Share' : 'Save image';
    $('#share-go').disabled = false;
  }

  body.onchange = e => {
    if (e.target.id !== 'share-name') return;
    opts.name = e.target.checked;
    setPref('shareName', opts.name);
    render();
  };
  body.onclick = async e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'back') openRecap(ym);
    if (act === 'share' && file) {
      if (navigator.canShare?.({ files: [file] })) {
        // Cancelling the share menu also lands in catch; that's fine
        try { await navigator.share({ files: [file], text }); } catch {}
      } else {
        const a = document.createElement('a');
        a.href = previewUrl;
        a.download = file.name;
        a.click();
        toast('Card saved');
      }
    }
  };
  render();
}

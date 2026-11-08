// ============================================================
//  Share a cigar as a picture card
//  Draws one journal entry onto a canvas in the current theme's colors
//  (1080 wide, square without a photo, up to 4:5 with one) and hands it
//  to the phone's share menu. Nothing is uploaded.
// ============================================================

const CARD_W = 1080, CARD_PAD = 72;
const APP_SITE = 'mywrapcigars.com';
const SHARE_TEXT = 'I tracked this cigar on MyWrap, my personal cigar journal. Start logging your cigars today!\nhttps://mywrapcigars.com';
const CARD_SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const CARD_SERIF = 'Georgia, "Times New Roman", serif';

function cardColors() {
  const css = getComputedStyle(document.documentElement);
  const v = name => css.getPropertyValue(name).trim();
  return { bg: v('--bg'), surface: v('--surface-2'), border: v('--border'), text: v('--text'),
    muted: v('--muted'), accent: v('--accent'), off: v('--off') };
}

// Split text into lines that fit maxW; the last allowed line ends in "…" if cut
function cardLines(ctx, text, maxW, maxLines) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const next = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(next).width <= maxW || !line) { line = next; continue; }
    lines.push(line);
    line = words[i];
    if (lines.length === maxLines) { line = ''; lines[maxLines - 1] += ' …'; break; }
  }
  if (line) lines.push(line);
  // A single word too wide for the card gets trimmed
  return lines.slice(0, maxLines).map(s => {
    if (ctx.measureText(s).width <= maxW) return s;
    while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1);
    return s + '…';
  });
}

function cardStar(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
}

function cardStars(ctx, x, y, rating, size, c) {
  for (let i = 0; i < 5; i++) {
    const cx = x + size / 2 + i * size * 1.15, cy = y + size / 2;
    cardStar(ctx, cx, cy, size / 2);
    ctx.fillStyle = c.off;
    ctx.fill();
    const part = Math.max(0, Math.min(1, rating - i));
    if (!part) continue;
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - size / 2, cy - size / 2, size * part, size);
    ctx.clip();
    cardStar(ctx, cx, cy, size / 2);
    ctx.fillStyle = c.accent;
    ctx.fill();
    ctx.restore();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Draws the text part of the card starting at `top`. With draw=false it only
// measures, so the photo can take whatever height is left.
function cardBody(ctx, l, opts, top, c, draw) {
  const W = CARD_W - CARD_PAD * 2, x = CARD_PAD;
  let y = top;
  const text = (s, font, color, lh) => {
    ctx.font = font;
    if (draw) { ctx.fillStyle = color; ctx.fillText(s, x, y); }
    y += lh;
  };
  ctx.textBaseline = 'top';

  ctx.font = `700 76px ${CARD_SERIF}`;
  for (const s of cardLines(ctx, l.name, W, 2)) text(s, ctx.font, c.text, 88);
  if (l.brand) { ctx.font = `400 40px ${CARD_SANS}`; text(cardLines(ctx, l.brand, W, 1)[0], ctx.font, c.muted, 58); }
  y += 10;
  if (draw) cardStars(ctx, x, y, l.rating || 0, 58, c);
  y += 58 + 34;

  const facts = [l.wrapper, l.origin, l.strength ? STRENGTHS[l.strength - 1] : '', l.size].filter(Boolean).join('  ·  ');
  if (facts) {
    ctx.font = `500 34px ${CARD_SANS}`;
    for (const s of cardLines(ctx, facts, W, 2)) text(s, ctx.font, c.text, 46);
    y += 26;
  }

  // Flavor pills, at most two rows
  if (l.notes?.length) {
    ctx.font = `500 30px ${CARD_SANS}`;
    const h = 58, gap = 14;
    let px = x, row = 0;
    for (const n of l.notes) {
      const w = ctx.measureText(n).width + 48;
      if (px + w > x + W && px > x) { row++; px = x; }
      if (row > 1) break;
      if (draw) {
        roundRect(ctx, px, y + row * (h + gap), w, h, h / 2);
        ctx.fillStyle = c.surface; ctx.fill();
        ctx.strokeStyle = c.border; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = c.text; ctx.fillText(n, px + 24, y + row * (h + gap) + 13);
      }
      px += w + gap;
    }
    y += (row > 1 ? 2 : row + 1) * (h + gap) + 20;
  }

  if (opts.notes && l.enjoyed) {
    ctx.font = `italic 400 34px ${CARD_SERIF}`;
    const lines = cardLines(ctx, l.enjoyed.replace(/\s+/g, ' '), W - 36, 4);
    const h = lines.length * 46 + 36;
    if (draw) {
      roundRect(ctx, x, y, W, h, 16);
      ctx.fillStyle = c.surface; ctx.fill();
      ctx.fillStyle = c.accent; ctx.fillRect(x, y + 12, 6, h - 24);
      ctx.fillStyle = c.text;
      lines.forEach((s, i) => ctx.fillText(s, x + 30, y + 18 + i * 46));
    }
    y += h + 30;
  }

  if (l.pairing) {
    ctx.font = `600 32px ${CARD_SANS}`;
    const label = 'Paired with  ';
    const lw = ctx.measureText(label).width;
    if (draw) { ctx.fillStyle = c.accent; ctx.fillText(label, x, y); }
    ctx.font = `400 32px ${CARD_SANS}`;
    if (draw) { ctx.fillStyle = c.text; ctx.fillText(cardLines(ctx, l.pairing, W - lw, 1)[0], x + lw, y); }
    y += 62;
  }

  if (opts.smoke) y = cardSmokeNotes(ctx, l.detail, x, y, W, c, draw);

  // Footer: who and when on the left, the app's name and address on the right
  y += 6;
  if (draw) { ctx.fillStyle = c.border; ctx.fillRect(x, y, W, 2); }
  y += 30;
  if (draw) {
    ctx.font = `600 26px ${CARD_SANS}`;
    const siteW = ctx.measureText(APP_SITE).width;
    ctx.fillStyle = c.muted;
    ctx.fillText(APP_SITE, x + W - siteW, y + 46);
    ctx.font = `700 42px ${CARD_SERIF}`;
    const brandW = ctx.measureText('MyWrap').width;
    ctx.fillStyle = c.accent;
    ctx.fillText('MyWrap', x + W - brandW, y - 4);
    ctx.font = `400 30px ${CARD_SANS}`;
    const who = opts.name && profile.name ? `Smoked by ${profile.name}${iAmFounder() ? ' ✦' : ''}  ·  ` : 'Smoked ';
    const leftW = W - Math.max(brandW, siteW) - 30;
    ctx.fillStyle = c.muted;
    // With a title, it goes on its own line under the name
    const title = opts.name && profile.name ? [iAmFounder() && 'Founder', myTitle()].filter(Boolean).join(' · ') : '';
    ctx.fillText(cardLines(ctx, who + fmtDate(l.date), leftW, 1)[0], x, title ? y : y + 22);
    if (title) {
      ctx.font = `700 24px ${CARD_SANS}`;
      ctx.fillStyle = c.accent;
      if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
      ctx.fillText(cardLines(ctx, title.toUpperCase(), leftW, 1)[0], x, y + 44);
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    }
  }
  return y + 76 + CARD_PAD - top;
}

// Draw/burn/construction/ash as dots, then what each third tasted like
function cardSmokeNotes(ctx, d, x, y, W, c, draw) {
  if (!d) return y;
  const scores = SCORES.filter(s => d[s.k]);
  const thirds = (d.thirds || []).map((t, i) => ({ ...t, name: THIRDS[i] })).filter(t => t.notes?.length || t.text);
  if (!scores.length && !thirds.length) return y;

  ctx.font = `700 26px ${CARD_SANS}`;
  if (draw) {
    ctx.fillStyle = c.accent;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
    ctx.fillText('SMOKE NOTES', x, y);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
  y += 48;

  // Two columns: "Draw ●●●●○ Good"
  const colW = W / 2;
  scores.forEach((s, i) => {
    const cx = x + (i % 2) * colW, cy = y + Math.floor(i / 2) * 50;
    if (!draw) return;
    ctx.font = `500 28px ${CARD_SANS}`;
    ctx.fillStyle = c.muted;
    ctx.fillText(s.name, cx, cy);
    const dotsX = cx + 180;
    for (let k = 0; k < 5; k++) {
      ctx.beginPath();
      ctx.arc(dotsX + k * 24 + 8, cy + 15, 8, 0, Math.PI * 2);
      ctx.fillStyle = k < d[s.k] ? c.accent : c.off;
      ctx.fill();
    }
    ctx.fillStyle = c.text;
    ctx.fillText(cardLines(ctx, s.labels[d[s.k] - 1], colW - 330, 1)[0], dotsX + 132, cy);
  });
  if (scores.length) y += Math.ceil(scores.length / 2) * 50 + 14;

  // "First third  Cedar, pepper. Opened up nicely" on up to two lines each
  for (const t of thirds) {
    ctx.font = `600 30px ${CARD_SANS}`;
    const lw = ctx.measureText(t.name + '  ').width;
    if (draw) { ctx.fillStyle = c.text; ctx.fillText(t.name, x, y); }
    ctx.font = `400 30px ${CARD_SANS}`;
    const said = [t.notes?.join(', '), t.text?.replace(/\s+/g, ' ')].filter(Boolean).join('. ');
    const lines = cardLines(ctx, said, W - lw, 2);
    if (draw) { ctx.fillStyle = c.muted; lines.forEach((s, i) => ctx.fillText(s, x + lw, y + i * 40)); }
    y += lines.length * 40 + 12;
  }
  return y + 24;
}

async function cardPhoto(l) {
  if (!l.photo) return null;
  try {
    const url = await photoUrl(l.id, l.photo, null);
    if (!url) return null;
    // Fetch into a local blob first so the canvas can still be exported
    const blob = await (await fetch(url)).blob();
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    await img.decode();
    return img;
  } catch { return null; }
}

async function drawShareCard(l, opts) {
  const c = cardColors();
  const photo = await cardPhoto(l);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = CARD_W;
  const bodyH = cardBody(ctx, l, opts, 0, c, false);
  // No photo: square (or taller if the text needs it). Photo: fill up to 4:5.
  const photoH = photo ? Math.max(340, 1342 - bodyH) : 0;
  const top = photo ? photoH + 8 : CARD_PAD + 70;
  canvas.height = Math.max(photo ? 1350 : CARD_W, top + bodyH);

  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (photo) {
    // Cover-crop into the top area, then fade into the background
    const s = Math.max(CARD_W / photo.naturalWidth, photoH / photo.naturalHeight);
    const w = photo.naturalWidth * s, h = photo.naturalHeight * s;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CARD_W, photoH);
    ctx.clip();
    ctx.drawImage(photo, (CARD_W - w) / 2, (photoH - h) / 2, w, h);
    ctx.restore();
    URL.revokeObjectURL(photo.src);
    const fade = ctx.createLinearGradient(0, photoH - 220, 0, photoH);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(1, c.bg);
    ctx.fillStyle = fade;
    ctx.fillRect(0, photoH - 220, CARD_W, 222);
  } else {
    ctx.fillStyle = c.accent;
    ctx.fillRect(0, 0, CARD_W, 14);
    ctx.font = `700 28px ${CARD_SANS}`;
    ctx.textBaseline = 'top';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
    ctx.fillText('FROM MY CIGAR JOURNAL', CARD_PAD, CARD_PAD + 6);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
  // Without a photo, center the text in the square
  const extra = canvas.height - top - bodyH;
  cardBody(ctx, l, opts, top + (photo ? 0 : extra / 2), c, true);
  return new Promise(res => canvas.toBlob(res, 'image/png'));
}

const shareSlug = s => (s || 'cigar').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cigar';

async function openShareCard(id) {
  const l = logs.find(x => x.id === id);
  if (!l) return;
  const opts = { notes: getPref('shareNotes') ?? true, smoke: getPref('shareSmoke') ?? true, name: getPref('shareName') ?? false };
  let file = null, previewUrl = null;
  const body = $('#sheet-body');
  body.innerHTML = `
    <h2>Share this cigar</h2>
    <div class="share-preview" id="share-preview"><span class="card-sub">Making your card…</span></div>
    ${l.enjoyed ? `<label class="toggle field"><input type="checkbox" id="share-notes"${opts.notes ? ' checked' : ''}> <span style="margin:0;color:var(--text)">Show my notes</span></label>` : ''}
    ${detailHtml(l.detail) ? `<label class="toggle field"><input type="checkbox" id="share-smoke"${opts.smoke ? ' checked' : ''}> <span style="margin:0;color:var(--text)">Show my smoke notes</span></label>` : ''}
    <label class="toggle field"><input type="checkbox" id="share-name"${opts.name ? ' checked' : ''}${profile.name ? '' : ' disabled'}> <span style="margin:0;color:var(--text)">Show my name${profile.name ? '' : ' (add one in your profile)'}</span></label>
    <div class="btn-row" style="margin-top:14px">
      <button class="btn ghost" data-act="back">Back</button>
      <button class="btn" data-act="share" id="share-go" disabled>Share</button>
    </div>`;

  async function render() {
    $('#share-go').disabled = true;
    const blob = await drawShareCard(l, opts);
    if (!body.contains($('#share-preview'))) return;   // sheet moved on while drawing
    file = new File([blob], `mywrap-${shareSlug(l.name)}.png`, { type: 'image/png' });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(blob);
    $('#share-preview').innerHTML = `<img alt="Share card for ${esc(l.name)}" src="${previewUrl}">`;
    const canShare = navigator.canShare?.({ files: [file] });
    $('#share-go').textContent = canShare ? 'Share' : 'Save image';
    $('#share-go').disabled = false;
  }

  body.onchange = e => {
    if (e.target.id === 'share-notes') { opts.notes = e.target.checked; setPref('shareNotes', opts.notes); }
    if (e.target.id === 'share-smoke') { opts.smoke = e.target.checked; setPref('shareSmoke', opts.smoke); }
    if (e.target.id === 'share-name') { opts.name = e.target.checked; setPref('shareName', opts.name); }
    render();
  };
  body.onclick = async e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'back') { body.onchange = null; openDetail(id); }
    if (act === 'share' && file) {
      if (navigator.canShare?.({ files: [file] })) {
        // Cancelling the share menu also lands in catch; that's fine
        try { await navigator.share({ files: [file], text: SHARE_TEXT }); } catch {}
      } else {
        const a = document.createElement('a');
        a.href = previewUrl;
        a.download = file.name;
        a.click();
        toast('Card saved');
      }
    }
  };
  $('#sheet').classList.add('open');
  render();
}

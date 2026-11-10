// ============================================================
//  Smoke timer
//  Pick the cigar, light it, and the timer keeps time and nudges you
//  to puff. "Done smoking" opens the log form with the cigar and the
//  smoke time filled in. The running smoke is saved on this device, so
//  closing the app doesn't stop the clock.
// ============================================================

const TIMER_KEY = 'mywrap.timer.v1';   // { start, n, b, w, o, invId }
const PUFF_PACES = [[0, 'Off'], [30, 'Every 30s'], [45, 'Every 45s'], [60, 'Every 60s']];
const PUFF_SHOW = 3;                    // seconds "Puff now" stays up
const SMOKE_TIPS = [
  'Toast the foot evenly before you draw. A good light makes the whole smoke.',
  "Don't inhale. Draw the smoke into your mouth, taste it, and let it go.",
  'Slow down. Puffing too often overheats the cigar and turns it bitter.',
  "Let the ash grow. About an inch is the time to tap it off gently.",
  'Try a retrohale: let a little smoke out through your nose to catch more flavor.',
  'Notice how the flavor changes from one third to the next.',
  'If it goes out, blow gently through it to clear old smoke before relighting.',
  'Sip some water between puffs to keep your palate fresh.',
];

let smoke = (() => { try { return JSON.parse(localStorage.getItem(TIMER_KEY)); } catch { return null; } })();
let timerTick = null, wakeLock = null, puffAudio = null, lastPuff = -1;

function saveSmoke() {
  try { smoke ? localStorage.setItem(TIMER_KEY, JSON.stringify(smoke)) : localStorage.removeItem(TIMER_KEY); } catch {}
}
const smokeSecs = () => Math.max(0, Math.floor((Date.now() - smoke.start) / 1000));
const puffPace = () => getPref('puffEvery') ?? 45;
function clock(secs) {
  const h = Math.floor(secs / 3600), m = Math.floor(secs / 60) % 60, s = secs % 60;
  const pad = n => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// The header button shows the minutes while a cigar is lit
function renderTimerBtn() {
  const btn = $('#timer-btn');
  btn.classList.toggle('active', !!smoke);
  $('#timer-mins').textContent = smoke ? `${Math.floor(smokeSecs() / 60)}m` : '';
  btn.setAttribute('aria-label', smoke ? `Smoke timer, ${Math.floor(smokeSecs() / 60)} minutes` : 'Start a smoke');
}

$('#timer-btn').addEventListener('click', () => smoke ? openSmokeTimer() : openSmokeStart());

function openSmokeStart() {
  const picks = inventory.filter(i => i.qty > 0)
    .sort((a, b) => (a.brand || '').localeCompare(b.brand || '') || a.name.localeCompare(b.name)).slice(0, 12);
  let chosen = {};   // { n, b, w, o, invId }
  const body = $('#sheet-body');
  body.onchange = null;
  body.innerHTML = `
    <h2 style="margin:0 0 4px">Light one up</h2>
    <p class="muted" style="font-size:14px;margin:0 0 12px">Pick your cigar and start the clock. When you're done, it goes straight into your journal.</p>
    ${picks.length ? `
      <div class="mini-label">From your humidor</div>
      <div class="chips" style="margin:6px 0 12px">${picks.map(i => `<button type="button" class="chip" data-inv="${esc(i.id)}">${esc(i.name)}</button>`).join('')}</div>` : ''}
    <label class="field"><span>Cigar name</span><input type="text" id="t-name" list="catalog-list" placeholder="Start typing, e.g. Padrón 1964"></label>
    <label class="field"><span>Brand</span><input type="text" id="t-brand"></label>
    <label class="field"><span>Puff reminder</span><select id="t-pace">${PUFF_PACES.map(([s, label]) => `<option value="${s}"${s === puffPace() ? ' selected' : ''}>${label}</option>`).join('')}</select></label>
    <div class="btn-row">
      <button class="btn ghost" data-act="close">Cancel</button>
      <button class="btn" data-act="start">Start smoking</button>
    </div>`;

  // Picking from the humidor or the Vault fills in the band details
  const fromVault = () => {
    const c = findCatalog($('#t-name').value);
    if (!c) return;
    $('#t-name').value = c.n;
    $('#t-brand').value = c.b;
    chosen = { w: c.w, o: c.o };
  };
  $('#t-name').addEventListener('change', fromVault);
  body.onclick = e => {
    const pick = e.target.closest('[data-inv]');
    if (pick) {
      const i = inventory.find(x => x.id === pick.dataset.inv);
      body.querySelectorAll('[data-inv]').forEach(b => b.classList.toggle('on', b === pick));
      $('#t-name').value = i.name;
      $('#t-brand').value = i.brand || '';
      chosen = { w: i.wrapper, o: i.origin, invId: i.id, n: i.name, b: i.brand || '' };
      return;
    }
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') return closeSheet();
    if (act !== 'start') return;
    const n = $('#t-name').value.trim(), b = $('#t-brand').value.trim();
    if (!n) return toast('Pick or type the cigar first');
    // Typing over a humidor pick makes it a different cigar
    const inv = chosen.invId && chosen.n === n && chosen.b === b ? chosen.invId : null;
    smoke = { start: Date.now(), n, b, w: chosen.w, o: chosen.o, invId: inv };
    saveSmoke();
    setPref('puffEvery', +$('#t-pace').value);
    startPuffSound();
    lastPuff = -1;
    openSmokeTimer();
    toast('Enjoy your smoke');
  };
  $('#sheet').classList.add('open');
}

function openSmokeTimer() {
  const body = $('#sheet-body');
  body.onchange = null;
  body.innerHTML = `
    <div class="timer-head">
      <div class="card-title" style="font-size:20px">${esc(smoke.n)}</div>
      ${smoke.b ? `<div class="card-sub">${esc(smoke.b)}</div>` : ''}
    </div>
    <div class="timer-clock" id="t-clock">0:00</div>
    <div class="puff" id="t-puff">
      <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="puff-track"/><circle cx="60" cy="60" r="52" class="puff-ring" id="t-ring"/></svg>
      <div class="puff-text" id="t-puff-text"></div>
    </div>
    <p class="timer-tip" id="t-tip"></p>
    <label class="field" style="margin-top:8px"><span>Puff reminder</span><select id="t-pace">${PUFF_PACES.map(([s, label]) => `<option value="${s}"${s === puffPace() ? ' selected' : ''}>${label}</option>`).join('')}</select></label>
    <div class="btn-row">
      <button class="btn ghost" data-act="cancel">Cancel</button>
      <button class="btn" data-act="done">Done smoking</button>
    </div>`;
  body.onchange = e => { if (e.target.id === 't-pace') { setPref('puffEvery', +e.target.value); tickTimer(); } };
  body.onclick = e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'cancel' && confirm('Stop the timer without logging this cigar?')) {
      smoke = null;
      saveSmoke();
      closeSheet();
      renderTimerBtn();
      toast('Timer stopped');
    }
    if (act === 'done') finishSmoke();
  };
  $('#sheet').classList.add('open');
  keepScreenOn();
  tickTimer();
}

// Runs every second while a cigar is lit
function tickTimer() {
  if (!smoke) return;
  renderTimerBtn();
  const clockEl = $('#t-clock');
  if (!clockEl || !$('#sheet').classList.contains('open')) return;
  const secs = smokeSecs(), pace = puffPace();
  clockEl.textContent = clock(secs);
  $('#t-tip').textContent = SMOKE_TIPS[Math.floor(secs / 120) % SMOKE_TIPS.length];
  const ring = $('#t-ring'), text = $('#t-puff-text');
  if (!pace) {
    $('#t-puff').classList.remove('now');
    ring.style.strokeDashoffset = 0;
    text.innerHTML = '<b>Puff</b><small>when you like</small>';
    return;
  }
  const into = secs % pace, n = Math.floor(secs / pace);
  const now = secs >= pace && into < PUFF_SHOW;
  $('#t-puff').classList.toggle('now', now);
  ring.style.strokeDashoffset = (1 - into / pace) * 327;
  text.innerHTML = now ? '<b>Puff</b><small>now</small>' : `<b>${pace - into}</b><small>until your next puff</small>`;
  if (now && n !== lastPuff) {
    lastPuff = n;
    navigator.vibrate?.(120);
    playPuff();
  }
}

// A soft tone. Phones only allow sound that a tap started, so it's set up on "Start smoking".
function startPuffSound() {
  try { puffAudio = puffAudio || new (window.AudioContext || window.webkitAudioContext)(); puffAudio.resume(); } catch {}
}
function playPuff() {
  if (!puffAudio || puffAudio.state !== 'running') return;
  const o = puffAudio.createOscillator(), g = puffAudio.createGain(), t = puffAudio.currentTime;
  o.frequency.value = 660;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.15, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  o.connect(g).connect(puffAudio.destination);
  o.start(t);
  o.stop(t + 0.45);
}

// Keep the screen awake while the timer is showing, where the phone allows it
async function keepScreenOn() {
  try { if (!wakeLock && navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen'); } catch {}
  wakeLock?.addEventListener?.('release', () => { wakeLock = null; });
}
function letScreenSleep() { wakeLock?.release?.().catch(() => {}); wakeLock = null; }

function finishSmoke() {
  const s = smoke, minutes = Math.max(1, Math.round(smokeSecs() / 60));
  smoke = null;
  saveSmoke();
  closeSheet();
  renderTimerBtn();
  resetForm({ n: s.n, b: s.b, w: s.w || 'Other', o: s.o || 'Other' });
  // From the humidor: saving the log takes one off the count, like "Smoked one"
  if (s.invId && inventory.some(i => i.id === s.invId)) pendingInvId = s.invId;
  $('#f-time').value = minutes;
  $('#f-detail').open = true;
  show('add');
  toast(`${minutes} minute${minutes === 1 ? '' : 's'}. Add your rating and notes`);
}

setInterval(() => {
  if (!smoke) return;
  tickTimer();
  if (!$('#sheet').classList.contains('open') || !$('#t-clock')) letScreenSleep();
}, 1000);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && smoke && $('#t-clock') && $('#sheet').classList.contains('open')) keepScreenOn();
});
renderTimerBtn();

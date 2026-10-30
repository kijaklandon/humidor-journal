// ============================================================
//  Accounts & sync (Supabase)
//  The app works fully offline. When you're signed in, everything
//  saved on this device is merged with your account and pushed up.
// ============================================================

const SUPABASE_URL = 'https://pxvpfvvkyxrziiapcvkf.supabase.co';
// Publishable key: meant to live in the app. The database's access
// rules (supabase/schema.sql) decide what anyone can read or change.
const SUPABASE_KEY = 'sb_publishable_bVfCqDdjlAHoxyzvC_J9JQ_nUXUqLFM';

const sb = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

let account = null;           // { id, email, friendCode }
let syncing = false, syncAgain = false, syncTimer = null;
let lastSynced = null, syncError = null;

// What each item looked like at the last successful sync, so we can
// tell which side changed it: { userId, logs: {id: json}, inv: {...}, profile: json }
const BASE_KEY = 'humidor.synced.v1';
function loadBase(userId) {
  try {
    const b = JSON.parse(localStorage.getItem(BASE_KEY));
    if (b && b.userId === userId) return b;
  } catch {}
  return { userId, logs: {}, inv: {}, profile: null };
}
function saveBase(b) {
  try { localStorage.setItem(BASE_KEY, JSON.stringify(b)); } catch {}
}

// Stable JSON (sorted keys) so the same data always compares equal,
// whatever order the database hands the keys back in
function canon(v) {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).filter(k => v[k] !== undefined).sort()
      .map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  }
  return JSON.stringify(v ?? null);
}

// Three-way merge of a list (logs or humidor) by id.
// Whichever side changed since the last sync wins; if both did, this device wins.
function mergeList(local, remoteRows, base) {
  const localById = Object.fromEntries(local.map(x => [x.id, x]));
  const remoteById = Object.fromEntries(remoteRows.map(r => [r.id, r]));
  const ids = new Set([...Object.keys(localById), ...Object.keys(remoteById), ...Object.keys(base)]);
  const merged = [], upserts = [], tombstones = [];
  for (const id of ids) {
    const l = localById[id];
    const r = remoteById[id];
    const lj = l ? canon(l) : undefined;
    const rj = r && !r.deleted ? canon(r.data) : undefined;
    const localChanged = lj !== base[id];
    const remoteChanged = rj !== base[id];
    if (localChanged && (!remoteChanged || l || !rj)) {
      if (l) { merged.push(l); if (lj !== rj) upserts.push(l); }
      else if (r && !r.deleted) tombstones.push(id);
    } else if (rj !== undefined) {
      merged.push(r.data);
    }
  }
  return { merged, upserts, tombstones };
}

const PROFILE_COLS = { name: 'name', location: 'location', since: 'since', favCigar: 'fav_cigar', pairing: 'pairing', strength: 'strength', wrapper: 'wrapper', bio: 'bio', featured: 'featured' };
const profileToRow = p => Object.fromEntries(Object.entries(PROFILE_COLS).map(([k, col]) => [col, k === 'featured' ? (p[k] || []) : (p[k] ?? null)]));
const rowToProfile = row => {
  const p = {};
  for (const [k, col] of Object.entries(PROFILE_COLS)) {
    if (row[col] !== null && row[col] !== undefined && !(Array.isArray(row[col]) && !row[col].length && k === 'featured')) p[k] = row[col];
  }
  return p;
};

async function syncNow() {
  if (!sb || !account) return;
  if (syncing) { syncAgain = true; return; }
  syncing = true;
  syncError = null;
  renderAccount();
  try {
    const uid = account.id;
    const base = loadBase(uid);
    const [logsRes, invRes, profRes, stateRes] = await Promise.all([
      sb.from('logs').select('id,data,deleted').eq('user_id', uid),
      sb.from('inventory').select('id,data,deleted').eq('user_id', uid),
      sb.from('profiles').select('*').eq('id', uid).single(),
      sb.from('user_state').select('*').eq('user_id', uid).single(),
    ]);
    for (const res of [logsRes, invRes, profRes, stateRes]) if (res.error) throw res.error;

    // Journal and humidor
    const L = mergeList(logs, logsRes.data, base.logs);
    const I = mergeList(inventory, invRes.data, base.inv);
    const logRows = [
      ...L.upserts.map(l => ({ user_id: uid, id: l.id, data: l, smoked_on: l.date || null, is_private: !!l.private, deleted: false })),
      ...L.tombstones.map(id => ({ user_id: uid, id, data: {}, deleted: true })),
    ];
    const invRows = [
      ...I.upserts.map(i => ({ user_id: uid, id: i.id, data: i, deleted: false })),
      ...I.tombstones.map(id => ({ user_id: uid, id, data: {}, deleted: true })),
    ];
    if (logRows.length) { const { error } = await sb.from('logs').upsert(logRows); if (error) throw error; }
    if (invRows.length) { const { error } = await sb.from('inventory').upsert(invRows); if (error) throw error; }

    // Profile: same rule, this device wins if both changed
    const remoteProfile = rowToProfile(profRes.data);
    const localJ = canon(profile), remoteJ = canon(remoteProfile);
    let mergedProfile = profile;
    if (localJ !== base.profile && localJ !== remoteJ) {
      const { error } = await sb.from('profiles').update(profileToRow(profile)).eq('id', uid);
      if (error) throw error;
    } else if (remoteJ !== base.profile) {
      mergedProfile = remoteProfile;
    }
    if (!profRes.data.age_confirmed_at && localStorage.getItem('humidor.age21')) {
      await sb.from('profiles').update({ age_confirmed_at: new Date().toISOString() }).eq('id', uid);
    }
    account.friendCode = profRes.data.friend_code;

    // Private state: keep everything either side has
    const st = stateRes.data;
    const mergedReviews = { ...(st.reviews || {}), ...reviews };
    const mergedEarned = { ...earned };
    for (const [k, t] of Object.entries(st.achievements || {})) {
      if (!mergedEarned[k] || t < mergedEarned[k]) mergedEarned[k] = t;
    }
    const mergedPeak = Math.max(humidorPeak, st.humidor_peak || 0);
    if (canon(mergedReviews) !== canon(st.reviews || {}) || canon(mergedEarned) !== canon(st.achievements || {}) || mergedPeak !== st.humidor_peak) {
      const { error } = await sb.from('user_state')
        .update({ reviews: mergedReviews, achievements: mergedEarned, humidor_peak: mergedPeak }).eq('user_id', uid);
      if (error) throw error;
    }

    // Apply merged results on this device (without triggering another sync)
    applyingRemote = true;
    logs = L.merged;
    inventory = I.merged;
    profile = mergedProfile;
    reviews = mergedReviews;
    earned = mergedEarned;
    humidorPeak = mergedPeak;
    try {
      localStorage.setItem(KEY, JSON.stringify(logs));
      localStorage.setItem(INV_KEY, JSON.stringify(inventory));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews));
      localStorage.setItem(ACH_KEY, JSON.stringify(earned));
      localStorage.setItem(PEAK_KEY, humidorPeak);
    } catch {}
    applyingRemote = false;

    saveBase({
      userId: uid,
      logs: Object.fromEntries(logs.map(l => [l.id, canon(l)])),
      inv: Object.fromEntries(inventory.map(i => [i.id, canon(i)])),
      profile: canon(profile),
    });
    lastSynced = Date.now();
    refreshCurrentView();
  } catch (e) {
    applyingRemote = false;
    syncError = e.message || String(e);
    console.warn('Sync failed', e);
  } finally {
    syncing = false;
    renderAccount();
    if (syncAgain) { syncAgain = false; scheduleSync(); }
  }
}

// Called after every local save; waits a moment so a burst of edits syncs once
let applyingRemote = false;
function scheduleSync() {
  if (!account || applyingRemote) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncNow, 1500);
}

// Re-draw whatever screen is open after new data arrives (without scrolling to the top)
function refreshCurrentView() {
  const active = document.querySelector('.view.active')?.id?.replace('view-', '');
  if (active === 'journal') renderJournal();
  if (active === 'recs') renderRecs();
  if (active === 'browse') renderBrowse();
  if (active === 'more') { renderProfile(); renderReviewSummary(); }
  if (active === 'friends' && typeof renderFriends === 'function') renderFriends();
}

// ---------- Sign in / sign up ----------

async function setAccount(session) {
  const user = session?.user;
  const changed = account?.id !== user?.id;
  if (changed && typeof friendsCache !== 'undefined') friendsCache = null;
  if (!user) { account = null; renderAccount(); refreshCurrentView(); return; }
  account = { id: user.id, email: user.email, friendCode: account?.friendCode };
  renderAccount();
  if (changed) { refreshCurrentView(); syncNow(); }
}

function openAuthForm(mode = 'signin') {
  const signup = mode === 'signup';
  $('#sheet-body').innerHTML = `
    <div class="seg" style="margin-bottom:16px">
      <button type="button" data-mode="signin" class="${signup ? '' : 'on'}">Sign in</button>
      <button type="button" data-mode="signup" class="${signup ? 'on' : ''}">Create account</button>
    </div>
    <label class="field"><span>Email</span><input type="email" id="a-email" autocomplete="email" inputmode="email" placeholder="you@example.com"></label>
    <label class="field"><span>Password</span><input type="password" id="a-pass" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="${signup ? 'At least 8 characters' : ''}"></label>
    ${signup ? `
      <label class="toggle field"><input type="checkbox" id="a-age"> <span style="margin:0;color:var(--text)">I'm 21 or older</span></label>
      <p class="muted" style="font-size:13px;margin:0 0 12px">Your journal stays on this phone and is backed up to your account. Followers only see what you share. <a href="privacy.html" target="_blank" style="color:var(--accent)">Privacy policy</a></p>` : ''}
    <div class="btn-row">
      <button class="btn ghost" data-act="close">Cancel</button>
      <button class="btn" data-act="go">${signup ? 'Create account' : 'Sign in'}</button>
    </div>`;
  $('#sheet-body').onclick = async e => {
    const m = e.target.closest('[data-mode]');
    if (m) return openAuthForm(m.dataset.mode);
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') return closeSheet();
    if (act !== 'go') return;
    const email = $('#a-email').value.trim();
    const password = $('#a-pass').value;
    if (!email || !password) return toast('Enter your email and password');
    if (signup && password.length < 8) return toast('Use at least 8 characters');
    if (signup && !$('#a-age').checked) return toast('You must be 21 or older');
    const btn = e.target.closest('[data-act]');
    btn.disabled = true;
    btn.textContent = signup ? 'Creating…' : 'Signing in…';
    const { data, error } = signup
      ? await sb.auth.signUp({ email, password })
      : await sb.auth.signInWithPassword({ email, password });
    if (error) {
      btn.disabled = false;
      btn.textContent = signup ? 'Create account' : 'Sign in';
      return toast(friendlyAuthError(error));
    }
    if (signup) { try { localStorage.setItem('humidor.age21', '1'); } catch {} }
    if (!data.session) { closeSheet(); return toast('Check your email to confirm your account'); }
    closeSheet();
    toast(signup ? 'Account created. Backing up your journal…' : 'Signed in. Syncing…');
  };
  $('#sheet').classList.add('open');
  setTimeout(() => $('#a-email')?.focus(), 50);
}

function friendlyAuthError(error) {
  const m = (error.message || '').toLowerCase();
  if (m.includes('invalid login')) return 'Wrong email or password';
  if (m.includes('already registered')) return 'That email already has an account. Try Sign in';
  if (m.includes('rate limit')) return 'Too many tries. Wait a minute and try again';
  if (m.includes('fetch') || m.includes('network')) return "Can't reach the server. Check your connection";
  return error.message;
}

async function signOut() {
  if (!confirm('Sign out? Your journal stays on this phone. It just stops syncing until you sign in again.')) return;
  await syncNow();
  await sb.auth.signOut();
  try { localStorage.removeItem(BASE_KEY); } catch {}
  account = null;
  renderAccount();
  toast('Signed out');
}

// ---------- Account card (top of Profile) ----------

function renderAccount() {
  const el = $('#account');
  if (!el) return;
  if (!sb) {
    el.innerHTML = '';
    return;
  }
  if (!account) {
    el.innerHTML = `
      <div class="card">
        <div class="card-title">Back up your journal</div>
        <p class="muted" style="margin:6px 0 12px">Create a free account to keep your journal safe, use it on more than one device, and get a friend code.</p>
        <div class="btn-row" style="margin-top:0">
          <button class="btn small ghost" data-act="signin">Sign in</button>
          <button class="btn small" data-act="signup">Create account</button>
        </div>
      </div>`;
    return;
  }
  const status = syncing ? 'Syncing…'
    : syncError ? `Couldn't sync: ${syncError}`
    : lastSynced ? `Synced ${new Date(lastSynced).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : 'Waiting to sync';
  el.innerHTML = `
    <div class="card">
      <div class="row">
        <div style="min-width:0">
          <div class="card-title">Your account</div>
          <div class="card-sub" style="overflow:hidden;text-overflow:ellipsis">${esc(account.email)}</div>
        </div>
        ${account.friendCode ? `<div style="text-align:right"><div class="mini-label" style="margin:0">Friend code</div><div class="card-title" style="letter-spacing:1px">${esc(account.friendCode)}</div></div>` : ''}
      </div>
      <p class="muted" style="font-size:13px;margin:10px 0 12px;${syncError ? 'color:var(--danger)' : ''}">${esc(status)}</p>
      <div class="btn-row" style="margin-top:0">
        <button class="btn small ghost" data-act="signout">Sign out</button>
        <button class="btn small" data-act="sync" ${syncing ? 'disabled' : ''}>Sync now</button>
      </div>
      <button class="btn small ghost block" data-act="delete-account" style="margin-top:10px;border:none;color:var(--danger)">Delete my account</button>
    </div>`;
}

// Permanently removes the account and everything stored in it (journal,
// humidor, profile, badges, follows). The copy on this phone is the user's choice.
async function deleteAccount() {
  if (!confirm('Delete your account? This permanently removes your account and everything backed up in it: journal, humidor, profile, badges and friends. It cannot be undone.')) return;
  const typed = prompt('To confirm, type DELETE');
  if ((typed || '').trim().toUpperCase() !== 'DELETE') return toast('Account not deleted');
  const { error } = await sb.rpc('delete_my_account');
  if (error) return toast("Couldn't delete your account. Check your connection");
  const wipe = confirm('Your account is deleted. Also erase your journal from this phone? Choose Cancel to keep it here, offline.');
  try { await sb.auth.signOut({ scope: 'local' }); } catch {}
  try { localStorage.removeItem(BASE_KEY); } catch {}
  account = null;
  if (wipe) {
    applyingRemote = true;
    logs = []; inventory = []; profile = {}; reviews = {}; earned = {}; humidorPeak = 0;
    for (const k of [KEY, INV_KEY, PROFILE_KEY, REVIEW_KEY, ACH_KEY, PEAK_KEY]) {
      try { localStorage.removeItem(k); } catch {}
    }
    applyingRemote = false;
  }
  renderAccount();
  refreshCurrentView();
  toast(wipe ? 'Account and data deleted' : 'Account deleted. Your journal stays on this phone');
}

if ($('#account')) {
  $('#account').addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'signin') openAuthForm('signin');
    if (act === 'signup') openAuthForm('signup');
    if (act === 'signout') signOut();
    if (act === 'sync') syncNow();
    if (act === 'delete-account') deleteAccount();
  });
}

// ---------- Start ----------
if (sb) {
  sb.auth.onAuthStateChange((_event, session) => setAccount(session));
  sb.auth.getSession().then(({ data }) => setAccount(data.session));
  // Catch up when the app comes back to the foreground or back online
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleSync(); });
  window.addEventListener('online', scheduleSync);
}
renderAccount();

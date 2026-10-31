// ============================================================
//  Friends: follow people by friend code, see what they smoke
//  Following is one-way: entering someone's code lets you see what
//  they share. They see yours only if they enter your code too.
// ============================================================

let friendsCache = null;   // { following: [person], followers: [person] }
let feedCache = null;      // [{ person, log }]
let friendsLoading = false;
let friendsSeg = 'feed';

const APP_URL = 'https://kijaklandon.github.io/humidor-journal/';
const personName = p => p.name || p.friend_code || 'Cigar friend';
const initialsOf = name => (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
const personAvatar = (p, size = 40) =>
  `<div class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * .4)}px">${esc(initialsOf(p.name) || '•')}</div>`;

// Codes look like MW-7K3Q9. Accept "7k3q9", "mw 7k3q9", and old "HJ-" codes from
// when the app was called Humidor Journal (same letters, new prefix).
function normalizeCode(raw) {
  const c = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return 'MW-' + (/^(MW|HJ)/.test(c) ? c.slice(2) : c);
}

// ---------- Loading ----------

async function loadFriends() {
  const uid = account.id;
  const { data: rows, error } = await sb.from('follows')
    .select('follower,following,created_at')
    .or(`follower.eq.${uid},following.eq.${uid}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const ids = [...new Set(rows.map(r => r.follower === uid ? r.following : r.follower))];
  let people = {};
  if (ids.length) {
    const { data, error: e2 } = await sb.from('profiles').select('id,name,friend_code,location').in('id', ids);
    if (e2) throw e2;
    people = Object.fromEntries(data.map(p => [p.id, p]));
  }
  const person = id => people[id] || { id, name: null, friend_code: '' };
  // Blocked people's profiles are hidden from us, so their names are remembered on this device
  const { data: blocks, error: e3 } = await sb.from('blocks').select('blocked').eq('blocker', uid);
  if (e3) throw e3;
  const names = blockedNames();
  return {
    following: rows.filter(r => r.follower === uid).map(r => person(r.following)),
    followers: rows.filter(r => r.following === uid).map(r => person(r.follower)),
    blocked: blocks.map(b => ({ id: b.blocked, name: names[b.blocked] || 'Blocked user' })),
  };
}

const BLOCKED_KEY = 'humidor.blockedNames.v1';
function blockedNames() {
  try { return JSON.parse(localStorage.getItem(BLOCKED_KEY)) || {}; } catch { return {}; }
}
function rememberBlocked(id, name) {
  try { localStorage.setItem(BLOCKED_KEY, JSON.stringify({ ...blockedNames(), [id]: name })); } catch {}
}

// Latest shared smokes from everyone you follow (the database hides private ones)
async function loadFeed(following) {
  if (!following.length) return [];
  const { data, error } = await sb.from('logs')
    .select('user_id,data,smoked_on,updated_at')
    .in('user_id', following.map(p => p.id))
    .eq('deleted', false).eq('is_private', false)
    .order('smoked_on', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })
    .limit(60);
  if (error) throw error;
  const byId = Object.fromEntries(following.map(p => [p.id, p]));
  return data.map(r => ({ person: byId[r.user_id] || { id: r.user_id }, log: r.data }));
}

async function renderFriends() {
  const el = $('#friends');
  if (!el) return;
  if (!sb) {
    el.innerHTML = '<div class="card"><p class="muted" style="margin:0">Friends need an internet connection. Try again when you\'re back online.</p></div>';
    return;
  }
  if (!account) {
    el.innerHTML = `
      <div class="card">
        <div class="card-title">See what your friends are smoking</div>
        <p class="muted" style="margin:6px 0 12px">Create a free account to get your own friend code and follow friends by theirs.</p>
        <div class="btn-row" style="margin-top:0">
          <button class="btn small ghost" data-act="signin">Sign in</button>
          <button class="btn small" data-act="signup">Create account</button>
        </div>
      </div>`;
    return;
  }
  el.innerHTML = friendsHtml();
  if (friendsLoading) return;
  friendsLoading = true;
  try {
    friendsCache = await loadFriends();
    feedCache = await loadFeed(friendsCache.following);
  } catch (e) {
    console.warn('Could not load friends', e);
    toast("Couldn't load friends. Check your connection");
  }
  friendsLoading = false;
  // Only redraw if they're still on the Friends tab
  if ($('#view-friends').classList.contains('active')) el.innerHTML = friendsHtml();
}

// ---------- Friends tab ----------

function friendsHtml() {
  return `
    <div class="seg">
      <button type="button" data-seg="feed" class="${friendsSeg === 'feed' ? 'on' : ''}">Feed</button>
      <button type="button" data-seg="people" class="${friendsSeg === 'people' ? 'on' : ''}">People</button>
    </div>
    ${friendsSeg === 'feed' ? feedHtml() : peopleHtml()}`;
}

function feedHtml() {
  if (!friendsCache || !feedCache) return '<p class="muted">Loading…</p>';
  if (!friendsCache.following.length) {
    return `
      <div class="empty card">
        <h2>Your feed is empty</h2>
        <p class="muted">Follow friends with their friend code to see what they're smoking.</p>
        <button class="btn" data-seg="people">Add a friend</button>
      </div>`;
  }
  if (!feedCache.length) {
    return `<div class="card"><p class="muted" style="margin:0">No smokes yet from the people you follow. Check back after their next cigar.</p></div>`;
  }
  return feedCache.map(({ person, log: l }, i) => `
    <div class="card tap" data-feed="${i}">
      <div class="row" style="justify-content:flex-start;gap:10px">
        <span data-person="${person.id}">${personAvatar(person, 36)}</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:650" data-person="${person.id}">${esc(personName(person))}</div>
          <div class="card-sub">${fmtDate(l.date)}</div>
        </div>
        ${starsHtml(l.rating || 0)}
      </div>
      <div class="card-title" style="margin-top:10px">${esc(l.name)}</div>
      <div class="card-sub">${esc([l.brand, l.wrapper, STRENGTHS[l.strength - 1]].filter(Boolean).join(' · '))}</div>
      ${l.notes?.length ? `<div class="chips">${l.notes.slice(0, 5).map(n => `<span class="chip">${esc(n)}</span>`).join('')}</div>` : ''}
      ${l.enjoyed ? `<div class="muted" style="font-size:14px;margin-top:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(l.enjoyed)}</div>` : ''}
    </div>`).join('') + `<button class="btn small ghost block" data-act="refresh" style="margin-top:4px">Refresh</button>`;
}

function personRow(p, action, label) {
  return `
    <div class="ach-row">
      <span data-person="${p.id}" style="cursor:pointer">${personAvatar(p)}</span>
      <div class="grow" data-person="${p.id}" style="cursor:pointer">
        <div class="ach-title">${esc(personName(p))}</div>
        <div class="ach-desc">${esc([p.location, p.name ? p.friend_code : ''].filter(Boolean).join(' · '))}</div>
      </div>
      <button class="btn small ghost" data-act="${action}" data-id="${p.id}" data-name="${esc(personName(p))}">${label}</button>
    </div>`;
}

function peopleHtml() {
  const f = friendsCache;
  const list = (people, action, label, empty) => !f
    ? '<p class="muted" style="margin:0">Loading…</p>'
    : people.length ? people.map(p => personRow(p, action, label)).join('') : `<p class="muted" style="margin:0">${empty}</p>`;
  return `
    <div class="card">
      <div class="card-title">Add a friend</div>
      <p class="muted" style="margin:4px 0 10px;font-size:14px">Enter their friend code to follow them.</p>
      <div style="display:flex;gap:8px">
        <input type="text" id="fr-code" placeholder="MW-7K3Q9" autocapitalize="characters" autocomplete="off" spellcheck="false" style="text-transform:uppercase;letter-spacing:1px">
        <button class="btn" data-act="follow" style="flex:none">Follow</button>
      </div>
    </div>
    <div class="card">
      <div class="row">
        <div>
          <div class="mini-label" style="margin:0">Your friend code</div>
          <div class="card-title" style="font-size:22px;letter-spacing:2px">${esc(account.friendCode || '…')}</div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn small ghost" data-act="copy">Copy</button>
          <button class="btn small" data-act="share">Share</button>
        </div>
      </div>
    </div>
    <h3>Following${f ? ' · ' + f.following.length : ''}</h3>
    <div class="card">${list(f?.following, 'unfollow', 'Unfollow', "You're not following anyone yet. Add a friend's code above.")}</div>
    <h3>Followers${f ? ' · ' + f.followers.length : ''}</h3>
    <div class="card">${list(f?.followers, 'remove', 'Remove', 'No followers yet. Share your code so friends can follow you.')}</div>
    ${f?.blocked.length ? `
      <h3>Blocked · ${f.blocked.length}</h3>
      <div class="card">${f.blocked.map(p => `
        <div class="ach-row">
          <div class="grow"><div class="ach-title">${esc(p.name)}</div></div>
          <button class="btn small ghost" data-act="unblock" data-id="${p.id}" data-name="${esc(p.name)}">Unblock</button>
        </div>`).join('')}
      </div>` : ''}`;
}

// ---------- A friend's log ----------

// Prefer the vault's entry so wrapper, strength and flavors are complete
const vaultOrLog = l => CATALOG.find(c => fullName(c).toLowerCase() === `${l.brand} ${l.name}`.trim().toLowerCase())
  || { n: l.name, b: l.brand || '', w: l.wrapper || 'Other', o: l.origin || 'Other', s: l.strength || 3, notes: l.notes || [] };

function openFriendLog(person, l, back) {
  $('#sheet-body').innerHTML = `
    <div class="row" style="justify-content:flex-start;gap:10px;margin-bottom:10px">
      <span data-person="${person.id}">${personAvatar(person, 32)}</span>
      <div style="flex:1" data-person="${person.id}"><b>${esc(personName(person))}</b><div class="card-sub">${fmtDate(l.date)}</div></div>
    </div>
    <div class="row"><h2 style="margin:0">${esc(l.name)}</h2>${starsHtml(l.rating || 0)}</div>
    <div class="card-sub">${esc(l.brand || '')}</div>
    <dl class="kv">
      ${l.wrapper ? `<dt>Wrapper</dt><dd>${esc(l.wrapper)}</dd>` : ''}
      ${l.origin ? `<dt>Country</dt><dd>${esc(l.origin)}</dd>` : ''}
      ${l.strength ? `<dt>Strength</dt><dd>${STRENGTHS[l.strength - 1]}</dd>` : ''}
      ${l.size ? `<dt>Size</dt><dd>${esc(l.size)}</dd>` : ''}
      ${l.pairing ? `<dt>Paired with</dt><dd>${esc(l.pairing)}</dd>` : ''}
      ${l.again ? `<dt>Again?</dt><dd>Would smoke again</dd>` : ''}
    </dl>
    ${l.notes?.length ? `<div class="chips" style="margin-bottom:12px">${l.notes.map(n => `<span class="chip">${esc(n)}</span>`).join('')}</div>` : ''}
    ${l.enjoyed ? `<div class="quote">${esc(l.enjoyed)}</div>` : ''}
    ${detailHtml(l.detail)}
    <div class="btn-row" style="margin-top:16px">
      <button class="btn ghost" data-act="own">Add to humidor</button>
      <button class="btn" data-act="log">Log this cigar</button>
    </div>
    <button class="btn ghost block" data-act="${back ? 'back' : 'close'}" style="margin-top:10px">${back ? 'Back' : 'Close'}</button>`;
  $('#sheet-body').onclick = e => {
    if (e.target.closest('[data-person]')) return openFriendProfile(person.id);
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') return closeSheet();
    if (act === 'back') return back();
    if (act === 'log') { closeSheet(); resetForm(vaultOrLog(l)); show('add'); }
    if (act === 'own') openInvForm(null, vaultOrLog(l));
  };
  $('#sheet').classList.add('open');
}

// ---------- A friend's profile ----------

// Work out a friend's stats and badges with the same rules as yours,
// by briefly pointing the stat functions at their data
function withFriendData(fLogs, fInv, fn) {
  const saved = { logs, inventory, earned, humidorPeak, reviews };
  logs = fLogs; inventory = fInv; earned = {}; humidorPeak = 0; reviews = {};
  try { return fn(); } finally { ({ logs, inventory, earned, humidorPeak, reviews } = saved); }
}

async function openFriendProfile(id) {
  $('#sheet-body').innerHTML = '<p class="muted">Loading…</p>';
  $('#sheet-body').onclick = null;
  $('#sheet').classList.add('open');
  const [profRes, logsRes, invRes] = await Promise.all([
    sb.from('profiles').select('*').eq('id', id).single(),
    sb.from('logs').select('data').eq('user_id', id).eq('deleted', false).eq('is_private', false),
    sb.from('inventory').select('data').eq('user_id', id).eq('deleted', false),
  ]);
  if (profRes.error) { closeSheet(); return toast("Couldn't load their profile"); }
  const p = profRes.data;
  const fLogs = (logsRes.data || []).map(r => r.data)
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.created || 0) - (a.created || 0));
  const fInv = (invRes.data || []).map(r => r.data);

  const view = withFriendData(fLogs, fInv, () => {
    const levels = Object.fromEntries(TRACKS.map(t => [t.id, badgeLevel(t)]));
    const featuredIds = (p.featured || []).filter(tid => levels[tid]);
    // No picks yet? Show their three best instead
    const show = featuredIds.length ? featuredIds : rankedBadges().filter(t => levels[t.id]).slice(0, 3).map(t => t.id);
    return {
      badges: show.map(tid => TRACKS.find(t => t.id === tid)).map(t => `
        <div class="badge-tile">
          ${medal(t, levels[t.id], 48)}
          <div class="badge-name">${t.name}</div>
          <div class="badge-tier" style="color:${TIERS[levels[t.id] - 1].color}">${TIERS[levels[t.id] - 1].name}</div>
        </div>`).join(''),
      badgeCount: Object.values(levels).filter(Boolean).length,
      brands: brandCount(),
      countries: countryCount(),
      avg: fLogs.length ? (fLogs.reduce((s, l) => s + (l.rating || 0), 0) / fLogs.length).toFixed(1) : '–',
      inHumidor: invTotal(),
    };
  });

  const following = friendsCache?.following.some(f => f.id === id);
  const sub = [p.location, p.since ? `Smoking since ${p.since}` : ''].filter(Boolean).join(' · ');
  const favs = [
    p.fav_cigar && `Favorite: ${p.fav_cigar}`,
    p.pairing && `Pairs with: ${p.pairing}`,
    p.strength && `Likes: ${STRENGTHS[p.strength - 1]}`,
    p.wrapper && `Wrapper: ${p.wrapper}`,
  ].filter(Boolean);
  const reopen = () => openFriendProfile(id);

  $('#sheet-body').innerHTML = `
    <div class="row" style="justify-content:flex-start;gap:14px">
      ${personAvatar(p, 56)}
      <div style="flex:1;min-width:0">
        <div class="card-title" style="font-size:20px">${esc(personName(p))}</div>
        <div class="card-sub">${esc(sub || p.friend_code || '')}</div>
      </div>
    </div>
    ${p.bio ? `<p style="margin:12px 0 0">${esc(p.bio)}</p>` : ''}
    ${favs.length ? `<div class="chips">${favs.map(f => `<span class="chip">${esc(f)}</span>`).join('')}</div>` : ''}
    ${view.badges ? `<div class="featured">${view.badges}</div>` : ''}
    <div class="stats six" style="margin-top:14px">
      <div class="stat"><b>${fLogs.length}</b><small>Smoked</small></div>
      <div class="stat"><b>${view.brands}</b><small>Brands</small></div>
      <div class="stat"><b>${view.countries}</b><small>Countries</small></div>
      <div class="stat"><b>${view.avg}</b><small>Avg rating</small></div>
      <div class="stat"><b>${view.inHumidor}</b><small>In humidor</small></div>
      <div class="stat"><b>${view.badgeCount}</b><small>Badges</small></div>
    </div>
    <h3>Recent smokes</h3>
    ${fLogs.length ? fLogs.slice(0, 15).map((l, i) => `
      <div class="ach-row" data-flog="${i}" style="cursor:pointer">
        <div class="grow">
          <div class="ach-title">${esc(l.name)}</div>
          <div class="ach-desc">${esc([l.brand, fmtDate(l.date)].filter(Boolean).join(' · '))}</div>
        </div>
        ${starsHtml(l.rating || 0)}
      </div>`).join('') : '<p class="muted">Nothing shared yet.</p>'}
    <h3>Humidor${fInv.length ? ' · ' + view.inHumidor : ''}</h3>
    ${fInv.length ? fInv.map(item => `
      <div class="ach-row">
        <div class="grow">
          <div class="ach-title">${esc(item.name)}</div>
          <div class="ach-desc">${esc([item.brand, item.size].filter(Boolean).join(' · '))}</div>
        </div>
        <span class="badge">×${item.qty}</span>
      </div>`).join('') : '<p class="muted">Their humidor is empty.</p>'}
    <div class="btn-row" style="margin-top:18px">
      ${following ? `<button class="btn ghost" data-act="unfollow">Unfollow</button>` : ''}
      <button class="btn danger" data-act="block">Block</button>
      <button class="btn ghost" data-act="close">Close</button>
    </div>`;
  $('#sheet-body').onclick = async e => {
    const row = e.target.closest('[data-flog]');
    if (row) return openFriendLog(p, fLogs[+row.dataset.flog], reopen);
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') return closeSheet();
    if (act === 'unfollow') {
      if (!confirm(`Unfollow ${personName(p)}?`)) return;
      const { error } = await sb.from('follows').delete().eq('follower', account.id).eq('following', id);
      if (error) return toast("Couldn't update. Check your connection");
      closeSheet();
      toast(`Unfollowed ${personName(p)}`);
      renderFriends();
    }
    if (act === 'block') {
      if (!confirm(`Block ${personName(p)}? You'll stop following each other, and they won't be able to follow you or see anything you share.`)) return;
      const { error } = await sb.rpc('block_user', { target: id });
      if (error) return toast("Couldn't block. Check your connection");
      rememberBlocked(id, personName(p));
      closeSheet();
      toast(`Blocked ${personName(p)}`);
      renderFriends();
    }
  };
}

// ---------- Actions ----------

async function followCode() {
  const raw = $('#fr-code').value.trim();
  if (!raw) return toast('Enter a friend code');
  const code = normalizeCode(raw);
  const { data, error } = await sb.rpc('follow_by_code', { code });
  if (error) {
    const m = error.message || '';
    return toast(m.includes('own code') ? "That's your own code" : m.includes('No one') ? 'No one has that friend code' : "Couldn't follow. Check your connection");
  }
  const who = data?.[0]?.friend_name || code;
  toast(`Now following ${who}`);
  $('#fr-code').value = '';
  renderFriends();
}

async function shareCode() {
  const code = account?.friendCode;
  if (!code) return toast('Your code is still loading');
  const text = `Follow me on MyWrap! My friend code is ${code}`;
  if (navigator.share) {
    try { await navigator.share({ title: 'MyWrap', text, url: APP_URL }); } catch {}
  } else {
    copyText(`${text} ${APP_URL}`);
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = document.createElement('textarea');
    t.value = text;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    t.remove();
  }
  toast('Copied');
}

$('#friends').addEventListener('click', async e => {
  const seg = e.target.closest('[data-seg]');
  if (seg) { friendsSeg = seg.dataset.seg; $('#friends').innerHTML = friendsHtml(); return; }
  const who = e.target.closest('[data-person]');
  if (who) return openFriendProfile(who.dataset.person);
  const card = e.target.closest('[data-feed]');
  if (card) { const item = feedCache[+card.dataset.feed]; return openFriendLog(item.person, item.log); }
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act === 'signin') return openAuthForm('signin');
  if (act === 'signup') return openAuthForm('signup');
  if (act === 'follow') return followCode();
  if (act === 'share') return shareCode();
  if (act === 'copy') return copyText(account.friendCode);
  if (act === 'refresh') return renderFriends();
  if (act === 'unblock') {
    if (!confirm(`Unblock ${b.dataset.name}? They'll be able to follow you again with your code.`)) return;
    const { error } = await sb.from('blocks').delete().eq('blocker', account.id).eq('blocked', b.dataset.id);
    if (error) return toast("Couldn't update. Check your connection");
    toast(`Unblocked ${b.dataset.name}`);
    return renderFriends();
  }
  if (act === 'unfollow' || act === 'remove') {
    const name = b.dataset.name;
    const msg = act === 'unfollow'
      ? `Unfollow ${name}? You'll stop seeing what they smoke.`
      : `Remove ${name} as a follower? They'll stop seeing what you smoke.`;
    if (!confirm(msg)) return;
    const q = sb.from('follows').delete();
    const { error } = act === 'unfollow'
      ? await q.eq('follower', account.id).eq('following', b.dataset.id)
      : await q.eq('follower', b.dataset.id).eq('following', account.id);
    if (error) return toast("Couldn't update. Check your connection");
    toast(act === 'unfollow' ? `Unfollowed ${name}` : `Removed ${name}`);
    renderFriends();
  }
});
$('#friends').addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'fr-code') followCode();
});

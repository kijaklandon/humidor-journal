// ============================================================
//  Friends: follow people by friend code
//  Following is one-way: entering someone's code lets you see what
//  they share. They see yours only if they enter your code too.
// ============================================================

let friendsCache = null;   // { following: [person], followers: [person] }
let friendsLoading = false;

const APP_URL = 'https://kijaklandon.github.io/humidor-journal/';
const personName = p => p.name || p.friend_code || 'Cigar friend';

// Codes look like HJ-7K3Q9. Accept "7k3q9", "hj 7k3q9", etc.
function normalizeCode(raw) {
  const c = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return 'HJ-' + (c.startsWith('HJ') ? c.slice(2) : c);
}

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
  return {
    following: rows.filter(r => r.follower === uid).map(r => person(r.following)),
    followers: rows.filter(r => r.following === uid).map(r => person(r.follower)),
  };
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
  } catch (e) {
    console.warn('Could not load friends', e);
    toast("Couldn't load friends. Check your connection");
  }
  friendsLoading = false;
  // Only redraw if they're still on the Friends tab
  if ($('#view-friends').classList.contains('active')) el.innerHTML = friendsHtml();
}

function personRow(p, action, label) {
  return `
    <div class="ach-row">
      <div class="avatar" style="width:40px;height:40px;font-size:16px">${esc(initialsOf(p.name) || '•')}</div>
      <div class="grow">
        <div class="ach-title">${esc(personName(p))}</div>
        <div class="ach-desc">${esc([p.location, p.name ? p.friend_code : ''].filter(Boolean).join(' · '))}</div>
      </div>
      <button class="btn small ghost" data-act="${action}" data-id="${p.id}" data-name="${esc(personName(p))}">${label}</button>
    </div>`;
}
const initialsOf = name => (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

function friendsHtml() {
  const f = friendsCache;
  const list = (people, action, label, empty) => !f
    ? '<p class="muted" style="margin:0">Loading…</p>'
    : people.length ? people.map(p => personRow(p, action, label)).join('') : `<p class="muted" style="margin:0">${empty}</p>`;
  return `
    <div class="card">
      <div class="card-title">Add a friend</div>
      <p class="muted" style="margin:4px 0 10px;font-size:14px">Enter their friend code to follow them.</p>
      <div style="display:flex;gap:8px">
        <input type="text" id="fr-code" placeholder="HJ-7K3Q9" autocapitalize="characters" autocomplete="off" spellcheck="false" style="text-transform:uppercase;letter-spacing:1px">
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
    <p class="muted" style="font-size:13px;text-align:center;margin:16px 0 0">Coming next: a feed of what the people you follow are smoking.</p>`;
}

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
  const text = `Follow me on Humidor Journal! My friend code is ${code}`;
  if (navigator.share) {
    try { await navigator.share({ title: 'Humidor Journal', text, url: APP_URL }); } catch {}
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
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act === 'signin') return openAuthForm('signin');
  if (act === 'signup') return openAuthForm('signup');
  if (act === 'follow') return followCode();
  if (act === 'share') return shareCode();
  if (act === 'copy') return copyText(account.friendCode);
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

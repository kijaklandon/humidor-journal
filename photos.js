// ============================================================
//  Cigar photos (one per log)
//  The photo is shrunk on the phone, kept on this device (IndexedDB)
//  and, when signed in, uploaded to the private "photos" bucket as
//  <user id>/<log id>-<version>.jpg. A log's `photo` field holds the
//  version, so a replaced photo gets a new file name.
// ============================================================

const PHOTO_BUCKET = 'photos';
const PHOTO_MAX = 1280;              // longest side, in pixels
const PHOTO_UP_KEY = 'mywrap.photosUp.v1';      // { userId, done: { logId: version } } uploaded from here
const PHOTO_DEL_KEY = 'mywrap.photosDelete.v1'; // ["<log id>-<version>", …] to remove from the cloud

// ---------- On this device (IndexedDB: logId -> { ver, blob }) ----------
let photoDbOpen;
function photoDb() {
  photoDbOpen ||= new Promise((resolve, reject) => {
    const req = indexedDB.open('mywrap', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('photos');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return photoDbOpen;
}
async function photoStore(mode, fn) {
  const db = await photoDb();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction('photos', mode).objectStore('photos'));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
const photoGet = id => photoStore('readonly', s => s.get(id)).catch(() => null);
const photoPut = (id, rec) => photoStore('readwrite', s => s.put(rec, id));
const photoDel = id => photoStore('readwrite', s => s.delete(id)).catch(() => {});

// ---------- Shrink a picked photo to a small JPEG ----------
// `square` crops to the middle square first (for profile photos)
async function shrinkPhoto(file, max = PHOTO_MAX, square = false) {
  const src = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Not an image'));
      i.src = src;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sw = square ? side : img.naturalWidth, sh = square ? side : img.naturalHeight;
    const k = Math.min(1, max / Math.max(sw, sh));
    const c = document.createElement('canvas');
    c.width = Math.round(sw * k);
    c.height = Math.round(sh * k);
    c.getContext('2d').drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, c.width, c.height);
    return await new Promise(resolve => c.toBlob(resolve, 'image/jpeg', 0.82));
  } finally {
    URL.revokeObjectURL(src);
  }
}

// ---------- Showing photos ----------
// Pages render <img data-ph-id data-ph-ver data-ph-owner>; this fills in the picture
const photoUrlCache = {};   // "owner/id-ver" -> { url, until }
// sync.js loads after the first screen is drawn, so the account may not exist yet
const currentAccount = () => (typeof account !== 'undefined' ? account : null);
async function photoUrl(id, ver, owner) {
  const acct = currentAccount();
  const mine = !owner || owner === acct?.id;
  const key = `${owner || 'me'}/${id}-${ver}`;
  const hit = photoUrlCache[key];
  if (hit && hit.until > Date.now()) return hit.url;
  let url = null, until = Infinity;
  if (mine) {
    const rec = await photoGet(id);
    if (rec?.ver === ver) url = URL.createObjectURL(rec.blob);
  }
  if (!url && typeof sb !== 'undefined' && sb && acct) {
    const { data } = await sb.storage.from(PHOTO_BUCKET).createSignedUrl(`${owner || acct.id}/${id}-${ver}.jpg`, 3600);
    url = data?.signedUrl || null;
    until = Date.now() + 50 * 60 * 1000;
  }
  if (url) photoUrlCache[key] = { url, until };
  return url;
}

function photoImg(log, owner, cls = '') {
  if (!log?.photo) return '';
  return `<div class="photo ${cls}"><img alt="" data-ph-id="${esc(log.id)}" data-ph-ver="${esc(log.photo)}" data-ph-owner="${esc(owner || '')}"></div>`;
}

// ---------- Profile photo ----------
// Stored like a cigar photo under the id "avatar" (<user id>/avatar-<version>.jpg);
// profile.avatar holds the version. The picture sits on top of the initials, so
// the initials still show if it can't load.
const AVATAR_ID = 'avatar';
const AVATAR_MAX = 512;
const avatarImg = (ver, owner) => ver
  ? `<img alt="" data-ph-id="${AVATAR_ID}" data-ph-ver="${esc(ver)}" data-ph-owner="${esc(owner || '')}">` : '';

async function hydratePhoto(img) {
  img.dataset.phDone = '1';
  const url = await photoUrl(img.dataset.phId, img.dataset.phVer, img.dataset.phOwner || null).catch(() => null);
  if (!url) { img.closest('.photo')?.remove(); return; }
  img.onload = () => img.classList.add('ok');
  img.onerror = () => img.closest('.photo')?.remove();
  img.src = url;
}
new MutationObserver(() => {
  document.querySelectorAll('img[data-ph-id]:not([data-ph-done])').forEach(hydratePhoto);
}).observe(document.body, { childList: true, subtree: true });

// ---------- The photo picker on the log form ----------
// { ver } = keep the saved photo, { blob, url } = new one picked, {} = none
let formPhoto = {};
function setFormPhoto(p) {
  formPhoto = p;
  renderPhotoInput();
}
function renderPhotoInput() {
  const el = document.getElementById('f-photo');
  if (!el) return;
  const has = formPhoto.blob || formPhoto.ver;
  el.innerHTML = has ? `
    <div class="photo photo-edit"><img alt="" id="f-photo-img"></div>
    <div class="btn-row" style="margin-top:8px">
      <button type="button" class="btn small ghost" data-ph="remove">Remove</button>
      <button type="button" class="btn small ghost" data-ph="pick">Change photo</button>
    </div>` : `
    <button type="button" class="btn ghost block" data-ph="pick">Add a photo</button>`;
  if (!has) return;
  const img = document.getElementById('f-photo-img');
  img.onload = () => img.classList.add('ok');
  if (formPhoto.url) img.src = formPhoto.url;
  else photoUrl(formPhoto.id, formPhoto.ver, null).then(u => { if (u && formPhoto.ver) img.src = u; });
}
document.getElementById('f-photo')?.addEventListener('click', e => {
  const act = e.target.closest('[data-ph]')?.dataset.ph;
  if (act === 'pick') document.getElementById('f-photo-input').click();
  if (act === 'remove') setFormPhoto({});
});
document.getElementById('f-photo-input')?.addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const blob = await shrinkPhoto(file);
    setFormPhoto({ blob, url: URL.createObjectURL(blob) });
  } catch {
    toast("Couldn't open that photo. Try another one");
  }
});

// Called when a log is saved. Returns the log's photo version (or undefined).
function commitFormPhoto(logId, oldVer) {
  if (formPhoto.blob) {
    const ver = 'p' + Date.now().toString(36);
    photoPut(logId, { ver, blob: formPhoto.blob }).then(() => syncPhotos()).catch(() => toast("Couldn't save the photo on this device"));
    if (oldVer) queuePhotoDelete(logId, oldVer);
    return ver;
  }
  if (formPhoto.ver) return formPhoto.ver;
  if (oldVer) { queuePhotoDelete(logId, oldVer); photoDel(logId); }
  return undefined;
}

// When a log is deleted
function forgetPhoto(log) {
  if (!log?.photo) return;
  queuePhotoDelete(log.id, log.photo);
  photoDel(log.id);
}

// ---------- Backing up to your account ----------
function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function queuePhotoDelete(id, ver) {
  const list = readJson(PHOTO_DEL_KEY, []);
  list.push(`${id}-${ver}`);
  try { localStorage.setItem(PHOTO_DEL_KEY, JSON.stringify(list)); } catch {}
}

let photoSyncing = false;
async function syncPhotos() {
  if (typeof sb === 'undefined' || !sb || !account || photoSyncing) return;
  photoSyncing = true;
  try {
    const uid = account.id;
    let up = readJson(PHOTO_UP_KEY, {});
    if (up.userId !== uid) up = { userId: uid, done: {} };
    const files = sb.storage.from(PHOTO_BUCKET);

    // Upload photos taken on this device that aren't in the cloud yet
    for (const l of logs) {
      if (!l.photo || up.done[l.id] === l.photo) continue;
      const rec = await photoGet(l.id);
      if (rec?.ver !== l.photo) continue;   // taken on another device
      const { error } = await files.upload(`${uid}/${l.id}-${l.photo}.jpg`, rec.blob, { upsert: true, contentType: 'image/jpeg' });
      if (error) throw error;
      up.done[l.id] = l.photo;
      localStorage.setItem(PHOTO_UP_KEY, JSON.stringify(up));
    }
    if (profile.avatar && up.done[AVATAR_ID] !== profile.avatar) {
      const rec = await photoGet(AVATAR_ID);
      if (rec?.ver === profile.avatar) {
        const { error } = await files.upload(`${uid}/${AVATAR_ID}-${rec.ver}.jpg`, rec.blob, { upsert: true, contentType: 'image/jpeg' });
        if (error) throw error;
        up.done[AVATAR_ID] = rec.ver;
        localStorage.setItem(PHOTO_UP_KEY, JSON.stringify(up));
      }
    }

    // Remove replaced and deleted photos
    const del = readJson(PHOTO_DEL_KEY, []);
    if (del.length) {
      const { error } = await files.remove(del.map(n => `${uid}/${n}.jpg`));
      if (error) throw error;
      const left = readJson(PHOTO_DEL_KEY, []).filter(n => !del.includes(n));
      localStorage.setItem(PHOTO_DEL_KEY, JSON.stringify(left));
    }
  } catch (e) {
    console.warn('Photo backup failed', e);
  } finally {
    photoSyncing = false;
  }
}

// Used by "Delete my account": removes every photo you've uploaded
async function deleteAllPhotos() {
  if (!sb || !account) return;
  const files = sb.storage.from(PHOTO_BUCKET);
  const { data } = await files.list(account.id, { limit: 1000 });
  if (data?.length) await files.remove(data.map(f => `${account.id}/${f.name}`));
  try { localStorage.removeItem(PHOTO_UP_KEY); localStorage.removeItem(PHOTO_DEL_KEY); } catch {}
}

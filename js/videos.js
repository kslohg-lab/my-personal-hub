// 가족 영상 (Firestore videos 컬렉션, 유튜브 링크만 저장)
import { $ } from './util.js?v=1.10';
import { state, myName, firebaseConfig, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, doc, deleteDoc } from './firebase-init.js?v=1.10';

let videos = [], vUnsub = null;
const vList = $('vidList');
function ytId(u) {
  try {
    u = (u || '').trim();
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    const x = new URL(u), h = x.hostname.replace(/^(www|m)\./, '');
    let id = null;
    if (h === 'youtu.be') id = x.pathname.slice(1).split('/')[0];
    else if (h === 'youtube.com' || h === 'music.youtube.com') {
      if (x.pathname === '/watch') id = x.searchParams.get('v');
      else { const m = x.pathname.match(/^\/(shorts|embed|live|v)\/([^/?]+)/); if (m) id = m[2]; }
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
const ytUrl = id => 'https://www.youtube.com/watch?v=' + id;
const ytThumb = id => 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
function vMeta(v) {
  const d = v.createdAt && v.createdAt.toDate ? v.createdAt.toDate() : null;
  return (v.by || '') + (d ? ' · ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일' : '');
}
function vNote(text, err) {
  vList.replaceChildren();
  const e = document.createElement('div');
  e.className = 'text-center text-xs py-6 bg-slate-900 border border-slate-800 rounded-2xl ' + (err ? 'text-red-400' : 'text-slate-500');
  e.textContent = text;
  vList.append(e);
}
function renderVideos() {
  if (!videos.length) { vNote('아직 영상이 없어요. 유튜브 링크를 붙여 넣어 첫 영상을 추가해 보세요!'); return; }
  vList.replaceChildren();
  const [first, ...rest] = videos;
  // 최신 영상: 큰 카드
  const big = document.createElement('div');
  const a = document.createElement('a');
  a.href = ytUrl(first.videoId); a.target = '_blank'; a.rel = 'noopener';
  a.className = 'relative block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg';
  const img = document.createElement('img');
  img.src = ytThumb(first.videoId); img.alt = ''; img.loading = 'lazy';
  img.className = 'block w-full aspect-video object-cover bg-slate-800';
  const play = document.createElement('div');
  play.className = 'absolute inset-0 flex items-center justify-center';
  const pc = document.createElement('div');
  pc.className = 'w-14 h-14 rounded-full bg-black/55 text-white text-xl flex items-center justify-center pl-1';
  pc.textContent = '▶';
  play.append(pc);
  const cap = document.createElement('div');
  cap.className = 'absolute inset-x-0 bottom-0 px-4 pt-10 pb-3 bg-gradient-to-t from-black/80 to-transparent';
  const ct = document.createElement('div');
  ct.className = 'text-sm font-bold text-white break-words';
  ct.textContent = first.title || '우리 가족 영상';
  cap.append(ct);
  a.append(img, play, cap);
  const meta = document.createElement('div');
  meta.className = 'flex items-center justify-between px-1 pt-1';
  const mt = document.createElement('span');
  mt.className = 'text-[11px] text-slate-500';
  mt.textContent = vMeta(first);
  meta.append(mt, delBtn(first));
  big.append(a, meta);
  vList.append(big);
  // 지난 영상: 작은 줄
  rest.forEach(v => {
    const row = document.createElement('div');
    row.className = 'flex items-center gap-3 p-2 bg-slate-900 border border-slate-800 rounded-xl';
    const ra = document.createElement('a');
    ra.href = ytUrl(v.videoId); ra.target = '_blank'; ra.rel = 'noopener'; ra.className = 'shrink-0';
    const ri = document.createElement('img');
    ri.src = ytThumb(v.videoId); ri.alt = ''; ri.loading = 'lazy';
    ri.className = 'w-28 aspect-video object-cover rounded-lg bg-slate-800';
    ra.append(ri);
    const mid = document.createElement('a');
    mid.href = ytUrl(v.videoId); mid.target = '_blank'; mid.rel = 'noopener'; mid.className = 'flex-1 min-w-0';
    const t = document.createElement('div');
    t.className = 'text-sm text-slate-200 break-words';
    t.textContent = v.title || '우리 가족 영상';
    const m = document.createElement('div');
    m.className = 'text-[10px] text-slate-500 mt-0.5';
    m.textContent = vMeta(v);
    mid.append(t, m);
    row.append(ra, mid, delBtn(v));
    vList.append(row);
  });
}
function delBtn(v) {
  const b = document.createElement('button');
  b.className = 'text-slate-500 hover:text-red-400 text-xs p-1';
  b.textContent = '삭제';
  b.addEventListener('click', () => {
    if (confirm('이 영상을 목록에서 삭제할까요?\n(유튜브의 영상은 삭제되지 않아요)\n"' + (v.title || '') + '"')) deleteDoc(doc(state.db, 'videos', v.id)).catch(videoFail);
  });
  return b;
}
const videoFail = e => {
  const c = e.code || e.message;
  alert('영상 저장 실패 (' + c + ')' + (c === 'permission-denied' ? '\nFirestore 규칙에 videos 규칙이 추가됐는지 확인하세요.' : ''));
};
function startVideos() {
  if (vUnsub || !state.db) return;
  const q = query(collection(state.db, 'videos'), orderBy('createdAt', 'desc'), limit(20));
  vUnsub = onSnapshot(q, snap => {
    videos = snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })).filter(v => /^[A-Za-z0-9_-]{11}$/.test(v.videoId || ''));
    renderVideos();
  }, err => { console.error(err); vNote('⚠ 영상을 불러오지 못했어요 (' + (err.code || err.message) + ')', true); });
}
function stopVideos() {
  if (vUnsub) { vUnsub(); vUnsub = null; }
  videos = [];
  vList.replaceChildren();
}
function vErr(msg) { $('vidErr').textContent = msg; $('vidErr').hidden = !msg; }
function closeVidForm() { $('vidForm').hidden = true; $('vidUrl').value = ''; $('vidTitle').value = ''; vErr(''); }
function addVideo() {
  const id = ytId($('vidUrl').value);
  if (!id) { vErr('유튜브 링크를 확인해 주세요. (예: https://youtu.be/...)'); return; }
  if (videos.some(v => v.videoId === id)) { vErr('이미 추가된 영상이에요.'); return; }
  if (!state.db || !state.me) { vErr('로그인이 필요해요.'); return; }
  const title = $('vidTitle').value.trim().slice(0, 80) || '우리 가족 영상';
  closeVidForm();
  addDoc(collection(state.db, 'videos'), { videoId: id, title, by: myName(), uid: state.me.uid, createdAt: serverTimestamp() }).catch(videoFail);
}
$('vidAddToggle').addEventListener('click', () => { const f = $('vidForm'); if (f.hidden) { f.hidden = false; $('vidUrl').focus(); } else closeVidForm(); });
$('vidCancel').addEventListener('click', closeVidForm);
$('vidSave').addEventListener('click', addVideo);
$('vidTitle').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) addVideo(); });

export { startVideos as start, stopVideos as stop, ytId };

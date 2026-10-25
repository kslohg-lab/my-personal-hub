// 가족 영상 (Firestore videos 컬렉션, 유튜브 링크만 저장)
import { $ } from './util.js?v=1.15';
import { state, myName, firebaseConfig, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, doc, deleteDoc } from './firebase-init.js?v=1.15';

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
  bigBox = restBox = null; bigKey = '';
  const e = document.createElement('div');
  e.className = 'text-center text-xs py-6 bg-slate-900 border border-slate-800 rounded-2xl ' + (err ? 'text-red-400' : 'text-slate-500');
  e.textContent = text;
  vList.append(e);
}

// ---- 목록: 큰 카드(재생 화면) 1개 + 지난 영상 줄 ----
// 큰 카드를 누르면 새 창이 아니라 그 자리에서 유튜브 영상이 바로 재생된다.
// 지난 영상 줄을 누르면 그 영상이 큰 카드로 올라와 바로 재생된다.
// 큰 카드와 목록은 따로 그려서, 재생 중에 누가 새 영상을 추가해도 재생이 끊기지 않는다.
let bigBox = null, restBox = null, bigKey = '';
let selId = null;      // 큰 카드에 올릴 영상 (null이면 최신 영상)
let playing = null;    // 지금 재생 중인 영상 (문서 id)
const embedUrl = id => 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&playsinline=1&rel=0';

function playVideo(id) { selId = id; playing = id; renderVideos(); if (bigBox) bigBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
function stopPlay() { if (playing) { playing = null; selId = null; renderVideos(); } }

function bigCard(v, isPlaying) {
  const wrap = document.createElement('div');
  const stage = document.createElement('div');
  stage.className = 'relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg aspect-video';
  if (isPlaying) {
    const f = document.createElement('iframe');
    f.src = embedUrl(v.videoId);
    f.title = v.title || '우리 가족 영상';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.className = 'absolute inset-0 w-full h-full';
    f.style.border = '0';
    stage.append(f);
  } else {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.dataset.play = v.id;
    btn.setAttribute('aria-label', '재생');
    btn.className = 'absolute inset-0 w-full h-full text-left';
    const img = document.createElement('img');
    img.src = ytThumb(v.videoId); img.alt = ''; img.loading = 'lazy';
    img.className = 'block w-full h-full object-cover bg-slate-800';
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
    ct.textContent = v.title || '우리 가족 영상';
    cap.append(ct);
    btn.append(img, play, cap);
    btn.addEventListener('click', () => playVideo(v.id));
    stage.append(btn);
  }
  const meta = document.createElement('div');
  meta.className = 'flex items-center justify-between gap-2 px-1 pt-1';
  const mt = document.createElement('span');
  mt.className = 'text-[11px] text-slate-500 min-w-0 truncate';
  mt.textContent = (isPlaying ? (v.title || '우리 가족 영상') + ' · ' : '') + vMeta(v);
  const right = document.createElement('div');
  right.className = 'flex items-center shrink-0';
  if (isPlaying) {
    const cl = document.createElement('button');
    cl.type = 'button'; cl.className = 'text-slate-400 text-xs p-1'; cl.textContent = '닫기';
    cl.addEventListener('click', stopPlay);
    right.append(cl);
  }
  const yt = document.createElement('a');   // 재생이 안 되는 영상(퍼가기 막힘 등)은 유튜브에서 열기
  yt.href = ytUrl(v.videoId); yt.target = '_blank'; yt.rel = 'noopener';
  yt.className = 'text-slate-500 text-xs p-1'; yt.textContent = 'YouTube ↗';
  right.append(yt, delBtn(v));
  meta.append(mt, right);
  wrap.append(stage, meta);
  return wrap;
}
function restRow(v) {
  const row = document.createElement('div');
  row.className = 'flex items-center gap-3 p-2 bg-slate-900 border border-slate-800 rounded-xl';
  const ra = document.createElement('button');
  ra.type = 'button'; ra.dataset.play = v.id; ra.setAttribute('aria-label', '재생');
  ra.className = 'relative shrink-0';
  const ri = document.createElement('img');
  ri.src = ytThumb(v.videoId); ri.alt = ''; ri.loading = 'lazy';
  ri.className = 'w-28 aspect-video object-cover rounded-lg bg-slate-800';
  const pi = document.createElement('div');
  pi.className = 'absolute inset-0 flex items-center justify-center text-white text-sm';
  pi.textContent = '▶';
  ra.append(ri, pi);
  const mid = document.createElement('button');
  mid.type = 'button'; mid.className = 'flex-1 min-w-0 text-left';
  const t = document.createElement('div');
  t.className = 'text-sm text-slate-200 break-words';
  t.textContent = v.title || '우리 가족 영상';
  const m = document.createElement('div');
  m.className = 'text-[10px] text-slate-500 mt-0.5';
  m.textContent = vMeta(v);
  mid.append(t, m);
  ra.addEventListener('click', () => playVideo(v.id));
  mid.addEventListener('click', () => playVideo(v.id));
  row.append(ra, mid, delBtn(v));
  return row;
}
function renderVideos() {
  if (!videos.length) { selId = null; playing = null; vNote('아직 영상이 없어요. 유튜브 링크를 붙여 넣어 첫 영상을 추가해 보세요!'); return; }
  if (!bigBox || !bigBox.isConnected) {
    vList.replaceChildren();
    bigBox = document.createElement('div'); restBox = document.createElement('div');
    restBox.className = 'space-y-3 mt-3'; bigKey = '';
    vList.append(bigBox, restBox);
  }
  let cur = videos.find(v => v.id === selId);
  if (!cur) { selId = null; cur = videos[0]; if (playing && playing !== cur.id) playing = null; }
  if (playing && playing !== cur.id) playing = null;
  const isPlaying = playing === cur.id;
  const key = cur.id + '|' + (cur.title || '') + '|' + isPlaying;
  if (key !== bigKey) { bigKey = key; bigBox.replaceChildren(bigCard(cur, isPlaying)); }   // 같으면 그대로 둠 (재생 중 영상이 다시 시작되지 않게)
  restBox.replaceChildren(...videos.filter(v => v !== cur).map(restRow));
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
  videos = []; selId = null; playing = null; bigBox = restBox = null; bigKey = '';
  vList.replaceChildren();
}
// 다른 탭으로 가면 재생 중인 영상을 멈춤 (소리가 계속 나지 않게)
try { new MutationObserver(() => { const t = $('tab-home'); if (t && !t.classList.contains('active')) stopPlay(); }).observe($('tab-home'), { attributes: true, attributeFilter: ['class'] }); } catch {}
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

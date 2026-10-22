// 가족 채팅 (Firestore chats 컬렉션) + 연결 상태 표시 + 사진 확대
import { $ } from './util.js?v=1.13';
import { state, myName, firebaseConfig, collection, addDoc, query, orderBy, limitToLast, onSnapshot, serverTimestamp } from './firebase-init.js?v=1.13';

const box = $('chatMessages'), input = $('chatMessage');
let unsub = null, docs = [];

function setStatus(ok, err, n) {
  const s = $('chatStatus');
  if (ok) { s.textContent = '● 연결됨' + (n != null ? ' · 메시지 ' + n + '개' : ''); s.className = 'text-[10px] mb-1 shrink-0 text-emerald-400'; $('chatDetail').textContent = ''; return; }
  s.textContent = err && err.code === 'permission-denied'
    ? '⚠ 권한 오류: Firebase 콘솔 > Firestore > 규칙을 확인하세요'
    : '⚠ 연결 실패: ' + ((err && (err.code || err.message)) || '네트워크를 확인하세요');
  s.className = 'text-[10px] mb-1 shrink-0 text-red-400';
  probe();
}
let lastProbe = 0;
async function probe() {
  if (Date.now() - lastProbe < 15000) return;
  lastProbe = Date.now();
  const d = $('chatDetail');
  d.textContent = '원인 확인 중...';
  const u = 'https://firestore.googleapis.com/v1/projects/' + firebaseConfig.projectId + '/databases/(default)/documents/chats?pageSize=1&key=' + firebaseConfig.apiKey;
  const headers = {};
  try { if (state.auth && state.auth.currentUser) headers.Authorization = 'Bearer ' + await state.auth.currentUser.getIdToken(); } catch {}
  try {
    const r = await fetch(u, { headers });
    if (r.ok) { d.textContent = '서버 접속·읽기 권한은 정상이에요. 새로고침하거나 다른 네트워크(와이파이/LTE)로 시도해 보세요.'; return; }
    let j = {}; try { j = await r.json(); } catch {}
    d.textContent = '서버 응답 ' + r.status + ': ' + ((j.error && j.error.message) || '알 수 없는 오류');
  } catch {
    d.textContent = 'Firestore 서버(firestore.googleapis.com)에 접속할 수 없어요. 광고차단/VPN/방화벽/인터넷을 확인하세요.';
  }
}
const fail = e => alert('전송 실패 (' + (e.code || e.message) + '). 로그인 상태와 인터넷 연결을 확인하세요.');

function openImg(src) { $('lbImg').src = src; $('lightbox').hidden = false; }
$('lightbox').addEventListener('click', () => { $('lightbox').hidden = true; });

// 이모지만 1~3개 보낸 메시지인지 확인 (글자가 섞이면 false)
const EMO = /^(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[‍️⃣]|[\u{1F3FB}-\u{1F3FF}]|[#*0-9]️?⃣)+$/u;
function emojiCount(s) {
  const t = (s || '').trim();
  if (!t || t.length > 40 || !EMO.test(t.replace(/\s+/g, ''))) return 0;
  const parts = t.replace(/\s+/g, '');
  try { return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(parts)].length; }
  catch { return [...parts].filter(c => !/[‍️\u{1F3FB}-\u{1F3FF}⃣]/u.test(c)).length; }
}

// 채팅 렌더링 (텍스트는 모두 textContent)
function render() {
  const stick = box.clientHeight === 0 || box.scrollHeight - box.scrollTop - box.clientHeight < 120;
  box.replaceChildren();
  if (!docs.length) {
    const e = document.createElement('div');
    e.className = 'text-center text-slate-500 text-xs py-8';
    e.textContent = '첫 메시지를 남겨보세요 👋';
    box.append(e);
    return;
  }
  docs.forEach(d => {
    const isMe = (state.me && d.uid === state.me.uid) || d.sender === myName();
    const row = document.createElement('div');
    row.className = 'flex flex-col mb-3 ' + (isMe ? 'items-end' : 'items-start');
    const nm = document.createElement('span');
    nm.className = 'text-xs text-slate-400 mb-1 px-1';
    nm.textContent = d.sender || '익명';
    const bub = document.createElement('div');
    const n = !d.imageUrl ? emojiCount(d.text) : 0;
    if (n >= 1 && n <= 3) {
      bub.className = 'max-w-[85%] px-1 py-0.5 break-words';   // 이모지만: 말풍선 없이 크게
    } else {
      bub.className = 'max-w-[85%] rounded-2xl px-4 py-2.5 break-words ' + (isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700');
    }
    if (d.text) {
      const t = document.createElement('div');
      t.className = (n >= 1 && n <= 3 ? '' : 'text-sm') + ' whitespace-pre-wrap';
      if (n >= 1 && n <= 3) { t.style.fontSize = '2.75rem'; t.style.lineHeight = '1.2'; }
      t.textContent = d.text;
      bub.append(t);
    }
    if (d.imageUrl) {
      const im = document.createElement('img');
      im.src = d.imageUrl;
      im.className = 'rounded-xl max-w-[200px] max-h-[200px] object-cover border border-slate-700 cursor-pointer ' + (d.text ? 'mt-2' : '');
      im.onclick = () => openImg(d.imageUrl);
      bub.append(im);
    }
    const tm = document.createElement('span');
    tm.className = 'text-[10px] text-slate-500 mt-1 px-1';
    tm.textContent = d.time;
    row.append(nm, bub, tm);
    box.append(row);
  });
  if (stick) box.scrollTop = box.scrollHeight;
}

// 채팅 구독은 로그인한 뒤에만 시작
function startChat() {
  if (unsub || !state.db) return;
  const q = query(collection(state.db, 'chats'), orderBy('timestamp', 'asc'), limitToLast(100));
  unsub = onSnapshot(q, snap => {
    docs = snap.docs.map(s => {
      const d = s.data({ serverTimestamps: 'estimate' });
      const t = d.timestamp && d.timestamp.toDate ? d.timestamp.toDate() : null;
      return { ...d, time: t ? t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '' };
    });
    if (snap.metadata.fromCache) setStatus(false, { message: '서버와 연결되지 않았어요 (오프라인)' });
    else setStatus(true, null, docs.length);
    render();
  }, err => { console.error(err); setStatus(false, err); });
}
function stopChat() {
  if (unsub) { unsub(); unsub = null; }
  docs = [];
  box.replaceChildren();
}

function send(text, img) {
  return addDoc(collection(state.db, 'chats'), {
    sender: myName(), uid: state.me.uid, text: text || '', imageUrl: img || null, timestamp: serverTimestamp()
  });
}
function sendText() {
  const t = input.value.trim();
  if (!t) return;
  if (!state.db || !state.me) { alert('로그인이 필요해요.'); return; }
  input.value = '';
  const timer = setTimeout(() => setStatus(false, { message: '전송이 지연되고 있어요. 인터넷 연결을 확인하세요' }), 8000);
  send(t).then(() => clearTimeout(timer)).catch(e => { clearTimeout(timer); input.value = t; fail(e); });
}
$('sendBtn').addEventListener('pointerdown', e => e.preventDefault()); // 키보드 유지
$('sendBtn').addEventListener('click', sendText);
input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); sendText(); } });

// 사진: 자동 축소/압축 후 전송 (Firestore 문서 1MB 제한 안에서)
$('imgInput').addEventListener('change', e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f || !state.db || !state.me) return;
  const url = URL.createObjectURL(f);
  const img = new Image();
  img.onload = () => {
    let max = 800, q = 0.7, out = '';
    for (let i = 0; i < 4; i++) {
      const r = Math.min(1, max / img.width);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      out = c.toDataURL('image/jpeg', q);
      if (out.length < 700000) break;
      max *= 0.75; q -= 0.1;
    }
    URL.revokeObjectURL(url);
    if (out.length > 900000) { alert('사진이 너무 커서 보낼 수 없어요.'); return; }
    send('', out).catch(fail);
  };
  img.onerror = () => { URL.revokeObjectURL(url); alert('사진을 읽을 수 없어요.'); };
  img.src = url;
});

export { startChat as start, stopChat as stop, setStatus };

// 가족 일정 보드 (Firestore todos 컬렉션)
//  - 받는 사람 지정(to), 글쓴이 수정, 답글(todos/{id}/replies 하위 컬렉션, 개수는 rc)
//  - 옛 기기 저장 일정 이전
import { $ } from './util.js?v=1.13';
import { state, myName, FAMILY, collection, addDoc, query, orderBy, limitToLast, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc, increment } from './firebase-init.js?v=1.13';

let todos = [], tUnsub = null;
let openId = null, pn = null;          // 펼친 일정 id, 펼친 칸 정보
const items = new Map();               // id -> { li, row, sig }  (입력 중인 칸이 다시 그려지지 않게 항목별로 갱신)
const tList = $('todoList');
const NAMES = FAMILY.map(f => f.name);

const mk = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const todoFail = e => {
  const c = e.code || e.message;
  alert('저장 실패 (' + c + ')' + (c === 'permission-denied' ? '\nFirestore 규칙에 todos 규칙(답글/수정 포함)이 추가됐는지 확인하세요.' : ''));
};
const when = ts => {
  const d = ts && ts.toDate ? ts.toDate() : null;
  return d ? d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
};
const toOptions = sel => {
  sel.append(new Option('전체', ''));
  NAMES.forEach(n => sel.append(new Option(n, n)));
};
const SEL_CLS = 'bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500';
toOptions($('todoTo'));

/* ---------- 목록 ---------- */
const sigOf = t => [t.text, t.to || '', t.done ? 1 : 0, t.doneBy || '', t.by || '', Math.max(0, t.rc || 0), openId === t.id ? 1 : 0, state.me ? state.me.uid : ''].join('|');

function buildRow(t) {
  const row = mk('div', 'flex items-center gap-3');
  const chk = mk('button', 'w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs ' + (t.done ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-600'), t.done ? '✓' : '');
  chk.setAttribute('aria-label', '완료 표시');
  chk.addEventListener('click', () => toggleTodo(t));

  const mid = mk('div', 'flex-1 min-w-0 cursor-pointer');
  mid.addEventListener('click', () => toggleOpen(t.id));
  const tx = mk('div', (t.done ? 'line-through text-slate-500' : 'text-slate-200') + ' break-words', t.text);
  const by = mk('div', 'text-[10px] text-slate-500 mt-0.5');
  by.textContent = (t.by || '') + (t.to ? ' → ' + t.to : '') + (t.done && t.doneBy ? ' · ' + t.doneBy + ' 완료' : '');
  if (t.to && t.to === myName() && !t.done) by.append(mk('span', 'ml-1.5 px-1.5 py-px rounded bg-amber-500/20 text-amber-300', '나에게'));
  mid.append(tx, by);

  const n = Math.max(0, t.rc || 0);
  const cm = mk('button', 'shrink-0 text-xs px-2 py-1 rounded-lg ' + (openId === t.id ? 'bg-indigo-600/30 text-indigo-300' : n ? 'text-indigo-300' : 'text-slate-500'), '💬' + (n ? ' ' + n : ''));
  cm.setAttribute('aria-label', '답글');
  cm.addEventListener('click', () => toggleOpen(t.id));

  const del = mk('button', 'shrink-0 text-slate-500 hover:text-red-400 text-xs p-1', '삭제');
  del.addEventListener('click', () => removeTodo(t));
  row.append(chk, mid, cm, del);
  return row;
}

function renderTodos() {
  $('todoCount').textContent = todos.length ? '남은 일정 ' + todos.filter(t => !t.done).length + '개' : '';
  if (openId && !todos.some(t => t.id === openId)) closePanel();
  if (!todos.length) {
    items.clear();
    tList.replaceChildren(mk('li', 'text-center text-slate-500 text-xs py-8', '아직 일정이 없어요. 첫 일정을 추가해 보세요!'));
    return;
  }
  const ids = new Set(todos.map(t => t.id));
  for (const [id, it] of items) if (!ids.has(id)) { it.li.remove(); items.delete(id); }
  [...tList.children].forEach(c => { if (![...items.values()].some(it => it.li === c)) c.remove(); });
  todos.forEach((t, i) => {
    let it = items.get(t.id);
    if (!it) { it = { li: document.createElement('li'), row: null, sig: '' }; items.set(t.id, it); }
    const sig = sigOf(t);
    if (sig !== it.sig) {
      const mine = t.to && t.to === myName() && !t.done;
      it.li.className = 'p-3 bg-slate-900 border rounded-xl text-sm ' + (mine ? 'border-amber-500/40' : 'border-slate-800');
      const row = buildRow(t);
      if (it.row) it.row.replaceWith(row); else it.li.prepend(row);
      it.row = row; it.sig = sig;
    }
    if (tList.children[i] !== it.li) tList.insertBefore(it.li, tList.children[i] || null);
  });
}

/* ---------- 펼친 칸: 답글 + 수정 ---------- */
function closePanel() {
  if (pn) { if (pn.rUnsub) pn.rUnsub(); pn.el.remove(); }
  pn = null; openId = null;
}
function toggleOpen(id) {
  const was = openId;
  closePanel();
  if (was !== id) openPanel(id);
  renderTodos();
}
function openPanel(id) {
  const t0 = todos.find(x => x.id === id), it = items.get(id);
  if (!t0 || !it) return;
  const me = pn = { id, el: mk('div', 'mt-3 pt-3 border-t border-slate-800 space-y-2'), listEl: mk('div', 'space-y-1.5'), replies: [], rUnsub: null };
  openId = id;
  const cur = () => todos.find(x => x.id === id) || t0;

  // 윗줄: 작성 시각 + (글쓴이만) 수정
  const head = mk('div', 'flex items-center justify-between text-[11px] text-slate-500');
  head.append(mk('span', '', when(t0.createdAt) ? when(t0.createdAt) + ' 작성' : ''));
  const edBox = mk('div', 'space-y-2');
  edBox.hidden = true;
  if (state.me && t0.uid === state.me.uid) {
    const ed = mk('button', 'text-indigo-400 p-1', '✏️ 수정');
    ed.addEventListener('click', () => {
      const t = cur();
      edBox.replaceChildren();
      const inp = mk('input', 'w-full ' + SEL_CLS);
      inp.type = 'text'; inp.value = t.text; inp.maxLength = 200; inp.autocomplete = 'off';
      const sel = mk('select', SEL_CLS); toOptions(sel); sel.value = t.to || '';
      const ok = mk('button', 'bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold', '저장');
      const no = mk('button', 'text-slate-400 px-3 py-1.5 rounded-lg text-xs', '취소');
      const save = () => {
        const v = inp.value.trim();
        if (!v) return;
        edBox.hidden = true;
        updateDoc(doc(state.db, 'todos', id), { text: v.slice(0, 200), to: sel.value }).catch(todoFail);
      };
      ok.addEventListener('click', save);
      no.addEventListener('click', () => { edBox.hidden = true; });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) save(); });
      const r = mk('div', 'flex items-center gap-2'); r.append(sel, ok, no);
      edBox.append(inp, r);
      edBox.hidden = false;
      inp.focus();
    });
    head.append(ed);
  }

  // 답글 입력
  const form = mk('div', 'flex gap-2');
  const input = mk('input', 'flex-1 min-w-0 ' + SEL_CLS);
  input.type = 'text'; input.placeholder = '답글 쓰기...'; input.autocomplete = 'off'; input.maxLength = 300;
  const send = mk('button', 'bg-indigo-600 text-white px-3 rounded-xl text-sm font-semibold', '보내기');
  const sendReply = () => {
    const v = input.value.trim();
    if (!v) return;
    if (!state.db || !state.me) { alert('로그인이 필요해요.'); return; }
    input.value = '';
    addDoc(collection(state.db, 'todos', id, 'replies'), { text: v.slice(0, 300), by: myName(), uid: state.me.uid, createdAt: serverTimestamp() })
      .then(() => updateDoc(doc(state.db, 'todos', id), { rc: increment(1) }).catch(e => console.warn('답글 개수 갱신 실패', e)))
      .catch(e => { input.value = v; todoFail(e); });
  };
  send.addEventListener('pointerdown', e => e.preventDefault()); // 키보드 유지
  send.addEventListener('click', sendReply);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); sendReply(); } });
  form.append(input, send);

  me.el.append(head, edBox, me.listEl, form);
  it.li.append(me.el);
  renderReplies(me);

  me.rUnsub = onSnapshot(query(collection(state.db, 'todos', id, 'replies'), orderBy('createdAt', 'asc'), limitToLast(100)), snap => {
    if (pn !== me) return;
    me.replies = snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
    renderReplies(me);
  }, err => {
    console.error(err);
    if (pn !== me) return;
    me.listEl.replaceChildren(mk('div', 'text-xs text-red-400', '⚠ 답글을 불러오지 못했어요 (' + (err.code || err.message) + ')' + (err.code === 'permission-denied' ? ' — Firestore 규칙에 답글 규칙을 추가해 주세요.' : '')));
  });
  me.el.scrollIntoView({ block: 'nearest' });
}

function renderReplies(me) {
  const box = me.listEl;
  box.replaceChildren();
  if (!me.replies.length) { box.append(mk('div', 'text-xs text-slate-500 py-1', '아직 답글이 없어요. 첫 답글을 남겨 보세요 💬')); return; }
  me.replies.forEach(r => {
    const mineR = state.me && r.uid === state.me.uid;
    const b = mk('div', 'rounded-lg px-3 py-2 ' + (mineR ? 'bg-indigo-950/60' : 'bg-slate-950/60'));
    const top = mk('div', 'flex items-center gap-2 text-[10px] text-slate-500');
    top.append(mk('span', 'text-xs font-semibold text-slate-300', r.by || '익명'), mk('span', '', when(r.createdAt)));
    if (mineR) {
      const x = mk('button', 'ml-auto text-slate-500 hover:text-red-400 p-0.5', '삭제');
      x.addEventListener('click', () => {
        if (!confirm('이 답글을 삭제할까요?')) return;
        deleteDoc(doc(state.db, 'todos', me.id, 'replies', r.id))
          .then(() => updateDoc(doc(state.db, 'todos', me.id), { rc: increment(-1) }).catch(e => console.warn('답글 개수 갱신 실패', e)))
          .catch(todoFail);
      });
      top.append(x);
    }
    b.append(top, mk('div', 'text-sm text-slate-200 whitespace-pre-wrap break-words mt-0.5', r.text));
    box.append(b);
  });
}

/* ---------- 구독 / 추가 / 완료 / 삭제 ---------- */
function startTodos() {
  if (tUnsub || !state.db) return;
  const q = query(collection(state.db, 'todos'), orderBy('createdAt', 'asc'), limitToLast(200));
  tUnsub = onSnapshot(q, snap => {
    todos = snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
    todos.sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0)); // 안 한 일정 먼저 (안정 정렬)
    renderTodos();
  }, err => {
    console.error(err);
    $('todoCount').textContent = '⚠ 일정을 불러오지 못했어요 (' + (err.code || err.message) + ')';
  });
}
function stopTodos() {
  if (tUnsub) { tUnsub(); tUnsub = null; }
  closePanel();
  todos = [];
  items.clear();
  tList.replaceChildren();
  $('todoCount').textContent = '';
}
function addTodo() {
  const v = $('todoInput').value.trim();
  if (!v) return;
  if (!state.db || !state.me) { alert('로그인이 필요해요.'); return; }
  $('todoInput').value = '';
  addDoc(collection(state.db, 'todos'), { text: v.slice(0, 200), to: $('todoTo').value, rc: 0, done: false, doneBy: '', by: myName(), uid: state.me.uid, createdAt: serverTimestamp() })
    .catch(e => { $('todoInput').value = v; todoFail(e); });
}
function toggleTodo(t) {
  updateDoc(doc(state.db, 'todos', t.id), { done: !t.done, doneBy: t.done ? '' : myName() }).catch(todoFail);
}
function removeTodo(t) {
  if (confirm('이 일정을 삭제할까요?\n"' + t.text + '"')) deleteDoc(doc(state.db, 'todos', t.id)).catch(todoFail);
}
$('todoAdd').addEventListener('click', addTodo);
$('todoInput').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) addTodo(); });

// 예전에 이 폰에만 저장해 둔 일정을 가족 일정으로 옮기기 (기기마다 한 번만 묻기)
function migrateLocalTodos() {
  if (!state.db || !state.me) return;
  let flag = null, list = [];
  try { flag = localStorage.getItem('hub_todos_migrated'); list = JSON.parse(localStorage.getItem('my_hub_todos') || '[]') || []; } catch {}
  list = list.filter(t => t && t.text);
  if (flag || !list.length) return;
  if (!confirm('이 폰에 저장된 일정 ' + list.length + '개를 가족 일정으로 옮길까요?')) { try { localStorage.setItem('hub_todos_migrated', 'no'); } catch {} return; }
  Promise.all(list.map(t => addDoc(collection(state.db, 'todos'), {
    text: String(t.text).slice(0, 200), to: '', rc: 0, done: !!t.done, doneBy: t.done ? myName() : '', by: myName(), uid: state.me.uid, createdAt: serverTimestamp()
  }))).then(() => { try { localStorage.setItem('hub_todos_migrated', '1'); } catch {} }).catch(todoFail);
}

export { startTodos as start, stopTodos as stop, migrateLocalTodos };

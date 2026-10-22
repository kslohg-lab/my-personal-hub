// 가족 일정 (Firestore todos 컬렉션) + 옛 기기 저장 일정 이전
import { $ } from './util.js?v=1.11';
import { state, myName, firebaseConfig, collection, addDoc, query, orderBy, limitToLast, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc } from './firebase-init.js?v=1.11';

let todos = [], tUnsub = null;
const tList = $('todoList');
const todoFail = e => {
  const c = e.code || e.message;
  alert('일정 저장 실패 (' + c + ')' + (c === 'permission-denied' ? '\nFirestore 규칙에 todos 규칙이 추가됐는지 확인하세요.' : ''));
};
function renderTodos() {
  tList.replaceChildren();
  $('todoCount').textContent = todos.length ? '남은 일정 ' + todos.filter(t => !t.done).length + '개' : '';
  if (!todos.length) {
    const e = document.createElement('li');
    e.className = 'text-center text-slate-500 text-xs py-8';
    e.textContent = '아직 일정이 없어요. 첫 일정을 추가해 보세요!';
    tList.append(e);
    return;
  }
  todos.forEach(t => {
    const li = document.createElement('li');
    li.className = 'flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm';
    const chk = document.createElement('button');
    chk.className = 'w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs ' + (t.done ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-600');
    chk.textContent = t.done ? '✓' : '';
    chk.setAttribute('aria-label', '완료 표시');
    chk.addEventListener('click', () => toggleTodo(t));
    const mid = document.createElement('div');
    mid.className = 'flex-1 min-w-0';
    const tx = document.createElement('div');
    tx.className = (t.done ? 'line-through text-slate-500' : 'text-slate-200') + ' break-words';
    tx.textContent = t.text;
    const by = document.createElement('div');
    by.className = 'text-[10px] text-slate-500 mt-0.5';
    by.textContent = (t.by || '') + (t.done && t.doneBy ? ' · ' + t.doneBy + ' 완료' : '');
    mid.append(tx, by);
    const del = document.createElement('button');
    del.className = 'text-slate-500 hover:text-red-400 text-xs p-1';
    del.textContent = '삭제';
    del.addEventListener('click', () => removeTodo(t));
    li.append(chk, mid, del);
    tList.append(li);
  });
}
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
  todos = [];
  tList.replaceChildren();
  $('todoCount').textContent = '';
}
function addTodo() {
  const v = $('todoInput').value.trim();
  if (!v) return;
  if (!state.db || !state.me) { alert('로그인이 필요해요.'); return; }
  $('todoInput').value = '';
  addDoc(collection(state.db, 'todos'), { text: v.slice(0, 200), done: false, doneBy: '', by: myName(), uid: state.me.uid, createdAt: serverTimestamp() })
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
    text: String(t.text).slice(0, 200), done: !!t.done, doneBy: t.done ? myName() : '', by: myName(), uid: state.me.uid, createdAt: serverTimestamp()
  }))).then(() => { try { localStorage.setItem('hub_todos_migrated', '1'); } catch {} }).catch(todoFail);
}

export { startTodos as start, stopTodos as stop, migrateLocalTodos };

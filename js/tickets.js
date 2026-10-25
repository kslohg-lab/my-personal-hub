// 게임 티켓 (Firestore wallets/{id} + wallets/{id}/log)
//  - 아빠·엄마(FAMILY의 parent)가 채아·지아에게 티켓을 주거나 회수, 아이들은 게임 입장할 때 티켓을 냄 (부모님은 무료)
//  - wallets/{id}: { name, balance }   (id = 이메일 앞부분: chaea, jia)  → 잔액은 문서 하나만 읽으면 됨
//  - wallets/{id}/log/*: { amount(+/-), kind: grant|revoke|spend, reason, game?, by, uid, createdAt }  → 내역
//  - games.js의 openGame()이 window.hubTickets.enter(game)을 불러서 입장 여부를 정함 (이 파일이 없으면 모두 무료 입장)
import { $ } from './util.js?v=1.15';
import { state, myName, FAMILY, collection, query, orderBy, limit, onSnapshot, serverTimestamp, doc, writeBatch, increment } from './firebase-init.js?v=1.15';

const KIDS = FAMILY.filter(f => !f.parent).map(f => ({ name: f.name, id: f.email.split('@')[0] }));
const GRACE_MS = 5 * 60 * 1000;      // 방금 낸 게임에 다시 들어오면 무료 (실수로 나갔을 때)
const mk = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const when = ts => {
  const d = ts && ts.toDate ? ts.toDate() : null;
  return d ? d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
};
const FIELD = 'bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500';

let started = false, isParent = false;
let ids = [];                         // 내가 보는 지갑 id들 (아이: 나, 부모: 아이들 전부)
let bal = {};                         // id -> 잔액 (null = 아직 모름)
let logs = {};                        // id -> [내역]
let unsubs = [], logUnsubs = [];
let panelOpen = false;
const recent = {};                    // 게임 id -> 마지막으로 입장비를 낸 시각

const walletRef = id => doc(state.db, 'wallets', id);
const failMsg = e => {
  const c = e && (e.code || e.message);
  return '처리하지 못했어요 (' + c + ')' + (c === 'permission-denied' ? '\nFirestore 규칙에 wallets 규칙이 추가됐는지 확인하세요.' : '');
};
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('timeout'), { code: 'timeout' })), ms))]);

/* ---------- 쓰기 ---------- */
function writeLedger(kid, amount, kind, extra) {
  const b = writeBatch(state.db);
  b.set(walletRef(kid.id), { name: kid.name, balance: increment(amount) }, { merge: true });
  b.set(doc(collection(state.db, 'wallets', kid.id, 'log')), { amount, kind, reason: '', ...extra, by: myName(), uid: state.me.uid, createdAt: serverTimestamp() });
  return b.commit();
}

/* ---------- 게임 입장 관문 (games.js가 호출) ---------- */
async function enter(g) {
  if (!started || isParent || !g.cost) return true;
  const me = KIDS.find(k => k.id === state.me.id);
  if (!me) return true;
  const t = recent[g.id];
  if (t && Date.now() - t < GRACE_MS) return true;
  const have = bal[me.id];
  if (have == null) { alert('티켓 정보를 불러오는 중이에요. 잠시 뒤에 다시 눌러 주세요.'); return false; }
  if (have < g.cost) { alert('🎫 티켓이 부족해요.\n필요한 티켓 ' + g.cost + '장 · 지금 ' + have + '장\n아빠·엄마에게 티켓을 받아 보세요!'); return false; }
  if (!confirm('🎫 티켓 ' + g.cost + '장을 내고 "' + g.title + '"에 들어갈까요?\n(남은 티켓 ' + have + '장 → ' + (have - g.cost) + '장)\n※ 5분 안에 같은 게임에 다시 들어가면 무료예요.')) return false;
  try {
    await withTimeout(writeLedger(me, -g.cost, 'spend', { game: g.id, reason: g.title }), 8000);
  } catch (e) {
    alert(e.code === 'timeout' ? '인터넷 연결이 느려서 입장하지 못했어요. 연결을 확인하고 다시 눌러 주세요.' : failMsg(e));
    return false;
  }
  recent[g.id] = Date.now();
  return true;
}

/* ---------- 화면 ---------- */
function renderBar() {
  if (!started) return;
  const label = $('tkLabel');
  if (isParent) {
    label.textContent = '👪 ' + KIDS.map(k => k.name + ' 🎫' + (bal[k.id] == null ? '…' : bal[k.id])).join(' · ');
  } else {
    const me = KIDS.find(k => k.id === state.me.id), v = me ? bal[me.id] : null;
    label.textContent = '🎫 내 티켓 ' + (v == null ? '…' : v + '장');
  }
  try { document.dispatchEvent(new CustomEvent('hub:sum', { detail: { tickets: label.textContent } })); } catch {}
  $('tkToggle').textContent = panelOpen ? '닫기' : (isParent ? '티켓 관리' : '내역');
}

function historyList() {
  const all = [];
  ids.forEach(id => (logs[id] || []).forEach(l => all.push({ ...l, kid: (KIDS.find(k => k.id === id) || {}).name })));
  all.sort((a, b) => ((b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0)));
  const box = mk('div', 'space-y-1.5');
  if (!all.length) { box.append(mk('div', 'text-xs text-slate-500 text-center py-3', ids.some(id => logs[id] === undefined) ? '불러오는 중...' : '아직 내역이 없어요.')); return box; }
  all.slice(0, 20).forEach(l => {
    const row = mk('div', 'flex items-center gap-2 text-xs');
    const amt = mk('span', 'shrink-0 w-10 text-right font-bold ' + (l.amount > 0 ? 'text-emerald-400' : 'text-rose-400'), (l.amount > 0 ? '+' : '') + l.amount);
    const mid = mk('div', 'flex-1 min-w-0');
    mid.append(mk('div', 'text-slate-200 truncate', (isParent && l.kid ? l.kid + ' · ' : '') + (l.reason || (l.kind === 'grant' ? '티켓 받음' : l.kind === 'revoke' ? '티켓 회수' : '게임 입장'))),
      mk('div', 'text-[10px] text-slate-500', (l.kind === 'spend' ? '입장' : (l.by || '') + (l.kind === 'revoke' ? ' 회수' : ' 지급')) + ' · ' + when(l.createdAt)));
    row.append(amt, mid);
    box.append(row);
  });
  return box;
}

function renderPanel() {
  const p = $('tkPanel');
  if (!panelOpen) { p.hidden = true; return; }
  // 입력 중인 값은 유지하려고 부모 폼은 한 번만 만들고, 내역만 다시 그림
  if (isParent) {
    if (!p.querySelector('#tkForm')) buildParentForm(p);
    p.querySelector('#tkHist').replaceChildren(mk('div', 'text-sm font-bold text-slate-200', '최근 내역'), historyList());
  } else {
    p.replaceChildren(mk('div', 'text-sm font-bold text-slate-200', '내 티켓 내역'), historyList());
  }
  p.hidden = false;
}

function buildParentForm(p) {
  p.replaceChildren();
  const form = mk('div', 'space-y-2');
  form.id = 'tkForm';
  form.append(mk('div', 'text-sm font-bold text-slate-200', '🎫 티켓 주기 / 회수'));
  const who = mk('select', 'w-full ' + FIELD);
  KIDS.forEach(k => who.append(new Option(k.name, k.id)));
  who.setAttribute('aria-label', '받는 사람');
  const row = mk('div', 'flex items-center gap-2');
  const amt = mk('input', 'w-20 ' + FIELD);
  amt.type = 'number'; amt.min = '1'; amt.max = '99'; amt.value = '1'; amt.inputMode = 'numeric'; amt.setAttribute('aria-label', '티켓 수');
  row.append(amt);
  [1, 3, 5, 10].forEach(n => {
    const c = mk('button', 'px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs', String(n));
    c.addEventListener('click', () => { amt.value = String(n); });
    row.append(c);
  });
  const reason = mk('input', 'w-full ' + FIELD);
  reason.type = 'text'; reason.maxLength = 40; reason.autocomplete = 'off'; reason.placeholder = '이유 (예: 숙제 다 했어요)';
  const err = mk('p', 'text-xs text-red-400');
  const btns = mk('div', 'flex gap-2');
  const give = mk('button', 'flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold', '🎫 주기');
  const take = mk('button', 'px-4 py-2 bg-slate-800 text-rose-400 rounded-lg text-sm', '회수');
  btns.append(give, take);
  const act = sign => {
    err.textContent = '';
    const n = Math.floor(Number(amt.value));
    if (!(n >= 1 && n <= 99)) { err.textContent = '티켓 수는 1~99 사이로 적어 주세요.'; return; }
    const kid = KIDS.find(k => k.id === who.value);
    if (sign < 0 && n > (bal[kid.id] || 0)) { err.textContent = kid.name + '의 티켓은 ' + (bal[kid.id] || 0) + '장뿐이라 더 회수할 수 없어요.'; return; }
    const why = reason.value.trim().slice(0, 40);
    const kind = sign > 0 ? 'grant' : 'revoke';
    give.disabled = take.disabled = true;
    writeLedger(kid, sign * n, kind, { reason: why }).then(() => { reason.value = ''; amt.value = '1'; })
      .catch(e => { err.textContent = failMsg(e); })
      .finally(() => { give.disabled = take.disabled = false; });
  };
  give.addEventListener('click', () => act(1));
  take.addEventListener('click', () => act(-1));
  form.append(who, row, reason, err, btns);
  const hist = mk('div', 'space-y-2 pt-1');
  hist.id = 'tkHist';
  p.append(form, mk('div', 'border-t border-slate-800'), hist);
}

function subscribeLogs() {
  logUnsubs.forEach(u => u()); logUnsubs = [];
  ids.forEach(id => {
    logUnsubs.push(onSnapshot(query(collection(state.db, 'wallets', id, 'log'), orderBy('createdAt', 'desc'), limit(15)), snap => {
      logs[id] = snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
      if (panelOpen) renderPanel();
    }, e => console.error('티켓 내역을 불러오지 못했어요', e)));
  });
}

$('tkToggle').addEventListener('click', () => {
  if (!started) return;
  panelOpen = !panelOpen;
  if (panelOpen) subscribeLogs(); else { logUnsubs.forEach(u => u()); logUnsubs = []; }
  renderBar(); renderPanel();
});

/* ---------- 시작 / 종료 ---------- */
function startTickets() {
  if (started || !state.db || !state.me) return;
  started = true;
  isParent = !!state.me.parent;
  ids = isParent ? KIDS.map(k => k.id) : (KIDS.some(k => k.id === state.me.id) ? [state.me.id] : []);
  ids.forEach(id => {
    bal[id] = null;
    unsubs.push(onSnapshot(walletRef(id), snap => {
      bal[id] = snap.exists() ? (Number(snap.data().balance) || 0) : 0;
      renderBar();
    }, e => { console.error('티켓 잔액을 불러오지 못했어요', e); $('tkLabel').textContent = '⚠ 티켓을 불러오지 못했어요 (' + (e.code || e.message) + ')'; }));
  });
  window.hubTickets = { enter };
  document.querySelectorAll('.tkBadge').forEach(b => { b.hidden = isParent; });
  $('tkBar').hidden = false;
  renderBar();
}
function stopTickets() {
  unsubs.forEach(u => u()); logUnsubs.forEach(u => u());
  unsubs = []; logUnsubs = [];
  started = false; isParent = false; panelOpen = false; ids = []; bal = {}; logs = {};
  Object.keys(recent).forEach(k => delete recent[k]);
  delete window.hubTickets;
  document.querySelectorAll('.tkBadge').forEach(b => { b.hidden = true; });
  $('tkBar').hidden = true; $('tkPanel').hidden = true; $('tkPanel').replaceChildren();
  $('tkLabel').textContent = '';
}

export { startTickets as start, stopTickets as stop };

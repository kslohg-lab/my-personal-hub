// 가족 달력 (Firestore events 컬렉션) — 공휴일은 holidays.js의 고정 표(빨간 날) + 홈 화면 "다가오는 일정"
//  - 일정: { title, date:'YYYY-MM-DD', time:'' | 'HH:MM', who:'' | 가족이름, repeat:'' | 'yearly', memo, by, uid, createdAt }
//  - 달력은 화면에 보이는 6주 구간만 구독, 매년 반복(생일·기념일)은 따로 구독
//  - 일정 탭 위의 [달력 | 보드] 전환 버튼도 이 파일이 켜 준다 (이 파일이 고장 나도 보드는 기본으로 보임)
import { $ } from './util.js?v=1.15';
import { HOLIDAYS } from './holidays.js?v=1.21';
import { state, myName, FAMILY, collection, addDoc, query, orderBy, where, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc } from './firebase-init.js?v=1.15';

const NAMES = FAMILY.map(f => f.name);
const COLORS = { '': '#a78bfa', '아빠': '#60a5fa', '엄마': '#f472b6', '채아': '#fbbf24', '지아': '#34d399' };
const colorOf = w => COLORS[w] || COLORS[''];
const holidayOf = ds => HOLIDAYS[ds] || '';
const SHORT = { '부처님오신날': '석탄일', '국회의원선거일': '총선일', '지방선거일': '선거일' };   // 칸이 좁아서 긴 이름은 줄여서 표시 (날짜를 누르면 전체 이름)
const shortHol = h => h.replace(/부처님오신날|국회의원선거일|지방선거일/, m => SHORT[m]);
const DOW = ['일', '월', '화', '수', '목', '금', '토'];

/* ---------- 날짜 도구 (모두 이 기기의 현재 시간대 기준) ---------- */
const pad = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const todayStr = () => ymd(new Date());
const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
const gridStart = (y, m) => { const f = new Date(y, m, 1); return addDays(f, -f.getDay()); };
const mdLabel = ds => { const d = parse(ds); return (d.getMonth() + 1) + '/' + d.getDate() + ' (' + DOW[d.getDay()] + ')'; };
const byTime = (a, b) => (a.time || '').localeCompare(b.time || '') || (a.title || '').localeCompare(b.title || '');
// 매년 반복: 2/29 생일은 평년에는 2/28로 표시
const sameMD = (orig, ds) => {
  const md = orig.slice(5);
  if (md === '02-29' && !isLeap(+ds.slice(0, 4))) return ds.slice(5) === '02-28';
  return ds.slice(5) === md;
};
const nextYearly = (orig, t) => {
  const md = orig.slice(5), y = +t.slice(0, 4);
  for (let k = 0; k < 2; k++) {
    const yy = y + k, m = md === '02-29' && !isLeap(yy) ? '02-28' : md, ds = yy + '-' + m;
    if (ds >= t && ds >= orig) return ds;
  }
  return null;
};

const mk = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const FIELD = 'w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500';

/* ---------- 상태 ---------- */
let started = false;
let view = null, sel = '';                       // view = { y, m(0~11) }, sel = 'YYYY-MM-DD'
let monthEvents = [], yearly = [], upcoming = [];
let uMonth = null, uYearly = null, uUp = null, upFor = '';
let formEv = null;                               // null = 새 일정, 객체 = 수정 중
let calError = '', homeError = '';

const errText = e => '⚠ 일정을 불러오지 못했어요 (' + (e.code || e.message) + ')' + (e.code === 'permission-denied' ? ' — Firestore 규칙에 events 규칙을 추가해 주세요.' : '');
const saveFail = e => {
  const c = e.code || e.message;
  alert('일정 저장 실패 (' + c + ')' + (c === 'permission-denied' ? '\nFirestore 규칙에 events 규칙이 추가됐는지 확인하세요.' : ''));
};

/* ---------- 일정 탭: [달력 | 보드] 전환 ---------- */
function setSub(name) {
  const cal = name !== 'board';
  $('calView').hidden = !cal;
  $('boardView').hidden = cal;
  $('subCal').className = 'px-3 py-1 rounded-lg ' + (cal ? 'bg-indigo-600 text-white' : 'text-slate-400');
  $('subBoard').className = 'px-3 py-1 rounded-lg ' + (!cal ? 'bg-indigo-600 text-white' : 'text-slate-400');
  try { localStorage.setItem('hub_plannerSub', cal ? 'cal' : 'board'); } catch {}
}
$('subCal').addEventListener('click', () => setSub('cal'));
$('subBoard').addEventListener('click', () => setSub('board'));

/* ---------- 구독 ---------- */
function subMonth() {
  if (uMonth) { uMonth(); uMonth = null; }
  monthEvents = [];
  if (!state.db || !view) return;
  const s = gridStart(view.y, view.m);
  uMonth = onSnapshot(query(collection(state.db, 'events'), where('date', '>=', ymd(s)), where('date', '<=', ymd(addDays(s, 41))), orderBy('date', 'asc')), snap => {
    calError = '';
    monthEvents = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(e => e.repeat !== 'yearly');
    renderCal();
  }, e => { console.error(e); calError = errText(e); renderCal(); });
}
function subYearly() {
  if (uYearly) { uYearly(); uYearly = null; }
  if (!state.db) return;
  uYearly = onSnapshot(query(collection(state.db, 'events'), where('repeat', '==', 'yearly')), snap => {
    yearly = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderCal(); renderHome();
  }, e => { console.error(e); homeError = errText(e); renderHome(); });
}
function subUpcoming() {
  if (uUp) { uUp(); uUp = null; }
  upFor = todayStr();
  if (!state.db) return;
  uUp = onSnapshot(query(collection(state.db, 'events'), where('date', '>=', upFor), where('date', '<=', ymd(addDays(new Date(), 30))), orderBy('date', 'asc')), snap => {
    homeError = '';
    upcoming = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(e => e.repeat !== 'yearly');
    renderHome();
  }, e => { console.error(e); homeError = errText(e); renderHome(); });
}

/* ---------- 달력 ---------- */
function eventsOn(ds) {
  const list = monthEvents.filter(e => e.date === ds);
  yearly.forEach(e => { if (ds >= e.date && sameMD(e.date, ds)) list.push(e); });
  return list.sort(byTime);
}
function goToDate(ds) {
  const d = parse(ds);
  const same = view && view.y === d.getFullYear() && view.m === d.getMonth();
  view = { y: d.getFullYear(), m: d.getMonth() };
  sel = ds;
  if (!same) subMonth();
  renderCal();
}
function shiftMonth(n) {
  const d = new Date(view.y, view.m + n, 1), now = new Date();
  view = { y: d.getFullYear(), m: d.getMonth() };
  sel = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() ? todayStr() : ymd(d);
  subMonth();
  renderCal();
}
$('calPrev').addEventListener('click', () => view && shiftMonth(-1));
$('calNext').addEventListener('click', () => view && shiftMonth(1));
$('calToday').addEventListener('click', () => view && goToDate(todayStr()));
$('calAdd').addEventListener('click', () => view && openForm(null));

function renderCal() {
  if (!view) return;
  $('calTitle').textContent = view.y + '년 ' + (view.m + 1) + '월';
  const grid = $('calGrid'), t = todayStr(), s = gridStart(view.y, view.m);
  grid.replaceChildren();
  for (let i = 0; i < 42; i++) {
    const d = addDays(s, i), ds = ymd(d), inMonth = d.getMonth() === view.m, dow = d.getDay(), evs = eventsOn(ds), hol = holidayOf(ds);
    const b = mk('button', 'h-12 rounded-lg flex flex-col items-center pt-1 text-sm '
      + (inMonth ? (dow === 0 || hol ? 'text-rose-400' : dow === 6 ? 'text-sky-400' : 'text-slate-200') : (hol ? 'text-rose-900' : 'text-slate-600'))
      + (ds === sel ? ' bg-indigo-600/30' : ' bg-slate-900/60')
      + (ds === t ? ' ring-1 ring-indigo-400' : ''));
    b.dataset.date = ds;
    b.setAttribute('aria-label', mdLabel(ds) + (hol ? ' ' + hol : '') + (evs.length ? ' 일정 ' + evs.length + '개' : ''));
    b.append(mk('span', '', String(d.getDate())));
    if (hol) { const hn = mk('span', 'block w-full px-0.5 text-center leading-none truncate ' + (inMonth ? 'text-rose-300' : 'text-rose-900'), shortHol(hol)); hn.style.fontSize = '8px'; b.append(hn); }
    const dots = mk('span', 'flex gap-0.5 ' + (hol ? 'mt-0.5' : 'mt-1'));
    evs.slice(0, 3).forEach(e => { const dot = mk('span', 'block rounded-full'); dot.style.cssText = 'width:6px;height:6px;background:' + colorOf(e.who); dots.append(dot); });
    b.append(dots);
    b.addEventListener('click', () => goToDate(ds));
    grid.append(b);
  }
  renderDay();
}

function renderDay() {
  const box = $('calDayList'), evs = eventsOn(sel), t = todayStr();
  const d = parse(sel);
  $('calDayTitle').textContent = (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + DOW[d.getDay()] + ')' + (sel === t ? ' · 오늘' : '');
  box.replaceChildren();
  if (holidayOf(sel)) box.append(mk('div', 'text-sm font-semibold text-rose-300 bg-rose-950/40 border border-rose-900/60 rounded-xl px-3 py-2', '🎌 ' + holidayOf(sel) + ' (공휴일)'));
  if (calError) { box.append(mk('div', 'text-xs text-red-400', calError)); return; }
  if (!evs.length) { box.append(mk('div', 'text-center text-slate-500 text-xs py-4', '이 날은 일정이 없어요')); return; }
  evs.forEach(e => {
    const b = mk('button', 'w-full text-left flex gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl');
    const bar = mk('span', 'shrink-0 rounded-full'); bar.style.cssText = 'width:4px;background:' + colorOf(e.who);
    const mid = mk('div', 'flex-1 min-w-0');
    const top = mk('div', 'flex items-center gap-2');
    top.append(mk('span', 'text-xs text-slate-400 shrink-0', e.time || '종일'), mk('span', 'text-sm text-slate-100 break-words min-w-0', e.title));
    const sub = mk('div', 'text-[10px] text-slate-500 mt-0.5');
    sub.textContent = (e.who ? e.who + ' 일정' : '가족 모두') + (e.repeat === 'yearly' ? ' · 🔁 매년' : '') + (e.by ? ' · ' + e.by + ' 등록' : '');
    mid.append(top, sub);
    if (e.memo) mid.append(mk('div', 'text-xs text-slate-300 mt-1 whitespace-pre-wrap break-words', e.memo));
    b.append(bar, mid);
    b.addEventListener('click', () => openForm(e));
    box.append(b);
  });
}

/* ---------- 추가 / 수정 폼 ---------- */
const form = $('calForm');
const f = {
  head: mk('div', 'text-sm font-bold text-slate-200'),
  title: mk('input', FIELD), date: mk('input', FIELD), time: mk('input', FIELD),
  who: mk('select', FIELD), repeat: mk('input'), memo: mk('input', FIELD), err: mk('p', 'text-xs text-red-400'),
  save: mk('button', 'flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold', '저장'),
  cancel: mk('button', 'px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm', '취소'),
  del: mk('button', 'px-4 py-2 bg-slate-800 text-red-400 rounded-lg text-sm', '삭제')
};
f.title.type = 'text'; f.title.maxLength = 100; f.title.placeholder = '제목 (예: 지아 학부모 상담)'; f.title.autocomplete = 'off';
f.date.type = 'date'; f.time.type = 'time';
f.memo.type = 'text'; f.memo.maxLength = 200; f.memo.placeholder = '메모 (선택)'; f.memo.autocomplete = 'off';
f.who.append(new Option('가족 모두', ''));
NAMES.forEach(n => f.who.append(new Option(n + ' 일정', n)));
f.repeat.type = 'checkbox';
f.title.setAttribute('aria-label', '제목'); f.date.setAttribute('aria-label', '날짜'); f.time.setAttribute('aria-label', '시간 (선택)'); f.who.setAttribute('aria-label', '누구 일정'); f.memo.setAttribute('aria-label', '메모');
const rowDT = mk('div', 'grid grid-cols-2 gap-2'); rowDT.append(f.date, f.time);
const rep = mk('label', 'flex items-center gap-2 text-xs text-slate-300'); rep.append(f.repeat, mk('span', '', '🔁 매년 반복 (생일·기념일)'));
const btns = mk('div', 'flex gap-2'); btns.append(f.save, f.cancel, f.del);
form.append(f.head, f.title, rowDT, f.who, rep, f.memo, f.err, btns);

function fill(d) {
  f.title.value = d.title || ''; f.date.value = d.date || sel; f.time.value = d.time || '';
  f.who.value = d.who || ''; f.repeat.checked = d.repeat === 'yearly'; f.memo.value = d.memo || '';
  f.err.textContent = '';
}
function openForm(ev) {
  formEv = ev;
  fill(ev || {});
  f.head.textContent = ev ? '일정 수정' : '새 일정';
  f.del.hidden = !ev;
  form.hidden = false;
  form.scrollIntoView({ block: 'nearest' });
  if (!ev) f.title.focus();
}
function closeForm() { form.hidden = true; formEv = null; }
f.cancel.addEventListener('click', closeForm);
function saveForm() {
  const title = f.title.value.trim(), date = f.date.value;
  if (!title) { f.err.textContent = '제목을 입력해 주세요.'; f.title.focus(); return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { f.err.textContent = '날짜를 선택해 주세요.'; return; }
  if (!state.db || !state.me) { alert('로그인이 필요해요.'); return; }
  const data = { title: title.slice(0, 100), date, time: f.time.value || '', who: f.who.value, repeat: f.repeat.checked ? 'yearly' : '', memo: f.memo.value.trim().slice(0, 200) };
  const ev = formEv;
  closeForm();
  goToDate(date);
  const p = ev
    ? updateDoc(doc(state.db, 'events', ev.id), data)
    : addDoc(collection(state.db, 'events'), { ...data, by: myName(), uid: state.me.uid, createdAt: serverTimestamp() });
  p.catch(e => { saveFail(e); openForm(ev); fill(data); });   // 실패하면 쓰던 내용 그대로 다시 열기
}
f.save.addEventListener('click', saveForm);
[f.title, f.memo].forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); saveForm(); } }));
f.del.addEventListener('click', () => {
  if (!formEv) return;
  if (!confirm('이 일정을 삭제할까요?\n"' + formEv.title + '"' + (formEv.repeat === 'yearly' ? '\n(매년 반복 일정은 모든 해에서 사라져요)' : ''))) return;
  const id = formEv.id;
  closeForm();
  deleteDoc(doc(state.db, 'events', id)).catch(saveFail);
});

/* ---------- 홈 화면: 다가오는 일정 ---------- */
function upcomingList() {
  const t = todayStr(), end = ymd(addDays(new Date(), 30)), out = [];
  upcoming.forEach(e => { if (e.date >= t && e.date <= end) out.push({ ds: e.date, e }); });
  yearly.forEach(e => { const ds = nextYearly(e.date, t); if (ds && ds <= end) out.push({ ds, e }); });
  return out.sort((a, b) => a.ds.localeCompare(b.ds) || byTime(a.e, b.e));
}
function goCalendar(ds) {
  if (window.switchTab) window.switchTab('planner');
  setSub('cal');
  goToDate(ds);
}
$('homeCal').addEventListener('click', () => goCalendar(todayStr()));
function renderHome() {
  const box = $('homeEvents');
  if (!started) return;
  box.replaceChildren();
  if (homeError) { box.append(mk('div', 'text-xs text-red-400', homeError)); return; }
  const list = upcomingList(), t = todayStr();
  if (!list.length) { box.append(mk('div', 'text-xs text-slate-500 py-2', '앞으로 30일 안에 예정된 일정이 없어요.')); return; }
  list.slice(0, 5).forEach(({ ds, e }) => {
    const n = diffDays(t, ds);
    const b = mk('button', 'w-full flex items-center gap-3 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-left');
    const chip = mk('span', 'shrink-0 w-12 text-center text-xs font-bold rounded-lg py-1 ' + (n === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'), n === 0 ? '오늘' : n === 1 ? '내일' : 'D-' + n);
    const mid = mk('div', 'flex-1 min-w-0');
    mid.append(mk('div', 'text-sm text-slate-100 truncate', (e.repeat === 'yearly' ? '🔁 ' : '') + e.title),
      mk('div', 'text-[10px] text-slate-500', mdLabel(ds) + (e.time ? ' ' + e.time : '') + ' · ' + (e.who ? e.who : '가족 모두')));
    const dot = mk('span', 'shrink-0 rounded-full'); dot.style.cssText = 'width:8px;height:8px;background:' + colorOf(e.who);
    b.append(chip, mid, dot);
    b.addEventListener('click', () => goCalendar(ds));
    box.append(b);
  });
  if (list.length > 5) box.append(mk('div', 'text-[10px] text-slate-500 text-right', '그 밖에 ' + (list.length - 5) + '개 더 있어요'));
}

// 자정이 지났거나 앱으로 돌아왔을 때 오늘 기준으로 다시 계산
document.addEventListener('visibilitychange', () => {
  if (!started || document.hidden || todayStr() === upFor) return;
  subUpcoming(); renderHome(); renderCal();
});

/* ---------- 시작 / 종료 ---------- */
function startCalendar() {
  if (started || !state.db) return;
  started = true;
  $('plannerSubs').hidden = false;
  $('homeUpcoming').hidden = false;
  let pref = 'cal';
  try { pref = localStorage.getItem('hub_plannerSub') === 'board' ? 'board' : 'cal'; } catch {}
  setSub(pref);
  const now = new Date();
  view = { y: now.getFullYear(), m: now.getMonth() };
  sel = todayStr();
  closeForm();
  subMonth(); subYearly(); subUpcoming();
  renderCal(); renderHome();
}
function stopCalendar() {
  [uMonth, uYearly, uUp].forEach(u => { if (u) u(); });
  uMonth = uYearly = uUp = null;
  started = false; view = null; sel = ''; upFor = '';
  monthEvents = []; yearly = []; upcoming = []; calError = ''; homeError = '';
  closeForm();
  $('calGrid').replaceChildren(); $('calDayList').replaceChildren(); $('homeEvents').replaceChildren();
  $('calTitle').textContent = ''; $('calDayTitle').textContent = '';
  $('plannerSubs').hidden = true; $('homeUpcoming').hidden = true;
  // 기능이 꺼져도 보드는 보이게
  $('calView').hidden = true; $('boardView').hidden = false;
}

export { startCalendar as start, stopCalendar as stop };

// 홈 화면 '오늘 요약' 배너 (v1.25)
//  - 일정(calendar)·할 일(todos)·채팅(chat)·티켓(tickets) 모듈이 'hub:sum' 이벤트로 요약 값을 보내오면 여기서 모아 한 배너로 보여줌.
//  - 이 파일이 고장 나도 다른 기능에는 영향 없음 (배너는 원래 문구 그대로 남음).
//  - 보내는 값: { date, holiday, todayEvents:[{title,yearly}]|null } / { todoOpen, todoMine } / { unread } / { tickets:'글자' }
import { $ } from './util.js?v=1.15';
import { state } from './firebase-init.js?v=1.15';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
let S = {}, started = false, orig = null;
const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const go = (tab, sub) => () => {
  if (window.switchTab) window.switchTab(tab);
  if (sub) { const b = $(sub); if (b) b.click(); }
};
function greet(h) {
  if (h >= 5 && h < 11) return '좋은 아침이에요';
  if (h >= 11 && h < 17) return '안녕하세요';
  if (h >= 17 && h < 22) return '좋은 저녁이에요';
  return '늦은 시간이에요';
}
function chip(icon, text, onClick, hot) {
  const b = mk('button', 'flex-1 min-w-0 text-left rounded-xl px-3 py-2 border ' + (hot ? 'bg-indigo-600/25 border-indigo-400/50' : 'bg-slate-950/50 border-slate-700/70'));
  b.append(mk('div', 'text-base leading-none mb-1', icon), mk('div', 'text-xs font-semibold text-slate-100 leading-snug', text));
  b.addEventListener('click', onClick);
  return b;
}
function render() {
  const box = $('todayBox');
  if (!started || !box || !state.me) return;
  const now = new Date();
  const head = mk('div', 'flex flex-wrap items-center gap-1.5');
  head.append(mk('span', 'text-xs font-semibold text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-2.5 py-1 rounded-full', (now.getMonth() + 1) + '월 ' + now.getDate() + '일 (' + DOW[now.getDay()] + ')'));
  if (S.holiday) head.append(mk('span', 'text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 rounded-full', '🎌 ' + S.holiday));
  const kids = [head, mk('h2', 'text-xl font-bold text-slate-100 mt-3', greet(now.getHours()) + ', ' + state.me.name)];

  const ev = S.todayEvents;
  if (Array.isArray(ev)) {
    const special = ev.filter(e => e.yearly).slice(0, 2);
    special.forEach(e => kids.push(mk('p', 'text-sm font-semibold text-amber-300 mt-1', '🎉 오늘은 ' + e.title + '이에요!')));
    const normal = ev.filter(e => !e.yearly);
    if (normal.length) kids.push(mk('p', 'text-xs text-slate-300 mt-1 truncate', '📌 ' + normal.map(e => e.title).slice(0, 3).join(' · ') + (normal.length > 3 ? ' 외 ' + (normal.length - 3) + '개' : '')));
    else if (!special.length) kids.push(mk('p', 'text-xs text-slate-400 mt-1', '오늘은 정해진 일정이 없어요.'));
  } else kids.push(mk('p', 'text-xs text-slate-400 mt-1', '가족 실시간 채팅, 사진 공유, 일정 관리를 한곳에서 즐겨보세요.'));

  const row = mk('div', 'flex gap-2 mt-4');
  if (Array.isArray(ev)) row.append(chip('📅', '오늘 일정 ' + ev.length + '개', go('planner', 'subCal'), ev.length > 0));
  if (S.todoOpen != null) row.append(chip('✅', '남은 할 일 ' + S.todoOpen + '개' + (S.todoMine ? ' (나 ' + S.todoMine + ')' : ''), go('planner', 'subBoard'), S.todoMine > 0));
  if (S.unread != null) row.append(chip('💬', S.unread ? '안 읽은 채팅 ' + (S.unread > 99 ? '99+' : S.unread) : '새 채팅 없음', go('chat'), S.unread > 0));
  if (row.children.length) kids.push(row);
  if (S.tickets) {
    const t = mk('button', 'w-full mt-2 text-left rounded-xl px-3 py-2 border bg-slate-950/50 border-slate-700/70 text-xs font-semibold text-slate-100 truncate', S.tickets);
    t.addEventListener('click', go('games'));
    kids.push(t);
  }
  box.replaceChildren(...kids);
}
document.addEventListener('hub:sum', e => { if (e.detail && typeof e.detail === 'object') { Object.assign(S, e.detail); render(); } });
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });

function start() {
  const box = $('todayBox');
  if (!box) return;
  if (!orig) orig = [...box.childNodes].map(n => n.cloneNode(true));
  started = true;
  render();
}
function stop() {
  started = false; S = {};
  const box = $('todayBox');
  if (box && orig) box.replaceChildren(...orig.map(n => n.cloneNode(true)));
}
export { start, stop };

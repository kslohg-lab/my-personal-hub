// 게임 점수판 (Firestore scores/{게임id}__{사람id})
//  - 게임들은 자기 최고 기록을 이 기기의 localStorage에 저장해 둔다 (허브와 같은 주소라서 허브가 읽을 수 있음) → 게임 파일은 고치지 않음.
//  - 허브가 그 값을 읽어, 내 Firestore 기록보다 높으면 올린다 (기록은 올라가기만 함). 앱을 켤 때, 게임을 닫을 때, 앱으로 돌아올 때 확인.
//  - scores/{game}__{id}: { game, name, uid, score(정수), at }   (id = 이메일 앞부분: dad, mom, chaea, jia)
//  - 읽는 키: 산수 몬스터 mmBest / 스피드 매쓰 mb2_best / 아이스크림 iceCreamV1.bestDay / 붕어빵 bungeoppangV1.day / 체스 chessV1.rec / 스도쿠 sudokuV1.clears / 짝 맞추기 memoryV1.bestLevel / 동물 달리기 animalRunV6.best
//  - 게임을 추가하려면 아래 BOARD에 한 줄 (게임이 기록을 어떤 localStorage 키에 저장하는지 알아야 함)
//  - 한계: 기록은 '이 기기'의 최고 기록이라, 한 기기를 여러 명이 쓰면 로그인한 사람 이름으로 올라감.
import { $ } from './util.js?v=1.15';
import { state, FAMILY, collection, onSnapshot, serverTimestamp, doc, setDoc } from './firebase-init.js?v=1.15';

const MEMBERS = FAMILY.map(f => ({ id: f.email.split('@')[0], name: f.name }));
const MAX = 10000000;
const num = v => { v = Math.floor(Number(v)); return Number.isFinite(v) && v > 0 ? Math.min(v, MAX) : 0; };
const ls = k => { try { return localStorage.getItem(k); } catch { return null; } };
const BOARD = [
  { id: 'math-monster', title: '산수 몬스터', icon: '👾', unit: '점', read: () => num(ls('mmBest')) },
  { id: 'speed-math', title: '스피드 매쓰', icon: '⚡', unit: '점', read: () => num(ls('mb2_best')) },
  { id: 'ice-cream', title: '아이스크림 가게 · 클리어한 일차', icon: '🍦', unit: '일', read: () => { try { return num(((JSON.parse(ls('iceCreamV1') || 'null') || {}).bestDay || 1) - 1); } catch { return 0; } } },   // bestDay = 도달한 일차 → 클리어한 날 = 그 -1
  { id: 'bungeoppang', title: '붕어빵 타이쿤 · 장사한 날', icon: '🐟', unit: '일', read: () => { try { return num(((JSON.parse(ls('bungeoppangV1') || 'null') || {}).day || 1) - 1); } catch { return 0; } } },   // day = 다음에 할 일차
  { id: 'chess', title: '체스 · 컴퓨터 이긴 횟수', icon: '♞', unit: '승', read: () => { try { const r = (JSON.parse(ls('chessV1') || 'null') || {}).rec || {}; return num([1, 2, 3].reduce((a, l) => a + (+((r[l] || {}).w) || 0), 0)); } catch { return 0; } } },   // 레벨 1~3 승수 합
  { id: 'sudoku', title: '스도쿠 · 9×9 클리어 횟수', icon: '🔢', unit: '판', read: () => { try { const c = (JSON.parse(ls('sudokuV1') || 'null') || {}).clears || {}; return num((+c.n9 || 0) + (+c.h9 || 0)); } catch { return 0; } } },   // 쉬운 4×4·6×6과 매일 같은 '오늘의 퍼즐'은 제외(반복으로 올릴 수 있어서)
  { id: 'memory-match', title: '짝 맞추기 · 클리어한 단계', icon: '🃏', unit: '단계', read: () => { try { return num(((JSON.parse(ls('memoryV1') || 'null') || {}).bestLevel || 1) - 1); } catch { return 0; } } },   // bestLevel = 도달한 단계 → 클리어 = -1
  { id: 'animal-run', title: '동물 달리기 · 무한 모드', icon: '🐾', unit: 'm', read: () => { try { return num((JSON.parse(ls('animalRunV6') || 'null') || {}).best); } catch { return 0; } } }
];
const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

let started = false, unsub = null, open = false, err = '';
let scores = {};            // 게임id -> { 사람id: { name, score } }
let sent = {};              // 문서id -> 방금 올린 점수 (같은 점수를 또 올리지 않게)
const docId = (g, id) => g + '__' + id;
const myId = () => (state.me && state.me.id) || '';
const myScore = g => ((scores[g] || {})[myId()] || {}).score || 0;

// 내 기기 기록이 서버의 내 기록보다 높으면 올림
function sync() {
  if (!started || !state.db || !state.me || err) return;
  const me = MEMBERS.find(m => m.id === myId());
  if (!me) return;
  BOARD.forEach(b => {
    let local = 0;
    try { local = b.read(); } catch {}
    const id = docId(b.id, me.id);
    if (local <= 0 || local <= myScore(b.id) || local <= (sent[id] || 0)) return;
    sent[id] = local;
    setDoc(doc(state.db, 'scores', id), { game: b.id, name: me.name, uid: state.me.uid, score: local, at: serverTimestamp() })
      .catch(e => { sent[id] = 0; console.error('점수 저장 실패', e); });
  });
}

/* ---------- 화면 ---------- */
const fmt = n => n.toLocaleString('ko-KR');
function render() {
  const bar = $('sbBar'), panel = $('sbPanel');
  if (!bar) return;
  bar.hidden = !started;
  $('sbToggle').textContent = open ? '닫기' : '보기';
  panel.hidden = !started || !open;
  if (!started || !open) return;
  panel.replaceChildren();
  if (err) { panel.append(mk('div', 'text-xs text-red-400', err)); return; }
  const MEDAL = ['🥇', '🥈', '🥉'];
  BOARD.forEach(b => {
    const box = mk('div', 'space-y-1');
    box.append(mk('div', 'text-xs font-bold text-slate-300', b.icon + ' ' + b.title));
    const rows = MEMBERS.map(m => ({ m, s: ((scores[b.id] || {})[m.id] || {}).score || 0 })).sort((a, c) => c.s - a.s);
    let rank = 0;
    rows.forEach(r => {
      const mine = r.m.id === myId();
      const row = mk('div', 'flex items-center gap-2 text-sm rounded-lg px-2 py-1 ' + (mine ? 'bg-indigo-600/20' : ''));
      const medal = r.s > 0 ? (MEDAL[rank++] || '·') : '';
      row.append(mk('span', 'w-6 text-center shrink-0', medal),
        mk('span', 'flex-1 min-w-0 truncate ' + (r.s > 0 ? 'text-slate-100' : 'text-slate-500'), r.m.name + (mine ? ' (나)' : '')),
        mk('span', 'shrink-0 font-bold ' + (r.s > 0 ? 'text-amber-300' : 'text-slate-600'), r.s > 0 ? fmt(r.s) + b.unit : '기록 없음'));
      box.append(row);
    });
    panel.append(box);
  });
  panel.append(mk('div', 'text-[10px] text-slate-500', '※ 각자 이 기기에서 낸 최고 기록이에요. 게임을 하고 나오면 자동으로 올라가요.'));
}
function toggle() { open = !open; render(); }

/* ---------- 시작 / 종료 ---------- */
function start() {
  if (started || !state.db) return;
  started = true; err = ''; scores = {}; sent = {};
  unsub = onSnapshot(collection(state.db, 'scores'), snap => {
    const next = {};
    snap.docs.forEach(d => {
      const v = d.data(), g = v && v.game, id = d.id.split('__')[1];
      if (!g || !id || !BOARD.some(b => b.id === g)) return;
      (next[g] = next[g] || {})[id] = { name: v.name, score: num(v.score) };
    });
    scores = next; err = '';
    render(); sync();
  }, e => {
    console.error(e);
    err = '기록을 불러오지 못했어요 (' + (e.code || e.message) + ')' + (e.code === 'permission-denied' ? '\nFirestore 규칙에 scores 규칙이 추가됐는지 확인하세요.' : '');
    render();
  });
  render();
}
function stop() {
  if (unsub) { unsub(); unsub = null; }
  started = false; open = false; scores = {}; sent = {}; err = '';
  render();
}
$('sbToggle') && $('sbToggle').addEventListener('click', toggle);
document.addEventListener('hub:gameclosed', () => setTimeout(sync, 300));
document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });

export { start, stop };

// 게임·도구 목록, 전체 화면 플레이어 (일반 스크립트, core.js 다음에 로드)

// 게임·도구 목록 (새로 추가할 때는 여기에 한 줄 + games/폴더이름/ 에 index.html, thumb.svg 넣기)
// cat: 아래 CATS의 id (party 다 같이 / duo 둘이서 / action 액션 / puzzle 퍼즐 / shop 가게 운영 / study 공부 / tool 가족 도구) — 분류를 바꾸려면 이 값만 바꾸면 됨
// v: 파일을 새로 올릴 때마다 숫자를 올리면 폰이 옛 파일을 캐시에서 쓰지 않음
// cost: 입장에 필요한 게임 티켓 수 (부모님 계정은 무료, 0이거나 없으면 무료) — 도구는 티켓 없이 무료
const CATS = [
  { id: 'party', title: '🎉 다 같이', sub: '가족이 각자 폰으로 모여서 해요' },
  { id: 'duo', title: '👫 둘이서', sub: '둘이 마주 앉아 한 판!' },
  { id: 'action', title: '🏃 액션', sub: '달리고 피하고 뽑고!' },
  { id: 'puzzle', title: '🧩 퍼즐', sub: '머리를 써서 차근차근' },
  { id: 'shop', title: '🏪 가게 운영', sub: '내 가게를 키워요' },
  { id: 'study', title: '📚 공부', sub: '놀면서 계산·속담 실력 쑥쑥' },
  { id: 'tool', title: '🧭 가족 도구', sub: '여행·골프처럼 우리 가족이 같이 쓰는 것들' }
];
const GAMES = [
  { id: 'math-monster',  cat: 'study', title: '산수 몬스터 격파!',       desc: '계산해서 하트를 쏴요! 몬스터를 펑펑', v: 2, cost: 1 },
  { id: 'speed-math',    cat: 'study', title: '스피드 매쓰 블리츠 2',    desc: '빠르게 풀어보는 계산 대결', v: 2, cost: 1 },
  { id: 'animal-run',    cat: 'action', title: '동물 친구 달리기',        desc: '귀여운 동물 친구와 함께 달려요', landscape: true, v: 11, cost: 1 },
  { id: 'animal-dash',   cat: 'action', title: '동물 친구 달리기 2',      desc: '새 엔진으로 다시 만든 달리기! 보스전·보너스 타임', landscape: true, v: 1, cost: 1 },
  { id: 'block-puzzle',  cat: 'puzzle', title: '동물 블록 퍼즐',          desc: '블록을 놓아 줄을 채우면 펑! 이어서 하기도 돼요', v: 1, cost: 1 },
  { id: 'animal-merge',  cat: 'puzzle', title: '동물 친구 합치기',        desc: '같은 친구끼리 부딪히면 더 큰 친구로 쑥!', v: 1, cost: 1 },
  { id: 'animal-survivor', cat: 'action', title: '동물 친구 서바이벌',    desc: '몰려오는 장난꾸러기를 5분 동안 막아요', v: 1, cost: 1 },
  { id: 'robo-run',      cat: 'action', title: '로봇 달리기 3D',         desc: '3D 도시를 밀어서 피하며 달려요', v: 1, cost: 1 },
  { id: 'slime-castle',  cat: 'puzzle', title: '슬라임 성 와르르',       desc: '새총으로 구슬을 날려 슬라임 성을 무너뜨려요', landscape: true, v: 1, cost: 1 },
  { id: 'block-tower',   cat: 'puzzle', title: '와르르 블록 탑',         desc: '블록을 높이 쌓아요! 혼자 또는 한 폰으로 같이', v: 1, cost: 1 },
  { id: 'mini-golf',     cat: 'action', title: '알록달록 미니골프',      desc: '9홀 미니골프! 혼자 또는 한 폰으로 가족 대결', v: 1, cost: 1 },
  { id: 'neon-brick',    cat: 'action', title: '네온 벽돌깨기',          desc: '반짝이는 벽돌을 깨요! 캡슐로 공 3개·레이저', v: 1, cost: 1 },
  { id: 'stack-3d',      cat: 'action', title: '착착 쌓기 3D',           desc: '톡! 딱 맞춰 내려놓고 하늘까지 쌓아요', v: 1, cost: 1 },
  { id: 'train-snake',   cat: 'action', title: '꼬마 기차',              desc: '손님을 태울수록 길어지는 기차! 밀어서 방향 바꾸기', v: 1, cost: 1 },
  { id: 'hoop-shot',     cat: 'action', title: '슝슝 농구',              desc: '당겼다 놓아서 슛! 60초 동안 몇 골?', v: 1, cost: 1 },
  { id: 'space-shooter', cat: 'action', title: '반짝 우주 슈팅',         desc: '외계 함대를 물리쳐요! 5파도마다 보스', v: 1, cost: 1 },
  { id: 'rhythm-tiles',  cat: 'action', title: '피아노 타일',            desc: '검은 타일을 누르면 노래가 나와요', v: 1, cost: 1 },
  { id: 'zigzag-3d',     cat: 'action', title: '지그재그 3D',            desc: '톡! 할 때마다 방향 전환, 길 따라 데굴데굴', v: 1, cost: 1 },
  { id: 'jelly-jump',    cat: 'action', title: '통통 점프',              desc: '젤리를 발판 위로 통통! 하늘 끝까지', v: 1, cost: 1 },
  { id: 'fruit-slice',   cat: 'action', title: '슥삭 과일 썰기',         desc: '날아오는 과일을 슥! 폭탄은 조심', v: 1, cost: 1 },
  { id: 'num-2048',      cat: 'puzzle', title: '2048 사탕 숫자',         desc: '밀어서 같은 숫자를 합쳐 2048까지', v: 1, cost: 1 },
  { id: 'bubble-pop',    cat: 'puzzle', title: '방울 터뜨리기',          desc: '같은 색 방울 3개면 퐁! 매달린 방울은 우수수', v: 1, cost: 1 },
  { id: 'water-sort',    cat: 'puzzle', title: '색깔 물 정렬',           desc: '같은 색끼리 한 병에! 단계가 끝없이 이어져요', v: 1, cost: 1 },
  { id: 'claw-machine',  cat: 'action', title: '말랑말랑 인형뽑기',       desc: '진짜처럼 흔들리는 집게로 동물 인형 33종 모으기', v: 2, cost: 1 },
  { id: 'bungeoppang',   cat: 'shop', title: '붕어빵 타이쿤',           desc: '붕어빵을 구워 팔고 가게를 키워요', v: 1, cost: 1 },
  { id: 'bungeoppang-shop', cat: 'shop', title: '붕어빵 가게', desc: '내 가게를 꾸미고 키워요! 단골도 모아요', v: 3, cost: 1 },
  { id: 'butcher', cat: 'shop', title: '우리 정육점', desc: '부위별로 고기를 사서 썰고 구워 팔아요', v: 2, cost: 1 },
  { id: 'bungeoppang2', cat: 'shop', title: '붕어빵 서바이벌',         desc: '컷트라인을 못 넘으면 탈락! 몇 단계까지 갈까요', v: 1, cost: 1 },
  { id: 'ice-cream',     cat: 'shop', title: '아이스크림 가게 타이쿤',  desc: '주문대로 아이스크림을 쌓아 팔고 가게를 키워요', v: 1, cost: 1 },
  { id: 'chess',         cat: 'duo', title: '체스',                    desc: '컴퓨터와 겨루거나 둘이서 대결해요', v: 1, cost: 1 },
  { id: 'sudoku',        cat: 'puzzle', title: '스도쿠',                  desc: '숫자 퍼즐 · 4×4부터 9×9, 오늘의 퍼즐도 있어요', v: 1, cost: 1 },
  { id: 'memory-match',  cat: 'puzzle', title: '짝 맞추기',               desc: '같은 그림 두 장을 찾는 기억력 게임', v: 1, cost: 1 },
  { id: 'proverb',       cat: 'study', title: '속담 맞추기',             desc: '속담을 맞히고 도감을 채워요',       v: 1, cost: 1 },
  { id: 'word-mafia',    cat: 'party', title: '단어 마피아',             desc: '가족이 각자 폰으로! 단어를 모르는 마피아를 찾아요', v: 2 },
  { id: 'just-one',      cat: 'party', title: '저스트 원',               desc: '가족 협동! 겹치지 않는 힌트로 정답을 맞혀요', v: 2 },
  { id: 'catch-mind',    cat: 'party', title: '캐치마인드',              desc: '한 명이 그리면 다 같이 맞혀요! 각자 폰으로', v: 2 },
  { id: 'same-mind',     cat: 'party', title: '이심전심',                desc: '같은 질문, 같은 답이면 점수! 마음이 통할까?', v: 3 },
  { id: 'ito',           cat: 'party', title: '숫자 텔레파시',           desc: '비밀 숫자를 말로 표현해서 작은 순서대로! 협동', v: 3 },
  { id: 'who-most',      cat: 'party', title: '누가 제일?',              desc: '우리 가족 중 누가 제일 ○○할까? 투표하고 칭호 받기', v: 3 },
  { id: 'draw-relay',    cat: 'party', title: '그림 릴레이',             desc: '단어→그림→맞히기→그림… 돌고 나면 웃음 폭발', v: 2 },
  { id: 'truth-lie',     cat: 'party', title: '진실 혹은 거짓',          desc: '내 이야기 3개 중 거짓말 하나! 찾아낼 수 있을까?', v: 2 },
  { id: 'undercover',    cat: 'party', title: '언더커버',                desc: '나만 비슷한 다른 단어? 나도 모르는 스파이 찾기', v: 2 },
  { id: 'word-duet',     cat: 'duo', title: '단어 듀엣',              desc: '둘이 한 팀! 힌트 하나로 초록 단어 15개 찾기 (2인)', v: 1 },
  { id: 'spice-market',  cat: 'duo', title: '보석 시장',              desc: '먼저 팔수록 비싸게! 둘이서 하는 장사 대결 (2인)', v: 1 },
  { id: 'quilt',         cat: 'duo', title: '조각보 퍼즐',            desc: '조각을 사서 이불 빈칸 채우기 퍼즐 대결 (2인)', v: 1 },
  { id: 'tile-garden',   cat: 'duo', title: '타일 정원',              desc: '예쁜 타일을 골라 벽 무늬 완성하기 (2인)', v: 1 },
  { id: 'mind-dial',     cat: 'party', title: '마음 다이얼',            desc: '"차가운↔뜨거운" 어디쯤? 한마디 힌트로 위치 맞히기', v: 1 },
  { id: 'word-team',     cat: 'party', title: '단어 팀전',              desc: '2:2 팀 대결! 팀장 힌트로 우리 팀 단어 찾기 (4인)', v: 1 },
  { id: 'color-guess',   cat: 'party', title: '색깔 맞히기',            desc: '색깔 이름 없이 설명하고 96가지 색 중 한 칸 맞히기', v: 1 },
  { id: 'skull',         cat: 'party', title: '해골 블러핑',            desc: '꽃일까 해골일까? 허세와 눈치의 심리전 (3~4인)', v: 1 },
  { id: 'fake-artist',   cat: 'party', title: '가짜 화가',              desc: '한 줄씩 이어 그리며 제시어 모르는 가짜 찾기 (3인+)', v: 1 },
  { id: 'travel-picker', cat: 'tool', title: '우리 가족 해외여행 선택 보드', desc: '가족 여행지를 함께 골라봐요', v: 2 },
  { id: 'h1-golf',       cat: 'tool', title: 'H1 골프맵',               desc: '화성 H1 출발 1시간 이내 골프장 35곳', v: 1 }
];
function showGameView(v) {
  $('gameList').hidden = v !== 'list';
  $('gamePlayer').hidden = v !== 'player';
}
let curGame = null, flip = store.get('hub_flip', '0') === '1', rotated = false;

// 가로 전용 게임: 폰이 세로 상태면 게임 화면을 앱이 직접 90도 돌려서 채움
function layoutPlayer() {
  if (!curGame) return;
  const g = GAMES.find(x => x.id === curGame), f = $('gpFrame'), box = $('gamePlayer');
  const tool = !!(g && g.cat === 'tool');   // 도구는 위에 제목 줄(← 버튼 포함)을 두고 그 아래에 화면을 둠 (← 버튼이 내용을 가리지 않게)
  $('gpBar').hidden = !tool;
  const W = box.clientWidth, H = box.clientHeight;
  const rot = !!(g && g.landscape && H > W);
  rotated = rot;
  setRotStyle(f, rot);
  $('gpFlip').hidden = !rot;
  if (rot) {
    f.style.top = '0'; f.style.width = H + 'px'; f.style.height = W + 'px';
    f.style.transform = flip ? 'translate(0,' + H + 'px) rotate(-90deg)' : 'translate(' + W + 'px,0) rotate(90deg)';
  } else {
    f.style.width = '100%'; f.style.transform = 'none';
    f.style.top = tool ? 'calc(48px + env(safe-area-inset-top))' : '0';
    f.style.height = tool ? 'calc(100% - 48px - env(safe-area-inset-top))' : '100%';
  }
}
// 회전해서 보여 줄 때의 스크롤 보정:
// 브라우저는 touch-action(pan-y 등)을 '돌리기 전' 화면 기준으로 판단해서, 게임 안 스크롤 영역(캐릭터 목록 등)이
// 손가락으로 전혀 안 움직인다. 그래서 회전 중에는 게임 안의 touch-action을 끄고 손가락 이동을 직접 스크롤로 바꿔 준다.
// (게임 파일은 고치지 않아도 됨. 같은 출처라서 허브가 iframe 안에 접근 가능)
function setRotStyle(f, on) {
  try {
    const st = f.contentDocument && f.contentDocument.getElementById('hubRotStyle');
    if (st) st.media = on ? 'all' : 'not all';
  } catch {}
}
function hookRotatedScroll(f) {
  let doc, win;
  try { doc = f.contentDocument; win = f.contentWindow; } catch { return; }
  if (!doc || !doc.documentElement || doc.getElementById('hubRotStyle')) return;
  const st = doc.createElement('style');
  st.id = 'hubRotStyle';
  st.textContent = '*{touch-action:none!important}';
  (doc.head || doc.documentElement).append(st);
  setRotStyle(f, rotated);
  let tgt = null, lx = 0, ly = 0, moved = false, swallow = false;
  const scroller = el => {
    for (; el && el.nodeType === 1 && el !== doc.documentElement; el = el.parentElement) {
      const o = win.getComputedStyle(el).overflowY;
      if ((o === 'auto' || o === 'scroll') && el.scrollHeight > el.clientHeight + 1) return el;
    }
    return null;
  };
  doc.addEventListener('touchstart', e => {
    moved = false; tgt = null;
    if (!rotated || e.touches.length !== 1) return;
    tgt = scroller(e.target); lx = e.touches[0].clientX; ly = e.touches[0].clientY;
  }, { passive: true });
  doc.addEventListener('touchmove', e => {
    if (!rotated || !tgt || e.touches.length !== 1) return;
    const t = e.touches[0], dx = t.clientX - lx, dy = t.clientY - ly;
    if (!moved && Math.hypot(dx, dy) < 8) return;     // 살짝 눌렀다 뗀 건 탭으로 둠
    moved = true; lx = t.clientX; ly = t.clientY;
    // 게임 안 좌표 기준: 게임의 세로 이동(dy)과, 폰 화면의 세로 이동에 해당하는 게임의 가로 이동(dx)을 모두 스크롤로 사용
    const k = tgt.getBoundingClientRect().height / (tgt.offsetHeight || 1) || 1;   // 게임 화면 축소 비율
    tgt.scrollTop -= (dy + (flip ? -dx : dx)) / k;
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
  doc.addEventListener('touchend', () => { if (moved) { swallow = true; setTimeout(() => { swallow = false; }, 350); } tgt = null; moved = false; }, { passive: true });
  doc.addEventListener('touchcancel', () => { tgt = null; moved = false; }, { passive: true });
  doc.addEventListener('click', e => { if (swallow) { e.stopPropagation(); e.preventDefault(); } }, true);   // 끌다가 뗀 자리의 버튼이 눌리지 않게
}
// iframe의 src를 바꾸면 브라우저 이동 기록이 하나 더 쌓여서 폰 뒤로가기를 두 번 눌러야 목록으로 돌아간다.
// 그래서 열고 닫을 때마다 iframe을 새것으로 갈아 끼운다 (새 iframe의 첫 이동은 기록에 남지 않음).
function freshFrame() {
  const old = $('gpFrame'), f = old.cloneNode(false);
  f.removeAttribute('src');
  old.replaceWith(f);
  return f;
}
let entering = false;
function openGame(id) {
  const g = GAMES.find(x => x.id === id);
  if (!g || entering) return;
  const gate = window.hubTickets;             // js/tickets.js가 있으면 입장 티켓을 확인 (없으면 그냥 입장)
  if (gate && g.cost) {
    entering = true;
    let p;
    try { p = Promise.resolve(gate.enter(g)); } catch { p = Promise.resolve(true); }
    p.catch(() => false).then(ok => {
      entering = false;
      if (ok && !curGame && $('tab-games').classList.contains('active')) enterGame(g);
    });
    return;
  }
  enterGame(g);
}
function enterGame(g) {
  const id = g.id;
  curGame = id;
  if (g.cat !== 'tool') pushRecent(id);
  try { history.pushState({ game: id }, ''); } catch {}   // 폰의 뒤로가기로 목록 복귀
  showGameView('player');
  $('gpBarTitle').textContent = g.title;
  const f = freshFrame();
  layoutPlayer();
  f.addEventListener('load', () => { hookRotatedScroll(f); layoutPlayer(); });
  f.src = 'games/' + id + '/index.html' + (g.v ? '?v=' + g.v : '');
  if (g.cat !== 'tool') { try { const el = document.documentElement; if (el.requestFullscreen) el.requestFullscreen().catch(() => {}); } catch {} }   // 도구는 전체화면 없이 (링크가 새 탭으로 열려도 안전)
}
function doClose() {
  curGame = null;
  $('gpBar').hidden = true;
  freshFrame();
  try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); } catch {}
  showGameView('list');
  renderRecent();
  document.dispatchEvent(new Event('hub:gameclosed'));   // 점수판(scores.js)이 새 기록을 확인
}
function closeGame() {
  if (curGame && history.state && history.state.game) history.back();  // popstate에서 doClose 실행
  else doClose();
}
addEventListener('popstate', () => { if (curGame) doClose(); });
addEventListener('resize', layoutPlayer);
addEventListener('orientationchange', () => setTimeout(layoutPlayer, 200));
// 폰의 홈 버튼으로 앱이 백그라운드로 가면 브라우저가 전체화면을 풀면서 fullscreenchange가 온다.
// 그걸 '게임 종료'로 착각하면 게임이 닫혀서 처음부터 다시 시작하게 되므로, 백그라운드 직후의 전체화면 해제는 무시한다.
// (사용자가 직접 전체화면을 끝낸 경우 = 앱이 보이는 상태에서만 게임을 닫는다)
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => { if (document.hidden) hiddenAt = Date.now(); });
addEventListener('pagehide', () => { hiddenAt = Date.now(); });
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement || !curGame) return;
  setTimeout(() => {
    if (document.fullscreenElement || !curGame) return;
    if (document.hidden || Date.now() - hiddenAt < 2500) return;   // 백그라운드로 간 것 → 게임 유지
    closeGame();
  }, 700);
});
// 게임 목록: 위쪽 분류 버튼(전체·다 같이·둘이서…) + 카드. 마지막에 고른 분류는 이 기기에 기억 (hub_gameCat)
let gameCat = store.get('hub_gameCat', 'all');
if (gameCat !== 'all' && !CATS.some(c => c.id === gameCat)) gameCat = 'all';
function renderGameCards() {
  const box = $('gameCards');
  const ref = box.querySelector('.tkBadge'), tkHidden = ref ? ref.hidden : true;   // 티켓 표시 상태는 그대로 (tickets.js가 정함)
  box.replaceChildren();
  const bar = document.createElement('div');
  bar.className = 'flex gap-2 overflow-x-auto pb-1 -mx-1 px-1';
  bar.style.scrollbarWidth = 'none';
  [{ id: 'all', title: '전체' }, ...CATS].forEach(c => {
    const n = GAMES.filter(g => !g.hidden && (c.id === 'all' || g.cat === c.id)).length;
    if (!n) return;
    const b = document.createElement('button');
    const on = gameCat === c.id;
    b.className = 'shrink-0 px-3 py-1.5 rounded-full text-[13px] font-bold border ' + (on ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300');
    b.textContent = c.title + ' ' + n;
    b.addEventListener('click', () => { gameCat = c.id; store.set('hub_gameCat', c.id); renderGameCards(); });
    bar.append(b);
  });
  box.append(bar);
  CATS.forEach(cat => {
    if (gameCat !== 'all' && gameCat !== cat.id) return;
    const list = GAMES.filter(g => g.cat === cat.id && !g.hidden);
    if (!list.length) return;
    const hd = document.createElement('div');
    hd.className = 'pt-2';
    const h = document.createElement('div');
    h.className = 'text-sm font-bold text-slate-100';
    h.textContent = cat.title;
    const sub = document.createElement('div');
    sub.className = 'text-[11px] text-slate-400';
    sub.textContent = cat.sub;
    hd.append(h, sub);
    box.append(hd);
    const grid = document.createElement('div');   // 카드는 2열로 작게 (게임이 많아져도 한눈에 보이게)
    grid.className = 'grid grid-cols-2 gap-3 mt-2';
    list.forEach(g => grid.append(makeCard(g)));
    box.append(grid);
  });
  box.querySelectorAll('.tkBadge').forEach(b => { b.hidden = tkHidden; });
}
(function buildGameCards() {
  renderGameCards();
  renderRecent();
  $('gpBack').addEventListener('click', closeGame);
  $('gpFlip').addEventListener('click', () => { flip = !flip; store.set('hub_flip', flip ? '1' : '0'); layoutPlayer(); });
})();
// 최근에 한 게임 (이 기기에 기억, 최대 2개 — 게임만, 도구는 제외)
function readRecent() { try { const a = JSON.parse(store.get('hub_recentGames', '[]')); return Array.isArray(a) ? a.filter(id => GAMES.some(g => g.id === id && g.cat !== 'tool')) : []; } catch { return []; } }
function pushRecent(id) { store.set('hub_recentGames', JSON.stringify([id, ...readRecent().filter(x => x !== id)].slice(0, 4))); }
function renderRecent() {
  const box = $('gameRecent');
  if (!box) return;
  box.replaceChildren();
  const ids = readRecent().slice(0, 2);
  if (!ids.length) return;
  const h = document.createElement('div');
  h.className = 'text-sm font-bold text-slate-100';
  h.textContent = '🕘 최근에 한 게임';
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-2 gap-3 mt-2';
  ids.forEach(id => { const c = makeCard(GAMES.find(g => g.id === id)); grid.append(c); });
  box.append(h, grid);
  const ref = document.querySelector('#gameCards .tkBadge');   // 티켓 표시 여부는 아래 목록과 같게
  box.querySelectorAll('.tkBadge').forEach(b => { b.hidden = ref ? ref.hidden : true; });
}
function makeCard(g) {
  const b = document.createElement('button');
  b.className = 'relative block w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-left shadow-lg';
  const img = document.createElement('img');
  img.src = 'games/' + g.id + '/thumb.svg';
  img.alt = '';
  img.className = 'block w-full aspect-[2/1] object-cover';
  const cap = document.createElement('div');
  cap.className = 'absolute inset-x-0 bottom-0 px-2.5 pt-6 pb-2 bg-gradient-to-t from-black/80 to-transparent';
  const t = document.createElement('div');
  t.className = 'text-[13px] leading-tight font-bold text-white truncate';
  t.textContent = g.title;
  const d = document.createElement('div');
  d.className = 'text-[10px] text-slate-300 truncate';
  d.textContent = g.desc;
  cap.append(t, d);
  b.append(img, cap);
  if (g.cost) {   // 티켓 표시 (tickets.js가 켜질 때 보이게 함, 부모님은 숨김)
    const tk = document.createElement('div');
    tk.className = 'tkBadge absolute right-1.5 top-1.5 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur';
    tk.textContent = '🎫 ' + g.cost;
    tk.hidden = true;
    b.append(tk);
  }
  b.addEventListener('click', () => openGame(g.id));
  return b;
}

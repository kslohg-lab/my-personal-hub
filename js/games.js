// AI 게임: 내장 Cyber Runner, 게임 목록, 전체 화면 플레이어 (일반 스크립트, core.js 다음에 로드)
// 러너 게임 (게임 탭이 보일 때만 동작, 화면 주사율과 무관하게 같은 속도)
const cv = $('gameCanvas'), cx = cv.getContext('2d');
let pl, ob, score, raf = 0, last = 0;
function resetGame() {
  pl = { x: 30, y: 125, size: 15, dy: 0, jumping: false };
  ob = { x: 320, size: 15, speed: 3 };
  score = 0;
  $('scoreText').textContent = 'Score: 0';
}
function jumpGame() { if (!pl.jumping) { pl.dy = -8; pl.jumping = true; } }
function frame(now) {
  const dt = Math.min((now - last) / 16.667, 3);
  last = now;
  cx.clearRect(0, 0, cv.width, cv.height);
  cx.fillStyle = '#334155'; cx.fillRect(0, 140, cv.width, 20);

  pl.dy += 0.4 * dt; pl.y += pl.dy * dt;
  if (pl.y > 125) { pl.y = 125; pl.dy = 0; pl.jumping = false; }
  cx.fillStyle = '#6366f1'; cx.fillRect(pl.x, pl.y, pl.size, pl.size);

  ob.x -= ob.speed * dt;
  if (ob.x < -20) { ob.x = 320; score += 10; $('scoreText').textContent = 'Score: ' + score; }
  cx.fillStyle = '#ef4444'; cx.fillRect(ob.x, 125, ob.size, ob.size);

  if (pl.x < ob.x + ob.size && pl.x + pl.size > ob.x && pl.y + pl.size > 125) {
    score = 0; ob.x = 320; $('scoreText').textContent = 'Score: 0';
  }
  raf = requestAnimationFrame(frame);
}
function startGame() { if (raf) return; last = performance.now(); raf = requestAnimationFrame(frame); }
function stopGame() { cancelAnimationFrame(raf); raf = 0; }
$('jumpBtn').addEventListener('click', jumpGame);
cv.addEventListener('pointerdown', jumpGame);
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && raf && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); jumpGame(); }
});
resetGame();

// 게임 목록 (새 게임은 여기에 한 줄 추가 + games/폴더이름/ 에 index.html, thumb.svg 넣기)
// v: 게임 파일을 새로 올릴 때마다 숫자를 올리면 폰이 옛 파일을 캐시에서 쓰지 않음
const GAMES = [
  { id: 'math-monster',  title: '산수 몬스터 격파!',       desc: '계산으로 몬스터를 물리쳐요' },
  { id: 'speed-math',    title: '스피드 매쓰 블리츠 2',    desc: '빠르게 풀어보는 계산 대결' },
  { id: 'animal-run',    title: '동물 친구 달리기',        desc: '귀여운 동물 친구와 함께 달려요', landscape: true, v: 6 },
  { id: 'claw-machine',  title: '말랑말랑 인형뽑기',       desc: '집게로 인형을 뽑아보세요' },
  { id: 'travel-picker', title: '우리 가족 해외여행 선택 보드', desc: '가족 여행지를 함께 골라봐요' },
  { id: 'cyber-runner',  title: 'Cyber Runner',           desc: '점프로 장애물을 피하세요', builtin: true }
];
function showGameView(v) {
  $('gameList').hidden = v !== 'list';
  $('gamePlayer').hidden = v !== 'player';
  $('runnerView').hidden = v !== 'runner';
}
let curGame = null, flip = store.get('hub_flip', '0') === '1', rotated = false;

// 가로 전용 게임: 폰이 세로 상태면 게임 화면을 앱이 직접 90도 돌려서 채움
function layoutPlayer() {
  if (!curGame || curGame === 'cyber-runner') return;
  const g = GAMES.find(x => x.id === curGame), f = $('gpFrame'), box = $('gamePlayer');
  const W = box.clientWidth, H = box.clientHeight;
  const rot = !!(g && g.landscape && H > W);
  rotated = rot;
  setRotStyle(f, rot);
  $('gpFlip').hidden = !rot;
  if (rot) {
    f.style.width = H + 'px'; f.style.height = W + 'px';
    f.style.transform = flip ? 'translate(0,' + H + 'px) rotate(-90deg)' : 'translate(' + W + 'px,0) rotate(90deg)';
  } else {
    f.style.width = '100%'; f.style.height = '100%'; f.style.transform = 'none';
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
function openGame(id) {
  const g = GAMES.find(x => x.id === id);
  if (!g) return;
  curGame = id;
  try { history.pushState({ game: id }, ''); } catch {}   // 폰의 뒤로가기로 목록 복귀
  if (g.builtin) { resetGame(); showGameView('runner'); startGame(); return; }
  showGameView('player');
  const f = freshFrame();
  layoutPlayer();
  f.addEventListener('load', () => { hookRotatedScroll(f); layoutPlayer(); });
  f.src = 'games/' + id + '/index.html' + (g.v ? '?v=' + g.v : '');
  try { const el = document.documentElement; if (el.requestFullscreen) el.requestFullscreen().catch(() => {}); } catch {}
}
function doClose() {
  curGame = null;
  stopGame();
  freshFrame();
  try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); } catch {}
  showGameView('list');
}
function closeGame() {
  if (curGame && history.state && history.state.game) history.back();  // popstate에서 doClose 실행
  else doClose();
}
addEventListener('popstate', () => { if (curGame) doClose(); });
addEventListener('resize', layoutPlayer);
addEventListener('orientationchange', () => setTimeout(layoutPlayer, 200));
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && curGame && curGame !== 'cyber-runner') closeGame(); });
(function buildGameCards() {
  const box = $('gameCards');
  GAMES.forEach(g => {
    const b = document.createElement('button');
    b.className = 'relative block w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-left shadow-lg';
    const img = document.createElement('img');
    img.src = 'games/' + g.id + '/thumb.svg';
    img.alt = '';
    img.className = 'block w-full aspect-[2/1] object-cover';
    const cap = document.createElement('div');
    cap.className = 'absolute inset-x-0 bottom-0 px-4 pt-8 pb-3 bg-gradient-to-t from-black/80 to-transparent';
    const t = document.createElement('div');
    t.className = 'text-sm font-bold text-white';
    t.textContent = g.title;
    const d = document.createElement('div');
    d.className = 'text-[11px] text-slate-300';
    d.textContent = g.desc;
    cap.append(t, d);
    b.append(img, cap);
    b.addEventListener('click', () => openGame(g.id));
    box.append(b);
  });
  $('gpBack').addEventListener('click', closeGame);
  $('rnBack').addEventListener('click', closeGame);
  $('gpFlip').addEventListener('click', () => { flip = !flip; store.set('hub_flip', flip ? '1' : '0'); layoutPlayer(); });
})();

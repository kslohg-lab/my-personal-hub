// 핵심 공통 코드 (일반 스크립트). Firebase와 무관해야 함. 다른 일반 스크립트(games.js)가 $, store를 함께 사용.
const $ = id => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} }
};

// 로그인 상태에 따른 화면 전환 (실제 인증은 아래 module 스크립트에서 처리)
function enterApp() { $('lockScreen').hidden = true; $('mainApp').hidden = false; fitHeight(); }
function showLogin() {
  try { if (curGame) doClose(); } catch {}
  switchTab('home');
  $('mainApp').hidden = true; $('lockScreen').hidden = false;
  $('loginSub').textContent = '가족만 입장할 수 있어요.';
  $('loginForm').hidden = false;
}

// 키보드가 올라와도 화면이 찌그러지지 않도록 실제 보이는 높이에 맞춤
function fitHeight() {
  const vv = window.visualViewport;
  if (vv) { $('mainApp').style.height = vv.height + 'px'; window.scrollTo(0, 0); }
}
if (window.visualViewport) window.visualViewport.addEventListener('resize', fitHeight);

// 탭 전환
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.id === 'tab-' + name));
  document.querySelectorAll('[data-tab]').forEach(b => {
    const on = b.dataset.tab === name;
    b.classList.toggle('text-indigo-400', on);
    b.classList.toggle('text-slate-400', !on);
  });
  if (name !== 'games' && curGame) closeGame();
  if (name === 'chat') { const b = $('chatMessages'); b.scrollTop = b.scrollHeight; }
}
$('bottomNav').addEventListener('click', e => {
  const b = e.target.closest('[data-tab]');
  if (b) switchTab(b.dataset.tab);
});

// 채팅 모듈이 8초 안에 못 뜨면 안내
setTimeout(() => {
  if (!window.__chatReady) {
    $('loginSub').textContent = '⚠ 연결 모듈을 불러오지 못했어요. 인터넷을 확인하고 새로고침해 주세요.';
    const s = $('chatStatus');
    s.textContent = '⚠ 채팅 모듈을 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.';
    s.className = 'text-[10px] mb-1 shrink-0 text-red-400';
  }
}, 8000);

// 모듈 진입점: 로그인 상태가 바뀔 때 채팅/일정/영상을 켜고 끈다.
// 채팅/일정/영상은 따로 불러와서, 하나가 고장 나도 로그인과 나머지 기능은 계속 동작한다.
import { $ } from './util.js?v=1.15';
import { state, FAMILY, onAuthStateChanged } from './firebase-init.js?v=1.15';
import { resetLogin } from './login.js?v=1.15';

const VER = '?v=1.15';
const FVER = { videos: '?v=1.19', chat: '?v=1.20', calendar: '?v=1.21', scores: '?v=1.24' };   // 기능 파일 하나만 고쳤을 때는 그 파일의 번호만 올리면 됨 (공유 파일 firebase-init/util은 그대로 1.15)
const features = {};   // { chat, todos, videos, calendar, tickets, scores } — 불러오기에 성공한 것만 들어감

async function load(name) {
  try { features[name] = await import('./' + name + '.js' + (FVER[name] || VER)); }
  catch (e) { console.error(name + ' 기능을 불러오지 못했어요', e); }
}
// 기능 하나가 오류를 내도 다음 기능은 계속 실행
function each(fn) {
  ['chat', 'todos', 'videos', 'calendar', 'tickets', 'scores'].forEach(name => {
    const f = features[name];
    if (!f) return;
    try { fn(f, name); } catch (e) { console.error(name + ' 실행 오류', e); }
  });
}

function onUser(user) {
  if (user) {
    const f = FAMILY.find(x => x.email === user.email);
    state.me = { uid: user.uid, name: f ? f.name : (user.email || '').split('@')[0], email: user.email || '', id: (user.email || '').split('@')[0], parent: !!(f && f.parent) };
    $('chatSender').textContent = state.me.name;
    $('userLabel').textContent = state.me.name;
    $('loginPw').value = '';
    window.enterApp();
    each(f => f.start());
    if (features.todos) setTimeout(features.todos.migrateLocalTodos, 800);
  } else {
    state.me = null;
    each(f => f.stop());
    resetLogin();
    window.showLogin();
  }
}

async function boot() {
  await Promise.all(['chat', 'todos', 'videos', 'calendar', 'tickets', 'scores'].map(load));
  if (state.initError) {
    const e = state.initError;
    $('loginSub').textContent = '⚠ 로그인 준비 실패: ' + (e.code || e.message);
    if (features.chat) features.chat.setStatus(false, e);
    return;
  }
  onAuthStateChanged(state.auth, onUser, e => {
    console.error(e);
    $('loginSub').textContent = '⚠ 로그인 확인 실패: ' + (e.code || e.message);
  });
}
boot();

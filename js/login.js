// 로그인 화면: 이름 버튼 + 비밀번호
import { $ } from './util.js?v=1.12';
import { state, FAMILY, signInWithEmailAndPassword, signOut } from './firebase-init.js?v=1.12';

let picked = null;
FAMILY.forEach(f => {
  const b = document.createElement('button');
  b.className = 'py-4 rounded-2xl bg-slate-800 border border-slate-700 text-base font-bold text-slate-100 active:bg-indigo-600';
  b.textContent = f.name;
  b.addEventListener('click', () => {
    picked = f;
    $('loginPickName').textContent = f.name;
    $('loginPw').value = '';
    $('loginErr').hidden = true;
    $('loginStep1').hidden = true; $('loginStep2').hidden = false;
    $('loginPw').focus();
  });
  $('loginNames').append(b);
});
$('loginBack').addEventListener('click', () => { $('loginStep1').hidden = false; $('loginStep2').hidden = true; });
async function doLogin() {
  const pw = $('loginPw').value;
  if (!picked || !pw || !state.auth) return;
  $('loginBtn').disabled = true; $('loginErr').hidden = true;
  try {
    await signInWithEmailAndPassword(state.auth, picked.email, pw);
  } catch (e) {
    const c = e.code || '';
    $('loginErr').textContent =
      /invalid-credential|wrong-password|user-not-found|invalid-email/.test(c) ? '비밀번호가 맞지 않아요.' :
      c === 'auth/too-many-requests' ? '시도가 너무 많아요. 잠시 후 다시 해주세요.' :
      c === 'auth/network-request-failed' ? '인터넷 연결을 확인해 주세요.' :
      c === 'auth/operation-not-allowed' ? 'Firebase에서 이메일/비밀번호 로그인이 꺼져 있어요.' :
      '로그인 실패: ' + (c || e.message);
    $('loginErr').hidden = false;
  } finally { $('loginBtn').disabled = false; }
}
$('loginBtn').addEventListener('click', doLogin);
$('loginPw').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) doLogin(); });
$('logoutBtn').addEventListener('click', () => { if (state.auth && confirm('로그아웃할까요?')) signOut(state.auth); });

// 로그아웃 상태가 되면 처음 화면(이름 선택)으로
export function resetLogin() { $('loginStep1').hidden = false; $('loginStep2').hidden = true; }

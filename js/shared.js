// 도구 공유 저장소 (Firestore toolData/{도구id}__{사람id})
//  - 허브 안에서 열린 도구(같은 주소의 iframe)가 가족과 값을 나눌 수 있게 window.hubShared 를 열어 줌.
//  - 각자 자기 문서만 쓰고(도구id__아이디), 가족 모두 읽음. 도구는 parent.hubShared.save / watch 로 사용.
//  - 사용 예 (도구 파일 안):  const hub = window.parent.hubShared;
//        hub.save('travel-vote', { picks: [1, 5] });                 // 내 값 저장 (JSON으로 바뀌는 값만)
//        const stop = hub.watch('travel-vote', list => {...});       // list = [{ id:'dad', name:'아빠', data:{...} }, ...]
//  - 게임/도구를 닫으면(hub:gameclosed) 그 도구가 걸어 둔 구독은 자동으로 끊김.
//  - 이 파일이 고장 나도 다른 기능에는 영향 없음 (도구는 hubShared 가 없으면 이 폰에만 저장하도록 만든다).
import { state, FAMILY, collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from './firebase-init.js?v=1.15';

const subs = new Set();
const OK_TOOL = /^[a-z0-9-]{1,30}$/;
const MAX_JSON = 20000;
function cleanup() { subs.forEach(u => { try { u(); } catch {} }); subs.clear(); }

const api = {
  ready: true,
  get me() { return state.me ? { id: state.me.id, name: state.me.name } : null; },
  members: FAMILY.map(f => ({ id: f.email.split('@')[0], name: f.name })),
  save(tool, data) {
    if (!state.db || !state.me) return Promise.reject(new Error('로그인이 필요해요'));
    if (!OK_TOOL.test(String(tool))) return Promise.reject(new Error('잘못된 도구 이름'));
    let plain;
    try { plain = JSON.parse(JSON.stringify(data)); } catch { return Promise.reject(new Error('저장할 수 없는 값')); }   // iframe에서 온 객체를 이 창의 일반 객체로 바꿈 (Firestore가 요구)
    if (!plain || typeof plain !== 'object' || Array.isArray(plain) || JSON.stringify(plain).length > MAX_JSON) return Promise.reject(new Error('값이 너무 커요'));
    return setDoc(doc(state.db, 'toolData', tool + '__' + state.me.id), { tool, uid: state.me.uid, name: state.me.name, data: plain, at: serverTimestamp() });
  },
  watch(tool, cb, onErr) {
    if (!state.db || !state.me || !OK_TOOL.test(String(tool))) { if (onErr) onErr(new Error('연결할 수 없어요')); return () => {}; }
    const un = onSnapshot(query(collection(state.db, 'toolData'), where('tool', '==', tool)), snap => {
      const list = snap.docs.map(d => { const v = d.data(); return { id: d.id.split('__')[1] || '', name: v.name || '', data: v.data || {} }; });
      try { cb(JSON.parse(JSON.stringify(list))); } catch (e) { console.error('hubShared 콜백 오류', e); }
    }, e => { try { if (onErr) onErr(e); } catch {} });
    subs.add(un);
    return () => { try { un(); } catch {} subs.delete(un); };
  }
};

document.addEventListener('hub:gameclosed', cleanup);
function start() { if (state.db) window.hubShared = api; }
function stop() { cleanup(); window.hubShared = null; }
export { start, stop };

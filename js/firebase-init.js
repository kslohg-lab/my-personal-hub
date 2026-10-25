// Firebase 초기화 전용. 설정값(firebaseConfig)과 가족 계정 목록(FAMILY)은 여기에만 둔다.
// 다른 모듈은 Firebase 주소를 직접 import하지 않고 이 파일에서 가져다 쓴다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { initializeFirestore, collection, addDoc, query, orderBy, limit, limitToLast, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc, increment, where, setDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export { collection, addDoc, query, orderBy, limit, limitToLast, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc, increment, where, setDoc, writeBatch };
export { signInWithEmailAndPassword, onAuthStateChanged, signOut };

// core.js의 "연결 모듈을 불러오지 못했어요" 안내를 끄는 표시
window.__chatReady = true;

export const firebaseConfig = {
  apiKey: "AIzaSyDzEFDmMpwoN4qYL8WHH-tesPWsSDvzHms",
  authDomain: "my-family-hub-daf46.firebaseapp.com",
  projectId: "my-family-hub-daf46",
  storageBucket: "my-family-hub-daf46.firebasestorage.app",
  messagingSenderId: "157281213343",
  appId: "1:157281213343:web:99e65a7b08e269ad333baa",
  measurementId: "G-W41Q8308RG"
};
// 앱에 보이는 이름 ↔ Firebase Authentication 계정 이메일 (parent: true = 게임 티켓을 주는 부모 계정. Firestore 규칙의 부모 이메일과 같아야 함)
export const FAMILY = [
  { name: '아빠', email: 'dad@family-hub.app', parent: true },
  { name: '엄마', email: 'mom@family-hub.app', parent: true },
  { name: '채아', email: 'chaea@family-hub.app' },
  { name: '지아', email: 'jia@family-hub.app' }
];

// 모든 모듈이 공유하는 상태: 로그인한 사람(me), Firestore(db), 인증(auth)
export const state = { me: null, db: null, auth: null, initError: null };
export const myName = () => state.me ? state.me.name : '익명';

try {
  const app = initializeApp(firebaseConfig);
  state.auth = getAuth(app);
  // 일부 네트워크/브라우저에서 기본 연결이 멈추는 문제를 피하기 위해 롱폴링 사용
  state.db = initializeFirestore(app, { experimentalForceLongPolling: true });
} catch (e) {
  console.error(e);
  state.initError = e;
}

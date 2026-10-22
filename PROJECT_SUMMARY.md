# 📌 My Personal Hub — 프로젝트 정리 (Project Summary)

- **현재 버전:** v1.4
- **마지막 업데이트:** 2026-10-22
- **저장소:** `kslohg-lab/my-personal-hub` (branch: `main`)
- **이 문서의 목적:** 새 대화방이나 다른 AI가 이 문서만 읽고도 프로젝트를 정확히 이해하고, 기존 기능을 깨뜨리지 않고 수정할 수 있게 하는 **단일 상태 문서**입니다. 수정할 때마다 맨 아래 "변경 이력"과 필요한 섹션을 함께 갱신하세요.

---

## 1. 프로젝트 비전

1. 스마트폰 홈 화면에 추가해서 앱처럼 쓰는 **가족용 개인 허브(PWA 스타일 웹앱)**.
2. 직접 만든 **AI 미니 게임 모음**을 카드로 고르고 전체 화면으로 플레이.
3. **가족 실시간 채팅**(텍스트 + 사진), **일정 플래너**, 소셜 채널 링크 모음.
4. AI가 만들고 사람이 폰에서 검토/테스트한 뒤 GitHub에 반영하는 **AI-Human 개발 루프**.

---

## 2. 현재 구조

### 파일 구조
```
my-personal-hub/
├─ index.html              ← 허브 앱 본체 (단일 파일: HTML + CSS + JS)
├─ README.md
├─ PROJECT_SUMMARY.md      ← 이 문서
└─ games/
   ├─ math-monster/    (index.html, thumb.svg)  산수 몬스터 격파!
   ├─ speed-math/      (index.html, thumb.svg)  스피드 매쓰 블리츠 2
   ├─ animal-run/      (index.html, thumb.svg)  동물 친구 달리기 (가로 전용)
   ├─ claw-machine/    (index.html, thumb.svg)  말랑말랑 인형뽑기
   ├─ travel-picker/   (index.html, thumb.svg)  우리 가족 해외여행 선택 보드
   └─ cyber-runner/    (thumb.svg만 있음)         Cyber Runner (index.html 안에 내장)
```
- 배포: GitHub 저장소의 파일이 그대로 반영됨 (반영까지 약 1~2분). 배포 서비스 이름: ______ (직접 기입)

### 하단 메뉴 (4개)
| 탭 | 내용 |
|---|---|
| 홈 | 환영 카드, YouTube / Instagram 링크 카드 (현재 링크는 각 사이트 첫 화면 placeholder) |
| 가족채팅 | Firebase Firestore 실시간 채팅, 사진 전송, 이름 변경 |
| AI게임 | 게임 카드 목록 → 전체 화면 실행 |
| 일정 | 할 일 추가/완료/삭제 (기기 localStorage 저장 → **가족 간 공유 안 됨**) |

### 코드 구조 (index.html) — **이 구조를 유지할 것**
- **① 일반 `<script>`**: 비밀번호 잠금, 탭 전환, 일정, 게임 목록/플레이어, 내장 Cyber Runner. **Firebase와 무관.**
- **② `<script type="module">`**: Firebase 채팅 전용. 이 부분이 실패해도 ①은 정상 동작해야 함.
- **아이콘:** 외부 라이브러리 없이 파일 상단의 **인라인 SVG 스프라이트**(`#i-home` 등)를 `<use>`로 사용. (CDN 아이콘 라이브러리 사용 금지 — 아래 "문제 기록" 참고)
- **레이아웃:** `header / main / nav`를 세로로 쌓은 구조(`.shell`, 높이 `100dvh`). 각 탭은 `.tab`(absolute, 보이는 탭만 `.active`). 하단 메뉴는 `fixed`가 아님.
- **숨김 처리:** `hidden` 속성 + CSS `[hidden]{display:none!important}` 사용.
- **스타일:** Tailwind CDN `3.4.17` 고정.

### 브라우저 저장소 키
| 키 | 용도 |
|---|---|
| `hub_cid` | 기기 고유 ID (채팅에서 "내 메시지" 구분) |
| `hub_name` | 채팅 이름 |
| `hub_flip` | 가로 전용 게임 방향 뒤집기 상태 |
| `my_hub_todos` | 일정 목록 |
| `sessionStorage: hub_authenticated` | 비밀번호 통과 여부 |

---

## 3. Firebase (채팅)

- **올바른 프로젝트 ID: `my-family-hub-daf46`**
  - ⚠️ `my-personal-hub-daf46`은 **존재하지 않는 값**입니다. (과거 AI가 잘못 바꿔 채팅이 끊긴 적 있음) 설정값(`firebaseConfig`)을 임의로 수정하거나 새로 만들지 말 것. 실제 값은 Firebase 콘솔 → 프로젝트 설정 → 내 앱에서 확인.
- **Firestore 컬렉션:** `chats`
  | 필드 | 설명 |
  |---|---|
  | `sender` | 보낸 사람 이름 |
  | `uid` | 기기 고유 ID (옛 메시지에는 없음) |
  | `text` | 메시지 내용 |
  | `imageUrl` | 사진(base64 data URL) 또는 `null` (옛 메시지에는 없음) |
  | `timestamp` | `serverTimestamp()` |
- **조회:** `orderBy('timestamp','asc')` + `limitToLast(100)`.
- **사진:** 브라우저에서 최대 800px JPEG로 줄여 Firestore 문서에 직접 저장 (문서 1MB 제한 때문에 용량 초과 시 전송 차단).
- **연결 방식:** `initializeFirestore(..., { experimentalForceLongPolling: true })` — 일부 네트워크에서 연결이 멈추는 문제 방지.
- **상태 표시:** 채팅창 위에 `● 연결됨 · 메시지 N개`. 연결 실패 시 빨간 문구 + 노란 줄에 원인(서버에 직접 요청해서 진단) 표시.
- **확인할 것:** Firestore 규칙이 읽기/쓰기를 허용하는지, **테스트 모드 규칙의 만료일**이 지나지 않았는지.

---

## 4. AI 게임 모듈

### 동작 방식
- 목록은 `index.html`의 `GAMES` 배열에서 만들어짐. 항목: `id`, `title`, `desc`, `landscape`(가로 전용), `builtin`(내장).
- 카드 이미지: `games/<id>/thumb.svg` (2:1 가로 비율).
- 카드를 누르면 `games/<id>/index.html`을 **화면 전체를 덮는 iframe**으로 실행 (헤더/하단 메뉴 숨김). 안드로이드 크롬에서는 Fullscreen API도 함께 시도.
- 왼쪽 위 `←` 버튼 또는 **폰 뒤로가기**로 목록 복귀 (`history.pushState` / `popstate` 사용). 다른 탭으로 이동하면 게임은 종료됨.
- **가로 전용 게임**(`landscape: true`, 현재 동물 친구 달리기): 폰이 세로 상태면 iframe을 CSS로 90° 회전해 가로로 채움 → 게임이 "화면을 가로로 돌려주세요"를 띄우지 않고 바로 실행. `↻ 방향` 버튼으로 반대 방향 전환(선택 기억). 폰이 이미 가로면 회전 없이 실행.

### 새 게임 추가 방법
1. `games/새게임이름/index.html` (게임 본체), `games/새게임이름/thumb.svg` (카드 이미지) 추가.
2. `index.html`의 `GAMES` 배열에 한 줄 추가. (가로 전용이면 `landscape: true`)
3. 게임 파일은 **독립 파일**이므로 허브 코드를 고칠 때 게임 파일은 건드리지 않음.

---

## 5. AI에게 수정을 맡길 때의 규칙 ⚠️

1. **요청한 부분만 수정**하고, 나머지는 그대로 유지할 것. 전체 파일을 새로 쓰지 말 것.
2. 수정한 부분(어느 위치, 무엇을)을 알려줄 것.
3. **Firebase `firebaseConfig` 값, 프로젝트 ID를 바꾸지 말 것.**
4. 아이콘을 외부 CDN 라이브러리로 바꾸지 말 것 (인라인 SVG 유지).
5. 스크립트 구조(① 일반 / ② 채팅 모듈 분리)와 레이아웃 구조(`header/main/nav` 세로 쌓기)를 유지할 것.
6. 사용자 입력은 `innerHTML`이 아니라 `textContent`로 화면에 넣을 것.
7. 한 번에 한 가지 기능만 수정할 것.

### 수정 후 확인 체크리스트
- [ ] 비밀번호 입력 후 입장되는가
- [ ] 하단 메뉴 4개 아이콘이 모두 보이고 탭 이동이 되는가
- [ ] 채팅: 상태가 `● 연결됨`이고, 메시지 전송 후 입력창이 비워지는가, 다른 기기에서도 보이는가
- [ ] 채팅: 사진 전송과 확대 보기가 되는가
- [ ] 일정 추가/완료/삭제가 되는가
- [ ] 게임 목록이 보이고, 각 게임이 전체 화면으로 열리며 `←`와 폰 뒤로가기로 돌아오는가
- [ ] 동물 친구 달리기가 폰 세로 상태에서도 바로 가로로 시작되는가

---

## 6. 문제 기록 (같은 실수를 반복하지 않기 위해)

| 증상 | 원인 | 해결 |
|---|---|---|
| 하단 메뉴 아이콘이 사라짐 | 외부 CDN 아이콘 라이브러리 로딩 실패 / 스크립트 하나가 실패하면 전체 중단 | 인라인 SVG로 교체, Firebase 코드와 일반 코드 분리 |
| 채팅이 서로 안 보임 | 모두 같은 기본 이름("아빠")으로 "내 메시지" 구분 불가, 오류 표시 없음 | 기기 고유 ID(`uid`) 도입, 연결 상태/오류 표시 |
| 채팅 연결 실패 (403 `Permission denied on resource project`) | 코드의 프로젝트 ID가 실제와 다름 (`my-personal-hub-daf46`) | `my-family-hub-daf46`으로 교정 |
| 메시지 전송 후 입력창이 안 비워짐 | 서버 응답이 와야 비우는 구조 + 연결 지연 | 즉시 비우고 실패 시 복원, 롱폴링 사용 |
| 한글 입력 시 Enter 중복 전송 | IME 조합 중 Enter | `isComposing` 확인 |
| 메시지에 `<` 입력 시 화면 깨짐 | `innerHTML` 사용 | `textContent` 사용 |
| 사진 클릭 확대가 안 됨 | `window.open(data URL)` 차단 | 화면 내 확대 보기 |
| 동물 달리기가 "가로로 돌려주세요"에서 멈춤 | 게임이 세로 화면을 감지하면 시작을 막음 | 허브가 iframe을 CSS로 회전해 가로 화면으로 제공 |

---

## 7. 보안 메모

- 저장소가 **공개(public)**이므로 `index.html`의 비밀번호(PIN)와 Firebase 설정은 누구나 볼 수 있음. 비밀번호는 **간단한 잠금 수준**이며 진짜 보안이 아님.
- 채팅 내용을 보호하려면 Firestore 규칙 강화 + Firebase 로그인(Authentication) 도입이 필요. 규칙을 `allow read, write: if true`로 장기간 열어두지 말 것.

---

## 8. 로드맵

1. **PWA 설정 보강:** manifest, 아이콘, (선택) service worker → 안드로이드 앱 설치 지원
2. **보안 강화:** Firebase Authentication + Firestore 규칙 정리
3. **일정 가족 공유:** 현재 기기 저장 → Firestore 동기화
4. **게임 점수 랭킹:** 가족 점수판 (Firestore)
5. **채팅 개선:** 메시지 삭제, 사진을 Firebase Storage로 이동, 알림
6. **홈 화면:** 실제 YouTube / Instagram 링크 연결, 설정/정보 탭
7. **새 게임 추가:** 퍼즐, 틱택토 등 `games/` 모듈로 확장

---

## 9. 변경 이력

| 버전 | 날짜 | 내용 |
|---|---|---|
| v1.0 | 2026-10-22 | 초안: 단일 파일 허브 (홈, 채팅, Cyber Runner, 일정, 비밀번호 잠금) |
| v1.1 | 2026-10-22 | 구조 안정화: 스크립트 분리, 인라인 SVG 아이콘, 레이아웃 재구성, 채팅 기기 ID·XSS 방지·사진 압축·상태 표시 |
| v1.2 | 2026-10-22 | 채팅 연결 복구: 롱폴링, 원인 진단 표시, Firebase 프로젝트 ID 교정(`my-family-hub-daf46`) |
| v1.3 | 2026-10-22 | AI게임 탭을 카드 목록으로 개편, 게임 5개 추가(`games/` 폴더), 카드 이미지 제작 |
| v1.4 | 2026-10-22 | 게임 전체 화면 실행, 폰 뒤로가기/`←` 복귀, 동물 친구 달리기 가로 자동 전환 |

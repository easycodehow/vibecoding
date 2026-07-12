# 작업 기록

이 파일은 세션 간 작업 내용을 이어가기 위한 기록용 파일입니다.
새 세션 시작 시 클로드코드가 가장 최근 기록을 먼저 확인하고 보고합니다.
기존 기록은 지우지 않고 아래에 계속 누적합니다.

---

## 2026-07-11
- CLAUDE.md 확인 완료
- PROGRESS.md 파일 최초 생성 (빈 틀)
- 현재 상태: 게시판(커뮤니티) 기능 추가 작업 시작 전, 1단계(Supabase 기본 설정) 대기 중

### 다음 작업 제안
- 1단계: Supabase 계정/프로젝트 생성 여부 확인 후, .env.local 설정 및 .gitignore 확인부터 진행

---

## 2026-07-11 (1단계 완료)
- Supabase 프로젝트 생성 완료 (사용자 수동 작업)
  - Project URL: https://uwblesyqopvonxwxwzfj.supabase.co
  - anon public key 확보
- `.env.local` 파일 생성 (Project URL, anon key 저장)
- `.gitignore`에 `.env.local` 추가 확인
- 참고: 이 프로젝트는 빌드 도구 없는 순수 정적 HTML/JS 구조라 `.env.local`이 브라우저에서 자동 로드되지 않음. 실제 Supabase 클라이언트 초기화 시에는 `js/supabase-config.js` 같은 파일에 URL/anon key를 직접 넣는 방식 필요 (anon key는 RLS로 보호되어 공개돼도 안전하도록 설계됨)

### 다음 작업 제안
- 2단계: 로그인 기능 구현 (Supabase 이메일 로그인/회원가입, 로그인 상태 관리, 로그인/로그아웃 UI)
  - 이때 `js/supabase-config.js` 파일도 함께 생성 필요

---

## 2026-07-11 (2단계 - 게시판 폴더/레이아웃 생성)
- 게시판 관련 파일만 신규 생성 (더미 데이터, 기능 없이 레이아웃만)
  - `css/board.css` - 게시판 전용 스타일 (기존 style.css의 색상 변수/톤 재사용)
  - `js/board.js`, `js/auth.js` - 빈 파일 (이후 단계에서 구현 채움)
  - `board.html` - 목록 페이지 (더미 게시글 5개, 테이블형, 검색창, 글쓰기 버튼, 페이지네이션 1~5)
  - `board-write.html` - 글쓰기/수정 폼 (제목·내용·이미지 업로드+미리보기, `?id=`로 수정모드 구분 예정)
  - `board-detail.html` - 상세보기 (제목/작성자/작성일/조회수, 이미지, 본문, 수정/삭제 버튼, 더미 댓글 2개 + 댓글 입력창)
  - `login.html`, `signup.html` - 이메일/비밀번호 로그인·회원가입 폼
- 모든 신규 페이지는 index.html의 헤더 nav/푸터 마크업을 재사용, 헤더의 '커뮤니티' 메뉴는 board.html로 연결
- hero가 없는 페이지라 `js/main.js`(hero 요소 전제로 스크롤 효과 동작)는 포함하지 않고, `.header-solid` 클래스로 헤더를 고정 불투명 배경(#2D1B4E)으로 처리
- `index.html`은 이번 단계에서 의도적으로 수정하지 않음 (사용자 요청 범위: "게시판 관련 파일만") → 기존 '커뮤니티' 메뉴는 여전히 `#community`를 가리키는 상태

### 다음 작업 제안
- `index.html`의 '커뮤니티' 메뉴 링크를 `board.html`로 변경할지 결정 (CLAUDE.md 2단계 요구사항)
- 3단계: 로그인 기능 구현 (Supabase 이메일 로그인/회원가입, 로그인 상태 관리, 헤더 로그인/로그아웃 UI, `js/supabase-config.js` 생성)

---

## 2026-07-11 (폴더 정리 - 게시판 전용 파일을 board/ 폴더로 이동)
- 게시판 전용 파일만 `board/` 폴더로 이동, 로그인 관련 파일은 루트에 유지
  - 이동: `board.html`, `board-write.html`, `board-detail.html` → `board/`
  - 이동: `css/board.css` → `board/css/board.css`
  - 이동: `js/board.js` → `board/js/board.js`
  - 유지(루트): `login.html`, `signup.html`, `js/auth.js` — 로그인은 게시판 전용 기능이 아니라 사이트 전역 기능이라는 판단
- 이동된 `board/*.html` 3개 파일 내부 경로 수정
  - 루트 리소스 참조에 `../` 추가: `font/`, `css/style.css`, `index.html`, `img/hero.jpg`
  - `board.css`, `board.js`, board 페이지 간 링크(board.html/board-write.html/board-detail.html)는 같은 폴더라 경로 그대로 유지
- 루트에 남은 `login.html`, `signup.html`이 참조하던 `css/board.css`, `board.html` 경로를 `board/css/board.css`, `board/board.html`로 갱신
  (참고: `css/board.css`는 이름과 달리 로그인/회원가입 폼 스타일도 포함하고 있어 login/signup에서도 계속 참조함)
- `index.html`은 애초에 board 관련 경로를 참조하지 않아(커뮤니티 메뉴가 `#community` 앵커) 수정 불필요

### 다음 작업 제안
- `index.html`의 '커뮤니티' 메뉴 링크를 `board/board.html`로 변경할지 결정
- 3단계: 로그인 기능 구현 (Supabase 이메일 로그인/회원가입, 로그인 상태 관리, 헤더 로그인/로그아웃 UI, `js/supabase-config.js` 생성)

---

## 2026-07-11 (2단계 - index.html 최근 게시물 섹션 추가)
- 비어있던 `<section id="community">`에 최근 게시물 카드 3개(더미, board.html의 id 5/4/3과 동일한 제목·작성자·작성일) 추가
  - 각 카드는 `<a class="card recent-post-card">`로 구성, 클릭 시 `board/board-detail.html?id=`로 이동
  - 하단에 "커뮤니티 더보기" 링크로 `board/board.html` 연결
  - 실제 Supabase 데이터 연동은 5단계에서 진행 예정 (지금은 레이아웃/링크 구조만)
- `css/style.css`에 `.recent-post-card`, `.recent-post-meta`, `.community-more-link` 스타일 추가 (기존 `.card`, 색상 변수 재사용)
- CLAUDE.md 2단계 체크리스트에서 "index.html 최근 게시물 섹션 추가" 항목 체크 완료
- 미완료로 남은 2단계 항목: 헤더 '커뮤니티' 메뉴를 `board/board.html`로 연결 (현재 `#community` 앵커 유지 중, 별도 작업으로 남김)

### 다음 작업 제안
- 헤더 '커뮤니티' 메뉴 링크를 `board/board.html`로 변경할지 결정 (2단계 마지막 미완료 항목)
- 3단계: 로그인 기능 구현 (Supabase 이메일 로그인/회원가입, 로그인 상태 관리, 헤더 로그인/로그아웃 UI, `js/supabase-config.js` 생성)

---

## 2026-07-11 (커뮤니티 표/게시판 디자인 다듬기)
- `index.html` 커뮤니티 섹션: 카드형 → 표(제목/작성일 2열)로 변경, "커뮤니티 더보기" 링크를 섹션 제목과 한 줄(`section-title-row`)에 배치
- 표 공통 스타일(`css/style.css`, `board/css/board.css`): 글자크기를 사이트 본문 크기(20px)로 통일, 표 바깥 외곽선/흰 바탕(`.table-wrap`) 제거, 헤더 라벨만 가운데 정렬(본문은 왼쪽 정렬), 헤더 글자색을 어두운 보라색(`#2D1B4E`)으로 변경
- 헤더 '커뮤니티' 메뉴를 `#community` 앵커에서 `board/board.html` 링크로 변경 (2단계 마지막 미완료 항목 완료)
- `reference/게시판디자인.png`, `게시판브리핑.txt` 확인 후 board.html에 반영
  - id=5 게시글 제목에 댓글수 배지 `[2]`와 이미지 첨부 아이콘(SVG) 추가
  - 검색폼 너비 320px → 480px, 입력창 패딩 축소, 검색 버튼에 `white-space: nowrap`/`flex-shrink: 0` 적용해 버튼 글자 세로 밀림 방지
  - 페이지네이션 현재 페이지 표시: 보라색 배경 제거 → 흰 배경 + 진보라 테두리(2px, `#2D1B4E`) + 굵은 글자로 변경
  - `board/css/board.css`의 `.header-solid`를 index의 `header.scrolled` 색상(반투명 보라+블러)과 동일하게 변경
  - 더미 게시글을 5개 → 10개(id 6~10 추가)로 늘려 목록 하단 빈 공간 문제 해결
- CLAUDE.md 2단계 체크리스트 전체 완료 (헤더 링크 연결까지)

### 다음 작업 제안
- 3단계: 로그인 기능 구현 (Supabase 이메일 로그인/회원가입, 로그인 상태 관리, 헤더 로그인/로그아웃 UI, `js/supabase-config.js` 생성)

---

## 2026-07-11 (3단계 - 로그인 기능 구현 완료)
- `js/supabase-config.js` 신규 생성: `.env.local`의 Project URL/anon key로 Supabase 클라이언트(`supabaseClient`) 초기화
- `js/auth.js` 구현
  - 로그인 폼 제출 → `signInWithPassword`, 실패 시 `.auth-message`에 에러 표시, 성공 시 리다이렉트
  - 회원가입 폼 제출 → 비밀번호 확인 일치 검증 후 `signUp`, 성공/실패 메시지 표시
  - 로그아웃 버튼 → `signOut` 후 새로고침
  - 페이지 로드 시 `getSession()`으로 로그인 여부 확인해 헤더 `#nav-auth` 영역을 로그인/비로그인 상태에 맞게 갱신
- 전체 페이지(index.html, board.html, board-detail.html, board-write.html, login.html, signup.html) 헤더에 `nav-right`(nav-menu + nav-auth) 구조 추가, Supabase CDN 스크립트 + `supabase-config.js` + `auth.js` 연결
- `login.html`/`signup.html` 폼에 `id`(`login-form`/`signup-form`) 부여, 결과 메시지 영역(`.auth-message`) 추가
- `css/style.css`에 `.nav-right`, `.nav-auth`, `.nav-auth-link`, `.nav-auth-email`, `.auth-message` 스타일 추가
- 사용자가 브라우저에서 실제 로그인 동작 확인 완료 (로그인 성공)
- 참고: 이 개발 환경에는 로컬 서버/브라우저 자동화 도구가 없어 클로드코드가 직접 클릭 테스트는 하지 못함 (정적 파일이라 브라우저로 직접 열어 테스트 가능했음)
- 아직 커밋/푸시는 하지 않은 상태 (작업 트리에 변경사항 남아있음)

### 다음 작업 제안
- 이번 3단계 변경사항 커밋/푸시 여부 확인
- 4단계: 데이터베이스 설정 (profiles/posts/comments 테이블 생성 SQL, RLS 정책, Storage 버킷 설정)

---

## 2026-07-12 (헤더 로그인/회원가입/로그아웃 아이콘화)
- 6개 페이지(index.html, login.html, signup.html, board/board.html, board/board-write.html, board/board-detail.html) 헤더의 로그인/회원가입 텍스트 링크를 인라인 SVG 아이콘으로 교체
  - 로그인: 사람(person) 아이콘, 회원가입: 사람+플러스(person-plus) 아이콘, `stroke="currentColor"`로 기존 흰색/보라(#8B5CF6) hover 색상 그대로 적용
  - 접근성을 위해 각 아이콘 링크에 `title`/`aria-label` 부여
  - `css/style.css`에 `.nav-auth-icon`(정렬) 스타일 추가
- `js/auth.js`의 `updateAuthUI` 수정 (로그인 상태 UI)
  - 이메일 전체 대신 `@` 앞 아이디만 표시 (`email.split('@')[0]`)
  - "로그아웃" 텍스트 버튼 → 로그아웃(log-out) 아이콘 버튼으로 교체, `.nav-auth-icon` 스타일 재사용
- 사용자가 브라우저에서 로그인 상태 포함 확인 완료
- git 커밋 완료

### 다음 작업 제안
- 4단계: 데이터베이스 설정 (profiles/posts/comments 테이블 생성 SQL, RLS 정책, Storage 버킷 설정)

---

## 2026-07-12 (글쓰기 임시 로그인 가드 추가)
- 비로그인 상태에서 글쓰기 버튼을 눌러도 `board-write.html`로 이동되던 문제 확인 (아직 4~5단계 DB/CRUD/RLS 미구현이라 원래 예정된 동작이었음)
- 정식 CRUD/RLS 구현 전까지 임시로 프론트엔드 로그인 가드 추가
  - `board/board.html`의 글쓰기 링크에 `id="write-btn"` 부여
  - `board/js/board.js`에 `guardWriteButton()`(비로그인 시 목록 페이지 글쓰기 버튼 숨김), `guardWritePage()`(비로그인 상태로 `board-write.html` 직접 접근 시 `../login.html`로 리다이렉트) 추가
- 사용자가 브라우저에서 로그인/로그아웃 두 상태 모두 확인 완료
- git 커밋 완료

### 다음 작업 제안
- 4단계: 데이터베이스 설정 (profiles/posts/comments 테이블 생성 SQL, RLS 정책, Storage 버킷 설정)

---

## 2026-07-12 (4단계 - profiles 테이블 설정 완료)
- 간편로그인(구글/카카오/네이버) 관련 논의 있었으나 이 프로젝트에서는 진행하지 않기로 결정
- `profiles` 테이블 생성 SQL 제공 및 사용자가 Supabase 대시보드에서 실행 완료
  - `id uuid primary key references auth.users(id) on delete cascade`, `role text default 'user' check (role in ('user','admin'))`, `created_at timestamptz default now()`
  - 테이블 생성 시 Supabase가 "RLS 미설정" 경고를 띄워 "Run and enable RLS"로 RLS 활성화 상태로 생성
- RLS 정책 추가: 본인 프로필만 조회 가능한 SELECT 정책 (`auth.uid() = id`)
- 신규 가입 시 profiles row 자동 생성 트리거 추가
  - `public.handle_new_user()` 함수(`security definer`) + `auth.users` INSERT 후 실행되는 `on_auth_user_created` 트리거
- 사용자가 대시보드에서 SQL 3종(테이블/RLS 정책/트리거) 모두 실행 성공 확인
- CLAUDE.md의 profiles 테이블 체크리스트 3항목 모두 체크 완료

### 다음 작업 제안
- posts 테이블 생성 SQL + RLS 정책 4종 (SELECT 전체공개 / INSERT 로그인만 / UPDATE 본인만 / DELETE 본인+관리자)
- comments 테이블 생성 SQL + RLS 정책 4종
- Storage 버킷(post-images) 설정

---

## 2026-07-12 (4단계 - posts/comments 테이블 설정 완료, 세션 중단)
- `posts` 테이블 생성 SQL 제공 및 사용자가 Supabase 대시보드에서 실행 완료
  - `id`(bigint identity, 글번호 자동생성), `title`, `content`, `author_id`(uuid, auth.users 참조), `author_email`(표시용), `image_url`(nullable), `view_count`(기본 0), `created_at`
  - RLS 활성화 + 정책 4종: SELECT 전체공개 / INSERT 로그인만(본인 명의) / UPDATE 본인만 / DELETE 본인 또는 profiles.role='admin'
  - 참고 사항 공유: 조회수 증가는 "본인 글만 수정" UPDATE 정책과 충돌하므로, 5단계 실제 구현 시 `security definer` RPC 함수로 조회수만 별도 증가시킬 예정
- `comments` 테이블 생성 SQL 제공 및 실행 완료
  - `id`, `post_id`(posts 참조, on delete cascade), `author_id`, `author_email`, `content`, `created_at`
  - RLS 활성화 + 정책 4종: SELECT 전체공개 / INSERT 로그인만(본인 명의) / UPDATE 본인만 / DELETE 본인만 (관리자 삭제 권한은 요구사항에 없어 미포함)
- 사용자가 대시보드에서 posts/comments SQL 모두 실행 성공 확인
- CLAUDE.md의 posts/comments 테이블 체크리스트 전체 체크 완료 (Storage 설정만 미완료로 남음)
- 사용자가 세션을 중단하고 다음에 이어서 작업할 예정

### 다음 작업 제안
- 4단계 마지막 항목: Storage 설정 (post-images 버킷 생성, image/* 타입 제한, 4종 보안정책 — SELECT 전체공개 / INSERT 로그인만 / DELETE·UPDATE 본인만)
- Storage까지 끝나면 4단계 전체 완료, 5단계(게시판 기본 CRUD 구현)로 진행
- 참고: posts.view_count 증가용 security definer RPC 함수는 아직 안 만듦 (5단계에서 조회수 로직 구현 시 함께 처리)

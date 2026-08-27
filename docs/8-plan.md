# TodoList 작업 실행 계획 (WBS)

## 버전 이력

| 버전  | 날짜       | 변경 내용 | 변경 사유 |
| ----- | ---------- | --------- | --------- |
| 0.1.0 | 2026-08-26 | 최초 작성 | -         |
| 0.2.0 | 2026-08-26 | DB-01 완료 처리(전용 DB `todolist`/계정 `todolist_app` 생성, `DATABASE_URL` 확정) | Task 수행 완료 |
| 0.3.0 | 2026-08-26 | DB-02(`todolist` DB에 schema.sql 적용), DB-03(`backend/src/db/pool.js` 작성 및 연결/에러 검증) 완료 처리 | Task 수행 완료 |
| 0.4.0 | 2026-08-26 | BE-01 완료 처리(Express app/server/errorHandler/CORS/health, Jest+supertest 테스트 10건 전부 통과, 커버리지 100%) | Task 수행 완료 |
| 0.5.0 | 2026-08-27 | BE-02 완료 처리(`utils/jwt.js`, `utils/password.js` — access/refresh 시크릿 분리, bcrypt 해시/비교, 실패 시 콘솔 로깅, 테스트 12건 전부 통과, 커버리지 96~100%) | Task 수행 완료 |
| 0.6.0 | 2026-08-27 | BE-03 완료 처리(회원가입/로그인/refresh/logout API, `users.refresh_token_hash` 컬럼 추가로 로그아웃 무효화 구현, 테스트 10건 전부 통과, 커버리지 90~100%) | Task 수행 완료 |
| 0.7.0 | 2026-08-27 | BE-04 완료 처리(`auth.middleware.js` — Bearer 토큰 검증, req.userId 주입, 테스트 6건 전부 통과, 커버리지 100%) | Task 수행 완료 |
| 0.8.0 | 2026-08-27 | BE-05 완료 처리(`GET/PATCH /api/users/me`, auth.middleware 최초 적용, 테스트 6건 전부 통과, 커버리지 90~100%) | Task 수행 완료 |
| 0.9.0 | 2026-08-27 | BE-06 완료 처리(카테고리 CRUD, '기본' 카테고리 삭제 금지 및 Todo 재배정 트랜잭션, `insertCategory`를 `category.query.js`로 이전, 테스트 13건 전부 통과, 커버리지 90~100%) | Task 수행 완료 |
| 1.0.0 | 2026-08-27 | BE-07 완료 처리(Todo 등록/수정/삭제 API, BR-03/04/05/06 검증, DATE 컬럼 타임존 직렬화 버그 수정(`::text` 캐스팅), 테스트 20여건 전부 통과, 커버리지 90~100%) | Task 수행 완료 |
| 1.1.0 | 2026-08-27 | BE-08 완료 처리(`GET /api/todos` 목록/필터링, `todoStatus.js` 상태 파생 로직(§5, 경계값 포함), 테스트 20여건 전부 통과, 커버리지 90~100%) | Task 수행 완료 |
| 1.2.0 | 2026-08-27 | BE-09 완료 처리(§4 자동화 대상 3종 — todoStatus/dateRange/defaultCategory, `todos.service.js`에서 `isValidDateRange`/`resolveCategoryId` 순수 리팩터링 후 export, 신규 테스트 8건 포함 전체 14스위트 107건 통과) | Task 수행 완료 |
| 1.3.0 | 2026-08-27 | BE-10 완료 처리(수동 검증 스크립트 작성/실행, SC-01~07 전체 + BR-01/BR-06 교차 확인) | Task 수행 완료 |
| 1.4.0 | 2026-08-27 | FE-01 완료 처리(Vite React 19+TS 프로젝트 생성, zustand/@tanstack/react-query/react-router-dom 설치, FSD 최상위 6개 폴더 스캐폴딩, `app/providers/QueryClientProvider.tsx`+`app/router.tsx` 구성 및 `app/main.tsx` 적용, `.env.example` 작성, `npm run dev` 기동 확인) | Task 수행 완료 |
| 1.5.0 | 2026-08-27 | FE-02 완료 처리(`shared/api/tokenStore.ts`+`client.ts` — Authorization 헤더 자동 부착, 401 시 refresh 후 1회 재시도, `shared/lib/formatDate.ts`(타임존 밀림 방지), `shared/ui/DatePicker.tsx`(네이티브 date input, 스타일가이드 적용), Vitest 도입, 단위테스트 15건 전부 통과) | Task 수행 완료 |
| 1.6.0 | 2026-08-27 | FE-03 완료 처리(`entities/session/model/authStore.ts`(zustand, tokenStore 동기화), `entities/{user,category}/api/*`(useUserQuery/useCategoriesQuery), `entities/todo`(todo.types, `todoStatus.ts` 백엔드 1:1 포팅, `useTodosQuery`, `StatusBadge`, `TodoCard` — 스타일가이드 §5 색상 적용), todoStatus 단위테스트 9건 포함 전체 24건 통과) | Task 수행 완료 |
| 1.7.0 | 2026-08-27 | FE-04 완료 처리(`features/login`, `features/register`(mutation+`registerFieldError.ts` 필드 매핑), `pages/auth-page/AuthPage.tsx` 탭 전환 UI, `app/router.tsx`에 `/`→AuthPage, `/todos` placeholder 연결. `frontend/.env` 누락으로 API 요청이 `/undefined/...`로 나가던 버그 발견·수정(`VITE_API_BASE_URL` 설정). Playwright로 5개 완료조건 전부 실 서버 대상 브라우저 검증, 단위테스트 30건 통과) | Task 수행 완료 |
| 1.8.0 | 2026-08-27 | FE-05 완료 처리(`features/edit-profile`(PATCH /users/me mutation, `queryClient.setQueryData`로 캐시 즉시 반영), `pages/profile-page/ProfilePage.tsx`(로딩/에러/성공 분기), `/profile` 라우트 추가. name 검증 오류는 필드 매핑 없이 서버 메시지 그대로 표시(YAGNI), 저장 성공은 토스트 라이브러리 없이 로컬 state로 처리. 순수 로직 없어 신규 단위테스트 없음, 기존 30건 회귀 없음, tsc/eslint 통과) | Task 수행 완료 |
| 1.9.0 | 2026-08-27 | FE-06 완료 처리(`features/filter-todos`(카테고리/상태 필터, 서버 쿼리파라미터 위임), `widgets/todo-list/ui/TodoListWidget.tsx`(단일 마크업+CSS media query로 데스크톱 사이드바/모바일 드롭다운 전환), `pages/todo-list-page/TodoListPage.tsx`, `/todos`→실제 페이지 교체, `/todos/new` placeholder 추가. DB에 테스트 데이터 삽입 후 Playwright로 데스크톱/모바일 레이아웃 전환, 카테고리·상태 필터, 빈 상태 5개 완료조건 전부 실측 검증, 테스트 데이터 정리) | Task 수행 완료 |
| 2.0.0 | 2026-08-27 | FE-07 완료 처리(`features/create-todo`(등록/수정 겸용 `TodoForm`, `todoFormError.ts` 서버에러→필드 매핑), `features/edit-todo`(update mutation), `pages/todo-form-page/TodoFormPage.tsx`(id 유무로 등록/수정 분기, 단건조회 API 없어 목록 캐시에서 find), `/todos/new`→실제 폼, `/todos/:id/edit` 라우트 추가, `TodoListWidget`이 TodoCard를 Link로 감싸 수정진입 경로 연결. Playwright로 6개 완료조건 전부 실측 검증(종료일 min 속성으로 시작일 이전 비활성화 확인, min 속성 강제 제거해 서버 INVALID_DATE_RANGE 인라인 에러 노출까지 확인), 테스트 데이터 정리) | Task 수행 완료 |
| 2.1.0 | 2026-08-27 | FE-08 완료 처리(`features/delete-todo`(`ConfirmDeleteDialog`, `deleteTodoError.ts` 403/404 매핑, `useDeleteTodo`), 목록화면(`TodoListWidget`, 카드-링크 중첩 없이 wrapper+형제버튼 구조)과 수정화면(`TodoFormPage`) 양쪽에 삭제 버튼 연결, 목록 삭제는 로컬 토스트, 수정화면 삭제는 `/todos`로 리다이렉트+`location.state` 토스트. Playwright로 목록/수정 양쪽 삭제 플로우, 취소 동작까지 3개 완료조건 전부 실측 검증, `deleteTodoError` 단위테스트 4건 포함 전체 34건 통과, 테스트 데이터 정리) | Task 수행 완료 |
| 2.2.0 | 2026-08-27 | FE-09 완료 처리(`shared/lib/authEvents.ts`(pub/sub, FSD 레이어 역전 방지), `client.ts` refresh 실패 시 `emitSessionExpired()`, `authStore`에 `sessionExpired` 필드+구독, `app/main.tsx`가 렌더 전 `refreshAccessToken()`으로 부팅 시 세션 복구(새로고침 시 로그인 풀리는 회귀 방지), `router.tsx`에 `ProtectedRoute`/`PublicOnlyRoute`, `AuthPage`에 세션만료 배너. Playwright로 미인증 `/todos` 접근→리다이렉트, 인증 상태 `/` 접근→`/todos`+새로고침 세션유지까지 실측 검증(refresh-만료 강제리다이렉트는 실제 JWT 만료 재현이 어려워 authStore 단위테스트 3건으로 대체 검증), 전체 37건 통과) | Task 수행 완료 |
| 2.3.0 | 2026-08-27 | FE-10 완료 처리(Playwright로 W-01~W-05 전 화면 3개 브레이크포인트(375/768/1280px) 오버플로우 없음 확인, SC-01~SC-07 기본흐름 전부 실 서버 대상 재현(회원가입→로그인→목록→등록→수정→상태필터→삭제), SC-01 E2/SC-02 E1/SC-03 E2/SC-04 대안흐름(BR-03)/SC-05 필터·빈상태/SC-06·SC-07 기본흐름을 본 세션에서 재확인, 나머지 예외흐름(SC-04 E1/E2, SC-06 E1~E4, SC-07 E1/E2, SC-02 E2)은 FE-07~09에서 이미 실측 검증되어 동일 컴포넌트 재사용 확인으로 갈음. 회귀 테스트 37건 유지, 테스트 데이터 정리) | Task 수행 완료 |

## 목차

1. 개요
2. Database Task
3. Backend Task
4. Frontend Task
5. 일정 매핑 (1일차/2일차)
6. 추적성

---

## 1. 개요

`docs/1-domain-definition.md` ~ `docs/7-erd.md`, `docs/schema.sql`을 근거로 Database/Backend/Frontend 단위 Task로 분할한다. 각 Task는 독립적으로 착수·완료 판단이 가능한 단위로 쪼갰으며, 선행 Task 완료 전에는 시작하지 않는다. Task ID 규칙: `DB-xx`, `BE-xx`, `FE-xx`.

---

## 2. Database Task

### DB-01. PostgreSQL 환경 준비

- **수행 작업**: PostgreSQL 17 인스턴스 준비(로컬 또는 개발 서버), 접속 계정 생성, `DATABASE_URL` 확정.
- **완료 조건**
  - [x] PostgreSQL 17 인스턴스에 `psql`로 접속 성공
  - [x] 애플리케이션 전용 DB(`todolist`) 및 사용자 계정 생성 완료
  - [x] `DATABASE_URL` 값 확정 및 로컬에 임시 기록(커밋 금지)
- **선행 Task**: 없음

### DB-02. 스키마 적용 (`docs/schema.sql`)

- **수행 작업**: `docs/schema.sql`을 대상 DB에 실행하여 `pgcrypto` 확장, `users`/`categories`/`todos` 테이블, FK·CHECK·UNIQUE 제약, 인덱스(`idx_categories_user_id`, `idx_todos_user_id`, `idx_todos_user_category`)를 생성한다.
- **완료 조건**
  - [x] `CREATE EXTENSION pgcrypto` 정상 실행
  - [x] `users`, `categories`, `todos` 3개 테이블 생성 확인(`\dt`)
  - [x] `categories(user_id, name)` UNIQUE, `users.email` UNIQUE 제약 존재 확인
  - [x] `todos` CHECK(`end_date >= start_date`), FK(`user_id`→users, `category_id`→categories, `ON DELETE RESTRICT`) 존재 확인
  - [x] 3개 인덱스 생성 확인(`\di`)
- **선행 Task**: DB-01

### DB-03. pg 커넥션 풀 모듈

- **수행 작업**: 백엔드에서 사용할 `pg Pool` 설정 모듈 작성(PRD §5 기준 `max: 20`), 연결 성공/실패 로그 처리.
- **완료 조건**
  - [x] `pool.js`(또는 동등 모듈)에서 `new Pool({ connectionString: DATABASE_URL, max: 20 })` 구성 완료
  - [x] 로컬에서 테스트 쿼리(`SELECT 1`) 실행 성공
  - [x] 커넥션 실패 시 프로세스가 명확한 에러 로그와 함께 종료/재시도되는지 확인
- **선행 Task**: DB-02

---

## 3. Backend Task

레이어 원칙(`docs/5-project-principle.md` §2.2): `route → controller → service → query`. 파일명 규칙 §3.1(`{도메인}.{계층}.js`) 준수.

### BE-01. 백엔드 프로젝트 셋업

- **수행 작업**: Express 앱 초기화, `.env`/`.env.example`(`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PORT`, `CORS_ORIGIN`), CORS(allowlist + `credentials: true`), 요청 로깅 미들웨어, 공통 `errorHandler`, `GET /health` 엔드포인트.
- **완료 조건**
  - [x] `npm run dev`(또는 동등 스크립트)로 서버 기동 성공
  - [x] `GET /health` 호출 시 DB 연결 상태 기반 200/500 응답 확인
  - [x] CORS 허용 오리진 외 요청이 차단되는지 확인
  - [x] 의도적 500 에러 발생 시 `errorHandler`가 일관된 JSON 에러 포맷으로 응답하는지 확인
- **선행 Task**: DB-03

### BE-02. 인증 유틸(JWT/비밀번호)

- **수행 작업**: `jwt.js`(access token 15분, refresh token 7일 발급/검증, access/refresh 시크릿 분리), `password.js`(bcrypt 해시/검증).
- **완료 조건**
  - [x] access token 발급 후 만료(15분) 검증 함수가 만료 전/후를 정확히 구분
  - [x] refresh token 발급/검증 함수가 access와 별도 시크릿을 사용함을 코드로 확인
  - [x] bcrypt 해시 생성 후 원문 비교(`compare`)가 정상 동작
- **선행 Task**: BE-01

### BE-03. 인증 API — 회원가입/로그인/토큰 재발급/로그아웃

- **수행 작업**: `auth.query.js`, `auth.service.js`, `auth.controller.js`, `auth.route.js` 작성.
  - 회원가입(FR-01): email unique 검사(BR-02) + password 해시 + User 생성 + '기본' Category 자동 생성(BR-09)을 하나의 트랜잭션으로 처리.
  - 로그인(FR-02): email/password 검증, access+refresh token 발급, refresh token은 HttpOnly 쿠키로 응답.
  - `/api/auth/refresh`: refresh token 검증 후 access token 재발급.
  - `/api/auth/logout`: refresh token 무효화.
- **완료 조건**
  - [x] `POST /api/auth/register` 성공 시 201, User·'기본' Category가 함께 생성됨(DB 확인)
  - [x] 중복 email로 가입 시 거부 응답(BR-02, SC-01 E1)
  - [x] `POST /api/auth/login` 성공 시 access token(body) + refresh token(HttpOnly 쿠키) 응답
  - [x] 잘못된 email/password 시 401 + 동일 에러 메시지(SC-02 E1/E3)
  - [x] `POST /api/auth/refresh` 정상 refresh token으로 새 access token 발급 확인
  - [x] 만료/무효 refresh token으로 401 확인(SC-02 E2)
  - [x] `POST /api/auth/logout` 후 해당 refresh token 재사용 시 거부됨
- **선행 Task**: BE-02, DB-02

### BE-04. 인증 미들웨어

- **수행 작업**: `auth.middleware.js` — access token 검증, 미인증/만료 시 401(BR-01), 검증 성공 시 `req.userId` 주입.
- **완료 조건**
  - [x] Authorization 헤더 없이 보호 API 호출 시 401
  - [x] 만료된 access token으로 호출 시 401
  - [x] 유효한 access token으로 호출 시 `req.userId`가 올바르게 채워짐(로그 또는 테스트로 확인)
- **선행 Task**: BE-02

### BE-05. 회원정보 API

- **수행 작업**: `users.query.js`, `users.service.js`, `users.controller.js`, `users.route.js` — `GET/PATCH /api/users/me`(FR-03), 본인만 수정 가능(BR-07), name 1~50자 검증.
- **완료 조건**
  - [x] `GET /api/users/me` 호출 시 본인 정보 반환(password/해시 미포함)
  - [x] `PATCH /api/users/me`로 name 수정 성공 및 `updatedAt` 갱신 확인
  - [x] name 형식 위반(빈 값/51자 이상) 시 400(SC-03 E2)
  - [x] 미인증 호출 시 401
- **선행 Task**: BE-04

### BE-06. 카테고리 API

- **수행 작업**: `category.query.js`, `categories.service.js`, `categories.controller.js`, `categories.route.js` — `GET/POST /api/categories`, `DELETE /api/categories/:id`. '기본' 카테고리 삭제 금지(BR-08), 삭제 시 소속 Todo '기본' 카테고리로 재배정하는 트랜잭션 처리.
- **완료 조건**
  - [x] `GET /api/categories` 호출 시 본인 카테고리만 반환(BR-06)
  - [x] `POST /api/categories`로 카테고리 생성 성공, 동일 이름 중복 생성 시 거부
  - [x] '기본' 카테고리 삭제 시도 시 거부 응답(BR-08)
  - [x] '기본' 아닌 카테고리 삭제 시 소속 Todo의 `category_id`가 '기본' 카테고리로 재배정됨을 DB로 확인
  - [x] 타인 소유 카테고리 삭제 시도 시 403(BR-06)
- **선행 Task**: BE-04, BE-03(기본 카테고리 생성 로직 재사용)

### BE-07. Todo 등록/수정/삭제 API

- **수행 작업**: `todo.query.js`, `todos.service.js`(일부), `todos.controller.js`, `todos.route.js` — `POST/PATCH/DELETE /api/todos`. 카테고리 미지정 시 '기본' 자동 적용(BR-03), categoryId 소유권/존재 검증(BR-04), `startDate<=endDate` 검증(BR-05), 소유권 검증(BR-06).
- **완료 조건**
  - [x] `POST /api/todos` 카테고리 지정 등록 성공(FR-04)
  - [x] 카테고리 미지정 등록 시 '기본' 카테고리로 자동 저장됨(BR-03, SC-04 대안흐름)
  - [x] `startDate > endDate` 등록 시도 시 거부(BR-05, SC-04 E1)
  - [x] 존재하지 않거나 타인 소유 categoryId 사용 시 거부(BR-04, SC-04 E2)
  - [x] `PATCH /api/todos/:id` 정상 수정 및 `updatedAt` 갱신 확인
  - [x] 타인 소유 Todo 수정/삭제 시도 시 403(BR-06, SC-06 E1/SC-07 E1)
  - [x] 존재하지 않는 Todo id 조작 시 404(SC-06 E2/SC-07 E2)
  - [x] `DELETE /api/todos/:id` 성공 시 실제 레코드 삭제 확인
- **선행 Task**: BE-06

### BE-08. Todo 목록 조회/필터링 API + 상태 파생 로직

- **수행 작업**: `GET /api/todos?categoryId=&status=`(FR-06), `todoStatus.js` 상태 파생 함수(§5: 완료→시작전→진행중→지연, 경계값 `startDate==오늘`/`endDate==오늘`은 진행중) 작성 및 목록 API에 적용.
- **완료 조건**
  - [x] 필터 없이 호출 시 본인 소유 Todo 전체 반환(BR-06)
  - [x] `categoryId` 필터 적용 시 해당 카테고리 Todo만 반환
  - [x] `status=not_started|in_progress|done|overdue` 4종 각각 §5 규칙대로 정확히 필터링됨(경계값 케이스 포함 수동 확인)
  - [x] Todo 0건/필터 결과 0건일 때 빈 배열 정상 반환(에러 아님, SC-05 E1)
- **선행 Task**: BE-07

### BE-09. 단위 테스트 (자동화 최소 범위)

- **수행 작업**: `docs/5-project-principle.md` §4 자동화 대상 3종 테스트 작성 — `todoStatus.test.js`, `dateRange.test.js`(BR-05), `defaultCategory.test.js`(BR-03).
- **완료 조건**
  - [x] `todoStatus` 함수가 4개 상태 + 경계값(시작일=오늘, 종료일=오늘) 케이스에서 모두 통과
  - [x] `startDate <= endDate` 검증 함수가 정상/위반 케이스 모두 통과
  - [x] '기본' 카테고리 자동 적용 로직이 미지정/지정 케이스 모두 통과
  - [x] `npm test` 실행 시 3개 테스트 파일 전부 성공
- **선행 Task**: BE-07, BE-08

### BE-10. 백엔드 수동 검증

- **수행 작업**: `docs/3-user-scenario.md` SC-01~SC-07 기본/예외 흐름을 Postman/curl로 1회씩 재현. BR-01(미인증 401), BR-06(타인 리소스 403)은 정상 사용자·타 사용자 토큰을 교차 호출해 확인.
- **완료 조건**
  - [x] SC-01~SC-07 기본 흐름 전부 기대 응답과 일치
  - [x] SC-01~SC-07의 예외 흐름(E1, E2 …) 전부 기대 상태코드/메시지와 일치
  - [x] 미인증 상태로 보호 API 호출 시 전부 401
  - [x] 타 사용자 토큰으로 다른 사용자의 Todo/Category 접근 시 전부 403
- **선행 Task**: BE-03, BE-05, BE-06, BE-07, BE-08

### BE-11. 배포 준비

- **수행 작업**: Express가 React 정적 빌드(`frontend/dist`)를 서빙하도록 정적 파일 미들웨어 설정, 배포 환경 `.env` 값 반영.
- **완료 조건**
  - [ ] 프론트 빌드 산출물을 Express가 서빙하고 브라우저에서 SPA 라우팅 정상 동작
  - [ ] `/api/*` 요청은 정적 파일 라우팅과 충돌 없이 API로 처리됨
  - [ ] 운영 `.env` 값(시크릿 포함) 적용 후 헬스체크 200 확인
- **선행 Task**: BE-10, FE-10

---

## 4. Frontend Task

레이어 원칙(FSD, `docs/5-project-principle.md` §2.1/§6): `app → pages → widgets → features → entities → shared`.

### FE-01. 프론트엔드 프로젝트 셋업

- **수행 작업**: React 19 + TypeScript 프로젝트 생성(Vite 등), Zustand·TanStack Query 설치, FSD 폴더 스캐폴딩(`app/pages/widgets/features/entities/shared`), `.env.example`(API base URL 등).
- **완료 조건**
  - [x] `npm run dev`로 개발 서버 기동 및 빈 화면 렌더링 확인
  - [x] FSD 최상위 6개 폴더(`app,pages,widgets,features,entities,shared`) 생성 완료
  - [x] `QueryClientProvider`가 `app/providers`에 구성되고 앱 루트에 적용됨
- **선행 Task**: 없음

### FE-02. shared 레이어

- **수행 작업**: `shared/api/client.ts`(공통 fetch 래퍼, Authorization 헤더 부착, 401 시 `/api/auth/refresh` 호출 후 재시도), `shared/ui/DatePicker.tsx`, `shared/lib/formatDate.ts`.
- **완료 조건**
  - [x] `client.ts`로 임의의 인증 필요 API를 호출하면 Authorization 헤더가 자동 부착됨
  - [x] access token 만료(401) 응답 시 자동으로 refresh 후 원 요청이 재시도됨(모킹 또는 실 서버로 확인)
  - [x] `DatePicker`가 날짜 선택 시 `YYYY-MM-DD` 형식 값을 반환
- **선행 Task**: FE-01, BE-04(401/refresh 응답 규격 확정 필요)

### FE-03. entities 레이어

- **수행 작업**: `entities/session`(Zustand `authStore` — access token, 로그인 여부), `entities/user`(타입 + `useUserQuery`), `entities/category`(타입 + `useCategoriesQuery`), `entities/todo`(타입, `todoStatus.ts` 파생 함수, `TodoCard`, `StatusBadge`, `useTodosQuery`).
- **완료 조건**
  - [x] `authStore`에 access token 저장/삭제 시 구독 컴포넌트가 즉시 반영됨
  - [x] `useUserQuery`/`useCategoriesQuery`/`useTodosQuery`가 각각 대응 API를 호출하고 로딩/에러/성공 상태를 제공
  - [x] `todoStatus.ts`가 BE-08과 동일한 규칙으로 4개 상태를 파생(프론트-백엔드 로직 불일치 없음)
  - [x] `StatusBadge`가 상태별 색상(회색/파랑/초록/빨강, §5)으로 렌더링됨
- **선행 Task**: FE-02

### FE-04. W-01 로그인/회원가입 화면

- **수행 작업**: `features/login`, `features/register` (폼 + mutation), `pages/auth-page/AuthPage.tsx`에서 탭 전환 UI로 결합(와이어프레임 W-01).
- **완료 조건**
  - [x] 로그인 탭에서 정상 로그인 시 access/refresh token 저장 후 목록 화면으로 이동
  - [x] 로그인 실패(잘못된 email/password) 시 동일 에러 메시지 표시(SC-02 E1/E3)
  - [x] 회원가입 탭에서 정상 가입 후 로그인 탭으로 전환
  - [x] 이메일 중복 가입 시도 시 인라인 에러 표시(BR-02, SC-01 E1)
  - [x] 탭 전환 시 입력값/에러가 서로 초기화됨
- **선행 Task**: FE-03, BE-03

### FE-05. W-02 회원정보 수정 화면

- **수행 작업**: `features/edit-profile`(폼 + mutation), `pages/profile-page/ProfilePage.tsx`.
- **완료 조건**
  - [x] 진입 시 현재 name이 표시됨(`useUserQuery`)
  - [x] name 수정 후 저장 시 성공 토스트 표시 및 값 반영
  - [x] name 형식 위반 시 인라인 에러 표시(SC-03 E2)
- **선행 Task**: FE-03, BE-05

### FE-06. W-03 할일 목록/필터링 화면

- **수행 작업**: `widgets/todo-list`, `features/filter-todos`(카테고리/상태 필터), `pages/todo-list-page/TodoListPage.tsx`. 데스크톱(사이드바)·모바일(드롭다운+칩) 반응형 레이아웃 모두 구현(PRD §5 브레이크포인트).
- **완료 조건**
  - [x] 데스크톱(>1024px)에서 좌측 카테고리 사이드바 + 상태 필터 탭 + Todo 카드 목록 렌더링
  - [x] 모바일(<640px)에서 카테고리 드롭다운 + 상태 필터 칩 + 카드 목록 + 플로팅 등록 버튼 렌더링
  - [x] 카테고리 필터 선택 시 해당 카테고리 Todo만 표시
  - [x] 상태 필터(전체/시작전/진행중/완료/지연) 각각 선택 시 올바른 결과만 표시
  - [x] Todo/필터 결과 없을 때 "할일이 없습니다" 빈 상태 표시(SC-05 E1)
- **선행 Task**: FE-03, BE-08

### FE-07. W-04 할일 등록/수정 화면

- **수행 작업**: `features/create-todo`(카테고리 선택 + 캘린더), `features/edit-todo`, `pages/todo-form-page/TodoFormPage.tsx`.
- **완료 조건**
  - [x] 제목/카테고리/시작일/종료일 입력 후 등록 성공 시 목록으로 이동, 새 Todo 반영
  - [x] 카테고리 미선택 시 "'기본' 카테고리가 자동 적용됩니다" 안내 문구 노출, 등록 결과도 '기본' 적용됨(BR-03)
  - [x] 종료일 캘린더에서 시작일 이전 날짜가 비활성화됨
  - [x] `startDate > endDate` 강제 입력 시 인라인 에러 표시(BR-05)
  - [x] 수정 화면 진입 시 기존 값이 채워지고, 완료 처리 체크박스가 노출됨(등록 화면에는 미노출)
  - [x] 수정 저장 성공 시 목록/상태 뱃지 즉시 갱신
- **선행 Task**: FE-03, BE-07

### FE-08. W-05 할일 삭제 확인 다이얼로그

- **수행 작업**: `features/delete-todo`(`ConfirmDeleteDialog.tsx` + mutation), 목록/수정 화면에서 삭제 버튼과 연결.
- **완료 조건**
  - [x] 삭제 버튼 클릭 시 모달 표시, 대상 Todo 제목 노출
  - [x] "삭제" 확정 시 API 호출 성공 후 모달 닫힘 + 목록에서 카드 즉시 제거 + 토스트 표시
  - [x] "취소" 클릭 시 아무 변화 없이 모달만 닫힘
- **선행 Task**: FE-06, BE-07

### FE-09. 라우팅/인증 가드

- **수행 작업**: `app/router.tsx`에 W-01~W-04 라우트 등록, 미인증 상태에서 보호 라우트 접근 시 W-01로 리다이렉트(BR-01), refresh 실패 시 전역 리다이렉트 처리.
- **완료 조건**
  - [x] 미인증 상태로 `/todos` 등 보호 라우트 직접 접근 시 로그인 화면으로 이동
  - [x] 인증 상태에서 `/login` 접근 시 목록 화면으로 리다이렉트(선택 사항이나 확인)
  - [x] refresh token까지 만료된 상태에서 API 호출 시 로그인 화면으로 강제 이동 + 세션 만료 안내 배너 표시(SC-02 E2)
- **선행 Task**: FE-04, FE-06

### FE-10. 반응형 점검 및 수동 시나리오 검증

- **수행 작업**: PRD §5 브레이크포인트(모바일<640px/태블릿640~1024px/데스크톱>1024px) 전 화면 점검, `docs/3-user-scenario.md` SC-01~SC-07 전체를 브라우저에서 수동 실행.
- **완료 조건**
  - [x] W-01~W-05 전 화면이 3개 브레이크포인트에서 레이아웃 깨짐 없이 표시됨
  - [x] SC-01~SC-07 기본 흐름 전부 화면상에서 재현 및 통과
  - [x] SC-01~SC-07 주요 예외 흐름(이메일 중복, 잘못된 날짜, 타인 리소스, 토큰 만료 등) 전부 화면상에서 재현 및 기대 동작 확인
- **선행 Task**: FE-04, FE-05, FE-06, FE-07, FE-08, FE-09

---

## 5. 일정 매핑 (1인 개발, 2일 — PRD §8)

| 일차 | Task |
| --- | --- |
| 1일차 | DB-01 ~ DB-03, BE-01 ~ BE-08, FE-01 ~ FE-04 |
| 2일차 | BE-09, BE-10, FE-05 ~ FE-10, BE-11 |

1일차 목표는 인증 포함 전체 API 완성과 로그인/회원가입 화면 연동까지이며, 2일차는 나머지 화면·반응형·검증·배포에 집중한다(PRD §8과 동일한 구간 배분).

---

## 6. 추적성

| Task 그룹 | 근거 문서 |
| --- | --- |
| Database (DB-01~03) | `docs/7-erd.md`, `docs/schema.sql`, PRD §5(성능/인덱스) |
| Backend (BE-01~11) | `docs/2-prd.md` §4/§5/§6/§7, `docs/1-domain-definition.md` §6 BR-01~BR-09, `docs/5-project-principle.md` §2.2/§2.3/§5 |
| Frontend (FE-01~10) | `docs/2-prd.md` §4/§5/§6, `docs/4-wireframe.md` W-01~W-05, `docs/5-project-principle.md` §2.1/§6, `docs/3-user-scenario.md` SC-01~SC-07 |

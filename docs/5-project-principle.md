# TodoList 프로젝트 구조 설계 원칙

## 버전 이력

| 버전  | 날짜       | 변경 내용 | 변경 사유 |
| ----- | ---------- | --------- | --------- |
| 0.1.0 | 2026-08-26 | 최초 작성 | -         |
| 0.2.0 | 2026-08-26 | 프론트엔드 디렉토리 구조(§6)를 Feature-Sliced Design(app/pages/widgets/features/entities/shared) 기준으로 전면 개편, §2.1 계층 원칙을 FSD 레이어/import 방향 규칙으로 갱신 | FSD 패턴 적용 요청 반영 |
| 0.3.0 | 2026-08-26 | §5 환경변수 항목에 `PORT` 로컬 개발 기본값 3000 명시 | backend/swagger.json servers.url과의 정합성 확보(문서에 포트 번호가 없어 발생하는 혼동 방지) |

## 목차

1. 최상위 공통 원칙
2. 의존성/레이어 원칙
3. 코드/네이밍 원칙
4. 테스트/품질 원칙
5. 설정/보안/운영 원칙
6. 프론트엔드 디렉토리 구조
7. 백엔드 디렉토리 구조
8. 도메인 정의서/PRD 추적성

---

## 1. 최상위 공통 원칙

- **1인 개발 2일 일정이 최우선 제약이다.** PRD §8 일정 계획을 넘어서는 구조(멀티패키지 모노레포, 마이크로서비스, 코드 제너레이터, 커스텀 CLI 등)는 도입하지 않는다.
- **YAGNI.** FR-01~FR-08(도메인 정의서 §7, PRD §4)에 없는 기능을 위한 레이어·추상화·설정 옵션을 미리 만들지 않는다. 예: 카테고리 CRUD는 PRD §4 참고 문구대로 FR-04에 부속된 최소 기능으로만 구현하고 별도 모듈로 분리하지 않는다.
- **도메인 정의서·PRD를 단일 진실 공급원(SSOT)으로 삼는다.** 엔티티 속성(§3), BR-01~BR-09, FR-01~FR-08과 코드가 어긋나면 문서를 먼저 갱신하고 코드를 맞춘다. 신규 규칙을 코드에서만 임의로 추가하지 않는다.
- **레이어는 최소 3~4단으로 고정한다.** 프론트: UI/상태/API 클라이언트, 백엔드: route/controller/service/query. 그 이상(예: DTO 변환 전용 레이어, repository 인터페이스+구현 분리) 은 만들지 않는다 — ORM 미사용(PRD §6) 환경에서 query 함수 자체가 이미 repository 역할을 한다.
- **PRD §5 성능 목표(동시접속 1000명, 응답 300ms/p95 800ms)는 인덱스·pg Pool 설정으로 대응**하고, 캐싱 레이어·큐·별도 조회 서버 같은 과도한 확장 설계는 2일 일정상 배제한다(PRD §9 리스크/가정과 동일한 실용주의).
- **자동화보다 수동 검증을 기본으로 삼는다.** PRD §9는 자동화 테스트를 생략하고 FR-01~08 수동 검증으로 대체한다고 명시한다 — 본 문서 §4에서 예외적으로 자동화할 최소 범위만 규정한다.

## 2. 의존성/레이어 원칙

### 2.1 프론트엔드 계층 — Feature-Sliced Design(FSD)

프론트엔드는 FSD 레이어 구조를 적용한다. 상위 레이어는 하위 레이어만 import할 수 있고, 역방향·동일 레이어 간 교차 import는 금지한다(`app → pages → widgets → features → entities → shared`).

| 레이어 | 역할 | 이 프로젝트에서의 예 |
| --- | --- | --- |
| app | 앱 초기화, 라우터, 전역 Provider(QueryClient 등) | `router.tsx`, `main.tsx` |
| pages | 라우트 단위 화면 조합(와이어프레임 W-01~W-04와 1:1) | `auth-page`, `todo-list-page` |
| widgets | 여러 feature/entity를 조합한 복합 UI 블록 | `todo-list` 위젯(카테고리 사이드바+목록 조합) |
| features | 사용자 행위 단위(FR-xx와 1:1에 가깝게 대응) | `create-todo`, `filter-todos`, `login` |
| entities | 도메인 엔티티(§3 User/Category/Todo)의 타입/조회 API/기본 UI | `entities/todo`, `entities/category`, `entities/session` |
| shared | 특정 도메인에 속하지 않는 공통 코드 | API 클라이언트 베이스, 공용 UI(ConfirmDialog, DatePicker), 유틸 |

- 서버 상태(TanStack Query)와 클라이언트 상태(Zustand)는 entities 레이어의 `model/` 세그먼트에 둔다: Todo/Category 조회·캐시는 `entities/{todo,category}/model`의 쿼리 훅, 로그인 여부·access token은 `entities/session/model`의 Zustand 스토어(PRD §6). 서버 데이터를 Zustand에 보관하지 않는 원칙은 유지한다.
- 각 슬라이스(feature/entity)는 필요한 만큼만 세그먼트(`ui/`, `model/`, `api/`, `lib/`)를 둔다 — 안 쓰는 세그먼트 폴더는 미리 만들지 않는다(§1 YAGNI).
- API 호출 함수는 해당 엔티티/기능이 속한 슬라이스의 `api/` 세그먼트에 두고, 공통 fetch 래퍼(Authorization 헤더 부착, 401 시 refresh 후 재시도 — SC-02 대안 흐름)만 `shared/api`에 둔다.

### 2.2 백엔드 계층

| 계층 | 역할 | 금지 사항 |
| --- | --- | --- |
| route | URL/메서드 매핑, 인증 미들웨어 부착(BR-01) | 비즈니스 로직 작성 금지 |
| controller | 요청/응답 변환(req→params, 결과→res.json), 입력 검증 호출, HTTP 상태 코드 결정(401/403/404/400) | SQL 작성 금지, 트랜잭션 직접 제어 금지 |
| service | 비즈니스 규칙(BR-01~BR-09) 적용 — 소유권 검사, '기본' 카테고리 자동 적용(BR-03), startDate<=endDate 검증(BR-05) 등 | HTTP(req/res) 객체를 알지 못해야 함 |
| query | `pg`로 작성한 순수 SQL 함수, 파라미터 바인딩만 담당 | 비즈니스 규칙 판단 금지(예: '기본' 카테고리 여부 판단은 service에서) |

의존 방향: `route → controller → service → query → pg Pool`. 역방향 및 계층 건너뛰기(controller가 query를 직접 호출하는 것 등) 금지 — 규칙이 service 한 곳에만 있어야 BR 변경 시 수정 지점이 하나로 고정된다.

### 2.3 ORM 미사용에 따른 query 계층 원칙

- 모든 SQL은 `$1, $2` 파라미터 바인딩을 사용한다(PRD §6, SQL 인젝션 방지). 문자열 결합으로 SQL을 조립하지 않는다.
- 쿼리는 테이블(엔티티) 단위 파일로 모듈화한다(`user.query.js`, `category.query.js`, `todo.query.js`) — PRD §9 "쿼리 함수를 재사용 가능한 모듈로 최소화" 가정을 그대로 따른다.
- 한 함수는 하나의 SQL 문만 담당한다(예: `findTodosByUserId`, `insertTodo`). 여러 query를 조합하는 흐름 제어(예: 카테고리 삭제 시 Todo 재배정 — BR-08)는 service 계층에서 트랜잭션으로 묶는다.
- 트랜잭션이 필요한 경우(BR-08 카테고리 삭제+Todo 재배정, BR-01/BR-09 회원가입+기본 카테고리 생성) service에서 `pool.connect()` 후 `BEGIN/COMMIT/ROLLBACK`을 명시적으로 처리한다. ORM의 자동 트랜잭션 관리가 없으므로 예외 발생 시 반드시 `ROLLBACK`을 `finally`/`catch`에서 호출한다.
- 목록 조회(FR-06)의 상태(시작전/진행중/완료/지연) 필터링은 도메인 정의서 §5에 따라 파생값이므로 SQL `WHERE`에서 상태 컬럼을 조건으로 걸지 않는다. `startDate/endDate/isDone` 조건으로 SQL에서 1차 필터링(PRD §5 인덱스 활용)하거나 조회 후 애플리케이션(service) 레벨에서 파생 판정한다.

## 3. 코드/네이밍 원칙

### 3.1 파일명

- 프론트: React 컴포넌트는 `PascalCase.tsx`(`TodoForm.tsx`), 훅은 `camelCase`+`use` 접두(`useTodosQuery.ts`), 순수 유틸은 `camelCase.ts`(`formatDate.ts`).
- 백엔드: `도메인.계층.js` 패턴 고정 — `todo.route.js`, `todo.controller.js`, `todo.service.js`, `todo.query.js`. 도메인 정의서 §3 엔티티(User/Category/Todo)와 1:1로 파일 세트를 구성한다.

### 3.2 함수명

- 백엔드 controller: `createTodo`, `getTodos`, `updateTodo`, `deleteTodo`(HTTP 동사가 아닌 도메인 행위 기준, FR-04/06/07/08과 매칭).
- 백엔드 query: `find*`(조회), `insert*`(생성), `update*`(수정), `delete*`(삭제) 접두 고정 — 예: `findTodosByUserId`, `insertTodo`, `updateTodoById`, `deleteTodoById`.
- 프론트 hooks: TanStack Query는 `use{Entity}Query`/`use{Action}{Entity}Mutation` — `useTodosQuery`, `useCreateTodoMutation`, `useDeleteTodoMutation`.

### 3.3 변수명

- boolean은 `is/has` 접두(`isDone`, `isLoading`) — 도메인 정의서 §3.3 `isDone` 필드명을 그대로 따른다.
- ID 변수는 `{entity}Id` 형태(`userId`, `categoryId`) — BR-04/BR-06 소유권 검사 코드에서 일관되게 사용해 가독성을 높인다.

### 3.4 TypeScript 타입 네이밍

- 도메인 엔티티 타입은 도메인 정의서 §3 엔티티명과 동일하게 `PascalCase` 단수형: `User`, `Category`, `Todo`.
- 파생 타입(요청/응답)은 `{Entity}{Purpose}` 접미: `CreateTodoRequest`, `TodoResponse`. 파생 상태 값은 유니온 타입으로 고정: `type TodoStatus = 'not_started' | 'in_progress' | 'done' | 'overdue'`(도메인 정의서 §5 4개 상태와 1:1 대응).
- 인터페이스에 `I` 접두를 붙이지 않는다(불필요한 컨벤션 배제).

### 3.5 DB 컬럼/테이블 네이밍과 도메인 정의서 §3 일치 원칙

- 테이블명은 엔티티명의 snake_case 복수형: `users`, `categories`, `todos`.
- 컬럼명은 도메인 정의서 §3 속성명을 **의미 그대로 유지**하며 PostgreSQL 관례에 맞춰 snake_case로 변환한다(1:1 매핑, 임의 축약 금지):

  | 도메인 정의서 §3 속성 | DB 컬럼 |
  | --- | --- |
  | id | id |
  | userId | user_id |
  | categoryId | category_id |
  | email / password / name | email / password_hash / name (평문 금지, §3.1 명시에 따라 `password`가 아닌 `password_hash`로 해시 저장을 명확히 함) |
  | title | title |
  | startDate / endDate | start_date / end_date |
  | isDone | is_done |
  | createdAt / updatedAt | created_at / updated_at |

- API 요청/응답(JSON)과 TypeScript 타입은 도메인 정의서 표기(camelCase)를 그대로 쓰고, DB 컬럼(snake_case)과의 변환은 query 계층 반환 시점에서만 처리한다(예: `SELECT id, user_id AS "userId", ...`) — 변환 로직이 여러 계층에 흩어지지 않도록 query 함수 경계에서 1회만 수행한다.

## 4. 테스트/품질 원칙

PRD §9 가정("자동화 테스트는 생략하고 핵심 시나리오 수동 검증으로 대체")을 따르되, 회귀 위험이 큰 로직만 최소 자동화한다.

**자동화 대상 (단위 테스트, 최소 범위)**
- 도메인 정의서 §5 Todo 상태 파생 로직(경계값 포함: `startDate == 오늘`, `endDate == 오늘`) — 로직 오류가 전 화면(W-03)에 파급되므로 1개 순수 함수 테스트로 커버.
- BR-05 검증 함수(`startDate <= endDate`).
- BR-03 '기본' 카테고리 자동 적용 로직.

이 3가지 외 컨트롤러/DB 통합 테스트, 프론트 컴포넌트 테스트는 작성하지 않는다(2일 일정 내 ROI 낮음).

**수동 검증으로 대체 (도메인 정의서/PRD 체크리스트 방식)**
- FR-01~FR-08 각 기능을 `docs/3-user-scenario.md` SC-01~SC-07의 기본/예외 흐름 그대로 브라우저에서 1회씩 수동 실행.
- BR-01(미인증 401), BR-06(타인 리소스 403) 등 접근 통제는 Postman/curl로 정상 사용자·타 사용자 토큰 교차 호출하여 수동 확인.
- 1000명 동시접속 부하테스트는 PRD §9와 동일하게 생략(설계 단계 인덱스/Pool 설정으로 갈음).

**품질 게이트**
- ESLint(프론트/백엔드 공통 규칙)만 CI 없이 로컬에서 커밋 전 1회 실행. 별도 Prettier 설정 등 도구 추가는 하지 않는다(설치된 것 이상 추가 금지).

## 5. 설정/보안/운영 원칙

- **환경변수**: `.env`로 관리(`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PORT`, `CORS_ORIGIN`). `.env`는 `.gitignore`에 포함하고 `.env.example`만 커밋한다. `PORT`는 로컬 개발 기본값 3000을 사용한다(`backend/swagger.json` servers 기준).
- **JWT 설정**: access token 만료 15분, refresh token 만료 7일(PRD §5 예시값 그대로 채택). access secret과 refresh secret은 서로 다른 값을 사용한다(하나가 유출되어도 다른 토큰까지 위조되지 않도록). refresh token은 HttpOnly + Secure + SameSite=Strict 쿠키로만 저장하고 응답 JSON body에는 포함하지 않는다(PRD §5, 클라이언트 JS 접근 불가 원칙).
- **CORS**: 프론트 오리진만 허용 목록(allowlist)으로 설정하고, credentials(쿠키) 전송을 허용한다(refresh token 쿠키 전달을 위해 `credentials: true` 필요).
- **SQL 인젝션 방지**: 모든 query 함수는 `$1, $2..` 파라미터 바인딩만 사용(§2.3과 동일 원칙, 재강조). 동적 컬럼/정렬 조건이 필요한 경우도 화이트리스트 매핑으로 값만 바인딩하고 컬럼명 문자열을 사용자 입력에서 직접 조립하지 않는다.
- **비밀번호**: bcrypt 등으로 해시 저장(§3.1 준수), 평문 로그 출력 금지.
- **로깅**: 요청 단위 구조화 로그(메서드/경로/상태코드/응답시간) 최소 1줄만 남긴다(morgan 또는 최소 커스텀 미들웨어). 별도 로그 수집 인프라(ELK 등)는 2일 일정상 도입하지 않는다. 에러 로그에는 password/토큰 값을 남기지 않는다.
- **헬스체크**: `GET /health` 1개 엔드포인트로 DB 연결 상태만 확인(200/500). 별도 메트릭 대시보드는 범위 밖.
- **배포**: 단일 Express 서버가 REST API + React 정적 빌드 서빙(PRD §6 아키텍처). 별도 리버스 프록시/컨테이너 오케스트레이션 설계는 2일 일정상 생략하고, 필요 시 이후 단계에서 추가한다.

## 6. 프론트엔드 디렉토리 구조 (Feature-Sliced Design)

레이어 순서(상→하, import는 하위 방향으로만): `app → pages → widgets → features → entities → shared`. 각 슬라이스 내부는 필요한 세그먼트(`ui/`, `model/`, `api/`, `lib/`)만 둔다.

```
frontend/
├── src/
│   ├── app/                          # 앱 초기화 (app 레이어)
│   │   ├── providers/
│   │   │   └── QueryClientProvider.tsx
│   │   ├── router.tsx                 # 라우트 정의 + 인증 가드(BR-01)
│   │   └── main.tsx
│   │
│   ├── pages/                         # 라우트 화면 (와이어프레임 W-01~W-04와 1:1)
│   │   ├── auth-page/
│   │   │   └── AuthPage.tsx           # W-01 로그인/회원가입 탭 (features/login, features/register 조합)
│   │   ├── profile-page/
│   │   │   └── ProfilePage.tsx        # W-02 회원정보 수정
│   │   ├── todo-list-page/
│   │   │   └── TodoListPage.tsx       # W-03 할일 목록/필터링 (widgets/todo-list 배치)
│   │   └── todo-form-page/
│   │       └── TodoFormPage.tsx       # W-04 할일 등록/수정
│   │
│   ├── widgets/                       # 여러 feature/entity를 조합한 복합 UI 블록
│   │   └── todo-list/
│   │       ├── ui/TodoListWidget.tsx  # 카테고리 사이드바 + 상태 필터 + Todo 카드 목록 조합
│   │       └── index.ts
│   │
│   ├── features/                      # 사용자 행위 단위 (FR-xx와 대응)
│   │   ├── login/                     # FR-02
│   │   │   ├── ui/LoginForm.tsx
│   │   │   └── model/useLogin.ts      # 로그인 mutation, access/refresh 저장(entities/session 경유)
│   │   ├── register/                  # FR-01
│   │   │   ├── ui/RegisterForm.tsx
│   │   │   └── model/useRegister.ts   # 이메일 중복(BR-02) 에러 처리
│   │   ├── edit-profile/              # FR-03
│   │   │   ├── ui/ProfileForm.tsx
│   │   │   └── model/useUpdateProfile.ts
│   │   ├── create-todo/               # FR-04, FR-05
│   │   │   ├── ui/TodoForm.tsx        # 카테고리 선택(기본 자동적용 안내, BR-03) + 캘린더(FR-05)
│   │   │   └── model/useCreateTodo.ts # BR-04/BR-05 서버 에러 매핑
│   │   ├── edit-todo/                 # FR-07
│   │   │   └── model/useUpdateTodo.ts
│   │   ├── delete-todo/               # FR-08
│   │   │   ├── ui/ConfirmDeleteDialog.tsx  # W-05
│   │   │   └── model/useDeleteTodo.ts
│   │   └── filter-todos/              # FR-06
│   │       ├── ui/CategoryFilter.tsx
│   │       ├── ui/StatusFilter.tsx
│   │       └── model/useTodoFilters.ts
│   │
│   ├── entities/                      # 도메인 엔티티 (§3 User/Category/Todo)
│   │   ├── session/                   # 인증 상태 (Zustand, 서버 데이터 아님)
│   │   │   └── model/authStore.ts     # access token, 로그인 여부(PRD §6)
│   │   ├── user/
│   │   │   ├── model/user.types.ts
│   │   │   └── api/user.api.ts        # GET/PATCH /api/users/me, useUserQuery
│   │   ├── category/
│   │   │   ├── model/category.types.ts
│   │   │   └── api/category.api.ts    # GET/POST/DELETE /api/categories, useCategoriesQuery
│   │   └── todo/
│   │       ├── ui/TodoCard.tsx
│   │       ├── ui/StatusBadge.tsx     # 시작전/진행중/완료/지연 뱃지(§5 색상 규칙)
│   │       ├── model/todo.types.ts    # Todo, TodoStatus
│   │       ├── model/todoStatus.ts    # startDate/endDate/isDone → TodoStatus 파생 함수(테스트 대상, §4)
│   │       └── api/todo.api.ts        # GET/POST/PATCH/DELETE /api/todos, useTodosQuery
│   │
│   └── shared/                        # 특정 도메인에 속하지 않는 공통 코드
│       ├── api/
│       │   └── client.ts              # 공통 fetch 함수, Authorization 헤더, 401→refresh 인터셉트
│       ├── ui/
│       │   └── DatePicker.tsx         # 범용 캘린더 입력(도메인 무관)
│       └── lib/
│           └── formatDate.ts
│
├── .env.example
└── package.json
```

- `entities/session`은 서버가 아닌 클라이언트 상태(access token 등)만 다루므로 `api/` 세그먼트가 없다 — 로그인/회원가입 API 호출은 `features/login`, `features/register`의 `model/`에 위치한다.
- `ConfirmDialog`처럼 삭제 확인에만 쓰이는 UI는 재사용 범위가 `delete-todo` feature로 한정되므로 `shared/ui`가 아닌 `features/delete-todo/ui`에 둔다(범용 UI만 shared로 승격).

## 7. 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── db/
│   │   ├── pool.js              # pg Pool 설정 (PRD §5 max 20)
│   │   └── migrations/          # SQL 마이그레이션 (users/categories/todos, 인덱스, unique 제약)
│   │       ├── 001_create_users.sql
│   │       ├── 002_create_categories.sql
│   │       └── 003_create_todos.sql
│   ├── routes/                  # URL 매핑 + 인증 미들웨어 부착
│   │   ├── auth.route.js        # /api/auth/*
│   │   ├── users.route.js       # /api/users/me
│   │   ├── categories.route.js  # /api/categories
│   │   └── todos.route.js       # /api/todos
│   ├── controllers/              # 요청/응답 변환, 상태 코드 결정
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── categories.controller.js
│   │   └── todos.controller.js
│   ├── services/                 # 비즈니스 규칙 (BR-01~BR-09)
│   │   ├── auth.service.js       # 회원가입+기본 카테고리 생성 트랜잭션(BR-09), 로그인, 토큰 발급/재발급
│   │   ├── users.service.js      # 본인 정보 수정(BR-07)
│   │   ├── categories.service.js # 삭제 시 기본 카테고리 재배정 트랜잭션(BR-08)
│   │   └── todos.service.js      # 소유권(BR-06), 기본 카테고리 적용(BR-03), 기간 검증(BR-05), 상태 파생(§5)
│   ├── queries/                  # 순수 SQL 함수 (pg, 파라미터 바인딩)
│   │   ├── user.query.js
│   │   ├── category.query.js
│   │   └── todo.query.js
│   ├── middlewares/
│   │   ├── auth.middleware.js    # access token 검증, 미인증 401(BR-01)
│   │   ├── errorHandler.js       # 공통 에러→상태코드 매핑(400/401/403/404)
│   │   └── validate.js           # 요청 바디 검증 (title 1~100자 등 §3 제약)
│   ├── utils/
│   │   ├── jwt.js                # access/refresh 토큰 발급/검증
│   │   ├── password.js           # bcrypt 해시/검증
│   │   └── todoStatus.js         # 상태 파생 함수 (프론트와 동일 규칙, 테스트 대상)
│   ├── app.js                    # Express 앱, CORS/미들웨어 등록
│   └── server.js                 # 서버 기동, /health 엔드포인트
├── tests/
│   ├── todoStatus.test.js        # §4 자동화 대상 1
│   ├── dateRange.test.js         # §4 자동화 대상 2 (BR-05)
│   └── defaultCategory.test.js   # §4 자동화 대상 3 (BR-03)
├── .env.example
└── package.json
```

---

## 8. 도메인 정의서/PRD 추적성

| 본 문서 섹션 | 근거 |
| --- | --- |
| §1 최상위 공통 원칙 | PRD §8 일정 계획, §9 리스크/가정 |
| §2 의존성/레이어 원칙 | PRD §6 기술 스택(ORM 미사용, pg 직접 SQL), 도메인 정의서 §6 BR-01~BR-09 |
| §3 코드/네이밍 원칙 | 도메인 정의서 §3 핵심 엔티티 및 속성 |
| §4 테스트/품질 원칙 | PRD §9 리스크("자동화 테스트 생략, 수동 검증 대체"), 도메인 정의서 §5 상태 판정 규칙 |
| §5 설정/보안/운영 원칙 | PRD §5 비기능 요구사항(보안/성능), 도메인 정의서 BR-01, BR-02, BR-06 |
| §6 프론트엔드 디렉토리 구조 | PRD §6 기술 스택, `docs/4-wireframe.md` W-01~W-05, FSD(Feature-Sliced Design) 패턴 |
| §7 백엔드 디렉토리 구조 | PRD §7 API 개요, 도메인 정의서 §6 BR-01~BR-09 |

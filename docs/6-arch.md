# TodoList 아키텍처 다이어그램

## 버전 이력

| 버전  | 날짜       | 변경 내용 | 변경 사유 |
| ----- | ---------- | --------- | --------- |
| 0.1.0 | 2026-08-26 | 최초 작성 | -         |

## 목차

1. 시스템 구성도
2. 백엔드 레이어 다이어그램
3. 인증 흐름 시퀀스 다이어그램
4. 프론트엔드 FSD 레이어 의존 방향 다이어그램

---

## 1. 시스템 구성도

브라우저가 단일 Express 서버에 접속하면, 이 서버가 정적 파일(React 빌드)과 REST API를 함께 서빙하고 PostgreSQL에 접근한다(PRD §6).

```mermaid
flowchart LR
    Browser["브라우저<br/>(React SPA)"]
    Express["Express 서버<br/>(정적 파일 + REST API)"]
    DB[("PostgreSQL 17")]

    Browser -- "정적 리소스 요청" --> Express
    Browser -- "REST API 요청<br/>(Bearer access token)" --> Express
    Express -- "pg Pool (SQL)" --> DB
```

## 2. 백엔드 레이어 다이어그램

요청은 route → controller → service → query 순으로만 흐른다. 계층 건너뛰기는 금지된다(5-project-principle.md §2.2).

```mermaid
flowchart LR
    Route[route<br/>URL 매핑 · 인증 미들웨어]
    Controller[controller<br/>요청/응답 변환 · 상태코드]
    Service[service<br/>비즈니스 규칙 BR-01~09]
    Query[query<br/>순수 SQL 함수]
    DB[("PostgreSQL")]

    Route --> Controller --> Service --> Query --> DB
```

## 3. 인증 흐름 시퀀스 다이어그램

로그인 시 access/refresh token을 함께 발급하고, access token 만료 시 refresh token으로 재발급 후 원 요청을 재시도한다(PRD §5, §7).

```mermaid
sequenceDiagram
    participant C as 클라이언트
    participant S as Express 서버
    participant DB as PostgreSQL

    C->>S: POST /api/auth/login (email, password)
    S->>DB: 사용자 조회 및 비밀번호 검증
    S-->>C: access token(body) + refresh token(HttpOnly 쿠키)

    C->>S: GET /api/todos (Authorization: Bearer access token)
    S-->>C: 200 OK (정상 응답)

    Note over C,S: access token 만료(15분 후)
    C->>S: GET /api/todos (만료된 access token)
    S-->>C: 401 Unauthorized

    C->>S: POST /api/auth/refresh (refresh token 쿠키)
    S->>DB: refresh token 유효성 확인
    S-->>C: 새 access token
    C->>S: GET /api/todos (재요청, 새 access token)
    S-->>C: 200 OK
```

## 4. 프론트엔드 FSD 레이어 의존 방향 다이어그램

상위 레이어는 바로 아래 레이어만 참조할 수 있는 단방향 의존 구조다(5-project-principle.md §2.1).

```mermaid
flowchart TD
    App[app] --> Pages[pages]
    Pages --> Widgets[widgets]
    Widgets --> Features[features]
    Features --> Entities[entities]
    Entities --> Shared[shared]
```

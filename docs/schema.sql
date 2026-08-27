-- TodoList DDL (PostgreSQL 17)
-- 근거: docs/7-erd.md, docs/1-domain-definition.md §3/§4/§6(BR-08, BR-09), docs/5-project-principle.md §3.5
-- ORM 미사용(PRD §6) — 이 스키마를 pg 드라이버로 직접 실행한다.

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid() 사용

-- users -----------------------------------------------------------------
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,                         -- 평문 저장 금지 (§3.1)
    refresh_token_hash TEXT,                             -- 로그인 시 발급 refresh token의 sha256 해시. NULL=로그아웃 상태(단일 세션 가정, BE-03)
    name          VARCHAR(50) NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- categories --------------------------------------------------------------
CREATE TABLE categories (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name    VARCHAR(30) NOT NULL CHECK (char_length(name) BETWEEN 1 AND 30),
    UNIQUE (user_id, name)                                -- 사용자별 카테고리명 unique
);

CREATE INDEX idx_categories_user_id ON categories(user_id);

-- todos ---------------------------------------------------------------------
CREATE TABLE todos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    -- ON DELETE RESTRICT: 카테고리 삭제는 반드시 애플리케이션이 소속 Todo를
    -- '기본' 카테고리로 재배정(BR-08)한 뒤 수행한다. DB가 임의로 CASCADE/SET NULL
    -- 하지 않도록 막아 비즈니스 규칙을 우회한 직접 DELETE를 방지한다.
    title       VARCHAR(100) NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    is_done     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_date >= start_date)                        -- BR-05
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_user_category ON todos(user_id, category_id);

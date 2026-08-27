#!/usr/bin/env bash
# BE-10 수동 검증 스크립트 (curl 기반)
# 사용법: bash backend/scripts/manual-verify-be10.sh
# 전제: 개발서버가 http://localhost:3000 에서 이미 실행 중, 로컬 postgres `todolist` DB 기동 중.

BASE="http://localhost:3000/api"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP="$SCRIPT_DIR/.tmp"
mkdir -p "$TMP"

BODYFILE="$TMP/body.json"
HEADERFILE="$TMP/headers.txt"
JAR_A="$TMP/cookies_a.txt"
JAR_B="$TMP/cookies_b.txt"
: > "$JAR_A"
: > "$JAR_B"

PASS=0
FAIL=0

check() {
  # check <name> <expected> <actual>
  local name="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "[$name] expected '$expected' got '$actual'" >&2
  fi
}

check_true() {
  # check_true <name> <bool-string>
  local name="$1" actual="$2"
  check "$name" "true" "$actual"
}

check_contains() {
  local name="$1" haystack="$2" needle="$3"
  if printf '%s' "$haystack" | grep -qF "$needle"; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "[$name] expected to contain '$needle' but got: $haystack" >&2
  fi
}

check_not_empty() {
  local name="$1" actual="$2"
  if [ -n "$actual" ]; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "[$name] expected non-empty value but got empty" >&2
  fi
}

check_ne() {
  local name="$1" a="$2" b="$3"
  if [ "$a" != "$b" ]; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "[$name] expected values to differ but both were '$a'" >&2
  fi
}

# Windows용 네이티브 curl(mingw32)은 비ASCII(-d '...') 인자를 argv 경계에서 손상시키므로
# 요청 바디는 항상 파일에 UTF-8로 기록한 뒤 --data-binary @file 로 전달한다.
REQFILE="$TMP/req_body.json"

# req <METHOD> <PATH> [DATA] [TOKEN] [JAR]
# sets $STATUS, $BODY, writes response headers to $HEADERFILE
req() {
  local method="$1" path="$2" data="$3" token="$4" jar="$5"
  local args=(-sS -X "$method" "$BASE$path" -H "Content-Type: application/json" -D "$HEADERFILE" -o "$BODYFILE" -w "%{http_code}")
  if [ -n "$data" ]; then
    printf '%s' "$data" > "$REQFILE"
    args+=(--data-binary "@$REQFILE")
  fi
  if [ -n "$token" ]; then args+=(-H "Authorization: Bearer $token"); fi
  if [ -n "$jar" ]; then args+=(-c "$jar" -b "$jar"); fi
  STATUS=$(curl "${args[@]}")
  BODY=$(cat "$BODYFILE")
}

# req_cookie <METHOD> <PATH> [DATA] <RAW-COOKIE-HEADER-VALUE>
req_cookie() {
  local method="$1" path="$2" data="$3" cookie="$4"
  local args=(-sS -X "$method" "$BASE$path" -H "Content-Type: application/json" -D "$HEADERFILE" -o "$BODYFILE" -w "%{http_code}")
  if [ -n "$data" ]; then
    printf '%s' "$data" > "$REQFILE"
    args+=(--data-binary "@$REQFILE")
  fi
  if [ -n "$cookie" ]; then args+=(-H "Cookie: $cookie"); fi
  STATUS=$(curl "${args[@]}")
  BODY=$(cat "$BODYFILE")
}

jget() {
  # jget <field.path> -- reads current $BODYFILE
  node -e '
    const fs = require("fs");
    let data;
    try { data = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); } catch (e) { process.stdout.write(""); process.exit(0); }
    const path = process.argv[2].split(".");
    let v = data;
    for (const k of path) { if (v == null) break; v = v[k]; }
    if (v === undefined || v === null) process.stdout.write("");
    else if (typeof v === "object") process.stdout.write(JSON.stringify(v));
    else process.stdout.write(String(v));
  ' "$BODYFILE" "$1"
}

find_id_by_name() {
  # find_id_by_name <name> -- reads current $BODYFILE (array of {id,name})
  node -e '
    const fs = require("fs");
    const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const item = (Array.isArray(data) ? data : []).find((c) => c.name === process.argv[2]);
    process.stdout.write(item ? item.id : "");
  ' "$BODYFILE" "$1"
}

json_is_array() {
  node -e '
    const fs = require("fs");
    try {
      const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
      process.stdout.write(Array.isArray(data) ? "true" : "false");
    } catch (e) { process.stdout.write("false"); }
  ' "$BODYFILE"
}

json_array_len() {
  node -e '
    const fs = require("fs");
    const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    process.stdout.write(String(Array.isArray(data) ? data.length : -1));
  ' "$BODYFILE"
}

json_array_has_id() {
  node -e '
    const fs = require("fs");
    const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const found = Array.isArray(data) && data.some((x) => x.id === process.argv[2]);
    process.stdout.write(found ? "true" : "false");
  ' "$BODYFILE" "$1"
}

json_array_all_field_eq() {
  node -e '
    const fs = require("fs");
    const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const field = process.argv[2], val = process.argv[3];
    const ok = Array.isArray(data) && data.length > 0 && data.every((x) => String(x[field]) === val);
    process.stdout.write(ok ? "true" : "false");
  ' "$BODYFILE" "$1" "$2"
}

get_cookie_value() {
  # get_cookie_value <jarfile> <name> -- Netscape cookie jar format
  awk -v n="$2" '$6==n {print $7}' "$1" | tail -n1
}

has_httponly_setcookie() {
  # has_httponly_setcookie <name> -- reads current $HEADERFILE
  local line
  line=$(grep -i "^Set-Cookie: $1=" "$HEADERFILE")
  if [ -n "$line" ] && printf '%s' "$line" | grep -qi "HttpOnly"; then
    echo "true"
  else
    echo "false"
  fi
}

TS="$(date +%s)_$$"
EMAIL_A="be10-manual-a-${TS}@test.local"
EMAIL_B="be10-manual-b-${TS}@test.local"
PASSWORD="Passw0rd123"
TODAY="$(date +%Y-%m-%d)"

echo "== SC-01 회원가입 =="

req POST "/auth/register" "{\"email\":\"$EMAIL_A\",\"password\":\"$PASSWORD\",\"name\":\"UserA\"}"
check "SC-01 register success status" "201" "$STATUS"
check "SC-01 register no password field" "" "$(jget password)"
check "SC-01 register no passwordHash field" "" "$(jget passwordHash)"

req POST "/auth/register" "{\"email\":\"$EMAIL_A\",\"password\":\"$PASSWORD\",\"name\":\"UserA\"}"
check "SC-01 E1 duplicate email status" "400" "$STATUS"
check "SC-01 E1 duplicate email code" "EMAIL_TAKEN" "$(jget code)"

req POST "/auth/register" "{\"email\":\"be10-manual-a-${TS}-empty@test.local\",\"password\":\"$PASSWORD\",\"name\":\"\"}"
check "SC-01 E2 empty name status" "400" "$STATUS"

req POST "/auth/register" "{\"email\":\"be10-manual-a-${TS}-nopw@test.local\",\"name\":\"UserA\"}"
check "SC-01 E3 missing password status" "400" "$STATUS"

echo "== SC-02 로그인/토큰갱신 =="

req POST "/auth/login" "{\"email\":\"$EMAIL_A\",\"password\":\"$PASSWORD\"}" "" "$JAR_A"
check "SC-02 login status" "200" "$STATUS"
ACCESS_A=$(jget accessToken)
check_not_empty "SC-02 login accessToken present" "$ACCESS_A"
check_true "SC-02 login Set-Cookie refreshToken HttpOnly" "$(has_httponly_setcookie refreshToken)"

req POST "/auth/refresh" "" "" "$JAR_A"
check "SC-02 refresh status" "200" "$STATUS"
check_not_empty "SC-02 refresh accessToken present" "$(jget accessToken)"

req POST "/auth/login" "{\"email\":\"$EMAIL_A\",\"password\":\"wrong-password\"}"
check "SC-02 E1 wrong password status" "401" "$STATUS"
MSG_WRONG_PW=$(jget message)

req POST "/auth/login" "{\"email\":\"be10-manual-nonexistent-${TS}@test.local\",\"password\":\"$PASSWORD\"}"
check "SC-02 E3 nonexistent email status" "401" "$STATUS"
MSG_NO_EMAIL=$(jget message)
check "SC-02 E1/E3 error messages identical" "$MSG_WRONG_PW" "$MSG_NO_EMAIL"

req_cookie POST "/auth/refresh" "" "refreshToken=forged.invalid.token"
check "SC-02 E2 forged refresh cookie status" "401" "$STATUS"

REFRESH_A_VALUE=$(get_cookie_value "$JAR_A" refreshToken)
req POST "/auth/logout" "" "" "$JAR_A"
check "SC-02 logout status" "204" "$STATUS"
req_cookie POST "/auth/refresh" "" "refreshToken=$REFRESH_A_VALUE"
check "SC-02 logout then reuse refresh status" "401" "$STATUS"

echo "== SC-03 회원정보수정 =="

req GET "/users/me" "" "$ACCESS_A"
check "SC-03 get me status" "200" "$STATUS"
check "SC-03 get me email" "$EMAIL_A" "$(jget email)"
OLD_UPDATED_AT=$(jget updatedAt)

sleep 1
req PATCH "/users/me" '{"name":"UserA-Updated"}' "$ACCESS_A"
check "SC-03 patch name status" "200" "$STATUS"
check "SC-03 patch name value" "UserA-Updated" "$(jget name)"
check_ne "SC-03 patch updatedAt changed" "$(jget updatedAt)" "$OLD_UPDATED_AT"

req PATCH "/users/me" '{"name":""}' "$ACCESS_A"
check "SC-03 E2 empty name status" "400" "$STATUS"

NAME51=$(printf 'a%.0s' $(seq 1 51))
req PATCH "/users/me" "{\"name\":\"$NAME51\"}" "$ACCESS_A"
check "SC-03 E2 51-char name status" "400" "$STATUS"

echo "== SC-04 할일등록 =="

req GET "/categories" "" "$ACCESS_A"
check "SC-04 get categories status" "200" "$STATUS"
DEFAULT_CAT_ID=$(find_id_by_name "기본")
check_not_empty "SC-04 default category found" "$DEFAULT_CAT_ID"

req POST "/categories" '{"name":"업무"}' "$ACCESS_A"
check "SC-04 create category status" "201" "$STATUS"
WORK_CAT_ID=$(jget id)
check_not_empty "SC-04 work category id present" "$WORK_CAT_ID"

req POST "/todos" "{\"title\":\"업무 할일\",\"categoryId\":\"$WORK_CAT_ID\",\"startDate\":\"$TODAY\",\"endDate\":\"$TODAY\"}" "$ACCESS_A"
check "SC-04 create todo with categoryId status" "201" "$STATUS"
check "SC-04 create todo categoryId echoes" "$WORK_CAT_ID" "$(jget categoryId)"
TODO1_ID=$(jget id)

req POST "/todos" "{\"title\":\"기본 카테고리 할일\",\"startDate\":\"$TODAY\",\"endDate\":\"$TODAY\"}" "$ACCESS_A"
check "SC-04 create todo without categoryId status" "201" "$STATUS"
check "SC-04 create todo default categoryId" "$DEFAULT_CAT_ID" "$(jget categoryId)"
TODO2_ID=$(jget id)

req POST "/todos" "{\"title\":\"잘못된 날짜\",\"startDate\":\"2026-09-10\",\"endDate\":\"2026-09-01\"}" "$ACCESS_A"
check "SC-04 E1 invalid date range status" "400" "$STATUS"
check "SC-04 E1 invalid date range code" "INVALID_DATE_RANGE" "$(jget code)"

req POST "/todos" "{\"title\":\"존재하지않는 카테고리\",\"categoryId\":\"00000000-0000-0000-0000-000000000000\",\"startDate\":\"$TODAY\",\"endDate\":\"$TODAY\"}" "$ACCESS_A"
check "SC-04 E2 invalid category status" "400" "$STATUS"
check "SC-04 E2 invalid category code" "INVALID_CATEGORY" "$(jget code)"

echo "== SC-05 목록조회/필터링 =="

req POST "/todos" "{\"title\":\"지연된 할일\",\"startDate\":\"2020-01-01\",\"endDate\":\"2020-01-02\"}" "$ACCESS_A"
TODO_OVERDUE_ID=$(jget id)

req POST "/todos" "{\"title\":\"시작전 할일\",\"startDate\":\"2027-01-01\",\"endDate\":\"2027-01-02\"}" "$ACCESS_A"
TODO_NOTSTARTED_ID=$(jget id)

req PATCH "/todos/$TODO1_ID" '{"isDone":true}' "$ACCESS_A"
check "SC-05 setup mark done status" "200" "$STATUS"

req GET "/todos" "" "$ACCESS_A"
check "SC-05 list no filter status" "200" "$STATUS"
check_true "SC-05 list no filter is array" "$(json_is_array)"

req GET "/todos?categoryId=$WORK_CAT_ID" "" "$ACCESS_A"
check "SC-05 filter categoryId status" "200" "$STATUS"
check_true "SC-05 filter categoryId all match" "$(json_array_all_field_eq categoryId "$WORK_CAT_ID")"

req GET "/todos?status=done" "" "$ACCESS_A"
check "SC-05 filter status=done status" "200" "$STATUS"
check_true "SC-05 filter status=done contains TODO1" "$(json_array_has_id "$TODO1_ID")"
check_true "SC-05 filter status=done all match" "$(json_array_all_field_eq status done)"

req GET "/todos?status=overdue" "" "$ACCESS_A"
check "SC-05 filter status=overdue status" "200" "$STATUS"
check_true "SC-05 filter status=overdue contains" "$(json_array_has_id "$TODO_OVERDUE_ID")"
check_true "SC-05 filter status=overdue all match" "$(json_array_all_field_eq status overdue)"

req GET "/todos?status=not_started" "" "$ACCESS_A"
check "SC-05 filter status=not_started status" "200" "$STATUS"
check_true "SC-05 filter status=not_started contains" "$(json_array_has_id "$TODO_NOTSTARTED_ID")"
check_true "SC-05 filter status=not_started all match" "$(json_array_all_field_eq status not_started)"

req GET "/todos?status=in_progress" "" "$ACCESS_A"
check "SC-05 filter status=in_progress status" "200" "$STATUS"
check_true "SC-05 filter status=in_progress contains TODO2" "$(json_array_has_id "$TODO2_ID")"
check_true "SC-05 filter status=in_progress all match" "$(json_array_all_field_eq status in_progress)"

req POST "/categories" '{"name":"빈카테고리"}' "$ACCESS_A"
EMPTY_CAT_ID=$(jget id)
req GET "/todos?categoryId=$EMPTY_CAT_ID" "" "$ACCESS_A"
check "SC-05 E1 empty category filter status" "200" "$STATUS"
check_true "SC-05 E1 empty category filter is array" "$(json_is_array)"
check "SC-05 E1 empty category filter length 0" "0" "$(json_array_len)"

echo "== SC-06 할일수정 =="

req PATCH "/todos/$TODO2_ID" '{"title":"수정된 제목"}' "$ACCESS_A"
check "SC-06 update title status" "200" "$STATUS"
check "SC-06 update title value" "수정된 제목" "$(jget title)"
UPDATED_AT_AFTER_TITLE=$(jget updatedAt)
check_not_empty "SC-06 update title updatedAt present" "$UPDATED_AT_AFTER_TITLE"

req PATCH "/todos/$TODO2_ID" '{"startDate":"2026-09-10","endDate":"2026-09-01"}' "$ACCESS_A"
check "SC-06 E1 invalid date range status" "400" "$STATUS"
check "SC-06 E1 invalid date range code" "INVALID_DATE_RANGE" "$(jget code)"

req PATCH "/todos/$TODO2_ID" '{"categoryId":"00000000-0000-0000-0000-000000000000"}' "$ACCESS_A"
check "SC-06 E2 invalid category status" "400" "$STATUS"
check "SC-06 E2 invalid category code" "INVALID_CATEGORY" "$(jget code)"

req PATCH "/todos/00000000-0000-0000-0000-000000000000" '{"title":"x"}' "$ACCESS_A"
check "SC-06 E3 nonexistent todo status" "404" "$STATUS"

echo "== SC-07 할일삭제 =="

req POST "/todos" "{\"title\":\"삭제될 할일\",\"startDate\":\"$TODAY\",\"endDate\":\"$TODAY\"}" "$ACCESS_A"
TODO_DEL_ID=$(jget id)

req DELETE "/todos/$TODO_DEL_ID" "" "$ACCESS_A"
check "SC-07 delete status" "204" "$STATUS"

req GET "/todos" "" "$ACCESS_A"
check_true "SC-07 deleted todo removed from list" "$([ "$(json_array_has_id "$TODO_DEL_ID")" = "false" ] && echo true || echo false)"

req DELETE "/todos/$TODO_DEL_ID" "" "$ACCESS_A"
check "SC-07 E1 delete already-deleted status" "404" "$STATUS"

echo "== BR-01 미인증 401 =="

req GET "/users/me"
check "BR-01 GET /users/me" "401" "$STATUS"
req PATCH "/users/me" '{"name":"x"}'
check "BR-01 PATCH /users/me" "401" "$STATUS"
req GET "/categories"
check "BR-01 GET /categories" "401" "$STATUS"
req POST "/categories" '{"name":"x"}'
check "BR-01 POST /categories" "401" "$STATUS"
req DELETE "/categories/$WORK_CAT_ID"
check "BR-01 DELETE /categories/:id" "401" "$STATUS"
req GET "/todos"
check "BR-01 GET /todos" "401" "$STATUS"
req POST "/todos" "{\"title\":\"x\",\"startDate\":\"$TODAY\",\"endDate\":\"$TODAY\"}"
check "BR-01 POST /todos" "401" "$STATUS"
req PATCH "/todos/$TODO2_ID" '{"title":"x"}'
check "BR-01 PATCH /todos/:id" "401" "$STATUS"
req DELETE "/todos/$TODO2_ID"
check "BR-01 DELETE /todos/:id" "401" "$STATUS"
req POST "/auth/logout"
check "BR-01 POST /auth/logout" "401" "$STATUS"

echo "== BR-06 타인리소스 403 =="

req POST "/auth/register" "{\"email\":\"$EMAIL_B\",\"password\":\"$PASSWORD\",\"name\":\"UserB\"}"
check "BR-06 register user B status" "201" "$STATUS"

req POST "/auth/login" "{\"email\":\"$EMAIL_B\",\"password\":\"$PASSWORD\"}" "" "$JAR_B"
check "BR-06 login user B status" "200" "$STATUS"
ACCESS_B=$(jget accessToken)
check_not_empty "BR-06 login user B accessToken" "$ACCESS_B"

req DELETE "/categories/$WORK_CAT_ID" "" "$ACCESS_B"
check "BR-06 B deletes A's category status" "403" "$STATUS"

req PATCH "/todos/$TODO2_ID" '{"title":"hacked"}' "$ACCESS_B"
check "BR-06 B updates A's todo status" "403" "$STATUS"

req DELETE "/todos/$TODO2_ID" "" "$ACCESS_B"
check "BR-06 B deletes A's todo status" "403" "$STATUS"

echo ""
echo "$PASS/$((PASS + FAIL)) checks passed"

rm -f "$BODYFILE" "$HEADERFILE" "$JAR_A" "$JAR_B" "$REQFILE"
echo "참고: 테스트 계정(email LIKE 'be10-manual-%')은 별도 1회성 스크립트로 정리해야 합니다 (User 삭제 API 없음)."

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0

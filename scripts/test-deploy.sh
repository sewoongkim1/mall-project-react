#!/bin/bash
# ================================================
# StyleAI 배포 환경 연결 테스트 스크립트
# ================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }
info() { echo -e "${YELLOW}[INFO]${NC} $1"; }

ERRORS=0

echo ""
echo "========================================"
echo "  StyleAI 배포 환경 검증 테스트"
echo "========================================"
echo ""

# ── 1. 서버 빌드 테스트 ──
info "서버 빌드 테스트 (tsc)..."
if (cd Server && npx tsc --noEmit 2>/dev/null); then
  pass "서버 TypeScript 빌드 성공"
else
  fail "서버 TypeScript 빌드 실패"
  ERRORS=$((ERRORS + 1))
fi

# ── 2. 클라이언트 빌드 테스트 ──
info "클라이언트 빌드 테스트 (vite build)..."
if (cd Client && npx vite build 2>/dev/null 1>/dev/null); then
  pass "클라이언트 Vite 빌드 성공"
else
  fail "클라이언트 Vite 빌드 실패"
  ERRORS=$((ERRORS + 1))
fi

# ── 3. 배포 설정 파일 존재 확인 ──
info "배포 설정 파일 확인..."

for f in "Client/vercel.json" "render.yaml"; do
  if [ -f "$f" ]; then
    pass "$f 존재"
  else
    fail "$f 미존재"
    ERRORS=$((ERRORS + 1))
  fi
done

# ── 4. 환경변수 가이드 파일 확인 ──
info "환경변수 파일 확인..."

for f in "Server/.env.production" "Client/.env.production"; do
  if [ -f "$f" ]; then
    pass "$f 존재"
  else
    fail "$f 미존재"
    ERRORS=$((ERRORS + 1))
  fi
done

# ── 5. Health check 엔드포인트 확인 (서버 실행 중인 경우) ──
info "Health check 엔드포인트 테스트..."

SERVER_URL="${1:-http://localhost:5000}"

if curl -sf "${SERVER_URL}/health" > /dev/null 2>&1; then
  HEALTH=$(curl -sf "${SERVER_URL}/health")
  pass "Health check 응답: ${HEALTH}"
else
  info "서버가 실행 중이 아닙니다 (${SERVER_URL}). 건너뜁니다."
fi

# ── 6. 빌드 산출물 확인 ──
info "클라이언트 빌드 산출물 확인..."

if [ -d "Client/dist" ] && [ -f "Client/dist/index.html" ]; then
  SIZE=$(du -sh Client/dist 2>/dev/null | cut -f1)
  pass "Client/dist 생성됨 (${SIZE})"
else
  fail "Client/dist 미존재"
  ERRORS=$((ERRORS + 1))
fi

# ── 결과 ──
echo ""
echo "========================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "  ${GREEN}모든 테스트 통과!${NC}"
  echo "  배포 준비가 완료되었습니다."
else
  echo -e "  ${RED}${ERRORS}개 테스트 실패${NC}"
  echo "  위 오류를 수정한 후 다시 실행하세요."
fi
echo "========================================"
echo ""

exit $ERRORS

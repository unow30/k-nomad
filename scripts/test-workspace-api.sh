#!/bin/bash

# 작업 공간 API 테스트 스크립트
# 로컬 Supabase 및 개발 서버가 실행 중이어야 합니다.

set -e

echo "🧪 작업 공간 API 테스트 시작..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Supabase 상태 확인
echo -e "${BLUE}1. Supabase 상태 확인${NC}"
if curl -s http://127.0.0.1:54321/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Supabase 실행 중${NC}"
else
    echo -e "${RED}✗ Supabase가 실행 중이지 않습니다. 'npm run supabase:start'를 실행하세요.${NC}"
    exit 1
fi
echo ""

# 2. 작업 공간 데이터 확인
echo -e "${BLUE}2. 작업 공간 데이터 확인${NC}"
WORKSPACE_COUNT=$(curl -s "http://127.0.0.1:54321/rest/v1/workspaces?select=count" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -H "Prefer: count=exact" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')

if [ "$WORKSPACE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ 작업 공간 데이터: ${WORKSPACE_COUNT}개${NC}"
else
    echo -e "${RED}✗ 작업 공간 데이터가 없습니다. 시드 데이터를 확인하세요.${NC}"
fi
echo ""

# 3. 도시 ID 조회
echo -e "${BLUE}3. 제주시 ID 조회${NC}"
CITY_ID=$(curl -s "http://127.0.0.1:54321/rest/v1/cities?select=id&name=eq.제주시" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$CITY_ID" ]; then
    echo -e "${GREEN}✓ 제주시 ID: ${CITY_ID}${NC}"
else
    echo -e "${RED}✗ 제주시를 찾을 수 없습니다.${NC}"
    exit 1
fi
echo ""

# 4. 제주시 작업 공간 조회
echo -e "${BLUE}4. 제주시 작업 공간 조회${NC}"
JEJU_WORKSPACES=$(curl -s "http://127.0.0.1:54321/rest/v1/workspaces?select=name,type&city_id=eq.${CITY_ID}" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH")

JEJU_COUNT=$(echo "$JEJU_WORKSPACES" | grep -o '"name"' | wc -l)
echo -e "${GREEN}✓ 제주시 작업 공간: ${JEJU_COUNT}개${NC}"
echo "$JEJU_WORKSPACES" | head -c 200
echo "..."
echo ""

# 5. 개발 서버 확인 (선택사항)
echo -e "${BLUE}5. 개발 서버 확인 (http://localhost:3000)${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 개발 서버 실행 중${NC}"

    # API 엔드포인트 테스트
    echo -e "${BLUE}6. API 엔드포인트 테스트${NC}"
    API_RESPONSE=$(curl -s "http://localhost:3000/api/cities/제주시/workspaces")

    if echo "$API_RESPONSE" | grep -q '"data"'; then
        echo -e "${GREEN}✓ API 응답 정상${NC}"
        echo "$API_RESPONSE" | head -c 200
        echo "..."
    else
        echo -e "${RED}✗ API 응답 오류${NC}"
        echo "$API_RESPONSE"
    fi
else
    echo -e "${BLUE}ℹ 개발 서버가 실행 중이지 않습니다. 'npm run dev'로 시작하세요.${NC}"
fi
echo ""

echo -e "${GREEN}🎉 테스트 완료!${NC}"
echo ""
echo "다음 단계:"
echo "1. 개발 서버 시작: npm run dev"
echo "2. 브라우저에서 확인: http://localhost:3000/city/제주시"
echo "3. 작업 공간 섹션이 표시되는지 확인"

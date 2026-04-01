# DB 스키마 설계

> 버전: v1.0 | Database: MongoDB | ODM: Mongoose

---

## 전체 테이블 목록 (17개)

| 영역 | 테이블 | 설명 |
|------|--------|------|
| 회원/인증 | `users` | 회원 기본 정보 |
| 회원/인증 | `social_accounts` | 소셜 로그인 연동 |
| 회원/인증 | `user_preferences` | AI 추천용 취향 정보 |
| 셀러 | `sellers` | 셀러 계정 및 브랜드 정보 |
| 상품 | `products` | 상품 기본 정보 |
| 상품 | `product_images` | 상품 이미지 |
| 상품 | `product_variants` | 사이즈/색상별 SKU + 재고 |
| 주문 | `orders` | 주문 헤더 |
| 주문 | `order_items` | 주문 라인 아이템 |
| 결제 | `payments` | 결제 정보 (토스페이먼츠) |
| 배송 | `deliveries` | 배송 추적 |
| 리뷰 | `reviews` | 상품 리뷰 |
| 찜 | `wishlists` | 위시리스트 |
| AI 추천 | `user_behavior_logs` | 행동 로그 (AI 데이터) |
| AI 추천 | `ai_recommendations` | AI 추천 결과 캐시 |
| AI 추천 | `product_embeddings` | 상품 벡터 임베딩 |
| AI 추천 | `ab_test_results` | A/B 테스트 결과 |
| 정산 | `settlements` | 월별 셀러 정산 |
| 정산 | `settlement_items` | 정산 상세 |
| 쿠폰 | `coupons` | 쿠폰 정의 |
| 쿠폰 | `coupon_usages` | 쿠폰 사용 내역 |

---

## 핵심 설계 결정

### 1. ObjectId 기본키
모든 도큐먼트는 MongoDB의 `_id` (ObjectId)를 기본키로 사용합니다.
- 분산 환경에서 충돌 없는 ID 생성
- 순차 ID로 인한 데이터 유추 방지

### 2. 주문 구조 (Orders ↔ OrderItems)
헤더-라인 패턴을 사용합니다.
- `orders`: 주문 전체 정보 (구매자, 배송지, 총액)
- `order_items`: 상품별 라인 (셀러별로 분리 가능)
- 멀티 셀러 플랫폼 특성상 1개 주문에 여러 셀러의 상품 포함 가능

### 3. 상품 재고 관리
`product_variants` 테이블로 SKU 단위 관리합니다.
- `sku`: 고유 상품코드 (예: PRD001-M-WHITE)
- `stock_qty`: 재고 수량 (0이면 품절 자동 처리)
- 주문 시 트랜잭션으로 재고 차감

### 4. AI 추천 데이터 흐름
```
user_behavior_logs  ─→  (배치 처리)  ─→  ai_recommendations
product_embeddings  ─→  (벡터 유사도)  ─→  콘텐츠 기반 추천
ai_recommendations  ─→  ab_test_results  ─→  성능 측정
```

### 5. 행동 로그 설계
`user_behavior_logs`는 비로그인(sessionId) + 로그인(userId) 모두 수집합니다.
- `event_type`: VIEW, CLICK, WISHLIST, CART_ADD, PURCHASE, REVIEW, SEARCH
- `metadata`: 이벤트별 추가 데이터 (JSON)
  - VIEW: `{ duration_ms: 3200 }`
  - SEARCH: `{ query: "오버핏 셔츠" }`
  - CART_ADD: `{ variant_id: "uuid" }`

### 6. 벡터 임베딩

`product_embeddings`는 MongoDB의 도큐먼트 데이터로 벡터를 저장합니다.
- Anthropic Claude API 기반 텍스트 분석 + 자체 임베딩 처리
- 상품명 + 설명 + 카테고리 + 스타일 태그를 합산하여 임베딩
- 유사도 검색을 위한 벡터 도큐먼트에 저장 (나중에 단계별 처리)

### 7. AI 추천 캐싱 전략

`ai_recommendations` 테이블은 MongoDB에 추천 결과를 캐싱합니다.
- `expires_at` 필드로 TTL 기반 만료 관리
- 트래픽 증가 시 Redis 캐싱 레이어 추가 고려 (Phase 5 이후)
- 현재 단계에서는 MongoDB TTL 인덱스로 자동 만료 처리

---

## 주요 인덱스 전략

| 테이블 | 인덱스 컬럼 | 목적 |
|--------|------------|------|
| `users` | `email` | 로그인 조회 (UNIQUE) |
| `products` | `seller_id`, `category`, `status` | 셀러별/카테고리별 목록 |
| `orders` | `buyer_id`, `status` | 구매자 주문 목록 |
| `order_items` | `order_id`, `seller_id` | 주문 상세, 셀러 주문 목록 |
| `user_behavior_logs` | `user_id`, `event_type`, `occurred_at` | AI 데이터 집계 |
| `ai_recommendations` | `user_id`, `expires_at` | 유효한 추천 결과 조회 |
| `wishlists` | `(user_id, product_id)` UNIQUE | 중복 찜 방지 |

---

## 확장 및 마이그레이션 전략

### Phase 5 이후 추가 예정
- `user_similarity`: 협업 필터링용 유저 유사도 테이블
- `notification_logs`: 푸시/이메일 발송 이력
- `seller_follows`: 셀러 팔로우 기능

### 마이그레이션 명령

```bash
# Mongoose 스키마 생성 (모델 파일도)
npm install mongoose typescript @types/mongoose

# 로컬 MongoDB 실행 (개발 환경)
mongo

# MongoDB Compass (GUI 도구)
# https://www.mongodb.com/products/tools/compass
```

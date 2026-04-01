# 🛍️ StyleAI — AI 의류 쇼핑몰

Node.js + Express + MongoDB (서버) / React + Vite (클라이언트) 기반 멀티셀러 AI 쇼핑몰

---

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. 환경변수 설정
```bash
# 서버
cp server/.env.example server/.env
# → server/.env 열고 MongoDB URI, API 키 입력

# 클라이언트
cp client/.env.example client/.env
# → 기본값 사용 가능 (개발 시 vite proxy 사용)
```

### 3. MongoDB 준비
- [MongoDB Atlas](https://cloud.mongodb.com) 무료 클러스터 생성
- Connection String을 `server/.env`의 `MONGODB_URI`에 입력

### 4. 개발 서버 실행
```bash
# 루트에서 서버+클라이언트 동시 실행
npm run dev

# 서버: http://localhost:5000
# 클라이언트: http://localhost:5173
```

---

## 📁 프로젝트 구조

```
styleai/
├── server/                # Node.js + Express + MongoDB
│   └── src/
│       ├── config/        # DB, Anthropic 연결 설정
│       ├── controllers/   # auth, product, ai
│       ├── middleware/    # JWT 인증, 에러 핸들러
│       ├── models/        # User, Product, Order, ...
│       └── routes/        # API 라우트
├── client/                # React + Vite
│   └── src/
│       ├── api/           # Axios API 함수
│       ├── components/    # UI 컴포넌트
│       ├── hooks/         # React Query 훅
│       ├── pages/         # 페이지 컴포넌트
│       └── store/         # Zustand 스토어
└── docs/                  # 설계 문서
```

---

## 🔌 API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| GET  | `/api/auth/me` | 현재 유저 |
| GET  | `/api/products` | 상품 목록 (필터/정렬) |
| GET  | `/api/products/:id` | 상품 상세 |
| POST | `/api/products` | 상품 등록 (셀러) |
| GET  | `/api/ai/recommendations` | AI 추천 (로그인 필요) |
| POST | `/api/ai/behavior` | 행동 로그 기록 |

---

## 🧩 구현 완료 / 예정

- [x] 인증 (회원가입, 로그인, JWT)
- [x] 상품 CRUD
- [x] AI 개인화 추천 (Claude API)
- [x] 행동 로그 수집
- [x] 장바구니 (Zustand)
- [ ] 주문/결제 (토스페이먼츠)
- [ ] 셀러 대시보드
- [ ] 관리자 페이지
- [ ] 리뷰 시스템
- [ ] 찜하기

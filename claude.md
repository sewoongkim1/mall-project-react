# 🛍️ AI 의류 쇼핑몰 플랫폼 — 프로젝트 컨텍스트

> Claude Code가 이 프로젝트 작업 시 항상 참조하는 핵심 문서입니다.

---

## 📌 프로젝트 구조

```
styleai/                   ← 모노레포 루트
├── server/                ← Node.js + Express + MongoDB
│   └── src/
│       ├── config/        ← DB, Anthropic 설정
│       ├── controllers/   ← 비즈니스 로직
│       ├── middleware/    ← auth, errorHandler
│       ├── models/        ← Mongoose 스키마
│       ├── routes/        ← API 라우트 정의
│       └── index.ts       ← 서버 진입점
└── client/                ← React + Vite
    └── src/
        ├── api/           ← Axios API 함수
        ├── components/    ← UI + feature 컴포넌트
        ├── hooks/         ← React Query 훅
        ├── pages/         ← 페이지 컴포넌트
        ├── store/         ← Zustand 상태
        ├── types/         ← TypeScript 타입
        └── utils/         ← 유틸 함수
```

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | StyleAI (AI 의류 마켓플레이스) |
| 서비스 유형 | 멀티 셀러 의류 쇼핑몰 플랫폼 |
| 핵심 차별점 | AI 개인화 상품 추천 (Claude API 활용) |
| 개발 방식 | 1인 개발, AI 보조 |
| 총 기간 | 약 4개월 (15주) |

---

## 🏗️ 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT + Passport.js (이메일 + 소셜) |
| Storage | AWS S3 / Cloudinary (이미지) |
| 결제 | 토스페이먼츠 API |
| AI 추천 | Anthropic Claude API |
| 배포 | Vercel (프론트) + Railway/Render (백엔드) |
| 스타일 | Tailwind CSS |

---

## 👥 사용자 역할

- **구매자 (Buyer)**: 상품 탐색, 구매, AI 추천 수신
- **셀러 (Seller)**: 상품 등록/관리, 주문 처리, 매출 조회
- **관리자 (Admin)**: 플랫폼 운영, 정산, AI 성능 모니터링

---

## 📁 설계 문서 위치

| 문서 | 경로 | 내용 |
|------|------|------|
| 기능 정의서 | `docs/feature-definition.md` | 전체 기능 ID별 명세 |
| 사용자 스토리 | `docs/user-stories.md` | 구매자 14개 + 셀러 11개 |
| 화면 설계 | `docs/wireframes.md` | 9개 주요 화면 구조 설명 |
| WBS | `docs/wbs.md` | 5 Phase / 45개 작업 일정 |
| DB 스키마 | `docs/database-schema.md` | 테이블 설계 (작성 예정) |

---

## 🗂️ 프로젝트 Phase 요약

| Phase | 기간 | 내용 |
|-------|------|------|
| Phase 1 | W1~W2 | 기획, DB 설계, 개발환경 구축 |
| Phase 2 | W3~W4 | 인증/회원 시스템 |
| Phase 3 | W5~W8 | 상품 등록, 검색, 장바구니, 결제 |
| Phase 4 | W9~W11 | 주문, 배송, 리뷰, 행동 로그 수집 |
| Phase 5 | W12~W15 | AI 개인화 추천 엔진 |

---

## 🤖 AI 추천 시스템 핵심 구조

```
유저 행동 로그 수집 (클릭/찜/구매)
        ↓
데이터 가공 파이프라인 (배치)
        ↓
Claude API 취향 분석
        ↓
추천 결과 캐싱 (Redis/Supabase)
        ↓
홈/상세 페이지 추천 노출
```

---

## 📐 코드 컨벤션

- 언어: TypeScript (strict mode)
- Frontend 컴포넌트: 함수형, Hooks 활용
- Backend: RESTful API, `/api/v1/` prefix
- 폴더 구조: Client (React/Vite), Server (Express 분리)
- DB 모델: Mongoose schemas
- 커밋: Conventional Commits (`feat:`, `fix:`, `docs:` 등)

---

## ⚡ Claude Code 작업 시 주의사항

1. **AI 추천 관련 기능**은 반드시 `docs/feature-definition.md`의 AI-001~AI-008 스펙을 참조
2. **DB 스키마 변경** 시 Mongoose 모델 파일과 migration 스크립트도 함께 생성
3. **셀러/구매자 권한 분리** — JWT payload의 role 필드 + Express 미들웨어로 검증
4. **행동 로그 수집**은 모든 상품 클릭/찜/구매 이벤트에 자동 삽입
5. 결제 관련 코드는 토스페이먼츠 공식 SDK 사용
6. Backend API는 CORS 설정하여 React Vite 클라이언트와 통신

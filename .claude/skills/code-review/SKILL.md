---
name: code-review
description: 코드 리뷰 수행. PR 리뷰, 코드 품질 점검, 
  버그 탐지, 보안 취약점 확인 시 사용.
---

# Code Review

## 검토 항목
1. 버그 가능성 (null 참조, 경계값, 예외 처리)
2. 보안 취약점 (SQL injection, XSS 등)
3. 성능 이슈 (불필요한 루프, N+1 쿼리)
4. 가독성 및 유지보수성

## 출력 형식
- 🔴 Critical: 반드시 수정 필요
- 🟡 Warning: 개선 권장
- 🟢 Good: 잘 작성된 부분

## 예시
파일을 분석한 뒤 위 형식으로 리뷰 결과를 제공하세요.

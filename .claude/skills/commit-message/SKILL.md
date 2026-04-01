---
name: commit-message
description: Git 커밋 메시지를 Conventional Commits 형식으로 작성. 
  "커밋 메시지 만들어줘", "commit", "변경사항 정리" 요청 시 사용.
---

# Commit Message Generator

## 지침
1. `git diff --staged`로 스테이징된 변경사항을 확인
2. Conventional Commits 형식으로 커밋 메시지 작성
3. 형식: `type(scope): 간결한 설명`

## 타입 규칙
- feat: 새 기능
- fix: 버그 수정
- refactor: 리팩토링
- docs: 문서 수정
- style: 코드 스타일 변경
- test: 테스트 추가/수정

## 예시
Input: 로그인 API에 JWT 토큰 인증 추가
Output: feat(auth): JWT 기반 인증 구현

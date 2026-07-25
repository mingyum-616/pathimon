# 프로젝트 구조

> 최종 정리: 2026-07-25 · project-organizer

## 실행 흐름

1. GitHub Actions가 `app/`에서 의존성을 설치하고 Vite 빌드를 실행한다.
2. `NAME_SELECTIONS.json`이 활성 패시몬 노트를 선택한다.
3. `pathimonNoteData.ts`와 `pathimonNoteParser.ts`가 노트를 게임 데이터로 변환한다.
4. `app/public/`의 런타임 자산과 빌드 결과가 GitHub Pages에 배포된다.

## 활성 구조

- `.github/workflows/`: GitHub Pages 배포 자동화
- `app/src/`: Phaser 게임 코드, 데이터 파서, 테스트
- `app/public/`: 게임에서 직접 사용하는 이미지와 오디오
- `app/scripts/`: 자산 생성과 데이터 검증 도구
- `claudecode/`: 패시몬 노트 작성 양식과 작업 규칙
- `docs/`: 현재 설계, 감사 결과, 마이그레이션 문서

## 로컬 아카이브

- 위치: `_archive/`
- 복원 기록: `_archive/MANIFEST.json`
- 원칙: Git에는 포함하지 않으며, 원래 상대 경로를 보존한다.
- 복원: `MANIFEST.json`의 `from`과 `to`를 반대로 적용한다.

# 개발 메모

## 목표

목표는 독립적인 웹 기반 eXBuilder6 호환 화면 편집기입니다.

사용자는 브라우저에서 새 화면을 만들거나 기존 eXBuilder6 `.clx`와 `.js`를 열고, 화면을 직접 확인하면서 수정한 뒤 다시 `.clx`와 `.js`로 내보낼 수 있어야 합니다. 기본 흐름에서는 XML이나 내부 구조를 보지 않아도 되어야 합니다.

## MVP 범위

현재 구현은 아래 흐름을 우선 지원합니다.

1. `.clx` XML 파싱
2. 화면 루트 `cl:group` 탐색
3. 주요 시각 컴포넌트 캔버스 렌더링
4. 트리 기반 컴포넌트 선택
5. 속성 패널 수정
6. 드래그 또는 이동 버튼으로 formdata row/col 조정
7. Grid 컬럼 편집
8. 선택 노드 XML 직접 수정
9. `.clx` / `.js` 내보내기

## UX 원칙

- 기본은 쉬운 보기입니다.
- 첫 화면에는 추가하기, 캔버스, 쉬운 속성만 둡니다.
- 화면 구조, 데이터 모델, CLX/JS 소스, 선택 XML은 고급 보기에서만 노출합니다.
- 컴포넌트명과 속성명은 가능한 한 한국어 작업 언어로 보여줍니다.
- 자주 쓰는 작업은 XML이 아니라 버튼과 입력칸으로 끝나야 합니다.

## 호환성 원칙

- CLX를 문자열 생성 결과로만 다루지 않고 XML DOM으로 유지합니다.
- UI가 아직 모르는 노드도 DOM 안에 남겨서 export 시 보존합니다.
- 새로 추가하는 컴포넌트는 eXBuilder6의 `cl:*`, `std:sid`, `cl:formdata`, `cl:formlayout` 구조를 따릅니다.
- 완전 호환에 가까워지려면 실제 eXBuilder6에서 만든 다양한 CLX 샘플을 round-trip 테스트로 축적해야 합니다.

## 다음 구현 후보

- form layout row/column 시각 편집
- grid header/detail column 편집
- datamap/dataset/submission 편집
- component drag and resize
- project template import
- JS handler 목록과 버튼 listener 연결 UI

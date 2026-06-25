# eXBuilder6 화면 마법사

eXBuilder6에서 새 화면을 만들 때 반복해서 작성하는 `.clx`와 `.js` 초안을 브라우저에서 바로 생성하는 정적 도구입니다.

## 실행

`index.html`을 브라우저로 열면 됩니다. 별도 서버나 빌드 과정은 없습니다.

## 주요 기능

- 조회 목록, 입력 저장, 팝업 선택 프리셋
- 프로젝트 프로필별 앱 경로, URL prefix, 공통 util, 메시지 설정
- 화면명, 화면 ID, 파일명, 크기 입력
- 조회 조건과 목록/입력 컬럼 정의 및 itemset/정렬/읽기전용 옵션
- 조회, 초기화, 추가, 저장, 삭제 이벤트 선택
- 생성된 CLX/JS 미리보기
- CLX/JS 복사 및 다운로드
- 브라우저 localStorage 자동 저장

## 프로젝트 설정

프로젝트별 규칙은 `assets/js/config.js`에서 바꿉니다.

- `profiles`: 프로젝트 프로필 목록입니다. 앱 경로 prefix, endpoint prefix, 공통 util 팩토리를 지정합니다.
- `endpointPatterns`: 프로필 적용 시 조회/저장/삭제 URL을 만드는 패턴입니다.
- `messages`: 생성되는 JS의 확인/경고 문구와 조회 성공 메시지 코드를 지정합니다.
- `controlRules`: 컬럼명으로 컨트롤을 추론하는 규칙입니다.
- `codeItems`: combobox itemset 코드입니다. 컬럼 라인의 itemset 칸에서 키로 참조합니다.

## 컬럼 입력 형식

각 줄에 아래 순서로 적습니다.

```text
컬럼명 | 라벨 | 타입 | 필수여부 | 컨트롤 | 그리드폭 | itemset | 정렬 | 읽기전용 | 최대길이
```

예시:

```text
USER_ID | 사용자 ID | string | Y | inputbox | 140 |  | left | N | 20
USER_NM | 사용자명 | string | Y | inputbox | 160 |  | left | N | 50
USE_YN | 사용여부 | string | N | combobox | 80 | USE_YN | center
REG_DT | 등록일 | string | N | dateinput | 110 |  | center | Y
MEMO | 메모 | string | N | textarea | 260
```

뒤쪽 옵션은 비워도 됩니다. 기존처럼 6칸만 입력해도 정상 생성됩니다.

지원 컨트롤: `inputbox`, `combobox`, `dateinput`, `textarea`

## 생성물 성격

생성된 파일은 바로 업무 화면의 출발점으로 쓰기 위한 스캐폴드입니다. 프로젝트별 공통 UDC, 공통 코드 itemset, 권한 처리, 메시지 코드, 서버 응답 규격은 실제 프로젝트 규칙에 맞게 이어 붙이면 됩니다.

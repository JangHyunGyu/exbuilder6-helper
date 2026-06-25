# 작성 메모

## 화면 프리셋

- 조회 목록: `dmSearch`, `dsList`, `subList`, 선택된 저장/삭제 submission을 생성합니다.
- 입력 저장: `dmForm` 중심의 입력 폼과 저장 이벤트를 생성합니다.
- 팝업 선택: 검색 조건, 결과 그리드, 선택/닫기 버튼과 `app.close()` 반환 코드를 생성합니다.

## 프로젝트 프로필

프로젝트별 차이는 `assets/js/config.js`의 `profiles`에서 관리합니다.

- `appPathPrefix`: 프로필 적용 시 앱 경로를 `{prefix}/{screenId}`로 다시 만듭니다.
- `endpointPrefix`: `endpointPatterns`의 `{prefix}`에 들어갑니다.
- `utilFactory`: 생성되는 JS의 공통 util 생성 함수명입니다.
- `messages`: 저장/삭제 확인 문구, 조회 성공 메시지 코드 등을 프로필별로 덮어쓸 수 있습니다.

## 컬럼 라인

```text
컬럼명 | 라벨 | 타입 | 필수여부 | 컨트롤 | 그리드폭 | itemset | 정렬 | 읽기전용 | 최대길이
```

- 컬럼명은 영문/숫자/언더스코어 기준으로 정규화됩니다.
- 필수여부는 `Y`, `필수`, `true`, `1`을 필수로 인식합니다.
- `*_YMD`, `*_DT`, `*DATE`는 `dateinput`으로 추론합니다.
- `*_YN`, `*_CD`는 `combobox`로 추론합니다.
- `itemset`은 `config.js`의 `codeItems` 키 또는 `값:라벨,값:라벨` 형식의 인라인 목록을 받습니다.
- 정렬은 `left`, `center`, `right` 또는 `좌`, `가운데`, `우`를 받습니다.
- 읽기전용은 `Y`, `true`, `1`, `읽기전용`을 받습니다.
- 최대길이는 컨트롤의 `maxlength` attribute로 생성됩니다.

## 후속 보정

생성 후 eXBuilder6에서 실제 프로젝트 공통 요소를 붙여야 합니다.

- 공통 UDC 헤더/타이틀
- 공통 코드 itemset 중 반복되는 값은 `config.js`의 `codeItems`에 먼저 등록
- 권한별 버튼 제어
- 공통 메시지 코드와 문구는 `config.js`의 `messages`에서 기본값 지정
- 서버 응답 DataMap/DataSet 세부 규격

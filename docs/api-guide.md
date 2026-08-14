# API Guide

> 프론트엔드 API 연동을 위한 한글 참고 문서입니다.
>
> - 실제 endpoint / HTTP method / request·response 필드 / enum 값의 최종 기준은 `docs/openapi.json`입니다.
> - 이 문서는 화면별 용도와 기존에 공유된 한글 예시를 이해하기 쉽게 정리한 보조 문서입니다.
> - 이 문서와 `openapi.json`이 다르면 임의로 맞추지 말고 차이를 먼저 확인합니다.

## 1. 초기 모드 / 오늘 화면

### GUEST
사용자 정보가 없으면 프론트엔드가 온보딩 화면을 띄웁니다.

```json
{
  "mode": "GUEST",
  "user": null,
  "location": null,
  "currentTime": null,
  "uvSummary": null,
  "sunProtection": null,
  "solutions": null
}
```

### OUTING

```json
{
  "mode": "OUTING",
  "user": {
    "name": "지수",
    "position": "레이오버"
  },
  "location": {
    "city": "시드니",
    "country": "호주"
  },
  "currentTime": "10:24 AM",
  "uvSummary": {
    "location": "시드니",
    "uvIndex": 11,
    "koreaComparison": 2.5,
    "flightExposureMinutes": 30,
    "koreaEquivalentMinutes": 75,
    "weather": {
      "condition": "CLEAR",
      "temperature": 24
    }
  },
  "sunProtection": {
    "tags": ["비오는 날", "자외선 약함"],
    "products": [
      {
        "productId": 10,
        "name": "아벤느 솔레어",
        "type": "무기자차",
        "spf": 50,
        "recommended": false
      }
    ],
    "message": "무기자차와 선스틱을 활용하는 것을 추천해요!"
  }
}
```

### INDOOR
OUTING과 유사하지만 `sunProtection`, `solutions`가 `null`인 형태로 공유됨.

### OpenAPI 기준
- `GET /today`

---

## 2. 프로필 설정 / 온보딩

### 기존 한글 예시 Request

```json
{
  "name": "지수",
  "baseAirport": "INCHEON",
  "skinType": "SENSITIVE",
  "skinConcerns": ["BLEMISH", "REDNESS"],
  "procedure": {
    "hasHistory": true,
    "details": "레이저 토닝",
    "withinOneMonth": true
  },
  "sunscreens": [
    {
      "name": "라로슈포제 선크림",
      "type": "무기자차",
      "spf": 50,
      "pa": "PA+"
    }
  ]
}
```

선크림 등록을 건너뛰는 경우:

```json
{
  "sunscreens": []
}
```

### OpenAPI 기준
- `POST /users/{userId}/profile`
- `POST /users/{userId}/sunscreen`

### ⚠️ 확인 필요
- 한글 예시에서는 프로필+선크림이 한 번에 보이지만 OpenAPI에서는 endpoint가 분리됨.
- OpenAPI의 `ProfileSetupRequest`는 `skinTypes` 배열을 사용.
- `baseAirport` enum은 현재 `INCHEON`, `GIMPO`.
- 시술 필드명은 OpenAPI의 `ProcedureDto` 기준으로 확인.
- 선크림은 `brand`, `filterType`, `productType`, `spf`, `pa` 형식을 OpenAPI 기준으로 사용.

---

## 3. 스케줄표 이미지 추출

### 업로드
- Key: `image`
- 예시 파일명: `schedule_capture.jpg`

### 기존 예시 Response

```json
{
  "flightNumber": "KE121",
  "departureAirport": "ICN",
  "arrivalAirport": "SYD",
  "departureTime": "2026-08-05T18:45:00",
  "arrivalTime": "2026-08-06T06:20:00",
  "isQuickTurn": false
}
```

### OpenAPI 기준
- `POST /schedules/extract`
- `multipart/form-data`

### ⚠️ 확인 필요
OpenAPI의 실제 응답은 `fileName`과 `schedules` 배열을 포함하는 `ScheduleExtractResponse` 구조임.

---

## 4. 스케줄 등록

### 기존 예시 Request

```json
{
  "flightNumber": "KE121",
  "departureAirport": "ICN",
  "arrivalAirport": "SYD",
  "departureTime": "2026-08-05T18:45:00",
  "arrivalTime": "2026-08-06T06:20:00",
  "isQuickTurn": false
}
```

### 기존 예시 Response

```json
{
  "status": "SUCCESS",
  "message": "비행 일정이 성공적으로 등록되었습니다.",
  "data": {
    "scheduleId": 105
  }
}
```

### OpenAPI 기준
- `POST /schedules`

### ⚠️ 확인 필요
- OpenAPI의 `ScheduleCreateRequest`는 `schedules` 배열을 받음.
- OpenAPI의 `ScheduleCreateResponse`에는 현재 `status`, `message`만 정의되어 있고 `data.scheduleId`는 없음.

---

## 5. 일정 조회

### 기존 예시 Response

```json
{
  "scheduleId": 105,
  "date": "2026-08-09",
  "route": "ICN → SYD",
  "riskLevel": "DANGER",
  "isOuting": true,
  "uvDetail": {
    "graph": [
      { "time": "00:00", "uvValue": 0 },
      { "time": "06:00", "uvValue": 2 },
      { "time": "12:00", "uvValue": 11 },
      { "time": "18:00", "uvValue": 4 },
      { "time": "24:00", "uvValue": 0 }
    ],
    "warningMessage": "자외선 차단제를 반드시 사용하세요 (09~17시)"
  }
}
```

### OpenAPI 기준
- `GET /schedules/daily?date=YYYY-MM-DD`
- `GET /schedules/calendar?month=...`
- `PATCH /schedules/{scheduleId}`

---

## 6. 외출 여부 스위치 토글

### 기존 예시 Request

```json
{
  "isOuting": false
}
```

### OpenAPI 기준
- `PATCH /schedules/{scheduleId}/outing`

### ⚠️ 확인 필요
OpenAPI의 `ScheduleOutingRequest` 필드는 현재:

```json
{
  "outing": false
}
```

즉 `isOuting`과 `outing` 중 실제 최신 백엔드 필드를 확인해야 함.

---

## 7. 자외선 월간 리포트

### OpenAPI 기준
- `GET /reports/monthly?year=YYYY&month=M`

### 주요 응답 영역
- `summary`
- `routeRanking`
- `dailyExposure`
- `trend`
- `analysis`
- `nextMonthForecast`
- `clinic`

### ⚠️ 확인 필요
- 기존 한글 예시의 `summary.comparisonMultiplier`는 현재 OpenAPI의 `Summary`에 정의되어 있지 않음.
- OpenAPI의 `Clinic`에는 `exposurePercentage`가 정의되어 있음.

---

## 8. 선크림 사용 기록

### Request

```json
{
  "sunscreenId": 12,
  "isApplied": true
}
```

### OpenAPI 기준
- `POST /schedules/{scheduleId}/solution/apply`

---

## 9. 선크림 검색

### OpenAPI 기준
- `GET /sunscreens/search?keyword=검색어`

### 주요 필드
- `id`
- `name`
- `brand`
- `filterType`
- `productType`
- `spf`
- `pa`

---

## 10. 마이페이지

### 기존 예시 Response

```json
{
  "name": "정도영",
  "baseAirport": "ICN",
  "skinType": "복합성",
  "skinConcerns": ["기미", "건조"],
  "pouch": [
    {
      "productId": 1,
      "name": "선크림1",
      "type": "유기자차",
      "spf": "50+++"
    }
  ]
}
```

### OpenAPI 기준
- `GET /users/profile`
- `PUT /users/profile`
- `GET /users/pouch`
- `PUT /users/pouch/{productId}`
- `DELETE /users/pouch/{productId}`
- `GET /users/procedures`
- `POST /users/procedures`
- `DELETE /users/procedures/{procedureId}`

### ⚠️ 확인 필요
- OpenAPI의 마이페이지 응답은 `skinTypes` 배열을 사용.
- 파우치 항목은 `type` 대신 `productType`, `filterType`으로 분리되어 있음.

---

## 11. 프로필 수정

### 기존 예시 Request

```json
{
  "name": "정도영",
  "baseAirport": "인천",
  "skinType": "민감성",
  "skinConcerns": ["기미", "잡티", "여드름"],
  "procedureHistory": {
    "hasHistory": true,
    "detail": "레이저 시술",
    "isRecentOneMonth": false
  }
}
```

### OpenAPI 기준
- `PUT /users/profile`

### ⚠️ 확인 필요
OpenAPI의 `ProcedureHistoryDto`에는 `recentOneMonth`과 `isRecentOneMonth`가 둘 다 정의되어 있어 실제 사용 필드 확인 필요.

---

## 12. 공항 데이터

현재 OpenAPI에는 공항 목록 검색 endpoint가 없음.

프론트에서 별도로 보유한 `airports.json`을 사용해 자동완성을 구현할 수 있음.

권장 흐름:
1. 공항명 또는 IATA 코드 입력
2. `airports.json`에서 후보 필터링
3. 화면에는 `인천, ICN` 형식으로 표시
4. API에는 백엔드가 요구하는 실제 값으로 변환해서 전송

### ⚠️ baseAirport 주의
현재 자료에서 `baseAirport`가 `INCHEON`, `GIMPO`, `ICN`, `인천` 등 여러 형식으로 등장함.
특히 OpenAPI의 온보딩 `ProfileSetupRequest` enum은 현재 `INCHEON`, `GIMPO`이므로 IATA 코드를 그대로 보내면 맞지 않을 수 있음.

---

## 13. Kiro가 API 연결 시 따라야 할 원칙

1. endpoint, HTTP method, Request/Response 필드, enum은 `docs/openapi.json`을 최우선 기준으로 사용.
2. `api-guide.md`는 화면별 의도와 기존 한글 예시를 이해하기 위한 보조 문서.
3. 두 문서가 다르면 임의로 수정하지 말고 사용자에게 먼저 보고.
4. 이미 구현된 UI/디자인은 API 연결을 이유로 변경하지 않기.
5. 기존 컴포넌트 구조를 불필요하게 리팩토링하지 않기.
6. mock data, localStorage, fallback 로직을 먼저 파악한 뒤 API로 교체하기.
7. 데이터를 생성·수정·삭제하는 API를 테스트 목적으로 임의 호출하지 않기.
8. `userId`처럼 출처가 불명확한 값은 추측하지 말고 확인하기.
9. 진행 상황과 설명은 한국어로 작성하기.

---

## 14. 권장 연동 순서

1. 온보딩 / 사용자 프로필
2. 선크림 등록 및 검색
3. 홈 `/today`
4. 일정 이미지 추출 및 등록
5. 일정 캘린더 / 날짜별 조회 / 외출 토글
6. 선크림 사용 기록
7. 마이페이지 / 파우치 / 시술 내역
8. 월간 리포트

각 단계마다 실제 Request/Response와 현재 프론트 상태 구조가 맞는지 먼저 확인한 뒤 다음 단계로 진행합니다.

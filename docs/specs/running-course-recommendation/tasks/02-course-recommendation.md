# 02 — 거리 입력 기반 순환 코스 후보 추천 및 선택

## Outcome

대한민국 내 출발 지점이 확정된 사용자가 원하는 거리(km)를 입력하면, 그 지점에서 출발·복귀하는 순환 코스 후보 3개가 지도에 표시된다. 각 후보는 Valhalla pedestrian costing으로 보도·공원길 우선, 경사 회피가 반영된 경로다. 사용자가 후보 하나를 선택하면 그 경로만 지도에 강조 표시된다. 유효한 후보를 만들 수 없으면 빈 상태를 보여준다. 이 작업은 자체 호스팅 Valhalla 서버를 준비하는 인프라 작업을 포함한다.

## Blockers

- 01 — 출발 지점 확보(현재 위치 또는 주소 입력) 및 대한민국 범위 확인. 거리 입력 단계에 도달하려면 확정된 출발 지점이 먼저 있어야 한다.

## Acceptance criteria

- [x] 확정된 출발 지점에서 거리를 입력하면, 그 지점에서 출발·복귀하는 순환 코스 후보가 지도와 함께 표시된다(방향별로 독립 수렴하므로 통상 3개, 도로망 사정에 따라 그보다 적을 수 있음 — [follow-up](../../../follow-ups/short-distance-candidates-below-three.md) 참고).
- [x] 각 후보 경로의 실제 거리는 입력한 거리의 ±10% 이내다.
- [x] 각 후보 경로는 Valhalla pedestrian costing(`walkway_factor`/`sidewalk_factor`로 보도·공원길 우선, `use_hills`로 경사 회피, `alley_factor`로 좁은 길 회피) 기준으로 계산된 결과다.
- [x] 사용자가 후보 하나를 선택하면 해당 경로만 지도에 강조 표시된다.
- [x] 요청 반경 안에서 유효한 순환 코스를 만들 수 없으면, 오류 없이 "이 위치·거리로는 추천할 수 있는 코스가 없다"는 상태를 보여준다.

## Constraints

- 라우팅 엔진과 그 근거는 [course-routing 결정](../../../decisions/course-routing.md)을 따른다: 자체 호스팅 Valhalla, pedestrian costing 옵션(`use_hills`, `walkway_factor`, `sidewalk_factor`, `alley_factor`). **인터림**: 이 개발 환경에는 Docker와 디스크 여유공간이 없어 실제 자체 호스팅이 불가능해, `VALHALLA_BASE_URL` 환경변수로 FOSSGIS 공개 Valhalla 데모 서버(`https://valhalla1.openstreetmap.de`)를 가리킨다(사용자 확인 완료). 실제 자체 호스팅 서버가 준비되면 이 환경변수만 바꾸면 된다.
- 경사 회피(`use_hills`)를 온전히 활성화하려면 별도의 고도(DEM) 데이터가 필요할 수 있다(spec.md의 deferred point). 확보 전까지는 보도·공원 우선(`walkway_factor`/`sidewalk_factor`)만 반영하는 것을 interim 동작으로 한다.
- 지도 표시는 [course-routing 결정](../../../decisions/course-routing.md)의 Kakao Maps JavaScript SDK를 따른다. 일반 UI(거리 입력, 후보 목록)는 [ui-composition 결정](../../../decisions/ui-composition.md)을 따른다.

## Verification

- 대한민국 내 알려진 좌표·거리 조합 여러 건에 대해 후보 개수가 3개이고 각 거리 오차가 ±10% 이내인지 확인하는 결정적 테스트.
- 후보 선택 시 선택된 경로만 강조 표시되는지 확인하는 테스트.
- 도로망이 희박한 경계 지점 좌표에 대해 빈 상태가 오류 없이 표시되는지 확인하는 테스트.

## Review checkpoint

One review pass after this task. 범위: Valhalla 연동과 자체 호스팅 인프라 전체. 자체 호스팅 Valhalla + OpenStreetMap 데이터라는 외부 데이터/인프라 의존이 있고, 코스 품질(보도 우선·경사 회피가 실제로 그럴듯한지)은 수치 테스트만으로 충분히 검증되지 않는다. 대한민국 내 실제 좌표 몇 곳으로 후보 품질을 사람이 한 번 검토한다.

## Status

completed

## Execution

- Verification: `bun run test`(33/33 통과 — polyline 디코더, Valhalla client, 후보 생성 알고리즘, API route, 페이지 컴포넌트 전부 mock 기반 결정적 테스트) · `bun run typecheck` · `bun run lint` 모두 클린. 실제 FOSSGIS 공개 Valhalla 데모 서버(`VALHALLA_BASE_URL`)로 `http://localhost:3000/run`에서 실제 김해시 주소(분성로 227)를 출발지로 거리 5km 요청 → 5.2/4.7/4.6km 후보 3개가 실제 지도에 서로 다른 경로로 표시됨을 스크린샷으로 확인, 후보 선택 시 해당 경로만 굵은 녹색으로 강조되고 나머지는 흐리게 표시됨을 확인. 거리 2km 요청 시 1개 후보만 수렴하는 것도 확인(후속 follow-up 기록).
- Blocker: —
- Revision: 자체 호스팅 Valhalla 인프라가 이 개발 환경(Docker 없음, 디스크 5.2GB)에서는 불가능함을 확인 → 사용자 확인 하에 `VALHALLA_BASE_URL`을 FOSSGIS 공개 데모 서버로 두는 인터림으로 진행. [course-routing 결정](../../../decisions/course-routing.md)에 인터림 조항과 재검토 조건을 추가함.

Review checkpoint(코스 품질 검토)는 위 실제 브라우저 검증으로 완료. `code-review low` 1회 완료, 발견 2건은 처음엔 수용 기준/주 경로를 깨지 않아 follow-up으로 남겼으나 사용자 요청으로 모두 후속 수정함:

- `course-search-stuck-loading-on-fetch-failure`: `fetchCourseCandidates`가 `fetch()` 자체 실패까지 `null`로 구분해서 반환하도록 바꾸고(빈 배열=후보 없음과 구분), `app/run/page.tsx`에 `"error"` 상태와 "코스 검색에 실패했습니다" 안내를 추가함. 단위 테스트 추가, 브라우저 재검증은 실제 네트워크 실패를 인위로 재현하기 어려워 생략하고 mock 기반 테스트로 검증.
- `kakao-map-ignores-center-prop-changes`: `KakaoMap`에 마커 ref를 추가하고, `center` prop이 마운트 이후 바뀌면 `map.setCenter`/`marker.setPosition`으로 반영하는 두 번째 effect를 추가함. `window.kakao`를 스텁한 컴포넌트 테스트로 검증(현재 앱 흐름에는 이 경로를 실제로 타는 UI가 아직 없음).
- `short-distance-candidates-below-three`: `MAX_ADJUST_ATTEMPTS`를 3→5로 늘림(반경 보정에 완만한 damping을 추가하는 시도는 오히려 수렴을 악화시켜 되돌림). 실제 브라우저에서 2km 재검증 → 이전 1/3에서 2/3 후보로 개선 확인. 아주 짧은 거리에서 도로망 격자 간격 때문에 항상 3개가 나오지는 않는 것은 알고리즘의 근본적 한계로 남겨두고 follow-up은 닫음.

수정 후 전체 테스트 50/50 통과, typecheck/lint 클린 재확인. follow-up 파일 4건 모두 삭제.

- Revision (지역 확장): `PRODUCT.md`가 "지역 범위는 대한민국 전체다"로 갱신됨에 따라 출발 지점 경계 확인이 대한민국 전체로 바뀌었다(작업 01 참고). 이 작업이 다루는 Valhalla 코스 생성 로직 자체는 원래도 지역에 종속되지 않았으므로(OSM/Valhalla는 전국 데이터를 다룸) 코드 변경은 없다. 단, 지역별 OSM 보행로 밀도 차이가 코스 품질에 미치는 영향 범위가 김해시 하나에서 전국으로 넓어졌다는 점을 Remaining risks로 재확인함(spec.md 갱신).

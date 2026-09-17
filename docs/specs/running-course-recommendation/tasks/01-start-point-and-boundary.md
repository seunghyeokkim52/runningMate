# 01 — 출발 지점 확보(현재 위치 또는 주소 입력) 및 김해시 범위 확인

## Outcome

앱 진입 시 위치 권한을 요청한다. 허용되고 김해시 내 위치면 그 지점을 출발 지점으로 쓴다. 위치가 김해시 밖이거나 권한이 거부·실패하면, 사용자가 주소를 직접 입력해 출발 지점을 지정할 수 있다. 입력한 주소는 지오코딩해 좌표로 변환하고, 그 좌표가 김해시 내인지 확인한다. 어떤 방식으로 얻었든 확정된 출발 지점은 지도에 표시되고 다음 단계(거리 입력)로 진행할 수 있다. 확정된 지점이 김해시 밖이면 이용 불가 안내를 보여준다.

## Blockers

None. (첫 작업)

## Acceptance criteria

- [x] 앱 진입 시 위치 권한을 요청한다.
- [x] 김해시 내 위치 + 권한 허용: 지도에 현재 위치가 표시되고, 거리 입력 단계로 진행할 수 있다.
- [x] 김해시 밖 위치 또는 권한 거부·실패: 주소 입력 UI가 나타난다.
- [x] 주소 입력 후 지오코딩 결과가 김해시 내: 그 좌표가 출발 지점으로 지도에 표시되고 거리 입력 단계로 진행할 수 있다.
- [x] 주소 입력 후 지오코딩 결과가 김해시 밖이거나 지오코딩 실패: "김해시 내 주소를 입력해 주세요" 안내가 표시되고 거리 입력은 비활성화된다.

## Constraints

- 지도 시각화와 주소 지오코딩은 [course-routing 결정](../../../decisions/course-routing.md)을 따른다: 지도는 Kakao Maps JavaScript SDK, 지오코딩은 같은 SDK의 `services.Geocoder.addressSearch`. 별도 지오코딩 서비스를 추가하지 않는다.
- 일반 UI 구성은 [ui-composition 결정](../../../decisions/ui-composition.md)을 따른다: 지도 자체는 custom UI로 구현할 수 있으나, 주소 입력 폼은 shadcn Field 구성을 사용한다.

## Verification

- geolocation을 김해시 내부 좌표로 mock: 현재 위치가 지도에 표시되고 진행 가능 상태가 된다.
- geolocation을 김해시 외부 좌표로 mock: 주소 입력 UI가 나타난다.
- geolocation 권한 거부/실패로 mock: 주소 입력 UI가 나타난다.
- 주소 입력에 대한 지오코딩 응답을 김해시 내 좌표로 mock: 그 좌표가 출발 지점으로 표시되고 진행 가능 상태가 된다.
- 주소 입력에 대한 지오코딩 응답을 김해시 외부 좌표 또는 실패로 mock: "김해시 내 주소를 입력해 주세요" 안내가 표시되고 거리 입력이 비활성화된다.

## Review checkpoint

None.

## Status

completed

## Execution

- Verification: `bun run test`(18/18 통과, 5개 분기 모두 mock으로 검증) · `bun run typecheck` · `bun run lint` 모두 클린. 실제 Kakao Maps JS SDK(NEXT_PUBLIC_KAKAO_MAP_KEY)로 `http://localhost:3000/run`에서 5개 분기 전부를 실제 브라우저로 재현: (1) 위치 권한 거부/미지원 → 주소 입력 폼, (2) 김해시 내 주소(경상남도 김해시 분성로 227) → 실제 카카오 지도 렌더링 + 거리 입력 활성화(스크린샷 확인), (3) 김해시 밖 주소(서울특별시 중구 세종대로 110) → "김해시 내 주소를 입력해 주세요.", (4) 존재하지 않는 주소 → "주소를 찾을 수 없습니다.", (5) GPS 성공 + 김해시 내 분기는 컴포넌트 테스트로 커버(브라우저 자동화 환경엔 실제 GPS가 없음).
- Blocker: —
- Revision: follow-up 정리 과정에서 두 가지 수정. (1) `handleAddressSubmit`이 `searchAddress`의 SDK 로딩 실패(reject)와 "주소를 찾지 못함"(null)을 더 이상 같은 메시지로 뭉뚱그리지 않고 "지도 서비스를 불러오지 못했습니다" 안내를 분리함 — `address-search-error-messages-conflated` follow-up 해결, 파일 삭제. (2) 거리 Field의 `data-invalid`가 이미 "확정 전" 전체가 아니라 "확정 후 후보 없음"일 때만 참이 되도록 작업 02에서 재구성돼 있어 `distance-field-invalid-before-error` 문제도 해결된 상태임을 확인, 파일 삭제.

`code-review low` 1회 완료, 발견 3건은 수용 기준/주 경로를 깨지 않아 [distance-field-invalid-before-error](../../../follow-ups/distance-field-invalid-before-error.md), [address-search-error-messages-conflated](../../../follow-ups/address-search-error-messages-conflated.md)로 follow-up 기록, 미사용 타입 멤버는 즉시 제거함.

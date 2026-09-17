# 순환 러닝 코스 라우팅

## Decisions

- 순환 러닝 코스(내 위치 기반 출발/복귀 경로) 계산은 OpenStreetMap 데이터 기반의 자체 호스팅 보행자 라우팅 엔진으로 만든다. 카카오모빌리티의 제휴형 보행자 Directions API나 네이버클라우드 Maps Directions(자동차 전용)는 쓰지 않는다.
- 라우팅 엔진은 Valhalla를 사용한다. pedestrian costing의 `use_hills`(경사 회피), `walkway_factor`/`sidewalk_factor`(보도 우선), `alley_factor`(좁은 길 회피) 옵션으로 "뛰기 좋은 길 우선"을 구현한다.
- **인터림**: 지금 이 프로젝트를 개발하는 환경에는 Docker와 충분한 디스크 여유공간이 없어 Valhalla를 실제로 자체 호스팅할 수 없다. 그 대신 FOSSGIS(OpenStreetMap 재단 계열)가 운영하는 공개 Valhalla 데모 서버(`https://valhalla1.openstreetmap.de`)를 `VALHALLA_BASE_URL` 환경변수로 가리켜 개발용으로 쓴다. 코드는 이 값을 그대로 쓰므로, 실제 자체 호스팅 서버가 생기면 이 환경변수만 바꾸면 된다. "자체 호스팅"이라는 결정 자체는 유지되고, 지금 가리키는 서버만 임시다.
- 지도 시각화(배경지도, 마커, 경로 표시)는 Kakao Maps JavaScript SDK를 사용한다. 이 결정은 라우팅 엔진 선택과 독립적이며, 필요하면 지도 SDK만 교체할 수 있다.
- 주소 문자열로 출발 지점을 지정하는 지오코딩은 같은 SDK의 `services.Geocoder.addressSearch`를 사용한다. 별도의 지오코딩 서비스를 추가로 도입하지 않는다.

## Boundaries

- 이 결정은 "코스를 어떻게 계산하고 지도에 그리는가"에만 적용된다. 코스 데이터를 어떤 화면 구조로 보여줄지, 후보 개수, 거리 허용 오차 같은 제품 세부 기준은 `docs/specs/`의 개별 스펙에서 정한다.
- 계정, 완주 기록 저장, 개인화 여부 같은 제품 범위는 이 문서가 아니라 `PRODUCT.md`와 관련 스펙이 정한다.

## Why

카카오모빌리티 보행자 Directions API는 제휴 파트너 전용이라 사전 계약·승인이 필요해 외부 의존과 일정 리스크가 있다. 네이버클라우드 Maps Directions API는 자동차 경로만 제공하고 보행자 경로 자체가 없다. 반면 OpenStreetMap 기반 자체 호스팅 라우팅 엔진(OSRM/GraphHopper/Valhalla)은 승인 없이 즉시 쓸 수 있고, Overpass API로 확인한 결과 김해시 권역에 보행로·공원 관련 way가 약 6,010개 존재해 순환 코스를 계산할 도로망 데이터도 충분하다.

셋 중 Valhalla를 선택한 이유는 pedestrian costing 모델이 `use_hills`(경사도 기반 회피), `walkway_factor`/`sidewalk_factor`(보도 우선), `alley_factor`(좁은 길 회피)를 질의 시점에 조정 가능한 옵션으로 기본 제공하기 때문이다. GraphHopper는 같은 결과를 얻으려면 `custom_model`을 직접 작성해야 하고, OSRM은 이런 가중치를 라우팅 시점이 아니라 추출(extract) 시점의 Lua 프로파일에 고정해야 해서, PRODUCT.md가 요구하는 "뛰기 좋은 길 우선"에 가장 직접적으로 대응하는 쪽은 Valhalla다.

Kakao Maps JavaScript SDK는 API 키 등록만으로 즉시 쓸 수 있는 무료 공개 SDK이고 한국 지도 서비스로 널리 검증되어 있어, 화면에 지도를 보여주는 용도로는 승인 리스크 없이 바로 채택할 수 있다.

## Reconsider when

- 카카오모빌리티 보행자 Directions API 제휴가 실제로 승인되어, 더 정밀한 국내 보도 데이터가 필요해질 때.
- Valhalla 자체 호스팅의 서버 운영 부담(비용, 유지보수)이 지속적으로 감당하기 어려운 수준일 때.
- 실제 자체 호스팅 Valhalla 서버를 준비할 수 있게 되었을 때 — `VALHALLA_BASE_URL`을 그 서버로 바꾸고 공개 데모 서버 사용을 중단한다. 공개 데모는 트래픽 제한이 있는 개발/테스트용이라 실사용 트래픽을 감당하도록 만들어지지 않았다.
- 김해시 외 지역으로 서비스 범위가 확장되어 해당 지역의 OpenStreetMap 보행로 데이터 밀도가 충분하지 않을 때.

## Still-rejected alternatives

- 카카오모빌리티 보행자 Directions API — 제휴 계약 없이는 사용할 수 없어 외부 승인 의존성이 생김; 제휴가 승인되면 재검토.
- 네이버클라우드 Maps Directions API — 보행자 경로 자체를 제공하지 않음; 네이버가 보행자 경로를 추가하면 재검토.
- 김해시 공공데이터(둘레길/산책로) 카탈로그로 대체 — 코스가 고정된 출발/도착점을 가진 정해진 목록이라, PRODUCT.md에 확정된 "내 현재 위치에서 출발·복귀"라는 핵심 루프와 맞지 않음.
- GraphHopper — pedestrian costing 커스터마이징을 `custom_model` 작성으로 직접 구현해야 해 초기 구현 비용이 더 큼; Valhalla의 기본 제공 옵션만으로 부족해지면 재검토.
- OSRM — 경로 가중치가 추출 시점 Lua 프로파일에 고정되어 질의 시점에 "보도 우선/경사 회피" 정도를 조정하기 어려움; 매우 높은 처리 성능이 최우선 요구가 되면 재검토.

## Evidence worth preserving

- Overpass API로 김해시 권역 bbox(35.09,128.75,35.34,128.96)에서 `highway=footway|path|pedestrian|track|steps` 및 `leisure=park` way를 집계한 결과 6,010개(2026-09-17 기준, OSM 데이터는 계속 변경됨).

# 초대형 지도 컨테이너에서 CustomOverlay가 두 번씩 렌더링됨

**Symptom**: [components/kakao-map.tsx](../../components/kakao-map.tsx)의 지도 컨테이너를 `width:2000px;height:1600px`로 키운 뒤, 거리 표기(`1km`/`2km`/`3km`)와 방향 화살표를 위해 만든 `kakao.maps.CustomOverlay`들이 DOM에 정확히 같은 위치·내용으로 두 벌씩 나타난다.

**Observed evidence**: 2026-09-17, `http://localhost:3000/run`에서 실제 김해시 주소로 코스를 검색하고 후보를 선택한 뒤 `document.querySelectorAll`로 확인 — "1km"/"2km"/"3km" 텍스트를 가진 div가 각각 2개씩, 화살표 스타일(`border-bottom` 있는 div)이 예상 개수(경로 100m 간격 샘플 수)만큼만 나오는지는 확인했으나 라벨은 중복 확인됨. React 쪽 effect는 `console.log` 계측으로 정확히 한 번만 overlay 생성 코드를 실행하는 것을 확인해서, React의 effect 중복 실행이나 내가 작성한 정리(cleanup) 로직의 문제가 아님을 배제했다.

**Suspected cause**: Kakao Maps SDK가 이례적으로 큰 컨테이너(2000x1600)에서 내부적으로 지도를 여러 타일/레이어 조각으로 나눠 렌더링하면서, `CustomOverlay`의 DOM 콘텐츠를 각 조각에 한 번씩 복제해 넣는 것으로 추정된다(추정, 미확인).

**What was tried**: 실제 화면에 보이는 시각적 결과(라벨 위치·텍스트)는 올바르고 기능적으로 깨지는 건 없어서, 이번 세션에서는 원인을 더 파고들지 않고 넘어갔다.

**Proposed next step**: 지도 컨테이너를 더 통상적인 크기(예: 뷰포트에 맞는 반응형 크기)로 되돌렸을 때도 중복이 재현되는지 먼저 확인한다. 재현되면 Kakao Maps 공식 문서/데브톡에서 대형 컨테이너나 CustomOverlay 중복 렌더링 관련 이슈를 찾아본다. 재현되지 않으면 컨테이너 크기와의 인과관계가 확정되는 것이므로, 필요시 컨테이너 크기를 CSS 최대 크기 + 스크롤 방식으로 바꾸는 것을 검토한다.

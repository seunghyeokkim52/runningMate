"use client";

import { useEffect, useRef } from "react";

import type { Coordinates } from "@/lib/geolocation";
import { sampleAlongPath } from "@/lib/geo/polyline-metrics";
import { loadKakaoMapsSdk } from "@/lib/kakao/load-sdk";

export type MapCourseCandidate = {
  id: string;
  path: Coordinates[];
};

const SELECTED_COLOR = "#16a34a";
const UNSELECTED_COLOR = "#9ca3af";
const ARROW_COLOR = "#dc2626";
const DIRECTION_ARROW_INTERVAL_M = 100;
const DISTANCE_LABEL_INTERVAL_M = 1000;

function createArrowOverlay(
  position: KakaoLatLng,
  bearingDeg: number
): KakaoCustomOverlay {
  const arrow = document.createElement("div");
  arrow.style.width = "0";
  arrow.style.height = "0";
  arrow.style.borderLeft = "4px solid transparent";
  arrow.style.borderRight = "4px solid transparent";
  arrow.style.borderBottom = `8px solid ${ARROW_COLOR}`;
  arrow.style.transform = `rotate(${bearingDeg}deg)`;
  arrow.style.transformOrigin = "center";

  return new window.kakao.maps.CustomOverlay({
    position,
    content: arrow,
    xAnchor: 0.5,
    yAnchor: 0.5,
  });
}

function createDistanceLabelOverlay(
  position: KakaoLatLng,
  distanceM: number
): KakaoCustomOverlay {
  const label = document.createElement("div");
  label.textContent = `${(distanceM / 1000).toFixed(0)}km`;
  label.style.padding = "2px 6px";
  label.style.borderRadius = "9999px";
  label.style.fontSize = "11px";
  label.style.fontWeight = "600";
  label.style.color = "#ffffff";
  label.style.backgroundColor = SELECTED_COLOR;
  label.style.whiteSpace = "nowrap";

  return new window.kakao.maps.CustomOverlay({
    position,
    content: label,
    xAnchor: 0.5,
    yAnchor: 1.4,
  });
}

export function KakaoMap({
  center,
  candidates = [],
  selectedCandidateId = null,
}: {
  center: Coordinates;
  candidates?: MapCourseCandidate[];
  selectedCandidateId?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markerRef = useRef<KakaoMarker | null>(null);
  const polylinesRef = useRef<{ id: string; polyline: KakaoPolyline }[]>([]);
  const overlaysRef = useRef<KakaoCustomOverlay[]>([]);

  useEffect(() => {
    let cancelled = false;

    loadKakaoMapsSdk().then(() => {
      if (cancelled || !containerRef.current) return;

      const position = new window.kakao.maps.LatLng(center.lat, center.lng);
      const map = new window.kakao.maps.Map(containerRef.current, {
        center: position,
        level: 4,
      });
      mapRef.current = map;
      markerRef.current = new window.kakao.maps.Marker({ position, map });
    });

    return () => {
      cancelled = true;
    };
    // 지도는 최초 한 번만 만든다. 이후 center 변경은 아래 effect가 반영한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    const position = new window.kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.setCenter(position);
    markerRef.current.setPosition(position);
  }, [center]);

  useEffect(() => {
    let cancelled = false;

    loadKakaoMapsSdk().then(() => {
      if (cancelled || !mapRef.current) return;
      const map = mapRef.current;

      if (candidates.length === 0) return;

      const bounds = new window.kakao.maps.LatLngBounds();

      for (const candidate of candidates) {
        const isSelected = candidate.id === selectedCandidateId;
        const path = candidate.path.map(
          (point) => new window.kakao.maps.LatLng(point.lat, point.lng)
        );
        path.forEach((point) => bounds.extend(point));

        const polyline = new window.kakao.maps.Polyline({
          path,
          strokeWeight: isSelected ? 6 : 3,
          strokeColor: isSelected ? SELECTED_COLOR : UNSELECTED_COLOR,
          strokeOpacity: isSelected ? 0.9 : 0.5,
          strokeStyle: "solid",
        });
        polyline.setMap(map);
        polylinesRef.current.push({ id: candidate.id, polyline });

        // 진행 방향 화살표와 거리 표기는 선택된 코스에만 표시해 지도가 복잡해지지 않게 한다.
        if (isSelected) {
          for (const sample of sampleAlongPath(
            candidate.path,
            DIRECTION_ARROW_INTERVAL_M
          )) {
            const position = new window.kakao.maps.LatLng(
              sample.position.lat,
              sample.position.lng
            );
            const overlay = createArrowOverlay(position, sample.bearingDeg);
            overlay.setMap(map);
            overlaysRef.current.push(overlay);
          }

          for (const sample of sampleAlongPath(
            candidate.path,
            DISTANCE_LABEL_INTERVAL_M
          )) {
            const position = new window.kakao.maps.LatLng(
              sample.position.lat,
              sample.position.lng
            );
            const overlay = createDistanceLabelOverlay(
              position,
              sample.distanceM
            );
            overlay.setMap(map);
            overlaysRef.current.push(overlay);
          }
        }
      }

      map.setBounds(bounds);
    });

    return () => {
      cancelled = true;
      polylinesRef.current.forEach(({ polyline }) => polyline.setMap(null));
      polylinesRef.current = [];
      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      overlaysRef.current = [];
    };
  }, [candidates, selectedCandidateId]);

  return (
    <div
      ref={containerRef}
      data-testid="kakao-map"
      className="h-72 w-full overflow-hidden rounded-lg border"
    />
  );
}

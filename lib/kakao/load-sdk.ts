let sdkPromise: Promise<void> | null = null;

/** Kakao Maps JavaScript SDK를 한 번만 로드하는 싱글턴 로더. */
export function loadKakaoMapsSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("KAKAO_SDK_SSR_UNSUPPORTED"));
  }

  if (window.kakao?.maps?.services) {
    return Promise.resolve();
  }

  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("KAKAO_SDK_LOAD_FAILED"));
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}

// 화면마다 제각각이던 8~36px 글자 크기를 6단계로 묶는다.
// 캔버스가 1024 논리폭이라 브라우저 창이 1024px 이하로 줄면 스케일이 1.0 미만이 된다.
// 그래서 caption(12px)을 절대 하한으로 두고, 공간이 모자라면 글자가 아니라 정보를 줄인다.
export const TEXT = {
  display: 32,
  title: 24,
  heading: 20,
  body: 16,
  label: 14,
  caption: 12,
} as const;

export const MIN_TEXT_SIZE = TEXT.caption;

// 흐린 텍스트도 본문 대비를 유지하도록 알파 하한을 둔다.
export const MUTED_ALPHA = 0.85;

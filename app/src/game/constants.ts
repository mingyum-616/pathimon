export const APP_WIDTH = 1024;
export const APP_HEIGHT = 576;

// 앱에 포함한 Pretendard를 1순위로, OS 폰트(맑은 고딕 등)를 폴백으로 둔다.
// 맑은 고딕은 윈도우 전용이라 폴백만 두면 타 OS에서 한글이 sans-serif로 떨어진다.
export const FONT_FAMILY = '"Pretendard Variable", Pretendard, "Malgun Gothic", Arial, sans-serif';

// Phaser Text를 디바이스 픽셀비율(최대 2)로 supersample해 글자 가장자리를 다듬는다.
const DEVICE_PIXEL_RATIO = typeof globalThis !== 'undefined' && (globalThis as { devicePixelRatio?: number }).devicePixelRatio
  ? (globalThis as { devicePixelRatio?: number }).devicePixelRatio!
  : 1;
export const TEXT_RESOLUTION = Math.min(2, Math.max(1, DEVICE_PIXEL_RATIO));

// 테두리는 역할별로 나눈다. 예전에는 패널·버튼·경고가 모두 line(빨강)을 써서
// 위계가 사라졌고, 빨강이 "오류"로 읽혀 평범한 정보 패널까지 경고처럼 보였다.
export const COLORS = {
  ink: 0x272033,
  panel: 0x332b42,
  panelDark: 0x211b2d,
  line: 0xd64541,
  border: 0x5b5170,
  borderStrong: 0x8a7fa6,
  focus: 0x72d6ff,
  selected: 0x42d66b,
  grass: 0x62a15d,
  grassDark: 0x3f7a43,
  hp: 0x42d66b,
  hpBack: 0xd8d9e0,
  text: '#f4f0ff',
  muted: '#d6d0e2',
  danger: '#ff6961',
  accent: '#72d6ff',
  chipStrong: 0xc4463f,
  chipMedium: 0xc47a2c,
  chipNeutral: 0x4d4760,
} as const;

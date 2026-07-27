import { describe, expect, it } from 'vitest';
import globalControlsSource from './globalControls.ts?raw';
import { globalControlLabels, globalControlPosition } from './globalControls';

describe('global controls', () => {
  it('provides mute, battle-guide, and save controls with accessible labels', () => {
    expect(globalControlLabels()).toEqual({
      guide: '전투 안내 열기',
      mute: '음소거',
      save: '저장 및 불러오기',
      touchHide: '터치 조작 숨기기',
      touchShow: '터치 조작 표시',
      unmute: '소리 켜기',
    });
  });

  it('adds a touch-only toggle to the global control rail', () => {
    expect(globalControlsSource).toContain('toggleTouchControlsEnabled');
    expect(globalControlsSource).toContain('isTouchCapable');
    expect(globalControlsSource).toContain('touchButton');
  });

  it('places the control rail outside the canvas when the right gutter is wide enough', () => {
    expect(globalControlPosition({
      bottom: 576,
      height: 576,
      left: 180,
      right: 1204,
      top: 0,
      width: 1024,
      x: 180,
      y: 0,
      toJSON: () => ({}),
    }, 1400)).toMatchObject({
      insideCanvas: false,
      left: 1216,
      top: 70,
    });
  });

  it('keeps the rail inside the canvas when no right gutter is available', () => {
    expect(globalControlPosition({
      bottom: 390,
      height: 390,
      left: 0,
      right: 844,
      top: 0,
      width: 844,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }, 844)).toMatchObject({
      insideCanvas: true,
      left: 794,
    });
  });
});

import { describe, expect, it } from 'vitest';
import globalControlsSource from './globalControls.ts?raw';
import {
  globalControlLabels,
  globalControlPosition,
  mobileControlAnchors,
  mobileVirtualKeyMap,
} from './globalControls';

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

  it('anchors mobile controls to viewport safe areas instead of the game canvas', () => {
    expect(mobileControlAnchors()).toEqual({
      actions: {
        bottom: 'calc(env(safe-area-inset-bottom) + 14px)',
        right: 'calc(env(safe-area-inset-right) + 14px)',
      },
      dpad: {
        bottom: 'calc(env(safe-area-inset-bottom) + 14px)',
        left: 'calc(env(safe-area-inset-left) + 14px)',
      },
      rail: {
        right: 'calc(env(safe-area-inset-right) + 8px)',
        top: 'calc(env(safe-area-inset-top) + 8px)',
      },
    });
    expect(globalControlsSource).toContain('createMobileGamepad');
    expect(globalControlsSource).toContain("game.scene.isActive('BattleScene')");
  });

  it('maps the mobile pad to the same keyboard commands as physical controls', () => {
    expect(mobileVirtualKeyMap()).toEqual({
      a: { code: 'Enter', key: 'Enter', keyCode: 13 },
      b: { code: 'Escape', key: 'Escape', keyCode: 27 },
      down: { code: 'ArrowDown', key: 'ArrowDown', keyCode: 40 },
      left: { code: 'ArrowLeft', key: 'ArrowLeft', keyCode: 37 },
      right: { code: 'ArrowRight', key: 'ArrowRight', keyCode: 39 },
      up: { code: 'ArrowUp', key: 'ArrowUp', keyCode: 38 },
    });
  });

  it('keeps the mobile pad visually quiet while preserving its large hit areas', () => {
    expect(globalControlsSource).toContain('dataset.pathimonDpadBar');
    expect(globalControlsSource).toContain("background: 'rgba(141, 129, 152, 0.18)'");
    expect(globalControlsSource).toContain("border: '2px solid rgba(216, 205, 230, 0.2)'");
    expect(globalControlsSource).not.toContain("background: 'rgba(77, 71, 96, 0.54)'");
    expect(globalControlsSource).not.toContain("border: '2px solid rgba(216, 205, 230, 0.58)'");
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

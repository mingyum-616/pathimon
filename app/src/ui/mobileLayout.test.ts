import type Phaser from 'phaser';
import { describe, expect, it, vi } from 'vitest';
import { isTouchCapable, mountMobileLayout, shouldShowRotateOverlay } from './mobileLayout';

describe('mobile layout', () => {
  it.each([
    [{ hasTouch: true, coarsePointer: false, maxTouchPoints: 0 }, true],
    [{ hasTouch: false, coarsePointer: true, maxTouchPoints: 0 }, true],
    [{ hasTouch: false, coarsePointer: false, maxTouchPoints: 5 }, true],
    [{ hasTouch: false, coarsePointer: false, maxTouchPoints: 0 }, false],
  ])('detects touch capability from any supported signal', (signals, expected) => {
    expect(isTouchCapable(signals)).toBe(expected);
  });

  it('shows rotation guidance only for portrait touch devices', () => {
    const touch = { hasTouch: false, coarsePointer: false, maxTouchPoints: 5 };
    expect(shouldShowRotateOverlay(touch, 390, 844)).toBe(true);
    expect(shouldShowRotateOverlay(touch, 844, 390)).toBe(false);
  });

  it('blocks portrait touch input even when orientation locking is unavailable', () => {
    const originalMatchMedia = window.matchMedia;
    const width = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    const height = Object.getOwnPropertyDescriptor(window, 'innerHeight');
    const touchPoints = Object.getOwnPropertyDescriptor(navigator, 'maxTouchPoints');
    const orientation = Object.getOwnPropertyDescriptor(screen, 'orientation');
    const canvas = document.createElement('canvas');

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({ matches: false })),
    });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 1 });
    Object.defineProperty(screen, 'orientation', { configurable: true, value: undefined });

    const cleanup = mountMobileLayout({ canvas } as Phaser.Game);
    const overlay = document.querySelector('[role="status"]') as HTMLElement;

    expect(overlay.textContent).toBe('기기를 가로로 돌려주세요');
    expect(overlay.style.display).toBe('flex');
    expect(canvas.style.pointerEvents).toBe('none');

    cleanup();
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: originalMatchMedia });
    Object.defineProperty(window, 'innerWidth', width!);
    Object.defineProperty(window, 'innerHeight', height!);
    if (touchPoints) {
      Object.defineProperty(navigator, 'maxTouchPoints', touchPoints);
    } else {
      Reflect.deleteProperty(navigator, 'maxTouchPoints');
    }
    if (orientation) {
      Object.defineProperty(screen, 'orientation', orientation);
    } else {
      Reflect.deleteProperty(screen, 'orientation');
    }

    expect(document.querySelector('[role="status"]')).toBeNull();
    expect(canvas.style.pointerEvents).toBe('');
  });
});

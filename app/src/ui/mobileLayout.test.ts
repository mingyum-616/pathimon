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

  it('fills a landscape touch viewport and refreshes Phaser pointer scaling', () => {
    const originalMatchMedia = window.matchMedia;
    const width = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    const height = Object.getOwnPropertyDescriptor(window, 'innerHeight');
    const touchPoints = Object.getOwnPropertyDescriptor(navigator, 'maxTouchPoints');
    const canvas = document.createElement('canvas');
    const refresh = vi.fn();

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({ matches: true })),
    });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 932 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 430 });
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 5 });

    const cleanup = mountMobileLayout({ canvas, scale: { refresh } } as unknown as Phaser.Game);

    expect(document.body.classList.contains('pathimon-touch-landscape')).toBe(true);
    expect(refresh).toHaveBeenCalled();

    cleanup();
    expect(document.body.classList.contains('pathimon-touch-landscape')).toBe(false);

    Object.defineProperty(window, 'matchMedia', { configurable: true, value: originalMatchMedia });
    Object.defineProperty(window, 'innerWidth', width!);
    Object.defineProperty(window, 'innerHeight', height!);
    if (touchPoints) {
      Object.defineProperty(navigator, 'maxTouchPoints', touchPoints);
    } else {
      Reflect.deleteProperty(navigator, 'maxTouchPoints');
    }
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

  it('blocks hardware keyboard controls while portrait guidance is visible', () => {
    const originalMatchMedia = window.matchMedia;
    const width = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    const height = Object.getOwnPropertyDescriptor(window, 'innerHeight');
    const touchPoints = Object.getOwnPropertyDescriptor(navigator, 'maxTouchPoints');
    const orientation = Object.getOwnPropertyDescriptor(screen, 'orientation');
    const canvas = document.createElement('canvas');
    const gameKeyHandler = vi.fn();

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({ matches: false })),
    });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 1 });
    Object.defineProperty(screen, 'orientation', { configurable: true, value: undefined });
    window.addEventListener('keydown', gameKeyHandler);

    const cleanup = mountMobileLayout({ canvas } as Phaser.Game);
    const blockedEvent = new KeyboardEvent('keydown', {
      cancelable: true,
      key: 'Enter',
    });
    window.dispatchEvent(blockedEvent);

    expect(blockedEvent.defaultPrevented).toBe(true);
    expect(gameKeyHandler).not.toHaveBeenCalled();

    cleanup();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(gameKeyHandler).toHaveBeenCalledTimes(1);

    window.removeEventListener('keydown', gameKeyHandler);
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
  });
});

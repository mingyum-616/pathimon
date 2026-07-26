import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountEndingFeedbackTextarea } from './endingFeedbackOverlay';

function canvasWithRect(getRect: () => DOMRect): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'getBoundingClientRect', {
    configurable: true,
    value: getRect,
  });
  document.body.appendChild(canvas);
  return canvas;
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('ending feedback textarea overlay', () => {
  it('mounts a textarea, forwards input, and exposes focus and value controls', () => {
    const canvas = canvasWithRect(() => new DOMRect(100, 50, 800, 450));
    const onInput = vi.fn();
    const handle = mountEndingFeedbackTextarea({
      canvas,
      value: '첫 문장',
      onInput,
    });
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea');

    expect(textarea).not.toBeNull();
    expect(textarea?.value).toBe('첫 문장');
    expect(textarea?.maxLength).toBe(1200);
    expect(textarea?.placeholder).toBe('패시몬에서 느낀 점을 자유롭게 적어주세요.');
    expect(textarea?.style.position).toBe('fixed');
    expect(textarea?.style.zIndex).toBe('10020');

    textarea!.value = '다음 문장';
    textarea!.dispatchEvent(new Event('input'));
    expect(onInput).toHaveBeenCalledWith('다음 문장');

    handle.setValue('수정한 문장');
    expect(textarea?.value).toBe('수정한 문장');
    handle.focus();
    expect(document.activeElement).toBe(textarea);
  });

  it('tracks canvas resizing and removes every resize listener on destroy', () => {
    let rect = new DOMRect(100, 50, 800, 450);
    const canvas = canvasWithRect(() => rect);
    const visualViewport = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as VisualViewport;
    const originalVisualViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: visualViewport,
    });
    const removeListener = vi.spyOn(window, 'removeEventListener');

    try {
      const handle = mountEndingFeedbackTextarea({ canvas, value: '', onInput: vi.fn() });
      const textarea = document.querySelector<HTMLTextAreaElement>('textarea');

      expect(textarea?.style.left).toBe('200px');
      expect(textarea?.style.top).toBe('225px');
      expect(textarea?.style.width).toBe('600px');
      expect(textarea?.style.height).toBe('100px');
      expect(visualViewport.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

      rect = new DOMRect(0, 0, 1024, 576);
      window.dispatchEvent(new Event('resize'));
      expect(textarea?.style.left).toBe('128px');
      expect(textarea?.style.top).toBe('224px');
      expect(textarea?.style.width).toBe('768px');
      expect(textarea?.style.height).toBe('128px');

      handle.destroy();
      handle.destroy();

      expect(document.querySelector('textarea')).toBeNull();
      expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(removeListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
      expect(visualViewport.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    } finally {
      if (originalVisualViewport) {
        Object.defineProperty(window, 'visualViewport', originalVisualViewport);
      } else {
        Reflect.deleteProperty(window, 'visualViewport');
      }
    }
  });

  it('disables and re-enables editing while a feedback submission is in flight', () => {
    const canvas = canvasWithRect(() => new DOMRect(0, 0, 1024, 576));
    const handle = mountEndingFeedbackTextarea({ canvas, value: '', onInput: vi.fn() });
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea');

    handle.setDisabled(true);
    expect(textarea?.disabled).toBe(true);

    handle.setDisabled(false);
    expect(textarea?.disabled).toBe(false);
  });
});

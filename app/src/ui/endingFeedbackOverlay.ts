const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
const TEXTAREA_X = 128;
const TEXTAREA_Y = 224;
const TEXTAREA_WIDTH = 768;
const TEXTAREA_HEIGHT = 128;
const VIEWPORT_MARGIN = 8;

export interface EndingFeedbackTextareaHandle {
  focus(): void;
  setValue(value: string): void;
  setDisabled(disabled: boolean): void;
  destroy(): void;
}

export function mountEndingFeedbackTextarea(options: {
  canvas: HTMLCanvasElement;
  value: string;
  onInput(value: string): void;
}): EndingFeedbackTextareaHandle {
  const textarea = document.createElement('textarea');
  textarea.value = options.value;
  textarea.maxLength = 1200;
  textarea.placeholder = '패시몬에서 느낀 점을 자유롭게 적어주세요.';
  textarea.setAttribute('aria-label', '패시몬 엔딩 피드백');
  textarea.dataset.endingFeedbackTextarea = 'true';
  Object.assign(textarea.style, {
    background: '#201c2be6',
    border: '2px solid #7f93b7',
    borderRadius: '4px',
    boxShadow: 'none',
    boxSizing: 'border-box',
    color: '#ffffff',
    fontFamily: 'Pretendard Variable, Pretendard, sans-serif',
    lineHeight: '1.45',
    outline: 'none',
    padding: '12px 14px',
    position: 'fixed',
    resize: 'none',
    zIndex: '10020',
  });

  const syncLayout = (): void => {
    const rect = options.canvas.getBoundingClientRect();
    const scaleX = rect.width / CANVAS_WIDTH;
    const scaleY = rect.height / CANVAS_HEIGHT;
    const desiredLeft = rect.left + TEXTAREA_X * scaleX;
    const desiredTop = rect.top + TEXTAREA_Y * scaleY;
    const desiredWidth = TEXTAREA_WIDTH * scaleX;
    const desiredHeight = TEXTAREA_HEIGHT * scaleY;
    const viewport = window.visualViewport;
    const hasViewportGeometry = viewport
      && Number.isFinite(viewport.width)
      && Number.isFinite(viewport.height)
      && Number.isFinite(viewport.offsetLeft)
      && Number.isFinite(viewport.offsetTop);

    let left = desiredLeft;
    let top = desiredTop;
    let width = desiredWidth;
    let height = desiredHeight;
    if (hasViewportGeometry) {
      const viewportLeft = viewport.offsetLeft;
      const viewportTop = viewport.offsetTop;
      const maxWidth = Math.max(0, viewport.width - VIEWPORT_MARGIN * 2);
      const maxHeight = Math.max(0, viewport.height - VIEWPORT_MARGIN * 2);
      width = Math.min(desiredWidth, maxWidth);
      height = Math.min(desiredHeight, maxHeight);
      left = clamp(
        desiredLeft,
        viewportLeft + VIEWPORT_MARGIN,
        viewportLeft + viewport.width - VIEWPORT_MARGIN - width,
      );
      top = clamp(
        desiredTop,
        viewportTop + VIEWPORT_MARGIN,
        viewportTop + viewport.height - VIEWPORT_MARGIN - height,
      );
    }

    textarea.style.left = `${left}px`;
    textarea.style.top = `${top}px`;
    textarea.style.width = `${width}px`;
    textarea.style.height = `${height}px`;
    textarea.style.fontSize = `${Math.max(12, 16 * Math.min(scaleX, scaleY))}px`;
  };
  const handleInput = (): void => options.onInput(textarea.value);
  const handleFocus = (): void => {
    textarea.style.borderColor = '#72d6ff';
    textarea.style.boxShadow = '0 0 0 2px #72d6ff66';
  };
  const handleBlur = (): void => {
    textarea.style.borderColor = '#7f93b7';
    textarea.style.boxShadow = 'none';
  };
  const visualViewport = window.visualViewport;
  let destroyed = false;

  textarea.addEventListener('input', handleInput);
  textarea.addEventListener('focus', handleFocus);
  textarea.addEventListener('blur', handleBlur);
  document.body.appendChild(textarea);
  syncLayout();
  window.addEventListener('resize', syncLayout);
  window.addEventListener('orientationchange', syncLayout);
  visualViewport?.addEventListener('resize', syncLayout);
  visualViewport?.addEventListener('scroll', syncLayout);

  return {
    focus(): void {
      textarea.focus();
    },
    setValue(value: string): void {
      textarea.value = value;
    },
    setDisabled(disabled: boolean): void {
      textarea.disabled = disabled;
      textarea.setAttribute('aria-disabled', String(disabled));
      textarea.style.cursor = disabled ? 'wait' : 'text';
      textarea.style.opacity = disabled ? '0.72' : '1';
    },
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('focus', handleFocus);
      textarea.removeEventListener('blur', handleBlur);
      window.removeEventListener('resize', syncLayout);
      window.removeEventListener('orientationchange', syncLayout);
      visualViewport?.removeEventListener('resize', syncLayout);
      visualViewport?.removeEventListener('scroll', syncLayout);
      textarea.remove();
    },
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

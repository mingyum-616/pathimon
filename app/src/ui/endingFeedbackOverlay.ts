const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
const TEXTAREA_X = 128;
const TEXTAREA_Y = 224;
const TEXTAREA_WIDTH = 768;
const TEXTAREA_HEIGHT = 128;

export interface EndingFeedbackTextareaHandle {
  focus(): void;
  setValue(value: string): void;
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
    textarea.style.left = `${rect.left + TEXTAREA_X * scaleX}px`;
    textarea.style.top = `${rect.top + TEXTAREA_Y * scaleY}px`;
    textarea.style.width = `${TEXTAREA_WIDTH * scaleX}px`;
    textarea.style.height = `${TEXTAREA_HEIGHT * scaleY}px`;
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

  return {
    focus(): void {
      textarea.focus();
    },
    setValue(value: string): void {
      textarea.value = value;
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
      textarea.remove();
    },
  };
}

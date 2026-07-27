import type Phaser from 'phaser';

export interface TouchCapabilitySignals {
  hasTouch: boolean;
  coarsePointer: boolean;
  maxTouchPoints: number;
}

type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: 'landscape') => Promise<void>;
};

export function isTouchCapable(signals: TouchCapabilitySignals): boolean {
  return signals.hasTouch || signals.coarsePointer || signals.maxTouchPoints > 0;
}

export function shouldShowRotateOverlay(
  signals: TouchCapabilitySignals,
  width: number,
  height: number,
): boolean {
  return isTouchCapable(signals) && height > width;
}

function touchCapabilitySignals(): TouchCapabilitySignals {
  return {
    hasTouch: 'ontouchstart' in window,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
  };
}

export function mountMobileLayout(game: Phaser.Game): () => void {
  if (typeof document === 'undefined') return () => undefined;

  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'status');
  overlay.textContent = '기기를 가로로 돌려주세요';
  Object.assign(overlay.style, {
    alignItems: 'center',
    background: '#182131',
    color: '#fff',
    display: 'none',
    fontSize: '20px',
    inset: '0',
    justifyContent: 'center',
    position: 'fixed',
    zIndex: '10030',
  });
  document.body.appendChild(overlay);

  const canvas = game.canvas;
  const initialPointerEvents = canvas.style.pointerEvents;
  const initialTouchAction = canvas.style.touchAction || '';
  let blockKeyboardInput = false;
  const handleKeyDown = (event: KeyboardEvent): void => {
    if (!blockKeyboardInput) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const syncLayout = (): void => {
    const signals = touchCapabilitySignals();
    const showOverlay = shouldShowRotateOverlay(
      signals,
      window.innerWidth,
      window.innerHeight,
    );
    blockKeyboardInput = showOverlay;
    overlay.style.display = showOverlay ? 'flex' : 'none';
    overlay.style.pointerEvents = showOverlay ? 'auto' : 'none';
    canvas.style.pointerEvents = showOverlay ? 'none' : initialPointerEvents;
    canvas.style.touchAction = isTouchCapable(signals) && !showOverlay ? 'none' : initialTouchAction;
  };

  syncLayout();
  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('resize', syncLayout);
  window.addEventListener('orientationchange', syncLayout);

  const orientation = screen.orientation as LockableScreenOrientation | undefined;
  if (isTouchCapable(touchCapabilitySignals()) && orientation?.lock) {
    void orientation.lock('landscape').catch(() => undefined);
  }

  return () => {
    blockKeyboardInput = false;
    window.removeEventListener('keydown', handleKeyDown, true);
    window.removeEventListener('resize', syncLayout);
    window.removeEventListener('orientationchange', syncLayout);
    canvas.style.pointerEvents = initialPointerEvents;
    canvas.style.touchAction = initialTouchAction;
    overlay.remove();
  };
}

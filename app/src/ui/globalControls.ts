import type Phaser from 'phaser';
import { getAudioMuted, onAudioMutedChange, toggleAudioMuted } from '../audio/audioSettings';
import { FONT_FAMILY } from '../game/constants';
import { openRunSaveDialog } from '../save/runSaveUi';
import { gameGuideContent } from './gameGuideUi';
import { isTouchCapable } from './mobileLayout';
import {
  getTouchControlsEnabled,
  onTouchControlsEnabledChange,
  toggleTouchControlsEnabled,
} from './touchControls';

const CONTROL_RAIL_WIDTH = 50;
const OUTSIDE_GUTTER_REQUIRED = 62;

export interface GlobalControlPosition {
  insideCanvas: boolean;
  left: number;
  top: number;
}

export interface MobileControlAnchors {
  actions: { bottom: string; right: string };
  dpad: { bottom: string; left: string };
  rail: { right: string; top: string };
}

interface MobileVirtualKey {
  code: string;
  key: string;
  keyCode: number;
}

type MobileVirtualKeyId = 'a' | 'b' | 'down' | 'left' | 'right' | 'up';

export function mobileControlAnchors(): MobileControlAnchors {
  return {
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
  };
}

export function mobileVirtualKeyMap(): Record<MobileVirtualKeyId, MobileVirtualKey> {
  return {
    a: { code: 'Enter', key: 'Enter', keyCode: 13 },
    b: { code: 'Escape', key: 'Escape', keyCode: 27 },
    down: { code: 'ArrowDown', key: 'ArrowDown', keyCode: 40 },
    left: { code: 'ArrowLeft', key: 'ArrowLeft', keyCode: 37 },
    right: { code: 'ArrowRight', key: 'ArrowRight', keyCode: 39 },
    up: { code: 'ArrowUp', key: 'ArrowUp', keyCode: 38 },
  };
}

export function globalControlLabels(): {
  guide: string;
  mute: string;
  save: string;
  touchHide: string;
  touchShow: string;
  unmute: string;
} {
  return {
    guide: '전투 안내 열기',
    mute: '음소거',
    save: '저장 및 불러오기',
    touchHide: '터치 조작 숨기기',
    touchShow: '터치 조작 표시',
    unmute: '소리 켜기',
  };
}

export function globalControlPosition(
  canvasRect: DOMRect,
  viewportWidth: number,
): GlobalControlPosition {
  const rightGutter = viewportWidth - canvasRect.right;
  const insideCanvas = rightGutter < OUTSIDE_GUTTER_REQUIRED;
  return {
    insideCanvas,
    left: insideCanvas ? canvasRect.right - CONTROL_RAIL_WIDTH : canvasRect.right + 12,
    top: canvasRect.top + 70,
  };
}

function createButton(label: string, text: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.ariaLabel = label;
  button.title = label;
  button.textContent = text;
  Object.assign(button.style, {
    alignItems: 'center',
    background: 'rgba(32, 32, 44, 0.9)',
    border: '2px solid rgba(114, 214, 255, 0.9)',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    fontFamily: FONT_FAMILY,
    fontSize: '19px',
    height: '40px',
    justifyContent: 'center',
    padding: '0',
    width: '40px',
  });
  return button;
}

function dispatchVirtualKey(key: MobileVirtualKey): void {
  (['keydown', 'keyup'] as const).forEach((type) => {
    const event = new KeyboardEvent(type, {
      bubbles: true,
      cancelable: true,
      code: key.code,
      key: key.key,
    });
    Object.defineProperties(event, {
      keyCode: { configurable: true, get: () => key.keyCode },
      which: { configurable: true, get: () => key.keyCode },
    });
    window.dispatchEvent(event);
  });
}

function createVirtualKeyButton(
  label: string,
  text: string,
  key: MobileVirtualKey,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.ariaLabel = label;
  button.textContent = text;
  Object.assign(button.style, {
    alignItems: 'center',
    background: 'transparent',
    border: '0',
    color: 'rgba(206, 107, 94, 0.58)',
    display: 'flex',
    fontFamily: FONT_FAMILY,
    fontSize: '28px',
    justifyContent: 'center',
    padding: '0',
    pointerEvents: 'auto',
    touchAction: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  });
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    dispatchVirtualKey(key);
  });
  return button;
}

function createMobileGamepad(): HTMLDivElement {
  const anchors = mobileControlAnchors();
  const keys = mobileVirtualKeyMap();
  const root = document.createElement('div');
  root.dataset.pathimonTouchGamepad = 'true';
  Object.assign(root.style, {
    display: 'none',
    inset: '0',
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: '10009',
  });

  const dpad = document.createElement('div');
  dpad.dataset.pathimonTouchDpad = 'true';
  Object.assign(dpad.style, {
    bottom: anchors.dpad.bottom,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 54px)',
    gridTemplateRows: 'repeat(3, 54px)',
    height: '162px',
    left: anchors.dpad.left,
    position: 'fixed',
    width: '162px',
  });
  (['horizontal', 'vertical'] as const).forEach((orientation) => {
    const bar = document.createElement('div');
    bar.dataset.pathimonDpadBar = orientation;
    Object.assign(bar.style, {
      background: 'rgba(141, 129, 152, 0.18)',
      borderRadius: '8px',
      height: orientation === 'horizontal' ? '54px' : '162px',
      left: orientation === 'horizontal' ? '0' : '54px',
      pointerEvents: 'none',
      position: 'absolute',
      top: orientation === 'horizontal' ? '54px' : '0',
      width: orientation === 'horizontal' ? '162px' : '54px',
    });
    dpad.appendChild(bar);
  });
  const directions: Array<{
    column: number;
    id: 'down' | 'left' | 'right' | 'up';
    label: string;
    row: number;
    text: string;
  }> = [
    { id: 'up', label: '위로 이동', text: '↑', column: 2, row: 1 },
    { id: 'left', label: '왼쪽으로 이동', text: '←', column: 1, row: 2 },
    { id: 'right', label: '오른쪽으로 이동', text: '→', column: 3, row: 2 },
    { id: 'down', label: '아래로 이동', text: '↓', column: 2, row: 3 },
  ];
  directions.forEach(({ column, id, label, row, text }) => {
    const button = createVirtualKeyButton(label, text, keys[id]);
    button.style.gridColumn = String(column);
    button.style.gridRow = String(row);
    button.style.zIndex = '1';
    dpad.appendChild(button);
  });

  const actions = document.createElement('div');
  actions.dataset.pathimonTouchActions = 'true';
  Object.assign(actions.style, {
    bottom: anchors.actions.bottom,
    height: '136px',
    position: 'fixed',
    right: anchors.actions.right,
    width: '164px',
  });
  const buttonA = createVirtualKeyButton('확인', 'A', keys.a);
  const buttonB = createVirtualKeyButton('취소', 'B', keys.b);
  [buttonA, buttonB].forEach((button) => {
    Object.assign(button.style, {
      background: 'rgba(141, 129, 152, 0.18)',
      border: '2px solid rgba(216, 205, 230, 0.2)',
      borderRadius: '50%',
      color: 'rgba(206, 107, 94, 0.58)',
      height: '74px',
      position: 'absolute',
      width: '74px',
    });
  });
  Object.assign(buttonA.style, { right: '0', top: '0' });
  Object.assign(buttonB.style, { bottom: '0', left: '0' });
  actions.append(buttonA, buttonB);
  root.append(dpad, actions);
  return root;
}

function openGuide(game: Phaser.Game): void {
  const content = gameGuideContent();
  const runningKeys = game.scene.getScenes(true).map((scene) => scene.scene.key);
  runningKeys.forEach((key) => game.scene.pause(key));

  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', content.title);
  Object.assign(overlay.style, {
    alignItems: 'center',
    background: 'rgba(8, 10, 18, 0.84)',
    display: 'flex',
    inset: '0',
    justifyContent: 'center',
    padding: '20px',
    position: 'fixed',
    zIndex: '10020',
  });

  const panel = document.createElement('section');
  Object.assign(panel.style, {
    background: '#302840',
    border: '2px solid #72d6ff',
    color: '#f5f1fa',
    fontFamily: FONT_FAMILY,
    maxHeight: 'min(82vh, 660px)',
    maxWidth: '820px',
    overflowY: 'auto',
    padding: '24px 28px',
    width: 'min(86vw, 820px)',
  });
  panel.innerHTML = [
    `<h2 style="font-size:28px;margin:0 0 8px">${content.title}</h2>`,
    `<p style="color:#bfc5d2;font-size:15px;margin:0 0 20px">${content.subtitle}</p>`,
    ...content.sections.map((section) => (
      `<section style="border-top:1px solid rgba(114,214,255,.35);padding:14px 0 4px">`
      + `<h3 style="color:#72d6ff;font-size:18px;margin:0 0 8px">${section.title}</h3>`
      + section.lines.map((line) => line
        ? `<p style="font-size:15px;line-height:1.65;margin:3px 0">${line}</p>`
        : '<div style="height:8px"></div>').join('')
      + '</section>'
    )),
  ].join('');

  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '닫기';
  Object.assign(close.style, {
    background: '#201c2b',
    border: '2px solid #ef514d',
    color: '#fff',
    cursor: 'pointer',
    float: 'right',
    fontFamily: 'inherit',
    fontSize: '16px',
    marginTop: '16px',
    padding: '8px 30px',
  });
  const dismiss = (): void => {
    overlay.remove();
    runningKeys.forEach((key) => game.scene.resume(key));
  };
  close.addEventListener('click', dismiss);
  overlay.addEventListener('pointerdown', (event) => {
    if (event.target === overlay) dismiss();
  });
  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' || event.key === 'Enter') dismiss();
  });
  panel.appendChild(close);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  close.focus();
}

export function mountGlobalControls(game: Phaser.Game): () => void {
  if (typeof document === 'undefined') return () => undefined;

  const labels = globalControlLabels();
  const container = document.createElement('div');
  const muteButton = createButton(labels.mute, '🔊');
  const guideButton = createButton(labels.guide, '▤');
  const saveButton = createButton(labels.save, '💾');
  const touchButton = createButton(labels.touchHide, '🎮');
  const touchCapable = isTouchCapable({
    hasTouch: game.device.input.touch,
    coarsePointer: typeof window.matchMedia === 'function'
      && window.matchMedia('(pointer: coarse)').matches,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
  });
  Object.assign(container.style, {
    background: 'rgba(17, 23, 34, 0.82)',
    border: '1px solid rgba(114, 214, 255, 0.32)',
    display: 'grid',
    gap: '6px',
    padding: '4px',
    position: 'fixed',
    zIndex: '10010',
  });
  container.append(muteButton, guideButton, saveButton);
  if (touchCapable) {
    container.append(touchButton);
  }
  document.body.appendChild(container);
  const mobileGamepad = touchCapable ? createMobileGamepad() : undefined;
  if (mobileGamepad) document.body.appendChild(mobileGamepad);

  const syncMute = (muted: boolean): void => {
    game.sound.mute = muted;
    muteButton.textContent = muted ? '🔇' : '🔊';
    muteButton.ariaLabel = muted ? labels.unmute : labels.mute;
    muteButton.title = muteButton.ariaLabel;
  };
  const removeMuteListener = onAudioMutedChange(syncMute);
  syncMute(getAudioMuted());

  let touchControlsEnabled = getTouchControlsEnabled();
  const syncMobileGamepad = (): void => {
    if (!mobileGamepad) return;
    const display = touchControlsEnabled
      && game.scene.isActive('BattleScene')
      ? 'block'
      : 'none';
    if (mobileGamepad.style.display !== display) mobileGamepad.style.display = display;
  };
  const syncTouchControls = (enabled: boolean): void => {
    touchControlsEnabled = enabled;
    touchButton.ariaLabel = enabled ? labels.touchHide : labels.touchShow;
    touchButton.title = touchButton.ariaLabel;
    touchButton.setAttribute('aria-pressed', String(enabled));
    touchButton.style.opacity = enabled ? '1' : '0.48';
    syncMobileGamepad();
  };
  const removeTouchListener = onTouchControlsEnabledChange(syncTouchControls);
  syncTouchControls(getTouchControlsEnabled());

  muteButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleAudioMuted();
  });
  guideButton.addEventListener('click', (event) => {
    event.stopPropagation();
    openGuide(game);
  });
  saveButton.addEventListener('click', (event) => {
    event.stopPropagation();
    openRunSaveDialog(game);
  });
  touchButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleTouchControlsEnabled();
  });

  const positionControls = (): void => {
    if (touchCapable) {
      const rail = mobileControlAnchors().rail;
      container.style.left = 'auto';
      container.style.right = rail.right;
      container.style.top = rail.top;
      container.dataset.placement = 'viewport';
      return;
    }
    const canvas = game.canvas;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const position = globalControlPosition(rect, window.innerWidth);
    container.style.left = `${position.left}px`;
    container.style.right = 'auto';
    container.style.top = `${position.top}px`;
    container.dataset.placement = position.insideCanvas ? 'inside' : 'outside';
  };
  const animationFrame = requestAnimationFrame(positionControls);
  const resizeObserver = typeof ResizeObserver === 'undefined'
    ? undefined
    : new ResizeObserver(positionControls);
  resizeObserver?.observe(game.canvas);
  window.addEventListener('resize', positionControls);
  game.events.on('poststep', syncMobileGamepad);
  syncMobileGamepad();

  return () => {
    cancelAnimationFrame(animationFrame);
    resizeObserver?.disconnect();
    window.removeEventListener('resize', positionControls);
    game.events.off('poststep', syncMobileGamepad);
    removeMuteListener();
    removeTouchListener();
    mobileGamepad?.remove();
    container.remove();
  };
}

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

  const syncMute = (muted: boolean): void => {
    game.sound.mute = muted;
    muteButton.textContent = muted ? '🔇' : '🔊';
    muteButton.ariaLabel = muted ? labels.unmute : labels.mute;
    muteButton.title = muteButton.ariaLabel;
  };
  const removeMuteListener = onAudioMutedChange(syncMute);
  syncMute(getAudioMuted());

  const syncTouchControls = (enabled: boolean): void => {
    touchButton.ariaLabel = enabled ? labels.touchHide : labels.touchShow;
    touchButton.title = touchButton.ariaLabel;
    touchButton.setAttribute('aria-pressed', String(enabled));
    touchButton.style.opacity = enabled ? '1' : '0.48';
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
    const canvas = game.canvas;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const position = globalControlPosition(rect, window.innerWidth);
    container.style.left = `${position.left}px`;
    container.style.top = `${position.top}px`;
    container.dataset.placement = position.insideCanvas ? 'inside' : 'outside';
  };
  const animationFrame = requestAnimationFrame(positionControls);
  const resizeObserver = typeof ResizeObserver === 'undefined'
    ? undefined
    : new ResizeObserver(positionControls);
  resizeObserver?.observe(game.canvas);
  window.addEventListener('resize', positionControls);

  return () => {
    cancelAnimationFrame(animationFrame);
    resizeObserver?.disconnect();
    window.removeEventListener('resize', positionControls);
    removeMuteListener();
    removeTouchListener();
    container.remove();
  };
}

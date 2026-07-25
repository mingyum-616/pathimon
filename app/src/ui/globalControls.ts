import type Phaser from 'phaser';
import { getAudioMuted, onAudioMutedChange, toggleAudioMuted } from '../audio/audioSettings';
import { APP_HEIGHT, APP_WIDTH, FONT_FAMILY } from '../game/constants';
import { gameGuideContent } from './gameGuideUi';

export function globalControlLabels(): { guide: string; mute: string; unmute: string } {
  return {
    guide: '전투 안내 열기',
    mute: '음소거',
    unmute: '소리 켜기',
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
    fontSize: '18px',
    height: '34px',
    justifyContent: 'center',
    padding: '0',
    width: '34px',
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
  Object.assign(container.style, {
    display: 'grid',
    gap: '6px',
    position: 'fixed',
    zIndex: '10010',
  });
  container.append(muteButton, guideButton);
  document.body.appendChild(container);

  const syncMute = (muted: boolean): void => {
    game.sound.mute = muted;
    muteButton.textContent = muted ? '🔇' : '🔊';
    muteButton.ariaLabel = muted ? labels.unmute : labels.mute;
    muteButton.title = muteButton.ariaLabel;
  };
  const removeMuteListener = onAudioMutedChange(syncMute);
  syncMute(getAudioMuted());

  muteButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleAudioMuted();
  });
  guideButton.addEventListener('click', (event) => {
    event.stopPropagation();
    openGuide(game);
  });

  const positionControls = (): void => {
    const canvas = game.canvas;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / APP_WIDTH;
    const scaleY = rect.height / APP_HEIGHT;
    container.style.left = `${rect.left + (APP_WIDTH - 54) * scaleX}px`;
    container.style.top = `${rect.top + 70 * scaleY}px`;
    container.style.transform = `scale(${Math.min(scaleX, scaleY)})`;
    container.style.transformOrigin = 'top left';
  };
  const animationFrame = requestAnimationFrame(positionControls);
  window.addEventListener('resize', positionControls);

  return () => {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener('resize', positionControls);
    removeMuteListener();
    container.remove();
  };
}

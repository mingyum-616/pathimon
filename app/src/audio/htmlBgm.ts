import { getAudioMuted, onAudioMutedChange } from './audioSettings';

const PREFETCH_SELECTOR = 'link[data-pathimon-bgm-prefetch]';

let battleBgm: HTMLAudioElement | undefined;
let currentPath = '';

onAudioMutedChange((muted) => {
  if (battleBgm) battleBgm.muted = muted;
});

function audioElement(): HTMLAudioElement | undefined {
  if (battleBgm) return battleBgm;
  if (typeof Audio === 'undefined') return undefined;

  battleBgm = new Audio();
  battleBgm.loop = true;
  battleBgm.preload = 'auto';
  battleBgm.muted = getAudioMuted();
  return battleBgm;
}

export async function playHtmlBattleBgm(path: string, volume = 0.35): Promise<void> {
  const audio = audioElement();
  if (!audio) return;

  audio.volume = volume;
  audio.muted = getAudioMuted();
  if (currentPath !== path) {
    audio.pause();
    audio.src = path;
    audio.currentTime = 0;
    audio.load();
    currentPath = path;
  }

  try {
    await audio.play();
  } catch {
    // A user gesture on the next battle action will retry playback.
  }
}

export function prefetchHtmlBattleBgm(path: string): void {
  if (typeof document === 'undefined' || !path || path === currentPath) return;

  const existing = document.querySelector<HTMLLinkElement>(PREFETCH_SELECTOR);
  if (existing?.getAttribute('href') === path) return;
  existing?.remove();

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'audio';
  link.href = path;
  link.dataset.pathimonBgmPrefetch = '';
  document.head.appendChild(link);
}

export function stopHtmlBattleBgm(): void {
  if (battleBgm) {
    battleBgm.pause();
    battleBgm.src = '';
    battleBgm.load();
  }
  battleBgm = undefined;
  currentPath = '';
  if (typeof document !== 'undefined') {
    document.querySelector(PREFETCH_SELECTOR)?.remove();
  }
}

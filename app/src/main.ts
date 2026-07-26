import Phaser from 'phaser';
import 'pretendard/dist/web/variable/pretendardvariable.css';
import { registerSW } from 'virtual:pwa-register';
import { createGameConfig } from './game/config';
import { mountGlobalControls } from './ui/globalControls';

registerSW({
  immediate: true,
  onRegisterError(error) {
    console.warn('PWA service worker registration failed.', error);
  },
});

// Pretendard가 로드되기 전에 Phaser Text가 생성되면 폴백 폰트로 텍스처가 캐시된다.
// 폰트 로드를 먼저 기다리되, 느리거나 실패해도 폴백으로 계속 진행하도록 타임아웃으로 감싼다.
async function boot(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await Promise.race([
        document.fonts.load('16px "Pretendard Variable"'),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch {
      // 폰트 로드 실패는 무시한다. OS 폴백 폰트로 렌더된다.
    }
  }

  const game = new Phaser.Game(createGameConfig('game'));
  mountGlobalControls(game);
}

void boot();

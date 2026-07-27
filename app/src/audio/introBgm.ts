import Phaser from 'phaser';

export const INTRO_BGM_PATH = 'audio/bgm/title_afd_2.mp3';

export function queueIntroBgm(scene: Phaser.Scene): void {
  if (!scene.cache.audio.exists(INTRO_BGM_PATH)) {
    scene.load.audio(INTRO_BGM_PATH, INTRO_BGM_PATH);
  }
}

export function playIntroBgm(scene: Phaser.Scene): void {
  const existing = scene.sound.get(INTRO_BGM_PATH);
  if (existing?.isPlaying) {
    return;
  }

  const sound = existing ?? scene.sound.add(INTRO_BGM_PATH, { loop: true, volume: 0.34 });
  sound.play({ loop: true, rate: 1, volume: 0.34 });
}

export function playEndingBgm(scene: Phaser.Scene): void {
  const existing = scene.sound.get(INTRO_BGM_PATH);
  const sound = existing ?? scene.sound.add(INTRO_BGM_PATH, { loop: true, volume: 0.22 });
  if (sound.isPlaying) {
    sound.stop();
  }

  sound.play({ loop: true, rate: 0.92, volume: 0.22 });
}

export function stopIntroBgm(scene: Phaser.Scene): void {
  const sound = scene.sound.get(INTRO_BGM_PATH);
  if (sound) {
    sound.stop();
  }
}

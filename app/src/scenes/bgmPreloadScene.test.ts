import { describe, expect, it } from 'vitest';
import bgmPreloadSceneSource from './BgmPreloadScene.ts?raw';

describe('BgmPreloadScene', () => {
  it('loads the intro BGM while the story is being read', () => {
    expect(bgmPreloadSceneSource).toContain('queueIntroBgm(this)');
  });

  it('keeps the story screensaver without decoding every battle BGM', () => {
    expect(bgmPreloadSceneSource).toContain("super('BgmPreloadScene')");
    expect(bgmPreloadSceneSource).toContain('startPathimonScreensaver');
    expect(bgmPreloadSceneSource).toContain('createInitialPathimonScreensaverItems');
    expect(bgmPreloadSceneSource).toContain('createPathimonScreensaverPair');
    expect(bgmPreloadSceneSource).toContain('addScreensaverPair');
    expect(bgmPreloadSceneSource).toContain('pathimonScreensaverSpritePool');
    expect(bgmPreloadSceneSource).toContain('this.previousCanvasZIndex = this.game.canvas.style.zIndex');
    expect(bgmPreloadSceneSource).toContain("this.game.canvas.style.zIndex = '1000'");
    expect(bgmPreloadSceneSource).toContain("zIndex: '1001'");
    expect(bgmPreloadSceneSource).toContain('stopPathimonScreensaver');
    expect(bgmPreloadSceneSource).toContain('removePathimonScreensaver');
    expect(bgmPreloadSceneSource).not.toContain('battleBgmAudioPaths()');
    expect(bgmPreloadSceneSource).not.toContain('this.load.audio(path, path)');
    expect(bgmPreloadSceneSource).not.toContain('BGM 로딩중');
    expect(bgmPreloadSceneSource).toContain("this.registry.set('battleBgmPreloadComplete', true)");
    expect(bgmPreloadSceneSource).toContain("if (this.registry.get('introStoryComplete'))");
    expect(bgmPreloadSceneSource).toContain('this.removePathimonScreensaver();');
    expect(bgmPreloadSceneSource).not.toContain('this.removePathimonScreensaver();\r\n    this.registry.set');
  });
});

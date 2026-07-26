import { describe, expect, it } from 'vitest';
import { createGameConfig } from './config';

describe('scene registration', () => {
  it('uses smooth scaling for enlarged trainers and microscope-style pathimon assets', () => {
    const config = createGameConfig('game');

    expect(config.pixelArt).toBe(false);
  });
  it('registers the real gameplay scene flow', () => {
    const config = createGameConfig('game');
    const scenes = config.scene as Array<{ name?: string }>;

    expect(scenes.map((scene) => scene.name)).toEqual([
      'TitleScene',
      'BgmPreloadScene',
      'StoryScene',
      'DisclaimerScene',
      'PostDisclaimerStoryScene',
      'GameGuideScene',
      'ModeSelectScene',
      'StarterSelectScene',
      'BattleScene',
      'ShopScene',
      'BossIntroScene',
      'EndingScene',
    ]);
  });
});

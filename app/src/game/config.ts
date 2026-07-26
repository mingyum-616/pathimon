import Phaser from 'phaser';
import { BattleScene } from '../scenes/BattleScene';
import { BgmPreloadScene } from '../scenes/BgmPreloadScene';
import { BossIntroScene } from '../scenes/BossIntroScene';
import { DisclaimerScene } from '../scenes/DisclaimerScene';
import { EndingScene } from '../scenes/EndingScene';
import { GameGuideScene } from '../scenes/GameGuideScene';
import { ModeSelectScene } from '../scenes/ModeSelectScene';
import { PostDisclaimerStoryScene } from '../scenes/PostDisclaimerStoryScene';
import { ShopScene } from '../scenes/ShopScene';
import { StarterSelectScene } from '../scenes/StarterSelectScene';
import { StoryScene } from '../scenes/StoryScene';
import { TitleScene } from '../scenes/TitleScene';
import { APP_HEIGHT, APP_WIDTH } from './constants';

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: APP_WIDTH,
    height: APP_HEIGHT,
    backgroundColor: '#182131',
    pixelArt: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [TitleScene, BgmPreloadScene, StoryScene, DisclaimerScene, PostDisclaimerStoryScene, GameGuideScene, ModeSelectScene, StarterSelectScene, BattleScene, ShopScene, BossIntroScene, EndingScene],
  };
}

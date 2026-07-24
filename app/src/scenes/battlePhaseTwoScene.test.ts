import { describe, expect, it } from 'vitest';
import battleSceneSource from './BattleScene.ts?raw';

describe('BattleScene boss phase two transition', () => {
  it('pauses after the triggering round for dialogue before activating two moves', () => {
    expect(battleSceneSource).toContain("'dialogue'");
    expect(battleSceneSource).toContain('bossPhase2Pending');
    expect(battleSceneSource).toContain('bossPhaseTwoDialogue');
    expect(battleSceneSource).toContain('activateBossPhaseTwo');
    expect(battleSceneSource).toContain('advanceTypewriter');
  });

  it('enlarges the boss before returning to battle preparation', () => {
    expect(battleSceneSource).toContain('PHASE_TWO_BOSS_SCALE');
    expect(battleSceneSource).toContain('this.tweens.add');
    expect(battleSceneSource).toContain('scaleX');
    expect(battleSceneSource).toContain('scaleY');
  });

  it('uses the back half of a cropped substitute sheet for the player side', () => {
    expect(battleSceneSource).toContain("perspective: 'front' | 'back'");
    expect(battleSceneSource).toContain('monster.spriteCrop');
    expect(battleSceneSource).toContain("perspective === 'back'");
    expect(battleSceneSource).toContain('.setCrop(');
  });
});

import { describe, expect, it } from 'vitest';
import bossIntroSceneSource from './BossIntroScene.ts?raw';

describe('BossIntroScene input', () => {
  it('starts the battle with Enter as well as pointer input', () => {
    expect(bossIntroSceneSource).toContain("this.input.keyboard?.on('keydown'");
    expect(bossIntroSceneSource).toContain("command === 'confirm'");
  });

  it('types one boss utterance at a time and applies a floor 100 skill after the dialogue', () => {
    expect(bossIntroSceneSource).toContain('advanceTypewriter');
    expect(bossIntroSceneSource).toContain('encounterDialogue');
    expect(bossIntroSceneSource).toContain('finalBossSkillDialogue');
    expect(bossIntroSceneSource).toContain('finalBossSkillName');
    expect(bossIntroSceneSource).toContain("을 사용했다!");
    expect(bossIntroSceneSource).toContain('applyFinalBossSkill');
    expect(bossIntroSceneSource).toContain('TYPEWRITER_INTERVAL_MS');
  });

  it('shows the exclusive boss image during the encounter dialogue', () => {
    expect(bossIntroSceneSource).toContain('this.state.enemy?.assetPath');
    expect(bossIntroSceneSource).toContain('this.add.image');
  });
});

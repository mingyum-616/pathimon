import { describe, expect, it } from 'vitest';
import battleSceneSource from './BattleScene.ts?raw';

describe('BattleScene ending transition', () => {
  it('starts EndingScene when the battle state reaches the ending phase', () => {
    expect(battleSceneSource).toContain("if (this.state.phase === 'ending')");
    expect(battleSceneSource).toContain("this.scene.start('EndingScene', { state: this.state })");
  });
});

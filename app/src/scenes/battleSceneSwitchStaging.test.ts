import { describe, expect, it } from 'vitest';
import battleSceneSource from './BattleScene.ts?raw';

describe('BattleScene voluntary switch staging', () => {
  it('returns to command selection without consuming the announced enemy turn', () => {
    const marker = 'private handlePartySwitch(';
    const start = battleSceneSource.indexOf(marker);
    expect(start).toBeGreaterThan(-1);

    const rest = battleSceneSource.slice(start + marker.length);
    const end = rest.indexOf('\n  private ');
    const body = rest.slice(0, end === -1 ? undefined : end);

    expect(body).toContain('this.afterBattleAction()');
    expect(body).not.toContain('playBattleResolutionCue');
    expect(body).not.toContain('showCombatMessage');
  });
});

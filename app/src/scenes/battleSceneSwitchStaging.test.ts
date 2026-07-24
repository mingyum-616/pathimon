import { describe, expect, it } from 'vitest';
import battleSceneSource from './BattleScene.ts?raw';

// 자발적 교체(패시몬 교체)시 적은 새로 나온 패시몬에게 반격한다(resolveSwitchMonster가 적 턴을 처리).
// 이 반격 연출을 건너뛰면 플레이어가 "적의 P!"(실제 쓴 기술)를 못 보고 곧장 다음 예고 P'만 보게 되어
// "예고한 기술이랑 실제 사용한 기술이 다르다"고 느낀다. 일반 공격과 동일한 연출 흐름을 타야 한다.
describe('BattleScene voluntary switch staging', () => {
  it('stages the enemy counterattack (resolution cue + combat message) on a voluntary switch', () => {
    const marker = 'private handlePartySwitch(';
    const start = battleSceneSource.indexOf(marker);
    expect(start).toBeGreaterThan(-1);

    const rest = battleSceneSource.slice(start + marker.length);
    const end = rest.indexOf('\n  private ');
    const body = rest.slice(0, end === -1 ? undefined : end);

    // 자발적 교체는 일반 공격과 똑같이 처리 연출 → 전투 메시지를 보여준 뒤 다음 예고로 넘어간다.
    expect(body).toContain('playBattleResolutionCue(previousState, this.state, () => this.showCombatMessage())');
    // 강제 교체(적 턴 없음)만 곧장 afterBattleAction으로 넘어간다.
    expect(body).toContain('wasForcedSwitch');
  });
});

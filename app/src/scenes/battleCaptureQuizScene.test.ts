import { describe, expect, it } from 'vitest';
import battleSceneSource from './BattleScene.ts?raw';

describe('BattleScene capture quiz and first trainer guidance', () => {
  it('throws the selected capsule before showing an OX quiz', () => {
    expect(battleSceneSource).toContain('playCapsuleThrow');
    expect(battleSceneSource).toContain('drawCaptureQuizView');
    expect(battleSceneSource).toContain('이 질문을 던진다...');
    expect(battleSceneSource).toContain("handleCaptureQuizAnswer(true)");
    expect(battleSceneSource).toContain("handleCaptureQuizAnswer(false)");
    expect(battleSceneSource).toContain('핵심 문장');
    expect(battleSceneSource).toContain('정답 해설');
    expect(battleSceneSource).toContain('오답 시 최대 체력');
  });

  it('shows the floor-five switch and dex guidance once', () => {
    expect(battleSceneSource).toContain('showFirstTrainerGuide');
    expect(battleSceneSource).toContain('예고된 처치의 피해 배율이 낮은 패시몬으로 교체하세요.');
    expect(battleSceneSource).toContain('도감의 상성표');
    expect(battleSceneSource).toContain('가능한 한 파티를 채워 전투에 대비하세요.');
    expect(battleSceneSource).toContain('자세히 보기');
  });

  it('plays the stat-up cue when a successful switch earns attack rank', () => {
    expect(battleSceneSource).toContain('playAttackRankUpEffect');
    expect(battleSceneSource).toContain('battle_stats');
  });
});

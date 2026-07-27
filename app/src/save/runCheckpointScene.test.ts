import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function sceneSource(name: string): string {
  return new TextDecoder().decode(readFileSync(`src/scenes/${name}`));
}

describe('run checkpoint scene integration', () => {
  it('captures the start of wild and trainer floors in BattleScene', () => {
    expect(sceneSource('BattleScene.ts')).toContain(
      "captureFloorCheckpoint(this.state, 'BattleScene')",
    );
  });

  it('captures boss floors before the encounter dialogue and final skill', () => {
    expect(sceneSource('BossIntroScene.ts')).toContain(
      "captureFloorCheckpoint(this.state, 'BossIntroScene')",
    );
  });

  it('clears the active checkpoint before choosing a new run', () => {
    expect(sceneSource('ModeSelectScene.ts')).toContain('clearActiveRunCheckpoint()');
  });
});

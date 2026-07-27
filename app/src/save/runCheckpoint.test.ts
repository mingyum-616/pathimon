import { beforeEach, describe, expect, it } from 'vitest';
import type { RunState } from '../types/game';
import {
  captureFloorCheckpoint,
  clearActiveRunCheckpoint,
  getActiveRunCheckpoint,
  restoreActiveRunCheckpoint,
} from './runCheckpoint';

function stateAt(floor: number, hp = 50): RunState {
  return {
    floor,
    bgmSeed: 1234,
    mode: 'challenge',
    visualStyle: 'character',
    money: 0,
    capsules: 0,
    capsuleInventory: {
      universal: 0,
      virus: 0,
      bacteria: 0,
      parasite: 0,
      fungus: 0,
      protozoa: 0,
      prion: 0,
    },
    party: [{ hp }] as RunState['party'],
    activeIndex: 0,
    enemy: null,
    encounterKind: floor % 10 === 0 ? 'boss' : 'wild',
    phase: floor % 10 === 0 ? 'bossIntro' : 'battle',
    lastLog: '',
  };
}

describe('run floor checkpoint', () => {
  beforeEach(() => {
    clearActiveRunCheckpoint();
  });

  it('keeps the first snapshot captured for the same run and floor', () => {
    const first = stateAt(3, 50);
    captureFloorCheckpoint(first, 'BattleScene');
    first.party[0].hp = 10;
    captureFloorCheckpoint(stateAt(3, 20), 'BattleScene');

    expect(getActiveRunCheckpoint()?.state.party[0].hp).toBe(50);
  });

  it('replaces the checkpoint when the run advances to a new floor', () => {
    captureFloorCheckpoint(stateAt(3), 'BattleScene');
    captureFloorCheckpoint(stateAt(4, 42), 'BattleScene');

    expect(getActiveRunCheckpoint()).toMatchObject({
      sceneKey: 'BattleScene',
      state: {
        floor: 4,
        party: [{ hp: 42 }],
      },
    });
  });

  it('restores a saved checkpoint without sharing mutable state', () => {
    const saved = {
      sceneKey: 'BossIntroScene' as const,
      state: stateAt(10, 33),
    };
    restoreActiveRunCheckpoint(saved);
    saved.state.party[0].hp = 1;

    expect(getActiveRunCheckpoint()?.state.party[0].hp).toBe(33);
  });
});

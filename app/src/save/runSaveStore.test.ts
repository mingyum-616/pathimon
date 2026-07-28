import { beforeEach, describe, expect, it } from 'vitest';
import type { RunState } from '../types/game';
import type { RunCheckpoint } from './runCheckpoint';
import {
  RUN_SAVE_SLOT_COUNT,
  loadRunSaveSlots,
  writeRunSaveSlot,
} from './runSaveStore';

function checkpoint(floor: number): RunCheckpoint {
  return {
    sceneKey: floor % 10 === 0 ? 'BossIntroScene' : 'BattleScene',
    state: {
      floor,
      bgmSeed: 4321,
      mode: 'learning',
      visualStyle: 'micro',
      money: 2,
      capsules: 1,
      capsuleInventory: {
        universal: 1,
        virus: 0,
        bacteria: 0,
        parasite: 0,
        fungus: 0,
        protozoa: 0,
        prion: 0,
      },
      party: [{ name: '테스트몬', hp: 44 }] as RunState['party'],
      activeIndex: 0,
      enemy: null,
      encounterKind: floor % 10 === 0 ? 'boss' : 'wild',
      phase: floor % 10 === 0 ? 'bossIntro' : 'battle',
      lastLog: '',
      wildEncounterCounts: { anthrax: 2 },
      wildEncounterHistoryIds: ['cereus', 'anthrax'],
    },
  };
}

describe('run save slots', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('always exposes five slots', () => {
    expect(RUN_SAVE_SLOT_COUNT).toBe(5);
    expect(loadRunSaveSlots(localStorage)).toEqual([null, null, null, null, null]);
  });

  it('stores the current floor and a detached run snapshot', () => {
    const source = checkpoint(27);
    writeRunSaveSlot(2, source, localStorage, new Date('2026-07-27T10:00:00.000Z'));
    source.state.party[0].hp = 1;

    expect(loadRunSaveSlots(localStorage)[2]).toMatchObject({
      schemaVersion: 1,
      floor: 27,
      savedAt: '2026-07-27T10:00:00.000Z',
      sceneKey: 'BattleScene',
      state: {
        floor: 27,
        party: [{ name: '테스트몬', hp: 44 }],
        wildEncounterCounts: { anthrax: 2 },
        wildEncounterHistoryIds: ['cereus', 'anthrax'],
      },
    });
  });

  it('isolates a malformed slot instead of losing the other saves', () => {
    writeRunSaveSlot(0, checkpoint(8), localStorage);
    localStorage.setItem('pathimon-run-save-v1-2', '{broken');

    expect(loadRunSaveSlots(localStorage)[0]?.floor).toBe(8);
    expect(loadRunSaveSlots(localStorage)[1]).toBeNull();
  });
});

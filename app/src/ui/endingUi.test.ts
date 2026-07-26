import { describe, expect, it } from 'vitest';
import type { RuntimeMonster } from '../types/game';
import { endingRosterEntries, ENDING_PAGES } from './endingUi';

function createMonster(overrides: Partial<RuntimeMonster> = {}): RuntimeMonster {
  return {
    templateId: 'test',
    name: '테스트몬',
    scientificName: 'Testimon',
    category: '세균',
    glyph: 'T',
    tags: {},
    maxHp: 10,
    hp: 10,
    attack: 10,
    defense: 10,
    speed: 1,
    captureRate: 0,
    ability: 'none',
    abilities: [],
    moveset: [],
    moveSlots: [],
    moveStages: {},
    effects: [],
    statusConditions: {},
    stunned: false,
    fainted: false,
    isBoss: false,
    ...overrides,
  };
}

describe('ending UI data', () => {
  it('uses the final party order and limits the roster to six', () => {
    const party = Array.from({ length: 7 }, (_, index) => createMonster({
      templateId: `monster-${index}`,
      name: `패시몬 ${index}`,
      assetBaseId: `monster-${index}`,
    }));

    expect(endingRosterEntries({ party, visualStyle: 'character' })).toHaveLength(6);
    expect(endingRosterEntries({ party, visualStyle: 'character' })[0].name).toBe('패시몬 0');
  });

  it('keeps a Prof. S substitute visible as a sealed doll', () => {
    const party = [createMonster({
      name: '봉인 인형',
      sealedByBoss: true,
      assetPath: 'images/pathimon/substitute-doll.png',
    })];

    expect(endingRosterEntries({ party, visualStyle: 'character' })[0]).toMatchObject({
      name: '봉인 인형',
      assetPath: 'images/pathimon/substitute-doll.png',
    });
  });

  it('contains the approved ending copy', () => {
    expect(ENDING_PAGES.roster).toEqual([
      '고마워. 이제 네 세계로 돌려보내줄게.',
      '시험 잘 봐!',
    ]);
    expect(ENDING_PAGES.epilogue).toEqual([
      '그러나 패시몬 세계에 모든 힘을 쏟은 주인공은',
      '거짓말같이 감면 시험을 망치고 말았다...',
    ]);
  });
});

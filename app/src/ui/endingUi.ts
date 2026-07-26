import type { RuntimeMonster, VisualStyle } from '../types/game';
import { pathimonSpriteAssets } from './battleUi';

export const ENDING_PAGES = {
  roster: [
    '고마워. 이제 네 세계로 돌려보내줄게.',
    '시험 잘 봐!',
  ],
  epilogue: [
    '그러나 패시몬 세계에 모든 힘을 쏟은 주인공은',
    '거짓말같이 감면 시험을 망치고 말았다...',
  ],
} as const;

export interface EndingRosterEntry {
  name: string;
  assetPath: string;
}

export function endingRosterEntries(input: {
  party: RuntimeMonster[];
  visualStyle: VisualStyle;
}): EndingRosterEntry[] {
  return input.party.slice(0, 6).map((monster) => ({
    name: monster.sealedByBoss ? '봉인 인형' : monster.name,
    assetPath: monster.sealedByBoss && monster.assetPath
      ? monster.assetPath
      : pathimonSpriteAssets(monster, input.visualStyle).front,
  }));
}

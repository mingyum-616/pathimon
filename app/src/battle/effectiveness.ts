import { ABILITIES } from '../data/abilities';
import { EFFECTIVENESS } from '../data/effectiveness';
import { statusConditionStacks } from '../data/statusConditions';
import type { AbilityId, MoveData, RuntimeMonster, TagAxis, TagValue } from '../types/game';

export interface MultiplierResult {
  total: number;
  notes: string[];
}

function defenseAbilities(monster: RuntimeMonster): AbilityId[] {
  const abilities = monster.abilities?.length ? monster.abilities : [monster.ability];
  const disabledCount = Math.floor(statusConditionStacks(monster, 'immune_abnormal') / 4);
  const activeAbilities = abilities.slice(disabledCount);
  return activeAbilities.length > 0 ? activeAbilities : ['none'];
}

function isParasiteCategory(category: string): boolean {
  return ['기생충', '연충', '선충', '흡충', '조충'].includes(category);
}

export function calculateMultiplier(
  move: MoveData,
  attacker: RuntimeMonster,
  defender: RuntimeMonster,
): MultiplierResult {
  const notes: string[] = [];
  const table = EFFECTIVENESS[move.type];
  let typeMultiplier = 1;
  const abilities = defenseAbilities(defender);

  if (table) {
    for (const ability of abilities) {
      const abilityHit = table[ability];
      if (abilityHit !== undefined) {
        typeMultiplier *= abilityHit;
      }
    }

    for (const tagValue of Object.values(defender.tags) as TagValue[]) {
      if (!tagValue) {
        continue;
      }

      const tagHit = table[tagValue];
      if (tagHit !== undefined) {
        typeMultiplier *= tagHit;
      }
    }
  }

  typeMultiplier = Math.min(3, Math.max(0, typeMultiplier));

  let total = typeMultiplier;

  for (const ability of abilities) {
    if (ability === 'parasite_master' && isParasiteCategory(attacker.category)) {
      total *= 0.5;
      notes.push('기생충학 마스터가 기생충 타입 공격을 반감했다');
    }

    const resistTag = ABILITIES[ability]?.resistTag;

    if (!resistTag) {
      continue;
    }

    for (const axis of Object.keys(resistTag) as TagAxis[]) {
      const tagMap = resistTag[axis];
      const attackTag = attacker.tags[axis];

      if (!attackTag) {
        continue;
      }

      const reaction = tagMap?.[attackTag as TagValue];
      if (reaction === undefined) {
        continue;
      }

      total *= reaction;

      if (ability === 'mask' && axis === 'pathway' && attackTag === 'respiratory') {
        notes.push('점액섬모가 호흡기 태그를 반감했다');
      }

      if (ability === 'lysozyme' && axis === 'wall' && attackTag === 'gram_positive') {
        notes.push('라이소자임이 그람양성 태그를 반감했다');
      }
    }
  }

  return { total, notes };
}

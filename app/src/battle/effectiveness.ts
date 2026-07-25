import { ABILITIES } from '../data/abilities';
import { EFFECTIVENESS } from '../data/effectiveness';
import { TAG_LABELS } from '../data/labels';
import { statusConditionStacks } from '../data/statusConditions';
import { withParticle } from '../game/text';
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

// 방어특성 반감은 중첩되지만 무한히 곱하면 후반 보스가 직접 피해에 사실상 무적이 되고,
// 남는 승리 경로가 상태이상 도트뿐이라 기술 선택이 무의미해진다. 유효 반감을 두 번까지로 끊는다.
// 명시적 무효(×0)는 이 하한을 타지 않는다 — 무효는 "안 통한다"는 학습 메시지라 그대로 둔다.
export const RESISTANCE_FLOOR = 0.25;

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
    const abilityData = ABILITIES[ability];
    const categoryReaction = abilityData?.resistCategory?.[attacker.category];

    if (categoryReaction !== undefined) {
      total *= categoryReaction;
      notes.push(`${withParticle(abilityData!.name, '이')} ${attacker.category} 계열 공격을 반감했다`);
    }

    const resistTag = abilityData?.resistTag;

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

      if (reaction < 1 && abilityData) {
        notes.push(`${withParticle(abilityData.name, '이')} ${TAG_LABELS[attackTag as TagValue] ?? attackTag} 태그를 반감했다`);
      }
    }
  }

  return { total: total > 0 ? Math.max(RESISTANCE_FLOOR, total) : 0, notes };
}

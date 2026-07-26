import type { ActiveEffect, EffectPrimitive, RuntimeMonster } from '../types/game';
import {
  addStatusCondition,
  adjustedStatusChance,
  clampHpToEffectiveMax,
  effectiveMaxHp,
  healingMultiplier,
  statusConditionStacks,
  statusDamageMultiplier,
} from '../data/statusConditions';

function clampHp(monster: RuntimeMonster): void {
  clampHpToEffectiveMax(monster);
}

function getTarget(user: RuntimeMonster, enemy: RuntimeMonster, target: 'self' | 'enemy'): RuntimeMonster {
  return target === 'self' ? user : enemy;
}

function pushEffect(monster: RuntimeMonster, effect: ActiveEffect): void {
  monster.effects.push(effect);
}

function positiveRoundedDamage(value: number): number {
  return value > 0 ? Math.max(1, Math.round(value)) : 0;
}

function dealDamage(monster: RuntimeMonster, damage: number): number {
  if (damage <= 0 || monster.parasitizationStage === 'egg') {
    return 0;
  }

  const before = monster.hp;
  monster.hp = Math.max(0, monster.hp - damage);
  clampHp(monster);
  return before - monster.hp;
}

export function applyEffects(user: RuntimeMonster, enemy: RuntimeMonster, effects?: EffectPrimitive[]): void {
  if (!effects?.length) {
    return;
  }

  // 독소벼림: 이번 공격 전에 이미 걸려 있던 empower_status가 있으면, 이 공격이 적에게 거는 상태이상 스택을 키운다.
  // (prep이 지금 막 추가하는 empower는 여기 안 잡히므로 자기 자신은 증폭하지 않는다.)
  const empower = user.effects.find((effect) => effect.kind === 'empower_status');
  let empowerConsumed = false;

  for (const effect of effects) {
    const target = getTarget(user, enemy, effect.target);

    switch (effect.kind) {
      case 'empower_status':
        pushEffect(target, {
          kind: 'empower_status',
          multiplier: effect.multiplier,
          turns: effect.turns ?? 99,
        });
        break;
      case 'buff':
        pushEffect(target, {
          kind: 'buff',
          stat: effect.stat,
          pct: effect.pct,
          rank: effect.rank,
          turns: effect.turns,
        });
        break;
      case 'field':
        pushEffect(target, {
          kind: 'field',
          side: effect.side,
          factor: effect.factor,
          turns: effect.turns,
        });
        break;
      case 'dot':
        pushEffect(target, {
          kind: 'dot',
          power: effect.power,
          turns: effect.turns,
        });
        break;
      case 'invuln':
        pushEffect(target, {
          kind: 'invuln',
          turns: effect.turns,
        });
        break;
      case 'convert':
        pushEffect(target, {
          kind: 'convert',
          power: effect.power,
          turns: 99,
        });
        break;
      case 'heal':
        target.hp += Math.round(effectiveMaxHp(target) * (effect.pct / 100) * healingMultiplier(target));
        clampHp(target);
        break;
      case 'status':
        if (Math.random() > adjustedStatusChance(target, effect.chance, effect.status)) {
          break;
        }

        if (effect.status === 'confusion') {
          pushEffect(target, {
            kind: 'confusion',
            turns: effect.turns ?? 1,
          });
          break;
        }

        target.stunned = true;
        break;
      case 'condition': {
        if (Math.random() > adjustedStatusChance(target, effect.chance)) {
          break;
        }

        let stacks = effect.stacks ?? 1;
        if (empower && effect.target === 'enemy') {
          stacks = Math.max(1, Math.round(stacks * (empower.multiplier ?? 2)));
          empowerConsumed = true;
        }
        addStatusCondition(target, effect.condition, stacks);
        break;
      }
      default:
        break;
    }
  }

  // 다음 공격 1회에만 적용 — 적에게 상태이상을 실제로 걸었으면 소모한다.
  if (empowerConsumed && empower) {
    user.effects = user.effects.filter((effect) => effect !== empower);
  }
}

// 혼란: 부여되면 이후 그 몬스터가 행동할 때 확률로 자신을 공격한다(자해). 발동하면 그 턴을 날린다.
export const CONFUSION_SELF_HIT_CHANCE = 1 / 3;
const CONFUSION_SELF_DAMAGE_PCT = 0.1; // 최대 체력 10%

export function isConfused(monster: RuntimeMonster): boolean {
  return monster.effects.some((effect) => effect.kind === 'confusion' && (effect.turns ?? 0) > 0);
}

// 혼란 자해 판정. 발동 시 최대 체력 %만큼 자기 피해를 입히고 그 값을 반환한다(0 = 미발동).
// 혼란이 아닐 땐 난수를 뽑지 않는다 — 매 턴 무의미하게 난수열을 밀어 다른 판정(명중·결과)을 흔들지 않도록.
export function resolveConfusionSelfHit(monster: RuntimeMonster, roll?: number): number {
  if (monster.hp <= 0 || !isConfused(monster)) {
    return 0;
  }
  if ((roll ?? Math.random()) >= CONFUSION_SELF_HIT_CHANCE) {
    return 0;
  }
  const damage = Math.max(1, Math.round(effectiveMaxHp(monster) * CONFUSION_SELF_DAMAGE_PCT));
  return dealDamage(monster, damage);
}

export function applyAttackTriggeredStatusDamage(monster: RuntimeMonster): number {
  const coughStacks = statusConditionStacks(monster, 'cough');
  if (coughStacks <= 0 || monster.hp <= 0) {
    return 0;
  }

  const damage = positiveRoundedDamage(monster.hp * 0.02 * coughStacks * statusDamageMultiplier(monster));
  return dealDamage(monster, damage);
}

function tickStatusConditions(monster: RuntimeMonster, random: () => number): number {
  let damage = 0;

  const feverStacks = statusConditionStacks(monster, 'fever');
  if (feverStacks > 0) {
    damage += positiveRoundedDamage(effectiveMaxHp(monster) * 0.02 * feverStacks);
  }

  const anemiaStacks = statusConditionStacks(monster, 'anemia');
  if (anemiaStacks > 0) {
    damage += positiveRoundedDamage(effectiveMaxHp(monster) * 0.01 * anemiaStacks);
  }

  const bleedingStacks = statusConditionStacks(monster, 'bleeding');
  if (bleedingStacks > 0) {
    damage += positiveRoundedDamage(monster.hp * 0.02 * bleedingStacks);
  }

  const excretoryStacks = statusConditionStacks(monster, 'excretory_dysfunction');
  if (excretoryStacks > 0) {
    damage += positiveRoundedDamage(effectiveMaxHp(monster) * 0.01 * excretoryStacks);
  }

  damage = positiveRoundedDamage(damage * statusDamageMultiplier(monster));

  if (excretoryStacks > 0 && random() < adjustedStatusChance(monster, 0.2 * excretoryStacks)) {
    addStatusCondition(monster, 'dehydration');
  }

  const dyspneaStacks = statusConditionStacks(monster, 'dyspnea');
  if (dyspneaStacks > 0 && random() < adjustedStatusChance(monster, 0.005 * dyspneaStacks)) {
    damage = Math.max(damage, monster.hp);
  }

  return dealDamage(monster, damage);
}

export function tickEffects(monster: RuntimeMonster, random: () => number = Math.random): number {
  let damage = 0;
  const nextEffects: ActiveEffect[] = [];

  clampHp(monster);

  for (const effect of monster.effects) {
    let nextEffect = effect;

    if (effect.kind === 'dot') {
      damage += effect.power ?? 0;
    }

    if (effect.kind === 'convert') {
      damage += effect.power ?? 0;
      nextEffect = {
        ...effect,
        power: (effect.power ?? 0) + 3,
      };
    }

    const turns = nextEffect.turns;
    if (turns === undefined) {
      nextEffects.push(nextEffect);
      continue;
    }

    if (turns - 1 > 0) {
      nextEffects.push({ ...nextEffect, turns: turns - 1 });
    }
  }

  damage = dealDamage(monster, damage);
  damage += tickStatusConditions(monster, random);

  monster.effects = nextEffects;
  return damage;
}

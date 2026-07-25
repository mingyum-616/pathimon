import type { MoveData, RuntimeMonster } from '../types/game';
import { calculateMultiplier, type MultiplierResult } from './effectiveness';
import { attackStatMultiplier, defenseStatMultiplier, directDamageMultiplier } from '../data/statusConditions';

export interface DamageResult {
  damage: number;
  multiplier: MultiplierResult;
  blockedByInvulnerability: boolean;
  critical: boolean;
}

const CRITICAL_HIT_DENOMINATORS = [24, 8, 2, 1] as const;
const CRITICAL_DAMAGE_MULTIPLIER = 1.5;

export function randomDamageVariance(random: () => number = Math.random): number {
  return 0.85 + random() * 0.15;
}

export function criticalHitChance(stage = 0): number {
  const index = Math.min(CRITICAL_HIT_DENOMINATORS.length - 1, Math.max(0, Math.floor(stage)));
  return 1 / CRITICAL_HIT_DENOMINATORS[index]!;
}

export function rollsCriticalHit(roll: number, stage = 0): boolean {
  return roll < criticalHitChance(stage);
}

function getIncomingFactor(defender: RuntimeMonster): number {
  return defender.effects
    .filter((effect) => effect.kind === 'field' && effect.side === 'incoming')
    .reduce((factor, effect) => factor * (effect.factor ?? 1), 1);
}

function isInvulnerable(defender: RuntimeMonster): boolean {
  return defender.effects.some((effect) => effect.kind === 'invuln');
}

// 노트 패시몬의 방어는 25~95로 3.8배 벌어져 있고, 피해식이 `위력 × 공격/방어`라 방어가 선형으로 폭주한다.
// 여기에 ×1/×2/×4 배율이 곱해지면 최종 피해가 16배까지 벌어져서 "이 전투에서 몇 마리 잃는다"를 튜닝할 수 없다.
// 그래서 방어값을 기준점(60)에서의 편차만 40%로 눌러 46~74(1.6배)로 접는다. HP는 체력바로 읽히니 그대로 둔다.
//
// 두 가지 예외가 있다.
// 1) 보스·트레이너 방어는 설계 상수 8이라 분산 자체가 없다. 같은 압축을 걸면 31로 부풀어 플레이어 화력이
//    4배 죽으므로 **패시몬이 방어하는 쪽에만** 적용한다.
// 2) 레거시 대표종(`LEGACY_REPRESENTATIVE_MONSTERS`)은 방어가 한 자릿수인 옛 스케일이다. 야생 로스터에
//    올라오지 않는 참조 데이터지만, 압축을 걸면 3 → 37로 12배 부풀어 의미가 없어진다. 그래서 노트 스케일
//    하한(25) 아래는 통과시킨다. 노트 방어가 이 경계 아래로 내려오지 않는지는 dataIntegrity 테스트가 지킨다.
export const DEFENSE_COMPRESSION_PIVOT = 60;
export const DEFENSE_COMPRESSION_SLOPE = 0.4;
export const DEFENSE_COMPRESSION_MIN_SCALE = 25;

export function compressedDefense(defense: number): number {
  if (defense < DEFENSE_COMPRESSION_MIN_SCALE) return defense;
  return DEFENSE_COMPRESSION_PIVOT + (defense - DEFENSE_COMPRESSION_PIVOT) * DEFENSE_COMPRESSION_SLOPE;
}

function isPathimon(monster: RuntimeMonster): boolean {
  return !monster.isBoss && !monster.isTrainer;
}

function resolveStat(monster: RuntimeMonster, stat: 'attack' | 'defense'): number {
  const pct = monster.effects
    .filter((effect) => effect.kind === 'buff' && effect.stat === stat)
    .reduce((total, effect) => total + (effect.pct ?? 0), 0);

  const conditionMultiplier = stat === 'attack' ? attackStatMultiplier(monster) : defenseStatMultiplier(monster);
  const base = stat === 'defense' && isPathimon(monster) ? compressedDefense(monster.defense) : monster[stat];
  return Math.max(1, Math.round(base * (1 + pct / 100) * conditionMultiplier));
}

export function calculateDamage(
  attacker: RuntimeMonster,
  defender: RuntimeMonster,
  move: MoveData,
  variance = 1,
  multiplierOverride?: MultiplierResult,
  critical = false,
): DamageResult {
  const multiplier = multiplierOverride ?? calculateMultiplier(move, attacker, defender);
  const blockedByInvulnerability = isInvulnerable(defender);

  if (move.power === 0 || multiplier.total === 0 || blockedByInvulnerability) {
    return {
      damage: 0,
      multiplier,
      blockedByInvulnerability,
      critical: false,
    };
  }

  const baseDamage = move.power * (resolveStat(attacker, 'attack') / resolveStat(defender, 'defense'));
  const criticalMultiplier = critical ? CRITICAL_DAMAGE_MULTIPLIER : 1;
  const totalDamage = baseDamage
    * multiplier.total
    * getIncomingFactor(defender)
    * directDamageMultiplier(defender)
    * variance
    * criticalMultiplier;

  return {
    damage: Math.max(1, Math.round(totalDamage)),
    multiplier,
    blockedByInvulnerability,
    critical,
  };
}

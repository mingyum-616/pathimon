import type { RuntimeMonster } from '../types/game';

export type CaptureResult =
  | { kind: 'blocked'; capsules: number }
  | { kind: 'noCapsules'; capsules: number }
  | { kind: 'captured'; capsules: number; chance: number }
  | { kind: 'missed'; capsules: number; chance: number };

export function captureChance(enemy: RuntimeMonster): number {
  const hpLoss = (enemy.maxHp - enemy.hp) / enemy.maxHp;
  return Math.min(0.95, enemy.captureRate + hpLoss * 0.4);
}

export function rollsCapture(enemy: RuntimeMonster, roll: number): boolean {
  return roll <= captureChance(enemy);
}

export function tryCapture(enemy: RuntimeMonster, capsules: number, roll: number): CaptureResult {
  if (enemy.isBoss || enemy.isTrainer) {
    return { kind: 'blocked', capsules };
  }

  if (capsules <= 0) {
    return { kind: 'noCapsules', capsules };
  }

  const chance = captureChance(enemy);
  const remainingCapsules = capsules - 1;

  if (roll <= chance) {
    return { kind: 'captured', capsules: remainingCapsules, chance };
  }

  return { kind: 'missed', capsules: remainingCapsules, chance };
}

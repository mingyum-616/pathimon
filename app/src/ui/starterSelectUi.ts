import type { MonsterData } from '../types/game';

export const MAX_STARTER_SELECTIONS = 1;

export interface StarterSelectCopy {
  prompt: string;
  selectedLabel: string;
  startLabel: string;
}

export interface StarterCapsuleSlot {
  markerY: number;
  x: number;
  y: number;
}

export interface StarterChoiceSummary {
  lines: string[];
  title: string;
}

export interface StarterSlotVisual {
  capsuleSize: number;
  spriteSize: number;
}

export function starterSelectCopy(): StarterSelectCopy {
  return {
    prompt: '함께할 패시몬을 선택해주세요',
    selectedLabel: '선택한 패시몬',
    startLabel: '이 파티로 시작',
  };
}

export function pickStarterCandidates(monsters: MonsterData[], rolls: number[]): MonsterData[] {
  const uniqueMonsters = monsters.filter((monster, index) => monsters.findIndex((candidate) => candidate.id === monster.id) === index);
  if (uniqueMonsters.length === 0) return [];

  if (rolls.length === 0) return uniqueMonsters.slice(0, 3);

  const remaining = [...uniqueMonsters];
  const picks: MonsterData[] = [];
  for (let index = 0; index < 3 && remaining.length > 0; index += 1) {
    const roll = rolls[index] ?? Math.random();
    const monsterIndex = Math.min(remaining.length - 1, Math.max(0, Math.floor(roll * remaining.length)));
    const [monster] = remaining.splice(monsterIndex, 1);
    picks.push(monster);
  }

  return picks;
}

export function starterCandidateRolls(random: () => number = Math.random): number[] {
  return Array.from({ length: 3 }, () => random());
}

export function starterCapsuleSlots(): StarterCapsuleSlot[] {
  // 세 슬롯의 y를 맞춘다. 가운데만 20px 낮으면 정렬 실수처럼 보인다.
  return [
    { x: 356, y: 248, markerY: 206 },
    { x: 512, y: 248, markerY: 206 },
    { x: 668, y: 248, markerY: 206 },
  ];
}

export function starterSlotVisual(focused: boolean, selected: boolean): StarterSlotVisual {
  return {
    capsuleSize: focused ? 58 : selected ? 56 : 52,
    spriteSize: focused ? 106 : selected ? 104 : 96,
  };
}

export function starterChoiceSummary(monster: MonsterData): StarterChoiceSummary {
  return {
    title: monster.name,
    lines: [
      monster.scientificName,
      `계열: ${monster.category}`,
      `HP ${monster.maxHp} · 공격 ${monster.attack} · 방어 ${monster.defense}`,
    ],
  };
}

export function addStarterSelection(_selectedIds: string[], starterId: string): string[] {
  return [starterId];
}

export function canStartWithStarterSelection(selectedIds: string[]): boolean {
  return selectedIds.length === MAX_STARTER_SELECTIONS;
}

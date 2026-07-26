import type { RuntimeMonster, StatusConditionId } from '../types/game';

export interface StatusConditionData {
  effect: string;
  id: StatusConditionId;
  label: string;
}

export const STATUS_CONDITION_IDS: StatusConditionId[] = [
  'fever',
  'dehydration',
  'fatigue',
  'vomiting',
  'excretory_dysfunction',
  'cough',
  'blood_pressure',
  'dyspnea',
  'edema',
  'neurologic',
  'paralysis',
  'bleeding',
  'anemia',
  'immune_abnormal',
  'necrosis',
  'blindness',
  'hearing_abnormal',
  'pain',
  'itching',
  'jaundice',
];

// 효과는 claudecode/VOCAB.md §3과 1:1로 맞춘다. 계열은 도트 / 능력치 / 명중 / 행동 / 회복 / 메타 여섯이다.
export const STATUS_CONDITIONS: Record<StatusConditionId, StatusConditionData> = {
  fever: { id: 'fever', label: '발열', effect: '매 턴 최대 체력 2% 피해' },
  dehydration: { id: 'dehydration', label: '탈수', effect: '체력 회복량 12.5% 감소' },
  fatigue: { id: 'fatigue', label: '피로', effect: '공격력 5% 감소' },
  vomiting: { id: 'vomiting', label: '구토', effect: '행동 실패 확률 4% 증가' },
  excretory_dysfunction: { id: 'excretory_dysfunction', label: '배설 이상', effect: '매 턴 최대 체력 1% 피해, 턴 종료 시 20% 확률로 탈수 1스택 추가' },
  cough: { id: 'cough', label: '기침', effect: '공격할 때마다 현재 체력 2% 피해' },
  blood_pressure: { id: 'blood_pressure', label: '혈압 이상', effect: '방어력 7.5% 감소, 상태이상으로 받는 피해 5% 증가' },
  dyspnea: { id: 'dyspnea', label: '호흡 곤란', effect: '받는 직접 피해 5% 증가, 즉사 확률 0.5% 증가' },
  edema: { id: 'edema', label: '부종', effect: '모든 상태이상의 확률 1%p 증가' },
  neurologic: { id: 'neurologic', label: '신경 이상', effect: '혼란 확률 5%p 증가' },
  paralysis: { id: 'paralysis', label: '마비', effect: '행동 불가 확률 5% 증가' },
  bleeding: { id: 'bleeding', label: '출혈', effect: '매 턴 현재 체력 2% 피해' },
  anemia: { id: 'anemia', label: '빈혈', effect: '매 턴 최대 체력 1% 피해' },
  immune_abnormal: { id: 'immune_abnormal', label: '면역 이상', effect: '4스택마다 방어 특성 1개 무력화' },
  necrosis: { id: 'necrosis', label: '괴사', effect: '최대 체력 상한 2.5% 감소' },
  blindness: { id: 'blindness', label: '시력 이상', effect: '명중률 10% 감소' },
  hearing_abnormal: { id: 'hearing_abnormal', label: '청력 이상', effect: '명중률 5% 감소' },
  pain: { id: 'pain', label: '통증', effect: '방어력 5% 감소' },
  itching: { id: 'itching', label: '가려움', effect: '행동 실패 확률 2.5% 증가' },
  jaundice: { id: 'jaundice', label: '황달', effect: '체력 회복량 7.5% 감소' },
};

function formatPercent(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function cappedPercent(value: number, maximum = 100): string {
  return formatPercent(Math.min(maximum, value));
}

export function statusConditionEffectText(id: StatusConditionId, stacks = 1): string {
  const count = Math.max(1, stacks);

  switch (id) {
    case 'fever':
      return `매 턴 최대 체력 ${formatPercent(count * 2)}% 피해`;
    case 'dehydration':
      return `체력 회복량 ${cappedPercent(count * 12.5)}% 감소`;
    case 'fatigue':
      return `공격력 ${cappedPercent(count * 5, 90)}% 감소`;
    case 'vomiting':
      return `행동 실패 확률 ${cappedPercent(count * 4)}% 증가`;
    case 'excretory_dysfunction':
      return `매 턴 최대 체력 ${formatPercent(count)}% 피해, 턴 종료 시 ${cappedPercent(count * 20)}% 확률로 탈수 1스택 추가`;
    case 'cough':
      return `공격할 때마다 현재 체력 ${cappedPercent(count * 2)}% 피해`;
    case 'blood_pressure':
      return `방어력 ${cappedPercent(count * 7.5, 90)}% 감소, 상태이상으로 받는 피해 ${formatPercent(count * 5)}% 증가`;
    case 'dyspnea':
      return `받는 직접 피해 ${formatPercent(count * 5)}% 증가, 즉사 확률 ${cappedPercent(count * 0.5)}% 증가`;
    case 'edema':
      return `모든 상태이상의 확률 ${formatPercent(count)}%p 증가`;
    case 'neurologic':
      return `혼란 확률 ${cappedPercent(count * 5)}%p 증가`;
    case 'paralysis':
      return `행동 불가 확률 ${cappedPercent(count * 5)}% 증가`;
    case 'bleeding':
      return `매 턴 현재 체력 ${cappedPercent(count * 2)}% 피해`;
    case 'anemia':
      return `매 턴 최대 체력 ${cappedPercent(count)}% 피해`;
    case 'immune_abnormal': {
      const disabledCount = Math.floor(count / 4);
      return disabledCount > 0
        ? `방어 특성 ${disabledCount}개 무력화`
        : '방어 특성 무력화 없음 (4스택마다 1개)';
    }
    case 'necrosis':
      return `최대 체력 상한 ${formatPercent(Math.min(99, count * 2.5))}% 감소`;
    case 'blindness':
      return `명중률 ${cappedPercent(count * 10)}% 감소`;
    case 'hearing_abnormal':
      return `명중률 ${cappedPercent(count * 5)}% 감소`;
    case 'pain':
      return `방어력 ${cappedPercent(count * 5, 90)}% 감소`;
    case 'itching':
      return `행동 실패 확률 ${cappedPercent(count * 2.5)}% 증가`;
    case 'jaundice':
      return `체력 회복량 ${cappedPercent(count * 7.5)}% 감소`;
  }
}

function clampChance(chance: number): number {
  return Math.max(0, Math.min(1, chance));
}

export function statusConditionStacks(monster: RuntimeMonster, id: StatusConditionId): number {
  return monster.statusConditions?.[id] ?? 0;
}

export function hasStatusConditions(monster: RuntimeMonster): boolean {
  return STATUS_CONDITION_IDS.some((id) => statusConditionStacks(monster, id) > 0);
}

// 상태이상 도트는 최대 체력 %로 들어가서 적 HP와 무관하게 누적된다.
// 상한이 없으면 전투가 길어질수록 도트가 기술 위력을 완전히 덮어써서 기술 선택이 무의미해진다.
// 5스택에서 끊으면 발열 단독 최대 10%/턴이라 누적 전략은 살아 있고, 폭주는 막힌다.
export const MAX_STATUS_CONDITION_STACKS = 5;

export function isStatusConditionAtMaxStacks(monster: RuntimeMonster, id: StatusConditionId): boolean {
  return statusConditionStacks(monster, id) >= MAX_STATUS_CONDITION_STACKS;
}

export function addStatusCondition(monster: RuntimeMonster, id: StatusConditionId, stacks = 1): void {
  if (stacks <= 0) {
    return;
  }

  monster.statusConditions = {
    ...(monster.statusConditions ?? {}),
    [id]: Math.min(MAX_STATUS_CONDITION_STACKS, statusConditionStacks(monster, id) + stacks),
  };

  clampHpToEffectiveMax(monster);
}

export function statusConditionStackLabel(id: StatusConditionId, stacks: number): string {
  const label = STATUS_CONDITIONS[id].label;
  if (stacks <= 1) return label;
  return stacks >= MAX_STATUS_CONDITION_STACKS ? `${label}(${stacks}) MAX` : `${label}(${stacks})`;
}

export function statusConditionLabels(monster: RuntimeMonster): string[] {
  return STATUS_CONDITION_IDS
    .map((id) => {
      const stacks = statusConditionStacks(monster, id);
      if (stacks <= 0) return undefined;
      return statusConditionStackLabel(id, stacks);
    })
    .filter((label): label is string => Boolean(label));
}

export function effectiveMaxHp(monster: RuntimeMonster): number {
  const necrosisStacks = statusConditionStacks(monster, 'necrosis');
  return Math.max(1, Math.floor(monster.maxHp * Math.max(0.01, 1 - necrosisStacks * 0.025)));
}

export function clampHpToEffectiveMax(monster: RuntimeMonster): void {
  monster.hp = Math.max(0, Math.min(effectiveMaxHp(monster), monster.hp));
  monster.fainted = monster.hp <= 0;
}

// 저산소는 예비력을 없애 같은 공격도 더 아프게 만든다.
export function directDamageMultiplier(monster: RuntimeMonster): number {
  return 1 + statusConditionStacks(monster, 'dyspnea') * 0.05;
}

export function statusDamageMultiplier(monster: RuntimeMonster): number {
  return 1 + statusConditionStacks(monster, 'blood_pressure') * 0.05;
}

export function attackStatMultiplier(monster: RuntimeMonster): number {
  return Math.max(0.1, 1 - statusConditionStacks(monster, 'fatigue') * 0.05);
}

// 통증은 버티지 못하게 하고, 혈압 이상(쇼크)은 관류를 떨어뜨려 더 크게 깎는다.
export function defenseStatMultiplier(monster: RuntimeMonster): number {
  return Math.max(
    0.1,
    1 - statusConditionStacks(monster, 'pain') * 0.05 - statusConditionStacks(monster, 'blood_pressure') * 0.075,
  );
}

export function healingMultiplier(monster: RuntimeMonster): number {
  return Math.max(
    0,
    1 - statusConditionStacks(monster, 'dehydration') * 0.125 - statusConditionStacks(monster, 'jaundice') * 0.075,
  );
}

// 마비는 행동 불가, 구토와 가려움은 행동 실패다. 셋 다 그 턴을 통째로 날린다.
export function actionFailureChance(monster: RuntimeMonster): number {
  return clampChance(
    statusConditionStacks(monster, 'paralysis') * 0.05
    + statusConditionStacks(monster, 'vomiting') * 0.04
    + statusConditionStacks(monster, 'itching') * 0.025,
  );
}

export function actionFailureLabel(monster: RuntimeMonster): string {
  if (statusConditionStacks(monster, 'paralysis') > 0) return '마비';
  if (statusConditionStacks(monster, 'vomiting') > 0) return '구토';
  return '가려움';
}

// 시력 상실이 청력 상실보다 명중에 더 치명적이다.
export function accuracyMultiplier(monster: RuntimeMonster): number {
  return Math.max(
    0,
    1 - statusConditionStacks(monster, 'blindness') * 0.10 - statusConditionStacks(monster, 'hearing_abnormal') * 0.05,
  );
}

export function statusChanceBonus(monster: RuntimeMonster, status?: 'confusion' | 'stun'): number {
  let bonus = statusConditionStacks(monster, 'edema') * 0.01;
  if (status === 'confusion') bonus += statusConditionStacks(monster, 'neurologic') * 0.05;
  return bonus;
}

export function adjustedStatusChance(monster: RuntimeMonster, baseChance: number, status?: 'confusion' | 'stun'): number {
  return clampChance(baseChance + statusChanceBonus(monster, status));
}

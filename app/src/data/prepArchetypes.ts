import type { AbilityId, EffectPrimitive, MonsterData } from '../types/game';

// 준비기 아키타입 — 패시몬 특성별 메리트. 준비기 이름/서술(감염경로)은 그대로 두고 이 효과만 주입한다.
// 설계: docs/pathimon-prep-archetypes-plan-2026-07-24.md
export type PrepArchetypeId =
  | 'toxin_forge' // 독소벼림
  | 'dormant_burst' // 휴면버스트
  | 'latent_recovery' // 잠복회복
  | 'barrier' // 방벽전개
  | 'proliferation' // 폭발증식
  | 'large_resist' // 대형저항
  | 'invasive' // 침습
  | 'basic'; // 준비(기본)

// 랭크 1.5배 스케일: 1랭크=+50%, 2랭크=+125%.
const RANK1 = 50;
const RANK2 = 125;

export const PREP_ARCHETYPE_EFFECTS: Record<PrepArchetypeId, EffectPrimitive[]> = {
  // 독소벼림: 다음 상태이상 스택 2배 + 공격 +1랭크.
  toxin_forge: [
    { kind: 'empower_status', multiplier: 2, turns: 99, target: 'self' },
    { kind: 'buff', stat: 'attack', rank: 1, pct: RANK1, turns: 99, target: 'self' },
  ],
  // 휴면버스트: 1턴 무적(준비 중 피격 회피) → 다음 공격 증폭(2턴짜리 강한 단발 버프).
  dormant_burst: [
    { kind: 'invuln', turns: 1, target: 'self' },
    { kind: 'buff', stat: 'attack', rank: 2, pct: RANK2, turns: 2, target: 'self' },
  ],
  // 잠복회복: HP 최대 회복 + 적 면역 이상 1스택.
  latent_recovery: [
    { kind: 'heal', pct: 100, target: 'self' },
    { kind: 'condition', condition: 'immune_abnormal', chance: 1, target: 'enemy', stacks: 1 },
  ],
  // 방벽전개: 방어 +1랭크 + 받는 피해 감소 2턴.
  barrier: [
    { kind: 'buff', stat: 'defense', rank: 1, pct: RANK1, turns: 99, target: 'self' },
    { kind: 'field', side: 'incoming', factor: 0.6, turns: 2, target: 'self' },
  ],
  // 폭발증식: 공격 +2랭크.
  proliferation: [
    { kind: 'buff', stat: 'attack', rank: 2, pct: RANK2, turns: 99, target: 'self' },
  ],
  // 대형저항: 방어 +1랭크 + 조직손상 도트(적).
  large_resist: [
    { kind: 'buff', stat: 'defense', rank: 1, pct: RANK1, turns: 99, target: 'self' },
    { kind: 'dot', power: 8, turns: 2, target: 'enemy' },
  ],
  // 침습: 공격 +1랭크 + 방어 +1랭크.
  invasive: [
    { kind: 'buff', stat: 'attack', rank: 1, pct: RANK1, turns: 99, target: 'self' },
    { kind: 'buff', stat: 'defense', rank: 1, pct: RANK1, turns: 99, target: 'self' },
  ],
  // 준비(기본): 공격 +1랭크.
  basic: [
    { kind: 'buff', stat: 'attack', rank: 1, pct: RANK1, turns: 99, target: 'self' },
  ],
};

// 준비기 메리트를 이동 정보창에 노출하는 요약 문구(effectText). 이름/서술(감염경로)은 그대로 두고 이것만 얹는다.
export const PREP_ARCHETYPE_EFFECT_TEXT: Record<PrepArchetypeId, string> = {
  toxin_forge: '다음 공격의 상태이상 2배 + 공격력 상승 (전투당 1회)',
  dormant_burst: '1턴 무적 후 다음 공격 강화 (전투당 1회)',
  latent_recovery: '체력 최대 회복 + 상대 면역 이상 (전투당 1회)',
  barrier: '방어력 상승 + 2턴간 받는 피해 감소 (전투당 1회)',
  proliferation: '공격력 크게 상승 (전투당 1회)',
  large_resist: '방어력 상승 + 상대 지속 피해 (전투당 1회)',
  invasive: '공격력·방어력 상승 (전투당 1회)',
  basic: '공격력 상승 (전투당 1회)',
};

const PARASITE_CATEGORIES = ['연충', '선충', '흡충', '조충', '기생충'];
const INVASIVE_LOCATIONS = new Set([
  'intracellular',
  'intracellular_cytosol',
  'intracellular_phagosome',
  'tissue_invasive',
  'vascular',
  'erythrocyte',
]);

// 노트 기술 타입 중 "진짜 독소"만 독소벼림 트리거. 효소(전파 인자)는 제외한다 — 파서가 효소도 AttackType 'toxin'으로
// 뭉개기 때문에 AttackType이 아니라 노트 원문 타입(독소·초항원·효소독소·신경)으로 판정한다(pathimonNoteData.ts).
// 신경(neurotoxin)은 보툴리눔·파상풍에는 독소지만 기생충의 신경 증상에도 쓰여, 기생충은 아래에서 별도 제외한다.
export const TOXIN_NOTE_MOVE_TYPES = ['독소', '초항원', '효소독소', '신경'];

function monsterAbilities(monster: MonsterData): AbilityId[] {
  return monster.abilities?.length ? monster.abilities : [monster.ability];
}

// 우선순위(위→아래): 독소 > 휴면 > 잠복 > 방벽 > 증식 > 대형 > 침습 > 기본.
// isToxinProducer = 노트에 진짜 독소 기술이 있는지(호출측이 원문에서 판정). 기생충은 독소벼림에서 제외한다.
export function assignPrepArchetype(monster: MonsterData, opts: { isToxinProducer: boolean }): PrepArchetypeId {
  const abilities = monsterAbilities(monster);
  const has = (ability: AbilityId): boolean => abilities.includes(ability);
  const isParasite = PARASITE_CATEGORIES.includes(monster.category);

  if (opts.isToxinProducer && !isParasite) return 'toxin_forge';
  if (has('spore') || has('cyst')) return 'dormant_burst';
  if (has('latency') || has('antigen_var')) return 'latent_recovery';
  if (has('capsule') || has('biofilm')) return 'barrier';
  if (has('autoinfection')) return 'proliferation';
  if (isParasite) return 'large_resist';
  if (monster.tags.location && INVASIVE_LOCATIONS.has(monster.tags.location)) return 'invasive';
  return 'basic';
}

import type { MonsterData } from '../types/game';
import { NOTE_EVOLUTION_MONSTERS, NOTE_MONSTERS } from './pathimonNoteData';

export const STARTER_ID = 'anthrax';
export const TOTAL_FLOORS = 100;

// Legacy representatives stay as reference data until their pathimon notes are added.
export const LEGACY_REPRESENTATIVE_MONSTERS: MonsterData[] = [
  {
    id: 'influenza',
    name: '플루리온',
    scientificName: '인플루엔자 바이러스 (Influenza virus)',
    category: '바이러스',
    glyph: 'FLU',
    tags: {
      pathway: 'respiratory',
      wall: 'enveloped_virus',
      location: 'intracellular_cytosol',
      size: 'microscopic',
    },
    maxHp: 42,
    attack: 11,
    defense: 3,
    speed: 12,
    captureRate: 0.5,
    ability: 'antigen_var',
    learnset: ['influenza_attach', 'cpe', 'enterotoxin', 'hyaluronidase'],
    prep: 'influenza_attach',
    signature: 'influenza_spread',
  },
  {
    id: 'hiv',
    name: '레트로잠',
    scientificName: '인간면역결핍바이러스 (Human immunodeficiency virus)',
    category: '바이러스',
    glyph: 'HIV',
    tags: {
      pathway: 'sexual',
      wall: 'retrovirus',
      location: 'intracellular_cytosol',
      size: 'microscopic',
    },
    maxHp: 48,
    attack: 10,
    defense: 5,
    speed: 7,
    captureRate: 0.42,
    ability: 'antigen_var',
    abilities: ['antigen_var', 'latency'],
    learnset: ['hiv_gp120', 'cpe', 'enterotoxin', 'coagulase'],
    prep: 'hiv_gp120',
    signature: 'hiv_cd4',
  },
  {
    id: 'cholera',
    name: '콜렁방울',
    scientificName: '콜레라균 (Vibrio cholerae)',
    category: '세균',
    glyph: 'CHO',
    tags: {
      pathway: 'gut',
      wall: 'gram_negative',
      location: 'extracellular',
      size: 'microscopic',
    },
    maxHp: 40,
    attack: 12,
    defense: 3,
    speed: 11,
    captureRate: 0.55,
    ability: 'none',
    learnset: ['cholera_attach', 'flood', 'enterotoxin', 'hyaluronidase'],
    prep: 'cholera_attach',
    signature: 'cholera_toxin',
  },
  {
    id: 'tb',
    name: '폐잠복',
    scientificName: '결핵균 (Mycobacterium tuberculosis)',
    category: '세균',
    glyph: 'TB',
    tags: {
      pathway: 'respiratory',
      wall: 'mycobacterial',
      location: 'intracellular_phagosome',
      oxygen: 'aerobic',
      size: 'microscopic',
    },
    maxHp: 56,
    attack: 8,
    defense: 6,
    speed: 4,
    captureRate: 0.4,
    ability: 'phagolysosome_block',
    abilities: ['phagolysosome_block', 'oxidative_neutral'],
    learnset: ['tb_macrophage_entry', 'cpe', 'coagulase', 'hyaluronidase'],
    prep: 'tb_macrophage_entry',
    signature: 'tb_chronic',
  },
  {
    id: 'candida',
    name: '백태디아',
    scientificName: '칸디다 알비칸스 (Candida albicans)',
    category: '진균',
    glyph: 'CAN',
    tags: {
      pathway: 'mucosal',
      wall: 'fungal_dimorphic',
      location: 'extracellular',
      reservoir: 'microbiota',
      size: 'microscopic',
    },
    maxHp: 46,
    attack: 10,
    defense: 5,
    speed: 6,
    captureRate: 0.46,
    ability: 'biofilm',
    learnset: ['candida_switch', 'hyaluronidase', 'coagulase', 'alpha_toxin'],
    prep: 'candida_switch',
    signature: 'candida_hypha',
  },
  {
    id: 'aspergillus',
    name: '포자길루',
    scientificName: '아스페르길루스 푸미가투스 (Aspergillus fumigatus)',
    category: '진균',
    glyph: 'ASP',
    tags: {
      pathway: 'respiratory',
      wall: 'fungal_hypha',
      location: 'extracellular',
      reservoir: 'environment',
      size: 'microscopic',
    },
    maxHp: 48,
    attack: 12,
    defense: 4,
    speed: 7,
    captureRate: 0.43,
    ability: 'oxidative_neutral',
    learnset: ['aspergillus_germination', 'candida_hypha', 'alpha_toxin', 'hyaluronidase'],
    prep: 'aspergillus_germination',
    signature: 'aspergillus_angio',
  },
  {
    id: 'malaria',
    name: '말라리듬',
    scientificName: '열대열원충 (Plasmodium falciparum)',
    category: '원충',
    glyph: 'MAL',
    tags: {
      pathway: 'blood',
      wall: 'protozoa',
      location: 'erythrocyte',
      vector: 'mosquito',
      size: 'microscopic',
    },
    maxHp: 50,
    attack: 12,
    defense: 4,
    speed: 8,
    captureRate: 0.38,
    ability: 'antigen_var',
    learnset: ['malaria_invasion', 'enterotoxin', 'coagulase', 'cpe'],
    prep: 'malaria_invasion',
    signature: 'malaria_burst',
  },
  {
    id: 'entamoeba',
    name: '아메바이트',
    scientificName: '이질아메바 (Entamoeba histolytica)',
    category: '원충',
    glyph: 'AMO',
    tags: {
      pathway: 'gut',
      wall: 'protozoa',
      location: 'tissue_invasive',
      size: 'microscopic',
    },
    maxHp: 45,
    attack: 12,
    defense: 4,
    speed: 7,
    captureRate: 0.48,
    ability: 'immune_cell_kill',
    learnset: ['amoeba_attach', 'hyaluronidase', 'alpha_toxin', 'enterotoxin'],
    prep: 'amoeba_attach',
    signature: 'amoeba_lysis',
  },
  {
    id: 'ascaris',
    name: '회충루프',
    scientificName: '회충 (Ascaris lumbricoides)',
    category: '연충',
    glyph: 'ASC',
    tags: {
      pathway: 'gut',
      wall: 'nematode',
      location: 'intestinal_lumen',
      size: 'large',
      stage: 'larva_adult',
    },
    maxHp: 62,
    attack: 9,
    defense: 7,
    speed: 4,
    captureRate: 0.34,
    ability: 'large_resistance',
    learnset: ['ascaris_migration', 'coagulase', 'hyaluronidase', 'cpe'],
    prep: 'ascaris_migration',
    signature: 'ascaris_obstruction',
  },
  {
    id: 'schistosoma',
    name: '혈흡충돌',
    scientificName: '주혈흡충 (Schistosoma haematobium)',
    category: '연충',
    glyph: 'SCH',
    tags: {
      pathway: 'transcutaneous',
      wall: 'trematode',
      location: 'vascular',
      vector: 'freshwater_snail',
      size: 'large',
    },
    maxHp: 58,
    attack: 9,
    defense: 8,
    speed: 5,
    captureRate: 0.32,
    ability: 'antigen_disguise',
    abilities: ['antigen_disguise', 'large_resistance'],
    learnset: ['schisto_disguise', 'coagulase', 'enterotoxin', 'cpe'],
    prep: 'schisto_disguise',
    signature: 'schisto_granuloma',
  },
  {
    id: 'anthrax',
    name: '탄저록스',
    scientificName: '탄저균 (Bacillus anthracis)',
    category: '세균',
    glyph: 'ANT',
    tags: {
      pathway: 'wound',
      wall: 'gram_positive',
      location: 'extracellular',
      size: 'microscopic',
    },
    maxHp: 52,
    attack: 12,
    defense: 5,
    speed: 5,
    captureRate: 0.36,
    ability: 'spore',
    abilities: ['spore', 'capsule'],
    learnset: ['spore_germination', 'anthrax_toxin'],
    prep: 'spore_germination',
    signature: 'capsule_formation',
  },
];

export const MONSTERS: MonsterData[] = [...NOTE_MONSTERS, ...NOTE_EVOLUTION_MONSTERS];

type RandomSource = () => number;

function uniqueById(monsters: MonsterData[]): MonsterData[] {
  const seen = new Set<string>();
  return monsters.filter((monster) => {
    if (seen.has(monster.id)) return false;
    seen.add(monster.id);
    return true;
  });
}

function newestNoteMonstersFirst(): MonsterData[] {
  return [...NOTE_MONSTERS].reverse();
}

function wildRosterType(monster: MonsterData): string {
  if (['연충', '선충', '흡충', '조충', '기생충'].includes(monster.category)) {
    return '기생충';
  }

  if (['원충', '원생동물', '프로토조아'].includes(monster.category)) {
    return '원생동물';
  }

  return monster.category;
}

export function monsterBaseStatTotal(monster: MonsterData): number {
  return monster.maxHp + monster.attack + monster.defense;
}

export function wildEncounterRoster(): MonsterData[] {
  return uniqueById(newestNoteMonstersFirst());
}

export const WILD_ENCOUNTER_SIGMA = 10;
export const WILD_ENCOUNTER_MIN_WEIGHT = 0.001;
export const WILD_ENCOUNTER_REPEAT_PENALTY = 0.3;
const MAX_SAME_WILD_TYPE_RUN = 2;

export function sortedWildEncounterRoster(
  monsters: MonsterData[] = wildEncounterRoster(),
): MonsterData[] {
  return [...monsters].sort((left, right) => (
    monsterBaseStatTotal(left) - monsterBaseStatTotal(right)
    || left.id.localeCompare(right.id)
  ));
}

export function wildEncounterTargetStat(
  monsters: MonsterData[],
  floor: number,
  totalFloors = TOTAL_FLOORS,
): number {
  const sorted = sortedWildEncounterRoster(monsters);
  if (sorted.length === 0) {
    throw new Error('wild encounter roster is empty');
  }
  if (sorted.length === 1 || totalFloors <= 1) {
    return monsterBaseStatTotal(sorted[0]);
  }

  const progress = Math.min(1, Math.max(0, (floor - 1) / (totalFloors - 1)));
  const position = progress * (sorted.length - 1);
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.min(sorted.length - 1, lowerIndex + 1);
  const fraction = position - lowerIndex;
  const lowerTotal = monsterBaseStatTotal(sorted[lowerIndex]);
  const upperTotal = monsterBaseStatTotal(sorted[upperIndex]);

  return lowerTotal + (upperTotal - lowerTotal) * fraction;
}

export function wildEncounterWeight(
  monster: MonsterData,
  targetStat: number,
  appearanceCount: number,
): number {
  const distance = (monsterBaseStatTotal(monster) - targetStat) / WILD_ENCOUNTER_SIGMA;
  const normalWeight = Math.exp(-0.5 * distance * distance);
  const baseWeight = Math.max(WILD_ENCOUNTER_MIN_WEIGHT, normalWeight);
  const repeatCount = Math.max(0, Math.floor(appearanceCount));

  return baseWeight * WILD_ENCOUNTER_REPEAT_PENALTY ** repeatCount;
}

function withoutThirdSameType(
  monsters: MonsterData[],
  recentMonsterIds: string[],
): MonsterData[] {
  const recent = recentMonsterIds
    .slice(-MAX_SAME_WILD_TYPE_RUN)
    .map((id) => monsters.find((monster) => monster.id === id))
    .filter((monster): monster is MonsterData => Boolean(monster));
  if (
    recent.length < MAX_SAME_WILD_TYPE_RUN
    || !recent.every((monster) => wildRosterType(monster) === wildRosterType(recent[0]))
  ) {
    return monsters;
  }

  const blockedType = wildRosterType(recent[0]);
  const alternatives = monsters.filter((monster) => wildRosterType(monster) !== blockedType);
  return alternatives.length > 0 ? alternatives : monsters;
}

export function selectWeightedWildMonster(
  monsters: MonsterData[],
  floor: number,
  appearanceCounts: Record<string, number> = {},
  recentMonsterIds: string[] = [],
  random: RandomSource = Math.random,
): MonsterData {
  const sorted = sortedWildEncounterRoster(monsters);
  if (sorted.length === 0) {
    throw new Error('wild encounter roster is empty');
  }

  const targetStat = wildEncounterTargetStat(sorted, floor);
  const candidates = withoutThirdSameType(sorted, recentMonsterIds);
  const weighted = candidates.map((monster) => ({
    monster,
    weight: wildEncounterWeight(monster, targetStat, appearanceCounts[monster.id] ?? 0),
  }));
  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.min(0.999999999999, Math.max(0, random())) * totalWeight;

  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll < 0) return entry.monster;
  }

  return weighted[weighted.length - 1].monster;
}

export function starterCandidateRoster(): MonsterData[] {
  const starter = MONSTERS.find((monster) => monster.id === STARTER_ID);
  const noteCandidates = newestNoteMonstersFirst().filter((monster) => monster.id !== STARTER_ID);
  return uniqueById([
    ...(starter ? [starter] : []),
    ...noteCandidates,
  ]);
}

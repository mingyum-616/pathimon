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

function randomIndex(length: number, random: RandomSource): number {
  return Math.min(length - 1, Math.max(0, Math.floor(random() * length)));
}

function shuffled<T>(items: T[], random: RandomSource): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, random);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
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

function hasBlockedType(output: MonsterData[], type: string, maxSameTypeRun: number): boolean {
  if (maxSameTypeRun <= 0 || output.length < maxSameTypeRun) {
    return false;
  }

  return output.slice(-maxSameTypeRun).every((monster) => wildRosterType(monster) === type);
}

function chooseWeightedBucket(
  buckets: Array<[string, MonsterData[]]>,
  random: RandomSource,
): [string, MonsterData[]] {
  const total = buckets.reduce((sum, [, bucket]) => sum + bucket.length, 0);
  let target = Math.min(total - 1, Math.max(0, Math.floor(random() * total)));

  for (const bucketEntry of buckets) {
    target -= bucketEntry[1].length;
    if (target < 0) {
      return bucketEntry;
    }
  }

  return buckets[buckets.length - 1]!;
}

function distributeByType(
  monsters: MonsterData[],
  random: RandomSource,
  maxSameTypeRun: number,
  precedingTail: MonsterData[] = [],
): MonsterData[] {
  const buckets = new Map<string, MonsterData[]>();

  for (const monster of monsters) {
    const type = wildRosterType(monster);
    buckets.set(type, [...(buckets.get(type) ?? []), monster]);
  }

  for (const [type, bucket] of buckets) {
    buckets.set(type, shuffled(bucket, random));
  }

  // 밴드 경계에서도 같은 계열이 연속하지 않도록 앞 밴드 꼬리를 연속 판정에만 쓰고 결과에는 넣지 않는다.
  const emitted: MonsterData[] = [];
  const runWindow: MonsterData[] = [...precedingTail.slice(-maxSameTypeRun)];
  let remaining = monsters.length;

  while (remaining > 0) {
    const availableBuckets = [...buckets.entries()].filter(([, bucket]) => bucket.length > 0);
    const allowedBuckets = availableBuckets.filter(([type]) => !hasBlockedType(runWindow, type, maxSameTypeRun));
    const candidates = allowedBuckets.length > 0 ? allowedBuckets : availableBuckets;
    const [, bucket] = chooseWeightedBucket(candidates, random);
    const monster = bucket.shift();

    if (monster) {
      emitted.push(monster);
      runWindow.push(monster);
      remaining -= 1;
    }
  }

  return emitted;
}

export function monsterBaseStatTotal(monster: MonsterData): number {
  return monster.maxHp + monster.attack + monster.defense;
}

// 야생 조우는 두 개의 밴드 풀로 갈린다. 완전 정렬이 아니라 **풀만 다르고 순서는 밴드 안에서 무작위**다.
//   1~60층   : 종합 능력치 ~195 이하 풀
//   61~100층 : 종합 능력치 140 이상 풀
// 겹치는 140~195 구간은 양쪽에 나올 수 있어서, 죽고 다시 잡는 흐름이 후반으로 갈수록 자연스럽게 강해진다.
export const LATE_BAND_START_FLOOR = 61;
export const EARLY_BAND_MAX_BST = 195;
export const LATE_BAND_MIN_BST = 140;

function wildFloorCountUpTo(floor: number): number {
  // 5의 배수 층은 트레이너·보스라 야생이 아니다(state/runState.ts encounterKindForFloor).
  return Math.max(0, floor - Math.floor(floor / 5));
}

export function lateBandWildSlotCount(
  totalFloors = TOTAL_FLOORS,
  lateBandStartFloor = LATE_BAND_START_FLOOR,
): number {
  return Math.max(0, wildFloorCountUpTo(totalFloors) - wildFloorCountUpTo(lateBandStartFloor - 1));
}

function splitIntoBands(
  monsters: MonsterData[],
  lateSlots: number,
  random: RandomSource,
): { early: MonsterData[]; late: MonsterData[] } {
  const lateOnly = shuffled(monsters.filter((m) => monsterBaseStatTotal(m) > EARLY_BAND_MAX_BST), random);
  const shared = shuffled(
    monsters.filter((m) => {
      const bst = monsterBaseStatTotal(m);
      return bst >= LATE_BAND_MIN_BST && bst <= EARLY_BAND_MAX_BST;
    }),
    random,
  );
  const earlyOnly = shuffled(monsters.filter((m) => monsterBaseStatTotal(m) < LATE_BAND_MIN_BST), random);

  // 상위 밴드 전용(>195)을 먼저 넣고, 자리가 남으면 공용 구간(140~195)에서 채운다.
  const late = lateOnly.splice(0, lateSlots);
  late.push(...shared.splice(0, Math.max(0, lateSlots - late.length)));

  // 상위 밴드 전용이 슬롯보다 많으면 남는 개체는 하위 밴드로 흘려보낸다(밴드 규칙보다 전 종 등장이 우선).
  const early = [...earlyOnly, ...shared, ...lateOnly];
  late.push(...early.splice(0, Math.max(0, lateSlots - late.length)));

  return { early, late };
}

export function createDistributedWildRoster(
  monsters: MonsterData[],
  random: RandomSource = Math.random,
  maxSameTypeRun = 2,
  lateSlotCount = lateBandWildSlotCount(),
): MonsterData[] {
  const lateSlots = Math.min(monsters.length, Math.max(0, lateSlotCount));
  const { early, late } = splitIntoBands(monsters, lateSlots, random);
  const earlyRoster = distributeByType(early, random, maxSameTypeRun);
  const lateRoster = distributeByType(late, random, maxSameTypeRun, earlyRoster);

  return [...earlyRoster, ...lateRoster];
}

export function wildEncounterRoster(): MonsterData[] {
  return uniqueById(newestNoteMonstersFirst());
}

export function createWildRosterIds(random: RandomSource = Math.random): string[] {
  return createDistributedWildRoster(wildEncounterRoster(), random).map((monster) => monster.id);
}

export function starterCandidateRoster(): MonsterData[] {
  const starter = MONSTERS.find((monster) => monster.id === STARTER_ID);
  const noteCandidates = newestNoteMonstersFirst().filter((monster) => monster.id !== STARTER_ID);
  return uniqueById([
    ...(starter ? [starter] : []),
    ...noteCandidates,
  ]);
}

import type { BossData } from '../types/game';
import { BOSS_ATTACK_MOVE_IDS } from './bossAttackMatchups';
import { BOSS_CHARACTER_ASSETS, assetIdFromPath, characterAssetPathForId } from './characterAssets';

const BOSS_ABILITIES: BossData['abilityPool'] = [
  'epithelial_barrier',
  'mucociliary',
  'gastric_acid',
  'microbiota_defense',
  'iron_limitation',
  'antitoxin',
  'receptor_defect',
  'immune_regulation',
];

const BOSS_MOVES: BossData['movePool'] = BOSS_ATTACK_MOVE_IDS;

export const LATE_GAME_BOSS_IDS: string[] = ['prof_p', 'prof_s', 'prof_k', 'prof_w'];

// 보스·트레이너는 스탯과 기술 위력을 공유하고 트레이너만 HP를 1/4로 줄인다(state/factory.ts).
// v2 테스트 결과 공격력 136은 초반부터 과도해, 기술 위력은 유지하고 공격력을 40으로 낮췄다.
// 방어 8은 플레이어 화력을 방어 6 대비 25% 낮춰 보스 전투를 길게 만든다.
export const BOSS_COMBAT_STATS = {
  attack: 40,
  defense: 8,
} as const;

function bossAssetPath(id: string, index = 0): string {
  return characterAssetPathForId(BOSS_CHARACTER_ASSETS, id)
    ?? BOSS_CHARACTER_ASSETS[index % Math.max(1, BOSS_CHARACTER_ASSETS.length)]
    ?? `images/trainers/boss/${id}.png`;
}

function bossAssetLabel(assetPath: string): string {
  return assetIdFromPath(assetPath)
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function createBoss(
  id: string,
  name: string,
  scientificName: string,
  glyph: string,
  maxHp: number,
  attack: number,
  defense: number,
  symptoms: string[],
): BossData {
  return {
    id,
    name,
    scientificName,
    category: '보스 사람',
    glyph,
    assetPath: bossAssetPath(id),
    maxHp,
    attack,
    defense,
    abilityPool: BOSS_ABILITIES,
    movePool: BOSS_MOVES,
    symptoms,
  };
}

const RAW_BOSSES: BossData[] = [
  {
    id: 'immune_hq',
    name: '면역챔피언',
    scientificName: '수석 면역학자 (Chief Immunologist)',
    category: '보스 사람',
    glyph: 'BOSS',
    assetPath: bossAssetPath('immune_hq'),
    maxHp: 230,
    attack: 15,
    defense: 6,
    abilityPool: BOSS_ABILITIES,
    movePool: BOSS_MOVES,
    symptoms: ['발열', '림프절 부종', '전신 염증 반응'],
  },
  createBoss('red', '최종 방역관', '중앙 방역 지휘관 (Central Quarantine Commander)', 'TOP', 245, 16, 7, [
    '고열',
    '오한',
    '전신 통증',
  ]),
  createBoss('blue', '면역 라이벌', '현장 면역 전략가 (Field Immune Strategist)', 'RIV', 225, 15, 6, [
    '피로감',
    '림프절 반응',
    '염증 상승',
  ]),
  createBoss('giovanni', '격리구역 지휘관', '격리 작전관 (Isolation Operations Lead)', 'CMD', 255, 16, 8, [
    '호흡곤란',
    '흉부 압박감',
    '전신 쇠약',
  ]),
  createBoss('brock', '장벽방어 관장', '상피 장벽 전문가 (Epithelial Barrier Specialist)', 'BRR', 235, 14, 8, [
    '피부 발적',
    '부종',
    '국소 통증',
  ]),
  createBoss('misty', '점막방어 관장', '점막 면역 전문가 (Mucosal Immunity Specialist)', 'MUC', 220, 15, 6, [
    '콧물',
    '기침',
    '인후통',
  ]),
  createBoss('lt_surge', '전기충격 방역관', '급성 염증 대응관 (Acute Inflammation Responder)', 'ELE', 228, 16, 5, [
    '빈맥',
    '떨림',
    '급성 발열',
  ]),
  createBoss('erika', '미생물총 관장', '정상균총 관리자 (Microbiota Steward)', 'BIO', 218, 14, 7, [
    '복부 불편감',
    '장내 균형 변화',
    '식욕 저하',
  ]),
  createBoss('sabrina', '신경면역 관장', '신경면역학자 (Neuroimmunologist)', 'PSY', 222, 17, 5, [
    '두통',
    '혼돈',
    '감각 이상',
  ]),
  createBoss('koga', '독소중화 관장', '독소 중화 전문가 (Toxin Neutralization Specialist)', 'TOX', 226, 16, 6, [
    '구토',
    '복통',
    '혈압 저하',
  ]),
  createBoss('lance', '염증폭풍 사령관', '전신 염증 지휘관 (Systemic Inflammation Commander)', 'STM', 260, 18, 6, [
    '고열',
    '저혈압',
    '다기관 부담',
  ]),
  createBoss('steven', '철분봉쇄 관장', '영양면역 전문가 (Nutritional Immunity Specialist)', 'FE', 238, 15, 8, [
    '빈혈감',
    '피로',
    '대사 스트레스',
  ]),
  createBoss('cynthia', '수석 면역학자', '적응면역 전문가 (Adaptive Immunity Specialist)', 'IMM', 250, 17, 7, [
    '림프절 부종',
    '항체 반응',
    '전신 권태감',
  ]),
  createBoss('iris', '적응면역 챔피언', '기억면역 전문가 (Immune Memory Specialist)', 'ADP', 242, 17, 6, [
    '재노출 반응',
    '빠른 발열',
    '면역 기억 활성',
  ]),
  createBoss('leon', '세계 방역 챔피언', '국제 감염병 대응관 (Global Outbreak Champion)', 'WLD', 265, 18, 7, [
    '전신 염증',
    '호흡 부담',
    '순환 스트레스',
  ]),
  createBoss('volkner', '인터페론 관장', '항바이러스 신호 전문가 (Interferon Signaling Specialist)', 'IFN', 232, 16, 6, [
    '근육통',
    '오한',
    '항바이러스 반응',
  ]),
  createBoss('alder', '노련한 면역원로', '장기 감염 대응 원로 (Veteran Immune Elder)', 'ELD', 248, 17, 7, [
    '만성 피로',
    '림프절 반응',
    '재노출 반응',
  ]),
  createBoss('colress', '사이토카인 설계자', '염증 신호 설계관 (Cytokine Systems Designer)', 'CYK', 236, 18, 5, [
    '사이토카인 상승',
    '발열',
    '혈압 이상',
  ]),
  createBoss('ghetsis', '면역억제 총수', '면역회피 압박관 (Immune Suppression Director)', 'SUP', 268, 18, 7, [
    '면역 이상',
    '전신 쇠약',
    '기회감염 위험',
  ]),
  createBoss('diantha', '항체 여왕', '정밀 항체 전문가 (Precision Antibody Specialist)', 'AB', 244, 17, 6, [
    '항체 반응',
    '점막 부종',
    '빠른 중화 반응',
  ]),
  createBoss('geeta', '총괄 방역위원장', '통합 감염 대응관 (Integrated Response Chair)', 'TOP', 270, 18, 8, [
    '전신 염증',
    '혈압 이상',
    '호흡 부담',
  ]),
  createBoss('cyrus', '세포사멸 설계자', '세포손상 대응관 (Cell Damage Strategist)', 'APO', 240, 17, 6, [
    '괴사',
    '통증',
    '조직 손상',
  ]),
  createBoss('lysandre', '대유행 통제관', '광역 방역 지휘관 (Pandemic Control Lead)', 'PAN', 262, 18, 7, [
    '전파 차단',
    '전신 권태감',
    '격리 스트레스',
  ]),
  createBoss('kukui', '임상시험 교수', '치료 전략 교수 (Therapeutic Strategy Professor)', 'RX', 238, 17, 6, [
    '약물 반응',
    '발열',
    '피로',
  ]),
];

const PROFESSOR_BOSSES: BossData[] = [
  {
    ...createBoss('prof_p', '기생충학 교수 Prof. P', '기생충학 교수 (Professor of Parasitology)', 'P', 258, BOSS_COMBAT_STATS.attack, BOSS_COMBAT_STATS.defense, [
      '기생충 감별',
      '생활사 추적',
      '숙주 반응 관찰',
    ]),
    assetPath: 'images/trainers/boss/prof_p.png',
    fixedAbilities: ['parasite_master'],
    encounterDialogue: ['기생충은 재미있었나요..?', '하하'],
    phase2Dialogue: ['해피.. 알사탕.. 연어회.. 칼국수..'],
  },
  {
    ...createBoss('prof_s', '미생물학 교수 Prof. S', '미생물학 교수 (Professor of Microbiology)', 'S', 250, BOSS_COMBAT_STATS.attack, BOSS_COMBAT_STATS.defense, [
      '배양 관찰',
      '인형 표본',
      '미생물 분류',
    ]),
    assetPath: 'images/trainers/boss/prof_s.png',
    encounterDialogue: ['새로운 인형이니..?'],
    phase2Dialogue: ['One minute...'],
    finalBossSkill: 'seal',
    finalBossSkillName: '봉인',
    finalBossSkillAnnouncement: 'Prof. S는 봉인을 사용한다!',
  },
  {
    ...createBoss('prof_k', '약리학 교수 Prof. K', '약리학 교수 (Professor of Pharmacology)', 'K', 270, BOSS_COMBAT_STATS.attack, BOSS_COMBAT_STATS.defense, [
      '약물 반응 관찰',
      '용량 조절',
      '치료 전략 분석',
    ]),
    assetPath: 'images/trainers/boss/prof_k.png',
  },
  {
    ...createBoss('prof_w', '미생물학 교수 Prof. W', '미생물학 교수 (Professor of Microbiology)', 'W', 246, BOSS_COMBAT_STATS.attack, BOSS_COMBAT_STATS.defense, [
      '신속 배양',
      '감염원 추적',
      '공격적 방역',
    ]),
    assetPath: 'images/trainers/boss/prof_w.png',
  },
];

const RAW_BOSSES_WITH_ASSETS: BossData[] = RAW_BOSSES.map((boss, index) => ({
  ...boss,
  assetPath: bossAssetPath(boss.id, index),
}));

const USED_BOSS_ASSETS = new Set([
  ...RAW_BOSSES_WITH_ASSETS.map((boss) => boss.assetPath),
  ...PROFESSOR_BOSSES.map((boss) => boss.assetPath),
]);

const EXTRA_BOSSES: BossData[] = BOSS_CHARACTER_ASSETS
  .filter((assetPath) => !USED_BOSS_ASSETS.has(assetPath))
  .map((assetPath, index) => ({
    id: assetIdFromPath(assetPath),
    name: `${bossAssetLabel(assetPath)}형 방역 지휘관`,
    scientificName: `현장 면역 대응관 (Immune Response Commander ${index + 1})`,
    category: '보스 사람',
    glyph: 'BOSS',
    assetPath,
    maxHp: 230 + (index % 6) * 8,
    attack: BOSS_COMBAT_STATS.attack,
    defense: BOSS_COMBAT_STATS.defense,
    abilityPool: BOSS_ABILITIES,
    movePool: BOSS_MOVES,
    symptoms: ['전신 염증', '면역 반응', '감염 대응'],
  }));

const REGULAR_BOSSES: BossData[] = [...RAW_BOSSES_WITH_ASSETS, ...EXTRA_BOSSES];

export const BOSSES: BossData[] = [...REGULAR_BOSSES, ...PROFESSOR_BOSSES].map((boss) => ({
  ...boss,
  attack: BOSS_COMBAT_STATS.attack,
  defense: BOSS_COMBAT_STATS.defense,
}));

type RandomSource = () => number;

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

export function createBossRosterIds(random: RandomSource = Math.random, count = 10): string[] {
  const roster: string[] = [];
  let pool: BossData[] = [];
  const lateGameBosses = count >= 10 ? shuffled(PROFESSOR_BOSSES, random) : [];
  const regularCount = Math.max(0, count - lateGameBosses.length);

  while (roster.length < regularCount && REGULAR_BOSSES.length > 0) {
    if (pool.length === 0) {
      pool = shuffled(REGULAR_BOSSES, random);
    }

    const boss = pool.shift();
    if (boss) roster.push(boss.id);
  }

  return [
    ...roster,
    ...lateGameBosses
      .slice(0, Math.max(0, count - roster.length))
      .map((boss) => boss.id),
  ];
}

export function bossIndexById(bossId: string): number | undefined {
  const index = BOSSES.findIndex((boss) => boss.id === bossId);
  return index >= 0 ? index : undefined;
}

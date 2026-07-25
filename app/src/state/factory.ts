import type { AbilityId, BossData, MonsterData, RuntimeMonster, TrainerData } from '../types/game';
import { buildMoveSlots } from '../battle/loadout';
import { BOSSES } from '../data/bosses';
import { TRAINERS } from '../data/trainers';

// 트레이너는 같은 순번 보스 HP의 1/4을 사용한다.
const BOSS_HP_MULTIPLIER = 104;
const TRAINER_BOSS_HP_RATIO = 1 / 4;

interface CreateMonsterOptions {
  defenseTraits?: boolean;
}

export function createMonsterInstance(data: MonsterData, options: CreateMonsterOptions = {}): RuntimeMonster {
  const hasDefenseTraits = options.defenseTraits ?? true;
  // VOCAB.md §2-3 `없음` 노트는 템플릿에 `abilities: []`로 들어온다.
  // 여기서 `[data.ability]`로 되돌리면 런타임만 `['none']`이 되어 템플릿과 어긋난다.
  const abilities = (data.abilities?.length ? data.abilities : [data.ability]).filter((ability) => ability !== 'none');

  const moveSlots = buildMoveSlots(data);

  return {
    templateId: data.id,
    name: data.name,
    scientificName: data.scientificName,
    category: data.category,
    glyph: data.glyph,
    tags: { ...data.tags },
    maxHp: data.maxHp,
    hp: data.maxHp,
    attack: data.attack,
    defense: data.defense,
    speed: data.speed,
    captureRate: data.captureRate,
    assetBaseId: data.assetBaseId,
    ability: hasDefenseTraits ? abilities[0] ?? 'none' : 'none',
    abilities: hasDefenseTraits ? [...abilities] : [],
    moveset: moveSlots.filter((moveId): moveId is NonNullable<typeof moveId> => Boolean(moveId)),
    moveSlots,
    moveStages: {},
    sealedMoveIds: [],
    bossMaintenanceQueued: false,
    plannedMoveIds: [],
    bossPhase2Activated: false,
    profileMemo: data.profileMemo ? [...data.profileMemo] : undefined,
    movePointMap: data.movePointMap,
    captureQuiz: data.captureQuiz ? data.captureQuiz.map((item) => ({ ...item })) : undefined,
    countermeasures: data.countermeasures ? {
      direct: [...data.countermeasures.direct],
      symptomTags: [...data.countermeasures.symptomTags],
    } : undefined,
    effects: [],
    statusConditions: {},
    stunned: false,
    fainted: false,
    isBoss: false,
    symptoms: [],
    symptomAttributions: [],
    signatureUnlocked: false,
    usedSignatureMoveIds: [],
  };
}

function getBoss(index = 0): BossData {
  return BOSSES[index % BOSSES.length];
}

function selectBossAbilities(pool: AbilityId[], floor: number, index: number): AbilityId[] {
  const bracket = Math.max(1, Math.floor(floor / 10));
  const count = Math.min(pool.length, bracket);
  const start = index % pool.length;

  return Array.from({ length: count }, (_, offset) => pool[(start + offset) % pool.length]);
}

export function createBossInstance(index = 0, floor = 10): RuntimeMonster {
  const boss = getBoss(index);
  const fixedAbilities = boss.fixedAbilities ?? [];
  const abilities = [
    ...fixedAbilities,
    ...selectBossAbilities(boss.abilityPool, floor, index).filter((ability) => !fixedAbilities.includes(ability)),
  ];
  const maxHp = boss.maxHp * BOSS_HP_MULTIPLIER;
  // 적은 전체 기술 풀을 그대로 들고, 매 턴 chooseBossMove가 ×4/×2/×1 그룹에서 1/3씩 고른다(battle/bossMatchup.ts).
  const moveset = [...boss.movePool];

  return {
    templateId: boss.id,
    name: boss.name,
    scientificName: boss.scientificName,
    category: boss.category,
    glyph: boss.glyph,
    assetPath: boss.assetPath,
    tags: {},
    maxHp,
    hp: maxHp,
    attack: boss.attack,
    defense: boss.defense,
    speed: 5,
    captureRate: 0,
    ability: abilities[0],
    abilities,
    moveset,
    moveSlots: moveset,
    moveStages: {},
    sealedMoveIds: [],
    bossMaintenanceQueued: false,
    plannedMoveIds: [],
    bossPhase2Activated: false,
    bossPhase2Pending: false,
    encounterDialogue: boss.encounterDialogue ? [...boss.encounterDialogue] : undefined,
    phase2Dialogue: boss.phase2Dialogue ? [...boss.phase2Dialogue] : undefined,
    finalBossSkill: boss.finalBossSkill,
    finalBossSkillName: boss.finalBossSkillName,
    finalBossSkillAnnouncement: boss.finalBossSkillAnnouncement,
    finalBossSkillApplied: false,
    effects: [],
    statusConditions: {},
    stunned: false,
    fainted: false,
    isBoss: true,
    isTrainer: true,
    symptoms: [],
    symptomAttributions: [],
    signatureUnlocked: true,
    usedSignatureMoveIds: [],
  };
}

function getTrainer(index = 0): TrainerData {
  return TRAINERS[index % TRAINERS.length];
}

export function createTrainerInstance(index = 0): RuntimeMonster {
  const trainer = getTrainer(index);
  const maxHp = Math.round(getBoss(index).maxHp * BOSS_HP_MULTIPLIER * TRAINER_BOSS_HP_RATIO);

  return {
    templateId: trainer.id,
    name: trainer.name,
    scientificName: trainer.scientificName,
    category: trainer.category,
    glyph: trainer.glyph,
    assetPath: trainer.assetPath,
    tags: {},
    maxHp,
    hp: maxHp,
    attack: trainer.attack,
    defense: trainer.defense,
    speed: 6,
    captureRate: 0,
    ability: 'none',
    abilities: [],
    // 보스와 동일: 전체 풀을 들고 매 턴 그룹에서 1/3씩 뽑는다. 차이는 HP(1/4)와 방어특성 없음뿐.
    moveset: [...trainer.movePool],
    moveSlots: [...trainer.movePool],
    moveStages: {},
    plannedMoveIds: [],
    bossPhase2Activated: false,
    effects: [],
    statusConditions: {},
    stunned: false,
    fainted: false,
    isBoss: false,
    isTrainer: true,
    symptoms: [],
    symptomAttributions: [],
    signatureUnlocked: true,
    usedSignatureMoveIds: [],
  };
}

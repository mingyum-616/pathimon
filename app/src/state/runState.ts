import { createWildRosterIds, MONSTERS, STARTER_ID, TOTAL_FLOORS, wildEncounterRoster } from '../data/monsters';
import { BOSSES, bossIndexById, createBossRosterIds } from '../data/bosses';
import { TRAINERS } from '../data/trainers';
import { createMaintenanceInventory } from '../data/shop';
import { addCapsule, cloneCapsuleInventory, createInitialCapsuleInventory, totalCapsules } from '../data/capsules';
import { chooseBossMove, createBossDefenseProfile } from '../battle/bossMatchup';
import type { EncounterKind, MonsterData, RunMode, RunState, RuntimeMonster, ShopItem, VisualStyle } from '../types/game';
import { createBossInstance, createMonsterInstance, createTrainerInstance } from './factory';

function cloneMonster(monster: RuntimeMonster): RuntimeMonster {
  return {
    ...monster,
    tags: { ...monster.tags },
    abilities: monster.abilities ? [...monster.abilities] : undefined,
    moveset: [...monster.moveset],
    moveSlots: monster.moveSlots ? [...monster.moveSlots] : undefined,
    moveStages: monster.moveStages ? { ...monster.moveStages } : undefined,
    plannedMoveId: monster.plannedMoveId,
    sealedMoveIds: monster.sealedMoveIds ? [...monster.sealedMoveIds] : undefined,
    bossMaintenanceQueued: monster.bossMaintenanceQueued,
    plannedMoveIds: monster.plannedMoveIds ? [...monster.plannedMoveIds] : undefined,
    bossPhase2Activated: monster.bossPhase2Activated,
    bossPhase2Pending: monster.bossPhase2Pending,
    encounterDialogue: monster.encounterDialogue ? [...monster.encounterDialogue] : undefined,
    phase2Dialogue: monster.phase2Dialogue ? [...monster.phase2Dialogue] : undefined,
    profileMemo: monster.profileMemo ? [...monster.profileMemo] : undefined,
    countermeasures: monster.countermeasures ? {
      direct: [...monster.countermeasures.direct],
      symptomTags: [...monster.countermeasures.symptomTags],
    } : undefined,
    effects: monster.effects.map((effect) => ({ ...effect })),
    statusConditions: monster.statusConditions ? { ...monster.statusConditions } : undefined,
    symptoms: monster.symptoms ? [...monster.symptoms] : undefined,
    symptomAttributions: monster.symptomAttributions?.map((attribution) => ({ ...attribution })),
    usedSignatureMoveIds: monster.usedSignatureMoveIds ? [...monster.usedSignatureMoveIds] : undefined,
  };
}

function cloneShopItem(item: ShopItem): ShopItem {
  return { ...item };
}

function healMonster(monster: RuntimeMonster): RuntimeMonster {
  return {
    ...cloneMonster(monster),
    hp: monster.maxHp,
    effects: [],
    statusConditions: {},
    symptoms: [],
    symptomAttributions: [],
    stunned: false,
    fainted: false,
    usedSignatureMoveIds: [],
  };
}

function prepareMonsterForBattle(monster: RuntimeMonster, mode: RunMode): RuntimeMonster {
  const prepared = mode === 'learning' ? healMonster(monster) : cloneMonster(monster);
  prepared.usedSignatureMoveIds = [];
  return prepared;
}

export function canHealPartyMember(monster: RuntimeMonster): boolean {
  const hasStatusConditions = Object.values(monster.statusConditions ?? {}).some((stacks) => (stacks ?? 0) > 0);
  return (
    monster.hp < monster.maxHp
    || monster.effects.length > 0
    || hasStatusConditions
    || Boolean(monster.stunned)
    || Boolean(monster.fainted)
  );
}

export function evolutionTargetForMonster(
  monster: RuntimeMonster,
  monsterCatalog: MonsterData[] = MONSTERS,
): MonsterData | undefined {
  const source = monsterCatalog.find((candidate) => candidate.id === monster.templateId);
  if (!source?.evolvesTo) return undefined;
  return monsterCatalog.find((candidate) => candidate.id === source.evolvesTo);
}

function evolveMonster(monster: RuntimeMonster, evolvedData: MonsterData, mode: RunMode): RuntimeMonster {
  const evolved = createMonsterInstance(evolvedData);
  evolved.hp = Math.min(evolved.maxHp, monster.hp);
  evolved.effects = monster.effects.map((effect) => ({ ...effect }));
  evolved.statusConditions = monster.statusConditions ? { ...monster.statusConditions } : {};
  evolved.symptoms = monster.symptoms ? [...monster.symptoms] : [];
  evolved.symptomAttributions = monster.symptomAttributions?.map((attribution) => ({ ...attribution })) ?? [];
  evolved.stunned = monster.stunned;
  evolved.fainted = monster.fainted || evolved.hp <= 0;
  evolved.signatureUnlocked = mode === 'learning';
  evolved.usedSignatureMoveIds = [];
  return evolved;
}

function wildEncounterIndexForFloor(floor: number): number {
  let wildEncounterIndex = 0;

  for (let currentFloor = 1; currentFloor < floor; currentFloor += 1) {
    if (encounterKindForFloor(currentFloor) === 'wild') {
      wildEncounterIndex += 1;
    }
  }

  return wildEncounterIndex;
}

function selectWildMonster(enemyIndex: number | undefined, floor: number, wildRosterIds?: string[]): MonsterData {
  const monsterById = new Map(MONSTERS.map((monster) => [monster.id, monster]));
  const runRoster = (wildRosterIds ?? [])
    .map((monsterId) => monsterById.get(monsterId))
    .filter((monster): monster is MonsterData => Boolean(monster));
  const wildRoster = runRoster.length > 0 ? runRoster : wildEncounterRoster();
  const indexedMonster = enemyIndex === undefined ? undefined : MONSTERS[enemyIndex];

  if (indexedMonster && indexedMonster.id !== STARTER_ID) {
    return indexedMonster;
  }

  const rosterIndex = enemyIndex === undefined ? wildEncounterIndexForFloor(floor) : enemyIndex;
  return wildRoster[rosterIndex % wildRoster.length];
}

function bossRosterIndexForFloor(floor: number): number {
  return Math.max(0, Math.floor(floor / 10) - 1);
}

function selectBossIndex(enemyIndex: number | undefined, floor: number, bossRosterIds?: string[]): number {
  if (enemyIndex !== undefined) return enemyIndex;

  const rosterBossId = bossRosterIds?.[bossRosterIndexForFloor(floor)];
  const rosterBossIndex = rosterBossId ? bossIndexById(rosterBossId) : undefined;
  return rosterBossIndex ?? Math.floor(Math.random() * BOSSES.length);
}

function clampActiveIndex(activeIndex: number, partyLength: number): number {
  return Math.min(Math.max(0, partyLength - 1), Math.max(0, activeIndex));
}

function createBgmSeed(random: () => number): number {
  return Math.floor(random() * 0x100000000);
}

function planInitialHumanMove(state: RunState): void {
  const enemy = state.enemy;
  const actor = state.party[state.activeIndex];
  if (!enemy?.isTrainer || !actor) return;

  const plannedMoveId = chooseBossMove(enemy.moveset, createBossDefenseProfile(actor));
  enemy.plannedMoveId = plannedMoveId;
  enemy.plannedMoveIds = plannedMoveId ? [plannedMoveId] : [];
}

export function encounterKindForFloor(floor: number): EncounterKind {
  if (floor > 0 && floor % 10 === 0) return 'boss';
  if (floor > 0 && floor % 5 === 0) return 'trainer';
  return 'wild';
}

export function ensureMaintenanceInventory(state: RunState): ShopItem[] {
  return (state.shopInventory ?? createMaintenanceInventory(state.floor)).map(cloneShopItem);
}

export function createInitialRunState(
  mode: RunMode = 'challenge',
  visualStyle: VisualStyle = 'character',
  starterIds: string | string[] = STARTER_ID,
  wildRosterRandom: () => number = Math.random,
  bossRosterIds?: string[],
): RunState {
  const starterIdList = (Array.isArray(starterIds) ? starterIds : [starterIds]).filter((starterId) => starterId.length > 0);
  const starterDataList = (starterIdList.length > 0 ? starterIdList : [STARTER_ID]).map((starterId) => {
    const starter = MONSTERS.find((monster) => monster.id === starterId);
    if (!starter) {
      throw new Error(`starter missing: ${starterId}`);
    }
    return starter;
  });

  const capsuleInventory = createInitialCapsuleInventory();
  const wildRosterIds = createWildRosterIds(wildRosterRandom);
  const resolvedBossRosterIds = bossRosterIds ? [...bossRosterIds] : createBossRosterIds(wildRosterRandom, TOTAL_FLOORS / 10);
  const bgmSeed = createBgmSeed(wildRosterRandom);

  return {
    floor: 1,
    bgmSeed,
    mode,
    visualStyle,
    money: 0,
    capsules: totalCapsules(capsuleInventory),
    capsuleInventory,
    wildRosterIds,
    bossRosterIds: resolvedBossRosterIds,
    party: starterDataList.map((starter) => {
      const monster = createMonsterInstance(starter);
      monster.signatureUnlocked = mode === 'learning';
      return monster;
    }),
    activeIndex: 0,
    enemy: null,
    encounterKind: 'wild',
    phase: 'story',
    lastLog: '',
    shopRefreshCount: 0,
  };
}

export function enterBattle(state: RunState, enemyIndex?: number): RunState {
  const nextState: RunState = {
    ...state,
    capsuleInventory: cloneCapsuleInventory(state.capsuleInventory),
    wildRosterIds: state.wildRosterIds ? [...state.wildRosterIds] : undefined,
    bossRosterIds: state.bossRosterIds ? [...state.bossRosterIds] : undefined,
    party: state.party.map((monster) => prepareMonsterForBattle(monster, state.mode)),
    enemy: null,
    encounterKind: encounterKindForFloor(state.floor),
    pendingCapture: undefined,
    shopInventory: undefined,
    shopRefreshCount: 0,
    battleResultLog: undefined,
    battleActionLog: undefined,
    battleStatusLog: undefined,
    battleStatusDamage: undefined,
    lastEnemyHitEffectiveness: undefined,
    lastPlayerHitEffectiveness: undefined,
  };

  if (nextState.encounterKind === 'boss') {
    const bossIndex = selectBossIndex(enemyIndex, nextState.floor, nextState.bossRosterIds);
    nextState.enemy = createBossInstance(bossIndex, nextState.floor);
    planInitialHumanMove(nextState);
    nextState.phase = 'bossIntro';
    nextState.lastLog = `${nextState.enemy.name}이 길을 막아섰다.`;
    return nextState;
  }

  if (nextState.encounterKind === 'trainer') {
    const trainerIndex = enemyIndex ?? Math.floor(Math.random() * TRAINERS.length);
    nextState.enemy = createTrainerInstance(trainerIndex);
    planInitialHumanMove(nextState);
    nextState.phase = 'battle';
    nextState.lastLog = `${nextState.enemy.name}이 승부를 걸어왔다.`;
    return nextState;
  }

  const enemyData = selectWildMonster(enemyIndex, nextState.floor, nextState.wildRosterIds);
  nextState.enemy = createMonsterInstance(enemyData);
  nextState.phase = 'battle';
  nextState.lastLog = `${nextState.enemy.name}이 나타났다.`;
  return nextState;
}

export function advanceFromShop(state: RunState): RunState {
  const party = state.party.map(cloneMonster);
  const nextState: RunState = {
    ...state,
    capsuleInventory: cloneCapsuleInventory(state.capsuleInventory),
    wildRosterIds: state.wildRosterIds ? [...state.wildRosterIds] : undefined,
    bossRosterIds: state.bossRosterIds ? [...state.bossRosterIds] : undefined,
    floor: state.floor + 1,
    activeIndex: clampActiveIndex(state.activeIndex, party.length),
    party,
    enemy: null,
    encounterKind: 'wild',
    pendingCapture: undefined,
    phase: 'story',
    lastLog: state.mode === 'learning' ? '학습모드: 다음 층 전투를 위해 모두 회복했습니다.' : '다음 층 전투를 시작합니다.',
    battleResultLog: undefined,
    battleActionLog: undefined,
    battleStatusLog: undefined,
    battleStatusDamage: undefined,
    lastEnemyHitEffectiveness: undefined,
    lastPlayerHitEffectiveness: undefined,
    shopInventory: undefined,
    shopRefreshCount: 0,
  };

  return enterBattle(nextState);
}

export function healAllPartyMembers(state: RunState): RuntimeMonster[] {
  return state.party.map(healMonster);
}

export function healPartyMember(state: RunState, partyIndex: number): RunState {
  const target = state.party[partyIndex];
  const nextState: RunState = {
    ...state,
    capsuleInventory: cloneCapsuleInventory(state.capsuleInventory),
    wildRosterIds: state.wildRosterIds ? [...state.wildRosterIds] : undefined,
    bossRosterIds: state.bossRosterIds ? [...state.bossRosterIds] : undefined,
    party: state.party.map(cloneMonster),
  };

  if (!target) {
    return {
      ...nextState,
      lastLog: '회복할 패시몬이 없습니다.',
    };
  }

  if (state.money <= 0) {
    return {
      ...nextState,
      lastLog: '자금이 부족합니다.',
    };
  }

  const clonedTarget = nextState.party[partyIndex];
  if (!canHealPartyMember(clonedTarget)) {
    return {
      ...nextState,
      lastLog: `${clonedTarget.name}은 이미 회복된 상태입니다.`,
    };
  }

  nextState.money = Math.max(0, nextState.money - 1);
  nextState.party[partyIndex] = healMonster(clonedTarget);
  nextState.lastLog = `${clonedTarget.name} 회복 완료.`;
  return nextState;
}

export function canUseEvolutionStoneOnPartyMember(
  state: RunState,
  partyIndex: number,
  monsterCatalog: MonsterData[] = MONSTERS,
): boolean {
  const target = state.party[partyIndex];
  if (!target) return false;
  return Boolean(evolutionTargetForMonster(target, monsterCatalog));
}

export function canUseRareCandyOnPartyMember(state: RunState, partyIndex: number): boolean {
  const target = state.party[partyIndex];
  return Boolean(target && !target.signatureUnlocked);
}

export function purchaseShopItem(state: RunState, itemId: string): RunState {
  const inventory = ensureMaintenanceInventory(state);
  const itemIndex = inventory.findIndex((item) => item.id === itemId);
  const nextState: RunState = {
    ...state,
    capsuleInventory: cloneCapsuleInventory(state.capsuleInventory),
    wildRosterIds: state.wildRosterIds ? [...state.wildRosterIds] : undefined,
    bossRosterIds: state.bossRosterIds ? [...state.bossRosterIds] : undefined,
    party: state.party.map(cloneMonster),
    shopInventory: inventory,
  };

  if (itemIndex < 0) {
    return {
      ...nextState,
      lastLog: '해당 정비 물품을 찾을 수 없습니다.',
    };
  }

  const item = inventory[itemIndex];
  if (item.purchased) {
    return {
      ...nextState,
      lastLog: `${item.name}은 이미 구매했습니다.`,
    };
  }

  if (item.price > state.money) {
    return {
      ...nextState,
      lastLog: '자금이 부족합니다.',
    };
  }

  if (item.kind === 'potion' || item.kind === 'rareCandy' || item.kind === 'evolutionStone') {
    return {
      ...nextState,
      lastLog: `${item.name}을 사용할 패시몬을 선택하세요.`,
    };
  }

  nextState.money = Math.max(0, state.money - item.price);
  inventory[itemIndex] = { ...item, purchased: true };

  if (item.kind === 'capsule') {
    if (!item.capsuleId) {
      nextState.lastLog = '캡슐 종류를 확인할 수 없습니다.';
      return nextState;
    }

    nextState.capsuleInventory = addCapsule(nextState.capsuleInventory, item.capsuleId, 1);
    nextState.capsules = totalCapsules(nextState.capsuleInventory);
    nextState.lastLog = `${item.name}을 획득했습니다.`;
    return nextState;
  }

  if (item.kind === 'advancedPotion') {
    nextState.party = healAllPartyMembers(nextState);
    nextState.lastLog = `${item.name}으로 모든 패시몬을 회복했습니다.`;
    return nextState;
  }

  nextState.lastLog = `${item.name}은 아직 기능 준비 중입니다.`;
  return nextState;
}

export function purchaseShopItemForPartyMember(
  state: RunState,
  itemId: string,
  partyIndex: number,
  monsterCatalog: MonsterData[] = MONSTERS,
): RunState {
  const inventory = ensureMaintenanceInventory(state);
  const itemIndex = inventory.findIndex((item) => item.id === itemId);
  const nextState: RunState = {
    ...state,
    capsuleInventory: cloneCapsuleInventory(state.capsuleInventory),
    wildRosterIds: state.wildRosterIds ? [...state.wildRosterIds] : undefined,
    bossRosterIds: state.bossRosterIds ? [...state.bossRosterIds] : undefined,
    party: state.party.map(cloneMonster),
    shopInventory: inventory,
  };

  if (itemIndex < 0) {
    return {
      ...nextState,
      lastLog: '해당 정비 물품을 찾을 수 없습니다.',
    };
  }

  const item = inventory[itemIndex];
  if (item.purchased) {
    return {
      ...nextState,
      lastLog: `${item.name}은 이미 구매했습니다.`,
    };
  }

  if (item.price > state.money) {
    return {
      ...nextState,
      lastLog: '자금이 부족합니다.',
    };
  }

  const target = nextState.party[partyIndex];
  if (!target) {
    return {
      ...nextState,
      lastLog: '선택할 패시몬이 없습니다.',
    };
  }

  if (item.kind === 'potion') {
    if (!canHealPartyMember(target)) {
      return {
        ...nextState,
        lastLog: `${target.name}은 이미 회복된 상태입니다.`,
      };
    }

    nextState.money = Math.max(0, state.money - item.price);
    inventory[itemIndex] = { ...item, purchased: true };
    nextState.party[partyIndex] = healMonster(target);
    nextState.lastLog = `${target.name} 회복 완료.`;
    return nextState;
  }

  if (item.kind === 'rareCandy') {
    if (target.signatureUnlocked) {
      return {
        ...nextState,
        lastLog: `${target.name}의 전용기는 이미 해금되어 있습니다.`,
      };
    }

    nextState.money = Math.max(0, state.money - item.price);
    inventory[itemIndex] = { ...item, purchased: true };
    target.signatureUnlocked = true;
    nextState.lastLog = `${target.name}의 전용기를 해금했습니다.`;
    return nextState;
  }

  if (item.kind === 'evolutionStone') {
    const evolutionTarget = evolutionTargetForMonster(target, monsterCatalog);
    if (evolutionTarget) {
      const evolved = evolveMonster(target, evolutionTarget, state.mode);
      nextState.money = Math.max(0, state.money - item.price);
      inventory[itemIndex] = { ...item, purchased: true };
      nextState.party[partyIndex] = evolved;
      nextState.lastLog = `${target.name}이 ${evolved.name}(으)로 진화했습니다.`;
      return nextState;
    }

    return {
      ...nextState,
      lastLog: `${target.name}은 진화할 수 없습니다.`,
    };
  }

  nextState.lastLog = `${item.name}은 패시몬 선택이 필요하지 않습니다.`;
  return nextState;
}

export function maintenanceRefreshCost(state: RunState): number {
  return Math.max(0, state.shopRefreshCount ?? 0);
}

export function refreshMaintenanceInventory(state: RunState, roll = Math.random()): RunState {
  const nextState: RunState = {
    ...state,
    capsuleInventory: cloneCapsuleInventory(state.capsuleInventory),
    wildRosterIds: state.wildRosterIds ? [...state.wildRosterIds] : undefined,
    bossRosterIds: state.bossRosterIds ? [...state.bossRosterIds] : undefined,
    party: state.party.map(cloneMonster),
    shopInventory: ensureMaintenanceInventory(state),
  };

  const cost = maintenanceRefreshCost(state);
  if (state.money < cost) {
    return {
      ...nextState,
      shopRefreshCount: state.shopRefreshCount ?? 0,
      lastLog: '자금이 부족합니다.',
    };
  }

  return {
    ...nextState,
    money: state.money - cost,
    shopInventory: createMaintenanceInventory(state.floor, roll),
    shopRefreshCount: (state.shopRefreshCount ?? 0) + 1,
    lastLog: cost > 0 ? `정비 품목을 새로고침했습니다. -₩${cost}` : '정비 품목을 무료로 새로고침했습니다.',
  };
}

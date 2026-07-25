import { describe, expect, it, vi } from 'vitest';
import type { MonsterData, RunState } from '../types/game';
import {
  beginCaptureQuiz,
  cancelPendingCapture,
  resolveCapsuleAction,
  resolveCaptureQuizAnswer,
  resolveCaptureRelease,
  resolveForcedSwitchMonster,
  resolvePassEncounter,
  resolvePlayerMove,
  resolveSwitchMonster,
} from '../battle/turn';
import { MOVES } from '../data/moves';
import {
  createDistributedWildRoster,
  EARLY_BAND_MAX_BST,
  LATE_BAND_MIN_BST,
  lateBandWildSlotCount,
  monsterBaseStatTotal,
  STARTER_ID,
  TOTAL_FLOORS,
  wildEncounterRoster,
} from '../data/monsters';
import { NOTE_MONSTERS } from '../data/pathimonNoteData';
import { createMonsterInstance } from './factory';
import {
  advanceFromShop,
  canEvolvePartyMember,
  EVOLUTION_REQUIRED_BATTLES,
  canUseEvolutionStoneOnPartyMember,
  createInitialRunState,
  evolvePartyMember,
  encounterKindForFloor,
  enterBattle,
  healPartyMember,
  purchaseShopItem,
  purchaseShopItemForPartyMember,
  maintenanceRefreshCost,
  refreshMaintenanceInventory,
} from './runState';

const NOTE_MONSTERS_NEWEST_FIRST = [...NOTE_MONSTERS].reverse();

function testMonster(id: string, category: string): MonsterData {
  return {
    id,
    name: id,
    scientificName: id,
    category,
    glyph: id.slice(0, 3).toUpperCase().padEnd(3, 'X'),
    tags: {},
    maxHp: 10,
    attack: 5,
    defense: 5,
    speed: 5,
    captureRate: 0.5,
    ability: 'none',
    learnset: ['alpha_toxin'],
  };
}

function sequenceRandom(values: number[]): () => number {
  let index = 0;
  return () => values[index++] ?? 0.37;
}

function wildMonsterForRun(state: RunState, index = 0): MonsterData {
  const monsterId = state.wildRosterIds?.[index];
  const monster = wildEncounterRoster().find((candidate) => candidate.id === monsterId);
  if (!monster) throw new Error(`wild monster missing: ${monsterId}`);
  return monster;
}

describe('run state loop', () => {
  it('starts with one active starter and battle resources', () => {
    const state = createInitialRunState();

    expect(state.floor).toBe(1);
    expect(state.money).toBe(0);
    expect(state.capsules).toBe(5);
    expect(state.capsuleInventory.universal).toBe(5);
    expect(state.capsuleInventory.bacteria).toBe(0);
    expect(state.mode).toBe('challenge');
    expect(state.visualStyle).toBe('character');
    expect(state.party[0].name).toBe('탄저록스');
    expect(state.party[0].templateId).toBe(STARTER_ID);
    expect(state.phase).toBe('story');
    expect(Number.isInteger(state.bgmSeed)).toBe(true);
  });

  it('can start with the selected starter pathimon', () => {
    const state = createInitialRunState('learning', 'micro', 'cereus');

    expect(state.mode).toBe('learning');
    expect(state.visualStyle).toBe('micro');
    expect(state.party[0].name).toBe('세레우톡스');
    expect(state.party[0].templateId).toBe('cereus');
    expect(state.party).toHaveLength(1);
  });

  it('unlocks signature moves by default only in learning mode', () => {
    const learning = createInitialRunState('learning', 'character', 'anthrax');
    const challenge = createInitialRunState('challenge', 'character', 'anthrax');

    expect(learning.party[0].signatureUnlocked).toBe(true);
    expect(challenge.party[0].signatureUnlocked).toBe(false);
  });

  it('enters a wild encounter without starting a fight', () => {
    const initial = createInitialRunState();
    const firstWildPathimon = wildMonsterForRun(initial);
    const state = enterBattle(initial);

    expect(state.phase).toBe('battle');
    expect(state.encounterKind).toBe('wild');
    expect(state.enemy?.isBoss).toBe(false);
    expect(state.enemy?.abilities).toEqual(firstWildPathimon.abilities ?? [firstWildPathimon.ability]);
    expect(state.enemy?.scientificName).toBe(firstWildPathimon.scientificName);
  });

  it('keeps the selected microscope visual style through wild battles', () => {
    const initial = createInitialRunState('challenge', 'micro');
    const firstWildPathimon = wildMonsterForRun(initial);
    const state = enterBattle(initial);

    expect(state.enemy?.templateId).toBe(firstWildPathimon.id);
    expect(state.visualStyle).toBe('micro');
    expect(state.enemy?.assetPath).toBeUndefined();
  });

  it('routes every fifth floor to humans and every tenth floor to bosses', () => {
    expect(encounterKindForFloor(1)).toBe('wild');
    expect(encounterKindForFloor(5)).toBe('trainer');
    expect(encounterKindForFloor(10)).toBe('boss');
    expect(encounterKindForFloor(15)).toBe('trainer');
    expect(encounterKindForFloor(20)).toBe('boss');
  });

  it('keeps every active pathimon in the wild pool and never repeats one within a run', () => {
    // 한 판에 전 종이 등장하도록 설계한 적이 없다. 야생은 활성 패시몬 풀에서 무작위로 뽑고,
    // 로스터(83종)가 야생 층(80층)보다 많아 매 판 몇 종은 나오지 않는다. 그건 정상이다.
    // 여기서 지켜야 할 것은 두 가지다 — 풀이 앞쪽 몇 종으로 잘리지 않을 것, 한 판 안에서 겹치지 않을 것.
    const pool = wildEncounterRoster().map((monster) => monster.id);
    expect(pool).toContain('anthrax');
    expect(pool).toContain('cereus');

    const seen = new Set<string>();
    const run = createInitialRunState();
    let wildFloors = 0;

    for (let floor = 1; floor <= TOTAL_FLOORS; floor += 1) {
      if (encounterKindForFloor(floor) !== 'wild') continue;
      wildFloors += 1;
      const state = { ...run };
      state.floor = floor;
      const battle = enterBattle(state);
      if (battle.enemy) seen.add(battle.enemy.templateId);
    }

    expect(wildFloors).toBeGreaterThan(0);
    expect(seen.size).toBe(wildFloors);
    expect(pool.length).toBeGreaterThanOrEqual(wildFloors);
  });

  it('creates one shuffled wild roster when a run starts', () => {
    const baseRosterIds = wildEncounterRoster().map((monster) => monster.id);
    const state = createInitialRunState(
      'challenge',
      'character',
      'anthrax',
      sequenceRandom([0.91, 0.12, 0.77, 0.34, 0.58, 0.03, 0.82, 0.25]),
    );
    const runRosterIds = state.wildRosterIds ?? [];

    expect(runRosterIds).toHaveLength(baseRosterIds.length);
    expect(new Set(runRosterIds).size).toBe(baseRosterIds.length);
    expect([...runRosterIds].sort()).toEqual([...baseRosterIds].sort());
    expect(runRosterIds).not.toEqual(baseRosterIds);
  });

  it('uses the run wild roster order across wild floors', () => {
    const chosenIds = wildEncounterRoster()
      .filter((monster) => monster.id !== STARTER_ID)
      .slice(0, 3)
      .map((monster) => monster.id)
      .reverse();
    const state = createInitialRunState();
    state.wildRosterIds = chosenIds;

    expect(enterBattle(state).enemy?.templateId).toBe(chosenIds[0]);
    expect(enterBattle({ ...state, floor: 2 }).enemy?.templateId).toBe(chosenIds[1]);
    expect(enterBattle({ ...state, floor: 3 }).enemy?.templateId).toBe(chosenIds[2]);
  });

  it('disperses same-type wild rosters when alternatives remain', () => {
    const source = [
      testMonster('bacteria-1', '세균'),
      testMonster('bacteria-2', '세균'),
      testMonster('bacteria-3', '세균'),
      testMonster('bacteria-4', '세균'),
      testMonster('virus-1', '바이러스'),
      testMonster('virus-2', '바이러스'),
      testMonster('virus-3', '바이러스'),
      testMonster('virus-4', '바이러스'),
      testMonster('parasite-1', '기생충'),
      testMonster('parasite-2', '기생충'),
      testMonster('parasite-3', '기생충'),
      testMonster('parasite-4', '기생충'),
    ];

    const roster = createDistributedWildRoster(source, sequenceRandom([0.99, 0.02, 0.66, 0.18, 0.42]), 2);

    expect(roster).toHaveLength(source.length);
    expect(roster.map((monster) => monster.id).sort()).toEqual(source.map((monster) => monster.id).sort());
    for (let index = 2; index < roster.length; index += 1) {
      const recentTypes = roster.slice(index - 2, index + 1).map((monster) => monster.category);
      expect(new Set(recentTypes).size).toBeGreaterThan(1);
    }
  });

  it('draws early floors from the low band pool and late floors from the high band pool', () => {
    const roster = createDistributedWildRoster(wildEncounterRoster());
    const lateSlots = lateBandWildSlotCount();
    const earlyRoster = roster.slice(0, roster.length - lateSlots);
    const lateRoster = roster.slice(roster.length - lateSlots);

    expect(roster).toHaveLength(80);
    expect(lateSlots).toBe(32);
    expect(earlyRoster.every((monster) => monsterBaseStatTotal(monster) <= EARLY_BAND_MAX_BST)).toBe(true);
    expect(lateRoster.every((monster) => monsterBaseStatTotal(monster) >= LATE_BAND_MIN_BST)).toBe(true);
  });

  it('shuffles inside each band instead of sorting the whole roster by stat total', () => {
    const roster = createDistributedWildRoster(wildEncounterRoster());
    const earlyTotals = roster
      .slice(0, roster.length - lateBandWildSlotCount())
      .map(monsterBaseStatTotal);
    const isAscending = earlyTotals.every((total, index) => index === 0 || total >= earlyTotals[index - 1]);

    expect(isAscending).toBe(false);
  });

  it('falls back to the available pool when a band has too few pathimon', () => {
    const source = [
      testMonster('bacteria-1', '세균'),
      testMonster('virus-1', '바이러스'),
      testMonster('parasite-1', '기생충'),
    ];

    const roster = createDistributedWildRoster(source, Math.random, 2, 2);

    expect(roster.map((monster) => monster.id).sort()).toEqual(source.map((monster) => monster.id).sort());
  });

  it('keeps note-managed pathimon available in the wild encounter roster', () => {
    const openingRouteIds = NOTE_MONSTERS_NEWEST_FIRST.map((monster) => monster.id);

    expect(wildEncounterRoster().slice(0, openingRouteIds.length).map((monster) => monster.id)).toEqual(openingRouteIds);

    const runRosterIds = createInitialRunState().wildRosterIds ?? [];
    expect([...runRosterIds].sort()).toEqual([...openingRouteIds].sort());
  });

  it('preserves party hp when a new encounter starts in either mode', () => {
    const learning = createInitialRunState('learning');
    learning.party[0].hp = 1;

    const learningBattle = enterBattle(learning);

    expect(learningBattle.mode).toBe('learning');
    expect(learningBattle.party[0].hp).toBe(1);

    const challenge = createInitialRunState('challenge');
    challenge.party[0].hp = 1;

    const challengeBattle = enterBattle(challenge);

    expect(challengeBattle.mode).toBe('challenge');
    expect(challengeBattle.party[0].hp).toBe(1);
  });

  it('resets once-per-battle signature use when a new battle starts', () => {
    const challenge = createInitialRunState('challenge');
    challenge.party[0].usedSignatureMoveIds = ['capsule_formation'];
    challenge.party[0].effects.push({ kind: 'buff', stat: 'attack', pct: 25, turns: 3 });
    challenge.party[0].statusConditions = { fever: 1 };
    challenge.party[0].symptoms = ['기침'];

    const battle = enterBattle(challenge);

    expect(battle.party[0].usedSignatureMoveIds).toEqual([]);
    expect(battle.party[0].effects).toHaveLength(1);
    expect(battle.party[0].statusConditions).toEqual({ fever: 1 });
    expect(battle.party[0].symptoms).toEqual(['기침']);
  });

  it('enters a boss intro at the final floor', () => {
    const state = createInitialRunState();
    state.floor = TOTAL_FLOORS;

    const result = enterBattle(state);

    expect(result.phase).toBe('bossIntro');
    expect(result.encounterKind).toBe('boss');
    expect(result.enemy?.isBoss).toBe(true);
    expect(result.enemy?.isTrainer).toBe(true);
    expect(result.enemy?.captureRate).toBe(0);
    expect(result.enemy?.plannedMoveId).toBeTruthy();
  });

  it('locks a trainer first-turn move before showing its telegraph', () => {
    const state = createInitialRunState();
    state.floor = 5;
    state.party[0].maxHp = 5000;
    state.party[0].hp = 5000;

    const battle = enterBattle(state, 0);
    const plannedMoveId = battle.enemy?.plannedMoveId;

    expect(plannedMoveId).toBeTruthy();
    expect(battle.enemy?.plannedMoveIds).toEqual([plannedMoveId]);

    const result = resolvePlayerMove(battle, 'hyaluronidase', 1, 0, 0);
    expect(result.lastLog).toContain(MOVES[plannedMoveId!].name);
  });

  it('moves to shop and grants money after defeating a human enemy', () => {
    const state = createInitialRunState();
    state.floor = 5;
    const battle = enterBattle(state, 0);
    if (!battle.enemy) throw new Error('enemy missing');
    battle.enemy.hp = 1;

    const result = resolvePlayerMove(battle, 'hyaluronidase', 1);

    expect(result.phase).toBe('shop');
    expect(result.shopInventory).toHaveLength(6);
    expect(result.money).toBe(5);
  });

  it('adds money only after human encounters, so the tenth-floor shop starts with ten if unspent', () => {
    const state = createInitialRunState();
    state.floor = 10;
    state.money = 5;
    const battle = enterBattle(state, 0);
    if (!battle.enemy) throw new Error('enemy missing');
    battle.enemy.hp = 1;

    const result = resolvePlayerMove(battle, 'hyaluronidase', 1);

    expect(result.phase).toBe('shop');
    expect(result.money).toBe(10);
  });

  it('skips the maintenance shop after learning-mode victories without result-screen learning feedback', () => {
    // 패시몬끼리는 싸우지 않는다. 전투는 트레이너·보스와만 성립하므로 5층(트레이너)에서 확인한다.
    const battle = enterBattle({ ...createInitialRunState('learning'), floor: 5 });
    if (!battle.enemy) throw new Error('enemy missing');
    battle.party[0].hp = 1;
    battle.enemy.hp = 1;

    const result = resolvePlayerMove(battle, 'cholera_toxin', 1);

    expect(result.phase).toBe('floorClear');
    expect(result.party[0].hp).toBe(result.party[0].maxHp);
    expect(result.lastLog).toContain(`${battle.floor}층 클리어`);
    expect(result.lastLog).not.toContain('학습 피드백');
    expect(result.lastLog).toContain('적 전투 종료 후 전원 회복');
    expect(result.lastLog).toContain('파티 1/6');
  });

  it('shows the challenge victory reward and current party diversity in maintenance', () => {
    const battle = enterBattle({ ...createInitialRunState('challenge'), floor: 5 });
    if (!battle.enemy) throw new Error('enemy missing');
    battle.enemy.hp = 1;

    const result = resolvePlayerMove(battle, 'cholera_toxin', 1);

    expect(result.phase).toBe('shop');
    expect(result.lastLog).toContain('승리 보상 +5원');
    expect(result.lastLog).toContain('파티 1/6');
    expect(result.lastLog).toContain('계열 1종');
  });

  it('captures a normal enemy and shows the floor and pathimon memo instead of learning feedback', () => {
    const initial = createInitialRunState();
    const firstWildPathimon = wildMonsterForRun(initial);
    const battle = enterBattle(initial);
    if (!battle.enemy) throw new Error('enemy missing');
    battle.enemy.hp = 1;

    const result = resolveCapsuleAction(battle, 0);

    expect(result.phase).toBe('floorClear');
    expect(result.capsules).toBe(4);
    expect(result.capsuleInventory.universal).toBe(4);
    expect(result.money).toBe(0);
    expect(result.party.length).toBe(2);
    expect(result.lastLog).toContain(`${battle.floor}층 클리어`);
    const displayedLearningPoints = firstWildPathimon.profileMemo
      ?.filter((line) => result.lastLog.includes(line)) ?? [];
    expect(displayedLearningPoints).toHaveLength(1);
    expect(result.lastLog).not.toContain('학습 피드백');
  });

  it('spends a capsule before the OX quiz and guarantees capture after a correct answer', () => {
    const battle = enterBattle(createInitialRunState('challenge'));
    if (!battle.enemy) throw new Error('enemy missing');
    battle.enemy.name = '대장콜리';
    battle.enemy.captureRate = 0.01;
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const quiz = beginCaptureQuiz(battle, 'universal');
    const captured = resolveCaptureQuizAnswer(quiz, true);
    random.mockRestore();

    expect(quiz.capsuleInventory.universal).toBe(4);
    expect(quiz.pendingCaptureCapsuleId).toBe('universal');
    expect(quiz.lastLog).toBe('대장콜리가 질문을 던진다...');
    expect(captured.phase).toBe('floorClear');
    expect(captured.party).toHaveLength(2);
  });

  it.each([
    ['learning', 0.2, '20%'],
    ['challenge', 0.4, '40%'],
  ] as const)('deals mode-specific max HP damage for a wrong answer in %s mode', (mode, ratio, label) => {
    const battle = enterBattle(createInitialRunState(mode));
    const actor = battle.party[0];
    const expectedDamage = Math.ceil(actor.maxHp * ratio);

    const quiz = beginCaptureQuiz(battle, 'universal');
    const wrong = resolveCaptureQuizAnswer(quiz, false);

    expect(wrong.party[0].hp).toBe(actor.maxHp - expectedDamage);
    expect(wrong.phase).toBe('battle');
    expect(wrong.lastLog).toContain(`최대 체력의 ${label} 피해`);
  });

  it('keeps learning-mode capture quiz damage after capture and on the next wild floor', () => {
    const battle = enterBattle(createInitialRunState('learning'));
    const actor = battle.party[0];
    const quiz = beginCaptureQuiz(battle, 'universal');
    const wrong = resolveCaptureQuizAnswer(quiz, false);
    const damagedHp = wrong.party[0].hp;

    expect(damagedHp).toBeLessThan(actor.maxHp);

    const retryQuiz = beginCaptureQuiz(wrong, 'universal');
    const captured = resolveCaptureQuizAnswer(retryQuiz, true);
    const nextBattle = advanceFromShop(captured);

    expect(captured.phase).toBe('floorClear');
    expect(captured.party[0].hp).toBe(damagedHp);
    expect(nextBattle.floor).toBe(2);
    expect(nextBattle.party[0].hp).toBe(damagedHp);
  });

  it('blocks capture before spending when the selected capsule does not match the pathogen tag', () => {
    const battle = enterBattle(createInitialRunState());
    battle.capsuleInventory.prion = 1;
    battle.capsules = 5;

    const result = resolveCapsuleAction(battle, 'prion', 0);

    expect(result.phase).toBe('battle');
    expect(result.lastLog).toContain('타입');
    expect(result.capsuleInventory.prion).toBe(1);
    expect(result.party).toHaveLength(1);
  });

  it('allows matching typed capsules to capture matching wild pathimon', () => {
    const bacteria = wildEncounterRoster().find((monster) => monster.category === '세균');
    if (!bacteria) throw new Error('bacteria missing');
    const state = createInitialRunState();
    state.wildRosterIds = [bacteria.id];
    const battle = enterBattle(state);
    battle.capsuleInventory.universal = 0;
    battle.capsuleInventory.bacteria = 1;
    battle.capsules = 1;
    if (!battle.enemy) throw new Error('enemy missing');
    battle.enemy.hp = 1;

    const result = resolveCapsuleAction(battle, 'bacteria', 0);

    expect(result.phase).toBe('floorClear');
    expect(result.capsuleInventory.bacteria).toBe(0);
    expect(result.capsules).toBe(0);
    expect(result.party[1].templateId).toBe(bacteria.id);
  });

  it('can pass a wild pathimon encounter without fighting', () => {
    const battle = enterBattle(createInitialRunState());
    if (!battle.enemy) throw new Error('enemy missing');
    battle.party[0].effects.push({ kind: 'buff', stat: 'attack', pct: 25, turns: 3 });
    battle.party[0].statusConditions = { fever: 1 };
    battle.party[0].symptoms = ['기침'];
    battle.party[0].usedSignatureMoveIds = ['capsule_formation'];

    const result = resolvePassEncounter(battle);

    expect(result.phase).toBe('floorClear');
    expect(result.party).toHaveLength(1);
    expect(result.party[0].effects).toEqual([]);
    expect(result.party[0].statusConditions).toEqual({});
    expect(result.party[0].symptoms).toEqual([]);
    expect(result.party[0].usedSignatureMoveIds).toEqual([]);
    expect(result.lastLog).toContain(`${battle.floor}층 클리어`);
    expect(result.lastLog).toContain('지나갔다');
    const displayedLearningPoints = battle.enemy.profileMemo
      ?.filter((line) => result.lastLog.includes(line)) ?? [];
    expect(displayedLearningPoints).toHaveLength(1);
    expect(result.lastLog).not.toContain('학습 피드백');
  });

  it('treats capsules as unlimited in learning mode', () => {
    const battle = enterBattle(createInitialRunState('learning'));
    battle.capsules = 0;
    battle.capsuleInventory.universal = 0;
    if (!battle.enemy) throw new Error('enemy missing');
    battle.enemy.hp = 1;

    const result = resolveCapsuleAction(battle, 0);

    expect(result.phase).toBe('floorClear');
    expect(result.capsules).toBe(0);
    expect(result.capsuleInventory.universal).toBe(0);
    expect(result.party.length).toBe(2);
  });

  it('shows one concise pathimon fact after a learning-mode wild encounter', () => {
    const battle = enterBattle(createInitialRunState('learning'));
    if (!battle.enemy) throw new Error('enemy missing');

    const result = resolvePassEncounter(battle);
    const displayedLearningPoints = battle.enemy.profileMemo
      ?.filter((line) => result.lastLog.includes(line)) ?? [];

    expect(displayedLearningPoints).toHaveLength(1);
  });

  it('uses pathogen-specific learning feedback instead of the generic type-matchup sentence', () => {
    // 패시몬끼리는 싸우지 않는다. 전투는 트레이너·보스와만 성립하므로 5층(트레이너)에서 확인한다.
    const initial = createInitialRunState('learning');
    initial.floor = 5;
    const battle = enterBattle(initial);
    const enemy = battle.enemy;
    if (!enemy) throw new Error('trainer enemy missing');
    // 트레이너 공격력 68에 v2 앵커 탄저록스(HP 40)는 반격 한 번에 쓰러질 수 있다. 적 턴 피해는
    // `randomDamageVariance()` 기본값을 쓰므로 결과가 실행마다 달라진다. 여기서 볼 것은 피드백
    // 문구지 전투 결과가 아니라서 플레이어 체력을 고정해 결정적으로 만든다.
    battle.party[0].maxHp = 999;
    battle.party[0].hp = 999;

    const result = resolvePlayerMove(battle, 'influenza_spread', 1);

    expect(result.lastLog).toContain('학습 피드백');
    expect(result.lastLog).toContain(enemy.scientificName);
    expect(result.lastLog).not.toContain('기술 타입과 방어특성/태그 상성이 피해량을 결정합니다.');
  });

  it('stacks move symptoms separately from battle effects', () => {
    const state = createInitialRunState('challenge');
    state.floor = 5;
    const battle = enterBattle(state, 0);

    const result = resolvePlayerMove(battle, 'cholera_toxin', 1);

    expect(result.enemy?.symptoms).toContain('쌀뜨물 설사');
    expect(result.enemy?.effects.length).toBeGreaterThan(0);
  });

  it('scales boss defense traits by each ten-floor bracket', () => {
    const floor10 = createInitialRunState();
    floor10.floor = 10;
    const boss10 = enterBattle(floor10);

    const floor20 = createInitialRunState();
    floor20.floor = 20;
    const boss20 = enterBattle(floor20);

    expect(boss10.enemy?.abilities).toHaveLength(1);
    expect(boss20.enemy?.abilities).toHaveLength(2);
  });

  it('uses the stored run boss roster for ten-floor boss encounters', () => {
    const state = createInitialRunState('challenge', 'character', 'anthrax', () => 0, ['red', 'blue']);

    state.floor = 10;
    const floor10 = enterBattle(state);

    state.floor = 20;
    const floor20 = enterBattle(state);

    expect(floor10.enemy?.templateId).toBe('red');
    expect(floor20.enemy?.templateId).toBe('blue');
  });

  it('normal human enemies do not expose defense traits', () => {
    const state = createInitialRunState();
    state.floor = 5;

    const battle = enterBattle(state, 0);

    expect(battle.encounterKind).toBe('trainer');
    expect(battle.enemy?.isTrainer).toBe(true);
    expect(battle.enemy?.isBoss).toBe(false);
    expect(battle.enemy?.abilities).toEqual([]);
  });

  it('captures a fresh party member instead of the damaged battle clone', () => {
    const battle = enterBattle(createInitialRunState());
    if (!battle.enemy) throw new Error('enemy missing');
    battle.enemy.hp = 1;
    battle.enemy.effects.push({ kind: 'dot', power: 4, turns: 2 });
    battle.enemy.stunned = true;
    battle.enemy.fainted = true;

    const result = resolveCapsuleAction(battle, 0);
    const captured = result.party[1];

    expect(captured.hp).toBe(captured.maxHp);
    expect(captured.effects).toEqual([]);
    expect(captured.stunned).toBe(false);
    expect(captured.fainted).toBe(false);
  });

  it('applies confusion from enterotoxin when status chance is deterministic', () => {
    const originalEffects = MOVES.enterotoxin.effects;
    MOVES.enterotoxin.effects = [
      { kind: 'status', status: 'confusion', chance: 1, turns: 2, target: 'enemy' },
    ];

    try {
      // 패시몬끼리는 싸우지 않는다. 전투는 트레이너·보스와만 성립하므로 5층(트레이너)에서 확인한다.
      const battle = enterBattle({ ...createInitialRunState(), floor: 5 });
      if (!battle.enemy) throw new Error('enemy missing');

      const result = resolvePlayerMove(battle, 'enterotoxin', 1);

      expect(result.enemy?.effects).toContainEqual({ kind: 'confusion', turns: 1 });
    } finally {
      MOVES.enterotoxin.effects = originalEffects;
    }
  });

  it('lets a surviving enemy take a turn after the player acts', () => {
    // 패시몬끼리는 싸우지 않는다. 전투는 트레이너·보스와만 성립하므로 5층(트레이너)에서 확인한다.
    const battle = enterBattle({ ...createInitialRunState(), floor: 5 });
    if (!battle.enemy) throw new Error('enemy missing');
    battle.enemy.moveset = ['hiv_cd4'];
    battle.enemy.plannedMoveId = 'hiv_cd4';
    battle.enemy.plannedMoveIds = ['hiv_cd4'];
    const startingHp = battle.party[0].hp;

    const result = resolvePlayerMove(battle, 'coagulase', 1);

    expect(result.phase).toBe('battle');
    expect(result.party[0].hp).toBeLessThan(startingHp);
    expect(result.lastLog).toContain('CD4');
  });

  it('ticks round-end effects after both sides act', () => {
    // 패시몬끼리는 싸우지 않는다. 전투는 트레이너·보스와만 성립하므로 5층(트레이너)에서 확인한다.
    const battle = enterBattle({ ...createInitialRunState(), floor: 5 });
    if (!battle.enemy) throw new Error('enemy missing');
    battle.enemy.effects.push({ kind: 'dot', power: 4, turns: 2 });
    const startingEnemyHp = battle.enemy.hp;

    const result = resolvePlayerMove(battle, 'coagulase', 1);

    expect(result.enemy?.hp).toBe(startingEnemyHp - 4);
    expect(result.enemy?.effects).toContainEqual({ kind: 'dot', power: 4, turns: 1 });
  });

  it('switches to a benched pathimon without a wild enemy attack', () => {
    const firstBattle = enterBattle(createInitialRunState());
    if (!firstBattle.enemy) throw new Error('enemy missing');
    firstBattle.enemy.hp = 1;
    const captured = resolveCapsuleAction(firstBattle, 0);
    const secondBattle = advanceFromShop(captured);
    const benchedHp = secondBattle.party[1].hp;

    const result = resolveSwitchMonster(secondBattle, 1);

    expect(result.activeIndex).toBe(1);
    expect(result.phase).toBe('battle');
    expect(result.party[1].hp).toBe(benchedHp);
    expect(result.lastLog).toContain('나왔다');
  });

  it('switches to a benched pathimon without consuming the turn or changing the telegraph', () => {
    const state = createInitialRunState('challenge');
    state.floor = 5;
    const battle = enterBattle(state, 0);
    battle.party.push({ ...battle.party[0], templateId: 'tb', name: '결핵잠' });
    const benchedHp = battle.party[1].hp;

    const announcedMoveIds = [...(battle.enemy?.plannedMoveIds ?? [])];
    const result = resolveSwitchMonster(battle, 1);

    expect(result.encounterKind).toBe('trainer');
    expect(result.activeIndex).toBe(1);
    expect(result.party[1].hp).toBe(benchedHp);
    expect(result.enemy?.plannedMoveIds).toEqual(announcedMoveIds);
    expect(result.battleActionLog).toBeUndefined();
  });

  it('asks which party member to release when capturing with a full party', () => {
    const initial = createInitialRunState();
    const firstWildPathimon = wildMonsterForRun(initial);
    const battle = enterBattle(initial);
    if (!battle.enemy) throw new Error('enemy missing');
    battle.enemy.hp = 1;
    while (battle.party.length < 6) {
      battle.party.push({ ...battle.party[0], templateId: `reserve-${battle.party.length}`, name: `예비${battle.party.length}` });
    }

    const result = resolveCapsuleAction(battle, 0);

    expect(result.phase).toBe('releaseCapture');
    expect(result.party).toHaveLength(6);
    expect(result.pendingCapture?.templateId).toBe(firstWildPathimon.id);
    expect(result.lastLog).toContain('놓아줄');
  });

  it('replaces the selected party member with a pending capture', () => {
    const initial = createInitialRunState();
    const firstWildPathimon = wildMonsterForRun(initial);
    const battle = enterBattle(initial);
    if (!battle.enemy) throw new Error('enemy missing');
    battle.enemy.hp = 1;
    while (battle.party.length < 6) {
      battle.party.push({ ...battle.party[0], templateId: `reserve-${battle.party.length}`, name: `예비${battle.party.length}` });
    }
    const fullPartyCapture = resolveCapsuleAction(battle, 0);

    const result = resolveCaptureRelease(fullPartyCapture, 2);

    expect(result.phase).toBe('floorClear');
    expect(result.party).toHaveLength(6);
    expect(result.party[2].templateId).toBe(firstWildPathimon.id);
    expect(result.pendingCapture).toBeUndefined();
  });

  it('can give up a pending full-party capture', () => {
    const battle = enterBattle(createInitialRunState());
    if (!battle.enemy) throw new Error('enemy missing');
    battle.enemy.hp = 1;
    while (battle.party.length < 6) {
      battle.party.push({ ...battle.party[0], templateId: `reserve-${battle.party.length}`, name: `예비${battle.party.length}` });
    }
    const fullPartyCapture = resolveCapsuleAction(battle, 0);

    const result = cancelPendingCapture(fullPartyCapture);

    expect(result.phase).toBe('floorClear');
    expect(result.party).toHaveLength(6);
    expect(result.pendingCapture).toBeUndefined();
  });

  it('asks for a replacement when the active pathimon faints and a reserve can battle', () => {
    const firstBattle = enterBattle(createInitialRunState('challenge'));
    if (!firstBattle.enemy) throw new Error('enemy missing');
    firstBattle.enemy.hp = 1;
    const captured = resolveCapsuleAction(firstBattle, 0);
    // 패시몬끼리는 싸우지 않는다. 포획은 야생 1층에서 하고, 전투 검증은 5층(트레이너)에서 한다.
    const secondBattle = enterBattle({ ...advanceFromShop(captured), floor: 5 });
    secondBattle.party[0].hp = 1;
    if (secondBattle.enemy) {
      secondBattle.enemy.hp = 999;
      secondBattle.enemy.maxHp = 999;
      secondBattle.enemy.moveset = ['hiv_cd4'];
      secondBattle.enemy.plannedMoveId = 'hiv_cd4';
      secondBattle.enemy.plannedMoveIds = ['hiv_cd4'];
    }

    const result = resolvePlayerMove(secondBattle, 'coagulase', 10);

    expect(result.phase).toBe('forcedSwitch');
    expect(result.activeIndex).toBe(0);
    expect(result.lastLog).toContain('다음 패시몬');
  });

  it('sends out a replacement after a forced faint switch without giving the enemy a free turn', () => {
    const firstBattle = enterBattle(createInitialRunState('challenge'));
    if (!firstBattle.enemy) throw new Error('enemy missing');
    firstBattle.enemy.hp = 1;
    const captured = resolveCapsuleAction(firstBattle, 0);
    const forced = advanceFromShop(captured);
    forced.phase = 'forcedSwitch';
    forced.party[0].hp = 0;
    forced.party[0].fainted = true;
    const reserveHp = forced.party[1].hp;

    const result = resolveForcedSwitchMonster(forced, 1);

    expect(result.phase).toBe('battle');
    expect(result.activeIndex).toBe(1);
    expect(result.party[1].hp).toBe(reserveHp);
    expect(result.lastLog).toContain('나왔다');
  });
  it('keeps the active pathimon when switching to an invalid slot', () => {
    const battle = enterBattle(createInitialRunState());

    const result = resolveSwitchMonster(battle, 1);

    expect(result.activeIndex).toBe(0);
    expect(result.lastLog).toContain('교체할 패시몬');
  });

  it('keeps the run BGM seed while advancing floors', () => {
    const state = createInitialRunState('challenge', 'character', 'anthrax', () => 0.42);
    state.phase = 'floorClear';

    const next = advanceFromShop(state);

    expect(next.bgmSeed).toBe(state.bgmSeed);
  });

  it('does not spend capsules when capture is blocked against a boss', () => {
    const state = createInitialRunState();
    state.floor = TOTAL_FLOORS;
    const battle = enterBattle(state);

    const result = resolveCapsuleAction(battle, 0);

    expect(result.phase).toBe('battle');
    expect(result.capsules).toBe(5);
    expect(result.party).toHaveLength(1);
  });

  it('does not auto-heal when challenge mode advances from maintenance', () => {
    const state = createInitialRunState('challenge');
    state.phase = 'shop';
    state.party[0].hp = 1;

    const result = advanceFromShop(state);

    expect(result.floor).toBe(2);
    expect(result.phase).toBe('battle');
    expect(result.party[0].hp).toBe(1);
  });

  it('builds a six-slot maintenance inventory and disables purchased direct items', () => {
    const state = createInitialRunState('challenge');
    state.floor = 5;
    state.phase = 'shop';
    state.money = 5;
    state.shopInventory = undefined;

    const first = purchaseShopItem(state, 'slot-potion-b');

    expect(first.shopInventory).toHaveLength(6);
    expect(first.shopInventory?.filter((item) => item.kind === 'capsule')).toHaveLength(1);
    expect(first.shopInventory?.find((item) => item.id === 'slot-potion-b')?.purchased).toBe(true);
    expect(first.money).toBe(2);
  });

  it('adds purchased maintenance capsules to the matching capsule inventory', () => {
    const state = createInitialRunState('challenge');
    state.floor = 5;
    state.phase = 'shop';
    state.money = 5;
    state.shopInventory = undefined;
    const inventory = purchaseShopItem(state, 'slot-capsule-a').shopInventory;
    const capsule = inventory?.find((item) => item.id === 'slot-capsule-a');
    if (!capsule?.capsuleId) throw new Error('capsule missing');

    const result = purchaseShopItem(state, 'slot-capsule-a');

    expect(result.capsuleInventory[capsule.capsuleId]).toBe(1);
    expect(result.capsules).toBe(6);
    expect(result.lastLog).toContain(capsule.name);
  });

  it('starts maintenance refreshes free and then increases the cost by one each time', () => {
    const state = createInitialRunState('challenge');
    state.floor = 5;
    state.phase = 'shop';
    state.money = 3;
    state.shopInventory = undefined;

    expect(maintenanceRefreshCost(state)).toBe(0);
    const first = refreshMaintenanceInventory(state, 0);
    expect(first.money).toBe(3);
    expect(first.shopRefreshCount).toBe(1);
    expect(maintenanceRefreshCost(first)).toBe(1);

    const second = refreshMaintenanceInventory(first, 0.2);
    expect(second.money).toBe(2);
    expect(second.shopRefreshCount).toBe(2);
    expect(maintenanceRefreshCost(second)).toBe(2);

    const third = refreshMaintenanceInventory(second, 0.4);
    expect(third.money).toBe(0);
    expect(third.shopRefreshCount).toBe(3);
    expect(maintenanceRefreshCost(third)).toBe(3);
    expect(third.shopInventory).toHaveLength(6);
    expect(third.shopInventory?.map((item) => item.name)).not.toEqual(second.shopInventory?.map((item) => item.name));
    expect(third.shopInventory?.some((item) => item.purchased)).toBe(false);
    expect(third.lastLog).toContain('새로고침');
  });

  it('blocks maintenance refreshes when the increasing cost exceeds money', () => {
    const state = createInitialRunState('challenge');
    state.floor = 5;
    state.phase = 'shop';
    state.money = 0;
    state.shopRefreshCount = 1;

    const result = refreshMaintenanceInventory(state, 0.4);

    expect(result.money).toBe(0);
    expect(result.shopRefreshCount).toBe(1);
    expect(result.lastLog).toContain('자금이 부족');
  });

  it('asks for a party target before using a basic maintenance potion', () => {
    const state = createInitialRunState('challenge');
    state.floor = 5;
    state.phase = 'shop';
    state.money = 5;
    state.party[0].hp = 1;

    const result = purchaseShopItem(state, 'slot-potion-a');

    expect(result.money).toBe(5);
    expect(result.party[0].hp).toBe(1);
    expect(result.shopInventory?.find((item) => item.id === 'slot-potion-a')?.purchased).toBe(false);
    expect(result.lastLog).toContain('선택');
  });

  it('spends one money to heal the selected pathimon with a basic maintenance potion', () => {
    const state = createInitialRunState('challenge');
    state.floor = 5;
    state.phase = 'shop';
    state.money = 5;
    state.party.push({ ...state.party[0], templateId: 'tb', name: '결핵잠', hp: 1 });
    state.party[0].hp = 1;

    const result = purchaseShopItemForPartyMember(state, 'slot-potion-a', 0);

    expect(result.money).toBe(4);
    expect(result.party[0].hp).toBe(result.party[0].maxHp);
    expect(result.party[1].hp).toBe(1);
    expect(result.shopInventory?.find((item) => item.id === 'slot-potion-a')?.purchased).toBe(true);
    expect(result.lastLog).toContain(state.party[0].name);
  });

  it('heals every owned pathimon when an advanced maintenance potion is purchased', () => {
    const state = createInitialRunState('challenge');
    state.floor = 5;
    state.phase = 'shop';
    state.money = 5;
    state.party.push({ ...state.party[0], templateId: 'tb', name: '결핵잠', hp: 1 });
    state.party[0].hp = 1;

    const result = purchaseShopItem(state, 'slot-potion-b');

    expect(result.money).toBe(2);
    expect(result.party.every((monster) => monster.hp === monster.maxHp)).toBe(true);
    expect(result.lastLog).toContain('모든 패시몬');
  });

  it('asks for a party target before using rare candy', () => {
    const state = createInitialRunState('challenge', 'character', ['anthrax', 'tb']);
    state.phase = 'shop';
    state.money = 3;
    state.activeIndex = 0;
    state.shopInventory = undefined;

    const result = purchaseShopItem(state, 'slot-rare-candy');

    expect(result.money).toBe(3);
    expect(result.party[0].signatureUnlocked).toBe(false);
    expect(result.shopInventory?.find((item) => item.id === 'slot-rare-candy')?.purchased).toBe(false);
    expect(result.lastLog).toContain('선택');
  });

  it('uses rare candy to unlock only the selected pathimon signature move', () => {
    const state = createInitialRunState('challenge', 'character', ['anthrax', 'tb']);
    state.phase = 'shop';
    state.money = 3;
    state.activeIndex = 1;
    state.shopInventory = undefined;

    const result = purchaseShopItemForPartyMember(state, 'slot-rare-candy', 0);

    expect(result.party[0].signatureUnlocked).toBe(true);
    expect(result.party[1].signatureUnlocked).toBe(false);
    expect(result.shopInventory?.find((item) => item.id === 'slot-rare-candy')?.purchased).toBe(true);
    expect(result.lastLog).toContain('전용기');
  });

  it('keeps money unchanged when an evolution stone is used on a non-evolving pathimon', () => {
    const state = createInitialRunState('challenge', 'character', 'anthrax');
    state.phase = 'shop';
    state.money = 3;

    const result = purchaseShopItemForPartyMember(state, 'slot-evolution-stone', 0);

    expect(result.money).toBe(3);
    expect(result.party[0].templateId).toBe('anthrax');
    expect(result.shopInventory?.find((item) => item.id === 'slot-evolution-stone')?.purchased).toBe(false);
    expect(result.lastLog).toContain('진화할 수 없습니다');
  });

  it('uses an evolution stone to evolve a selected pathimon when an evolution is available', () => {
    const larva: MonsterData = {
      id: 'trichinella-larva',
      name: 'Trichinella spiralis-유충',
      scientificName: '선모충 (Trichinella spiralis)',
      category: '연충',
      glyph: 'TRL',
      tags: { wall: 'nematode', stage: 'larva_adult' },
      maxHp: 30,
      attack: 5,
      defense: 3,
      speed: 4,
      captureRate: 0.3,
      ability: 'large_resistance',
      learnset: ['ascaris_migration'],
      prep: 'ascaris_migration',
      evolvesTo: 'trichinella-adult',
    };
    const adult: MonsterData = {
      ...larva,
      id: 'trichinella-adult',
      name: 'Trichinella spiralis-성충',
      glyph: 'TRA',
      maxHp: 60,
      attack: 9,
      learnset: ['ascaris_obstruction'],
      prep: 'ascaris_obstruction',
      evolvesTo: undefined,
    };
    const state = createInitialRunState('challenge');
    state.phase = 'shop';
    state.money = 3;
    state.party[0] = {
      ...state.party[0],
      templateId: larva.id,
      name: larva.name,
      scientificName: larva.scientificName,
      category: larva.category,
      glyph: larva.glyph,
      tags: { ...larva.tags },
      maxHp: larva.maxHp,
      hp: 12,
      attack: larva.attack,
      defense: larva.defense,
      speed: larva.speed,
      captureRate: larva.captureRate,
      ability: larva.ability,
      moveset: [...larva.learnset],
      moveSlots: [larva.prep ?? null, null, null, null],
      signatureUnlocked: false,
    };

    const result = purchaseShopItemForPartyMember(state, 'slot-evolution-stone', 0, [larva, adult]);

    expect(result.party[0].templateId).toBe('trichinella-adult');
    expect(result.party[0].name).toBe('Trichinella spiralis-성충');
    expect(result.party[0].hp).toBe(24);
    expect(result.party[0].moveSlots?.[0]).toBe('ascaris_obstruction');
    expect(result.party[0].signatureUnlocked).toBe(false);
    expect(result.lastLog).toContain('진화');
  });

  it('enables evolution stones for note-derived parasite stage forms', () => {
    const state = createInitialRunState('challenge', 'character', 'ascaris');
    state.phase = 'shop';
    state.money = 3;

    expect(canUseEvolutionStoneOnPartyMember(state, 0)).toBe(true);

    const result = purchaseShopItemForPartyMember(state, 'slot-evolution-stone', 0);

    expect(result.party[0].templateId).toBe('ascaris_larva');
    expect(result.party[0].name).toContain('유충');
    expect(result.party[0].hp).toBe(result.party[0].maxHp);
    expect(result.party[0].attack).toBeGreaterThan(state.party[0].attack);
    expect(result.lastLog).toContain('진화');
  });

  it('evolves a party member for free from the party screen in learning mode', () => {
    const state = createInitialRunState('learning', 'character', 'ascaris');
    state.money = 0;
    state.party[0].hp = 7;
    state.party[0].battlesCompleted = EVOLUTION_REQUIRED_BATTLES;

    expect(canEvolvePartyMember(state, 0)).toBe(true);

    const result = evolvePartyMember(state, 0);

    expect(result.money).toBe(0);
    expect(result.party[0].templateId).toBe('ascaris_larva');
    expect(result.party[0].hp).toBe(
      Math.round(result.party[0].maxHp * (7 / state.party[0].maxHp)),
    );
    expect(result.party[0].attack).toBeGreaterThan(state.party[0].attack);
    expect(result.lastLog).toContain('진화');
    // 다음 단계도 다시 한 번 싸워야 한다.
    expect(result.party[0].battlesCompleted).toBe(0);
  });

  it('refuses a free evolution until the pathimon has finished a battle, and says so only when pressed', () => {
    const state = createInitialRunState('learning', 'character', 'ascaris');
    state.party[0].battlesCompleted = 0;

    // 조건은 메뉴에 미리 표시하지 않는다. 진화 항목 자체는 그대로 뜬다.
    expect(canEvolvePartyMember(state, 0)).toBe(true);

    const result = evolvePartyMember(state, 0);

    expect(result.party[0].templateId).toBe('ascaris');
    expect(result.lastLog).toContain('아직 전투 경험이 없습니다');
  });

  it('counts a finished battle only for pathimon that actually used a move', () => {
    const state = createInitialRunState('learning');
    state.party.push(createMonsterInstance(NOTE_MONSTERS[1]));
    const battle = enterBattle({ ...state, floor: 5 });
    if (!battle.enemy) throw new Error('no enemy');

    // 나가기만 한 상태에서는 아직 참전이 아니다.
    expect(battle.party[0].enteredCurrentBattle).toBeFalsy();

    battle.enemy.hp = 1;
    const won = resolvePlayerMove(battle, 'hyaluronidase', 1, 0, 0);

    expect(won.phase).not.toBe('battle');

    expect(won.party[0].battlesCompleted).toBe(1);
    // 벤치에 앉아만 있던 패시몬은 세지 않는다.
    expect(won.party[1].battlesCompleted ?? 0).toBe(0);
  });

  it('does not count passing an encounter as a finished battle', () => {
    const state = createInitialRunState('learning');
    const battle = enterBattle(state);

    const passed = resolvePassEncounter(battle);

    expect(passed.party[0].battlesCompleted ?? 0).toBe(0);
  });

  it('resets stat stages when a pathimon switches out, like the main series', () => {
    const state = createInitialRunState('learning');
    state.party.push(createMonsterInstance(NOTE_MONSTERS[1]));
    const battle = enterBattle({ ...state, floor: 5 });
    battle.party[0].effects.push({ kind: 'buff', stat: 'attack', pct: 50, rank: 1, turns: 99 });
    battle.party[0].effects.push({ kind: 'field', side: 'incoming', factor: 0.5, turns: 2 });

    const switched = resolveSwitchMonster(battle, 1);

    expect(switched.party[0].effects.some((effect) => effect.kind === 'buff')).toBe(false);
    // 랭크만 초기화한다. 다른 지속 효과는 건드리지 않는다.
    expect(switched.party[0].effects.some((effect) => effect.kind === 'field')).toBe(true);
  });

  it('leaves the party untouched when a free evolution has no target', () => {
    const state = createInitialRunState('learning', 'character', 'anthrax');

    expect(canEvolvePartyMember(state, 0)).toBe(false);

    const result = evolvePartyMember(state, 0);

    expect(result.party[0].templateId).toBe('anthrax');
    expect(result.lastLog).toContain('진화할 수 없습니다');
  });

  it('spends one money to fully heal a selected pathimon in maintenance', () => {
    const state = createInitialRunState('challenge');
    state.money = 2;
    state.party[0].hp = 1;
    state.party[0].effects.push({ kind: 'dot', power: 4, turns: 2 });
    state.party[0].stunned = true;

    const result = healPartyMember(state, 0);

    expect(result.money).toBe(1);
    expect(result.party[0].hp).toBe(result.party[0].maxHp);
    expect(result.party[0].effects).toEqual([]);
    expect(result.party[0].stunned).toBe(false);
    expect(result.lastLog).toContain('회복');
  });

  it('keeps money and hp unchanged when maintenance healing is unaffordable', () => {
    const state = createInitialRunState('challenge');
    state.money = 0;
    state.party[0].hp = 1;

    const result = healPartyMember(state, 0);

    expect(result.money).toBe(0);
    expect(result.party[0].hp).toBe(1);
    expect(result.lastLog).toContain('자금');
  });
  it('advances from shop to the next battle floor', () => {
    const state = createInitialRunState();
    state.phase = 'shop';

    const result = advanceFromShop(state);

    expect(result.floor).toBe(2);
    expect(result.phase).toBe('battle');
  });

  it('keeps the current lead pathimon after maintenance advances to the next floor', () => {
    const state = createInitialRunState('challenge', 'character', ['anthrax', 'cereus']);
    state.phase = 'shop';
    state.activeIndex = 1;

    const result = advanceFromShop(state);

    expect(result.floor).toBe(2);
    expect(result.activeIndex).toBe(1);
    expect(result.party[result.activeIndex].templateId).toBe('cereus');
  });

  it('can expose move descriptions through move data', () => {
    expect(MOVES.influenza_spread.description).toContain('뉴라미니다제');
    expect(MOVES.cholera_toxin.learnText).toContain('쌀뜨물');
  });
});

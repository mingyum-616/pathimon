import { tryCapture } from './capture';
import { calculateDamage, randomDamageVariance, rollsCriticalHit, type DamageResult } from './damage';
import { applyAttackTriggeredStatusDamage, applyEffects, tickEffects } from './effects';
import { ABILITIES } from '../data/abilities';
import { capsuleCanCatch, CAPSULE_LABELS, cloneCapsuleInventory, totalCapsules } from '../data/capsules';
import { createMaintenanceInventory } from '../data/shop';
import {
  accuracyMultiplier,
  actionFailureChance,
  actionFailureLabel,
  clampHpToEffectiveMax,
  statusConditionStacks,
} from '../data/statusConditions';
import { TAG_LABELS } from '../data/labels';
import { MOVES } from '../data/moves';
import { MONSTERS } from '../data/monsters';
import { interpolatePathimonName } from '../game/text';
import {
  conciseLearningFeedback,
  contextualLearningPoint,
  randomLearningPoint,
} from '../game/learning';
import { createMonsterInstance } from '../state/factory';
import { bossMoveEffectiveness, chooseBossMove, chooseEffectiveBossMove, createBossDefenseProfile } from './bossMatchup';
import { advanceStagedMove, currentMoveData, resolveMoveOutcome } from './moveStages';
import type { AbilityId, CapsuleId, HitEffectiveness, MoveData, MoveId, RunState, RuntimeMonster } from '../types/game';

const WIN_REWARD = 5;
const MAX_PARTY_SIZE = 6;

interface EnemyTurnResult {
  hitEffectiveness?: HitEffectiveness;
  log: string;
}

type CriticalRandomSource = () => number;

const noCriticalRandom: CriticalRandomSource = () => 1;

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

function cloneState(state: RunState): RunState {
  return {
    ...state,
    capsuleInventory: cloneCapsuleInventory(state.capsuleInventory),
    wildRosterIds: state.wildRosterIds ? [...state.wildRosterIds] : undefined,
    bossRosterIds: state.bossRosterIds ? [...state.bossRosterIds] : undefined,
    party: state.party.map(cloneMonster),
    enemy: state.enemy ? cloneMonster(state.enemy) : null,
    pendingCapture: state.pendingCapture ? cloneMonster(state.pendingCapture) : undefined,
    pendingCaptureCapsuleId: state.pendingCaptureCapsuleId,
    shopInventory: state.shopInventory?.map((item) => ({ ...item })),
    shopRefreshCount: state.shopRefreshCount,
    battleStatUpCue: state.battleStatUpCue ? { ...state.battleStatUpCue } : undefined,
  };
}

function defenseAbilityIds(monster: RuntimeMonster): AbilityId[] {
  const abilities = monster.abilities?.length ? monster.abilities : [monster.ability];
  return abilities.filter((ability) => ability !== 'none');
}

function describeTags(monster: RuntimeMonster): string {
  const labels = (Object.values(monster.tags) as Array<keyof typeof TAG_LABELS | undefined>)
    .filter((tag): tag is keyof typeof TAG_LABELS => Boolean(tag))
    .map((tag) => TAG_LABELS[tag]);

  return labels.length > 0 ? labels.join(', ') : '태그 정보 없음';
}

function describeAbilities(monster: RuntimeMonster): string {
  const abilities = defenseAbilityIds(monster);
  return abilities.length > 0 ? abilities.map((abilityId) => ABILITIES[abilityId].name).join(', ') : '없음';
}

function defaultLearningDetail(state: RunState): string {
  const enemy = state.enemy;
  if (!enemy) {
    return '전투에서는 병원체의 외피, 위치, 방어기전을 함께 읽어야 합니다.';
  }

  return `${enemy.name}(${enemy.scientificName})은 ${enemy.category}이며 ${describeTags(enemy)} 특징을 가집니다. 방어특성은 ${describeAbilities(enemy)}입니다.`;
}

function playerMoveLearningDetail(state: RunState, move: MoveData, result: DamageResult): string {
  const noteText = result.multiplier.notes.length > 0 ? ` ${result.multiplier.notes.join(', ')}.` : '';
  const learningPoint = contextualLearningPoint(state.party[state.activeIndex], move.id) || move.learnText;
  return `${defaultLearningDetail(state)} ${move.name}은 ${learningPoint} 현재 상성 배율은 ${result.multiplier.total}배입니다.${noteText}`;
}

function withLearningFeedback(state: RunState, message: string, detail = defaultLearningDetail(state)): string {
  if (state.mode !== 'learning') {
    return message;
  }

  return `${message} 학습 피드백: ${detail}`;
}

function battleLearnText(state: RunState, move: MoveData): string {
  return contextualLearningPoint(state.party[state.activeIndex], move.id) || move.learnText;
}

function formatBattleActionLog(
  state: RunState,
  actorLog: string,
  enemyLog: string,
  learningText?: string,
): string {
  const lines = [actorLog.trim(), enemyLog.trim()].filter((line) => line.length > 0);
  if (state.mode === 'learning' && learningText?.trim()) {
    const feedback = conciseLearningFeedback(learningText);
    if (feedback) lines.push(`학습 피드백: ${feedback}`);
  }
  return lines.join('\n\n');
}

function clearBattleOnlyState(monster: RuntimeMonster): RuntimeMonster {
  return {
    ...monster,
    effects: [],
    statusConditions: {},
    symptoms: [],
    symptomAttributions: [],
    stunned: false,
    fainted: monster.hp <= 0,
    usedSignatureMoveIds: [],
  };
}

function partyProgressText(state: RunState): string {
  const categoryCount = new Set(state.party.map((monster) => monster.category)).size;
  return `파티 ${state.party.length}/${MAX_PARTY_SIZE} · 계열 ${categoryCount}종`;
}

function victoryProgressDetail(state: RunState, reward: number): string {
  if (state.mode === 'learning') {
    return `학습모드 보상: 다음 층 시작 전 전원 회복 · ${partyProgressText(state)}`;
  }

  return `승리 보상 +${reward}원 · ${partyProgressText(state)}`;
}

function maintenanceVictoryLog(state: RunState, reward: number): string {
  const detail = victoryProgressDetail(state, reward);
  if (state.encounterKind === 'boss') {
    return `보스 전투에서 승리했습니다. 정비 구역에 도착했습니다.\n${detail}`;
  }

  return `사람 전투에서 승리했습니다. 정비 구역에 도착했습니다.\n${detail}`;
}

function pathimonMemoDetail(monster: RuntimeMonster): string {
  const memo = randomLearningPoint(monster) || `${monster.scientificName}은 ${monster.category} 타입입니다.`;
  return memo.trim();
}

function floorClearLog(state: RunState, message: string, detail?: string): string {
  return [`${state.floor}층 클리어`, message, detail].filter((line): line is string => Boolean(line?.trim())).join('\n');
}

function setWinState(state: RunState, message: string, _learningDetail?: string, resultDetail?: string): RunState {
  const shouldOpenShop = state.mode === 'challenge' && (state.encounterKind === 'trainer' || state.encounterKind === 'boss');
  const reward = shouldOpenShop ? WIN_REWARD : 0;
  const detail = resultDetail
    ? `${resultDetail}\n${partyProgressText(state)}`
    : victoryProgressDetail(state, reward);
  const battleResultLog = floorClearLog(state, message, detail);

  return {
    ...state,
    money: state.money + reward,
    party: state.party.map(clearBattleOnlyState),
    phase: shouldOpenShop ? 'shop' : 'floorClear',
    lastLog: shouldOpenShop ? maintenanceVictoryLog(state, reward) : battleResultLog,
    battleResultLog,
    shopInventory: shouldOpenShop ? createMaintenanceInventory(state.floor) : undefined,
    shopRefreshCount: shouldOpenShop ? 0 : undefined,
  };
}

function canEnterBattle(monster: RuntimeMonster | undefined): monster is RuntimeMonster {
  return Boolean(monster && monster.hp > 0 && !monster.fainted && !monster.sealedByBoss);
}

function hasAvailableReplacement(state: RunState): boolean {
  return state.party.some((monster, index) => index !== state.activeIndex && canEnterBattle(monster));
}

function setCollapsedState(state: RunState, actor: RuntimeMonster): RunState {
  if (hasAvailableReplacement(state)) {
    state.phase = 'forcedSwitch';
    state.lastLog = `${actor.name} 쓰러졌습니다. 다음 패시몬을 내보내세요.`;
    return state;
  }

  state.phase = 'defeat';
  state.lastLog = `${actor.name}이 쓰러졌습니다. 더 이상 전투 가능한 패시몬이 없습니다.`;
  return state;
}

function defeatedOpponentMessage(enemy: RuntimeMonster, byOngoingEffects = false): string {
  const cause = byOngoingEffects ? '지속 효과를 버티지 못하고 ' : '';

  if (enemy.isBoss) {
    return `${enemy.name}이 ${cause}"대응 체계를 다시 짜야겠군." 하고 물러났다.`;
  }

  if (enemy.isTrainer) {
    return `${enemy.name}이 ${cause}"여기까지입니다. 다음 대응안을 준비하겠습니다." 하고 물러났다.`;
  }

  return `${enemy.name}이 ${cause}쓰러졌다.`;
}

function markDamage(monster: RuntimeMonster, damage: number): void {
  monster.hp = Math.max(0, monster.hp - damage);
  clampHpToEffectiveMax(monster);
}

function hitEffectivenessFromMultiplier(total: number, blockedByInvulnerability = false): HitEffectiveness {
  if (blockedByInvulnerability || total <= 0) return 'none';
  return total > 1 ? 'super' : 'normal';
}

function criticalHitText(result: DamageResult): string {
  return result.critical ? ' 급소에 맞았다!' : '';
}

function statusDamageLog(actor: RuntimeMonster, actorDamage: number, enemy: RuntimeMonster, enemyDamage: number): string {
  const damagedNames: string[] = [];
  if (enemyDamage > 0) damagedNames.push(enemy.name);
  if (actorDamage > 0) damagedNames.push(actor.name);

  if (damagedNames.length === 0) {
    return '';
  }

  return damagedNames.map((name) => `${name}은 상태이상에 의해 피해를 받고 있다.`).join('\n');
}

function appendSymptom(monster: RuntimeMonster, symptom: string | undefined, sourceName: string): void {
  if (!symptom) {
    return;
  }

  monster.symptoms = [...(monster.symptoms ?? []), symptom];
  const alreadyAttributed = monster.symptomAttributions?.some(
    (attribution) => attribution.symptom === symptom && attribution.sourceName === sourceName,
  );
  if (!alreadyAttributed) {
    monster.symptomAttributions = [
      ...(monster.symptomAttributions ?? []),
      { symptom, sourceName },
    ];
  }
}

function isSignatureMoveId(moveId: MoveId): boolean {
  const move = MOVES[moveId];
  return Boolean(move?.signature || move?.kind === 'signature');
}

// 준비기도 전용기처럼 전투당 1회. 단 해금 게이트는 없다. 사용 이력은 usedSignatureMoveIds를 공용으로 쓴다.
function isPrepMoveId(moveId: MoveId): boolean {
  return MOVES[moveId]?.kind === 'prep';
}

function signatureMoveUnavailableMessage(monster: RuntimeMonster, moveId: MoveId): string {
  if (isSignatureMoveId(moveId)) {
    if (monster.signatureUnlocked !== true) return '전용기가 아직 해금되지 않았습니다.';
    if (monster.usedSignatureMoveIds?.includes(moveId)) return '전용기는 전투당 한 번만 사용할 수 있습니다.';
    return '';
  }
  if (isPrepMoveId(moveId) && monster.usedSignatureMoveIds?.includes(moveId)) {
    return '준비기는 전투당 한 번만 사용할 수 있습니다.';
  }
  return '';
}

function markSignatureMoveUsed(monster: RuntimeMonster, moveId: MoveId): void {
  if (!isSignatureMoveId(moveId) && !isPrepMoveId(moveId)) return;
  const used = monster.usedSignatureMoveIds ?? [];
  monster.usedSignatureMoveIds = used.includes(moveId) ? used : [...used, moveId];
}

function formatMoveDescription(move: MoveData, actor: RuntimeMonster): string {
  return interpolatePathimonName(move.description, actor.name);
}

function sensoryMissLabel(actor: RuntimeMonster): string {
  const blindnessStacks = statusConditionStacks(actor, 'blindness');
  const hearingStacks = statusConditionStacks(actor, 'hearing_abnormal');
  if (blindnessStacks > 0 && hearingStacks > 0) return '감각 이상';
  if (hearingStacks > 0) return '청력 이상';
  return '시력 이상';
}

function missesFromSensoryAbnormality(actor: RuntimeMonster, roll = Math.random()): boolean {
  const hitChance = accuracyMultiplier(actor);
  return hitChance < 1 && roll >= hitChance;
}

// 마비·구토·가려움은 명중 판정 이전에 턴을 통째로 날린다.
function failsToAct(actor: RuntimeMonster, roll = Math.random()): boolean {
  const chance = actionFailureChance(actor);
  return chance > 0 && roll < chance;
}

function isHumanEnemy(enemy: RuntimeMonster): boolean {
  return Boolean(enemy.isBoss || enemy.isTrainer);
}

function bossUsesPhaseTwo(enemy: RuntimeMonster): boolean {
  return Boolean(enemy.isBoss && enemy.bossPhase2Activated);
}

function availablePartyTargets(party: RuntimeMonster[], activeIndex: number): RuntimeMonster[] {
  return party.filter((monster, index) => index !== activeIndex && canEnterBattle(monster));
}

function randomPartyTarget(party: RuntimeMonster[], activeIndex: number, random = Math.random): RuntimeMonster | undefined {
  const candidates = availablePartyTargets(party, activeIndex);
  if (candidates.length === 0) return undefined;
  const index = Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)));
  return candidates[index];
}

function chooseMoveForTarget(
  enemy: RuntimeMonster,
  target: RuntimeMonster,
  movePool: MoveId[] = enemy.moveset,
  preferEffective = false,
  random: () => number = Math.random,
): MoveId | undefined {
  const profile = createBossDefenseProfile(target);
  if (preferEffective) {
    return chooseEffectiveBossMove(movePool, profile, random) ?? chooseBossMove(movePool, profile, [], random);
  }
  return chooseBossMove(movePool, profile, [], random);
}

function planHumanMoves(
  enemy: RuntimeMonster,
  defender: RuntimeMonster,
  party: RuntimeMonster[] = [defender],
  activeIndex = 0,
  random: () => number = Math.random,
): MoveId[] {
  if (!isHumanEnemy(enemy)) {
    return enemy.moveset[0] ? [enemy.moveset[0]] : [];
  }

  if (enemy.plannedMoveIds?.length) {
    return enemy.plannedMoveIds;
  }

  if (enemy.plannedMoveId) {
    enemy.plannedMoveIds = [enemy.plannedMoveId];
    return enemy.plannedMoveIds;
  }

  if (!bossUsesPhaseTwo(enemy)) {
    const planned = chooseMoveForTarget(enemy, defender, enemy.moveset, false, random);
    enemy.plannedMoveIds = planned ? [planned] : [];
    enemy.plannedMoveId = planned;
    return enemy.plannedMoveIds;
  }

  enemy.bossPhase2Activated = true;
  const first = chooseMoveForTarget(enemy, defender, enemy.moveset, true, random);
  const secondTarget = randomPartyTarget(party, activeIndex, random) ?? defender;
  const secondPool = first ? enemy.moveset.filter((moveId) => moveId !== first) : enemy.moveset;
  const second = chooseMoveForTarget(
    enemy,
    secondTarget,
    secondPool.length > 0 ? secondPool : enemy.moveset,
    true,
    random,
  );
  const planned = [first, second].filter((moveId): moveId is MoveId => Boolean(moveId));

  enemy.plannedMoveIds = planned;
  enemy.plannedMoveId = planned[0];
  return planned;
}

function clearPlannedHumanMoves(enemy: RuntimeMonster): void {
  enemy.plannedMoveId = undefined;
  enemy.plannedMoveIds = [];
}

export function bossPhaseTwoDialogue(enemy: RuntimeMonster, floor: number): string[] {
  if (enemy.phase2Dialogue?.length) return [...enemy.phase2Dialogue];
  return floor <= 60 ? ['...'] : [];
}

export function activateBossPhaseTwo(state: RunState, random: () => number = Math.random): RunState {
  const nextState = cloneState(state);
  const enemy = nextState.enemy;
  const actor = nextState.party[nextState.activeIndex];
  if (!enemy?.isBoss || !actor || !enemy.bossPhase2Pending || enemy.hp <= 0) return nextState;

  enemy.bossPhase2Pending = false;
  enemy.bossPhase2Activated = true;
  clearPlannedHumanMoves(enemy);
  planHumanMoves(enemy, actor, nextState.party, nextState.activeIndex, random);
  return nextState;
}

export function applyFinalBossSkill(state: RunState, random: () => number = Math.random): RunState {
  const nextState = cloneState(state);
  const enemy = nextState.enemy;
  if (
    nextState.floor !== 100
    || !enemy?.isBoss
    || enemy.finalBossSkill !== 'seal'
    || enemy.finalBossSkillApplied
  ) {
    return nextState;
  }

  const candidates = nextState.party
    .map((monster, index) => ({ monster, index }))
    .filter(({ monster }) => canEnterBattle(monster));
  if (candidates.length === 0) return nextState;

  const selectedIndex = Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)));
  const selected = candidates[selectedIndex];
  const original = selected.monster;
  nextState.party[selected.index] = {
    ...original,
    templateId: `sealed_${original.templateId}`,
    name: '봉인 인형',
    scientificName: `${original.name}이 봉인된 대타 인형`,
    category: '봉인',
    glyph: 'DOLL',
    assetPath: 'images/pathimon/substitute-doll.png',
    assetBaseId: undefined,
    ability: 'none',
    abilities: [],
    moveset: [],
    moveSlots: [null, null, null, null],
    moveStages: {},
    effects: [],
    statusConditions: {},
    symptoms: [],
    symptomAttributions: [],
    stunned: false,
    sealedByBoss: true,
    sealedOriginalName: original.name,
    spriteCrop: { frontX: 0, backX: 64, width: 64, height: 64 },
  };
  enemy.finalBossSkillApplied = true;
  nextState.lastLog = `${enemy.name}의 ${enemy.finalBossSkillName ?? '봉인'}! ${original.name}이 인형에 봉인되었다.`;

  if (selected.index === nextState.activeIndex) {
    const replacementIndex = nextState.party.findIndex((monster, index) => index !== selected.index && canEnterBattle(monster));
    if (replacementIndex >= 0) {
      nextState.phase = 'forcedSwitch';
      nextState.lastLog += ' 다음 패시몬을 선택하세요.';
    } else {
      nextState.phase = 'defeat';
      nextState.lastLog += ' 더 이상 전투 가능한 패시몬이 없습니다.';
    }
  }

  return nextState;
}

function announcedTreatmentMultiplier(enemy: RuntimeMonster, defender: RuntimeMonster): number {
  const plannedMoveIds = enemy.plannedMoveIds?.length
    ? enemy.plannedMoveIds
    : [enemy.plannedMoveId].filter((moveId): moveId is MoveId => Boolean(moveId));

  return plannedMoveIds.reduce((highest, moveId) => {
    const move = MOVES[moveId];
    if (!move) return highest;
    return Math.max(highest, bossMoveEffectiveness(move, createBossDefenseProfile(defender)).multiplier);
  }, 1);
}

function resolveHumanMove(
  actor: RuntimeMonster,
  enemy: RuntimeMonster,
  moveId: MoveId,
  variance: number,
  criticalRandom: CriticalRandomSource,
): EnemyTurnResult {
  const enemyMove = MOVES[moveId];
  if (!enemyMove) {
    return { log: `${enemy.name} could not act.` };
  }

  const stagedMove = currentMoveData(enemyMove, enemy);
  if (failsToAct(enemy)) {
    return { log: `${enemy.name}의 ${stagedMove.name}!\n${enemy.name}은 ${actionFailureLabel(enemy)}으로 움직이지 못했다.` };
  }

  if (missesFromSensoryAbnormality(enemy)) {
    advanceStagedMove(enemy, enemyMove);
    applyAttackTriggeredStatusDamage(enemy);
    return { log: `${enemy.name}의 ${stagedMove.name}!\n${enemy.name}의 공격이 ${sensoryMissLabel(enemy)}으로 빗나갔다.` };
  }

  const resolvedMove = resolveMoveOutcome(stagedMove, Math.random());
  const effectiveness = bossMoveEffectiveness(resolvedMove, createBossDefenseProfile(actor));
  const enemyResult = calculateDamage(
    enemy,
    actor,
    resolvedMove,
    variance,
    { total: effectiveness.multiplier, notes: effectiveness.matchedTags },
    rollsCriticalHit(criticalRandom()),
  );

  markDamage(actor, enemyResult.damage);
  applyEffects(enemy, actor, resolvedMove.effects);
  appendSymptom(actor, resolvedMove.symptom, enemy.name);
  advanceStagedMove(enemy, enemyMove);
  applyAttackTriggeredStatusDamage(enemy);

  const label = effectiveness.kind === 'super'
    ? ' 효과가 굉장했다.'
    : effectiveness.kind === 'effective'
      ? ' 효과가 있다.'
      : '';

  return {
    hitEffectiveness: resolvedMove.power > 0 ? hitEffectivenessFromMultiplier(effectiveness.multiplier) : undefined,
    log: `${enemy.name}의 ${resolvedMove.name}!\n${formatMoveDescription(resolvedMove, enemy)}${label}${criticalHitText(enemyResult)}`,
  };
}

function resolveHumanTurn(
  actor: RuntimeMonster,
  enemy: RuntimeMonster,
  variance: number,
  party: RuntimeMonster[] = [actor],
  activeIndex = 0,
  criticalRandom: CriticalRandomSource = noCriticalRandom,
): EnemyTurnResult {
  const plannedMoveIds = planHumanMoves(enemy, actor, party, activeIndex);
  clearPlannedHumanMoves(enemy);

  if (plannedMoveIds.length === 0) {
    return { log: `${enemy.name} could not act.` };
  }

  const logs: string[] = [];
  let hitEffectiveness: EnemyTurnResult['hitEffectiveness'];

  for (const moveId of plannedMoveIds) {
    if (actor.hp <= 0) break;
    const result = resolveHumanMove(actor, enemy, moveId, variance, criticalRandom);
    logs.push(result.log);
    hitEffectiveness = result.hitEffectiveness ?? hitEffectiveness;
  }

  return { hitEffectiveness, log: logs.join('\n\n') };
}
function resolveEnemyTurn(
  actor: RuntimeMonster,
  enemy: RuntimeMonster,
  variance: number,
  party: RuntimeMonster[] = [actor],
  activeIndex = 0,
  criticalRandom: CriticalRandomSource = noCriticalRandom,
): EnemyTurnResult {
  if (enemy.stunned) {
    enemy.stunned = false;
    return { log: `${enemy.name} is stunned.` };
  }

  if (isHumanEnemy(enemy)) {
    return resolveHumanTurn(actor, enemy, variance, party, activeIndex, criticalRandom);
  }

  const enemyMoveId = enemy.moveset[0];
  const enemyMove = enemyMoveId ? MOVES[enemyMoveId] : undefined;
  if (!enemyMove) {
    return { log: `${enemy.name} could not act.` };
  }

  const stagedMove = currentMoveData(enemyMove, enemy);
  if (failsToAct(enemy)) {
    return { log: `${enemy.name}의 ${stagedMove.name}!\n${enemy.name}은 ${actionFailureLabel(enemy)}으로 움직이지 못했다.` };
  }

  if (missesFromSensoryAbnormality(enemy)) {
    advanceStagedMove(enemy, enemyMove);
    applyAttackTriggeredStatusDamage(enemy);
    return { log: `${enemy.name}의 ${stagedMove.name}!\n${enemy.name}의 공격이 ${sensoryMissLabel(enemy)}으로 빗나갔다.` };
  }

  const resolvedMove = resolveMoveOutcome(stagedMove, Math.random());
  const enemyResult = calculateDamage(enemy, actor, resolvedMove, variance, undefined, rollsCriticalHit(criticalRandom()));
  markDamage(actor, enemyResult.damage);
  applyEffects(enemy, actor, resolvedMove.effects);
  appendSymptom(actor, resolvedMove.symptom, enemy.name);
  advanceStagedMove(enemy, enemyMove);
  applyAttackTriggeredStatusDamage(enemy);
  return {
    hitEffectiveness: resolvedMove.power > 0
      ? hitEffectivenessFromMultiplier(enemyResult.multiplier.total, enemyResult.blockedByInvulnerability)
      : undefined,
    log: `${enemy.name}의 ${resolvedMove.name}!\n${formatMoveDescription(resolvedMove, enemy)}${criticalHitText(enemyResult)}`,
  };
}

function finishBattleRound(
  state: RunState,
  actor: RuntimeMonster,
  enemy: RuntimeMonster,
  actorLog: string,
  enemyTurn: EnemyTurnResult,
  learningDetail?: string,
  learningText?: string,
): RunState {
  const actorEffectDamage = tickEffects(actor);
  const enemyEffectDamage = tickEffects(enemy);
  const effectLog = statusDamageLog(actor, actorEffectDamage, enemy, enemyEffectDamage);
  state.battleActionLog = formatBattleActionLog(state, actorLog, enemyTurn.log, learningText);
  state.battleStatusLog = effectLog || undefined;
  state.battleStatusDamage = effectLog
    ? { player: actorEffectDamage, enemy: enemyEffectDamage }
    : undefined;
  state.lastLog = withLearningFeedback(
    state,
    [actorLog, enemyTurn.log, effectLog].filter((line) => line.trim().length > 0).join('\n\n'),
    learningDetail,
  );
  state.lastEnemyHitEffectiveness = enemyTurn.hitEffectiveness;

  if (enemy.hp <= 0) {
    return setWinState(state, defeatedOpponentMessage(enemy, true), learningDetail);
  }

  if (actor.hp <= 0) {
    return setCollapsedState(state, actor);
  }

  if (
    enemy.isBoss
    && enemy.hp > 0
    && enemy.hp <= enemy.maxHp / 2
    && !enemy.bossPhase2Activated
    && !enemy.bossPhase2Pending
  ) {
    enemy.bossPhase2Pending = true;
    clearPlannedHumanMoves(enemy);
  }
  if (isHumanEnemy(enemy) && actor.hp > 0 && enemy.hp > 0 && !enemy.bossPhase2Pending) {
    planHumanMoves(enemy, actor, state.party, state.activeIndex);
  }
  state.phase = 'battle';
  state.battleResultLog = undefined;
  return state;
}

export function resolvePlayerMove(
  state: RunState,
  moveId: MoveId,
  variance = randomDamageVariance(),
  outcomeRoll = Math.random(),
  hitRoll = Math.random(),
  criticalRandom: CriticalRandomSource = noCriticalRandom,
): RunState {
  const nextState = cloneState(state);
  nextState.battleStatUpCue = undefined;
  nextState.battleResultLog = undefined;
  nextState.battleActionLog = undefined;
  nextState.battleStatusLog = undefined;
  nextState.battleStatusDamage = undefined;
  nextState.lastEnemyHitEffectiveness = undefined;
  nextState.lastPlayerHitEffectiveness = undefined;
  const actor = nextState.party[nextState.activeIndex];
  const enemy = nextState.enemy;
  const move = MOVES[moveId];

  if (!actor || !enemy || !move) {
    return nextState;
  }

  if (actor.sealedByBoss) {
    nextState.lastLog = '봉인 인형은 기술을 사용할 수 없습니다.';
    return setCollapsedState(nextState, actor);
  }

  // 패시몬끼리는 싸우지 않는다. 야생 조우는 포획·통과 전용이고 전투는 보스·트레이너와만 성립한다.
  // `battleActionOptions`(ui/battleUi.ts)가 야생에서 `싸운다`를 아예 내주지 않지만,
  // 규칙이 UI에만 있으면 이 함수를 직접 부르는 쪽에서 깨진다. 여기서도 막는다.
  if (nextState.encounterKind === 'wild') {
    nextState.lastLog = '야생 패시몬과는 싸우지 않는다. 캡슐로 포획하거나 지나갈 수 있다.';
    return nextState;
  }

  const unavailableMessage = signatureMoveUnavailableMessage(actor, moveId);
  if (unavailableMessage) {
    nextState.phase = 'battle';
    nextState.lastLog = unavailableMessage;
    return nextState;
  }

  if (isHumanEnemy(enemy)) {
    planHumanMoves(enemy, actor, nextState.party, nextState.activeIndex);
  }

  const stagedMove = currentMoveData(move, actor);
  const resolvedMove = resolveMoveOutcome(stagedMove, outcomeRoll);
  markSignatureMoveUsed(actor, moveId);
  if (failsToAct(actor, hitRoll)) {
    const enemyLog = resolveEnemyTurn(actor, enemy, variance, nextState.party, nextState.activeIndex, criticalRandom);
    return finishBattleRound(
      nextState,
      actor,
      enemy,
      `${actor.name}의 ${stagedMove.name}!\n${actor.name}은 ${actionFailureLabel(actor)}으로 움직이지 못했다.`,
      enemyLog,
      defaultLearningDetail(nextState),
      battleLearnText(nextState, stagedMove),
    );
  }

  if (missesFromSensoryAbnormality(actor, hitRoll)) {
    advanceStagedMove(actor, move);
    applyAttackTriggeredStatusDamage(actor);
    const enemyLog = resolveEnemyTurn(actor, enemy, variance, nextState.party, nextState.activeIndex, criticalRandom);
    return finishBattleRound(
      nextState,
      actor,
      enemy,
      `${actor.name}의 ${stagedMove.name}!\n${actor.name}의 공격이 ${sensoryMissLabel(actor)}으로 빗나갔다.`,
      enemyLog,
      defaultLearningDetail(nextState),
      battleLearnText(nextState, stagedMove),
    );
  }

  const result = calculateDamage(actor, enemy, resolvedMove, variance, undefined, rollsCriticalHit(criticalRandom()));
  nextState.lastPlayerHitEffectiveness = resolvedMove.power > 0
    ? hitEffectivenessFromMultiplier(result.multiplier.total, result.blockedByInvulnerability)
    : undefined;
  markDamage(enemy, result.damage);
  applyEffects(actor, enemy, resolvedMove.effects);
  appendSymptom(enemy, resolvedMove.symptom, actor.name);
  advanceStagedMove(actor, move);
  applyAttackTriggeredStatusDamage(actor);
  const learningDetail = playerMoveLearningDetail(nextState, resolvedMove, result);
  const actorLog = `${actor.name}의 ${resolvedMove.name}!\n${formatMoveDescription(resolvedMove, actor)}${criticalHitText(result)}`;
  const learningText = battleLearnText(nextState, resolvedMove);

  if (enemy.hp <= 0) {
    nextState.battleActionLog = formatBattleActionLog(nextState, actorLog, '', learningText);
    return setWinState(nextState, defeatedOpponentMessage(enemy), learningDetail);
  }

  const enemyLog = resolveEnemyTurn(actor, enemy, variance, nextState.party, nextState.activeIndex, criticalRandom);
  return finishBattleRound(nextState, actor, enemy, actorLog, enemyLog, learningDetail, learningText);
}

export function resolvePassEncounter(state: RunState): RunState {
  const nextState = cloneState(state);
  const enemy = nextState.enemy;

  if (!enemy || nextState.encounterKind !== 'wild') {
    nextState.lastLog = '지금은 지나갈 수 없습니다.';
    return nextState;
  }

  nextState.phase = 'floorClear';
  nextState.party = nextState.party.map(clearBattleOnlyState);
  nextState.lastLog = floorClearLog(
    nextState,
    `${enemy.name}와 거리를 두고 지나갔다.`,
    pathimonMemoDetail(enemy),
  );
  return nextState;
}

export function resolveForcedSwitchMonster(state: RunState, targetIndex: number): RunState {
  const nextState = cloneState(state);
  const target = nextState.party[targetIndex];

  if (nextState.phase !== 'forcedSwitch' || !target || targetIndex === nextState.activeIndex || !canEnterBattle(target)) {
    nextState.lastLog = target?.sealedByBoss ? '봉인된 패시몬은 전투에 나올 수 없습니다.' : '다음 패시몬을 선택해야 합니다.';
    return nextState;
  }

  nextState.activeIndex = targetIndex;
  nextState.phase = 'battle';
  if (nextState.enemy && isHumanEnemy(nextState.enemy)) {
    clearPlannedHumanMoves(nextState.enemy);
    planHumanMoves(nextState.enemy, target, nextState.party, targetIndex);
  }
  nextState.lastLog = `${target.name}이 나왔다.`;
  return nextState;
}

export function resolveSwitchMonster(
  state: RunState,
  targetIndex: number,
  variance = randomDamageVariance(),
  criticalRandom: CriticalRandomSource = noCriticalRandom,
): RunState {
  const nextState = cloneState(state);
  nextState.battleStatUpCue = undefined;
  nextState.battleActionLog = undefined;
  nextState.battleStatusLog = undefined;
  nextState.battleStatusDamage = undefined;
  const target = nextState.party[targetIndex];
  const enemy = nextState.enemy;

  if (!enemy || !target || targetIndex === nextState.activeIndex || !canEnterBattle(target)) {
    nextState.lastLog = target?.sealedByBoss ? '봉인된 패시몬은 교체할 수 없습니다.' : '교체할 패시몬이 없습니다.';
    return nextState;
  }

  const previousActor = nextState.party[nextState.activeIndex];
  const previousMultiplier = isHumanEnemy(enemy) && previousActor
    ? announcedTreatmentMultiplier(enemy, previousActor)
    : 1;
  const targetMultiplier = isHumanEnemy(enemy)
    ? announcedTreatmentMultiplier(enemy, target)
    : 1;
  nextState.activeIndex = targetIndex;
  if (nextState.encounterKind === 'wild') {
    nextState.phase = 'battle';
    nextState.lastLog = `${target.name} switched in.`;
    return nextState;
  }

  if (isHumanEnemy(enemy) && !enemy.plannedMoveIds?.length && !enemy.plannedMoveId) {
    const currentActor = state.party[state.activeIndex];
    if (currentActor) planHumanMoves(enemy, currentActor, state.party, state.activeIndex);
  }

  const enemyLog = resolveEnemyTurn(target, enemy, variance, nextState.party, targetIndex, criticalRandom);
  let switchLog = previousMultiplier > targetMultiplier
    ? `${target.name}이 나왔다.\n교체 성공: 예상 피해 ×${previousMultiplier} → ×${targetMultiplier}로 감소!`
    : `${target.name}이 나왔다.`;
  const earnsSwitchRank = (
    previousMultiplier > targetMultiplier
    && targetMultiplier === 1
    && enemyLog.hitEffectiveness === 'normal'
    && target.hp > 0
  );
  if (earnsSwitchRank) {
    switchLog += `\n${target.name}의 공격 +1!`;
  }
  const resolvedState = finishBattleRound(
    nextState,
    target,
    enemy,
    switchLog,
    enemyLog,
    defaultLearningDetail(nextState),
  );
  const resolvedTarget = resolvedState.party[resolvedState.activeIndex];
  if (earnsSwitchRank && resolvedState.phase === 'battle' && resolvedTarget?.hp > 0) {
    resolvedTarget.effects.push({
      kind: 'buff',
      stat: 'attack',
      pct: 50,
      rank: 1,
      turns: 99,
    });
    resolvedState.battleStatUpCue = { stat: 'attack', target: 'player' };
  }
  return resolvedState;
}

function completeCapturedEnemy(nextState: RunState, enemy: RuntimeMonster): RunState {
  const capturedData = MONSTERS.find((monster) => monster.id === enemy.templateId);
  if (!capturedData) {
    throw new Error(`Unknown captured monster: ${enemy.templateId}`);
  }

  const captured = createMonsterInstance(capturedData);
  captured.signatureUnlocked = nextState.mode === 'learning';
  if (nextState.party.length >= MAX_PARTY_SIZE) {
    nextState.pendingCapture = captured;
    nextState.phase = 'releaseCapture';
    nextState.lastLog = `${enemy.name}을 포획했습니다. 놓아줄 패시몬을 선택하세요.`;
    return nextState;
  }

  nextState.party.push(captured);
  return setWinState(nextState, `${enemy.name}을 포획했습니다.`, undefined, pathimonMemoDetail(enemy));
}

export function beginCaptureQuiz(state: RunState, capsuleId: CapsuleId): RunState {
  const nextState = cloneState(state);
  const enemy = nextState.enemy;
  nextState.pendingCaptureCapsuleId = undefined;
  nextState.battleActionLog = undefined;
  nextState.battleStatusLog = undefined;
  nextState.battleStatusDamage = undefined;
  nextState.battleStatUpCue = undefined;

  if (!enemy || enemy.isTrainer) {
    nextState.lastLog = '사람 전투에서는 캡슐을 던질 수 없습니다.';
    return nextState;
  }

  if (!capsuleCanCatch(capsuleId, enemy)) {
    nextState.lastLog = '패시몬 타입이 맞지 않습니다.';
    return nextState;
  }

  const selectedCount = nextState.capsuleInventory[capsuleId] ?? 0;
  if (nextState.mode !== 'learning' && selectedCount <= 0) {
    nextState.lastLog = `${CAPSULE_LABELS[capsuleId]}이 없습니다.`;
    return nextState;
  }

  if (nextState.mode !== 'learning') {
    nextState.capsuleInventory[capsuleId] = selectedCount - 1;
    nextState.capsules = totalCapsules(nextState.capsuleInventory);
  }
  nextState.pendingCaptureCapsuleId = capsuleId;
  nextState.phase = 'battle';
  nextState.lastLog = `${enemy.name}이 질문을 던진다...`;
  return nextState;
}

export function resolveCaptureQuizAnswer(state: RunState, correct: boolean): RunState {
  const nextState = cloneState(state);
  const enemy = nextState.enemy;
  const capsuleId = nextState.pendingCaptureCapsuleId;
  nextState.pendingCaptureCapsuleId = undefined;

  if (!enemy || !capsuleId) {
    nextState.phase = 'battle';
    nextState.lastLog = '먼저 캡슐을 선택해야 합니다.';
    return nextState;
  }

  if (correct) {
    return completeCapturedEnemy(nextState, enemy);
  }

  const actor = nextState.party[nextState.activeIndex];
  if (!actor) return nextState;

  const damageRatio = nextState.mode === 'learning' ? 0.2 : 0.4;
  const damagePercent = Math.round(damageRatio * 100);
  const damage = Math.ceil(actor.maxHp * damageRatio);
  markDamage(actor, damage);
  actor.fainted = actor.hp <= 0;
  nextState.phase = 'battle';
  nextState.lastEnemyHitEffectiveness = 'normal';
  nextState.lastPlayerHitEffectiveness = undefined;
  nextState.battleActionLog = `${enemy.name}이 질문을 던졌다.\n오답이다! ${actor.name}은 최대 체력의 ${damagePercent}% 피해를 입었다.`;
  nextState.battleStatusLog = undefined;
  nextState.battleStatusDamage = undefined;
  nextState.lastLog = nextState.battleActionLog;

  return actor.hp <= 0 ? setCollapsedState(nextState, actor) : nextState;
}

export function resolveCapsuleAction(state: RunState, rollOrCapsule: number | CapsuleId, maybeRoll?: number): RunState {
  const nextState = cloneState(state);
  const enemy = nextState.enemy;
  const capsuleId: CapsuleId = typeof rollOrCapsule === 'string' ? rollOrCapsule : 'universal';
  const roll = typeof rollOrCapsule === 'number' ? rollOrCapsule : maybeRoll ?? Math.random();

  if (!enemy) {
    return nextState;
  }

  if (enemy.isTrainer) {
    nextState.phase = 'battle';
    nextState.lastLog = '사람 전투에서는 캡슐을 던질 수 없습니다.';
    return nextState;
  }

  const learningMode = nextState.mode === 'learning';
  const selectedCount = nextState.capsuleInventory[capsuleId] ?? 0;

  if (!capsuleCanCatch(capsuleId, enemy)) {
    nextState.phase = 'battle';
    nextState.lastLog = '패시몬 타입이 맞지 않습니다.';
    return nextState;
  }

  if (!learningMode && selectedCount <= 0) {
    nextState.phase = 'battle';
    nextState.lastLog = `${CAPSULE_LABELS[capsuleId]}이 없습니다.`;
    return nextState;
  }

  const attemptCapsules = learningMode ? Math.max(1, selectedCount) : selectedCount;
  const result = tryCapture(enemy, attemptCapsules, roll);
  if (!learningMode) {
    nextState.capsuleInventory[capsuleId] = result.capsules;
    nextState.capsules = totalCapsules(nextState.capsuleInventory);
  }

  if (result.kind === 'captured') {
    return completeCapturedEnemy(nextState, enemy);
  }

  nextState.phase = 'battle';

  if (result.kind === 'blocked') {
    nextState.lastLog = `${enemy.name} cannot be captured.`;
    return nextState;
  }

  if (result.kind === 'noCapsules') {
    nextState.lastLog = 'No capsules remain.';
    return nextState;
  }

  nextState.lastLog = `${enemy.name} broke free.`;
  return nextState;
}

export function resolveCaptureRelease(state: RunState, releaseIndex: number): RunState {
  const nextState = cloneState(state);
  const pendingCapture = nextState.pendingCapture;

  if (nextState.phase !== 'releaseCapture' || !pendingCapture || !nextState.party[releaseIndex]) {
    nextState.lastLog = '놓아줄 패시몬을 선택해야 합니다.';
    return nextState;
  }

  const releasedName = nextState.party[releaseIndex].name;
  nextState.party[releaseIndex] = pendingCapture;
  nextState.pendingCapture = undefined;
  nextState.party = nextState.party.map(clearBattleOnlyState);
  nextState.phase = 'floorClear';
  nextState.lastLog = `${releasedName}을 놓아주고 ${pendingCapture.name}을 데려갑니다.`;
  return nextState;
}

export function cancelPendingCapture(state: RunState): RunState {
  const nextState = cloneState(state);
  const pendingName = nextState.pendingCapture?.name ?? '포획한 패시몬';

  nextState.pendingCapture = undefined;
  nextState.party = nextState.party.map(clearBattleOnlyState);
  nextState.phase = 'floorClear';
  nextState.lastLog = `${pendingName}을 보내주고 다음 층으로 향합니다.`;
  return nextState;
}

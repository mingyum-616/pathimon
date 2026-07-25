import { describe, expect, it, vi } from 'vitest';
import { MOVES } from '../data/moves';
import { MONSTERS } from '../data/monsters';
import { actionFailureChance, actionFailureLabel, adjustedStatusChance, effectiveMaxHp, healingMultiplier } from '../data/statusConditions';
import { createBossInstance, createMonsterInstance } from '../state/factory';
import { BOSS_ATTACK_MOVE_IDS } from '../data/bossAttackMatchups';
import type { EffectPrimitive, MonsterData, RunState, RuntimeMonster } from '../types/game';
import { tryCapture } from './capture';
import { calculateDamage, criticalHitChance, randomDamageVariance, rollsCriticalHit } from './damage';
import { applyEffects, tickEffects } from './effects';
import { calculateMultiplier } from './effectiveness';
import { buildLoadout, buildMoveSlots } from './loadout';
import { currentMoveData, currentMoveName } from './moveStages';
import {
  activateBossPhaseTwo,
  applyFinalBossSkill,
  bossPhaseTwoDialogue,
  resolveForcedSwitchMonster,
  resolvePlayerMove,
  resolveSwitchMonster,
} from './turn';

const attacker: RuntimeMonster = {
  templateId: 'strep',
  name: '화농성연쇄상구균',
  scientificName: 'Streptococcus pyogenes',
  category: '세균',
  glyph: '🔗',
  tags: { pathway: 'respiratory', wall: 'gram_positive', location: 'extracellular' },
  maxHp: 44,
  hp: 44,
  attack: 10,
  defense: 3,
  speed: 9,
  captureRate: 0.5,
  ability: 'comp_evade',
  moveset: ['streptokinase', 'hyaluronidase', 'enterotoxin', 'alpha_toxin'],
  effects: [],
  stunned: false,
  fainted: false,
  isBoss: false,
};

const capsuleTarget: RuntimeMonster = {
  ...attacker,
  templateId: 'staph',
  name: '황색포도알균',
  scientificName: 'Staphylococcus aureus',
  ability: 'capsule',
  captureRate: 0.42,
  hp: 10,
  maxHp: 46,
  moveset: ['tsst', 'alpha_toxin', 'pvl', 'hyaluronidase'],
};

function createMonster(overrides: Partial<RuntimeMonster> = {}): RuntimeMonster {
  const { effects, moveset, tags, ...rest } = overrides;

  return {
    ...attacker,
    ...rest,
    tags: {
      ...attacker.tags,
      ...tags,
    },
    moveset: moveset ?? [...attacker.moveset],
    effects: effects ? [...effects] : [],
  };
}

function createBattleState(overrides: Partial<RunState> = {}): RunState {
  return {
    floor: 10,
    bgmSeed: 1,
    mode: 'challenge',
    visualStyle: 'character',
    money: 0,
    capsules: 0,
    capsuleInventory: {
      universal: 0,
      virus: 0,
      bacteria: 0,
      parasite: 0,
      fungus: 0,
      protozoa: 0,
      prion: 0,
    },
    party: [createMonster()],
    activeIndex: 0,
    enemy: createMonster({
      name: '면역챔피언',
      category: '보스 사람',
      moveset: ['m_phago', 'm_opsonin', 'm_antibody', 'm_complement'],
      moveSlots: ['m_phago', 'm_opsonin', 'm_antibody', 'm_complement'],
      isBoss: true,
      isTrainer: true,
      attack: 12,
      hp: 999,
      maxHp: 999,
    }),
    encounterKind: 'boss',
    phase: 'battle',
    lastLog: '',
    ...overrides,
  };
}

describe('battle engine', () => {
  it('builds move slots as prep, up to two attacks, then signature', () => {
    const monster: MonsterData = {
      id: 'staph',
      name: '황색포도알균',
      scientificName: 'Staphylococcus aureus',
      category: '세균',
      glyph: '🟡',
      tags: { pathway: 'skin', wall: 'gram_positive', location: 'extracellular' },
      maxHp: 46,
      attack: 11,
      defense: 4,
      speed: 8,
      captureRate: 0.42,
      ability: 'proteinA',
      signature: 'tsst',
      learnset: ['alpha_toxin', 'pvl', 'hyaluronidase', 'coagulase', 'enterotoxin'],
      prep: 'coagulase',
    };

    expect(buildMoveSlots(monster, [0, 0])).toEqual(['coagulase', 'alpha_toxin', 'pvl', 'tsst']);
    expect(buildLoadout(monster, [0, 0])).toEqual(['coagulase', 'alpha_toxin', 'pvl', 'tsst']);
  });

  it('keeps the signature in the fourth slot when there is only one attack', () => {
    const monster: MonsterData = {
      id: 'anthrax',
      name: '탄저록스',
      scientificName: '탄저균 (Bacillus anthracis)',
      category: '세균',
      glyph: 'ANT',
      tags: { pathway: 'wound', wall: 'gram_positive', location: 'extracellular', size: 'microscopic' },
      maxHp: 50,
      attack: 12,
      defense: 5,
      speed: 5,
      captureRate: 0.4,
      ability: 'spore',
      prep: 'spore_germination',
      learnset: ['spore_germination', 'anthrax_toxin'],
      signature: 'capsule_formation',
    };

    expect(buildMoveSlots(monster, [0])).toEqual(['spore_germination', 'anthrax_toxin', null, 'capsule_formation']);
    expect(buildLoadout(monster, [0])).toEqual(['spore_germination', 'anthrax_toxin', 'capsule_formation']);
  });

  it('formats the current stage in a staged move name and data', () => {
    const monster = createMonster({
      moveset: ['anthrax_toxin'],
      moveStages: { anthrax_toxin: 1 },
    });

    expect(currentMoveName(MOVES.anthrax_toxin, monster)).toBe('탄저 독소 2단계');
    expect(currentMoveData(MOVES.anthrax_toxin, monster)).toMatchObject({
      name: '탄저 독소 2단계',
      // STATS.md §6-1: 다단계는 합계 상한 없이 단계별 병인 기여도로 정한다. EF는 부종만 만들어 40.
      power: 40,
      description: '{name}이 EF(edema factor)로 cAMP를 증가시켜 부종을 만들었다.',
      learnText: 'EF는 adenylate cyclase로 작동해 세포 내 cAMP를 올린다. PA와 합쳐 부종독소가 된다.',
    });
  });

  it('combines type matchup and tag defense', () => {
    const defender: RuntimeMonster = {
      ...capsuleTarget,
      ability: 'mask',
      tags: { pathway: 'respiratory', wall: 'gram_positive', location: 'extracellular' },
    };

    const result = calculateMultiplier(MOVES.hyaluronidase, attacker, defender);

    expect(result.total).toBe(0.5);
    expect(result.notes).toContain('점액섬모가 호흡기 태그를 반감했다');
  });

  it('applies every listed defense trait when calculating type matchup', () => {
    const defender = createMonster({
      ability: 'capsule',
      abilities: ['capsule', 'barrier'],
    });

    const result = calculateMultiplier(MOVES.hyaluronidase, attacker, defender);

    expect(result.total).toBe(0.5);
  });

  it('calculates deterministic damage with the exact formula and fixed variance', () => {
    const result = calculateDamage(attacker, capsuleTarget, MOVES.hyaluronidase, 1);

    expect(result.damage).toBe(33);
    expect(result.multiplier.total).toBe(1);
    expect(result.blockedByInvulnerability).toBe(false);
    expect(result.critical).toBe(false);
  });

  it('uses Pokerogue-style critical hits at stage 0: 1/24 chance and 1.5x damage', () => {
    const normal = calculateDamage(attacker, capsuleTarget, MOVES.hyaluronidase, 1);
    const critical = calculateDamage(attacker, capsuleTarget, MOVES.hyaluronidase, 1, undefined, true);

    expect(criticalHitChance()).toBeCloseTo(1 / 24);
    expect(rollsCriticalHit(0)).toBe(true);
    expect(rollsCriticalHit(1 / 24)).toBe(false);
    expect(critical.critical).toBe(true);
    expect(critical.damage).toBe(Math.round(normal.damage * 1.5));
  });

  it('uses move power times attack over defense times random variance and matchup', () => {
    const defender = createMonster({
      ability: 'mask',
      tags: { pathway: 'respiratory', wall: 'gram_positive', location: 'extracellular' },
    });

    const result = calculateDamage(attacker, defender, MOVES.hyaluronidase, 0.85);

    expect(result.damage).toBe(14);
    expect(result.multiplier.total).toBe(0.5);
  });

  it('generates damage variance from 0.85 to 1.00', () => {
    expect(randomDamageVariance(() => 0)).toBe(0.85);
    expect(randomDamageVariance(() => 1)).toBe(1);
    expect(randomDamageVariance(() => 0.5)).toBeCloseTo(0.925);
  });

  it('returns zero damage for zero-power moves', () => {
    const result = calculateDamage(attacker, capsuleTarget, MOVES.coagulase, 1);

    expect(result.damage).toBe(0);
    expect(result.blockedByInvulnerability).toBe(false);
  });

  it('returns zero damage and marks invulnerability blocks', () => {
    const defender = createMonster({
      effects: [{ kind: 'invuln', turns: 1 }],
    });

    const result = calculateDamage(attacker, defender, MOVES.hyaluronidase, 1);

    expect(result.damage).toBe(0);
    expect(result.blockedByInvulnerability).toBe(true);
  });

  it('applies incoming field factors to damage', () => {
    const defender = createMonster({
      effects: [{ kind: 'field', side: 'incoming', factor: 0.5, turns: 2 }],
    });

    const result = calculateDamage(attacker, defender, MOVES.hyaluronidase, 1);

    expect(result.damage).toBe(17);
  });

  // 현재 보스 HP 기준에서 준비 후 탄저 독소 2단계의 체력 비율을 고정한다.
  it('calibrates boss hp so anthrax toxin stage 2 removes about two percent after prep', () => {
    const anthraxData = MONSTERS.find((monster) => monster.id === 'anthrax');
    if (!anthraxData) throw new Error('anthrax missing');

    const anthrax = createMonsterInstance(anthraxData);
    const boss = createBossInstance(0, 10);
    anthrax.effects.push({ kind: 'buff', stat: 'attack', pct: 25, turns: 99 });
    anthrax.moveStages = { anthrax_toxin: 1 };
    const toxinStage2 = currentMoveData(MOVES.anthrax_toxin, anthrax);

    const lowestRollPct = calculateDamage(anthrax, boss, toxinStage2, 0.85).damage / boss.maxHp;
    const highestRollPct = calculateDamage(anthrax, boss, toxinStage2, 1).damage / boss.maxHp;

    expect(lowestRollPct).toBeGreaterThanOrEqual(0.02);
    expect(highestRollPct).toBeLessThanOrEqual(0.025);
  });

  it('applies active attack and defense buffs to damage', () => {
    const normal = calculateDamage(attacker, capsuleTarget, MOVES.hyaluronidase, 1).damage;
    const buffedAttacker = createMonster({
      effects: [{ kind: 'buff', stat: 'attack', pct: 50, turns: 2 }],
    });
    const hardenedDefender = createMonster({
      ...capsuleTarget,
      effects: [{ kind: 'buff', stat: 'defense', pct: 50, turns: 2 }],
    });

    expect(calculateDamage(buffedAttacker, capsuleTarget, MOVES.hyaluronidase, 1).damage).toBeGreaterThan(normal);
    expect(calculateDamage(attacker, hardenedDefender, MOVES.hyaluronidase, 1).damage).toBeLessThan(normal);
  });

  it('blocks capsule capture against bosses', () => {
    const result = tryCapture({ ...capsuleTarget, isBoss: true }, 4, 0.1);

    expect(result.kind).toBe('blocked');
    expect(result.capsules).toBe(4);
  });

  it('preserves zero capsules on no-capsule capture attempts', () => {
    const result = tryCapture(capsuleTarget, 0, 0.1);

    expect(result.kind).toBe('noCapsules');
    expect(result.capsules).toBe(0);
  });

  it('uses hp loss to improve capsule capture chance', () => {
    const result = tryCapture(capsuleTarget, 2, 0.6);

    expect(result.kind).toBe('captured');
    expect(result.capsules).toBe(1);
  });

  it('spends exactly one capsule and reports missed captures', () => {
    const result = tryCapture(capsuleTarget, 2, 0.95);

    expect(result.kind).toBe('missed');
    expect(result.capsules).toBe(1);
  });

  it('adds the lysozyme note for gram-positive attackers', () => {
    const defender = createMonster({
      ability: 'lysozyme',
    });

    const result = calculateMultiplier(MOVES.hyaluronidase, attacker, defender);

    expect(result.total).toBe(0.5);
    expect(result.notes).toContain('라이소자임이 그람양성 태그를 반감했다');
  });

  it('clamps the type-table portion of multipliers to three', () => {
    const defender = createMonster({
      ability: 'acidfast',
      tags: { pathway: 'skin', wall: 'gram_positive', location: 'intracellular' },
    });

    const result = calculateMultiplier(MOVES.m_th1, attacker, defender);

    expect(result.total).toBe(3);
  });

  it('applies buff, field, heal, invuln, dot, and convert primitives', () => {
    const user = createMonster({ hp: 20 });
    const enemy = createMonster({ hp: 12 });
    const effects: EffectPrimitive[] = [
      { kind: 'buff', stat: 'attack', pct: 25, turns: 2, target: 'self' },
      { kind: 'field', side: 'incoming', factor: 0.5, turns: 3, target: 'enemy' },
      { kind: 'heal', pct: 50, target: 'self' },
      { kind: 'invuln', turns: 1, target: 'enemy' },
      { kind: 'dot', power: 4, turns: 2, target: 'enemy' },
      { kind: 'convert', power: 6, target: 'enemy' },
    ];

    applyEffects(user, enemy, effects);

    expect(user.hp).toBe(42);
    expect(user.effects).toEqual([{ kind: 'buff', stat: 'attack', pct: 25, turns: 2 }]);
    expect(enemy.effects).toEqual([
      { kind: 'field', side: 'incoming', factor: 0.5, turns: 3 },
      { kind: 'invuln', turns: 1 },
      { kind: 'dot', power: 4, turns: 2 },
      { kind: 'convert', power: 6, turns: 99 },
    ]);
  });

  it('applies confusion effects and stun status primitives', () => {
    const user = createMonster();
    const enemy = createMonster();
    const effects: EffectPrimitive[] = [
      { kind: 'status', status: 'confusion', chance: 1, turns: 2, target: 'enemy' },
      { kind: 'status', status: 'stun', chance: 1, target: 'enemy' },
    ];

    applyEffects(user, enemy, effects);

    expect(enemy.effects).toContainEqual({ kind: 'confusion', turns: 2 });
    expect(enemy.stunned).toBe(true);
  });

  it('stacks canonical status condition primitives separately from timed effects', () => {
    const user = createMonster();
    const enemy = createMonster();
    const effects: EffectPrimitive[] = [
      { kind: 'condition', condition: 'fever', chance: 1, stacks: 2, target: 'enemy' },
      { kind: 'condition', condition: 'fever', chance: 1, target: 'enemy' },
      { kind: 'condition', condition: 'necrosis', chance: 1, target: 'enemy' },
    ];

    applyEffects(user, enemy, effects);

    expect(enemy.statusConditions).toMatchObject({ fever: 3, necrosis: 1 });
    expect(effectiveMaxHp(enemy)).toBe(Math.floor(enemy.maxHp * 0.975));
  });

  it('applies dyspnea, pain, blood pressure, fatigue, and immune abnormality in combat math', () => {
    const normalDamage = calculateDamage(attacker, capsuleTarget, MOVES.hyaluronidase, 1).damage;
    // 저산소는 예비력을 없애 받는 피해를 늘린다.
    const dyspneicTarget = createMonster({ ...capsuleTarget, statusConditions: { dyspnea: 2 } });
    // 통증 -10%, 혈압 이상 -15%로 방어가 깎인다. 방어가 작으면 반올림에 묻히므로 크게 잡는다.
    const sturdyTarget = createMonster({ ...capsuleTarget, defense: 50 });
    const painedTarget = createMonster({ ...capsuleTarget, defense: 50, statusConditions: { pain: 1 } });
    const shockedTarget = createMonster({ ...capsuleTarget, defense: 50, statusConditions: { blood_pressure: 1 } });
    const fatiguedAttacker = createMonster({ statusConditions: { fatigue: 2 } });
    const protectedTarget = createMonster({ ability: 'capsule', abilities: ['capsule'] });
    const eosinophilTarget = createMonster({ ability: 'capsule', abilities: ['capsule'], statusConditions: { immune_abnormal: 3 } });
    const abnormalTarget = createMonster({ ability: 'capsule', abilities: ['capsule'], statusConditions: { immune_abnormal: 4 } });

    expect(calculateDamage(attacker, dyspneicTarget, MOVES.hyaluronidase, 1).damage).toBeGreaterThan(normalDamage);
    // 공격 10 대 방어 50이면 피해가 2라 반올림에 묻힌다. 공격을 올려 해상도를 확보한다.
    const strongAttacker = createMonster({ attack: 100 });
    const sturdyDamage = calculateDamage(strongAttacker, sturdyTarget, MOVES.hyaluronidase, 1).damage;
    const painedDamage = calculateDamage(strongAttacker, painedTarget, MOVES.hyaluronidase, 1).damage;
    expect(painedDamage).toBeGreaterThan(sturdyDamage);
    expect(calculateDamage(strongAttacker, shockedTarget, MOVES.hyaluronidase, 1).damage).toBeGreaterThan(painedDamage);
    expect(calculateDamage(fatiguedAttacker, capsuleTarget, MOVES.hyaluronidase, 1).damage).toBeLessThan(normalDamage);
    expect(calculateMultiplier(MOVES.m_phago, attacker, protectedTarget).total).toBe(0);
    expect(calculateMultiplier(MOVES.m_phago, attacker, eosinophilTarget).total).toBe(0);
    expect(calculateMultiplier(MOVES.m_phago, attacker, abnormalTarget).total).toBe(1.4);
  });

  it('uses edema and neurologic stacks as status chance bonuses', () => {
    const target = createMonster({
      statusConditions: {
        edema: 2,
        neurologic: 1,
      },
    });

    expect(adjustedStatusChance(target, 0.2)).toBeCloseTo(0.22);
    expect(adjustedStatusChance(target, 0.2, 'confusion')).toBeCloseTo(0.27);
    // 마비와 가려움은 stun 확률 보정이 아니라 행동 실패 확률로 분리됐다(자기참조 제거).
    expect(adjustedStatusChance(target, 0.2, 'stun')).toBeCloseTo(0.22);
  });

  it('turns paralysis, vomiting, and itching into a single action failure roll', () => {
    const paralyzed = createMonster({ statusConditions: { paralysis: 2 } });
    const nauseated = createMonster({ statusConditions: { vomiting: 1, itching: 1 } });

    expect(actionFailureChance(paralyzed)).toBeCloseTo(0.1);
    expect(actionFailureLabel(paralyzed)).toBe('마비');
    expect(actionFailureChance(nauseated)).toBeCloseTo(0.065);
    expect(actionFailureLabel(nauseated)).toBe('구토');
  });

  it('scales healing down with dehydration and jaundice instead of vomiting', () => {
    const dehydrated = createMonster({ statusConditions: { dehydration: 2 } });
    const jaundiced = createMonster({ statusConditions: { jaundice: 1 } });

    expect(healingMultiplier(dehydrated)).toBeCloseTo(0.75);
    expect(healingMultiplier(jaundiced)).toBeCloseTo(0.925);
  });

  it('advances staged moves after use and wraps after the final stage', () => {
    const battle: RunState = {
      floor: 5,
      bgmSeed: 1,
      mode: 'challenge',
      visualStyle: 'character',
      money: 0,
      capsules: 0,
      capsuleInventory: {
        universal: 0,
        virus: 0,
        bacteria: 0,
        parasite: 0,
        fungus: 0,
        protozoa: 0,
        prion: 0,
      },
      party: [
        createMonster({
          name: '탄저록스',
          moveset: ['anthrax_toxin'],
          moveStages: { anthrax_toxin: 2 },
        }),
      ],
      activeIndex: 0,
      enemy: createMonster({ hp: 999, maxHp: 999, moveset: ['coagulase'] }),
      encounterKind: 'trainer',
      phase: 'battle',
      lastLog: '',
    };

    const result = resolvePlayerMove(battle, 'anthrax_toxin', 1);

    expect(result.party[0].moveStages?.anthrax_toxin).toBe(0);
    expect(result.lastLog).toContain('LF(lethal factor)');
  });

  it('marks a signature move as used and blocks a second use in the same battle', () => {
    const battle = createBattleState({
      party: [
        createMonster({
          name: '탄저록스',
          moveset: ['capsule_formation'],
          signatureUnlocked: true,
        }),
      ],
      enemy: createMonster({ hp: 999, maxHp: 999, moveset: ['coagulase'] }),
      encounterKind: 'trainer',
    });

    const first = resolvePlayerMove(battle, 'capsule_formation', 1);
    const second = resolvePlayerMove(first, 'capsule_formation', 1);

    expect(first.party[0].usedSignatureMoveIds).toEqual(['capsule_formation']);
    expect(second.party[0].usedSignatureMoveIds).toEqual(['capsule_formation']);
    expect(second.lastLog).toContain('전투당 한 번');
  });

  it('does not add a symptom when a self-target signature has no symptom in the note', () => {
    const battle = createBattleState({
      party: [
        createMonster({
          name: '탄저록스',
          moveset: ['capsule_formation'],
          signatureUnlocked: true,
        }),
      ],
      enemy: createMonster({ hp: 999, maxHp: 999, moveset: ['coagulase'], symptoms: [] }),
      encounterKind: 'trainer',
    });

    const result = resolvePlayerMove(battle, 'capsule_formation', 1);

    expect(result.enemy?.symptoms).toEqual([]);
    expect(result.party[0].effects).toContainEqual({ kind: 'invuln', turns: 2 });
  });

  it('records the pathimon that inflicted each symptom without duplicate attribution', () => {
    const battle = createBattleState({
      party: [createMonster({ name: '콜레라비', moveset: ['cholera_toxin'] })],
      enemy: createMonster({ hp: 999, maxHp: 999, moveset: ['coagulase'], symptoms: [] }),
      encounterKind: 'trainer',
    });

    const first = resolvePlayerMove(battle, 'cholera_toxin', 1, 0, 0);
    const second = resolvePlayerMove(first, 'cholera_toxin', 1, 0, 0);

    expect(second.enemy?.symptoms).toEqual(['쌀뜨물 설사', '쌀뜨물 설사']);
    expect(second.enemy?.symptomAttributions).toEqual([
      { symptom: '쌀뜨물 설사', sourceName: '콜레라비' },
    ]);
  });

  it('clears battle-only pathimon state after winning a battle', () => {
    const battle = createBattleState({
      party: [
        createMonster({
          effects: [{ kind: 'buff', stat: 'attack', pct: 25, turns: 3 }],
          statusConditions: { fever: 2 },
          symptoms: ['기침'],
          usedSignatureMoveIds: ['capsule_formation'],
        }),
      ],
      enemy: createMonster({ hp: 1, maxHp: 1, moveset: ['coagulase'] }),
      encounterKind: 'trainer',
    });

    const result = resolvePlayerMove(battle, 'hyaluronidase', 1);

    expect(result.phase).toBe('shop');
    expect(result.party[0].effects).toEqual([]);
    expect(result.party[0].statusConditions).toEqual({});
    expect(result.party[0].symptoms).toEqual([]);
    expect(result.party[0].usedSignatureMoveIds).toEqual([]);
  });

  it('keeps boss defeat dialogue out of the maintenance shop log', () => {
    const battle = createBattleState({
      enemy: createMonster({
        name: '면역챔피언',
        category: '보스 사람',
        moveset: ['m_phago'],
        moveSlots: ['m_phago', null, null, null],
        isBoss: true,
        isTrainer: true,
        hp: 1,
        maxHp: 999,
      }),
    });

    const result = resolvePlayerMove(battle, 'hyaluronidase', 1);

    expect(result.phase).toBe('shop');
    expect(result.battleResultLog).toContain('대응 체계');
    expect(result.lastLog).not.toContain('대응 체계');
    expect(result.lastLog).toContain('정비 구역');
  });

  it('ticks damage-over-time effects, expires timed effects, and grows convert each tick', () => {
    const monster = createMonster({
      hp: 30,
      effects: [
        { kind: 'dot', power: 4, turns: 2 },
        { kind: 'field', side: 'incoming', factor: 0.5, turns: 1 },
        { kind: 'invuln', turns: 1 },
        { kind: 'buff', stat: 'defense', pct: 50, turns: 3 },
        { kind: 'convert', power: 6, turns: 99 },
      ],
    });

    const damage = tickEffects(monster);

    expect(damage).toBe(10);
    expect(monster.hp).toBe(20);
    expect(monster.effects).toEqual([
      { kind: 'dot', power: 4, turns: 1 },
      { kind: 'buff', stat: 'defense', pct: 50, turns: 2 },
      { kind: 'convert', power: 9, turns: 98 },
    ]);
  });

  it('ticks canonical status condition damage and conditional status growth', () => {
    const monster = createMonster({
      maxHp: 100,
      hp: 100,
      statusConditions: {
        fever: 2,
        bleeding: 1,
        blood_pressure: 1,
        excretory_dysfunction: 1,
      },
    });

    // 발열 4 + 출혈 2 + 배설 이상 1 = 7, 혈압 이상으로 ×1.05 → 7. 통증은 더 이상 도트가 아니다.
    const damage = tickEffects(monster, () => 0);

    expect(damage).toBe(7);
    expect(monster.hp).toBe(93);
    expect(monster.statusConditions?.dehydration).toBe(1);
  });

  it('ticks anemia at half the rate of fever and scales it with blood pressure', () => {
    const anemic = createMonster({ maxHp: 300, hp: 300, statusConditions: { anemia: 2 } });
    const febrile = createMonster({ maxHp: 300, hp: 300, statusConditions: { fever: 2 } });
    const shocked = createMonster({ maxHp: 300, hp: 300, statusConditions: { anemia: 2, blood_pressure: 1 } });

    expect(tickEffects(anemic, () => 0)).toBe(6);
    expect(tickEffects(febrile, () => 0)).toBe(12);
    expect(tickEffects(shocked, () => 0)).toBe(6);
  });

  it('separates combat messages from turn-end status damage', () => {
    const battle = createBattleState({
      party: [createMonster({ moveset: ['coagulase'], hp: 100, maxHp: 100 })],
      enemy: createMonster({
        name: '면역챔피언',
        category: '보스 사람',
        moveset: ['m_phago'],
        moveSlots: ['m_phago', null, null, null],
        isBoss: true,
        isTrainer: true,
        hp: 999,
        maxHp: 999,
        statusConditions: { fever: 1 },
      }),
    });

    const result = resolvePlayerMove(battle, 'coagulase', 1);

    expect(result.battleActionLog).toContain('화농성연쇄상구균의 코아굴라제!');
    expect(result.battleActionLog).toContain('면역챔피언의');
    expect(result.battleActionLog).not.toContain('상태이상에 의해 피해를 받고 있다');
    expect(result.battleStatusLog).toBe('면역챔피언은 상태이상에 의해 피해를 받고 있다.');
    expect(result.battleStatusDamage).toEqual({ player: 0, enemy: expect.any(Number) });
    expect(result.battleStatusDamage?.enemy).toBeGreaterThan(0);
    expect(result.lastLog).toContain('면역챔피언은 상태이상에 의해 피해를 받고 있다');
    expect(result.enemy?.hp).toBeLessThan(999);
  });

  it('puts learning feedback in the combat message only in learning mode', () => {
    const learningBattle = createBattleState({
      mode: 'learning',
      party: [createMonster({ moveset: ['coagulase'], profileMemo: ['L1 [감별점] 시험용 학습 문구'] })],
    });
    const challengeBattle = createBattleState({
      party: [createMonster({ moveset: ['coagulase'], profileMemo: ['L1 [감별점] 시험용 학습 문구'] })],
    });

    const learningResult = resolvePlayerMove(learningBattle, 'coagulase', 1);
    const challengeResult = resolvePlayerMove(challengeBattle, 'coagulase', 1);

    expect(learningResult.battleActionLog).toContain('\n학습 피드백: L1 [감별점] 시험용 학습 문구');
    expect(challengeResult.battleActionLog).not.toContain('학습 피드백:');
  });

  it('uses visual (12.5%) and hearing (7.5%) abnormality as accuracy penalties', () => {
    const baseState: RunState = {
      floor: 5,
      bgmSeed: 1,
      mode: 'challenge',
      visualStyle: 'character',
      money: 0,
      capsules: 0,
      capsuleInventory: {
        universal: 0,
        virus: 0,
        bacteria: 0,
        parasite: 0,
        fungus: 0,
        protozoa: 0,
        prion: 0,
      },
      party: [createMonster({ moveset: ['hyaluronidase'] })],
      activeIndex: 0,
      enemy: createMonster({ hp: 999, maxHp: 999, moveset: ['coagulase'] }),
      encounterKind: 'trainer',
      phase: 'battle',
      lastLog: '',
    };

    const visualHit = resolvePlayerMove(
      { ...baseState, party: [createMonster({ moveset: ['hyaluronidase'], statusConditions: { blindness: 1 } })] },
      'hyaluronidase',
      1,
      0,
      0.74,
    );
    const hearingMiss = resolvePlayerMove(
      { ...baseState, party: [createMonster({ moveset: ['hyaluronidase'], statusConditions: { hearing_abnormal: 1 } })] },
      'hyaluronidase',
      1,
      0,
      0.95,
    );
    const sensoryMiss = resolvePlayerMove(
      { ...baseState, party: [createMonster({ moveset: ['hyaluronidase'], statusConditions: { blindness: 1, hearing_abnormal: 1 } })] },
      'hyaluronidase',
      1,
      0,
      0.85,
    );

    expect(visualHit.lastLog).not.toContain('시력 이상으로 빗나갔다');
    expect(hearingMiss.lastLog).toContain('청력 이상으로 빗나갔다');
    expect(sensoryMiss.lastLog).toContain('감각 이상으로 빗나갔다');
  });

  it('lets bosses choose a direct countermeasure move instead of always using the first move', () => {
    const battle = createBattleState({
      party: [createMonster({
        hp: 500,
        maxHp: 500,
        countermeasures: { direct: ['알벤다졸'], symptomTags: [] },
      })],
      enemy: createMonster({
        name: '면역챔피언',
        category: '보스 사람',
        moveset: ['m_interferon', 'm_rx_알벤다졸'],
        moveSlots: ['m_interferon', 'm_rx_알벤다졸', null, null],
        isBoss: true,
        isTrainer: true,
        attack: 12,
        hp: 999,
        maxHp: 999,
      }),
    });

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const result = resolvePlayerMove(battle, 'coagulase', 1, 0, 0);

      expect(result.lastLog).toContain('알벤다졸 투여');
      expect(result.lastLog).toContain('효과가 굉장했다');
      expect(result.party[0].hp).toBeLessThan(500);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('labels symptom or tag countermeasures as effective in the combat log', () => {
    const battle = createBattleState({
      party: [createMonster({
        hp: 500,
        maxHp: 500,
        countermeasures: { direct: [], symptomTags: ['발열'] },
      })],
      enemy: createMonster({
        name: '면역챔피언',
        category: '보스 사람',
        moveset: ['m_antipyretic'],
        moveSlots: ['m_antipyretic', null, null, null],
        plannedMoveId: 'm_antipyretic',
        isBoss: true,
        isTrainer: true,
        attack: 12,
        hp: 999,
        maxHp: 999,
      }),
    });

    const result = resolvePlayerMove(battle, 'coagulase', 1, 0, 0);

    expect(result.lastLog).toContain('효과가 있다.');
    expect(result.lastLog).not.toContain('효과가 굉장했다.');
  });

  it('doubles the next enemy status stacks after 독소벼림 empower, then consumes it', () => {
    const user = createMonster({ effects: [{ kind: 'empower_status', multiplier: 2, turns: 99 }] });
    const enemy = createMonster({ name: '적' });

    applyEffects(user, enemy, [{ kind: 'condition', condition: 'necrosis', chance: 1, target: 'enemy', stacks: 2 }]);
    expect(enemy.statusConditions?.necrosis).toBe(4); // 2 → 2배
    expect(user.effects.some((effect) => effect.kind === 'empower_status')).toBe(false); // 소모

    applyEffects(user, enemy, [{ kind: 'condition', condition: 'necrosis', chance: 1, target: 'enemy', stacks: 1 }]);
    expect(enemy.statusConditions?.necrosis).toBe(5); // 다음 공격은 배수 없음(4+1)
  });

  it('does not empower the same prep turn that sets empower_status', () => {
    const user = createMonster();
    const enemy = createMonster({ name: '적' });

    applyEffects(user, enemy, [
      { kind: 'empower_status', multiplier: 2, turns: 99, target: 'self' },
      { kind: 'condition', condition: 'necrosis', chance: 1, target: 'enemy' },
    ]);

    expect(enemy.statusConditions?.necrosis).toBe(1); // 같은 턴에 건 건 2배 안 됨
    expect(user.effects.some((effect) => effect.kind === 'empower_status')).toBe(true); // 다음 턴용으로 남음
  });

  it('does not add an effectiveness message for unrelated countermeasures', () => {
    const battle = createBattleState({
      party: [createMonster({
        hp: 500,
        maxHp: 500,
        countermeasures: { direct: [], symptomTags: [] },
      })],
      enemy: createMonster({
        name: '면역챔피언',
        category: '보스 사람',
        moveset: ['m_interferon'],
        moveSlots: ['m_interferon', null, null, null],
        plannedMoveId: 'm_interferon',
        isBoss: true,
        isTrainer: true,
        attack: 12,
        hp: 999,
        maxHp: 999,
      }),
    });

    const result = resolvePlayerMove(battle, 'coagulase', 1, 0, 0);

    expect(result.lastLog).not.toContain('효과가 있다.');
    expect(result.lastLog).not.toContain('효과가 굉장했다.');
  });

  it('INVARIANT: a human enemy in phase=battle always has a committed plan across many turns', () => {
    let battle = createBattleState({
      party: [createMonster({
        hp: 99999,
        maxHp: 99999,
        defense: 9999,
        countermeasures: { direct: ['알벤다졸'], symptomTags: ['발열'] },
      })],
      enemy: createMonster({
        name: '면역챔피언',
        category: '보스 사람',
        moveset: [...BOSS_ATTACK_MOVE_IDS],
        moveSlots: [BOSS_ATTACK_MOVE_IDS[0]!, null, null, null],
        plannedMoveId: BOSS_ATTACK_MOVE_IDS[0],
        plannedMoveIds: [BOSS_ATTACK_MOVE_IDS[0]!],
        isBoss: true,
        isTrainer: true,
        attack: 1,
        hp: 99999,
        maxHp: 99999,
      }),
    });

    for (let turn = 0; turn < 60; turn += 1) {
      battle = resolvePlayerMove(battle, 'coagulase', 1, 0, 0);
      if (battle.phase === 'battle' && battle.enemy && (battle.enemy.isBoss || battle.enemy.isTrainer)) {
        expect(battle.enemy.plannedMoveIds?.length ?? 0, `after turn ${turn}`).toBeGreaterThan(0);
      }
    }
  });

  it('does not seal boss moves after switching; damage is recalculated against the final active pathimon', () => {
    const battle = createBattleState({
      party: [
        createMonster({
          hp: 100,
          maxHp: 100,
          countermeasures: { direct: ['알벤다졸'], symptomTags: [] },
        }),
        createMonster({
          name: '비표적몬',
          hp: 100,
          maxHp: 100,
          countermeasures: { direct: [], symptomTags: [] },
        }),
      ],
      enemy: createMonster({
        name: '면역챔피언',
        category: '보스 사람',
        moveset: ['m_rx_알벤다졸'],
        moveSlots: ['m_rx_알벤다졸', null, null, null],
        plannedMoveId: 'm_rx_알벤다졸',
        isBoss: true,
        isTrainer: true,
        attack: 12,
        hp: 999,
        maxHp: 999,
      }),
    });

    const result = resolveSwitchMonster(battle, 1, 1);

    expect(result.party[1].hp).toBeLessThan(100);
    expect(result.enemy?.sealedMoveIds ?? []).toEqual([]);
    expect(result.enemy?.bossMaintenanceQueued ?? false).toBe(false);
    expect(result.lastLog).not.toContain('봉인');
    expect(result.lastLog).not.toContain('효과가 굉장했다');
  });

  it('reports a successful switch when the announced treatment multiplier drops', () => {
    const battle = createBattleState({
      party: [
        createMonster({
          name: '표적몬',
          hp: 100,
          maxHp: 100,
          countermeasures: { direct: ['알벤다졸'], symptomTags: [] },
        }),
        createMonster({
          name: '회피몬',
          hp: 100,
          maxHp: 100,
          countermeasures: { direct: [], symptomTags: [] },
        }),
      ],
      enemy: createMonster({
        name: '면역챔피언',
        category: '보스 사람',
        moveset: ['m_rx_알벤다졸', 'm_interferon'],
        moveSlots: ['m_rx_알벤다졸', 'm_interferon', null, null],
        plannedMoveId: 'm_rx_알벤다졸',
        plannedMoveIds: ['m_rx_알벤다졸'],
        isBoss: true,
        isTrainer: true,
        attack: 1,
        hp: 999,
        maxHp: 999,
      }),
    });

    const result = resolveSwitchMonster(battle, 1, 1);

    expect(result.battleActionLog).toContain('교체 성공: 예상 피해 ×4 → ×1');
    expect(result.battleActionLog).toContain('회피몬');
    expect(result.battleActionLog).toContain(`면역챔피언의 ${MOVES['m_rx_알벤다졸'].name}!`);
    expect(result.battleActionLog).not.toContain(`면역챔피언의 ${MOVES.m_interferon.name}!`);
    expect(result.party[1].effects).toContainEqual({
      kind: 'buff',
      stat: 'attack',
      pct: 50,
      rank: 1,
      turns: 99,
    });
    expect(result.battleStatUpCue).toEqual({ stat: 'attack', target: 'player' });
    expect(result.battleActionLog).toContain('공격 +1');
  });

  it('uses two telegraphed boss moves in phase two and both hit the final active pathimon', () => {
    const battle = createBattleState({
      party: [
        createMonster({
          hp: 500,
          maxHp: 500,
          countermeasures: { direct: ['알벤다졸'], symptomTags: [] },
        }),
        createMonster({
          name: '바이러스몬',
          hp: 100,
          maxHp: 100,
          countermeasures: { direct: ['인터페론'], symptomTags: [] },
        }),
      ],
      enemy: createMonster({
        name: '면역챔피언',
        category: '보스 사람',
        moveset: ['m_rx_알벤다졸', 'm_interferon'],
        moveSlots: ['m_rx_알벤다졸', 'm_interferon', null, null],
        plannedMoveIds: ['m_rx_알벤다졸', 'm_interferon'],
        bossPhase2Activated: true,
        isBoss: true,
        isTrainer: true,
        attack: 12,
        hp: 400,
        maxHp: 999,
      }),
    });

    const result = resolvePlayerMove(battle, 'coagulase', 1);

    expect(result.lastLog).toContain('알벤다졸 투여');
    expect(result.lastLog).toContain('인터페론 활성화');
    expect(result.party[0].hp).toBeLessThan(500);
    expect(result.enemy?.plannedMoveIds).toHaveLength(2);
  });

  it('queues phase two without generating its two-move telegraph until the transition is acknowledged', () => {
    const battle = createBattleState({
      party: [createMonster({ hp: 999, maxHp: 999, attack: 10 })],
      enemy: createMonster({
        name: '면역챔피언',
        category: '보스 사람',
        moveset: ['m_rx_알벤다졸', 'm_interferon'],
        plannedMoveIds: ['m_interferon'],
        plannedMoveId: 'm_interferon',
        isBoss: true,
        isTrainer: true,
        attack: 1,
        defense: 3,
        hp: 520,
        maxHp: 1000,
      }),
    });

    const result = resolvePlayerMove(battle, 'enterotoxin', 1, 0, 1);

    expect(result.enemy?.bossPhase2Pending).toBe(true);
    expect(result.enemy?.bossPhase2Activated).toBeFalsy();
    expect(result.enemy?.plannedMoveIds).toEqual([]);

    const activated = activateBossPhaseTwo(result, () => 0);
    expect(activated.enemy?.bossPhase2Pending).toBe(false);
    expect(activated.enemy?.bossPhase2Activated).toBe(true);
    expect(activated.enemy?.plannedMoveIds).toHaveLength(2);
  });

  it('uses the default phase-two line through floor 60 and professor-specific lines afterward', () => {
    expect(bossPhaseTwoDialogue(createMonster({ isBoss: true }), 60)).toEqual(['...']);
    expect(bossPhaseTwoDialogue(createMonster({
      isBoss: true,
      phase2Dialogue: ['One minute...'],
    }), 80)).toEqual(['One minute...']);
    expect(bossPhaseTwoDialogue(createMonster({ isBoss: true }), 80)).toEqual([]);
  });

  it('halves parasite attacks against Prof. P parasite mastery', () => {
    const parasite = createMonster({ category: '기생충', attack: 10 });
    const professor = createMonster({
      ability: 'parasite_master',
      abilities: ['parasite_master'],
      defense: 10,
      hp: 100,
      maxHp: 100,
    });

    expect(calculateDamage(parasite, professor, MOVES.coagulase, 1).multiplier.total).toBe(0.5);
  });

  it('turns one party member into a move-less substitute when Prof. S uses the floor-100 seal', () => {
    const battle = createBattleState({
      floor: 100,
      party: [
        createMonster({ name: '선두', hp: 80, maxHp: 80, attack: 20, defense: 10 }),
        createMonster({ name: '후열', hp: 70, maxHp: 90, attack: 30, defense: 12 }),
      ],
      enemy: createMonster({
        name: '미생물학 교수 Prof. S',
        isBoss: true,
        isTrainer: true,
        finalBossSkill: 'seal',
      }),
    });

    const result = applyFinalBossSkill(battle, () => 0.99);
    const doll = result.party[1];

    expect(doll.name).toBe('봉인 인형');
    expect(doll.sealedByBoss).toBe(true);
    expect(doll.sealedOriginalName).toBe('후열');
    expect(doll.moveset).toEqual([]);
    expect(doll.maxHp).toBe(90);
    expect(doll.attack).toBe(30);
    expect(doll.defense).toBe(12);
    expect(result.enemy?.finalBossSkillApplied).toBe(true);
  });

  it('does not allow a sealed substitute to switch into battle', () => {
    const battle = createBattleState({
      party: [
        createMonster({ name: '선두' }),
        createMonster({ name: '봉인 인형', sealedByBoss: true, moveset: [] }),
      ],
    });

    const result = resolveSwitchMonster(battle, 1, 1);

    expect(result.activeIndex).toBe(0);
    expect(result.lastLog).toContain('봉인');
  });

  it('asks for a forced switch when the floor-100 seal hits the active pathimon', () => {
    const battle = createBattleState({
      floor: 100,
      activeIndex: 0,
      party: [
        createMonster({ name: '선두' }),
        createMonster({ name: '후열' }),
      ],
      enemy: createMonster({
        name: '미생물학 교수 Prof. S',
        isBoss: true,
        isTrainer: true,
        finalBossSkill: 'seal',
      }),
    });

    const result = applyFinalBossSkill(battle, () => 0);

    expect(result.activeIndex).toBe(0);
    expect(result.party[0].sealedByBoss).toBe(true);
    expect(result.phase).toBe('forcedSwitch');
    expect(result.lastLog).toContain('다음 패시몬');
  });

  it('can resolve dyspnea as a turn-end instant collapse chance', () => {
    const monster = createMonster({
      hp: 30,
      statusConditions: { dyspnea: 1 },
    });

    const damage = tickEffects(monster, () => 0);

    expect(damage).toBe(30);
    expect(monster.fainted).toBe(true);
  });
});

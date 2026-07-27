import { ABILITIES } from '../data/abilities';
import { EFFECTIVENESS } from '../data/effectiveness';
import { ATTACK_TYPE_LABELS, TAG_LABELS } from '../data/labels';
import { MOVES } from '../data/moves';
import { BOSS_ATTACK_MOVE_IDS } from '../data/bossAttackMatchups';
import {
  STATUS_CONDITIONS,
  STATUS_CONDITION_IDS,
  statusConditionEffectText,
  statusConditionLabels,
  statusConditionStackLabel,
  statusConditionStacks,
} from '../data/statusConditions';
import { currentMoveData, currentMoveName } from '../battle/moveStages';
import { bossMoveEffectiveness, createBossDefenseProfile } from '../battle/bossMatchup';
import { interpolatePathimonName, withParticle } from '../game/text';
import { randomLearningPoint, sanitizeLearningText } from '../game/learning';
import type { AbilityId, CapsuleId, EffectPrimitive, EncounterKind, MonsterData, MoveData, MoveId, MoveSlot, RunMode, RuntimeMonster, TagValue, VisualStyle } from '../types/game';
import { isTouchCapable, type TouchCapabilitySignals } from './mobileLayout';

export type BattleActionId = 'fight' | 'pass' | 'capsule' | 'dex' | 'party';
export type PartyMenuPurpose = 'switch' | 'forced' | 'release';

export interface BattleActionOption {
  disabled?: boolean;
  id: BattleActionId;
  label: string;
}

const PATHIMON_TYPE_BORDER_COLORS: Record<string, number> = {
  바이러스: 0xeff3f7,
  세균: 0x409bf4,
  '세균 병원형': 0x409bf4,
  '세균 내성형': 0x409bf4,
  박테리아: 0x409bf4,
  진균: 0x181818,
  곰팡이: 0x181818,
  원충: 0x21167e,
  원생동물: 0x21167e,
  프로토조아: 0x21167e,
  연충: 0xeaab1d,
  선충: 0xeaab1d,
  흡충: 0xeaab1d,
  조충: 0xeaab1d,
  기생충: 0xeaab1d,
  프리온: 0xa441bd,
};

export type PathimonTypeIconKind = 'virus' | 'bacteria' | 'fungus' | 'protozoa' | 'parasite' | 'prion';

export interface PathimonTypeIcon {
  assetPath: string;
  color: number;
  kind: PathimonTypeIconKind;
}

const PATHIMON_TYPE_ICONS: Record<string, PathimonTypeIcon> = {
  바이러스: { assetPath: pathimonTypeIconAssetPath('virus'), color: PATHIMON_TYPE_BORDER_COLORS.바이러스, kind: 'virus' },
  세균: { assetPath: pathimonTypeIconAssetPath('bacteria'), color: PATHIMON_TYPE_BORDER_COLORS.세균, kind: 'bacteria' },
  '세균 병원형': { assetPath: pathimonTypeIconAssetPath('bacteria'), color: PATHIMON_TYPE_BORDER_COLORS['세균 병원형'], kind: 'bacteria' },
  '세균 내성형': { assetPath: pathimonTypeIconAssetPath('bacteria'), color: PATHIMON_TYPE_BORDER_COLORS['세균 내성형'], kind: 'bacteria' },
  박테리아: { assetPath: pathimonTypeIconAssetPath('bacteria'), color: PATHIMON_TYPE_BORDER_COLORS.박테리아, kind: 'bacteria' },
  진균: { assetPath: pathimonTypeIconAssetPath('fungus'), color: PATHIMON_TYPE_BORDER_COLORS.진균, kind: 'fungus' },
  곰팡이: { assetPath: pathimonTypeIconAssetPath('fungus'), color: PATHIMON_TYPE_BORDER_COLORS.곰팡이, kind: 'fungus' },
  원충: { assetPath: pathimonTypeIconAssetPath('protozoa'), color: PATHIMON_TYPE_BORDER_COLORS.원충, kind: 'protozoa' },
  원생동물: { assetPath: pathimonTypeIconAssetPath('protozoa'), color: PATHIMON_TYPE_BORDER_COLORS.원생동물, kind: 'protozoa' },
  프로토조아: { assetPath: pathimonTypeIconAssetPath('protozoa'), color: PATHIMON_TYPE_BORDER_COLORS.프로토조아, kind: 'protozoa' },
  연충: { assetPath: pathimonTypeIconAssetPath('parasite'), color: PATHIMON_TYPE_BORDER_COLORS.연충, kind: 'parasite' },
  선충: { assetPath: pathimonTypeIconAssetPath('parasite'), color: PATHIMON_TYPE_BORDER_COLORS.선충, kind: 'parasite' },
  흡충: { assetPath: pathimonTypeIconAssetPath('parasite'), color: PATHIMON_TYPE_BORDER_COLORS.흡충, kind: 'parasite' },
  조충: { assetPath: pathimonTypeIconAssetPath('parasite'), color: PATHIMON_TYPE_BORDER_COLORS.조충, kind: 'parasite' },
  기생충: { assetPath: pathimonTypeIconAssetPath('parasite'), color: PATHIMON_TYPE_BORDER_COLORS.기생충, kind: 'parasite' },
  프리온: { assetPath: pathimonTypeIconAssetPath('prion'), color: PATHIMON_TYPE_BORDER_COLORS.프리온, kind: 'prion' },
};

export type BattleUnitPanelRole = 'player' | 'enemy';
export type BattleUnitPanelRowKind = 'heading' | 'name' | 'scientificName' | 'defense' | 'status' | 'symptoms';

export interface BattleUnitPanelRow {
  kind: BattleUnitPanelRowKind;
  text: string;
}
export interface BattleSceneAssets {
  grassBack: string;
  grassMid: string;
  grassFront: string;
}

export interface BattleMonsterAssets {
  back: string;
  front: string;
}

export interface BattleImageLayerLayout {
  scale: number;
  x: number;
  y: number;
}

export interface BattleFieldLayerLayout {
  background: BattleImageLayerLayout;
  enemyPlatform: BattleImageLayerLayout;
  playerPlatform: BattleImageLayerLayout;
}

export interface BattleBgmAssets {
  wild: string[];
  trainer: string[];
  boss: string[];
}

export interface BattleSfxAssets {
  blockedLaugh: string;
  faint: string;
  flee: string;
  hit: string;
  hitStrong: string;
  statUp: string;
}

export function battleActionOptions(encounterKind: EncounterKind = 'wild'): BattleActionOption[] {
  if (encounterKind === 'wild') {
    return [
      { id: 'pass', label: '지나간다' },
      { id: 'capsule', label: '캡슐' },
      { id: 'dex', label: '도감' },
      { id: 'party', label: '패시몬' },
    ];
  }

  return [
    { id: 'fight', label: '싸운다' },
    { id: 'dex', label: '도감' },
    { id: 'party', label: '패시몬' },
    { id: 'capsule', label: '캡슐 불가', disabled: true },
  ];
}

export function capsuleIconPath(capsuleId: CapsuleId): string {
  return `images/capsules/${capsuleId}.png`;
}

export function lockedMoveOverlayPath(): string {
  return 'images/ui/locked-move-chain.png';
}

export function pathimonTypeIconAssetPath(kind: PathimonTypeIconKind): string {
  return `images/ui/types/${kind}.png`;
}

export function pathimonTypeIconAssetPaths(): string[] {
  return [...new Set(Object.values(PATHIMON_TYPE_ICONS).map((icon) => icon.assetPath))];
}

export function battleFieldLayerLayouts(): BattleFieldLayerLayout {
  return {
    background: { x: 0, y: 0, scale: 3.2 },
    enemyPlatform: { x: 0, y: -18, scale: 3.2 },
    playerPlatform: { x: 0, y: -40, scale: 3.2 },
  };
}


export function battleSceneAssetPaths(): BattleSceneAssets {
  return {
    grassBack: 'images/arenas/grass_bg.png',
    grassMid: 'images/arenas/grass_a.png',
    grassFront: 'images/arenas/grass_b.png',
  };
}

export function battleBgmAssetPaths(): BattleBgmAssets {
  return {
    wild: [
      'audio/bgm/abyss.mp3',
      'audio/bgm/badlands.mp3',
      'audio/bgm/beach.mp3',
      'audio/bgm/construction_site.mp3',
      'audio/bgm/forest.mp3',
      'audio/bgm/ice_cave.mp3',
      'audio/bgm/laboratory.mp3',
      'audio/bgm/lake.mp3',
      'audio/bgm/meadow.mp3',
      'audio/bgm/plains.mp3',
      'audio/bgm/ruins.mp3',
      'audio/bgm/seabed.mp3',
      'audio/bgm/snowy_forest.mp3',
      'audio/bgm/swamp.mp3',
      'audio/bgm/temple.mp3',
      'audio/bgm/town.mp3',
      'audio/bgm/volcano.mp3',
      'audio/bgm/desert.mp3',
      'audio/bgm/factory.mp3',
      'audio/bgm/grass.mp3',
      'audio/bgm/island.mp3',
      'audio/bgm/jungle.mp3',
      'audio/bgm/metropolis.mp3',
      'audio/bgm/power_plant.mp3',
      'audio/bgm/sea.mp3',
      'audio/bgm/slum.mp3',
      'audio/bgm/wasteland.mp3',
      'audio/bgm/tall_grass.mp3',
    ],
    trainer: [
      'audio/bgm/battle_rival.mp3',
      'audio/bgm/battle_rocket_grunt.mp3',
      'audio/bgm/battle_wild.mp3',
      'audio/bgm/battle_trainer.mp3',
    ],
    boss: [
      'audio/bgm/battle_aqua_magma_grunt.mp3',
      'audio/bgm/battle_champion_geeta.mp3',
      'audio/bgm/battle_champion_kieran.mp3',
      'audio/bgm/battle_galactic_boss.mp3',
      'audio/bgm/battle_kalos_elite.mp3',
      'audio/bgm/battle_legendary_giratina.mp3',
      'audio/bgm/battle_legendary_lake_trio.mp3',
      'audio/bgm/battle_legendary_res_zek.mp3',
      'audio/bgm/battle_legendary_ruinous.mp3',
      'audio/bgm/battle_legendary_terapagos.mp3',
      'audio/bgm/battle_macro_boss.mp3',
      'audio/bgm/battle_plasma_grunt.mp3',
      'audio/bgm/battle_rival_3.mp3',
      'audio/bgm/battle_rogue_mega.mp3',
      'audio/bgm/battle_sinnoh_champion.mp3',
      'audio/bgm/battle_sinnoh_gym.mp3',
      'audio/bgm/battle_skull_grunt.mp3',
      'audio/bgm/battle_star_boss.mp3',
      'audio/bgm/battle_star_grunt.mp3',
      'audio/bgm/battle_unova_gym.mp3',
    ],
  };
}

export function battleBgmAudioPaths(): string[] {
  const assets = battleBgmAssetPaths();
  return [...new Set([
    ...assets.wild,
    ...assets.trainer,
    ...assets.boss,
    'audio/bgm/battle_galar_gym.mp3',
    'audio/bgm/end_summit.mp3',
    'audio/bgm/battle_legendary_unova.mp3',
  ])];
}

function clampedPoolIndex(length: number, roll: number): number {
  return Math.min(
    length - 1,
    Math.max(0, Math.floor(roll * length)),
  );
}

function wildBgmGroupIndex(floor: number): number {
  return Math.max(0, Math.floor((floor - 1) / 5));
}

function seededRoll(seed: number, salt: number): number {
  let value = (seed ^ Math.imul(salt + 1, 0x9e3779b1)) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b) >>> 0;
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35) >>> 0;
  return ((value ^ (value >>> 16)) >>> 0) / 0x100000000;
}

function isSkyTowerSummitFloor(floor: number): boolean {
  return (floor >= 90 && floor <= 94) || (floor >= 96 && floor <= 99);
}

export function chooseBattleBgm(input: { encounterKind?: EncounterKind; floor: number; isBoss?: boolean; roll: number; seed?: number }): string {
  const assets = battleBgmAssetPaths();
  if (input.floor === 100) return 'audio/bgm/battle_legendary_unova.mp3';
  if (isSkyTowerSummitFloor(input.floor)) return 'audio/bgm/end_summit.mp3';
  if (input.floor === 70) return 'audio/bgm/battle_galar_gym.mp3';

  const encounterKind = input.encounterKind ?? (input.isBoss || input.floor % 10 === 0 ? 'boss' : input.floor % 5 === 0 ? 'trainer' : 'wild');
  const pool = encounterKind === 'boss'
    ? assets.boss
    : encounterKind === 'trainer'
      ? assets.trainer
      : assets.wild;
  const rollSalt = encounterKind === 'wild'
    ? wildBgmGroupIndex(input.floor)
    : input.floor + (encounterKind === 'boss' ? 1000 : 500);
  const roll = input.seed !== undefined
    ? seededRoll(input.seed, rollSalt)
    : input.roll;
  const index = clampedPoolIndex(pool.length, roll);
  return pool[index];
}

export function shouldPreserveBattleBgm(input: {
  currentEncounterKind: EncounterKind;
  currentKey: string;
  nextEncounterKind: EncounterKind;
  nextFloor: number;
  seed?: number;
}): boolean {
  if (input.currentEncounterKind !== 'wild' || input.nextEncounterKind !== 'wild') return false;
  return input.currentKey === chooseBattleBgm({
    floor: input.nextFloor,
    encounterKind: input.nextEncounterKind,
    roll: 0,
    seed: input.seed,
  });
}

export function battleSfxAssetPaths(): BattleSfxAssets {
  return {
    blockedLaugh: 'audio/se/evil_haha.wav',
    faint: 'audio/se/faint.wav',
    flee: 'audio/se/flee.wav',
    hit: 'audio/se/hit.wav',
    hitStrong: 'audio/se/hit_strong.wav',
    statUp: 'audio/se/stat_up.wav',
  };
}

export function pokerogueAtlasJsonPath(pngPath: string): string {
  return pngPath.replace(/\.png$/, '.json');
}

type PathimonSpriteSource =
  | Pick<RuntimeMonster, 'assetBaseId' | 'assetPath' | 'templateId'>
  | Pick<MonsterData, 'assetBaseId' | 'id'>;

export function pathimonSpriteAssets(monster: PathimonSpriteSource, visualStyle: VisualStyle = 'character'): BattleMonsterAssets {
  if ('assetPath' in monster && monster.assetPath) {
    return {
      front: monster.assetPath,
      back: monster.assetPath,
    };
  }

  const assetId = monster.assetBaseId ?? ('templateId' in monster ? monster.templateId : monster.id);
  if (visualStyle === 'micro') {
    const front = `images/pathimon/${assetId}-micro-front.png`;
    return {
      front,
      back: front,
    };
  }

  return {
    front: `images/pathimon/${assetId}-front.png`,
    back: `images/pathimon/${assetId}-back.png`,
  };
}

export function combatSpriteScale(monster: RuntimeMonster, baseScale: number): number {
  const trainerScale = monster.isTrainer ? 2.75 : baseScale;
  const bossScale = monster.isBoss && monster.bossPhase2Activated ? trainerScale * 1.2 : trainerScale;
  const parasiteCategories = ['연충', '선충', '흡충', '조충', '기생충'];
  if (!parasiteCategories.includes(monster.category)) return bossScale;
  if (monster.name.endsWith('-충란')) return bossScale * 0.9;
  if (monster.name.endsWith('-성충')) return bossScale * 1.1;
  return bossScale;
}

export function pathimonTypeBorderColor(monster: RuntimeMonster, mode: RunMode): number | undefined {
  if (mode !== 'challenge' || monster.isTrainer) {
    return undefined;
  }

  return PATHIMON_TYPE_BORDER_COLORS[monster.category];
}

export function pathimonTypeIcon(monster: RuntimeMonster, mode: RunMode): PathimonTypeIcon | undefined {
  if (mode !== 'challenge' || monster.isTrainer) {
    return undefined;
  }

  return PATHIMON_TYPE_ICONS[monster.category];
}

export function normalizedSpriteScale(baseScale: number, textureWidth: number, referenceWidth = 96): number {
  return textureWidth > referenceWidth ? baseScale * referenceWidth / textureWidth : baseScale;
}

export function paginateWrappedTextLines(lines: string[], maxLines: number): string[] {
  const pageSize = Math.max(1, Math.floor(maxLines));
  const pages: string[] = [];

  for (let index = 0; index < lines.length; index += pageSize) {
    pages.push(lines.slice(index, index + pageSize).join('\n'));
  }

  return pages.length > 0 ? pages : [''];
}

export function paginateWrappedTextBlocks(blocks: string[][], maxLines: number): string[] {
  const pageSize = Math.max(1, Math.floor(maxLines));
  const pages: string[] = [];
  let current: string[] = [];

  const flush = () => {
    if (current.length === 0) return;
    pages.push(current.join('\n'));
    current = [];
  };

  blocks.filter((block) => block.length > 0).forEach((block) => {
    if (block.length <= pageSize) {
      if (current.length + block.length > pageSize) flush();
      current.push(...block);
      return;
    }

    flush();
    const pageCount = Math.ceil(block.length / pageSize);
    const baseSize = Math.floor(block.length / pageCount);
    let remainder = block.length % pageCount;
    let offset = 0;
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      const chunkSize = baseSize + (remainder > 0 ? 1 : 0);
      remainder = Math.max(0, remainder - 1);
      const chunk = block.slice(offset, offset + chunkSize);
      offset += chunkSize;
      if (pageIndex > 0 && chunk[0]) chunk[0] = `(계속) ${chunk[0]}`;
      pages.push(chunk.join('\n'));
    }
  });

  flush();
  return pages.length > 0 ? pages : [''];
}

export function stripMarkdownEmphasis(text: string): string {
  return text.replace(/[*`]/g, '');
}

export interface ButtonRectLayout {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface ButtonMarkerPoint {
  x: number;
  y: number;
}

export interface LabeledButtonLayout extends ButtonRectLayout {
  label: string;
}

export function cursorMarkerPoint(button: Pick<ButtonRectLayout, 'height' | 'x' | 'y'>): ButtonMarkerPoint {
  return {
    x: button.x - 18,
    y: button.y + button.height / 2,
  };
}

export function mobileHomeButtonLayout(): LabeledButtonLayout {
  return {
    x: 900,
    y: 538,
    width: 108,
    height: 28,
    label: '처음으로',
  };
}

export interface MobileControlOverlayLayout {
  actionA: { radius: number; x: number; y: number };
  actionB: { radius: number; x: number; y: number };
  dpad: {
    armLength: number;
    hitSize: number;
    step: number;
    thickness: number;
    x: number;
    y: number;
  };
}

export function mobileControlOverlayLayout(): MobileControlOverlayLayout {
  return {
    dpad: {
      x: 110,
      y: 470,
      armLength: 196,
      thickness: 64,
      step: 62,
      hitSize: 68,
    },
    actionA: { x: 904, y: 430, radius: 58 },
    actionB: { x: 810, y: 504, radius: 52 },
  };
}

export function mobileControlOverlayInteractive(input: TouchCapabilitySignals): boolean {
  return isTouchCapable(input);
}

// 도전모드에서 상성표는 사실상 정답표다. 그냥 열리면 예고를 읽고 교체하는 판단이 사라진다.
// 막지는 않되 한 번 찔러서, 표를 여는 것이 '선택'이라는 감각을 남긴다.
export const MATCHUP_GATE_TAUNTS: string[] = [
  '상성표 없이는 자신 없나?',
  '커닝페이퍼, 지금 펴시겠습니까?',
  '기억이 안 나는 건가, 원래 몰랐던 건가?',
  '국가고시장에는 이 표 못 들고 간다.',
  '족보 없이 한 판, 어떤가?',
  '교수님이 뒤에서 보고 계신다.',
  '이 정도는 외우고 왔어야 하지 않나?',
  '펼치는 순간 실력은 0점 처리다. 물론 농담이고.',
];

export interface MatchupGateCopy {
  cancelLabel: string;
  confirmLabel: string;
  subtitle: string;
  taunt: string;
  title: string;
}

export function matchupGateCopy(roll = Math.random()): MatchupGateCopy {
  const index = Math.min(MATCHUP_GATE_TAUNTS.length - 1, Math.max(0, Math.floor(roll * MATCHUP_GATE_TAUNTS.length)));
  return {
    title: '상성표를 펼치기 전에',
    taunt: MATCHUP_GATE_TAUNTS[index],
    subtitle: '이번 전투 동안은 다시 묻지 않는다.',
    confirmLabel: '그래도 본다',
    cancelLabel: '내 힘으로 한다',
  };
}

// 학습모드는 가르치는 모드라 그냥 연다. 도전모드에서만, 전투당 한 번만 묻는다.
export function shouldGateMatchupTable(input: { mode: RunMode; alreadyAcknowledged: boolean }): boolean {
  return input.mode === 'challenge' && !input.alreadyAcknowledged;
}

// 진화는 무료·즉시라 정비구역이 없는 학습모드에서도 성장 수단이 남는다.
// 놓아줄 대상을 고르는 화면에서는 진화를 띄우지 않는다.
export function partyMenuOptions(purpose: PartyMenuPurpose, canEvolve = false): string[] {
  if (purpose === 'release') return ['놓아준다', '능력치를 본다', '그만둔다'];
  const evolveOption = canEvolve ? ['진화한다'] : [];
  if (purpose === 'forced') return ['교체한다', ...evolveOption, '능력치를 본다'];
  return ['교체한다', ...evolveOption, '능력치를 본다', '그만둔다'];
}

export interface BattlePanelLayout {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface BattleHpBarLayout {
  barWidth: number;
  barX: number;
  barY: number;
  percentX: number;
  percentY: number;
}

export interface BattleSpriteLayout {
  scale: number;
  x: number;
  y: number;
}

export function battleHpBarLayout(panel: BattlePanelLayout): BattleHpBarLayout {
  return {
    barX: panel.x + 82,
    barY: panel.y + 98,
    barWidth: panel.width - 126,
    percentX: panel.x + panel.width - 36,
    percentY: panel.y + 89,
  };
}

export function battleUnitPanelLayouts(): { enemy: BattlePanelLayout; player: BattlePanelLayout } {
  return {
    enemy: { x: 36, y: 20, width: 408, height: 148 },
    player: { x: 584, y: 244, width: 404, height: 124 },
  };
}

export function battleSpriteLayouts(): { enemy: BattleSpriteLayout; player: BattleSpriteLayout } {
  const platformLayout = battleFieldLayerLayouts();
  // Platform art sits off-center inside its transparent 320px canvas.
  const enemyPlatformCenterX = 215.5;
  const playerPlatformCenterX = 103.5;

  return {
    enemy: {
      x: platformLayout.enemyPlatform.x + enemyPlatformCenterX * platformLayout.enemyPlatform.scale,
      y: 218,
      scale: 2.5,
    },
    player: {
      x: platformLayout.playerPlatform.x + playerPlatformCenterX * platformLayout.playerPlatform.scale,
      y: 382,
      scale: 2.1,
    },
  };
}

export interface PokedexMoveRow {
  accuracy: string;
  description: string;
  learnText: string;
  matchReason?: string;
  multiplier?: 1 | 2 | 4;
  name: string;
  power: string;
  type: string;
}

export interface PokedexEffectivenessRow {
  attackType: string;
  multiplier: string;
  target: string;
}

export interface BattleMatchupSections {
  defense: PokedexEffectivenessRow[];
  offense: PokedexEffectivenessRow[];
}

export interface BattleDexSummary {
  emptyMoveMessage: string;
  moveHeading: string;
  moveRows: PokedexMoveRow[];
  moveTabLabel: string;
  opponentName: string;
  statLine: string;
  typeLine: string;
}

export interface BossAttackMatchupRow {
  attackName: string;
  attackType: string;
  matchedTags: string;
  moveId: MoveId;
  targetTags: string;
  multiplier?: number;
}

export interface AnnouncedTreatmentPartyMatchup {
  monsterName: string;
  multiplier: 1 | 2 | 4;
}

export interface AnnouncedTreatmentMatchup {
  attackName: string;
  party: AnnouncedTreatmentPartyMatchup[];
}

function labelEffectivenessTarget(target: AbilityId | TagValue): string {
  return ABILITIES[target as AbilityId]?.name ?? TAG_LABELS[target as TagValue] ?? target;
}

function labelMultiplier(multiplier: number): string {
  if (multiplier === 0) return '무효';
  if (multiplier > 1) return `강함 x${multiplier}`;
  if (multiplier < 1) return `약함 x${multiplier}`;
  return '보통 x1';
}

function formatMoveRow(
  moveId: MoveId,
  monster?: RuntimeMonster,
  multiplier?: 1 | 2 | 4,
  matchReason?: string,
): PokedexMoveRow {
  const move = currentMoveData(MOVES[moveId], monster);
  return {
    name: move.name,
    type: moveTypeLabel(move),
    power: `${move.power}`,
    accuracy: `${Math.round(move.accuracy * 100)}%`,
    description: interpolateMoveText(move.description, monster),
    learnText: interpolateMoveText(move.learnText, monster),
    matchReason,
    multiplier,
  };
}

export function formatPokedexMoveRows(moveIds?: MoveId[], monster?: RuntimeMonster): PokedexMoveRow[] {
  const ids = moveIds ?? Object.keys(MOVES) as MoveId[];
  return ids.map((moveId) => formatMoveRow(moveId, monster));
}

export function formatPokedexEffectivenessRows(): PokedexEffectivenessRow[] {
  return Object.entries(EFFECTIVENESS).flatMap(([attackType, targets]) =>
    Object.entries(targets ?? {}).map(([target, multiplier]) => ({
      attackType: ATTACK_TYPE_LABELS[attackType as keyof typeof ATTACK_TYPE_LABELS],
      target: labelEffectivenessTarget(target as AbilityId | TagValue),
      multiplier: labelMultiplier(multiplier ?? 1),
    })),
  );
}

function battleMatchupTargets(monster: RuntimeMonster): Set<AbilityId | TagValue> {
  const abilities = (monster.abilities?.length ? monster.abilities : [monster.ability]).filter((ability) => ability !== 'none');
  const targets = new Set<AbilityId | TagValue>(abilities);
  Object.values(monster.tags).forEach((tag) => {
    if (tag) targets.add(tag);
  });
  return targets;
}

function formatStrongRowsForMonster(monster: RuntimeMonster): PokedexEffectivenessRow[] {
  const targetsToShow = battleMatchupTargets(monster);

  return Object.entries(EFFECTIVENESS)
    .flatMap(([attackType, targets]) =>
      Object.entries(targets ?? {})
        .filter(([target, multiplier]) => targetsToShow.has(target as AbilityId | TagValue) && (multiplier ?? 1) > 1)
        .map(([target, multiplier]) => ({
          attackType: ATTACK_TYPE_LABELS[attackType as keyof typeof ATTACK_TYPE_LABELS],
          target: labelEffectivenessTarget(target as AbilityId | TagValue),
          multiplier: labelMultiplier(multiplier ?? 1),
        })),
    )
    .sort((a, b) => `${a.target}${a.attackType}`.localeCompare(`${b.target}${b.attackType}`, 'ko'));
}

export function formatBattleMatchupSections(player: RuntimeMonster, enemy: RuntimeMonster): BattleMatchupSections {
  return {
    offense: formatStrongRowsForMonster(enemy),
    defense: formatStrongRowsForMonster(player),
  };
}

// 백신은 감염 전 예방이라 학습상 (백신)으로 명시한다(치료약과 구분). ×4 판정은 동일하다.
const VACCINE_MOVE_IDS = new Set<MoveId>(['m_vaccination']);

function bossAttackDisplayName(move: MoveData, enemy: RuntimeMonster): string {
  const name = currentMoveName(move, enemy);
  return VACCINE_MOVE_IDS.has(move.id) ? `${name} (백신)` : name;
}

// 적은 전체 기술 풀(면역+약물)을 들고 있어 순서대로 자르면 앞쪽 면역기술만 보인다.
// defender(내 활성 패시몬)를 주면 그 패시몬에 대한 배율(×4/×2/×1)로 정렬해, 실제로 위협적인 처치(약)가 위로 온다.
export function formatBossAttackMatchupRows(enemy: RuntimeMonster, defender?: RuntimeMonster): BossAttackMatchupRow[] {
  const moveIds = battleMoveSlots(enemy).filter((moveId): moveId is MoveId => Boolean(moveId));
  const profile = defender ? createBossDefenseProfile(defender) : undefined;

  const rows = moveIds
    .map((moveId) => MOVES[moveId])
    .filter((move): move is MoveData => Boolean(move))
    .map((move) => {
      const effectiveness = profile ? bossMoveEffectiveness(move, profile) : undefined;
      return {
        attackName: bossAttackDisplayName(move, enemy),
        attackType: ATTACK_TYPE_LABELS[move.type],
        matchedTags: effectiveness?.matchedTags.join(', ') ?? '',
        moveId: move.id,
        targetTags: move.targetTags?.length ? move.targetTags.join(', ') : '없음',
        multiplier: effectiveness?.multiplier,
      };
    });

  if (profile) {
    rows.sort((a, b) => (b.multiplier ?? 0) - (a.multiplier ?? 0));
  }
  return rows;
}

export function formatWildTreatmentRows(wild: RuntimeMonster): BossAttackMatchupRow[] {
  const treatmentSource: RuntimeMonster = {
    ...wild,
    moveset: BOSS_ATTACK_MOVE_IDS,
    moveSlots: BOSS_ATTACK_MOVE_IDS,
  };
  return formatBossAttackMatchupRows(treatmentSource, wild)
    .filter((row) => (row.multiplier ?? 1) > 1);
}

export function formatAnnouncedTreatmentMatchups(
  enemy: RuntimeMonster,
  party: RuntimeMonster[],
): AnnouncedTreatmentMatchup[] {
  const plannedIds = enemy.plannedMoveIds?.length
    ? enemy.plannedMoveIds
    : [enemy.plannedMoveId].filter((moveId): moveId is MoveId => Boolean(moveId));

  return plannedIds
    .map((moveId) => MOVES[moveId])
    .filter((move): move is MoveData => Boolean(move))
    .map((move) => ({
      attackName: bossAttackDisplayName(move, enemy),
      party: party.map((monster) => ({
        monsterName: monster.name,
        multiplier: bossMoveEffectiveness(move, createBossDefenseProfile(monster)).multiplier,
      })),
    }));
}

function hasFinalConsonant(text: string): boolean {
  const letters = [...text.trim()];
  for (let index = letters.length - 1; index >= 0; index -= 1) {
    const code = letters[index]!.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      return (code - 0xac00) % 28 !== 0;
    }
  }
  return false;
}

function objectParticle(text: string): '을' | '를' {
  return hasFinalConsonant(text) ? '을' : '를';
}

function topicParticle(text: string): '은' | '는' {
  const letters = [...text.trim()];
  const last = letters[letters.length - 1];
  if (!last) return '는';
  if (/^\d$/.test(last)) return ['0', '1', '3', '6', '7', '8'].includes(last) ? '은' : '는';

  const code = last.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0 ? '은' : '는';
}

function joinIntentMoveLabels(labels: string[]): string {
  return labels.reduce((text, label, index) => {
    if (index === 0) return label;
    const previous = labels[index - 1]!;
    return `${text}${hasFinalConsonant(previous) ? '과' : '와'} ${label}`;
  }, '');
}

function intentMoveLabel(move: MoveData): string {
  return move.name;
}

export function enemyIntentText(enemy: RuntimeMonster): string {
  const plannedIds = enemy.plannedMoveIds?.length
    ? enemy.plannedMoveIds
    : [enemy.plannedMoveId ?? enemy.moveset[0]].filter((moveId): moveId is MoveId => Boolean(moveId));
  const plannedMoves = plannedIds.map((moveId) => MOVES[moveId]).filter((move): move is MoveData => Boolean(move));

  const topic = topicParticle(enemy.name);
  if (plannedMoves.length === 0) return `${enemy.name}${topic} 공격을 준비하고 있다.`;
  const labels = plannedMoves.map(intentMoveLabel);
  if (labels.length === 1) return `${enemy.name}${topic} ${labels[0]}${objectParticle(labels[0]!)} 하려고 한다.`;
  const joinedLabels = joinIntentMoveLabels(labels);
  return `${enemy.name}${topic} ${joinedLabels}${objectParticle(joinedLabels)} 준비하고 있다.`;
}
export function commandViewLines(
  player: RuntimeMonster,
  enemy: RuntimeMonster,
  encounterKind: EncounterKind,
  notice: string,
  helperText: string,
  onboardingText = '',
): string[] {
  const lines = [`${withParticle(player.name, '은')} 무엇을 할까?`];
  if (encounterKind === 'wild') {
    lines.push(notice || helperText);
    if (onboardingText && onboardingText !== notice) lines.push(onboardingText);
  } else {
    lines.push(enemyIntentText(enemy));
  }
  return lines.filter((line) => line.length > 0);
}
interface MoveSelectionPressInput {
  armedMoveId: MoveId;
  moveId: MoveId;
  selectedMoveId: MoveId;
}

interface MoveSelectionPressResult {
  armedMoveId: MoveId;
  intent: 'execute' | 'preview';
  selectedMoveId: MoveId;
}

export function resolveMoveSelectionPress(input: MoveSelectionPressInput): MoveSelectionPressResult {
  const canExecute = input.armedMoveId === input.moveId && input.selectedMoveId === input.moveId;

  return {
    armedMoveId: input.moveId,
    intent: canExecute ? 'execute' : 'preview',
    selectedMoveId: input.moveId,
  };
}

export function hpPct(monster: RuntimeMonster): number {
  return monster.hp / Math.max(1, monster.maxHp);
}

export function hpPercentLabel(monster: RuntimeMonster): string {
  const pct = Math.max(0, Math.min(1, hpPct(monster)));
  return `${Math.round(pct * 100)}%`;
}

export function formatMoveName(moveId: MoveId, monster?: RuntimeMonster): string {
  return currentMoveName(MOVES[moveId], monster);
}

function interpolateMoveText(text: string, monster?: RuntimeMonster): string {
  return monster ? interpolatePathimonName(text, monster.name) : text;
}

function moveTypeLabel(move: MoveData): string {
  if (move.typeLabel) return move.typeLabel;
  if (move.kind === 'prep') return '준비';
  return ATTACK_TYPE_LABELS[move.type];
}

function moveKindLabel(move: MoveData): string {
  if (move.signature || move.kind === 'signature') return '전용기';
  if (move.kind === 'prep') return '준비기';
  return '공격기';
}

function primitiveEffectLabel(effect: EffectPrimitive): string {
  if (effect.kind === 'buff') {
    const stat = effect.stat === 'attack' ? '공격력' : '방어';
    if (typeof effect.rank === 'number' && effect.rank !== 0) return `${stat} ${effect.rank > 0 ? '+' : ''}${effect.rank}랭크`;
    return `${stat} ${effect.pct > 0 ? '+' : ''}${effect.pct}%`;
  }
  if (effect.kind === 'condition') return '';
  if (effect.kind === 'invuln') return `무적 ${effect.turns}턴`;
  if (effect.kind === 'dot') return `지속피해 ${effect.power}`;
  if (effect.kind === 'field') return '받는 피해 감소';
  if (effect.kind === 'heal') return `회복 ${effect.pct}%`;
  if (effect.kind === 'status') return effect.status === 'confusion' ? '혼란' : '마비';
  if (effect.kind === 'convert') return '전환';
  return '';
}

function conditionEffectLabels(move: MoveData): string[] {
  const labels = move.effects
    ?.filter((effect): effect is Extract<EffectPrimitive, { kind: 'condition' }> => effect.kind === 'condition')
    .map((effect) => {
      const label = STATUS_CONDITIONS[effect.condition].label;
      return effect.stacks && effect.stacks > 1 ? `${label}(${effect.stacks})` : label;
    }) ?? [];
  return [...new Set(labels)];
}

// effectText는 결과별 조각을 ' / '로 이어붙인 문자열이고, 각 조각이 `상태이상: …`을 품을 수 있다.
// (예: `95% 공격 +1랭크 / 4% 공격 +2랭크, 상태이상: 통증 / 1% 공격 +4랭크, 상태이상: 발열, 기침`)
// 첫 마커에서만 자르면 두 번째 조각부터 상태이상 줄에 섞여 들어가므로 조각 단위로 나눈다.
function splitEffectText(effectText: string): { conditions: string; effect: string } {
  const marker = '상태이상:';
  const effects: string[] = [];
  const conditions: string[] = [];

  for (const segment of effectText.split(' / ')) {
    const markerIndex = segment.indexOf(marker);
    if (markerIndex < 0) {
      const effect = segment.trim();
      if (effect) effects.push(effect);
      continue;
    }

    const effect = segment.slice(0, markerIndex).replace(/[\s,]+$/, '').trim();
    if (effect) effects.push(effect);

    for (const condition of segment.slice(markerIndex + marker.length).split(',')) {
      const trimmed = condition.trim();
      if (trimmed && !conditions.includes(trimmed)) conditions.push(trimmed);
    }
  }

  return { effect: effects.join(' / '), conditions: conditions.join(', ') };
}

function moveEffectParts(move: MoveData): { conditions: string; effect: string } {
  const conditionLabels = conditionEffectLabels(move);
  if (move.effectText?.trim()) {
    const split = splitEffectText(move.effectText.trim());
    return {
      effect: split.effect || '없음',
      conditions: split.conditions || (conditionLabels.length > 0 ? conditionLabels.join(', ') : '없음'),
    };
  }

  const effectLabels = move.effects?.map(primitiveEffectLabel).filter(Boolean) ?? [];
  return {
    effect: effectLabels.length > 0 ? effectLabels.join(', ') : '없음',
    conditions: conditionLabels.length > 0 ? conditionLabels.join(', ') : '없음',
  };
}

export function formatMoveDetails(
  moveId: MoveId,
  monster?: RuntimeMonster,
  random: () => number = Math.random,
): string[] {
  const move = currentMoveData(MOVES[moveId], monster);
  const parts = moveEffectParts(move);
  const learnText = randomLearningPoint(monster, random) || move.learnText;
  return [
    move.name,
    `종류: ${moveKindLabel(move)}`,
    `위력: ${move.power}`,
    `명중률: ${Math.round(move.accuracy * 100)}%`,
    `효과: ${parts.effect}`,
    `상태이상: ${parts.conditions}`,
    `기술 설명: ${interpolateMoveText(move.description, monster)}`,
    `학습: ${sanitizeLearningText(interpolateMoveText(learnText, monster))}`,
  ];
}

export interface MoveDetailSections {
  accuracy: string;
  conditions: string;
  description: string;
  effect: string;
  kind: string;
  learnText: string;
  outcomeRows: string[];
  power: string;
  title: string;
}

function moveOutcomeRows(move: MoveData, monster?: RuntimeMonster): string[] {
  if (!move.outcomes || move.outcomes.length < 4) return [];
  return move.outcomes?.map((outcome) => {
    const outcomeMove: MoveData = {
      ...move,
      description: outcome.description,
      effectText: outcome.effectText,
      effects: outcome.effects,
      learnText: outcome.learnText,
      outcomes: undefined,
      power: outcome.power ?? move.power,
      symptom: outcome.symptom,
    };
    const parts = moveEffectParts(outcomeMove);
    const details = [
      parts.effect === '없음' ? '' : parts.effect,
      parts.conditions === '없음' ? '' : parts.conditions,
    ].filter(Boolean);
    const probability = Math.round(outcome.chance * 100);
    const label = interpolateMoveText(outcome.symptom || '추가 효과', monster);
    return `${probability}%  ${label} → ${details.join(' · ') || '추가 효과 없음'}`;
  }) ?? [];
}

export function formatMoveDetailSections(
  moveId: MoveId,
  monster?: RuntimeMonster,
  random: () => number = Math.random,
): MoveDetailSections {
  const move = currentMoveData(MOVES[moveId], monster);
  const parts = moveEffectParts(move);
  const learnText = randomLearningPoint(monster, random) || move.learnText;
  return {
    title: move.name,
    kind: `종류: ${moveKindLabel(move)}`,
    power: `위력: ${move.power}`,
    accuracy: `명중률: ${Math.round(move.accuracy * 100)}%`,
    effect: `효과: ${parts.effect}`,
    conditions: `상태이상: ${parts.conditions}`,
    description: `기술 설명: ${sanitizeLearningText(interpolateMoveText(move.description, monster))}`,
    learnText: `학습: ${sanitizeLearningText(interpolateMoveText(learnText, monster))}`,
    outcomeRows: moveOutcomeRows(move, monster),
  };
}

export function statusProfileMemoLines(monster: RuntimeMonster): string[] {
  // 노트 학습포인트의 `**강조**`·`*기울임*` 마크다운을 스탯 화면에선 그대로 보여주면 안 된다.
  const lines = (monster.profileMemo ?? [])
    .map((line) => stripMarkdownEmphasis(line))
    .filter((line) => line.trim().length > 0);
  return lines.length > 0 ? lines : ['메모가 아직 정리되지 않았습니다.'];
}

export function clampProfileMemoScroll(offset: number, contentHeight: number, viewportHeight: number): number {
  return Math.min(Math.max(0, contentHeight - viewportHeight), Math.max(0, offset));
}

export function statusConditionDetailLines(monster: RuntimeMonster): string[] {
  return STATUS_CONDITION_IDS
    .map((id) => {
      const stacks = statusConditionStacks(monster, id);
      if (stacks <= 0) return undefined;

      const label = statusConditionStackLabel(id, stacks);
      return `${label}: ${statusConditionEffectText(id, stacks)}`;
    })
    .filter((line): line is string => Boolean(line));
}

export function battleMoveSlots(monster: RuntimeMonster): MoveSlot[] {
  return monster.moveSlots ?? monster.moveset.slice(0, 4);
}

export function monsterStatLine(monster: RuntimeMonster): string {
  return `HP ${monster.hp}/${monster.maxHp} · 공격 ${monster.attack} · 방어 ${monster.defense}`;
}

export function battleDexSummary(enemy: RuntimeMonster, defender?: RuntimeMonster): BattleDexSummary {
  const moveRows = enemy.isTrainer
    ? (defender ? formatBossAttackMatchupRows(enemy, defender)
      .filter((row) => (row.multiplier ?? 1) > 1)
      .slice(0, 4)
      .map((row) => formatMoveRow(
        row.moveId,
        enemy,
        row.multiplier as 1 | 2 | 4,
        row.matchedTags,
      )) : [])
    : formatPokedexMoveRows(
      battleMoveSlots(enemy).filter((moveId): moveId is MoveId => Boolean(moveId)),
      enemy,
    ).slice(0, 4);

  return {
    emptyMoveMessage: enemy.isTrainer
      ? '현재 선출에게 효과적인 적 처치가 없습니다.'
      : '등록된 기술이 없습니다.',
    moveHeading: enemy.isTrainer
      ? `현재 선출${defender ? `: ${defender.name}` : ''}에게 효과적인 적의 처치`
      : `${enemy.name}의 기술`,
    moveRows,
    moveTabLabel: enemy.isTrainer ? '효과 기술' : '기술 목록',
    opponentName: enemy.name,
    statLine: monsterStatLine(enemy),
    typeLine: `타입: ${enemy.category}`,
  };
}

export function isSignatureMove(moveId: MoveId): boolean {
  const move = MOVES[moveId];
  return Boolean(move.signature || move.kind === 'signature');
}

export function hasUsedSignatureMove(monster: RuntimeMonster, moveId: MoveId): boolean {
  return isSignatureMove(moveId) && Boolean(monster.usedSignatureMoveIds?.includes(moveId));
}

// 준비기도 전투당 1회(전용기와 동일 이력). 해금 게이트는 없다.
function isPrepMove(moveId: MoveId): boolean {
  return MOVES[moveId]?.kind === 'prep';
}

function hasUsedPrepMove(monster: RuntimeMonster, moveId: MoveId): boolean {
  return isPrepMove(moveId) && Boolean(monster.usedSignatureMoveIds?.includes(moveId));
}

export function canUseBattleMove(monster: RuntimeMonster, moveId: MoveId): boolean {
  if (isSignatureMove(moveId)) return monster.signatureUnlocked === true && !hasUsedSignatureMove(monster, moveId);
  if (isPrepMove(moveId)) return !hasUsedPrepMove(monster, moveId);
  return true;
}

export function battleMoveUnavailableReason(monster: RuntimeMonster, moveId: MoveId): string {
  if (isSignatureMove(moveId)) {
    if (monster.signatureUnlocked !== true) return '전용기가 아직 해금되지 않았습니다.';
    if (hasUsedSignatureMove(monster, moveId)) return '전용기는 전투당 한 번만 사용할 수 있습니다.';
    return '';
  }
  if (isPrepMove(moveId) && hasUsedPrepMove(monster, moveId)) {
    return '준비기는 전투당 한 번만 사용할 수 있습니다.';
  }
  return '';
}

export function firstUsableMove(monster: RuntimeMonster): MoveId {
  const move = battleMoveSlots(monster).find((moveId): moveId is MoveId => {
    if (!moveId) return false;
    return canUseBattleMove(monster, moveId);
  });
  return move ?? monster.moveset[0];
}

export function effectLabels(monster: RuntimeMonster): string[] {
  const rankTotals = new Map<'attack' | 'defense', number>();
  const otherTimedLabels: string[] = [];

  monster.effects.forEach((effect) => {
    if (effect.kind === 'buff') {
      if (!effect.stat) return;
      const statKey = effect.stat;
      const stat = statKey === 'attack' ? '공격' : '방어';
      if (typeof effect.rank === 'number' && effect.rank !== 0) {
        rankTotals.set(statKey, (rankTotals.get(statKey) ?? 0) + effect.rank);
        return;
      }
      otherTimedLabels.push(`${stat} ${effect.pct ?? 0}%`);
      return;
    }
    if (effect.kind === 'field') otherTimedLabels.push('피해감소');
    else if (effect.kind === 'invuln') otherTimedLabels.push(effect.turns ? `무적 ${effect.turns}턴` : '무적');
    else if (effect.kind === 'dot') otherTimedLabels.push('지속피해');
    else if (effect.kind === 'convert') otherTimedLabels.push('개종');
    else if (effect.kind === 'status') otherTimedLabels.push(effect.status === 'confusion' ? '혼란' : '마비');
    else if (effect.kind === 'empower_status') otherTimedLabels.push(`다음 공격 상태이상 ${effect.multiplier}배`);
  });

  const rankLabels: string[] = [];
  (['attack', 'defense'] as const).forEach((statKey) => {
    const rank = rankTotals.get(statKey) ?? 0;
    if (rank === 0) return;
    const stat = statKey === 'attack' ? '공격' : '방어';
    rankLabels.push(`${stat} ${rank > 0 ? '+' : ''}${rank}`);
  });

  return [...rankLabels, ...otherTimedLabels, ...statusConditionLabels(monster)];
}

export function defenseTraitSummary(monster: RuntimeMonster): string {
  const abilities = (monster.abilities?.length ? monster.abilities : [monster.ability]).filter((ability) => ability !== 'none');
  return abilities.length > 0 ? abilities.map((ability) => ABILITIES[ability].name).join(' / ') : '없음';
}

interface CountedLabel {
  count: number;
  label: string;
}

function countedLabelEntries(values: string[]): CountedLabel[] {
  const counts = new Map<string, number>();
  const orderedLabels: string[] = [];

  values.forEach((value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const match = trimmed.match(/^(.*?)\((\d+)\)$/);
    const label = match ? match[1].trim() : trimmed;
    const count = match ? Number(match[2]) : 1;
    if (!counts.has(label)) orderedLabels.push(label);
    counts.set(label, (counts.get(label) ?? 0) + (Number.isFinite(count) ? count : 1));
  });

  return orderedLabels.map((label) => ({ label, count: counts.get(label) ?? 1 }));
}

function countedLabels(values: string[]): string[] {
  return countedLabelEntries(values).map(({ label, count }) => (count > 1 ? `${label}(${count})` : label));
}

function subjectParticle(value: string): '가' | '이' {
  const lastCodePoint = value.codePointAt(value.length - 1);
  if (lastCodePoint === undefined || lastCodePoint < 0xac00 || lastCodePoint > 0xd7a3) return '가';
  return (lastCodePoint - 0xac00) % 28 === 0 ? '가' : '이';
}

export function defenseTraitDetailLines(monster: RuntimeMonster): string[] {
  const abilities = (monster.abilities?.length ? monster.abilities : [monster.ability])
    .filter((ability) => ability !== 'none');
  return abilities.map((ability) => {
    const data = ABILITIES[ability];
    return `${data.name}: ${data.description ?? '세부 효과가 아직 정리되지 않았습니다.'}`;
  });
}

export function symptomDetailLines(monster: RuntimeMonster): string[] {
  return countedLabelEntries(monster.symptoms ?? []).map(({ label, count }) => {
    const sources = [...new Set(
      (monster.symptomAttributions ?? [])
        .filter((attribution) => attribution.symptom === label)
        .map((attribution) => attribution.sourceName.trim())
        .filter(Boolean),
    )];
    const countedLabel = count > 1 ? `${label}(${count})` : label;
    const sourceText = sources.join(', ');
    return sources.length > 0
      ? `${countedLabel}: ${sourceText}${subjectParticle(sourceText)} 부여`
      : `${countedLabel}: 부여자 기록 없음`;
  });
}

export function symptomSummary(monster: RuntimeMonster): string {
  const labels = countedLabels(monster.symptoms ?? []);
  return labels.length > 0 ? compactLabels(labels) : '관찰 중';
}

export function statusSummary(monster: RuntimeMonster, extraLabels: string[] = []): string {
  const labels = [...effectLabels(monster), ...extraLabels];
  return labels.length > 0 ? `상태: ${compactLabels(labels)}` : '상태: 정상';
}

function compactLabels(labels: string[], visibleCount = 3): string {
  if (labels.length <= visibleCount) return labels.join(', ');
  return `${labels.slice(0, visibleCount).join(', ')} 외 ${labels.length - visibleCount}`;
}

export function battleUnitPanelRows(
  monster: RuntimeMonster,
  role: BattleUnitPanelRole,
  extraStatusLabels: string[] = [],
): BattleUnitPanelRow[] {
  const rows: BattleUnitPanelRow[] = [];
  if (monster.isBoss) rows.push({ kind: 'heading', text: 'BOSS' });

  rows.push({ kind: 'name', text: monster.name });
  if (!monster.isTrainer) rows.push({ kind: 'scientificName', text: monster.scientificName });
  if (!monster.isTrainer || role !== 'player') rows.push({ kind: 'defense', text: `방어특성: ${defenseTraitSummary(monster)}` });
  rows.push({ kind: 'status', text: statusSummary(monster, extraStatusLabels) });
  if (monster.isTrainer) rows.push({ kind: 'symptoms', text: `증상: ${symptomSummary(monster)}` });

  return rows;
}

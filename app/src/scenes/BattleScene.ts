import Phaser from 'phaser';
import {
  playHtmlBattleBgm,
  prefetchHtmlBattleBgm,
  stopHtmlBattleBgm,
} from '../audio/htmlBgm';
import {
  activateBossPhaseTwo,
  beginCaptureQuiz,
  bossPhaseTwoDialogue,
  cancelPendingCapture,
  resolveCaptureQuizAnswer,
  resolveCaptureRelease,
  resolveForcedSwitchMonster,
  resolvePassEncounter,
  resolvePlayerMove,
  resolveSwitchMonster,
} from '../battle/turn';
import { createBossRosterIds } from '../data/bosses';
import { CAPSULE_LABELS, CAPSULE_ORDER } from '../data/capsules';
import {
  conciseLearningFeedback,
  pickCaptureQuiz,
  sanitizeLearningText,
  type CaptureQuiz,
} from '../game/learning';
import { advanceFromShop, createInitialRunState, encounterKindForFloor, enterBattle } from '../state/runState';
import type { CapsuleId, HitEffectiveness, MoveId, RunState, RuntimeMonster } from '../types/game';
import { COLORS, APP_WIDTH, APP_HEIGHT } from '../game/constants';
import {
  battleActionOptions,
  battleSfxAssetPaths,
  battleMoveUnavailableReason,
  battleFieldLayerLayouts,
  battleSceneAssetPaths,
  battleSpriteLayouts,
  battleUnitPanelLayouts,
  battleUnitPanelRows,
  battleMoveSlots,
  battleDexSummary,
  canUseBattleMove,
  capsuleIconPath,
  chooseBattleBgm,
  clampProfileMemoScroll,
  commandViewLines,
  combatSpriteScale,
  cursorMarkerPoint,
  defenseTraitDetailLines,
  defenseTraitSummary,
  firstUsableMove,
  formatAnnouncedTreatmentMatchups,
  formatWildTreatmentRows,
  formatMoveDetailSections,
  formatMoveDetails,
  formatMoveName,
  hpPct,
  hpPercentLabel,
  lockedMoveOverlayPath,
  mobileControlOverlayInteractive,
  mobileHomeButtonLayout,
  normalizedSpriteScale,
  paginateWrappedTextBlocks,
  partyMenuOptions,
  pathimonTypeBorderColor,
  pathimonTypeIconAssetPaths,
  pathimonTypeIcon,
  pathimonSpriteAssets,
  resolveMoveSelectionPress,
  shouldPreserveBattleBgm,
  statusProfileMemoLines,
  statusConditionDetailLines,
  stripMarkdownEmphasis,
  symptomDetailLines,
} from '../ui/battleUi';
import type { BattleActionId, BattleUnitPanelRole, PartyMenuPurpose, PathimonTypeIcon } from '../ui/battleUi';
import { destroySceneChildren } from '../ui/sceneCleanup';
import { addBoxLabel, addLabel, drawHpBar, drawPanel } from '../ui/draw';
import { advanceTypewriter } from '../ui/typewriter';

interface BattleSceneData {
  state?: RunState;
}

type BattleViewMode = 'command' | 'moves' | 'dex' | 'party' | 'status' | 'capsules' | 'captureQuiz';
type BattleMessageStage = 'preparation' | 'combat' | 'status' | 'dialogue';
type DexTab = 'moves' | 'effectiveness';
type StatusTab = 'profile' | 'moves';
type Direction = 'up' | 'down' | 'left' | 'right';

const BATTLE_AREA_BOTTOM = 386;
const BUTTON_FILL = 0x2f2840;
const BUTTON_ACTIVE_FILL = 0x4a405d;
const OVERLAY_FILL = 0x8d8198;
const OVERLAY_STROKE = 0xd8cde6;
const OVERLAY_TEXT = 0xce6b5e;
const BATTLE_EFFECT_DEPTH = 760;
const BATTLE_STATUS_HOLD_MS = 1000;
const TYPEWRITER_INTERVAL_MS = 24;
const PHASE_TWO_BOSS_SCALE = 1.2;

export class BattleScene extends Phaser.Scene {
  private state!: RunState;
  private selectedMoveId!: MoveId;
  private armedMoveId!: MoveId;
  private viewMode: BattleViewMode = 'command';
  private dexTab: DexTab = 'moves';
  private statusTab: StatusTab = 'profile';
  private notice = '';
  private commandCursor = 0;
  private capsuleCursor = 0;
  private partyCursor = 0;
  private partyMenuOpen = false;
  private partyMenuCursor = 0;
  private statusMoveCursor = 0;
  private statusLearningOpen = false;
  private statusProfileScroll = 0;
  private statusProfileMaxScroll = 0;
  private selectedBgmKey = '';
  private preserveBattleBgmOnShutdown = false;
  private isAnimating = false;
  private enemyCombatSprite?: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
  private playerCombatSprite?: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
  private statusTooltip?: Phaser.GameObjects.Container;
  private statusTooltipTimer?: Phaser.Time.TimerEvent;
  private battleMessageStage: BattleMessageStage = 'preparation';
  private battleMessageTimer?: Phaser.Time.TimerEvent;
  private bossDialogueLines: string[] = [];
  private bossDialogueIndex = 0;
  private bossDialogueVisibleCharacters = 0;
  private bossDialogueText?: Phaser.GameObjects.Text;
  private floorClearPage = 0;
  private captureQuiz?: CaptureQuiz;
  private captureQuizCursor = 0;
  // O/X 답 후 해설(근거 학습포인트)을 보여주는 단계. 있으면 판정 대기 상태.
  private captureQuizResult?: { correct: boolean; answer: boolean; explain: string };
  private showFirstTrainerGuide = false;

  constructor() {
    super('BattleScene');
  }

  init(data: BattleSceneData = {}): void {
    this.state = this.normalizeState(data.state);
    this.selectedMoveId = firstUsableMove(this.state.party[this.state.activeIndex]);
    this.armedMoveId = this.selectedMoveId;
    this.viewMode = 'command';
    this.dexTab = 'moves';
    this.statusTab = 'profile';
    this.notice = this.state.lastLog;
    this.commandCursor = 0;
    this.capsuleCursor = 0;
    this.partyCursor = this.state.activeIndex;
    this.partyMenuOpen = false;
    this.partyMenuCursor = 0;
    this.statusMoveCursor = 0;
    this.statusLearningOpen = false;
    this.statusProfileScroll = 0;
    this.statusProfileMaxScroll = 0;
    this.selectedBgmKey = this.chooseBgmKey();
    this.preserveBattleBgmOnShutdown = false;
    this.isAnimating = false;
    this.enemyCombatSprite = undefined;
    this.playerCombatSprite = undefined;
    this.battleMessageStage = 'preparation';
    this.battleMessageTimer = undefined;
    this.bossDialogueLines = [];
    this.bossDialogueIndex = 0;
    this.bossDialogueVisibleCharacters = 0;
    this.bossDialogueText = undefined;
    this.floorClearPage = 0;
    this.captureQuiz = undefined;
    this.captureQuizCursor = 0;
    this.captureQuizResult = undefined;
    this.showFirstTrainerGuide = this.state.floor === 5 && this.state.encounterKind === 'trainer';
  }

  preload(): void {
    this.queueBattleAssets();
  }

  create(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.clearStatusTooltip();
      this.clearBattleMessageTimer();
      destroySceneChildren(this);
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleKeyboardDown);
      if (!this.preserveBattleBgmOnShutdown) {
        this.stopBattleBgm();
      }
    });
    this.setupKeyboardControls();
    this.playBattleBgm();
    this.render();
  }

  private normalizeState(state?: RunState): RunState {
    if (!state) {
      return enterBattle(createInitialRunState(), 1);
    }

    const normalizedState = {
      ...state,
      visualStyle: state.visualStyle ?? 'character',
    };

    if (normalizedState.phase === 'bossIntro') {
      return {
        ...normalizedState,
        phase: 'battle',
      };
    }

    if (normalizedState.phase === 'story') {
      return enterBattle(normalizedState);
    }

    return normalizedState;
  }

  private queueBattleAssets(): void {
    const sceneAssets = battleSceneAssetPaths();
    Object.values(sceneAssets).forEach((path) => this.queueImage(path));
    CAPSULE_ORDER.map(capsuleIconPath).forEach((path) => this.queueImage(path));
    pathimonTypeIconAssetPaths().forEach((path) => this.queueImage(path));
    this.queueImage(lockedMoveOverlayPath());
    if (!this.textures.exists('battle_stats')) {
      this.load.spritesheet('battle_stats', 'images/effects/battle_stats.png', {
        frameWidth: 32,
        frameHeight: 32,
      });
    }

    Object.values(battleSfxAssetPaths()).forEach((path) => this.queueAudio(path));

    const monsters = [...this.state.party];
    if (this.state.enemy) {
      monsters.push(this.state.enemy);
    }
    if (this.state.pendingCapture) {
      monsters.push(this.state.pendingCapture);
    }

    monsters.forEach((monster) => {
      const assets = pathimonSpriteAssets(monster, this.state.visualStyle);
      this.queueImage(assets.front);
      this.queueImage(assets.back);
    });
  }

  private queueImage(path: string): void {
    if (!this.textures.exists(path)) {
      this.load.image(path, path);
    }
  }

  private queueAudio(path: string): void {
    if (!this.cache.audio.exists(path)) {
      this.load.audio(path, path);
    }
  }


  private setupKeyboardControls(): void {
    this.input.keyboard?.on('keydown', this.handleKeyboardDown);
  }

  private chooseBgmKey(): string {
    return chooseBattleBgm({
      floor: this.state.floor,
      encounterKind: this.state.encounterKind,
      roll: Math.random(),
      seed: this.state.bgmSeed,
    });
  }

  private handleKeyboardDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();

    if (key === 'arrowup' || key === 'w') {
      event.preventDefault();
      this.handleDirectionalInput('up');
    } else if (key === 'arrowdown' || key === 's') {
      event.preventDefault();
      this.handleDirectionalInput('down');
    } else if (key === 'arrowleft' || key === 'a') {
      event.preventDefault();
      this.handleDirectionalInput('left');
    } else if (key === 'arrowright' || key === 'd') {
      event.preventDefault();
      this.handleDirectionalInput('right');
    } else if (key === 'enter') {
      event.preventDefault();
      this.handleConfirmInput();
    } else if (key === 'backspace' || key === 'escape') {
      event.preventDefault();
      this.handleCancelInput();
    }
  };

  private playBattleBgm(): void {
    const bgmKey = this.selectedBgmKey || this.chooseBgmKey();
    void playHtmlBattleBgm(bgmKey);

    const nextFloor = this.state.floor + 1;
    if (nextFloor <= 100) {
      prefetchHtmlBattleBgm(chooseBattleBgm({
        floor: nextFloor,
        encounterKind: encounterKindForFloor(nextFloor),
        roll: 0,
        seed: this.state.bgmSeed,
      }));
    }
  }

  private stopBattleBgm(): void {
    stopHtmlBattleBgm();
  }

  private render(): void {
    this.clearStatusTooltip();
    destroySceneChildren(this);

    const statePlayer = this.state.party[this.state.activeIndex];
    const stateEnemy = this.state.enemy;
    const statusDamage = this.state.battleStatusDamage;
    const player = statePlayer && this.battleMessageStage === 'combat' && statusDamage?.player
      ? { ...statePlayer, hp: statePlayer.hp + statusDamage.player, fainted: false }
      : statePlayer;
    const enemy = stateEnemy && this.battleMessageStage === 'combat' && statusDamage?.enemy
      ? { ...stateEnemy, hp: stateEnemy.hp + statusDamage.enemy, fainted: false }
      : stateEnemy;

    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, COLORS.ink).setOrigin(0);

    if (!player || !enemy) {
      addLabel(this, 120, 140, '전투 대상을 불러오지 못했습니다.', 28);
      return;
    }

    this.syncSelectedMove(player);

    if (this.battleMessageStage === 'preparation' && this.viewMode === 'status') {
      this.drawStatusView();
      this.drawMobileOverlay();
      return;
    }

    if (
      this.battleMessageStage === 'preparation'
      && (this.viewMode === 'party' || this.state.phase === 'forcedSwitch' || this.state.phase === 'releaseCapture')
    ) {
      this.drawPartyView();
      this.drawMobileOverlay();
      return;
    }

    this.drawBattlefield();
    this.drawCombatants(player, enemy);

    const unitLayout = battleUnitPanelLayouts();
    this.drawUnitPanel(unitLayout.enemy, enemy, 'enemy');
    this.drawUnitPanel(unitLayout.player, player, 'player');
    this.drawBottomWindow(player, enemy);
    this.drawFloorBadge();
    if (
      this.battleMessageStage === 'preparation'
      && this.viewMode !== 'captureQuiz'
      && !this.showFirstTrainerGuide
    ) {
      this.drawMobileOverlay();
    }
  }

  private syncSelectedMove(player: RuntimeMonster): void {
    if (player.moveset.includes(this.selectedMoveId) && canUseBattleMove(player, this.selectedMoveId)) {
      return;
    }

    this.selectedMoveId = firstUsableMove(player);
    this.armedMoveId = this.selectedMoveId;
  }

  private drawBattlefield(): void {
    const assets = battleSceneAssetPaths();
    const layerLayout = battleFieldLayerLayouts();
    this.add.image(layerLayout.background.x, layerLayout.background.y, assets.grassBack)
      .setOrigin(0)
      .setScale(layerLayout.background.scale);
    this.add.rectangle(0, BATTLE_AREA_BOTTOM - 5, APP_WIDTH, 5, COLORS.line).setOrigin(0);
  }

  private drawCombatants(player: RuntimeMonster, enemy: RuntimeMonster): void {
    const assets = battleSceneAssetPaths();
    const layerLayout = battleFieldLayerLayouts();
    const spriteLayout = battleSpriteLayouts();
    const playerAssets = pathimonSpriteAssets(player, this.state.visualStyle);
    const enemyAssets = pathimonSpriteAssets(enemy, this.state.visualStyle);

    this.add.image(layerLayout.enemyPlatform.x, layerLayout.enemyPlatform.y, assets.grassFront)
      .setOrigin(0)
      .setScale(layerLayout.enemyPlatform.scale);
    this.enemyCombatSprite = this.drawMonsterSprite(
      enemy,
      enemyAssets.front,
      spriteLayout.enemy.x,
      spriteLayout.enemy.y,
      this.spriteScaleFor(enemy, spriteLayout.enemy.scale),
      'front',
    );

    this.add.image(layerLayout.playerPlatform.x, layerLayout.playerPlatform.y, assets.grassMid)
      .setOrigin(0)
      .setScale(layerLayout.playerPlatform.scale);
    this.playerCombatSprite = this.drawMonsterSprite(
      player,
      playerAssets.back,
      spriteLayout.player.x,
      spriteLayout.player.y,
      spriteLayout.player.scale,
      'back',
    );
  }

  private drawMonsterSprite(
    monster: RuntimeMonster,
    textureKey: string,
    x: number,
    y: number,
    scale: number,
    perspective: 'front' | 'back' = 'front',
  ): Phaser.GameObjects.Image | Phaser.GameObjects.Text {
    if (this.textures.exists(textureKey)) {
      const frame = this.textures.getFrame(textureKey);
      const crop = monster.spriteCrop;
      const sourceWidth = crop?.width ?? frame?.width ?? 96;
      const fittedScale = normalizedSpriteScale(scale, sourceWidth);
      const image = this.add.image(x, y, textureKey).setOrigin(0.5, 1).setScale(fittedScale);
      if (crop) {
        const cropX = perspective === 'back' ? crop.backX : crop.frontX;
        image.setCrop(cropX, 0, crop.width, crop.height);
      }
      return image;
    }

    return addLabel(this, x, y - 74, monster.glyph, 54).setOrigin(0.5);
  }

  private spriteScaleFor(monster: RuntimeMonster, baseScale: number): number {
    return combatSpriteScale(monster, baseScale);
  }

  private pathimonFrameBorderColor(monster: RuntimeMonster, fallback: number = COLORS.line): number {
    return pathimonTypeBorderColor(monster, this.state.mode) ?? fallback;
  }

  private drawPathimonPanel(
    x: number,
    y: number,
    width: number,
    height: number,
    monster: RuntimeMonster,
    strokeWidth = 4,
  ): Phaser.GameObjects.Rectangle {
    return drawPanel(this, x, y, width, height).setStrokeStyle(strokeWidth, this.pathimonFrameBorderColor(monster));
  }


  private drawUnitPanel(
    layout: { x: number; y: number; width: number; height: number },
    monster: RuntimeMonster,
    role: BattleUnitPanelRole,
  ): void {
    const { x, y, width, height } = layout;
    const borderColor = this.pathimonFrameBorderColor(monster);
    const typeIcon = pathimonTypeIcon(monster, this.state.mode);
    const textWidth = width - (typeIcon ? 128 : 36);
    const rows = battleUnitPanelRows(monster, role);

    this.drawPathimonPanel(x, y, width, height, monster).setAlpha(0.96);
    this.add.rectangle(x, y, width, 5, monster.isBoss ? 0xf0a43a : borderColor, 0.84).setOrigin(0);
    if (typeIcon) {
      this.drawPathimonTypeIcon(x + width - 82, y, 82, 54, typeIcon);
    }

    let textY = y + 10;
    rows.forEach((row) => {
      if (row.kind === 'heading') {
        addBoxLabel(this, x + 18, textY, row.text, { width: textWidth, height: 16, size: 13, minSize: 10, maxLines: 1 })
          .setAlpha(0.78);
        textY += 18;
      } else if (row.kind === 'name') {
        addBoxLabel(this, x + 18, textY, row.text, { width: textWidth, height: 24, size: 19, minSize: 13, maxLines: 1 });
        textY += 24;
      } else if (row.kind === 'scientificName') {
        addBoxLabel(this, x + 18, textY, row.text, { width: textWidth, height: 20, size: 13, minSize: 10, maxLines: 1 })
          .setAlpha(0.88);
        textY += 22;
      } else if (row.kind === 'defense') {
        addBoxLabel(this, x + 18, textY, row.text, { width: textWidth, height: 20, size: 13, minSize: 10, maxLines: 1 });
        if (monster.isBoss) {
          this.bindDetailTooltip(
            x + 18,
            textY,
            textWidth,
            defenseTraitDetailLines(monster),
            '방어특성',
          );
        }
        textY += 22;
      }
    });

    const hpY = Math.min(y + height - 42, textY + 10);
    const hpWidth = width - (typeIcon ? 174 : 126);
    drawHpBar(this, x + 82, hpY, hpWidth, hpPct(monster));
    addLabel(this, x + width - 36, hpY - 9, hpPercentLabel(monster), 12).setAlpha(0.9);

    const statusRow = rows.find((row) => row.kind === 'status');
    if (statusRow) {
      addBoxLabel(this, x + 18, hpY + 20, statusRow.text, { width: width - 36, height: 18, size: 12, minSize: 9, maxLines: 1 });
      this.bindDetailTooltip(
        x + 18,
        hpY + 18,
        width - 36,
        statusConditionDetailLines(monster),
        '상태이상',
      );
    }
    const symptomsRow = rows.find((row) => row.kind === 'symptoms');
    if (symptomsRow) {
      addBoxLabel(this, x + 18, hpY + 38, symptomsRow.text, { width: width - 36, height: 18, size: 12, minSize: 9, maxLines: 1 });
      this.bindDetailTooltip(
        x + 18,
        hpY + 36,
        width - 36,
        symptomDetailLines(monster),
        '증상',
      );
    }
  }

  private bindDetailTooltip(
    x: number,
    y: number,
    width: number,
    lines: string[],
    overflowLabel: string,
  ): void {
    if (lines.length === 0) return;

    const hitArea = this.add.rectangle(x, y, width, 18, 0xffffff, 0.001)
      .setOrigin(0)
      .setDepth(790)
      .setInteractive({ useHandCursor: true });
    const scheduleTooltip = () => {
      this.clearStatusTooltip();
      this.statusTooltipTimer = this.time.delayedCall(520, () => {
        this.statusTooltipTimer = undefined;
        this.showStatusTooltip(x, y, width, lines, overflowLabel);
      });
    };

    hitArea.on('pointerover', scheduleTooltip);
    hitArea.on('pointerdown', scheduleTooltip);
    hitArea.on('pointerout', () => this.clearStatusTooltip());
    hitArea.on('pointerup', () => this.clearStatusTooltip());
    hitArea.on('pointerupoutside', () => this.clearStatusTooltip());
  }

  private showStatusTooltip(
    x: number,
    y: number,
    width: number,
    lines: string[],
    overflowLabel: string,
  ): void {
    this.clearStatusTooltip();
    const visibleLines = lines.length > 8 ? [...lines.slice(0, 7), `외 ${lines.length - 7}개 ${overflowLabel}`] : lines;
    const tooltipWidth = Math.min(420, Math.max(260, width + 52));
    const lineHeight = visibleLines.length > 5 ? 17 : 19;
    const tooltipHeight = 18 + visibleLines.length * lineHeight;
    const tooltipX = Math.min(APP_WIDTH - tooltipWidth - 16, Math.max(16, x));
    const tooltipY = y > APP_HEIGHT / 2
      ? Math.max(16, y - tooltipHeight - 10)
      : Math.min(APP_HEIGHT - tooltipHeight - 16, y + 30);
    const container = this.add.container(0, 0).setDepth(9600);
    const background = this.add.rectangle(tooltipX, tooltipY, tooltipWidth, tooltipHeight, COLORS.panelDark, 0.98)
      .setOrigin(0)
      .setStrokeStyle(2, 0x72d6ff, 0.9);
    container.add(background);

    visibleLines.forEach((line, index) => {
      const label = addBoxLabel(this, tooltipX + 12, tooltipY + 9 + index * lineHeight, line, {
        width: tooltipWidth - 24,
        height: lineHeight,
        size: visibleLines.length > 5 ? 10 : 11,
        minSize: 8,
        maxLines: 1,
      }).setAlpha(0.96);
      container.add(label);
    });

    this.statusTooltip = container;
  }

  private clearStatusTooltip(): void {
    this.statusTooltipTimer?.remove(false);
    this.statusTooltipTimer = undefined;
    this.statusTooltip?.destroy(true);
    this.statusTooltip = undefined;
  }
  private drawPathimonTypeIcon(x: number, y: number, width: number, height: number, icon: PathimonTypeIcon): void {
    if (this.textures.exists(icon.assetPath)) {
      this.add.image(x, y, icon.assetPath).setOrigin(0).setDisplaySize(width, height);
      return;
    }

    const graphics = this.add.graphics();
    graphics.fillStyle(icon.color, 1);
    graphics.fillRect(x, y, width, height);
    graphics.lineStyle(3, 0x101014, 0.72);
    graphics.strokeRect(x + 1, y + 1, width - 2, height - 2);
  }

  private drawFloorBadge(light = false): void {
    const x = APP_WIDTH - 138;
    const y = 14;
    const fill = light ? 0xf7faf8 : 0x20202c;
    const stroke = light ? 0x20202c : 0x72d6ff;
    const color = light ? '#20202c' : '#ffffff';
    this.add.rectangle(x, y, 114, 32, fill, light ? 0.92 : 0.88)
      .setOrigin(0)
      .setStrokeStyle(2, stroke, 0.86)
      .setDepth(780);
    addBoxLabel(this, x + 57, y + 16, `${this.state.floor}층`, {
      width: 96,
      height: 22,
      size: 17,
      minSize: 12,
      maxLines: 1,
      align: 'center',
      origin: [0.5, 0.5],
      color,
    }).setDepth(781);
  }

  private drawBottomWindow(player: RuntimeMonster, enemy: RuntimeMonster): void {
    drawPanel(this, 0, BATTLE_AREA_BOTTOM, APP_WIDTH, APP_HEIGHT - BATTLE_AREA_BOTTOM);

    if (this.battleMessageStage !== 'preparation') {
      this.drawBattleMessageView();
    } else if (this.showFirstTrainerGuide) {
      this.drawFirstTrainerGuide();
    } else if (this.viewMode === 'captureQuiz') {
      this.drawCaptureQuizView(enemy);
    } else if (this.state.phase === 'forcedSwitch') {
      this.drawPartyView();
    } else if (this.state.phase === 'releaseCapture') {
      this.drawPartyView();
    } else if (this.state.phase === 'floorClear') {
      this.drawFloorClearView();
    } else if (this.state.phase === 'defeat') {
      this.drawDefeatView();
    } else if (this.viewMode === 'command') {
      this.drawCommandView(player, enemy);
    } else if (this.viewMode === 'moves') {
      this.drawMoveView(player);
    } else if (this.viewMode === 'capsules') {
      this.drawCapsuleView(player, enemy);
    } else if (this.viewMode === 'dex') {
      this.drawDexView(player, enemy);
    } else {
      this.drawPartyView();
    }
  }

  private drawFirstTrainerGuide(): void {
    addLabel(this, 34, 408, '교체 안내', 23).setColor('#72d6ff');
    addBoxLabel(this, 36, 448, '예고된 처치의 피해 배율이 낮은 패시몬으로 교체하세요.', {
      width: 690,
      height: 28,
      size: 18,
      minSize: 14,
      maxLines: 1,
    });
    addBoxLabel(this, 36, 484, '도감의 상성표에서 현재 예고와 파티 상성을 확인할 수 있습니다.', {
      width: 690,
      height: 28,
      size: 16,
      minSize: 12,
      maxLines: 1,
    }).setAlpha(0.88);
    this.drawMenuButton(806, 468, 150, 46, '확인', () => this.dismissFirstTrainerGuide(), true);
  }

  private dismissFirstTrainerGuide(): void {
    this.showFirstTrainerGuide = false;
    this.render();
  }

  private drawCaptureQuizView(enemy: RuntimeMonster): void {
    const quiz = this.captureQuiz;
    const result = this.captureQuizResult;

    if (result) {
      const verdict = result.correct ? '맞았다!' : '틀렸다.';
      const answerLabel = result.answer ? 'O (맞는 설명)' : 'X (틀린 설명)';
      addLabel(this, 34, 406, '정답 해설', 22).setColor('#72d6ff');
      addLabel(this, 36, 446, `${verdict}  정답: ${answerLabel}`, 17)
        .setColor(result.correct ? '#8ef0a6' : '#ff9a8d');
      if (result.explain) {
        addBoxLabel(this, 36, 480, result.explain, {
          width: 700,
          height: 82,
          size: 16,
          minSize: 11,
          maxLines: 4,
        }).setLineSpacing(5).setAlpha(0.9);
      }
      this.drawMenuButton(788, 452, 160, 62, '계속', () => this.dismissCaptureQuizResult(), true);
      return;
    }

    addLabel(this, 34, 406, `${enemy.name}이 질문을 던진다...`, 22).setColor('#72d6ff');
    addLabel(this, 36, 442, '핵심 문장', 14).setAlpha(0.72);
    addBoxLabel(this, 36, 466, quiz?.statement ?? '질문을 불러오는 중입니다.', {
      width: 670,
      height: 64,
      size: 18,
      minSize: 13,
      maxLines: 3,
    }).setLineSpacing(5);
    const wrongPenalty = this.state.mode === 'learning' ? 20 : 40;
    addBoxLabel(this, 36, 536, `O/X 선택 · 오답 시 최대 체력 ${wrongPenalty}% 피해`, {
      width: 520,
      height: 22,
      size: 14,
      minSize: 11,
      maxLines: 1,
    }).setAlpha(0.78);
    this.drawMenuButton(746, 458, 92, 70, 'O', () => this.handleCaptureQuizAnswer(true), this.captureQuizCursor === 0);
    this.drawMenuButton(856, 458, 92, 70, 'X', () => this.handleCaptureQuizAnswer(false), this.captureQuizCursor === 1);
  }

  private drawCommandView(player: RuntimeMonster, enemy: RuntimeMonster): void {
    const helperText = this.state.encounterKind === 'wild'
      ? '야생 패시몬은 포획하거나 지나갈 수 있습니다.'
      : '사람 전투에서는 싸운다, 도감, 패시몬을 선택할 수 있습니다.';
    commandViewLines(
      player,
      enemy,
      this.state.encounterKind,
      this.notice,
      helperText,
      this.state.floor === 1 && this.state.encounterKind === 'wild'
        ? '가능한 한 파티를 채워 전투에 대비하세요.'
        : '',
    ).forEach((line, index) => {
      const fontSize = index === 0 ? 24 : index === 1 ? 17 : 15;
      addBoxLabel(this, index === 0 ? 34 : 36, 410 + index * 40, line, {
        width: 560,
        height: index === 0 ? 28 : 38,
        size: fontSize,
        minSize: index === 0 ? 17 : 11,
        maxLines: index === 0 ? 1 : 2,
      }).setAlpha(index === 0 ? 1 : 0.88);
    });

    battleActionOptions(this.state.encounterKind).forEach((option, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = 646 + column * 164;
      const y = 420 + row * 56;
      const label = option.id === 'capsule' && !option.disabled ? this.capsuleButtonLabel() : option.label;
      this.drawMenuButton(x, y, 144, 42, label, () => {
        this.commandCursor = index;
        this.handleCommandAction(option.id);
      }, this.commandCursor === index, Boolean(option.disabled));
    });
  }

  private drawBattleMessageView(): void {
    if (this.battleMessageStage === 'dialogue') {
      this.drawBossDialogueView();
      return;
    }

    const statusStage = this.battleMessageStage === 'status';
    const message = statusStage
      ? this.state.battleStatusLog ?? ''
      : this.state.battleActionLog ?? '';

    addBoxLabel(this, 34, statusStage ? 420 : 400, message, {
      width: APP_WIDTH - 68,
      height: statusStage ? 92 : 164,
      size: statusStage ? 21 : 17,
      minSize: statusStage ? 15 : 12,
      maxLines: statusStage ? 4 : 8,
    }).setAlpha(0.94);

    this.add.zone(APP_WIDTH / 2, APP_HEIGHT / 2, APP_WIDTH, APP_HEIGHT)
      .setDepth(980)
      .setInteractive({ useHandCursor: true })
      .once('pointerdown', () => this.advanceBattleMessage());
  }

  private drawBossDialogueView(): void {
    const enemyName = this.state.enemy?.name ?? '보스';
    addBoxLabel(this, 34, 404, enemyName, {
      width: APP_WIDTH - 68,
      height: 24,
      size: 15,
      minSize: 12,
      maxLines: 1,
      color: '#72d6ff',
    });
    const line = this.bossDialogueLines[this.bossDialogueIndex] ?? '';
    this.bossDialogueText = addBoxLabel(
      this,
      34,
      444,
      line.slice(0, this.bossDialogueVisibleCharacters),
      {
        width: APP_WIDTH - 68,
        height: 76,
        size: 25,
        minSize: 17,
        maxLines: 3,
      },
    );
    addLabel(this, APP_WIDTH - 44, 522, '▼', 16).setOrigin(1, 0).setAlpha(0.72);
    this.add.zone(APP_WIDTH / 2, APP_HEIGHT / 2, APP_WIDTH, APP_HEIGHT)
      .setDepth(980)
      .setInteractive({ useHandCursor: true })
      .once('pointerdown', () => this.advanceBattleMessage());
  }

  private handleCommandAction(actionId: BattleActionId): void {
    if (actionId === 'fight') {
      this.viewMode = 'moves';
    } else if (actionId === 'pass') {
      this.state = resolvePassEncounter(this.state);
      this.notice = this.state.lastLog;
      this.afterBattleAction();
      return;
    } else if (actionId === 'capsule') {
      this.capsuleCursor = 0;
      this.viewMode = 'capsules';
      this.render();
      return;
    } else if (actionId === 'dex') {
      this.viewMode = 'dex';
    } else {
      this.openPartyView();
      this.viewMode = 'party';
    }
    this.render();
  }

  private drawMoveView(player: RuntimeMonster): void {
    addLabel(this, 34, 408, '기술', 22);
    addBoxLabel(this, 92, 410, '한 번 선택: 설명 확인 · 같은 기술 다시 선택: 사용', {
      width: 390,
      height: 18,
      size: 12,
      minSize: 10,
      maxLines: 1,
    }).setAlpha(0.72);
    battleMoveSlots(player).forEach((moveId, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = 36 + column * 246;
      const y = 444 + row * 48;
      const selected = moveId === this.selectedMoveId;
      if (!moveId) {
        this.drawMenuButton(x, y, 220, 38, '---', () => undefined, false, true);
        return;
      }

      const locked = !canUseBattleMove(player, moveId);
      this.drawMenuButton(x, y, 220, 38, formatMoveName(moveId, player), () => this.handleMovePress(moveId), selected, locked);
      if (locked) {
        this.drawLockedMoveOverlay(x, y, 220, 38);
      }
    });

    this.drawMoveDetailPanel(player);

    this.drawMenuButton(858, 428, 112, 38, '도감', () => {
      this.viewMode = 'dex';
      this.render();
    });
    this.drawMenuButton(858, 480, 112, 38, '뒤로', () => {
      this.viewMode = 'command';
      this.render();
    });
  }

  private drawMoveDetailPanel(player: RuntimeMonster): void {
    const detail = formatMoveDetailSections(this.selectedMoveId, player);
    const showLearnText = this.state.mode === 'learning';
    const panelX = 522;
    const panelY = 386;
    const panelWidth = 332;
    const panelHeight = 178;
    const textX = panelX + 16;
    const textWidth = panelWidth - 32;

    drawPanel(this, panelX, panelY, panelWidth, panelHeight).setAlpha(0.98);
    addBoxLabel(this, textX, panelY + 10, detail.title, { width: textWidth, height: 22, size: 17, minSize: 12, maxLines: 1 });
    addBoxLabel(this, textX, panelY + 35, detail.kind, { width: textWidth, height: 17, size: 10, minSize: 8, maxLines: 1 })
      .setAlpha(0.9);
    addBoxLabel(this, textX, panelY + 54, `${detail.power} · ${detail.accuracy}`, { width: textWidth, height: 17, size: 10, minSize: 8, maxLines: 1 })
      .setAlpha(0.9);
    if (detail.outcomeRows.length > 0) {
      this.drawMoveOutcomeRows(detail, textX, textWidth, panelY);
      return;
    }
    const effectLabel = addBoxLabel(this, textX, panelY + 74, detail.effect, {
      width: textWidth,
      height: 30,
      size: 10,
      minSize: 8,
      maxLines: 2,
    })
      .setAlpha(0.92);
    const conditionY = panelY + 74 + Math.min(30, effectLabel.height) + 2;
    const conditionLabel = addBoxLabel(this, textX, conditionY, detail.conditions, {
      width: textWidth,
      height: 18,
      size: 10,
      minSize: 8,
      maxLines: 1,
    })
      .setAlpha(0.92);
    const descriptionY = conditionY + conditionLabel.height + 10;
    addBoxLabel(this, textX, descriptionY, detail.description, {
      width: textWidth,
      height: showLearnText ? 28 : panelY + panelHeight - descriptionY - 8,
      size: 10,
      minSize: 8,
      maxLines: showLearnText ? 2 : 3,
    })
      .setAlpha(0.96);
    if (showLearnText) {
      addBoxLabel(this, textX, descriptionY + 28, detail.learnText, {
        width: textWidth,
        height: panelY + panelHeight - descriptionY - 30,
        size: 9,
        minSize: 8,
        maxLines: 1,
      })
        .setAlpha(0.9);
    }
  }

  private drawMoveOutcomeRows(
    detail: ReturnType<typeof formatMoveDetailSections>,
    textX: number,
    textWidth: number,
    panelY: number,
  ): void {
    addBoxLabel(this, textX, panelY + 74, detail.description, {
      width: textWidth,
      height: 28,
      size: 9,
      minSize: 8,
      maxLines: 2,
    }).setAlpha(0.92);
    addLabel(this, textX, panelY + 104, '가능한 결과', 9).setColor('#72d6ff').setAlpha(0.92);
    detail.outcomeRows.forEach((row, index) => {
      addBoxLabel(this, textX, panelY + 119 + index * 14, row, {
        width: textWidth,
        height: 14,
        size: 8,
        minSize: 7,
        maxLines: 1,
      }).setAlpha(0.94);
    });
  }

  private drawCapsuleView(player: RuntimeMonster, enemy: RuntimeMonster): void {
    addBoxLabel(this, 34, 412, `${enemy.name}에게 어떤 캡슐을 던질까?`, { width: 560, height: 30, size: 24, minSize: 16, maxLines: 1 });
    addBoxLabel(this, 36, 450, `대상 계열: ${enemy.category}`, { width: 560, height: 24, size: 17, minSize: 12, maxLines: 1 })
      .setAlpha(0.92);
    addBoxLabel(this, 36, 482, this.notice || `${player.name}은 캡슐을 준비했다.`, { width: 560, height: 48, size: 15, minSize: 11, maxLines: 2 })
      .setAlpha(0.84);

    const panelX = 602;
    const panelY = 92;
    const rowX = panelX + 58;
    const rowY = panelY + 58;
    drawPanel(this, panelX, panelY, 342, 422).setAlpha(0.98);
    addLabel(this, panelX + 28, panelY + 20, '캡슐', 24);

    CAPSULE_ORDER.forEach((capsuleId, index) => {
      const count = this.capsuleCountLabel(capsuleId);
      this.drawCapsuleRowButton(rowX, rowY + index * 42, 250, 34, capsuleId, `x${count}`, CAPSULE_LABELS[capsuleId], () => {
        this.capsuleCursor = index;
        this.handleCapsuleThrow(capsuleId);
      }, this.capsuleCursor === index);
    });

    this.drawMenuButton(rowX, panelY + 364, 250, 34, '취소', () => {
      this.viewMode = 'command';
      this.render();
    });
  }

  private drawDexView(player: RuntimeMonster, enemy: RuntimeMonster): void {
    const dex = battleDexSummary(enemy, player);

    addLabel(this, 34, 404, '도감', 21);
    addBoxLabel(this, 34, 432, dex.opponentName, { width: 170, height: 20, size: 14, minSize: 10, maxLines: 1 })
      .setAlpha(0.9);
    addBoxLabel(this, 34, 452, dex.typeLine, { width: 170, height: 18, size: 11, minSize: 9, maxLines: 1 })
      .setAlpha(0.84);
    addBoxLabel(this, 34, 470, dex.statLine, { width: 170, height: 18, size: 11, minSize: 8, maxLines: 1 })
      .setAlpha(0.84);
    this.drawMenuButton(34, 500, 84, 34, '효과 기술', () => {
      this.dexTab = 'moves';
      this.render();
    }, this.dexTab === 'moves');
    this.drawMenuButton(128, 500, 84, 34, '상성표', () => {
      this.dexTab = 'effectiveness';
      this.render();
    }, this.dexTab === 'effectiveness');

    drawPanel(this, 220, 394, 628, 168).setAlpha(0.98);
    if (this.dexTab === 'moves') {
      addBoxLabel(this, 238, 402, `현재 선출: ${player.name}에게 효과적인 적의 처치`, {
        width: 586,
        height: 18,
        size: 13,
        minSize: 10,
        maxLines: 1,
      }).setAlpha(0.86);
      if (dex.moveRows.length === 0) {
        addBoxLabel(this, 238, 434, '현재 선출에게 효과적인 적 처치가 없습니다.', {
          width: 586,
          height: 24,
          size: 14,
          minSize: 11,
          maxLines: 1,
        }).setAlpha(0.78);
      }
      dex.moveRows.forEach((row, index) => {
        const y = 426 + index * 33;
        const multiplierLabel = row.multiplier === 4 ? '직접 ×4' : row.multiplier === 2 ? '간접 ×2' : '';
        addBoxLabel(this, 238, y, `${row.name}${multiplierLabel ? ` · ${multiplierLabel}` : ''}`, {
          width: 190,
          height: 18,
          size: 15,
          minSize: 11,
          maxLines: 1,
        });
        addBoxLabel(this, 452, y + 1, `${row.type} · 위력 ${row.power} · 명중 ${row.accuracy}`, {
          width: 372,
          height: 16,
          size: 12,
          minSize: 9,
          maxLines: 1,
        }).setAlpha(0.88);
        const description = row.matchReason
          ? `일치: ${row.matchReason} · ${row.description}`
          : row.description;
        addBoxLabel(this, 258, y + 17, description, {
          width: 566,
          height: 14,
          size: 11,
          minSize: 9,
          maxLines: 1,
        }).setAlpha(0.88);
      });
    } else if (enemy.isTrainer) {
      this.drawAnnouncedTreatmentMatchups(enemy);
    } else {
      this.drawWildTreatmentMatchups(enemy);
    }

    this.drawMenuButton(852, 488, 120, 34, '뒤로', () => {
      this.viewMode = 'command';
      this.render();
    });
  }

  private drawAnnouncedTreatmentMatchups(enemy: RuntimeMonster): void {
    const groups = formatAnnouncedTreatmentMatchups(enemy, this.state.party);
    addLabel(this, 238, 404, '예고된 처치와 파티 상성', 14).setAlpha(0.86);

    if (groups.length === 0) {
      addBoxLabel(this, 238, 434, '아직 예고된 처치가 없습니다.', {
        width: 586,
        height: 20,
        size: 13,
        minSize: 10,
        maxLines: 1,
      }).setAlpha(0.76);
      return;
    }

    groups.slice(0, 2).forEach((group, index) => {
      const y = 428 + index * 62;
      addBoxLabel(this, 238, y, group.attackName, {
        width: 190,
        height: 18,
        size: 14,
        minSize: 11,
        maxLines: 1,
      });
      const matchupText = group.party
        .map(({ monsterName, multiplier }) => `${monsterName} ×${multiplier}`)
        .join(' · ');
      addBoxLabel(this, 430, y, matchupText, {
        width: 394,
        height: 42,
        size: 12,
        minSize: 9,
        maxLines: 2,
      }).setLineSpacing(3);
    });
  }

  private drawWildTreatmentMatchups(enemy: RuntimeMonster): void {
    const rows = formatWildTreatmentRows(enemy);
    const direct = rows.filter((row) => row.multiplier === 4);
    const indirect = rows.filter((row) => row.multiplier === 2);

    addLabel(this, 238, 404, '이 패시몬에 효과적인 처치', 14).setAlpha(0.86);
    this.drawTreatmentGroup('직접 처치 ×4', direct, 428);
    this.drawTreatmentGroup('간접 처치 ×2', indirect, 486);
  }

  private drawTreatmentGroup(
    label: string,
    rows: ReturnType<typeof formatWildTreatmentRows>,
    y: number,
  ): void {
    addBoxLabel(this, 238, y, label, {
      width: 120,
      height: 18,
      size: 12,
      minSize: 10,
      maxLines: 1,
    }).setAlpha(0.9);
    const text = rows.length > 0
      ? rows
        .map((row) => row.matchedTags ? `${row.attackName} (${row.matchedTags})` : row.attackName)
        .join(' · ')
      : '해당 없음';
    addBoxLabel(this, 366, y, text, {
      width: 458,
      height: 42,
      size: 12,
      minSize: 9,
      maxLines: 2,
    }).setLineSpacing(3).setAlpha(rows.length > 0 ? 1 : 0.62);
  }

  private handleMovePress(moveId: MoveId): void {
    if (this.isAnimating) {
      return;
    }

    const player = this.state.party[this.state.activeIndex];
    if (!canUseBattleMove(player, moveId)) {
      this.notice = battleMoveUnavailableReason(player, moveId);
      this.render();
      return;
    }

    const press = resolveMoveSelectionPress({
      armedMoveId: this.armedMoveId,
      moveId,
      selectedMoveId: this.selectedMoveId,
    });
    this.selectedMoveId = press.selectedMoveId;
    this.armedMoveId = press.armedMoveId;

    if (press.intent === 'preview') {
      this.render();
      return;
    }

    const previousState = this.state;
    this.state = resolvePlayerMove(this.state, moveId, undefined, undefined, undefined, Math.random);
    this.notice = this.state.battleResultLog ?? this.state.lastLog;
    this.viewMode = 'command';
    this.playBattleResolutionCue(previousState, this.state, () => this.showCombatMessage());
  }

  private showCombatMessage(): void {
    if (!this.state.battleActionLog?.trim()) {
      this.afterBattleAction();
      return;
    }

    this.clearBattleMessageTimer();
    this.battleMessageStage = 'combat';
    this.render();
  }

  private showStatusMessage(): void {
    if (!this.state.battleStatusLog?.trim()) {
      this.finishBattleMessages();
      return;
    }

    this.clearBattleMessageTimer();
    this.battleMessageStage = 'status';
    this.render();
    this.playStatusDamageCue();
    this.battleMessageTimer = this.time.delayedCall(BATTLE_STATUS_HOLD_MS, () => {
      this.battleMessageTimer = undefined;
      this.advanceBattleMessage();
    });
  }

  private advanceBattleMessage(): void {
    if (this.battleMessageStage === 'dialogue') {
      this.advanceBossDialogue();
      return;
    }

    if (this.battleMessageStage === 'combat') {
      this.showStatusMessage();
      return;
    }

    if (this.battleMessageStage === 'status') {
      this.finishBattleMessages();
    }
  }

  private finishBattleMessages(): void {
    this.clearBattleMessageTimer();
    this.state.battleActionLog = undefined;
    this.state.battleStatusLog = undefined;
    this.state.battleStatusDamage = undefined;

    if (this.state.enemy?.bossPhase2Pending && this.state.phase !== 'defeat') {
      this.beginBossPhaseTwoDialogue();
      return;
    }

    this.battleMessageStage = 'preparation';
    if (this.state.phase === 'battle') {
      this.notice = '';
      this.render();
      return;
    }

    this.afterBattleAction();
  }

  private beginBossPhaseTwoDialogue(): void {
    const enemy = this.state.enemy;
    if (!enemy) {
      this.battleMessageStage = 'preparation';
      this.afterBattleAction();
      return;
    }

    this.bossDialogueLines = bossPhaseTwoDialogue(enemy, this.state.floor);
    this.bossDialogueIndex = 0;
    this.bossDialogueVisibleCharacters = 0;
    if (this.bossDialogueLines.length === 0) {
      this.playBossPhaseTwoPowerUp();
      return;
    }

    this.battleMessageStage = 'dialogue';
    this.render();
    this.startBossDialogueTyping();
  }

  private startBossDialogueTyping(): void {
    this.clearBattleMessageTimer();
    const line = this.bossDialogueLines[this.bossDialogueIndex] ?? '';
    this.bossDialogueText?.setText(line.slice(0, this.bossDialogueVisibleCharacters));
    if (this.bossDialogueVisibleCharacters >= line.length) return;

    this.battleMessageTimer = this.time.addEvent({
      delay: TYPEWRITER_INTERVAL_MS,
      loop: true,
      callback: () => {
        this.bossDialogueVisibleCharacters = Math.min(
          line.length,
          this.bossDialogueVisibleCharacters + 1,
        );
        this.bossDialogueText?.setText(line.slice(0, this.bossDialogueVisibleCharacters));
        if (this.bossDialogueVisibleCharacters >= line.length) {
          this.clearBattleMessageTimer();
        }
      },
    });
  }

  private advanceBossDialogue(): void {
    if (this.isAnimating) return;
    const advance = advanceTypewriter(
      this.bossDialogueLines,
      this.bossDialogueIndex,
      this.bossDialogueVisibleCharacters,
    );
    this.bossDialogueIndex = advance.lineIndex;
    this.bossDialogueVisibleCharacters = advance.visibleCharacters;

    if (advance.action === 'reveal') {
      this.clearBattleMessageTimer();
      this.bossDialogueText?.setText(this.bossDialogueLines[this.bossDialogueIndex] ?? '');
      return;
    }

    if (advance.action === 'next') {
      this.bossDialogueText?.setText('');
      this.startBossDialogueTyping();
      return;
    }

    this.playBossPhaseTwoPowerUp();
  }

  private playBossPhaseTwoPowerUp(): void {
    this.clearBattleMessageTimer();
    this.isAnimating = true;
    const finish = () => {
      this.state = activateBossPhaseTwo(this.state, Math.random);
      this.battleMessageStage = 'preparation';
      this.viewMode = 'command';
      this.notice = '';
      this.isAnimating = false;
      this.render();
    };
    const sprite = this.enemyCombatSprite;
    if (!sprite) {
      finish();
      return;
    }

    this.tweens.add({
      targets: sprite,
      scaleX: sprite.scaleX * PHASE_TWO_BOSS_SCALE,
      scaleY: sprite.scaleY * PHASE_TWO_BOSS_SCALE,
      duration: 460,
      ease: 'Sine.easeOut',
      onComplete: finish,
    });
  }

  private clearBattleMessageTimer(): void {
    this.battleMessageTimer?.remove(false);
    this.battleMessageTimer = undefined;
  }

  private playBattleResolutionCue(previousState: RunState, nextState: RunState, onComplete: () => void): void {
    const previousEnemy = previousState.enemy;
    const nextEnemy = nextState.enemy;
    const previousPlayer = previousState.party[nextState.activeIndex];
    const nextPlayer = nextState.party[nextState.activeIndex];
    const statusDamage = nextState.battleStatusDamage ?? { player: 0, enemy: 0 };
    const enemyDirectDamage = previousEnemy && nextEnemy
      ? Math.max(0, previousEnemy.hp - nextEnemy.hp - statusDamage.enemy)
      : 0;
    const playerDirectDamage = previousPlayer && nextPlayer
      ? Math.max(0, previousPlayer.hp - nextPlayer.hp - statusDamage.player)
      : 0;
    const enemyTookDamage = enemyDirectDamage > 0;
    const playerTookDamage = playerDirectDamage > 0;
    const enemyDefeated = Boolean(previousEnemy && enemyDirectDamage >= previousEnemy.hp);
    const playerDefeated = Boolean(previousPlayer && playerDirectDamage >= previousPlayer.hp);
    const playerHitKind = nextState.lastPlayerHitEffectiveness;
    const enemyHitKind = nextState.lastEnemyHitEffectiveness;
    const playAttackRankUp = Boolean(nextState.battleStatUpCue);

    if (!enemyTookDamage && !playerTookDamage && !enemyDefeated && !playerDefeated) {
      this.isAnimating = true;
      if (enemyHitKind === 'none') {
        this.playHitEffect('player', 'none', false);
      } else if (playerHitKind === 'none') {
        this.playHitEffect('enemy', 'none', false);
      } else if (playAttackRankUp) {
        this.playAttackRankUpEffect();
        nextState.battleStatUpCue = undefined;
      } else {
        this.playSfx(battleSfxAssetPaths().statUp, 0.25);
      }
      this.time.delayedCall(enemyHitKind === 'none' || playerHitKind === 'none' ? 260 : 90, () => {
        this.isAnimating = false;
        onComplete();
      });
      return;
    }

    this.isAnimating = true;
    let finishDelay = 260;

    if (enemyTookDamage) {
      this.playHitEffect('enemy', playerHitKind ?? 'normal', enemyDefeated);
      finishDelay = enemyDefeated ? 760 : 320;
    }

    if (playerTookDamage && !enemyDefeated) {
      this.time.delayedCall(230, () => this.playHitEffect('player', enemyHitKind ?? 'normal', playerDefeated));
      finishDelay = Math.max(finishDelay, playerDefeated ? 980 : 560);
    }

    if (playAttackRankUp && !playerDefeated) {
      this.time.delayedCall(playerTookDamage ? 560 : 120, () => this.playAttackRankUpEffect());
      nextState.battleStatUpCue = undefined;
      finishDelay = Math.max(finishDelay, playerTookDamage ? 940 : 520);
    }

    this.time.delayedCall(finishDelay, () => {
      this.isAnimating = false;
      onComplete();
    });
  }

  private playAttackRankUpEffect(): void {
    const layout = battleSpriteLayouts().player;
    this.playSfx(battleSfxAssetPaths().statUp, 0.42);
    [-28, 0, 28].forEach((offset, index) => {
      const arrow = this.add.sprite(layout.x + offset, layout.y - 112, 'battle_stats', 2)
        .setDepth(BATTLE_EFFECT_DEPTH + 8)
        .setScale(1.8)
        .setAlpha(0);
      this.tweens.add({
        targets: arrow,
        alpha: { from: 0, to: 1 },
        y: arrow.y - 52,
        duration: 520,
        delay: index * 70,
        ease: 'Cubic.easeOut',
        onComplete: () => arrow.destroy(),
      });
    });
  }

  private playStatusDamageCue(): void {
    const damage = this.state.battleStatusDamage;
    if (!damage) return;

    if (damage.enemy > 0) {
      this.playStatusHitEffect('enemy', Boolean(this.state.enemy && this.state.enemy.hp <= 0));
    }
    if (damage.player > 0) {
      const player = this.state.party[this.state.activeIndex];
      const play = () => this.playStatusHitEffect('player', Boolean(player && player.hp <= 0));
      if (damage.enemy > 0) {
        this.time.delayedCall(120, play);
      } else {
        play();
      }
    }
  }

  private playStatusHitEffect(target: 'enemy' | 'player', defeated: boolean): void {
    const spriteLayout = battleSpriteLayouts();
    const layout = target === 'enemy' ? spriteLayout.enemy : spriteLayout.player;
    const hitX = layout.x;
    const hitY = layout.y - (target === 'enemy' ? 84 : 116);
    const sfx = battleSfxAssetPaths();

    this.playSfx(sfx.hit, 0.34);
    this.drawStatusImpact(hitX, hitY);
    this.shakeCombatSprite(target, 7);

    if (defeated) {
      this.time.delayedCall(100, () => {
        this.playSfx(sfx.faint, 0.44);
        this.playDefeatFade(target, hitX, hitY);
      });
    }
  }

  private playHitEffect(target: 'enemy' | 'player', kind: HitEffectiveness, defeated: boolean): void {
    const spriteLayout = battleSpriteLayouts();
    const layout = target === 'enemy' ? spriteLayout.enemy : spriteLayout.player;
    const hitX = layout.x;
    const hitY = layout.y - (target === 'enemy' ? 84 : 116);
    const sfx = battleSfxAssetPaths();

    if (kind === 'none') {
      this.playSfx(sfx.blockedLaugh, 0.48);
      this.drawBlockedFlash(hitX, hitY);
      this.shakeCombatSprite(target, 5);
      return;
    }

    const strong = kind === 'super';
    this.playSfx(strong ? sfx.hitStrong : sfx.hit, strong ? 0.5 : 0.42);
    this.drawImpactFlash(hitX, hitY, strong);
    this.shakeCombatSprite(target, strong ? 14 : 9);

    if (defeated) {
      this.time.delayedCall(140, () => {
        this.playSfx(sfx.faint, 0.48);
        this.playDefeatFade(target, hitX, hitY);
      });
    }
  }

  private drawBlockedFlash(x: number, y: number): void {
    const ring = this.add.circle(x, y, 10, 0x6b4b8d, 0.44).setDepth(BATTLE_EFFECT_DEPTH);
    ring.setStrokeStyle(3, 0xcaa7ff, 0.68);
    this.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 3.8,
      duration: 260,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });

    for (let index = 0; index < 4; index += 1) {
      const wisp = this.add.text(x - 34 + index * 22, y - 18 + (index % 2) * 18, 'ha', {
        color: '#d6b9ff',
        fontFamily: '"Malgun Gothic", Arial, sans-serif',
        fontSize: '12px',
      }).setDepth(BATTLE_EFFECT_DEPTH + 1).setAlpha(0.72);
      this.tweens.add({
        targets: wisp,
        alpha: 0,
        y: wisp.y - 22,
        duration: 320,
        ease: 'Sine.easeOut',
        onComplete: () => wisp.destroy(),
      });
    }
  }

  private drawImpactFlash(x: number, y: number, strong: boolean): void {
    const color = strong ? 0xfff2a8 : 0xffffff;
    const ring = this.add.circle(x, y, 8, color, 0.72).setDepth(BATTLE_EFFECT_DEPTH);
    ring.setStrokeStyle(2, 0xff6658, 0.7);
    this.tweens.add({
      targets: ring,
      alpha: 0,
      scale: strong ? 5.4 : 3.6,
      duration: strong ? 300 : 220,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });

    [-1, 1].forEach((direction, index) => {
      const slash = this.add.rectangle(x + direction * 18, y - 8 + index * 16, strong ? 80 : 56, 5, 0xfff2f2, 0.86)
        .setDepth(BATTLE_EFFECT_DEPTH + 1)
        .setAngle(direction * -24);
      this.tweens.add({
        targets: slash,
        alpha: 0,
        x: slash.x + direction * 24,
        duration: 180,
        ease: 'Cubic.easeOut',
        onComplete: () => slash.destroy(),
      });
    });
  }

  private drawStatusImpact(x: number, y: number): void {
    [0, 1, 2].forEach((index) => {
      const ring = this.add.circle(x, y, 10 + index * 8, 0xb84f9c, 0.28)
        .setDepth(BATTLE_EFFECT_DEPTH + index)
        .setStrokeStyle(2, index % 2 === 0 ? 0xff8ad8 : 0x8b7cff, 0.76);
      this.tweens.add({
        targets: ring,
        alpha: 0,
        scale: 2.4 + index * 0.35,
        duration: 260 + index * 40,
        ease: 'Quad.easeOut',
        onComplete: () => ring.destroy(),
      });
    });

    for (let index = 0; index < 6; index += 1) {
      const angle = (Math.PI * 2 * index) / 6;
      const particle = this.add.circle(x, y, 3, index % 2 === 0 ? 0xff9edc : 0xa8a0ff, 0.88)
        .setDepth(BATTLE_EFFECT_DEPTH + 4);
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 44,
        y: y + Math.sin(angle) * 34,
        alpha: 0,
        duration: 320,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private shakeCombatSprite(target: 'enemy' | 'player', distance: number): void {
    const sprite = target === 'enemy' ? this.enemyCombatSprite : this.playerCombatSprite;
    if (!sprite) return;

    this.tweens.add({
      targets: sprite,
      x: sprite.x + (target === 'enemy' ? distance : -distance),
      duration: 48,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
    });
  }

  private playDefeatFade(target: 'enemy' | 'player', x: number, y: number): void {
    const sprite = target === 'enemy' ? this.enemyCombatSprite : this.playerCombatSprite;
    const shadow = this.add.ellipse(x, y + 40, 92, 18, 0x101014, 0.28).setDepth(BATTLE_EFFECT_DEPTH - 1);
    if (sprite) {
      this.tweens.add({
        targets: sprite,
        alpha: 0,
        y: sprite.y + 28,
        scaleX: sprite.scaleX * 0.82,
        scaleY: sprite.scaleY * 0.58,
        duration: 460,
        ease: 'Sine.easeIn',
      });
    }
    this.tweens.add({
      targets: shadow,
      alpha: 0,
      scaleX: 0.45,
      duration: 460,
      ease: 'Sine.easeIn',
      onComplete: () => shadow.destroy(),
    });

    for (let index = 0; index < 9; index += 1) {
      const angle = (Math.PI * 2 * index) / 9;
      const spark = this.add.circle(x, y + 8, 3, index % 2 === 0 ? 0xfff2a8 : 0x8fd7ff, 0.85).setDepth(BATTLE_EFFECT_DEPTH + 2);
      this.tweens.add({
        targets: spark,
        alpha: 0,
        x: x + Math.cos(angle) * 56,
        y: y + 16 + Math.sin(angle) * 34,
        scale: 0.3,
        duration: 420,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
  }

  private playSfx(key: string, volume: number): void {
    if (this.cache.audio.exists(key)) {
      this.sound.play(key, { volume });
    }
  }

  private capsuleButtonLabel(): string {
    return this.state.mode === 'learning' ? '캡슐 ∞' : '캡슐 ' + this.state.capsules;
  }

  private capsuleCountLabel(capsuleId: CapsuleId): string {
    return this.state.mode === 'learning' ? '∞' : String(this.state.capsuleInventory[capsuleId] ?? 0);
  }

  private drawCapsuleRowButton(
    x: number,
    y: number,
    width: number,
    height: number,
    capsuleId: CapsuleId,
    countLabel: string,
    label: string,
    onClick: () => void,
    active = false,
  ): void {
    const rect = this.add.rectangle(x, y, width, height, active ? BUTTON_ACTIVE_FILL : BUTTON_FILL).setOrigin(0);
    rect.setStrokeStyle(2, active ? 0x72d6ff : COLORS.line);
    rect.setInteractive({ useHandCursor: true });
    rect.on('pointerover', () => rect.setFillStyle(BUTTON_ACTIVE_FILL));
    rect.on('pointerout', () => rect.setFillStyle(active ? BUTTON_ACTIVE_FILL : BUTTON_FILL));
    rect.on('pointerdown', onClick);

    if (active) {
      const marker = cursorMarkerPoint({ x, y, height });
      this.drawCursorMarker(marker.x, marker.y);
    }

    const iconPath = capsuleIconPath(capsuleId);
    if (this.textures.exists(iconPath)) {
      this.add.image(x + 26, y + height / 2, iconPath)
        .setOrigin(0.5)
        .setDisplaySize(28, 28);
    }

    addLabel(this, x + 50, y + height / 2, countLabel, 14)
      .setOrigin(0, 0.5)
      .setAlpha(0.9);
    addBoxLabel(this, x + 98, y + height / 2, label, {
      width: width - 108,
      height: height - 8,
      size: 14,
      minSize: 10,
      maxLines: 1,
      origin: [0, 0.5],
    });
  }

  private formatDefenseTraits(monster: RuntimeMonster): string {
    return defenseTraitSummary(monster);
  }

  private formatSymptoms(monster: RuntimeMonster): string {
    return monster.symptoms?.length ? monster.symptoms.join(', ') : '관찰 중';
  }

  private openPartyView(): void {
    this.partyCursor = Math.min(this.state.activeIndex, Math.max(0, this.state.party.length - 1));
    this.partyMenuOpen = false;
    this.partyMenuCursor = 0;
    this.statusTab = 'profile';
    this.statusProfileScroll = 0;
  }

  private partyPurpose(): PartyMenuPurpose {
    if (this.state.phase === 'releaseCapture') return 'release';
    if (this.state.phase === 'forcedSwitch') return 'forced';
    return 'switch';
  }

  private drawPartyView(): void {
    this.clampPartyCursor();
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, 0x101a22).setOrigin(0);
    this.drawGridBackground();

    const purpose = this.partyPurpose();
    const selected = this.state.party[this.partyCursor];
    const prompt = purpose === 'release'
      ? `${this.state.pendingCapture?.name ?? '새 패시몬'}을 데려가려면 놓아줄 패시몬을 선택하세요.`
      : purpose === 'forced'
        ? '다음에 내보낼 패시몬을 선택하세요.'
        : this.state.floor === 5 && this.state.enemy?.isTrainer
          ? '예고된 처치의 피해 배율이 낮은 패시몬으로 교체하세요.'
          : '패시몬을 어떻게 하겠습니까?';

    addLabel(this, 28, 22, purpose === 'release' ? '포획 교체' : '패시몬', 34);
    this.drawFloorBadge();
    if (this.state.pendingCapture && purpose === 'release') {
      this.drawPendingCapturePreview(this.state.pendingCapture);
    }

    if (selected) {
      this.drawSelectedPartyPanel(selected);
    }

    this.state.party.slice(0, 6).forEach((monster, index) => {
      this.drawPartyListCard(monster, index, index === this.partyCursor);
    });

    drawPanel(this, 8, 496, 814, 70).setAlpha(0.98);
    addBoxLabel(this, 34, 514, prompt, { width: 760, height: 42, size: 25, minSize: 18, maxLines: 2 });
    this.drawMenuButton(846, 510, 142, 40, '그만둔다', () => this.cancelPartyView(), false, purpose === 'forced');

    if (this.partyMenuOpen && selected) {
      this.drawPartySubmenu(purpose);
    }
  }

  private drawGridBackground(): void {
    for (let x = 0; x < APP_WIDTH; x += 52) {
      this.add.rectangle(x, 0, 2, APP_HEIGHT, 0x2d3a45, 0.75).setOrigin(0);
    }
    for (let y = 0; y < APP_HEIGHT; y += 52) {
      this.add.rectangle(0, y, APP_WIDTH, 2, 0x2d3a45, 0.75).setOrigin(0);
    }
    for (let x = 0; x < APP_WIDTH; x += 26) {
      this.add.rectangle(x, 0, 1, APP_HEIGHT, 0x1b2831, 0.8).setOrigin(0);
    }
    for (let y = 0; y < APP_HEIGHT; y += 26) {
      this.add.rectangle(0, y, APP_WIDTH, 1, 0x1b2831, 0.8).setOrigin(0);
    }
  }

  private drawPendingCapturePreview(monster: RuntimeMonster): void {
    this.drawPathimonPanel(36, 66, 352, 92, monster).setAlpha(0.88);
    const assets = pathimonSpriteAssets(monster, this.state.visualStyle);
    this.drawMonsterSprite(monster, assets.front, 82, 146, 0.85);
    addBoxLabel(this, 128, 86, `새 포획: ${monster.name}`, { width: 238, height: 24, size: 18, minSize: 12, maxLines: 1 });
    addBoxLabel(this, 128, 116, monster.scientificName, { width: 238, height: 18, size: 12, minSize: 9, maxLines: 1 })
      .setAlpha(0.82);
  }

  private drawSelectedPartyPanel(monster: RuntimeMonster): void {
    this.drawPathimonPanel(36, 174, 352, 180, monster).setAlpha(0.92);
    const assets = pathimonSpriteAssets(monster, this.state.visualStyle);
    this.drawMonsterSprite(monster, assets.front, 94, 316, 1.45);
    addBoxLabel(this, 148, 204, monster.name, { width: 210, height: 28, size: 23, minSize: 14, maxLines: 1 });
    addBoxLabel(this, 148, 238, monster.scientificName, { width: 210, height: 20, size: 12, minSize: 9, maxLines: 1 })
      .setAlpha(0.84);
    addLabel(this, 148, 278, `HP ${monster.hp}/${monster.maxHp}`, 17);
    drawHpBar(this, 148, 314, 202, hpPct(monster));
  }

  private drawPartyListCard(monster: RuntimeMonster, index: number, selected: boolean): void {
    const x = 476;
    const y = 34 + index * 74;
    const width = 502;
    const height = 62;
    const unusable = monster.fainted || monster.hp <= 0 || Boolean(monster.sealedByBoss);
    const rect = this.add.rectangle(x, y, width, height, selected ? 0x0b6280 : 0x07344d, unusable ? 0.45 : 0.92).setOrigin(0);
    rect.setStrokeStyle(selected ? 4 : 2, this.pathimonFrameBorderColor(monster, selected ? 0xffffff : 0x2ee9ff));
    rect.setInteractive({ useHandCursor: true });
    rect.on('pointerdown', () => {
      this.partyCursor = index;
      if (this.state.phase === 'forcedSwitch') {
        this.handlePartySwitch(index);
        return;
      }
      this.partyMenuOpen = true;
      this.partyMenuCursor = 0;
      this.render();
    });

    if (selected) {
      this.drawCursorMarker(x - 20, y + height / 2);
    }

    const assets = pathimonSpriteAssets(monster, this.state.visualStyle);
    this.drawMonsterSprite(monster, assets.front, x + 34, y + 57, 0.72);
    addBoxLabel(this, x + 78, y + 9, monster.name, { width: 200, height: 24, size: 19, minSize: 12, maxLines: 1 });
    const stateLabel = index === this.state.activeIndex
      ? '현재'
      : monster.sealedByBoss
        ? '봉인'
        : unusable
          ? '기절'
          : '';
    addBoxLabel(this, x + 78, y + 36, stateLabel, {
      width: 90,
      height: 16,
      size: 12,
      minSize: 9,
      maxLines: 1,
    }).setAlpha(0.78);
    addLabel(this, x + 302, y + 12, 'HP', 15);
    drawHpBar(this, x + 346, y + 22, 124, hpPct(monster));
    addBoxLabel(this, x + 418, y + 34, `${monster.hp}/${monster.maxHp}`, { width: 74, height: 18, size: 13, minSize: 9, maxLines: 1 });
  }

  private drawPartySubmenu(purpose: PartyMenuPurpose): void {
    const options = partyMenuOptions(purpose);
    const x = 706;
    const y = Math.min(368, 92 + this.partyCursor * 54);
    const width = 250;
    const height = 24 + options.length * 42;
    drawPanel(this, x, y, width, height).setAlpha(0.98);

    options.forEach((label, index) => {
      this.drawMenuButton(x + 18, y + 16 + index * 42, width - 36, 34, label, () => {
        this.partyMenuCursor = index;
        this.handlePartyMenuOption(label);
      }, this.partyMenuCursor === index);
    });
  }

  private handlePartyMenuOption(label: string): void {
    if (label === '능력치를 본다') {
      this.statusTab = 'profile';
      this.statusMoveCursor = 0;
      this.statusLearningOpen = false;
      this.statusProfileScroll = 0;
      this.viewMode = 'status';
      this.partyMenuOpen = false;
      this.render();
      return;
    }

    if (label === '교체한다') {
      this.handlePartySwitch(this.partyCursor);
      return;
    }

    if (label === '놓아준다') {
      this.state = resolveCaptureRelease(this.state, this.partyCursor);
      this.notice = this.state.lastLog;
      this.partyMenuOpen = false;
      this.viewMode = 'command';
      this.afterBattleAction();
      return;
    }

    this.cancelPartyView();
  }

  private cancelPartyView(): void {
    if (this.partyMenuOpen) {
      this.partyMenuOpen = false;
      this.render();
      return;
    }

    if (this.state.phase === 'releaseCapture') {
      this.state = cancelPendingCapture(this.state);
      this.notice = this.state.lastLog;
      this.viewMode = 'command';
      this.afterBattleAction();
      return;
    }

    if (this.state.phase !== 'forcedSwitch') {
      this.viewMode = 'command';
    }
    this.render();
  }

  private drawStatusView(): void {
    this.clampPartyCursor();
    const monster = this.state.party[this.partyCursor] ?? this.state.party[this.state.activeIndex];
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, 0xf0f4f1).setOrigin(0);
    this.add.rectangle(0, 0, APP_WIDTH, 48, 0x20202c).setOrigin(0);
    this.add.rectangle(0, 50, APP_WIDTH, 4, 0x20c8b2).setOrigin(0);
    addLabel(this, 24, 2, '스테이터스', 36).setTint(0xffffff);
    this.drawFloorBadge();

    const statusBorder = this.pathimonFrameBorderColor(monster, 0x555c66);
    drawPanel(this, 28, 76, 332, 370).setFillStyle(0xdfe5dd).setStrokeStyle(3, statusBorder);
    this.add.rectangle(42, 92, 304, 232, 0xf5f2d8).setOrigin(0).setAlpha(0.75);
    const assets = pathimonSpriteAssets(monster, this.state.visualStyle);
    this.drawMonsterSprite(monster, assets.front, 194, 306, monster.isTrainer ? 2.2 : 2.6);
    addLabel(this, 54, 344, `HP ${monster.hp}/${monster.maxHp}`, 20).setColor('#20202c');
    drawHpBar(this, 54, 386, 250, hpPct(monster));
    addBoxLabel(this, 54, 414, monster.name, { width: 276, height: 30, size: 24, minSize: 14, maxLines: 1, color: '#20202c' });

    drawPanel(this, 388, 76, 600, 370).setFillStyle(0xf7faf8).setStrokeStyle(3, statusBorder);
    addBoxLabel(this, 424, 96, monster.name, { width: 520, height: 38, size: 31, minSize: 17, maxLines: 1, color: '#20202c' });
    addBoxLabel(this, 424, 142, monster.scientificName, { width: 520, height: 28, size: 19, minSize: 12, maxLines: 1, color: '#3f454d' });
    addBoxLabel(this, 424, 190, `방어특성: ${this.formatDefenseTraits(monster)}`, {
      width: 520,
      height: 28,
      size: 20,
      minSize: 13,
      maxLines: 1,
      color: '#20202c',
    });

    if (this.statusTab === 'profile') {
      addLabel(this, 424, 244, '메모', 23).setColor('#20202c');
      this.drawStatusProfileMemo(monster);
    } else {
      this.drawStatusMoves(monster);
    }

    this.drawMenuButton(48, 492, 150, 44, '뒤로가기', () => {
      this.viewMode = 'party';
      this.statusTab = 'profile';
      this.statusLearningOpen = false;
      this.render();
    });
    if (this.statusTab === 'moves') {
      this.drawMenuButton(648, 492, 150, 44, this.statusLearningOpen ? '목록' : '학습', () => {
        this.statusLearningOpen = !this.statusLearningOpen;
        this.render();
      });
    }
    this.drawMenuButton(816, 492, 150, 44, this.statusTab === 'moves' ? '프로필' : '기술', () => {
      this.statusTab = this.statusTab === 'moves' ? 'profile' : 'moves';
      this.statusLearningOpen = false;
      this.render();
    });
  }

  private drawStatusProfileMemo(monster: RuntimeMonster): void {
    const viewportX = 424;
    const viewportY = 278;
    const viewportWidth = 520;
    const viewportHeight = 158;
    const textWidth = 494;
    const gap = 10;
    const labels: Phaser.GameObjects.Text[] = [];
    let contentHeight = 0;

    for (const line of statusProfileMemoLines(monster)) {
      const label = addBoxLabel(this, viewportX, 0, line, {
        width: textWidth,
        height: 480,
        size: 16,
        minSize: 14,
        color: '#20202c',
      });
      labels.push(label);
      contentHeight += label.height + gap;
    }

    contentHeight = Math.max(0, contentHeight - gap);
    this.statusProfileMaxScroll = Math.max(0, contentHeight - viewportHeight);
    this.statusProfileScroll = clampProfileMemoScroll(
      this.statusProfileScroll,
      contentHeight,
      viewportHeight,
    );

    let contentY = 0;
    for (const label of labels) {
      const y = viewportY + contentY - this.statusProfileScroll;
      const visibleTop = Math.max(viewportY, y);
      const visibleBottom = Math.min(viewportY + viewportHeight, y + label.height);
      label.setPosition(viewportX, y);

      if (visibleBottom <= visibleTop) {
        label.setVisible(false);
      } else if (visibleTop > y || visibleBottom < y + label.height) {
        label.setCrop(0, visibleTop - y, textWidth, visibleBottom - visibleTop);
      }
      contentY += label.height + gap;
    }

    const scrollZone = this.add.zone(viewportX, viewportY, viewportWidth, viewportHeight).setOrigin(0).setInteractive();
    scrollZone.on('wheel', (_pointer: Phaser.Input.Pointer, _deltaX: number, deltaY: number) => {
      this.scrollStatusProfile(deltaY > 0 ? 72 : -72);
    });

    if (this.statusProfileMaxScroll > 0) {
      const trackX = viewportX + viewportWidth - 6;
      const thumbHeight = Math.max(28, viewportHeight * (viewportHeight / contentHeight));
      const thumbTravel = viewportHeight - thumbHeight;
      const thumbY = viewportY + thumbTravel * (this.statusProfileScroll / this.statusProfileMaxScroll);
      this.add.rectangle(trackX, viewportY, 4, viewportHeight, 0xc8ced0).setOrigin(0);
      this.add.rectangle(trackX, thumbY, 4, thumbHeight, 0x555c66).setOrigin(0);
    }
  }

  private scrollStatusProfile(delta: number): void {
    const next = clampProfileMemoScroll(
      this.statusProfileScroll + delta,
      this.statusProfileMaxScroll + 158,
      158,
    );
    if (next === this.statusProfileScroll) return;
    this.statusProfileScroll = next;
    this.render();
  }

  private drawStatusMoves(monster: RuntimeMonster): void {
    const slots = battleMoveSlots(monster);
    const availableIndexes = slots
      .map((moveId, index) => (moveId ? index : -1))
      .filter((index) => index >= 0);
    const maxCursor = availableIndexes.length > 0 ? Math.max(...availableIndexes) : 0;
    this.statusMoveCursor = Math.min(maxCursor, Math.max(0, this.statusMoveCursor));
    const selectedMoveId = slots[this.statusMoveCursor] ?? slots.find(Boolean);

    addLabel(this, 424, 236, this.statusLearningOpen ? '학습' : '기술', 23).setColor('#20202c');

    if (this.statusLearningOpen && selectedMoveId) {
      const detail = formatMoveDetailSections(selectedMoveId, monster);
      addBoxLabel(this, 424, 278, detail.title, { width: 520, height: 28, size: 22, maxLines: 1, color: '#20202c' });
      addBoxLabel(this, 424, 316, detail.description, { width: 520, height: 60, size: 18, minSize: 14, maxLines: 3, color: '#3f454d' });
      addBoxLabel(this, 424, 386, detail.learnText, { width: 520, height: 54, size: 18, minSize: 14, maxLines: 3, color: '#3f454d' });
      return;
    }

    slots.forEach((moveId, index) => {
      const y = 278 + index * 42;
      const selected = index === this.statusMoveCursor;
      const color = selected ? '#20202c' : '#3f454d';
      addLabel(this, 424, y, selected ? '▶' : ' ', 18).setColor('#20202c');

      if (!moveId) {
        addLabel(this, 450, y, '---', 18).setColor('#7c838a');
        return;
      }

      const details = formatMoveDetails(moveId, monster);
      addBoxLabel(this, 450, y, formatMoveName(moveId, monster), { width: 160, height: 22, size: 18, minSize: 13, maxLines: 1, color });
      addBoxLabel(this, 626, y, details[1], { width: 210, height: 22, size: 15, minSize: 11, maxLines: 1, color: '#3f454d' });
      addBoxLabel(this, 856, y, details[2], { width: 88, height: 22, size: 15, minSize: 12, maxLines: 1, color: '#3f454d' });
    });
  }

  private clampPartyCursor(): void {
    const maxIndex = Math.max(0, this.state.party.length - 1);
    this.partyCursor = Math.min(maxIndex, Math.max(0, this.partyCursor));
  }
  private handleDirectionalInput(direction: Direction): void {
    if (this.isAnimating) {
      return;
    }

    if (this.showFirstTrainerGuide) {
      return;
    }

    if (this.viewMode === 'captureQuiz') {
      if (!this.captureQuizResult) {
        if (direction === 'left') this.captureQuizCursor = 0;
        if (direction === 'right') this.captureQuizCursor = 1;
        this.render();
      }
      return;
    }

    if (this.viewMode === 'status') {
      if (this.statusTab === 'moves' && (direction === 'up' || direction === 'down')) {
        this.moveStatusMoveCursor(direction);
        this.render();
      } else if (this.statusTab === 'profile' && (direction === 'up' || direction === 'down')) {
        this.scrollStatusProfile(direction === 'down' ? 72 : -72);
      } else if (direction === 'left' || direction === 'right') {
        this.statusTab = this.statusTab === 'profile' ? 'moves' : 'profile';
        this.statusLearningOpen = false;
        this.render();
      }
      return;
    }

    if (this.viewMode === 'party' || this.state.phase === 'forcedSwitch' || this.state.phase === 'releaseCapture') {
      if (this.partyMenuOpen) {
        this.movePartyMenuCursor(direction);
      } else {
        this.movePartyCursor(direction);
      }
      this.render();
      return;
    }

    if (this.viewMode === 'command' && this.state.phase === 'battle') {
      this.moveCommandCursor(direction);
      this.render();
      return;
    }

    if (this.viewMode === 'moves' && this.state.phase === 'battle') {
      this.moveSelectedMove(direction);
      this.render();
      return;
    }

    if (this.viewMode === 'capsules' && this.state.phase === 'battle') {
      this.moveCapsuleCursor(direction);
      this.render();
      return;
    }

    if (this.viewMode === 'dex' && this.state.phase === 'battle' && (direction === 'left' || direction === 'right')) {
      this.dexTab = this.dexTab === 'moves' ? 'effectiveness' : 'moves';
      this.render();
    }
  }

  private moveCommandCursor(direction: Direction): void {
    const column = this.commandCursor % 2;
    const row = Math.floor(this.commandCursor / 2);
    const nextColumn = direction === 'left' ? Math.max(0, column - 1) : direction === 'right' ? Math.min(1, column + 1) : column;
    const nextRow = direction === 'up' ? Math.max(0, row - 1) : direction === 'down' ? Math.min(1, row + 1) : row;
    this.commandCursor = nextRow * 2 + nextColumn;
  }

  private moveSelectedMove(direction: Direction): void {
    const player = this.state.party[this.state.activeIndex];
    const moves = battleMoveSlots(player);
    const index = Math.max(0, moves.indexOf(this.selectedMoveId));
    const column = index % 2;
    const row = Math.floor(index / 2);
    const nextColumn = direction === 'left' ? Math.max(0, column - 1) : direction === 'right' ? Math.min(1, column + 1) : column;
    const nextRow = direction === 'up' ? Math.max(0, row - 1) : direction === 'down' ? Math.min(1, row + 1) : row;
    const nextMove = moves[nextRow * 2 + nextColumn];

    if (nextMove && canUseBattleMove(player, nextMove)) {
      this.selectedMoveId = nextMove;
      this.armedMoveId = nextMove;
    }
  }

  private moveCapsuleCursor(direction: Direction): void {
    if (direction !== 'up' && direction !== 'down') return;
    this.capsuleCursor += direction === 'down' ? 1 : -1;
    this.capsuleCursor = Math.min(CAPSULE_ORDER.length - 1, Math.max(0, this.capsuleCursor));
  }

  private moveStatusMoveCursor(direction: Direction): void {
    const monster = this.state.party[this.partyCursor] ?? this.state.party[this.state.activeIndex];
    const filledIndexes = battleMoveSlots(monster)
      .map((moveId, index) => (moveId ? index : -1))
      .filter((index) => index >= 0);
    if (filledIndexes.length === 0) return;

    const currentPosition = Math.max(0, filledIndexes.indexOf(this.statusMoveCursor));
    const nextPosition = direction === 'down'
      ? Math.min(filledIndexes.length - 1, currentPosition + 1)
      : Math.max(0, currentPosition - 1);
    this.statusMoveCursor = filledIndexes[nextPosition];
  }

  private movePartyCursor(direction: Direction): void {
    if (direction === 'up') this.partyCursor -= 1;
    if (direction === 'down') this.partyCursor += 1;
    if (direction === 'left') this.partyCursor = Math.max(0, this.partyCursor - 3);
    if (direction === 'right') this.partyCursor = Math.min(this.state.party.length - 1, this.partyCursor + 3);
    this.clampPartyCursor();
  }

  private movePartyMenuCursor(direction: Direction): void {
    if (direction !== 'up' && direction !== 'down') return;
    const optionCount = partyMenuOptions(this.partyPurpose()).length;
    this.partyMenuCursor += direction === 'down' ? 1 : -1;
    this.partyMenuCursor = Math.min(optionCount - 1, Math.max(0, this.partyMenuCursor));
  }

  private handleConfirmInput(): void {
    if (this.battleMessageStage !== 'preparation') {
      this.advanceBattleMessage();
      return;
    }

    if (this.isAnimating) {
      return;
    }

    if (this.showFirstTrainerGuide) {
      this.dismissFirstTrainerGuide();
      return;
    }

    if (this.viewMode === 'captureQuiz') {
      if (this.captureQuizResult) {
        this.dismissCaptureQuizResult();
      } else {
        this.handleCaptureQuizAnswer(this.captureQuizCursor === 0);
      }
      return;
    }

    if (this.state.phase === 'floorClear') {
      this.advanceFloorClearPage();
      return;
    }

    if (this.viewMode === 'status') {
      if (this.statusTab === 'moves') {
        this.statusLearningOpen = !this.statusLearningOpen;
      } else {
        this.statusTab = 'moves';
        this.statusLearningOpen = false;
      }
      this.render();
      return;
    }

    if (this.viewMode === 'party' || this.state.phase === 'forcedSwitch' || this.state.phase === 'releaseCapture') {
      if (!this.partyMenuOpen) {
        if (this.state.phase === 'forcedSwitch') {
          this.handlePartySwitch(this.partyCursor);
          return;
        }
        this.partyMenuOpen = true;
        this.partyMenuCursor = 0;
        this.render();
        return;
      }

      const option = partyMenuOptions(this.partyPurpose())[this.partyMenuCursor];
      if (option) this.handlePartyMenuOption(option);
      return;
    }

    if (this.state.phase !== 'battle') {
      return;
    }

    if (this.viewMode === 'command') {
      const option = battleActionOptions(this.state.encounterKind)[this.commandCursor];
      if (option && !option.disabled) this.handleCommandAction(option.id);
    } else if (this.viewMode === 'moves') {
      this.handleMovePress(this.selectedMoveId);
    } else if (this.viewMode === 'capsules') {
      this.handleCapsuleThrow(CAPSULE_ORDER[this.capsuleCursor]);
    }
  }

  private handleCancelInput(): void {
    if (this.battleMessageStage !== 'preparation') {
      this.advanceBattleMessage();
      return;
    }

    if (this.isAnimating) {
      return;
    }

    if (this.showFirstTrainerGuide || this.viewMode === 'captureQuiz') {
      return;
    }

    if (this.viewMode === 'status') {
      this.viewMode = 'party';
      this.statusTab = 'profile';
      this.statusLearningOpen = false;
      this.render();
      return;
    }

    if (this.viewMode === 'party' || this.state.phase === 'forcedSwitch' || this.state.phase === 'releaseCapture') {
      this.cancelPartyView();
      return;
    }

    if (this.viewMode !== 'command' && this.state.phase === 'battle') {
      this.viewMode = 'command';
      this.render();
    }
  }

  private handlePartySwitch(index: number): void {
    const wasForcedSwitch = this.state.phase === 'forcedSwitch';
    this.state = wasForcedSwitch
      ? resolveForcedSwitchMonster(this.state, index)
      : resolveSwitchMonster(this.state, index);
    const player = this.state.party[this.state.activeIndex];
    this.selectedMoveId = firstUsableMove(player);
    this.armedMoveId = this.selectedMoveId;
    this.notice = this.state.battleResultLog ?? this.state.lastLog;
    this.viewMode = 'command';
    this.afterBattleAction();
  }

  private handleCapsuleThrow(capsuleId: CapsuleId): void {
    const enemy = this.state.enemy;
    const quizState = beginCaptureQuiz(this.state, capsuleId);
    this.state = quizState;
    this.notice = enemy?.isTrainer ? '사람 전투에서는 캡슐을 던질 수 없습니다.' : quizState.lastLog;
    if (!enemy || quizState.pendingCaptureCapsuleId !== capsuleId) {
      this.viewMode = 'capsules';
      this.render();
      return;
    }

    this.captureQuiz = pickCaptureQuiz(enemy, Math.random);
    this.captureQuizCursor = 0;
    this.captureQuizResult = undefined;
    this.isAnimating = true;
    this.playCapsuleThrow(capsuleId, () => {
      this.isAnimating = false;
      this.viewMode = 'captureQuiz';
      this.render();
    });
  }

  private playCapsuleThrow(capsuleId: CapsuleId, onComplete: () => void): void {
    const layouts = battleSpriteLayouts();
    const startX = layouts.player.x + 36;
    const startY = layouts.player.y - 74;
    const endX = layouts.enemy.x;
    const endY = layouts.enemy.y - 116;
    const capsule = this.add.image(startX, startY, capsuleIconPath(capsuleId))
      .setDepth(BATTLE_EFFECT_DEPTH + 12)
      .setScale(0.64);

    this.tweens.add({
      targets: capsule,
      x: (startX + endX) / 2,
      y: Math.min(startY, endY) - 118,
      angle: 420,
      duration: 330,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: capsule,
          x: endX,
          y: endY,
          angle: 720,
          duration: 300,
          ease: 'Sine.easeIn',
          onComplete: () => {
            capsule.destroy();
            onComplete();
          },
        });
      },
    });
  }

  private handleCaptureQuizAnswer(answer: boolean): void {
    if (!this.captureQuiz || this.captureQuizResult || this.isAnimating) return;

    const correct = answer === this.captureQuiz.answer;
    // 바로 판정하지 않는다. 먼저 해설(근거 학습포인트)을 보여준다.
    // 거짓(X) 문항이면 참문장으로 오개념을 즉시 교정한다.
    this.captureQuizResult = {
      correct,
      answer: this.captureQuiz.answer,
      explain: this.captureQuiz.explain ?? '',
    };
    this.render();
  }

  private dismissCaptureQuizResult(): void {
    const result = this.captureQuizResult;
    if (!result || this.isAnimating) return;

    const correct = result.correct;
    const previousState = this.state;
    this.state = resolveCaptureQuizAnswer(this.state, correct);
    this.notice = this.state.battleResultLog ?? this.state.lastLog;
    this.captureQuiz = undefined;
    this.captureQuizResult = undefined;

    if (!correct) {
      this.viewMode = this.state.phase === 'forcedSwitch' ? 'party' : 'command';
      this.playBattleResolutionCue(previousState, this.state, () => this.showCombatMessage());
      return;
    }

    this.viewMode = this.state.phase === 'releaseCapture' ? 'party' : 'command';
    if (this.state.phase === 'releaseCapture') {
      this.openPartyView();
    }
    this.afterBattleAction();
  }

  private afterBattleAction(): void {
    if (this.state.phase === 'shop') {
      this.preserveBattleBgmOnShutdown = true;
      this.scene.start('ShopScene', { state: this.state });
      return;
    }

    if (this.state.phase === 'releaseCapture') {
      this.viewMode = 'party';
      this.clampPartyCursor();
      this.partyMenuOpen = false;
      this.partyMenuCursor = 0;
    }

    this.render();
  }

  private drawFloorClearView(): void {
    const title = `${this.state.floor}층 클리어`;
    const body = this.floorClearBody();
    const pages = this.floorClearPages(body);
    const pageIndex = Math.min(this.floorClearPage, pages.length - 1);
    this.floorClearPage = pageIndex;
    addLabel(this, 34, 410, title, 24);
    if (pages.length > 1) {
      const pageSubject = pageIndex === 0 ? '핵심 한 문장' : '자세히 보기';
      addBoxLabel(this, 608, 416, `${pageSubject} (${pageIndex + 1}/${pages.length})`, {
        width: 116,
        height: 18,
        size: 12,
        minSize: 9,
        maxLines: 1,
        align: 'right',
      }).setAlpha(0.76);
    }
    addBoxLabel(this, 34, 448, pages[pageIndex], {
      width: 690,
      height: 82,
      size: 14,
      minSize: 9,
      maxLines: 5,
    }).setAlpha(0.9);
    const hasNextPage = pageIndex < pages.length - 1;
    const buttonLabel = hasNextPage
      ? (pageIndex === 0 ? '자세히 보기' : `다음 내용 ${pageIndex + 2}/${pages.length}`)
      : '다음 층';
    this.drawMenuButton(780, 444, 160, 48, buttonLabel, () => this.advanceFloorClearPage());
  }

  private floorClearBody(): string {
    const title = `${this.state.floor}층 클리어`;
    const log = this.notice || this.state.lastLog;
    const body = log.startsWith(title) ? log.slice(title.length).trimStart() : log;
    return stripMarkdownEmphasis(body)
      .split(/\n+/)
      .map((paragraph) => sanitizeLearningText(paragraph))
      .filter((paragraph) => paragraph.length > 0)
      .join('\n');
  }

  private floorClearPages(body = this.floorClearBody()): string[] {
    const paragraphs = body
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0);
    const wrapParagraphs = (items: string[]): string[][] => items.map((paragraph) => {
        const measure = addLabel(this, -10000, -10000, paragraph, 14).setWordWrapWidth(690, true);
        const wrappedLines = measure.getWrappedText(paragraph);
        measure.destroy();
        return wrappedLines;
      });

    if (this.state.encounterKind === 'wild' && paragraphs.length > 1) {
      const encounterResult = paragraphs[0]!;
      const detail = paragraphs.slice(1).join(' ');
      const summary = conciseLearningFeedback(detail, 120);
      if (summary && summary !== detail) {
        const summaryPages = paginateWrappedTextBlocks(
          wrapParagraphs([encounterResult, `핵심 한 문장\n${summary}`]),
          5,
        );
        const detailPages = paginateWrappedTextBlocks(
          wrapParagraphs([`자세히 보기\n${detail}`]),
          5,
        );
        return [...summaryPages, ...detailPages];
      }
    }

    return paginateWrappedTextBlocks(wrapParagraphs(paragraphs), 5);
  }

  private advanceFloorClearPage(): void {
    const pages = this.floorClearPages();
    if (this.floorClearPage < pages.length - 1) {
      this.floorClearPage += 1;
      this.render();
      return;
    }
    this.goNextFloor();
  }

  private drawDefeatView(): void {
    addLabel(this, 34, 410, '패배', 24);
    addBoxLabel(this, 34, 448, this.notice || this.state.lastLog || '더 이상 전투 가능한 패시몬이 없습니다.', {
      width: 690,
      height: 74,
      size: 16,
      minSize: 11,
      maxLines: 3,
    }).setAlpha(0.9);
    this.drawMenuButton(780, 444, 160, 48, '처음으로', () => this.returnToModeSelect());
  }

  private goNextFloor(): void {
    const nextState = advanceFromShop(this.state);
    this.preserveBattleBgmOnShutdown = shouldPreserveBattleBgm({
      currentEncounterKind: this.state.encounterKind,
      currentKey: this.selectedBgmKey,
      nextEncounterKind: nextState.encounterKind,
      nextFloor: nextState.floor,
      seed: nextState.bgmSeed,
    });
    if (nextState.phase === 'bossIntro') {
      this.scene.start('BossIntroScene', { state: nextState });
      return;
    }
    this.scene.start('BattleScene', { state: nextState });
  }

  private returnToModeSelect(): void {
    this.preserveBattleBgmOnShutdown = false;
    this.registry.set('bossRosterIds', createBossRosterIds(Math.random));
    this.stopBattleBgm();
    this.scene.start('ModeSelectScene');
  }

  private drawMobileOverlay(): void {
    const depth = 900;
    const dpadX = 118;
    const dpadY = 500;

    this.add.rectangle(dpadX, dpadY, 172, 54, OVERLAY_FILL, 0.24).setDepth(depth);
    this.add.rectangle(dpadX, dpadY, 54, 172, OVERLAY_FILL, 0.24).setDepth(depth);
    this.add.rectangle(dpadX, dpadY, 54, 54, OVERLAY_FILL, 0.16).setDepth(depth);

    this.drawOverlayHitArea(dpadX, dpadY - 58, 58, 58, 'up', '↑', depth + 1);
    this.drawOverlayHitArea(dpadX, dpadY + 58, 58, 58, 'down', '↓', depth + 1);
    this.drawOverlayHitArea(dpadX - 58, dpadY, 58, 58, 'left', '←', depth + 1);
    this.drawOverlayHitArea(dpadX + 58, dpadY, 58, 58, 'right', '→', depth + 1);

    this.drawActionOverlayButton(896, 452, 48, 'A', () => this.handleConfirmInput(), depth + 1);
    this.drawActionOverlayButton(802, 510, 44, 'B', () => this.handleCancelInput(), depth + 1);
    const homeButton = mobileHomeButtonLayout();
    this.drawOverlayTextButton(homeButton.x, homeButton.y, homeButton.width, homeButton.height, homeButton.label, () => {
      this.returnToModeSelect();
    }, depth + 1, true);
  }

  private drawOverlayHitArea(x: number, y: number, width: number, height: number, direction: Direction, label: string, depth: number): void {
    const hit = this.add.rectangle(x, y, width, height, OVERLAY_FILL, 0.02).setDepth(depth);
    if (this.mobileControlOverlayInteractive()) {
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => this.handleDirectionalInput(direction));
    }
    addLabel(this, x, y, label, 20).setOrigin(0.5).setAlpha(0.3).setDepth(depth + 1);
  }

  private drawActionOverlayButton(x: number, y: number, radius: number, label: string, onClick: () => void, depth: number): void {
    const circle = this.add.circle(x, y, radius, OVERLAY_FILL, 0.27).setStrokeStyle(2, OVERLAY_STROKE, 0.22).setDepth(depth);
    if (this.mobileControlOverlayInteractive()) {
      circle.setInteractive({ useHandCursor: true });
      circle.on('pointerdown', onClick);
    }
    addLabel(this, x, y, label, 30).setOrigin(0.5).setTint(OVERLAY_TEXT).setAlpha(0.72).setDepth(depth + 1);
  }

  private drawLockedMoveOverlay(x: number, y: number, width: number, height: number): void {
    const overlayPath = lockedMoveOverlayPath();
    if (this.textures.exists(overlayPath)) {
      this.add.image(x, y, overlayPath).setOrigin(0).setDisplaySize(width, height).setAlpha(0.96);
      return;
    }

    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0xd8cde6, 0.9);
    graphics.lineBetween(x + 14, y + 8, x + width - 14, y + height - 8);
    graphics.lineBetween(x + width - 14, y + 8, x + 14, y + height - 8);
  }

  private drawOverlayTextButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void,
    depth: number,
    interactive: boolean,
  ): void {
    const rect = this.add.rectangle(x, y, width, height, OVERLAY_FILL, 0.2).setOrigin(0).setDepth(depth);
    rect.setStrokeStyle(1, OVERLAY_STROKE, 0.22);
    if (interactive) {
      rect.setInteractive({ useHandCursor: true });
      rect.on('pointerdown', onClick);
    }
    addLabel(this, x + width / 2, y + height / 2, label, 12).setOrigin(0.5).setTint(OVERLAY_TEXT).setAlpha(0.76).setDepth(depth + 1);
  }

  private mobileControlOverlayInteractive(): boolean {
    return mobileControlOverlayInteractive({
      hasTouch: this.sys.game.device.input.touch,
      coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    });
  }

  private drawCursorMarker(x: number, y: number): void {
    this.add.triangle(x, y, 0, -8, 0, 8, 13, 0, 0xffffff).setOrigin(0.5);
  }

  private drawMenuButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void,
    active = false,
    disabled = false,
  ): void {
    const rect = this.add.rectangle(x, y, width, height, disabled ? COLORS.panelDark : active ? BUTTON_ACTIVE_FILL : BUTTON_FILL).setOrigin(0);
    rect.setStrokeStyle(2, active ? 0x72d6ff : COLORS.line);

    if (!disabled) {
      rect.setInteractive({ useHandCursor: true });
      rect.on('pointerover', () => rect.setFillStyle(BUTTON_ACTIVE_FILL));
      rect.on('pointerout', () => rect.setFillStyle(active ? BUTTON_ACTIVE_FILL : BUTTON_FILL));
      rect.on('pointerdown', onClick);
    } else {
      rect.setAlpha(0.48);
    }

    if (active && !disabled) {
      const marker = cursorMarkerPoint({ x, y, height });
      this.drawCursorMarker(marker.x, marker.y);
    }

    addBoxLabel(this, x + width / 2, y + height / 2, label, {
      width: width - 16,
      height: height - 8,
      size: 15,
      minSize: 10,
      maxLines: 2,
      align: 'center',
      origin: [0.5, 0.5],
    })
      .setAlpha(disabled ? 0.58 : 1);
  }
}

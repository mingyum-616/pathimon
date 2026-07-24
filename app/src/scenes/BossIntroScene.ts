import Phaser from 'phaser';
import { applyFinalBossSkill } from '../battle/turn';
import type { RunState } from '../types/game';
import { APP_WIDTH, APP_HEIGHT, COLORS } from '../game/constants';
import { addBoxLabel, addLabel, drawPanel } from '../ui/draw';
import { defenseTraitSummary } from '../ui/battleUi';
import { keyboardCommand } from '../ui/keyboard';
import { advanceTypewriter } from '../ui/typewriter';

interface BossIntroSceneData {
  state?: RunState;
}

const TYPEWRITER_INTERVAL_MS = 24;

export class BossIntroScene extends Phaser.Scene {
  private state!: RunState;
  private advancing = false;
  private dialogueLines: string[] = [];
  private dialogueIndex = 0;
  private visibleCharacters = 0;
  private dialogueText?: Phaser.GameObjects.Text;
  private typewriterTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super('BossIntroScene');
  }

  init(data: BossIntroSceneData = {}): void {
    if (!data.state) {
      throw new Error('BossIntroScene requires state');
    }
    this.state = data.state;
    const enemy = this.state.enemy;
    this.dialogueLines = enemy?.encounterDialogue?.length
      ? [...enemy.encounterDialogue]
      : [`${enemy?.name ?? '보스'}이 길을 막아섰다.`];
    if (this.state.floor === 100 && enemy?.finalBossSkillAnnouncement) {
      this.dialogueLines.push(enemy.finalBossSkillAnnouncement);
    }
    this.dialogueIndex = 0;
    this.visibleCharacters = 0;
  }

  preload(): void {
    const assetPath = this.state.enemy?.assetPath;
    if (assetPath && !this.textures.exists(assetPath)) {
      this.load.image(assetPath, assetPath);
    }
  }

  create(): void {
    this.advancing = false;
    this.drawIntro();
    this.startTyping();

    this.input.on('pointerdown', this.advanceDialogue, this);
    this.input.keyboard?.on('keydown', this.handleKeyboardDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.typewriterTimer?.remove(false);
      this.typewriterTimer = undefined;
      this.input.off('pointerdown', this.advanceDialogue, this);
      this.input.keyboard?.off('keydown', this.handleKeyboardDown);
    });
  }

  private drawIntro(): void {
    const enemy = this.state.enemy;
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, COLORS.ink).setOrigin(0);
    this.add.rectangle(0, 0, APP_WIDTH, 78, 0x121927).setOrigin(0);
    addLabel(this, 54, 20, `${this.state.floor}층 · 보스 출현`, 30);

    drawPanel(this, 54, 104, 916, 274).setAlpha(0.98);
    addBoxLabel(this, 88, 134, enemy?.name ?? '보스', {
      width: 500,
      height: 42,
      size: 34,
      minSize: 20,
      maxLines: 1,
    });
    addBoxLabel(this, 88, 184, enemy?.scientificName ?? '', {
      width: 500,
      height: 54,
      size: 18,
      minSize: 12,
      maxLines: 2,
    }).setAlpha(0.82);
    addBoxLabel(this, 88, 262, `방어특성: ${enemy ? defenseTraitSummary(enemy) : '없음'}`, {
      width: 500,
      height: 54,
      size: 17,
      minSize: 11,
      maxLines: 2,
    }).setAlpha(0.86);

    const assetPath = this.state.enemy?.assetPath;
    if (assetPath && this.textures.exists(assetPath)) {
      const frame = this.textures.getFrame(assetPath);
      const scale = Math.min(4.2, 280 / Math.max(1, frame?.width ?? 96), 244 / Math.max(1, frame?.height ?? 96));
      this.add.image(790, 348, assetPath).setOrigin(0.5, 1).setScale(scale);
    } else {
      addLabel(this, 790, 244, enemy?.glyph ?? 'BOSS', 64).setOrigin(0.5);
    }

    drawPanel(this, 54, 398, 916, 132).setAlpha(0.98);
    addBoxLabel(this, 80, 414, enemy?.name ?? '보스', {
      width: 840,
      height: 22,
      size: 15,
      minSize: 12,
      maxLines: 1,
      color: '#72d6ff',
    });
    this.dialogueText = addBoxLabel(this, 80, 450, '', {
      width: 840,
      height: 58,
      size: 24,
      minSize: 17,
      maxLines: 2,
    });
    addLabel(this, 938, 502, '▼', 16).setOrigin(1, 0).setAlpha(0.72);
  }

  private handleKeyboardDown = (event: KeyboardEvent): void => {
    const command = keyboardCommand(event.key);
    if (command === 'confirm') {
      event.preventDefault();
      this.advanceDialogue();
    }
  };

  private startTyping(): void {
    this.typewriterTimer?.remove(false);
    const line = this.dialogueLines[this.dialogueIndex] ?? '';
    this.dialogueText?.setText(line.slice(0, this.visibleCharacters));
    if (this.visibleCharacters >= line.length) return;

    this.typewriterTimer = this.time.addEvent({
      delay: TYPEWRITER_INTERVAL_MS,
      loop: true,
      callback: () => {
        this.visibleCharacters = Math.min(line.length, this.visibleCharacters + 1);
        this.dialogueText?.setText(line.slice(0, this.visibleCharacters));
        if (this.visibleCharacters >= line.length) {
          this.typewriterTimer?.remove(false);
          this.typewriterTimer = undefined;
        }
      },
    });
  }

  private advanceDialogue(): void {
    if (this.advancing) return;
    const advance = advanceTypewriter(this.dialogueLines, this.dialogueIndex, this.visibleCharacters);
    this.dialogueIndex = advance.lineIndex;
    this.visibleCharacters = advance.visibleCharacters;

    if (advance.action === 'reveal') {
      this.typewriterTimer?.remove(false);
      this.typewriterTimer = undefined;
      this.dialogueText?.setText(this.dialogueLines[this.dialogueIndex] ?? '');
      return;
    }

    if (advance.action === 'next') {
      this.startTyping();
      return;
    }

    this.startBattle();
  }

  private startBattle(): void {
    if (this.advancing) return;
    this.advancing = true;
    this.typewriterTimer?.remove(false);
    const stateAfterSkill = applyFinalBossSkill(this.state, Math.random);
    this.scene.start('BattleScene', {
      state: {
        ...stateAfterSkill,
        phase: stateAfterSkill.phase === 'defeat' || stateAfterSkill.phase === 'forcedSwitch'
          ? stateAfterSkill.phase
          : 'battle',
      },
    });
  }
}

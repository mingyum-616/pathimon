import Phaser from 'phaser';
import { playIntroBgm, queueIntroBgm } from '../audio/introBgm';
import { APP_HEIGHT, APP_WIDTH, COLORS } from '../game/constants';
import type { RunMode, VisualStyle } from '../types/game';
import { addLabel, addSelectedBadge, applySelectionStyle, drawPanel } from '../ui/draw';
import { TEXT } from '../ui/typography';
import {
  modeSelectButtonOptions,
  resolveModeSelectChoice,
  shouldStartRun,
  type ModeSelectChoice,
  type ModeSelectOption,
} from '../ui/modeSelectUi';
import { destroySceneChildren } from '../ui/sceneCleanup';
import { keyboardCommand } from '../ui/keyboard';

const SELECTED_FILL = 0x4a405d;
const ACTIVE_LINE = 0x72d6ff;
const MODE_BUTTON_WIDTH = 350;
const MODE_BUTTON_HEIGHT = 116;
const STYLE_BUTTON_WIDTH = MODE_BUTTON_WIDTH;
const STYLE_BUTTON_HEIGHT = 54;

export class ModeSelectScene extends Phaser.Scene {
  private choice: ModeSelectChoice = {};
  private optionCursor = 0;
  private startCursor = false;
  private starting = false;

  constructor() {
    super('ModeSelectScene');
  }

  preload(): void {
    queueIntroBgm(this);
  }

  create(): void {
    this.choice = {};
    this.optionCursor = 0;
    this.startCursor = false;
    this.starting = false;
    playIntroBgm(this);
    this.input.keyboard?.on('keydown', this.handleKeyboardDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleKeyboardDown);
    });
    this.render();
  }

  private render(): void {
    destroySceneChildren(this);
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, COLORS.ink).setOrigin(0);
    drawPanel(this, 96, 48, 832, 480);
    this.add.rectangle(122, 76, 6, 64, ACTIVE_LINE).setOrigin(0);
    addLabel(this, 146, 72, '모드 선택', TEXT.display);
    addLabel(this, 148, 116, '진행 방식과 디자인을 각각 하나씩 고르세요.', TEXT.body).setColor(COLORS.muted);
    this.add.rectangle(142, 154, 740, 2, COLORS.border, 0.9).setOrigin(0);

    addLabel(this, 142, 174, '01  진행 방식', TEXT.label).setColor('#72d6ff');
    addLabel(this, 142, 366, '02  디자인', TEXT.label).setColor('#72d6ff');

    const options = modeSelectButtonOptions();
    options.slice(0, 2).forEach((option, index) => {
      this.createModeButton(142 + index * 390, 202, option, index);
    });
    options.slice(2).forEach((option, index) => {
      this.createStyleButton(142 + index * 390, 402, option, index + 2);
    });
    this.createStartButton();
  }

  private createModeButton(
    x: number,
    y: number,
    option: ModeSelectOption,
    index: number,
  ): void {
    const selected = this.isSelected(option);
    const focused = !this.startCursor && index === this.optionCursor;
    const rect = this.add.rectangle(x, y, MODE_BUTTON_WIDTH, MODE_BUTTON_HEIGHT).setOrigin(0);
    applySelectionStyle(rect, { focused, selected }, { idle: COLORS.panelDark, selected: SELECTED_FILL });
    this.configureButton(rect, option, index);

    this.add.rectangle(x + 16, y + 18, 5, 80, selected ? COLORS.selected : COLORS.borderStrong, 0.92).setOrigin(0);
    addLabel(this, x + 38, y + 16, option.label, TEXT.title).setWordWrapWidth(MODE_BUTTON_WIDTH - 128);
    option.lines.forEach((line, lineIndex) =>
      addLabel(this, x + 38, y + 56 + lineIndex * 21, line, TEXT.label)
        .setWordWrapWidth(MODE_BUTTON_WIDTH - 64),
    );
    if (selected) addSelectedBadge(this, x + MODE_BUTTON_WIDTH - 92, y + 14);
  }

  private createStyleButton(
    x: number,
    y: number,
    option: ModeSelectOption,
    index: number,
  ): void {
    const selected = this.isSelected(option);
    const focused = !this.startCursor && index === this.optionCursor;
    const rect = this.add.rectangle(x, y, STYLE_BUTTON_WIDTH, STYLE_BUTTON_HEIGHT).setOrigin(0);
    applySelectionStyle(rect, { focused, selected }, { idle: 0x211c2d, selected: SELECTED_FILL });
    this.configureButton(rect, option, index);

    this.add.rectangle(x + 16, y + 13, 8, 28, selected ? COLORS.selected : COLORS.borderStrong, 0.92).setOrigin(0);
    addLabel(this, x + 42, y + 14, option.label, TEXT.heading);
    if (selected) addSelectedBadge(this, x + STYLE_BUTTON_WIDTH - 92, y + 15);
  }

  private createStartButton(): void {
    const enabled = shouldStartRun(this.choice);
    const x = 340;
    const y = 468;
    const width = 344;
    const height = 42;
    const rect = this.add.rectangle(x, y, width, height, enabled ? 0x1d4a34 : 0x252331, 0.96)
      .setOrigin(0)
      .setStrokeStyle(this.startCursor && enabled ? 4 : 2, enabled ? COLORS.selected : COLORS.border, enabled ? 0.94 : 0.5);
    rect.setAlpha(enabled ? 1 : 0.6);

    if (enabled) {
      rect.setInteractive({ useHandCursor: true });
      rect.on('pointerover', () => {
        if (this.startCursor) return;
        this.startCursor = true;
        this.render();
      });
      rect.on('pointerdown', () => this.startRun());
    }

    const modeLabel = this.choice.mode === 'learning' ? '학습모드' : this.choice.mode === 'challenge' ? '도전모드' : '';
    const styleLabel = this.choice.visualStyle === 'character' ? '캐릭터풍' : this.choice.visualStyle === 'micro' ? '실사풍' : '';
    const selection = enabled ? `${modeLabel} · ${styleLabel}` : '두 항목을 선택해주세요';
    addLabel(this, x + 20, y + height / 2, '게임 시작', TEXT.heading).setOrigin(0, 0.5);
    addLabel(this, x + width - 18, y + height / 2, selection, TEXT.label)
      .setOrigin(1, 0.5)
      .setColor(enabled ? '#dff7ff' : '#c8c2d6');
  }

  // 호버는 포커스 테두리만 바꾼다. 예전처럼 채움까지 선택색으로 바꾸면
  // 마우스를 올린 카드가 이미 선택된 것처럼 보여 '게임 시작'이 왜 안 되는지 알 수 없다.
  private configureButton(
    rect: Phaser.GameObjects.Rectangle,
    option: ModeSelectOption,
    index: number,
  ): void {
    rect.setInteractive({ useHandCursor: true });
    rect.on('pointerover', () => {
      if (this.optionCursor === index && !this.startCursor) return;
      this.optionCursor = index;
      this.startCursor = false;
      this.render();
    });
    rect.on('pointerdown', () => {
      this.optionCursor = index;
      this.handleOptionPress(option);
    });
  }

  private handleOptionPress(option: ModeSelectOption): void {
    if (this.starting) return;
    this.choice = resolveModeSelectChoice(this.choice, option);
    this.startCursor = shouldStartRun(this.choice);
    this.render();
  }

  private handleKeyboardDown = (event: KeyboardEvent): void => {
    if (this.starting) return;
    const command = keyboardCommand(event.key);
    if (!command) return;
    event.preventDefault();

    if (command === 'left' || command === 'right') {
      if (this.startCursor) {
        this.startCursor = false;
        this.optionCursor = this.choice.visualStyle === 'micro' ? 3 : 2;
        this.render();
        return;
      }
      this.optionCursor = this.optionCursor % 2 === 0 ? this.optionCursor + 1 : this.optionCursor - 1;
      this.render();
      return;
    }
    if (command === 'up') {
      if (this.startCursor) {
        this.startCursor = false;
        this.optionCursor = this.choice.visualStyle === 'micro' ? 3 : 2;
      } else {
        this.optionCursor = (this.optionCursor + 2) % 4;
      }
      this.render();
      return;
    }
    if (command === 'down') {
      if (this.optionCursor >= 2 && shouldStartRun(this.choice)) {
        this.startCursor = true;
      } else {
        this.optionCursor = (this.optionCursor + 2) % 4;
      }
      this.render();
      return;
    }
    if (command === 'confirm' && this.startCursor) {
      this.startRun();
      return;
    }
    if (command === 'confirm') {
      const option = modeSelectButtonOptions()[this.optionCursor];
      if (option) this.handleOptionPress(option);
    }
  };

  private startRun(): void {
    if (this.starting || !shouldStartRun(this.choice)) return;
    this.starting = true;
    const mode: RunMode = this.choice.mode;
    const visualStyle: VisualStyle = this.choice.visualStyle;
    this.scene.start('StarterSelectScene', { mode, visualStyle });
  }

  private isSelected(option: ModeSelectOption): boolean {
    return option.kind === 'mode'
      ? this.choice.mode === option.value
      : this.choice.visualStyle === option.value;
  }
}

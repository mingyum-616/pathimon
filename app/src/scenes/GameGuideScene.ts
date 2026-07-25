import Phaser from 'phaser';
import { playIntroBgm, queueIntroBgm } from '../audio/introBgm';
import { APP_HEIGHT, APP_WIDTH, COLORS } from '../game/constants';
import { addBoxLabel, addLabel, drawPanel } from '../ui/draw';
import {
  gameGuideContent,
  gameGuideGlossaryLine,
  gameGuideLineLayout,
  gameGuideMultiplierChips,
  gameGuidePageCount,
  gameGuidePageSections,
} from '../ui/gameGuideUi';
import { TEXT } from '../ui/typography';
import { destroySceneChildren } from '../ui/sceneCleanup';
import { keyboardCommand } from '../ui/keyboard';

export class GameGuideScene extends Phaser.Scene {
  constructor() {
    super('GameGuideScene');
  }

  preload(): void {
    queueIntroBgm(this);
  }

  create(): void {
    playIntroBgm(this);
    this.input.keyboard?.on('keydown', this.handleKeyboardDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleKeyboardDown);
    });
    this.render();
  }

  private page = 0;

  private handleKeyboardDown = (event: KeyboardEvent): void => {
    const command = keyboardCommand(event.key);
    if (command === 'confirm') {
      event.preventDefault();
      this.advance();
      return;
    }

    if (command === 'left' && this.page > 0) {
      event.preventDefault();
      this.page -= 1;
      this.render();
    }

    if (command === 'right' && this.page < gameGuidePageCount() - 1) {
      event.preventDefault();
      this.page += 1;
      this.render();
    }
  };

  private advance(): void {
    if (this.page < gameGuidePageCount() - 1) {
      this.page += 1;
      this.render();
      return;
    }

    this.scene.start('ModeSelectScene');
  }

  private render(): void {
    destroySceneChildren(this);
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, COLORS.ink).setOrigin(0);
    this.add.rectangle(0, 0, APP_WIDTH, 96, 0x141724, 0.9).setOrigin(0);

    const content = gameGuideContent();
    addLabel(this, 56, 18, content.title, TEXT.display);
    addLabel(this, 58, 56, content.subtitle, TEXT.label).setColor(COLORS.muted);
    addLabel(this, 58, 74, gameGuideGlossaryLine(), TEXT.caption).setColor(COLORS.muted);
    this.drawMultiplierChips();

    drawPanel(this, 56, 106, 912, 392).setAlpha(0.96);
    const lineLayout = gameGuideLineLayout();
    const pageCount = gameGuidePageCount(content);
    gameGuidePageSections(this.page, content).forEach((section, sectionIndex) => {
      const column = sectionIndex % 2;
      const row = Math.floor(sectionIndex / 2);
      const x = 92 + column * 442;
      const y = 130 + row * 182;

      addLabel(this, x, y, section.title, TEXT.heading).setColor('#9fd8ff');
      // 줄마다 실제 높이를 재서 쌓는다. 고정 간격이면 두 줄로 접힌 문단 뒤만 간격이 붙어 보인다.
      let lineY = y + 32;
      section.lines.forEach((line) => {
        const label = addBoxLabel(this, x, lineY, line, {
          width: 368,
          height: lineLayout.lineHeight - 4,
          size: TEXT.body,
          maxLines: lineLayout.maxLines,
        }).setLineSpacing(4);
        lineY += label.height + 10;
      });
    });

    if (pageCount > 1) {
      addLabel(this, 56, 530, `${this.page + 1} / ${pageCount} 페이지`, TEXT.label).setColor(COLORS.muted);
    }

    if (this.page > 0) {
      this.createFooterButton(560, '이전', () => {
        this.page -= 1;
        this.render();
      });
    }

    const isLastPage = this.page >= pageCount - 1;
    this.createFooterButton(772, isLastPage ? content.continueLabel : '다음', () => this.advance());
  }

  private drawMultiplierChips(): void {
    const tones = {
      strong: COLORS.chipStrong,
      medium: COLORS.chipMedium,
      neutral: COLORS.chipNeutral,
    } as const;
    gameGuideMultiplierChips().forEach((chip, index) => {
      const x = 610 + index * 122;
      this.add.rectangle(x, 32, 114, 30, tones[chip.tone], 0.95).setOrigin(0);
      addLabel(this, x + 57, 47, chip.label, TEXT.caption).setOrigin(0.5);
    });
  }

  private createFooterButton(x: number, label: string, onClick: () => void): void {
    const rect = this.add.rectangle(x, 516, 164, 44, COLORS.panelDark).setOrigin(0);
    rect.setStrokeStyle(2, COLORS.border);
    rect.setInteractive({ useHandCursor: true });
    rect.on('pointerover', () => rect.setFillStyle(0x4a405d));
    rect.on('pointerout', () => rect.setFillStyle(COLORS.panelDark));
    rect.on('pointerdown', onClick);
    addLabel(this, x + 82, 538, label, TEXT.body).setOrigin(0.5);
  }
}

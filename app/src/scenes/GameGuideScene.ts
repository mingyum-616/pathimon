import Phaser from 'phaser';
import { playIntroBgm, queueIntroBgm } from '../audio/introBgm';
import { APP_HEIGHT, APP_WIDTH, COLORS } from '../game/constants';
import { addBoxLabel, addLabel, drawPanel } from '../ui/draw';
import { gameGuideContent, gameGuideLineLayout } from '../ui/gameGuideUi';
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

  private handleKeyboardDown = (event: KeyboardEvent): void => {
    const command = keyboardCommand(event.key);
    if (command === 'confirm') {
      event.preventDefault();
      this.scene.start('ModeSelectScene');
    }
  };

  private render(): void {
    destroySceneChildren(this);
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, COLORS.ink).setOrigin(0);
    this.add.rectangle(0, 0, APP_WIDTH, 78, 0x141724, 0.9).setOrigin(0);

    const content = gameGuideContent();
    addLabel(this, 56, 24, content.title, 30);
    addLabel(this, 226, 36, content.subtitle, 15).setAlpha(0.78);

    drawPanel(this, 56, 92, 912, 420).setAlpha(0.96);
    const lineLayout = gameGuideLineLayout();
    content.sections.forEach((section, sectionIndex) => {
      const column = sectionIndex % 2;
      const row = Math.floor(sectionIndex / 2);
      const x = 92 + column * 442;
      const y = 128 + row * 196;

      addLabel(this, x, y, section.title, 20);
      section.lines.forEach((line, lineIndex) => {
        addBoxLabel(this, x, y + 36 + lineIndex * lineLayout.lineHeight, line, {
          width: 368,
          height: lineLayout.lineHeight - 4,
          size: 14,
          minSize: 11,
          maxLines: lineLayout.maxLines,
        }).setLineSpacing(4);
      });
    });

    this.createContinueButton(content.continueLabel);
  }

  private createContinueButton(label: string): void {
    const rect = this.add.rectangle(772, 520, 164, 42, COLORS.panelDark).setOrigin(0);
    rect.setStrokeStyle(2, COLORS.line);
    rect.setInteractive({ useHandCursor: true });
    rect.on('pointerover', () => rect.setFillStyle(0x4a405d));
    rect.on('pointerout', () => rect.setFillStyle(COLORS.panelDark));
    rect.on('pointerdown', () => this.scene.start('ModeSelectScene'));
    addLabel(this, 854, 541, label, 18).setOrigin(0.5);
  }
}

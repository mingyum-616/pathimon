import Phaser from 'phaser';
import { playIntroBgm, queueIntroBgm } from '../audio/introBgm';
import { APP_HEIGHT, APP_WIDTH } from '../game/constants';
import { addLabel } from '../ui/draw';
import { keyboardCommand } from '../ui/keyboard';

export class PostDisclaimerStoryScene extends Phaser.Scene {
  private advancing = false;
  private canAdvance = false;
  private advanceEnabledAt = 0;

  constructor() {
    super('PostDisclaimerStoryScene');
  }

  preload(): void {
    queueIntroBgm(this);
  }

  create(): void {
    this.advancing = false;
    this.canAdvance = false;
    this.advanceEnabledAt = this.time.now + 1200;
    playIntroBgm(this);
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, 0x000000, 1).setOrigin(0);

    this.time.delayedCall(1000, () => {
      const line = addLabel(this, APP_WIDTH / 2, APP_HEIGHT - 122, '... 일어나세요..!', 28)
        .setOrigin(0.5)
        .setAlign('center')
        .setAlpha(0);

       this.tweens.add({
         targets: line,
         alpha: 1,
         duration: 260,
         ease: 'Sine.easeOut',
       });
       addLabel(this, APP_WIDTH / 2, APP_HEIGHT - 72, '클릭하여 계속', 15)
         .setOrigin(0.5)
         .setAlign('center')
         .setAlpha(0.7);
       this.canAdvance = true;
    });
    this.input.on('pointerdown', this.advanceToGuide, this);
    this.input.keyboard?.on('keydown', this.handleKeyboardDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('pointerdown', this.advanceToGuide, this);
      this.input.keyboard?.off('keydown', this.handleKeyboardDown);
    });
  }

  private handleKeyboardDown = (event: KeyboardEvent): void => {
    const command = keyboardCommand(event.key);
    if (command === 'confirm' && this.canAdvance && this.time.now >= this.advanceEnabledAt) {
      event.preventDefault();
      this.advanceToGuide();
    }
  };

  private advanceToGuide(): void {
    if (this.advancing || !this.canAdvance || this.time.now < this.advanceEnabledAt) {
      return;
    }

    this.advancing = true;
    this.input.off('pointerdown', this.advanceToGuide, this);
    this.children.each((child) => {
      if (child instanceof Phaser.GameObjects.Text) {
        child.setAlpha(0);
      }
    });
    this.time.delayedCall(1000, () => this.scene.start('GameGuideScene'));
  }
}

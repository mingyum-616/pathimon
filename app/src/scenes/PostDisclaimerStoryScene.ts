import Phaser from 'phaser';
import { playIntroBgm, queueIntroBgm } from '../audio/introBgm';
import { APP_HEIGHT, APP_WIDTH } from '../game/constants';
import { addLabel } from '../ui/draw';
import { keyboardCommand } from '../ui/keyboard';
import { advanceTypewriter } from '../ui/typewriter';

const TYPEWRITER_INTERVAL_MS = 24;
const WAKE_UP_LINES = ['... 일어나세요..!'];

export class PostDisclaimerStoryScene extends Phaser.Scene {
  private advancing = false;
  private canAdvance = false;
  private advanceEnabledAt = 0;
  private lineIndex = 0;
  private visibleCharacters = 0;
  private dialogueText?: Phaser.GameObjects.Text;
  private typewriterTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super('PostDisclaimerStoryScene');
  }

  preload(): void {
    queueIntroBgm(this);
  }

  create(): void {
    this.advancing = false;
    this.canAdvance = false;
    this.lineIndex = 0;
    this.visibleCharacters = 0;
    this.advanceEnabledAt = this.time.now + 1200;
    playIntroBgm(this);
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, 0x000000, 1).setOrigin(0);

    this.time.delayedCall(1000, () => {
      this.dialogueText = addLabel(this, APP_WIDTH / 2, APP_HEIGHT - 122, '', 28)
        .setOrigin(0.5)
        .setAlign('center')
        .setAlpha(0);

       this.tweens.add({
         targets: this.dialogueText,
         alpha: 1,
         duration: 260,
         ease: 'Sine.easeOut',
       });
       addLabel(this, APP_WIDTH / 2, APP_HEIGHT - 72, '클릭하여 계속', 15)
         .setOrigin(0.5)
         .setAlign('center')
         .setAlpha(0.7);
       this.canAdvance = true;
       this.startTyping();
    });
    this.input.on('pointerdown', this.advanceToGuide, this);
    this.input.keyboard?.on('keydown', this.handleKeyboardDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.stopTyping();
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

    const advance = advanceTypewriter(WAKE_UP_LINES, this.lineIndex, this.visibleCharacters);
    this.lineIndex = advance.lineIndex;
    this.visibleCharacters = advance.visibleCharacters;

    if (advance.action === 'reveal') {
      this.stopTyping();
      this.dialogueText?.setText(WAKE_UP_LINES[this.lineIndex] ?? '');
      return;
    }

    this.advancing = true;
    this.stopTyping();
    this.input.off('pointerdown', this.advanceToGuide, this);
    this.children.each((child) => {
      if (child instanceof Phaser.GameObjects.Text) {
        child.setAlpha(0);
      }
    });
    this.time.delayedCall(1000, () => this.scene.start('GameGuideScene'));
  }

  private startTyping(): void {
    this.stopTyping();
    const line = WAKE_UP_LINES[this.lineIndex] ?? '';
    this.dialogueText?.setText(line.slice(0, this.visibleCharacters));
    if (this.visibleCharacters >= line.length) return;

    this.typewriterTimer = this.time.addEvent({
      delay: TYPEWRITER_INTERVAL_MS,
      loop: true,
      callback: () => {
        this.visibleCharacters = Math.min(line.length, this.visibleCharacters + 1);
        this.dialogueText?.setText(line.slice(0, this.visibleCharacters));
        if (this.visibleCharacters >= line.length) {
          this.stopTyping();
        }
      },
    });
  }

  private stopTyping(): void {
    this.typewriterTimer?.remove(false);
    this.typewriterTimer = undefined;
  }
}

import Phaser from 'phaser';
import { APP_HEIGHT, APP_WIDTH, COLORS } from '../game/constants';
import { addLabel, drawPanel } from '../ui/draw';
import { disclaimerContent, type DisclaimerBlinkEffect } from '../ui/disclaimerUi';

export class DisclaimerScene extends Phaser.Scene {
  private advancing = false;
  private skipEnabledAt = 0;

  constructor() {
    super('DisclaimerScene');
  }

  create(): void {
    this.advancing = false;
    this.skipEnabledAt = this.time.now + 800;
    const content = disclaimerContent();

    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, 0x0e1118).setOrigin(0);
    drawPanel(this, 104, 118, 816, 324).setAlpha(0.96);
    addLabel(this, APP_WIDTH / 2, 160, content.title, 34)
      .setOrigin(0.5)
      .setAlign('center');

    content.lines.forEach((line, index) => {
      addLabel(this, 148, 218 + index * 48, line, 18)
        .setWordWrapWidth(728)
        .setLineSpacing(6)
        .setAlpha(0.92);
    });

    this.input.on('pointerdown', this.skipBlinkOut, this);
    this.input.keyboard?.on('keydown', this.skipBlinkOut, this);
    this.playBlinkOut(content.blinkEffect, () => this.skipBlinkOut());
  }

  private skipBlinkOut(): void {
    if (this.advancing || this.time.now < this.skipEnabledAt) return;

    this.advancing = true;
    this.input.off('pointerdown', this.skipBlinkOut, this);
    this.input.keyboard?.off('keydown', this.skipBlinkOut, this);
    this.time.removeAllEvents();
    this.tweens.killAll();
    this.scene.start('PostDisclaimerStoryScene');
  }

  private playBlinkOut(effect: DisclaimerBlinkEffect, onComplete: () => void): void {
    const curtainHeight = APP_HEIGHT / 2 + 6;
    const top = this.add.rectangle(0, 0, APP_WIDTH, curtainHeight, 0x000000, 1)
      .setOrigin(0, 0)
      .setDepth(1000)
      .setScale(1, 0.001);
    const bottom = this.add.rectangle(0, APP_HEIGHT, APP_WIDTH, curtainHeight, 0x000000, 1)
      .setOrigin(0, 1)
      .setDepth(1000)
      .setScale(1, 0.001);

    const tweenCurtains = (closed: boolean, duration: number, delay: number, after?: () => void): void => {
      this.time.delayedCall(delay, () => {
        this.tweens.add({
          targets: [top, bottom],
          scaleY: closed ? 1 : 0.001,
          duration,
          ease: closed ? 'Cubic.easeIn' : 'Cubic.easeOut',
          onComplete: after,
        });
      });
    };

    let delay = effect.initialHoldMs;
    effect.cycles.forEach((cycle) => {
      tweenCurtains(true, cycle.closeMs, delay);
      delay += cycle.closeMs + cycle.closedMs;
      tweenCurtains(false, cycle.openMs, delay);
      delay += cycle.openMs + cycle.openHoldMs;
    });

    tweenCurtains(true, effect.finalCloseMs, delay, () => {
      this.time.delayedCall(effect.finalHoldMs, onComplete);
    });
  }
}

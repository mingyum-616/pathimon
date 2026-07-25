import Phaser from 'phaser';
import { APP_HEIGHT, APP_WIDTH, COLORS } from '../game/constants';
import { addLabel, drawPanel } from '../ui/draw';
import { destroySceneChildren } from '../ui/sceneCleanup';
import { keyboardCommand } from '../ui/keyboard';
import { storyPages } from '../ui/storyUi';
import { TEXT } from '../ui/typography';

type BgmPreloadSceneHandle = Phaser.Scene & { stopPathimonScreensaver?: () => void };

const STORY_IMAGE_TOP = 86;
const STORY_IMAGE_BOTTOM = 386;

export class StoryScene extends Phaser.Scene {
  private pageIndex = 0;
  private keyboardTarget: 'advance' | 'skip' = 'advance';

  constructor() {
    super('StoryScene');
  }

  preload(): void {
    storyPages().forEach((page) => {
      if (page.imagePath && !this.textures.exists(page.imagePath)) {
        this.load.image(page.imagePath, page.imagePath);
      }
    });
  }

  create(): void {
    this.pageIndex = 0;
    this.registry.set('introStoryComplete', false);
    if (!this.registry.get('battleBgmPreloadStarted')) {
      this.scene.launch('BgmPreloadScene');
    }
    this.keyboardTarget = 'advance';
    this.input.keyboard?.on('keydown', this.handleKeyboardDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleKeyboardDown);
    });
    this.render();
  }

  private render(): void {
    destroySceneChildren(this);
    this.input.off('pointerdown', this.handleScenePointerDown, this);
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, COLORS.ink).setOrigin(0);
    this.add.rectangle(0, 0, APP_WIDTH, STORY_IMAGE_TOP, 0x141724, 0.85).setOrigin(0);
    // 아래 띠를 대사 패널 위쪽에 딱 맞춰야 패널이 배경 경계에 걸치지 않는다.
    this.add.rectangle(0, STORY_IMAGE_BOTTOM, APP_WIDTH, APP_HEIGHT - STORY_IMAGE_BOTTOM, 0x141724, 0.9).setOrigin(0);

    const pages = storyPages();
    const page = pages[this.pageIndex];
    const centerY = (STORY_IMAGE_TOP + STORY_IMAGE_BOTTOM) / 2;
    const maxHeight = STORY_IMAGE_BOTTOM - STORY_IMAGE_TOP - 24;

    if (page.imagePath) {
      // 삽화 높이를 띠 사이로 묶어 캔버스 위쪽으로 잘려 나가지 않게 한다.
      if (page.imageFrame === 'wide') {
        const height = Math.min(248, maxHeight);
        this.add.image(APP_WIDTH / 2, centerY, page.imagePath).setOrigin(0.5).setDisplaySize(height * 2.5, height);
      } else {
        const size = Math.min(210, maxHeight);
        this.add.image(APP_WIDTH / 2, centerY, page.imagePath).setOrigin(0.5).setDisplaySize(size, size);
      }
    } else {
      this.add.rectangle(APP_WIDTH / 2, centerY, 520, 180, 0x352c48, 0.66).setOrigin(0.5);
      this.add.circle(APP_WIDTH / 2 - 132, centerY, 48, 0x73d8d5, 0.45);
      this.add.circle(APP_WIDTH / 2, centerY, 42, 0xf0d05c, 0.38);
      this.add.circle(APP_WIDTH / 2 + 132, centerY, 48, 0xcf5b7a, 0.42);
    }

    drawPanel(this, 88, 398, 848, 116).setAlpha(0.96);
    page.lines.forEach((line, index) => {
      addLabel(this, 124, 420 + index * 40, line, TEXT.heading)
        .setWordWrapWidth(776)
        .setLineSpacing(7);
    });

    this.createSkipButton();
    addLabel(this, 124, 528, `${this.pageIndex + 1} / ${pages.length}`, TEXT.label).setColor(COLORS.muted);
    addLabel(this, 936, 528, this.pageIndex >= pages.length - 1 ? '아무 곳이나 눌러 시작 ▶' : '아무 곳이나 눌러 계속 ▶', TEXT.label)
      .setOrigin(1, 0)
      .setColor(COLORS.muted);

    this.input.once('pointerdown', this.handleScenePointerDown, this);
  }

  private createSkipButton(): void {
    const rect = this.add.rectangle(876, 24, 108, 38, COLORS.panelDark).setOrigin(0);
    rect.setStrokeStyle(this.keyboardTarget === 'skip' ? 4 : 2, this.keyboardTarget === 'skip' ? COLORS.focus : COLORS.border);
    rect.setInteractive({ useHandCursor: true });
    rect.on('pointerover', () => rect.setFillStyle(0x4a405d));
    rect.on('pointerout', () => rect.setFillStyle(COLORS.panelDark));
    rect.on('pointerdown', () => this.finishStory());
    addLabel(this, 930, 43, '건너뛰기', TEXT.body).setOrigin(0.5);
  }

  private handleScenePointerDown(pointer: Phaser.Input.Pointer): void {
    const isSkipButton = pointer.x >= 876 && pointer.x <= 984 && pointer.y >= 24 && pointer.y <= 62;
    if (!isSkipButton) {
      this.advancePage();
    }
  }

  private handleKeyboardDown = (event: KeyboardEvent): void => {
    const command = keyboardCommand(event.key);
    if (!command) return;
    event.preventDefault();

    if (command === 'up' || command === 'left') {
      this.keyboardTarget = 'skip';
      this.render();
      return;
    }
    if (command === 'down' || command === 'right') {
      this.keyboardTarget = 'advance';
      this.render();
      return;
    }
    if (command === 'cancel') {
      this.finishStory();
      return;
    }
    if (command === 'confirm') {
      if (this.keyboardTarget === 'skip') {
        this.finishStory();
      } else {
        this.advancePage();
      }
    }
  };

  private finishStory(): void {
    this.registry.set('introStoryComplete', true);
    if (this.registry.get('battleBgmPreloadComplete')) {
      const preloadScene = this.scene.get('BgmPreloadScene') as BgmPreloadSceneHandle;
      preloadScene.stopPathimonScreensaver?.();
    }
    this.scene.start('DisclaimerScene');
  }

  private advancePage(): void {
    if (this.pageIndex >= storyPages().length - 1) {
      this.finishStory();
      return;
    }

    this.pageIndex += 1;
    this.render();
  }
}

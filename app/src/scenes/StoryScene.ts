import Phaser from 'phaser';
import { APP_HEIGHT, APP_WIDTH, COLORS } from '../game/constants';
import { addLabel, drawPanel } from '../ui/draw';
import { destroySceneChildren } from '../ui/sceneCleanup';
import { keyboardCommand } from '../ui/keyboard';
import { storyPages } from '../ui/storyUi';
import { advanceTypewriter } from '../ui/typewriter';
import { TEXT } from '../ui/typography';

type BgmPreloadSceneHandle = Phaser.Scene & { stopPathimonScreensaver?: () => void };

const STORY_IMAGE_TOP = 86;
const STORY_IMAGE_BOTTOM = 386;
const TYPEWRITER_INTERVAL_MS = 24;

export class StoryScene extends Phaser.Scene {
  private pageIndex = 0;
  private lineIndex = 0;
  private visibleCharacters = 0;
  private typewriterTimer?: Phaser.Time.TimerEvent;
  private dialogueText?: Phaser.GameObjects.Text;
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
    this.lineIndex = 0;
    this.visibleCharacters = 0;
    this.registry.set('introStoryComplete', false);
    if (!this.registry.get('battleBgmPreloadStarted')) {
      this.scene.launch('BgmPreloadScene');
    }
    this.keyboardTarget = 'advance';
    this.input.on('pointerdown', this.handleScenePointerDown, this);
    this.input.keyboard?.on('keydown', this.handleKeyboardDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.stopTyping();
      this.input.off('pointerdown', this.handleScenePointerDown, this);
      this.input.keyboard?.off('keydown', this.handleKeyboardDown);
    });
    this.render();
  }

  private render(): void {
    this.stopTyping();
    destroySceneChildren(this);
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

    drawPanel(this, 88, 398, 848, 124).setAlpha(0.96);
    this.dialogueText = addLabel(this, 124, 414, '', TEXT.heading)
      .setWordWrapWidth(792)
      .setLineSpacing(6);

    this.createSkipButton();
    addLabel(this, 124, 528, `${this.pageIndex + 1} / ${pages.length}`, TEXT.label).setColor(COLORS.muted);
    addLabel(this, 936, 528, this.pageIndex >= pages.length - 1 ? '아무 곳이나 눌러 시작 ▶' : '아무 곳이나 눌러 계속 ▶', TEXT.label)
      .setOrigin(1, 0)
      .setColor(COLORS.muted);

    this.startTyping();
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
      this.advanceDialogue();
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
        this.advanceDialogue();
      }
    }
  };

  private finishStory(): void {
    this.stopTyping();
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
    this.lineIndex = 0;
    this.visibleCharacters = 0;
    this.render();
  }

  private startTyping(): void {
    this.stopTyping();
    this.updateDialogueText();
    const line = storyPages()[this.pageIndex]?.lines[this.lineIndex] ?? '';
    if (this.visibleCharacters >= line.length) return;

    this.typewriterTimer = this.time.addEvent({
      delay: TYPEWRITER_INTERVAL_MS,
      loop: true,
      callback: () => {
        this.visibleCharacters = Math.min(line.length, this.visibleCharacters + 1);
        this.updateDialogueText();
        if (this.visibleCharacters >= line.length) {
          this.stopTyping();
        }
      },
    });
  }

  private advanceDialogue(): void {
    const lines = storyPages()[this.pageIndex]?.lines ?? [];
    const advance = advanceTypewriter(lines, this.lineIndex, this.visibleCharacters);
    this.lineIndex = advance.lineIndex;
    this.visibleCharacters = advance.visibleCharacters;

    if (advance.action === 'reveal') {
      this.stopTyping();
      this.updateDialogueText();
      return;
    }

    if (advance.action === 'next') {
      this.startTyping();
      return;
    }

    this.advancePage();
  }

  private updateDialogueText(): void {
    const lines = storyPages()[this.pageIndex]?.lines ?? [];
    const completedLines = lines.slice(0, this.lineIndex);
    const currentLine = (lines[this.lineIndex] ?? '').slice(0, this.visibleCharacters);
    this.dialogueText?.setText([...completedLines, currentLine].join('\n'));
  }

  private stopTyping(): void {
    this.typewriterTimer?.remove(false);
    this.typewriterTimer = undefined;
  }
}

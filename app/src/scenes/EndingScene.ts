import Phaser from 'phaser';
import {
  clearEndingFeedbackDraft,
  loadEndingFeedbackDraft,
  saveEndingFeedbackDraft,
  submitEndingFeedback,
} from '../feedback/endingFeedback';
import { APP_HEIGHT, APP_WIDTH, COLORS } from '../game/constants';
import type { RunState } from '../types/game';
import { addBoxLabel, addLabel, drawPanel } from '../ui/draw';
import {
  mountEndingFeedbackTextarea,
  type EndingFeedbackTextareaHandle,
} from '../ui/endingFeedbackOverlay';
import { EndingFeedbackSubmissionEpoch } from '../ui/endingFeedbackSubmission';
import { ENDING_PAGES, endingRosterEntries, type EndingRosterEntry } from '../ui/endingUi';
import { keyboardCommand } from '../ui/keyboard';
import { advanceTypewriter } from '../ui/typewriter';
import { TEXT } from '../ui/typography';

interface EndingSceneData {
  state?: RunState;
}

type EndingPage =
  | { page: 'congratulations' }
  | { page: 'roster' }
  | { page: 'epilogue' }
  | { page: 'feedback' }
  | { page: 'thanks' };

type FeedbackButton = 'send' | 'skip';

const TYPEWRITER_INTERVAL_MS = 24;
const RETRY_MESSAGE = '전송하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.';
const STAR_X = 380;
const STAR_GAP = 66;

export class EndingScene extends Phaser.Scene {
  private state!: RunState;
  private roster: EndingRosterEntry[] = [];
  private page: EndingPage = { page: 'congratulations' };
  private dialogueLines: string[] = [];
  private dialogueIndex = 0;
  private visibleCharacters = 0;
  private dialogueText?: Phaser.GameObjects.Text;
  private typewriterTimer?: Phaser.Time.TimerEvent;
  private textarea?: EndingFeedbackTextareaHandle;
  private draft = loadEndingFeedbackDraft();
  private feedbackButton: FeedbackButton = 'send';
  private feedbackNotice?: string;
  private submitting = false;
  private submission = new EndingFeedbackSubmissionEpoch();
  private cleanedUp = false;

  constructor() {
    super('EndingScene');
  }

  init(data: EndingSceneData = {}): void {
    if (!data.state) {
      throw new Error('EndingScene requires state');
    }

    this.state = data.state;
    this.roster = endingRosterEntries({
      party: this.state.party,
      visualStyle: this.state.visualStyle,
    });
    this.page = { page: 'congratulations' };
    this.dialogueLines = [];
    this.dialogueIndex = 0;
    this.visibleCharacters = 0;
    this.draft = loadEndingFeedbackDraft();
    this.feedbackButton = 'send';
    this.feedbackNotice = undefined;
    this.submitting = false;
    this.cleanedUp = false;
  }

  preload(): void {
    for (const entry of this.roster) {
      if (!this.textures.exists(entry.assetPath)) {
        this.load.image(entry.assetPath, entry.assetPath);
      }
    }
  }

  create(): void {
    this.render();
    this.input.on('pointerdown', this.handleScenePointerDown, this);
    this.input.keyboard?.on('keydown', this.handleKeyboardDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
  }

  private render(): void {
    this.stopTyping();
    this.children.removeAll(true);
    this.dialogueText = undefined;
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, COLORS.ink).setOrigin(0);

    switch (this.page.page) {
      case 'congratulations':
        this.drawCongratulations();
        return;
      case 'roster':
        this.drawRosterPage();
        return;
      case 'epilogue':
        this.drawEpiloguePage();
        return;
      case 'feedback':
        this.drawFeedbackPage();
        return;
      case 'thanks':
        this.drawThanksPage();
    }
  }

  private drawCongratulations(): void {
    this.add.rectangle(0, 0, APP_WIDTH, 82, 0x121927).setOrigin(0);
    addLabel(this, APP_WIDTH / 2, 154, 'CONGRATULATIONS!', 42)
      .setOrigin(0.5)
      .setColor('#ffd56a');
    addBoxLabel(this, 192, 232, '100층을 넘어 패시몬 세계를 지켜냈습니다.', {
      align: 'center',
      height: 54,
      maxLines: 2,
      minSize: TEXT.body,
      size: TEXT.heading,
      width: 640,
    });
    drawPanel(this, 244, 354, 536, 78).setAlpha(0.9);
    addLabel(this, APP_WIDTH / 2, 392, '▼', TEXT.heading).setOrigin(0.5).setAlpha(0.8);
  }

  private drawRosterPage(): void {
    this.add.rectangle(0, 0, APP_WIDTH, 72, 0x121927).setOrigin(0);
    addLabel(this, 52, 21, '함께한 패시몬', TEXT.title);
    this.drawRoster();
    this.drawDialoguePanel();
    this.startTyping();
  }

  private drawEpiloguePage(): void {
    this.add.rectangle(0, 0, APP_WIDTH, 72, 0x121927).setOrigin(0);
    addLabel(this, 52, 21, '그리고...', TEXT.title);
    drawPanel(this, 112, 150, 800, 172).setAlpha(0.94);
    addLabel(this, APP_WIDTH / 2, 236, '패시몬 세계의 모험은 끝났지만', TEXT.heading)
      .setOrigin(0.5)
      .setColor('#d8cde6');
    this.drawDialoguePanel();
    this.startTyping();
  }

  private drawRoster(): void {
    const count = this.roster.length;
    const startX = count > 1 ? 126 : APP_WIDTH / 2;
    const gap = count > 1 ? 772 / (count - 1) : 0;

    this.roster.forEach((entry, index) => {
      const x = startX + gap * index;
      if (this.textures.exists(entry.assetPath)) {
        const frame = this.textures.getFrame(entry.assetPath);
        const crop = entry.spriteCrop;
        const scale = Math.min(
          106 / Math.max(1, crop?.width ?? frame?.width ?? 96),
          106 / Math.max(1, crop?.height ?? frame?.height ?? 96),
        );
        const sprite = this.add.image(x, 248, entry.assetPath);
        if (crop) {
          sprite.setCrop(crop.frontX, 0, crop.width, crop.height);
        }
        sprite.setScale(scale);
      } else {
        this.add.circle(x, 248, 42, COLORS.panelDark).setStrokeStyle(2, COLORS.border);
      }
      addBoxLabel(this, x - 60, 318, entry.name, {
        align: 'center',
        height: 36,
        maxLines: 2,
        minSize: TEXT.caption,
        size: TEXT.label,
        width: 120,
      });
    });
  }

  private drawDialoguePanel(): void {
    drawPanel(this, 54, 390, 916, 140).setAlpha(0.98);
    this.dialogueText = addBoxLabel(this, 82, 422, '', {
      height: 70,
      maxLines: 2,
      minSize: TEXT.body,
      size: TEXT.heading,
      width: 850,
    });
    addLabel(this, 936, 500, '▼', TEXT.label).setOrigin(1, 0).setAlpha(0.72);
  }

  private drawFeedbackPage(): void {
    this.add.rectangle(0, 0, APP_WIDTH, 72, 0x121927).setOrigin(0);
    addLabel(this, APP_WIDTH / 2, 24, '패시몬은 어떠셨나요?', TEXT.title).setOrigin(0.5);

    for (let index = 0; index < 5; index += 1) {
      const selected = index < this.draft.rating;
      const star = addLabel(this, STAR_X + STAR_GAP * index, 106, selected ? '★' : '☆', 42)
        .setOrigin(0.5)
        .setColor(selected ? '#ffd56a' : '#d8cde6');
      if (!this.submitting) {
        star.setInteractive({ useHandCursor: true });
        star.on('pointerdown', () => this.selectRating(index + 1));
      }
    }
    addLabel(this, APP_WIDTH / 2, 166, `${this.draft.rating}/5`, TEXT.label)
      .setOrigin(0.5)
      .setAlpha(0.88);

    if (!this.textarea) {
      this.textarea = mountEndingFeedbackTextarea({
        canvas: this.sys.game.canvas,
        value: this.draft.message,
        onInput: (message) => {
          if (this.submitting) return;
          this.draft = { ...this.draft, message };
          saveEndingFeedbackDraft(this.draft);
        },
      });
    }
    this.textarea?.setDisabled(this.submitting);

    if (this.feedbackNotice) {
      addBoxLabel(this, 136, 368, this.feedbackNotice, {
        align: 'center',
        color: '#ffd56a',
        height: 38,
        maxLines: 2,
        minSize: TEXT.caption,
        size: TEXT.label,
        width: 752,
      });
    }

    const sendDisabled = this.draft.rating <= 0 || this.submitting;
    this.drawFeedbackButton(216, 456, 280, 52, this.feedbackNotice ? '다시 보내기' : '보내기', 'send', sendDisabled);
    this.drawFeedbackButton(528, 456, 280, 52, '건너뛰기', 'skip', false);
  }

  private drawFeedbackButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    button: FeedbackButton,
    disabled: boolean,
  ): void {
    const selected = this.feedbackButton === button;
    const fill = disabled ? COLORS.panelDark : selected ? COLORS.selected : COLORS.panel;
    const rect = this.add.rectangle(x, y, width, height, fill).setOrigin(0);
    rect.setStrokeStyle(selected ? 3 : 2, selected ? COLORS.focus : COLORS.border);
    if (!disabled) {
      rect.setInteractive({ useHandCursor: true });
      rect.on('pointerdown', () => this.activateFeedbackButton(button));
    } else {
      rect.setAlpha(0.52);
    }
    addLabel(this, x + width / 2, y + height / 2, label, TEXT.body).setOrigin(0.5);
  }

  private drawThanksPage(): void {
    addLabel(this, APP_WIDTH / 2, 210, '피드백을 보내주셔서 감사합니다.', TEXT.title).setOrigin(0.5);
    this.drawFeedbackButton(372, 338, 280, 52, '처음으로', 'skip', false);
  }

  private handleScenePointerDown(): void {
    if (this.page.page === 'congratulations' || this.page.page === 'roster' || this.page.page === 'epilogue') {
      this.advanceDialogue();
    }
  }

  private handleKeyboardDown = (event: KeyboardEvent): void => {
    if (this.isFeedbackTextareaFocused()) return;

    const command = keyboardCommand(event.key);
    if (!command) return;

    if (this.page.page === 'feedback') {
      if (command === 'left' || command === 'right') {
        event.preventDefault();
        this.selectRating(this.draft.rating + (command === 'left' ? -1 : 1));
      } else if (command === 'up' || command === 'down') {
        event.preventDefault();
        this.feedbackButton = this.feedbackButton === 'send' ? 'skip' : 'send';
        this.render();
      } else if (command === 'confirm') {
        event.preventDefault();
        this.activateFeedbackButton(this.feedbackButton);
      }
      return;
    }

    if (this.page.page === 'thanks') {
      if (command === 'confirm') {
        event.preventDefault();
        this.returnToTitle();
      }
      return;
    }

    if (command === 'confirm') {
      event.preventDefault();
      this.advanceDialogue();
    }
  };

  private isFeedbackTextareaFocused(): boolean {
    return typeof document !== 'undefined'
      && document.activeElement?.getAttribute('data-ending-feedback-textarea') === 'true';
  }

  private advanceDialogue(): void {
    if (this.page.page === 'congratulations') {
      this.showDialoguePage('roster');
      return;
    }
    if (this.page.page !== 'roster' && this.page.page !== 'epilogue') return;

    const advance = advanceTypewriter(this.dialogueLines, this.dialogueIndex, this.visibleCharacters);
    this.dialogueIndex = advance.lineIndex;
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
    if (this.page.page === 'roster') {
      this.showDialoguePage('epilogue');
      return;
    }
    this.page = { page: 'feedback' };
    this.render();
  }

  private showDialoguePage(page: 'roster' | 'epilogue'): void {
    this.page = { page };
    this.dialogueLines = page === 'roster' ? [...ENDING_PAGES.roster] : [...ENDING_PAGES.epilogue];
    this.dialogueIndex = 0;
    this.visibleCharacters = 0;
    this.render();
  }

  private startTyping(): void {
    this.stopTyping();
    this.updateDialogueText();
    const line = this.dialogueLines[this.dialogueIndex] ?? '';
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

  private stopTyping(): void {
    this.typewriterTimer?.remove(false);
    this.typewriterTimer = undefined;
  }

  private updateDialogueText(): void {
    const completedLines = this.dialogueLines.slice(0, this.dialogueIndex);
    const currentLine = this.dialogueLines[this.dialogueIndex] ?? '';
    this.dialogueText?.setText([...completedLines, currentLine.slice(0, this.visibleCharacters)].join('\n'));
  }

  private selectRating(rating: number): void {
    if (this.submitting) return;
    const nextRating = Math.min(5, Math.max(0, rating));
    if (nextRating === this.draft.rating) return;
    this.draft = { ...this.draft, rating: nextRating };
    saveEndingFeedbackDraft(this.draft);
    this.render();
  }

  private activateFeedbackButton(button: FeedbackButton): void {
    if (button === 'send') {
      void this.sendFeedback();
      return;
    }
    this.skipFeedback();
  }

  private async sendFeedback(): Promise<void> {
    if (this.draft.rating <= 0 || this.submitting) return;

    const draft = { ...this.draft };
    saveEndingFeedbackDraft(draft);
    if (navigator.onLine === false) {
      this.feedbackNotice = RETRY_MESSAGE;
      this.render();
      return;
    }

    this.submitting = true;
    const request = this.submission.begin();
    this.render();
    const result = await submitEndingFeedback(draft);
    if (this.cleanedUp || !this.submission.isCurrent(request)) return;

    this.submitting = false;
    if (result.ok) {
      clearEndingFeedbackDraft();
      this.destroyTextarea();
      this.page = { page: 'thanks' };
      this.render();
      return;
    }

    saveEndingFeedbackDraft(this.draft);
    this.feedbackNotice = RETRY_MESSAGE;
    this.render();
  }

  private skipFeedback(): void {
    this.submission.invalidate();
    this.submitting = false;
    clearEndingFeedbackDraft();
    this.destroyTextarea();
    this.scene.start('TitleScene');
  }

  private returnToTitle(): void {
    this.submission.invalidate();
    this.destroyTextarea();
    this.scene.start('TitleScene');
  }

  private destroyTextarea(): void {
    this.textarea?.destroy();
    this.textarea = undefined;
  }

  private cleanup(): void {
    if (this.cleanedUp) return;
    this.cleanedUp = true;
    this.submission.invalidate();
    this.submitting = false;
    this.stopTyping();
    this.input.off('pointerdown', this.handleScenePointerDown, this);
    this.input.keyboard?.off('keydown', this.handleKeyboardDown);
    this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    this.events.off(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
    this.destroyTextarea();
  }
}

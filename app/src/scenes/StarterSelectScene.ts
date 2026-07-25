import Phaser from 'phaser';
import { playIntroBgm, queueIntroBgm, stopIntroBgm } from '../audio/introBgm';
import { MONSTERS, starterCandidateRoster } from '../data/monsters';
import { APP_HEIGHT, APP_WIDTH, COLORS } from '../game/constants';
import { createInitialRunState, enterBattle } from '../state/runState';
import type { MonsterData, RunMode, VisualStyle } from '../types/game';
import { addBoxLabel, addLabel, drawPanel } from '../ui/draw';
import { TEXT } from '../ui/typography';
import { capsuleIconPath, pathimonSpriteAssets } from '../ui/battleUi';
import {
  MAX_STARTER_SELECTIONS,
  addStarterSelection,
  canStartWithStarterSelection,
  pickStarterCandidates,
  starterCandidateRolls,
  starterCapsuleSlots,
  starterChoiceSummary,
  starterSelectCopy,
} from '../ui/starterSelectUi';
import { destroySceneChildren } from '../ui/sceneCleanup';

interface StarterSelectSceneData {
  bossRosterIds?: string[];
  mode?: RunMode;
  visualStyle?: VisualStyle;
}

const ACTIVE_LINE = 0x72d6ff;

export class StarterSelectScene extends Phaser.Scene {
  private candidates: MonsterData[] = [];
  private bossRosterIds?: string[];
  private mode: RunMode = 'challenge';
  private selectedIds: string[] = [];
  private slotCursor = 0;
  private startCursor = false;
  private visualStyle: VisualStyle = 'character';

  constructor() {
    super('StarterSelectScene');
  }

  init(data: StarterSelectSceneData = {}): void {
    const registryBossRosterIds = this.registry.get('bossRosterIds');
    this.bossRosterIds = data.bossRosterIds
      ?? (Array.isArray(registryBossRosterIds) ? [...registryBossRosterIds] : undefined);
    this.mode = data.mode ?? 'challenge';
    this.visualStyle = data.visualStyle ?? 'character';
    this.candidates = pickStarterCandidates(starterCandidateRoster(), starterCandidateRolls());
    this.selectedIds = [];
    this.slotCursor = 0;
    this.startCursor = false;
  }

  preload(): void {
    queueIntroBgm(this);
    this.queueImage(capsuleIconPath('universal'));
    this.candidates.forEach((monster) => {
      this.queueImage(pathimonSpriteAssets(monster, this.visualStyle).front);
    });
  }

  create(): void {
    playIntroBgm(this);
    this.input.keyboard?.on('keydown', this.handleKeyboardDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleKeyboardDown);
      destroySceneChildren(this);
    });
    this.render();
  }

  private queueImage(path: string): void {
    if (!this.textures.exists(path)) {
      this.load.image(path, path);
    }
  }

  private render(): void {
    destroySceneChildren(this);
    const copy = starterSelectCopy();
    const selected = this.candidates[this.slotCursor];

    this.drawBackground();
    addLabel(this, APP_WIDTH / 2, 32, copy.prompt, TEXT.display)
      .setOrigin(0.5)
      .setAlign('center')
      .setWordWrapWidth(760);

    this.drawCase();
    this.drawCaseGuide();
    this.drawCapsuleSlots();
    this.drawChoiceSummary(selected);
    this.drawSelectedParty(copy.selectedLabel);
    this.drawStartButton(copy.startLabel);
  }

  private drawBackground(): void {
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, 0x112417).setOrigin(0);
    for (let x = 0; x < APP_WIDTH; x += 46) {
      this.add.rectangle(x, 0, 18, APP_HEIGHT, 0x1f6a3f, 0.16).setOrigin(0);
      this.add.rectangle(x + 22, 0, 8, APP_HEIGHT, 0x54b86a, 0.12).setOrigin(0);
    }
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, 0x111722, 0.26).setOrigin(0);
  }

  private drawCase(): void {
    this.add.rectangle(210, 92, 604, 118, 0x2b1720).setOrigin(0).setStrokeStyle(6, 0x6d4b3a);
    this.add.rectangle(230, 112, 564, 76, 0x3d2330).setOrigin(0);
    this.add.rectangle(170, 210, 684, 178, 0x8c5a38).setOrigin(0).setStrokeStyle(6, 0xd6a36f);
    this.add.rectangle(192, 232, 640, 132, 0xc48a56).setOrigin(0);
    this.add.rectangle(218, 238, 588, 116, 0x6d432e, 0.42).setOrigin(0);
    this.add.rectangle(188, 386, 648, 26, 0x5a3728).setOrigin(0).setStrokeStyle(4, 0x2c1b18);
    this.add.rectangle(444, 404, 136, 22, 0xc08a6a).setOrigin(0).setStrokeStyle(4, 0x5c372b);
  }

  // 케이스 뚜껑이 비어 있어 죽은 공간처럼 보였다. 조작 안내를 그 안에 넣는다.
  private drawCaseGuide(): void {
    const chosen = this.selectedIds[0]
      ? MONSTERS.find((monster) => monster.id === this.selectedIds[0])?.name
      : undefined;
    addBoxLabel(this, 512, 126, chosen ? `${chosen} 선택 완료` : '캡슐을 눌러 함께 시작할 패시몬 1마리를 고르세요', {
      width: 544,
      height: 26,
      size: TEXT.body,
      maxLines: 1,
      align: 'center',
      origin: [0.5, 0],
      color: chosen ? '#9be7b4' : COLORS.muted,
    });
    addBoxLabel(this, 512, 154, '← → 로 이동, Enter 로 선택', {
      width: 544,
      height: 22,
      size: TEXT.caption,
      maxLines: 1,
      align: 'center',
      origin: [0.5, 0],
      color: COLORS.muted,
    });
  }

  private drawCapsuleSlots(): void {
    const capsulePath = capsuleIconPath('universal');
    starterCapsuleSlots().forEach((slot, index) => {
      const monster = this.candidates[index];
      if (!monster) return;
      const active = !this.startCursor && this.slotCursor === index;
      const chosen = this.selectedIds.includes(monster.id);
      if (active) {
        this.drawCursorMarker(slot.x, slot.markerY);
      }

      const spriteAssets = pathimonSpriteAssets(monster, this.visualStyle);
      const shadow = this.add.ellipse(slot.x, slot.y + 76, 104, 24, 0x12070b, 0.36);
      shadow.setStrokeStyle(3, chosen ? COLORS.selected : active ? ACTIVE_LINE : 0x4a2a2a, chosen || active ? 0.9 : 0.22);
      this.add.image(slot.x, slot.y + 4, spriteAssets.front)
        .setOrigin(0.5)
        .setDisplaySize(active ? 106 : 96, active ? 106 : 96);
      this.add.image(slot.x, slot.y + 78, capsulePath)
        .setOrigin(0.5)
        .setDisplaySize(active ? 58 : 52, active ? 58 : 52);

      // 선택 결과가 우측 패널 텍스트로만 바뀌면 어느 캡슐을 골랐는지 알기 어렵다.
      if (chosen) {
        this.add.rectangle(slot.x, slot.y + 10, 116, 116, COLORS.selected, 0.001)
          .setStrokeStyle(3, COLORS.selected, 0.95);
        const badge = this.add.circle(slot.x + 46, slot.y - 38, 15, COLORS.selected);
        addLabel(this, badge.x, badge.y, '✓', TEXT.body).setOrigin(0.5).setColor('#10231a');
      }

      const hit = this.add.rectangle(slot.x - 62, slot.y - 58, 124, 158, 0xffffff, 0.001).setOrigin(0);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        this.slotCursor = index;
        this.startCursor = false;
        this.selectCurrentStarter();
      });
    });
  }

  private drawChoiceSummary(monster: MonsterData): void {
    const summary = starterChoiceSummary(monster);
    drawPanel(this, 26, 438, 486, 112).setAlpha(0.96);
    addLabel(this, 50, 452, summary.title, TEXT.title).setWordWrapWidth(438);
    summary.lines.forEach((line, index) => {
      addLabel(this, 50, 488 + index * 20, line, TEXT.label)
        .setColor(COLORS.muted)
        .setWordWrapWidth(438);
    });
  }

  private drawSelectedParty(label: string): void {
    drawPanel(this, 532, 438, 268, 112).setAlpha(0.96);
    addLabel(this, 554, 452, `${label} ${this.selectedIds.length}/${MAX_STARTER_SELECTIONS}`, TEXT.heading)
      .setWordWrapWidth(224);
    const names = this.selectedIds.map((id) => MONSTERS.find((monster) => monster.id === id)?.name ?? id);
    addBoxLabel(this, 554, 490, names.length ? names.join(' / ') : '아직 고르지 않았습니다.', {
      width: 224,
      height: 44,
      size: TEXT.body,
      maxLines: 2,
      color: names.length ? COLORS.text : COLORS.muted,
    });
  }

  // 예전에는 케이스 그림 위에 떠 있어 버튼인지 장식인지 구분이 안 됐다.
  // 요약 패널과 같은 줄에 세워 두어 하단 행이 '정보 → 선택 → 시작'으로 읽히게 한다.
  private drawStartButton(label: string): void {
    const enabled = canStartWithStarterSelection(this.selectedIds);
    const x = 820;
    const y = 438;
    const width = 178;
    const height = 112;
    const active = this.startCursor && enabled;
    const rect = this.add.rectangle(x, y, width, height, enabled ? active ? 0x27664a : 0x1d4a34 : 0x252331).setOrigin(0);
    rect.setStrokeStyle(active ? 4 : 3, enabled ? COLORS.selected : COLORS.border, enabled ? 0.95 : 0.5);
    rect.setAlpha(enabled ? 1 : 0.6);
    if (enabled) {
      rect.setInteractive({ useHandCursor: true });
      rect.on('pointerdown', () => this.startRun());
    }

    addBoxLabel(this, x + width / 2, y + (enabled ? height / 2 : 40), label, {
      width: width - 24,
      height: 56,
      size: TEXT.heading,
      maxLines: 2,
      align: 'center',
      origin: [0.5, 0.5],
    }).setAlpha(enabled ? 1 : 0.7);
    if (!enabled) {
      addBoxLabel(this, x + width / 2, y + 74, '캡슐을 먼저 고르세요', {
        width: width - 24,
        height: 22,
        size: TEXT.caption,
        maxLines: 1,
        align: 'center',
        origin: [0.5, 0],
        color: COLORS.muted,
      });
    }
  }

  private drawCursorMarker(x: number, y: number): void {
    this.add.triangle(x, y, 0, 0, 20, 0, 10, 18, 0xffffff).setOrigin(0.5);
  }

  private handleKeyboardDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    if (key === 'arrowleft' || key === 'a') {
      event.preventDefault();
      this.startCursor = false;
      this.slotCursor = Math.max(0, this.slotCursor - 1);
      this.render();
    } else if (key === 'arrowright' || key === 'd') {
      event.preventDefault();
      this.startCursor = false;
      this.slotCursor = Math.min(this.candidates.length - 1, this.slotCursor + 1);
      this.render();
    } else if (key === 'arrowdown' || key === 's') {
      event.preventDefault();
      if (canStartWithStarterSelection(this.selectedIds)) {
        this.startCursor = true;
        this.render();
      }
    } else if (key === 'arrowup' || key === 'w') {
      event.preventDefault();
      this.startCursor = false;
      this.render();
    } else if (key === 'enter') {
      event.preventDefault();
      if (this.startCursor) {
        this.startRun();
      } else {
        this.selectCurrentStarter();
      }
    } else if (key === 'backspace' || key === 'escape') {
      event.preventDefault();
      this.selectedIds = this.selectedIds.slice(0, -1);
      this.startCursor = false;
      this.render();
    }
  };

  private selectCurrentStarter(): void {
    const selected = this.candidates[this.slotCursor];
    if (!selected) return;

    this.selectedIds = addStarterSelection(this.selectedIds, selected.id);
    this.startCursor = canStartWithStarterSelection(this.selectedIds);
    this.render();
  }

  private startRun(): void {
    if (!canStartWithStarterSelection(this.selectedIds)) return;

    const state = enterBattle(createInitialRunState(this.mode, this.visualStyle, this.selectedIds[0], Math.random, this.bossRosterIds));
    stopIntroBgm(this);
    this.scene.start('BattleScene', { state });
  }
}

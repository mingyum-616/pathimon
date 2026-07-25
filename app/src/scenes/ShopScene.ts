import Phaser from 'phaser';
import { formatCapsuleInventory } from '../data/capsules';
import { shopItemAssetPaths } from '../data/shop';
import {
  advanceFromShop,
  canHealPartyMember,
  canUseEvolutionStoneOnPartyMember,
  canUseRareCandyOnPartyMember,
  ensureMaintenanceInventory,
  evolutionTargetForMonster,
  purchaseShopItem,
  purchaseShopItemForPartyMember,
  maintenanceRefreshCost,
  refreshMaintenanceInventory,
} from '../state/runState';
import type { RunState, ShopItem } from '../types/game';
import { APP_WIDTH, APP_HEIGHT, COLORS } from '../game/constants';
import { withParticle } from '../game/text';
import { destroySceneChildren } from '../ui/sceneCleanup';
import { pathimonSpriteAssets } from '../ui/battleUi';
import { addBoxLabel, addLabel, drawPanel } from '../ui/draw';
import { TEXT } from '../ui/typography';
import { keyboardCommand } from '../ui/keyboard';

const BUTTON_HOVER_FILL = 0x4a405d;

interface ShopSceneData {
  state?: RunState;
}

interface ShopKeyboardButton {
  disabled: boolean;
  onClick: () => void;
}

export class ShopScene extends Phaser.Scene {
  private state!: RunState;
  private note = '';
  private selectedTargetItem?: ShopItem;
  private keyboardButtons: ShopKeyboardButton[] = [];
  private keyboardCursor = 0;

  constructor() {
    super('ShopScene');
  }

  init(data: ShopSceneData = {}): void {
    if (!data.state) {
      throw new Error('ShopScene requires state');
    }

    this.state = {
      ...data.state,
      shopInventory: ensureMaintenanceInventory(data.state),
    };
    this.note = data.state.lastLog;
  }

  preload(): void {
    shopItemAssetPaths().forEach((path) => {
      if (!this.textures.exists(path)) {
        this.load.image(path, path);
      }
    });
    this.state.party.forEach((monster) => {
      const path = pathimonSpriteAssets(monster, this.state.visualStyle).front;
      if (!this.textures.exists(path)) {
        this.load.image(path, path);
      }
    });
  }

  create(): void {
    this.keyboardCursor = 0;
    this.input.keyboard?.on('keydown', this.handleKeyboardDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleKeyboardDown);
      destroySceneChildren(this);
    });
    this.render();
  }

  private render(): void {
    destroySceneChildren(this);
    this.keyboardButtons = [];
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, COLORS.ink).setOrigin(0);

    drawPanel(this, 48, 46, 928, 476);
    addLabel(this, 82, 70, '정비 구역', TEXT.display);
    this.drawFloorBadge();
    addLabel(this, 82, 112, `보유 자금: ${this.state.money}`, TEXT.heading);
    addBoxLabel(this, 82, 140, `캡슐: ${formatCapsuleInventory(this.state.capsuleInventory)}`, {
      width: 710,
      height: 18,
      size: TEXT.label,
      maxLines: 1,
      color: COLORS.muted,
    });
    // 안내문이 두 줄로 접히면 아래 상품 카드와 겹쳤다. 카드 시작점을 그 아래로 내린다.
    addBoxLabel(this, 82, 162, this.note || '사람 전투 이후 한 번만 구매할 수 있습니다.', {
      width: 720,
      height: 40,
      size: TEXT.body,
      maxLines: 2,
    });

    this.state.shopInventory?.forEach((item, index) => this.drawShopItem(item, index));

    // 두 버튼을 한 줄에 둔다. 예전 배치는 새로고침이 패널 아래로 18px 튀어나왔다.
    this.createButton(652, 450, 150, 44, `새로고침 ₩${maintenanceRefreshCost(this.state)}`, () => {
      this.state = refreshMaintenanceInventory(this.state);
      this.note = this.state.lastLog;
      this.selectedTargetItem = undefined;
      this.render();
    });

    this.createButton(812, 450, 150, 44, '다음 층', () => {
      const nextState = advanceFromShop(this.state);
      if (nextState.phase === 'bossIntro') {
        this.scene.start('BossIntroScene', { state: nextState });
        return;
      }
      this.scene.start('BattleScene', { state: nextState });
    });

    if (this.selectedTargetItem) {
      this.drawPartySelection(this.selectedTargetItem);
    }
  }

  private drawFloorBadge(): void {
    const x = APP_WIDTH - 174;
    const y = 72;
    this.add.rectangle(x, y, 118, 34, 0x20202c, 0.9)
      .setOrigin(0)
      .setStrokeStyle(2, COLORS.focus, 0.86);
    addBoxLabel(this, x + 59, y + 17, `${this.state.floor}층`, {
      width: 98,
      height: 22,
      size: TEXT.body,
      maxLines: 1,
      align: 'center',
      origin: [0.5, 0.5],
    });
  }

  private drawShopItem(item: ShopItem, index: number): void {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = 82 + column * 300;
    const y = 210 + row * 118;
    const width = 270;
    const height = 104;

    drawPanel(this, x, y, width, height).setAlpha(item.purchased ? 0.55 : 0.98);
    this.add.image(x + 44, y + 48, item.imagePath).setOrigin(0.5).setDisplaySize(42, 42).setAlpha(item.purchased ? 0.38 : 1);
    addBoxLabel(this, x + 82, y + 10, item.name, { width: 168, height: 24, size: TEXT.body, maxLines: 1 })
      .setAlpha(item.purchased ? 0.55 : 1);
    addBoxLabel(this, x + 82, y + 36, item.description, { width: 168, height: 32, size: TEXT.caption, maxLines: 2, color: COLORS.muted })
      .setAlpha(item.purchased ? 0.5 : 1);
    if (item.kind === 'capsule' && item.capsuleId) {
      addLabel(this, x + 20, y + 74, `보유 ${this.state.capsuleInventory[item.capsuleId] ?? 0}`, TEXT.caption)
        .setAlpha(item.purchased ? 0.5 : 0.9);
    }

    const label = item.purchased ? '구매 완료' : item.price > 0 ? `구매 ₩${item.price}` : '확인';
    this.createButton(x + 154, y + 68, 96, 26, label, () => {
      if (item.kind === 'potion' || item.kind === 'rareCandy' || item.kind === 'evolutionStone') {
        this.startPartySelection(item);
        return;
      }
      this.state = purchaseShopItem(this.state, item.id);
      this.note = this.state.lastLog;
      this.render();
    }, item.purchased);

    if (item.purchased) {
      this.add.rectangle(x, y, width, height, 0x000000, 0.35).setOrigin(0);
    }
  }

  private startPartySelection(item: ShopItem): void {
    if (item.price > this.state.money) {
      this.note = '자금이 부족합니다.';
      this.render();
      return;
    }

    this.selectedTargetItem = item;
    this.note = `${withParticle(item.name, '을')} 사용할 패시몬을 선택하세요.`;
    this.render();
  }

  private drawPartySelection(item: ShopItem): void {
    this.keyboardButtons = [];
    this.keyboardCursor = 0;
    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, 0x000000, 0.58).setOrigin(0).setInteractive();
    drawPanel(this, 210, 94, 604, 430).setStrokeStyle(3, COLORS.focus);
    addLabel(this, 246, 122, item.name, TEXT.title);
    addLabel(this, 246, 158, '패시몬 선택', TEXT.body).setColor(COLORS.muted);

    this.state.party.forEach((monster, index) => {
      const y = 200 + index * 46;
      const enabled = this.canUseTargetedItem(item, index);
      const action = this.targetActionLabel(item, index);
      const hpText = `HP ${monster.hp}/${monster.maxHp}`;

      drawPanel(this, 246, y, 520, 36).setAlpha(enabled ? 0.95 : 0.45);
      this.drawPartyThumbnail(monster, 266, y + 18, enabled ? 1 : 0.4);
      addBoxLabel(this, 288, y + 8, monster.name, { width: 158, height: 20, size: TEXT.label, maxLines: 1 })
        .setAlpha(enabled ? 1 : 0.55);
      addLabel(this, 452, y + 8, hpText, TEXT.label).setAlpha(enabled ? 0.95 : 0.55);
      this.createButton(616, y + 5, 128, 26, action, () => {
        this.state = purchaseShopItemForPartyMember(this.state, item.id, index);
        this.note = this.state.lastLog;
        this.selectedTargetItem = undefined;
        this.render();
      }, !enabled);
    });

    this.createButton(614, 474, 130, 32, '취소', () => {
      this.selectedTargetItem = undefined;
      this.note = '선택을 취소했습니다.';
      this.render();
    });
  }

  private drawPartyThumbnail(monster: RunState['party'][number], x: number, y: number, alpha: number): void {
    const path = pathimonSpriteAssets(monster, this.state.visualStyle).front;
    if (this.textures.exists(path)) {
      this.add.image(x, y, path).setDisplaySize(30, 30).setAlpha(alpha);
      return;
    }
    addLabel(this, x, y, monster.glyph, 18).setOrigin(0.5).setAlpha(alpha);
  }

  private canUseTargetedItem(item: ShopItem, partyIndex: number): boolean {
    const monster = this.state.party[partyIndex];
    if (!monster) return false;
    if (item.kind === 'potion') return canHealPartyMember(monster);
    if (item.kind === 'rareCandy') return canUseRareCandyOnPartyMember(this.state, partyIndex);
    if (item.kind === 'evolutionStone') return canUseEvolutionStoneOnPartyMember(this.state, partyIndex);
    return false;
  }

  private targetActionLabel(item: ShopItem, partyIndex: number): string {
    const monster = this.state.party[partyIndex];
    if (!monster) return '선택 불가';
    if (item.kind === 'potion') return canHealPartyMember(monster) ? '회복' : '회복 불필요';
    if (item.kind === 'rareCandy') return monster.signatureUnlocked ? '이미 해금' : '전용기 해금';
    if (item.kind === 'evolutionStone') {
      const evolutionTarget = evolutionTargetForMonster(monster);
      if (evolutionTarget) return '진화';
      return '진화 불가';
    }
    return '선택 불가';
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void,
    disabled = false,
  ): void {
    const keyboardIndex = this.keyboardButtons.length;
    this.keyboardButtons.push({ disabled, onClick });
    const focused = keyboardIndex === this.keyboardCursor;
    const rect = this.add.rectangle(x, y, width, height, disabled ? COLORS.ink : COLORS.panelDark).setOrigin(0);
    rect.setStrokeStyle(focused ? 3 : 2, focused ? COLORS.focus : disabled ? COLORS.panel : COLORS.border);

    if (!disabled) {
      rect.setInteractive({ useHandCursor: true });
      // 호버 채움에 경고색(line)을 쓰면 구매 버튼이 삭제 버튼처럼 읽힌다.
      rect.on('pointerover', () => rect.setFillStyle(BUTTON_HOVER_FILL));
      rect.on('pointerout', () => rect.setFillStyle(COLORS.panelDark));
      rect.on('pointerdown', onClick);
    } else {
      rect.setAlpha(0.5);
    }

    addBoxLabel(this, x + width / 2, y + height / 2, label, {
      width: width - 14,
      height: height - 6,
      size: TEXT.label,
      maxLines: 2,
      align: 'center',
      origin: [0.5, 0.5],
    })
      .setAlpha(disabled ? 0.65 : 1);
  }

  private handleKeyboardDown = (event: KeyboardEvent): void => {
    const command = keyboardCommand(event.key);
    if (!command || this.keyboardButtons.length === 0) return;
    event.preventDefault();

    if (command === 'up' || command === 'left') {
      this.keyboardCursor = (this.keyboardCursor - 1 + this.keyboardButtons.length) % this.keyboardButtons.length;
      this.render();
      return;
    }
    if (command === 'down' || command === 'right') {
      this.keyboardCursor = (this.keyboardCursor + 1) % this.keyboardButtons.length;
      this.render();
      return;
    }
    if (command === 'cancel' && this.selectedTargetItem) {
      this.selectedTargetItem = undefined;
      this.note = '선택을 취소했습니다.';
      this.keyboardCursor = 0;
      this.render();
      return;
    }
    if (command === 'confirm') {
      const button = this.keyboardButtons[this.keyboardCursor];
      if (button && !button.disabled) button.onClick();
    }
  };
}

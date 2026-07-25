import Phaser from 'phaser';
import { COLORS, FONT_FAMILY, TEXT_RESOLUTION } from '../game/constants';
import { MIN_TEXT_SIZE, TEXT } from './typography';

export function addLabel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size: number = TEXT.body,
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, {
    color: COLORS.text,
    fontFamily: FONT_FAMILY,
    fontSize: `${Math.max(MIN_TEXT_SIZE, size)}px`,
    lineSpacing: 4,
    resolution: TEXT_RESOLUTION,
  });
}

export interface BoxLabelOptions {
  align?: 'left' | 'center' | 'right';
  color?: string;
  height: number;
  maxLines?: number;
  minSize?: number;
  origin?: [number, number];
  size?: number;
  width: number;
}

export function addBoxLabel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  options: BoxLabelOptions,
): Phaser.GameObjects.Text {
  const size = Math.max(MIN_TEXT_SIZE, options.size ?? TEXT.body);
  // 자동 축소가 판독 한계 아래로 내려가지 않도록 하한을 고정한다.
  const minSize = Math.max(MIN_TEXT_SIZE, Math.min(size, options.minSize ?? size - 4));
  const label = addLabel(scene, x, y, text, size)
    .setWordWrapWidth(options.width, true)
    .setAlign(options.align ?? 'left');

  if (options.color) label.setColor(options.color);
  if (options.origin) label.setOrigin(options.origin[0], options.origin[1]);
  if (options.maxLines) label.setMaxLines(options.maxLines);

  for (let currentSize = size; currentSize > minSize && (label.height > options.height || label.width > options.width); currentSize -= 1) {
    label.setFontSize(`${currentSize - 1}px`);
  }

  if (label.height > options.height && !options.maxLines) {
    const lineHeight = Math.max(minSize + 4, Number.parseInt(String(label.style.fontSize), 10) + 4);
    label.setMaxLines(Math.max(1, Math.floor(options.height / lineHeight)));
  }

  return label;
}

export function drawHpBar(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  pct: number,
): Phaser.GameObjects.Rectangle {
  scene.add.rectangle(x, y, width, 10, COLORS.hpBack).setOrigin(0, 0.5);
  return scene.add.rectangle(x, y, Math.max(0, width * pct), 8, COLORS.hp).setOrigin(0, 0.5);
}

export function drawPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
): Phaser.GameObjects.Rectangle {
  const panel = scene.add.rectangle(x, y, width, height, COLORS.panel).setOrigin(0);
  panel.setStrokeStyle(2, COLORS.border);
  return panel;
}

// 선택 상태는 채움과 테두리를 함께 바꾸고, 포커스는 테두리만 바꾼다.
// 둘이 같은 색이면 "선택했다"와 "커서가 올라갔다"를 구분할 수 없다.
export function applySelectionStyle(
  rect: Phaser.GameObjects.Rectangle,
  state: { focused: boolean; selected: boolean },
  fills: { idle: number; selected: number },
): void {
  rect.setFillStyle(state.selected ? fills.selected : fills.idle);
  if (state.selected) {
    rect.setStrokeStyle(4, COLORS.selected);
    return;
  }
  rect.setStrokeStyle(state.focused ? 3 : 2, state.focused ? COLORS.focus : COLORS.border);
}

// 선택된 카드에만 붙는 배지. 얇은 색 테두리보다 훨씬 빨리 읽힌다.
export function addSelectedBadge(
  scene: Phaser.Scene,
  x: number,
  y: number,
): Phaser.GameObjects.Rectangle {
  const width = 76;
  const height = 24;
  const badge = scene.add.rectangle(x, y, width, height, COLORS.selected).setOrigin(0);
  addLabel(scene, x + width / 2, y + height / 2, '✓ 선택됨', TEXT.caption)
    .setOrigin(0.5)
    .setColor('#10231a');
  return badge;
}

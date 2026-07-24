import Phaser from 'phaser';
import { createBossRosterIds } from '../data/bosses';
import { APP_WIDTH, APP_HEIGHT, COLORS } from '../game/constants';
import { addLabel } from '../ui/draw';
import { keyboardCommand } from '../ui/keyboard';
import { titleCharacterDisplaySize, titleLogoStyle, titleScreenContent } from '../ui/titleUi';
import type { TitleLogoChunk, TitleLogoDecoration, TitleLogoStyle, TitleScreenContent } from '../ui/titleUi';

export class TitleScene extends Phaser.Scene {
  private bossRosterIds: string[] = [];
  private content?: TitleScreenContent;

  constructor() {
    super('TitleScene');
  }

  init(): void {
    this.bossRosterIds = createBossRosterIds(Math.random);
    this.content = titleScreenContent({ bossRosterIds: this.bossRosterIds, random: Math.random });
    this.registry.set('bossRosterIds', [...this.bossRosterIds]);
  }

  preload(): void {
    const content = this.getContent();
    const pendingPaths = [...new Set([...content.pathimonSprites, ...content.bossSprites])]
      .filter((path) => !this.textures.exists(path));
    if (pendingPaths.length === 0) return;

    const loadingLayer = [
      this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, 0x111722).setOrigin(0).setDepth(1000),
      addLabel(this, APP_WIDTH / 2, APP_HEIGHT / 2 - 22, '패시몬을 불러오는 중', 20)
        .setOrigin(0.5)
        .setDepth(1001),
      this.add.rectangle(APP_WIDTH / 2, APP_HEIGHT / 2 + 20, 320, 12, 0x2f2840)
        .setOrigin(0.5)
        .setDepth(1001),
    ];
    const progressBar = this.add.rectangle(APP_WIDTH / 2 - 160, APP_HEIGHT / 2 + 20, 0, 8, 0x72d6ff)
      .setOrigin(0, 0.5)
      .setDepth(1002);
    loadingLayer.push(progressBar);

    const updateProgress = (progress: number) => {
      progressBar.width = 320 * progress;
    };
    this.load.on('progress', updateProgress);
    this.load.once('complete', () => {
      this.load.off('progress', updateProgress);
      loadingLayer.forEach((object) => object.destroy());
    });
    pendingPaths.forEach((path) => this.load.image(path, path));
  }

  create(): void {
    const content = this.getContent();

    this.add.rectangle(0, 0, APP_WIDTH, APP_HEIGHT, 0x111722).setOrigin(0);
    this.add.rectangle(0, 0, APP_WIDTH, 96, 0x26386a, 0.45).setOrigin(0);
    this.add.rectangle(0, APP_HEIGHT - 112, APP_WIDTH, 112, 0x6b2330, 0.28).setOrigin(0);

    for (let y = 112; y < APP_HEIGHT - 112; y += 42) {
      this.add.rectangle(0, y, APP_WIDTH, 2, 0x5d708b, 0.18).setOrigin(0);
    }

    this.drawPathimonBackdrop(content.pathimonSprites);
    this.drawBossBackdrop(content.bossSprites);
    this.drawPixelTitle(content.title);

    addLabel(this, APP_WIDTH / 2, 372, content.subtitle, 23)
      .setOrigin(0.5)
      .setAlign('center')
      .setWordWrapWidth(420)
      .setAlpha(0.92);

    const startButton = this.add.rectangle(APP_WIDTH / 2, 466, 252, 60, COLORS.line).setOrigin(0.5);
    startButton.setStrokeStyle(4, 0xf5f2ff, 0.82);
    addLabel(this, APP_WIDTH / 2, 466, content.startLabel, 24)
      .setOrigin(0.5)
      .setAlign('center')
      .setWordWrapWidth(210);
    startButton.setInteractive({ useHandCursor: true });
    startButton.on('pointerover', () => startButton.setFillStyle(0x72d6ff));
    startButton.on('pointerout', () => startButton.setFillStyle(COLORS.line));
    startButton.on('pointerdown', () => this.scene.start('StoryScene'));
    this.input.keyboard?.on('keydown', this.handleKeyboardDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleKeyboardDown);
    });
  }

  private handleKeyboardDown = (event: KeyboardEvent): void => {
    const command = keyboardCommand(event.key);
    if (command === 'confirm') {
      event.preventDefault();
      this.scene.start('StoryScene');
    }
  };

  private getContent(): TitleScreenContent {
    if (!this.content) {
      this.bossRosterIds = createBossRosterIds(Math.random);
      this.content = titleScreenContent({ bossRosterIds: this.bossRosterIds, random: Math.random });
      this.registry.set('bossRosterIds', [...this.bossRosterIds]);
    }

    return this.content;
  }

  private drawPathimonBackdrop(sprites: string[]): void {
    const placements = [
      { x: 96, y: 178, size: 150, alpha: 0.3 },
      { x: 214, y: 162, size: 122, alpha: 0.22 },
      { x: 156, y: 292, size: 154, alpha: 0.28 },
      { x: 282, y: 308, size: 132, alpha: 0.2 },
      { x: 84, y: 430, size: 126, alpha: 0.24 },
      { x: 218, y: 462, size: 144, alpha: 0.26 },
      { x: 326, y: 414, size: 116, alpha: 0.2 },
    ];

    sprites.forEach((path, index) => {
      const placement = placements[index % placements.length];
      this.add.image(placement.x, placement.y, path)
        .setOrigin(0.5)
        .setDisplaySize(placement.size, placement.size)
        .setAlpha(placement.alpha)
        .setFlipX(index % 2 === 0);
    });
  }

  private drawBossBackdrop(sprites: string[]): void {
    const placements = [
      { x: 790, y: 174, size: 152, alpha: 0.34 },
      { x: 902, y: 166, size: 140, alpha: 0.28 },
      { x: 842, y: 296, size: 158, alpha: 0.32 },
      { x: 958, y: 302, size: 136, alpha: 0.24 },
      { x: 770, y: 444, size: 132, alpha: 0.25 },
      { x: 914, y: 452, size: 154, alpha: 0.3 },
    ];

    sprites.forEach((path, index) => {
      const placement = placements[index % placements.length];
      const image = this.add.image(placement.x, placement.y, path);
      const display = titleCharacterDisplaySize(image.width, image.height, placement.size);
      image
        .setOrigin(0.5)
        .setDisplaySize(display.width, display.height)
        .setAlpha(placement.alpha);
    });
  }

  private drawPixelTitle(title: string): void {
    const logo = titleLogoStyle(title);
    const textureKey = `pixel-title-logo-v2-${title}`;
    if (!this.textures.exists(textureKey)) {
      this.drawPixelatedTitleTexture(textureKey, title);
    }

    this.textures.get(textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.add.image(APP_WIDTH / 2 + 9, logo.display.y + 10, textureKey)
      .setOrigin(0.5)
      .setDisplaySize(logo.display.width, logo.display.height)
      .setTint(0x1a0b25)
      .setAlpha(0.64);
    this.add.image(APP_WIDTH / 2, logo.display.y, textureKey)
      .setOrigin(0.5)
      .setDisplaySize(logo.display.width, logo.display.height);
  }

  private drawPixelatedTitleTexture(textureKey: string, title: string): void {
    const logo = titleLogoStyle(title);
    const canvas = document.createElement('canvas');
    canvas.width = logo.canvas.width;
    canvas.height = logo.canvas.height;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.imageSmoothingEnabled = false;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineJoin = 'miter';
    context.miterLimit = 2;

    logo.chunks.forEach((chunk) => this.drawLogoChunk(context, chunk, logo));
    this.drawMicrobeDecorations(context, logo.decorations);

    this.textures.addCanvas(textureKey, canvas);
  }

  private drawLogoChunk(context: CanvasRenderingContext2D, chunk: TitleLogoChunk, logo: TitleLogoStyle): void {
    context.font = `900 ${chunk.fontSize}px "Arial Black", "Malgun Gothic", sans-serif`;

    context.globalAlpha = 0.38;
    context.lineWidth = 17;
    context.strokeStyle = logo.outline.glow;
    context.strokeText(chunk.text, chunk.x, chunk.y);

    context.globalAlpha = 1;
    context.lineWidth = 12;
    context.strokeStyle = logo.outline.outer;
    context.strokeText(chunk.text, chunk.x, chunk.y);

    context.lineWidth = 6;
    context.strokeStyle = logo.outline.inner;
    context.strokeText(chunk.text, chunk.x, chunk.y);

    context.lineWidth = 3;
    context.strokeStyle = logo.outline.outer;
    context.strokeText(chunk.text, chunk.x + 4, chunk.y + 5);
    context.fillStyle = chunk.shade;
    context.fillText(chunk.text, chunk.x + 4, chunk.y + 5);

    context.lineWidth = 2;
    context.strokeStyle = logo.outline.outer;
    context.strokeText(chunk.text, chunk.x, chunk.y);
    context.fillStyle = chunk.fill;
    context.fillText(chunk.text, chunk.x, chunk.y);

    context.globalAlpha = 0.22;
    context.fillStyle = '#ffffff';
    context.fillText(chunk.text, chunk.x - 2, chunk.y - 4);
    context.globalAlpha = 1;
  }

  private drawMicrobeDecorations(context: CanvasRenderingContext2D, decorations: TitleLogoDecoration[]): void {
    decorations.forEach((decoration, index) => {
      context.save();
      context.translate(decoration.x, decoration.y);

      if (decoration.kind === 'rod') {
        context.rotate(index % 2 === 0 ? -0.55 : 0.44);
        context.fillStyle = '#05070b';
        context.fillRect(-decoration.radius - 2, -3, decoration.radius * 2 + 4, 6);
        context.fillStyle = decoration.color;
        context.fillRect(-decoration.radius - 1, -2, decoration.radius * 2 + 2, 4);
        context.restore();
        return;
      }

      context.fillStyle = '#05070b';
      context.beginPath();
      context.arc(0, 0, decoration.radius + 3, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = decoration.color;
      context.beginPath();
      context.arc(0, 0, decoration.radius, 0, Math.PI * 2);
      context.fill();
      context.fillRect(-1, -decoration.radius - 5, 2, 4);
      context.fillRect(-1, decoration.radius + 1, 2, 4);
      context.fillRect(-decoration.radius - 5, -1, 4, 2);
      context.fillRect(decoration.radius + 1, -1, 4, 2);
      context.restore();
    });
  }
}

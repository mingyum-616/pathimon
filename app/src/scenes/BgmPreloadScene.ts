import Phaser from 'phaser';
import { queueIntroBgm } from '../audio/introBgm';
import { APP_HEIGHT, APP_WIDTH } from '../game/constants';
import {
  createInitialPathimonScreensaverItems,
  createPathimonScreensaverPair,
  pathimonScreensaverImageSize,
  pathimonScreensaverSpritePool,
  type PathimonScreensaverItem,
} from '../ui/pathimonScreensaver';

export class BgmPreloadScene extends Phaser.Scene {
  private previousCanvasZIndex?: string;
  private screensaverLayer?: HTMLDivElement;
  private screensaverTimers: number[] = [];

  constructor() {
    super('BgmPreloadScene');
  }

  init(): void {
    this.registry.set('battleBgmPreloadStarted', true);
  }

  preload(): void {
    queueIntroBgm(this);
  }

  create(): void {
    this.startPathimonScreensaver();
    this.registry.set('battleBgmPreloadComplete', true);
    if (this.registry.get('introStoryComplete')) {
      this.removePathimonScreensaver();
    }
    this.scene.stop();
  }

  private startPathimonScreensaver(): void {
    const parent = this.game.canvas.parentElement;
    if (!parent || this.screensaverLayer) return;

    parent.style.position = parent.style.position || 'relative';
    this.game.canvas.style.position = this.game.canvas.style.position || 'relative';
    this.previousCanvasZIndex = this.game.canvas.style.zIndex;
    this.game.canvas.style.zIndex = '1000';
    const layer = document.createElement('div');
    layer.className = 'pathimon-bgm-screensaver';
    Object.assign(layer.style, {
      background: 'rgba(8, 12, 20, 0.16)',
      inset: '0',
      overflow: 'hidden',
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: '1001',
    });
    parent.appendChild(layer);
    this.screensaverLayer = layer;

    const bounds = parent.getBoundingClientRect();
    const width = bounds.width || APP_WIDTH;
    const height = bounds.height || APP_HEIGHT;
    const sprites = pathimonScreensaverSpritePool();
    const items = createInitialPathimonScreensaverItems({ height, sprites, width });
    for (let index = 0; index < items.length; index += 2) {
      const pair = items.slice(index, index + 2);
      if (pair.length === 2) this.addScreensaverPair(layer, pair, width, height, sprites);
    }
  }

  private addScreensaverPair(
    layer: HTMLDivElement,
    pair: PathimonScreensaverItem[],
    width: number,
    height: number,
    sprites: string[],
  ): void {
    const images = pair.map((item) => this.createScreensaverImage(layer, item, width));
    this.animateScreensaverPair(images, pair, width, height, sprites);
  }

  private createScreensaverImage(layer: HTMLDivElement, item: PathimonScreensaverItem, viewportWidth: number): HTMLImageElement {
    const image = document.createElement('img');
    image.alt = '';
    image.decoding = 'async';
    image.draggable = false;
    image.src = item.assetPath;
    Object.assign(image.style, {
      filter: 'drop-shadow(0 10px 8px rgba(0, 0, 0, 0.45))',
      imageRendering: 'pixelated',
      left: '0',
      opacity: '0.9',
      position: 'absolute',
      top: '0',
      width: `${pathimonScreensaverImageSize(viewportWidth)}px`,
      willChange: 'transform',
    });
    layer.appendChild(image);
    return image;
  }

  private animateScreensaverPair(
    images: HTMLImageElement[],
    pair: PathimonScreensaverItem[],
    width: number,
    height: number,
    sprites: string[],
  ): void {
    const first = pair[0];
    if (!first || images.length !== pair.length) return;

    const allImagesStillMounted = () => images.every((image) => this.screensaverLayer?.contains(image));
    images.forEach((image, index) => {
      const item = pair[index]!;
      image.src = item.assetPath;
      image.style.transition = 'none';
      image.style.transform = this.screensaverTransform(item.startX, item.startY, item.scale, 0);
    });

    const launchDuration = Math.round(first.durationMs * 0.5);
    const bounceDuration = first.durationMs - launchDuration;
    let phase: 'launch' | 'bounce' = 'launch';
    let completedTransitions = 0;

    images.forEach((image, index) => {
      const item = pair[index]!;
      const launchTimer = window.setTimeout(() => {
        if (!allImagesStillMounted()) return;
        image.style.transition = `transform ${launchDuration}ms cubic-bezier(0.18, 0.78, 0.28, 1)`;
        image.style.transform = this.screensaverTransform(item.impactX, item.impactY, item.scale * 1.1, 0);
      }, item.delayMs);
      this.screensaverTimers.push(launchTimer);
    });

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== 'transform' || !allImagesStillMounted()) return;
      completedTransitions += 1;
      if (completedTransitions < images.length) return;
      completedTransitions = 0;

      if (phase === 'launch') {
        phase = 'bounce';
        images.forEach((image, index) => {
          const item = pair[index]!;
          image.style.transition = `transform ${bounceDuration}ms cubic-bezier(0.64, 0.02, 0.86, 0.36)`;
          image.style.transform = this.screensaverTransform(item.endX, item.endY, item.scale, item.wobblePx);
        });
        return;
      }

      const nextTimer = window.setTimeout(() => {
        if (!allImagesStillMounted()) return;
        const nextPair = createPathimonScreensaverPair({ height, sprites, width }).map((item, index) => ({
          ...item,
          delayMs: index * 350,
        }));
        this.animateScreensaverPair(images, nextPair, width, height, sprites);
      }, first.respawnDelayMs);
      this.screensaverTimers.push(nextTimer);
    };

    images.forEach((image) => {
      image.ontransitionend = handleTransitionEnd;
    });
  }

  private screensaverTransform(x: number, y: number, scale: number, wobblePx: number): string {
    return `translate(${x}px, ${y + wobblePx}px) translate(-50%, -50%) scale(${scale})`;
  }

  stopPathimonScreensaver(): void {
    this.removePathimonScreensaver();
  }

  private removePathimonScreensaver(): void {
    this.screensaverTimers.forEach((timer) => window.clearTimeout(timer));
    this.screensaverTimers = [];
    this.screensaverLayer?.remove();
    this.screensaverLayer = undefined;
    if (this.previousCanvasZIndex !== undefined) {
      this.game.canvas.style.zIndex = this.previousCanvasZIndex;
      this.previousCanvasZIndex = undefined;
    }
  }

}

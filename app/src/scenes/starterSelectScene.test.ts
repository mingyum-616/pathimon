import { describe, expect, it } from 'vitest';
import starterSelectSceneSource from './StarterSelectScene.ts?raw';

describe('StarterSelectScene audio', () => {
  it('keeps the intro BGM through starter selection and stops it when the run starts', () => {
    const createIndex = starterSelectSceneSource.indexOf('create(): void');
    const startRunIndex = starterSelectSceneSource.indexOf('private startRun(): void');
    const stopIndex = starterSelectSceneSource.indexOf('stopIntroBgm(this);');

    expect(starterSelectSceneSource).toContain('queueIntroBgm(this);');
    expect(starterSelectSceneSource).toContain('playIntroBgm(this);');
    expect(stopIndex).toBeGreaterThan(startRunIndex);
    expect(stopIndex).toBeGreaterThan(createIndex);
  });

  it('moves keyboard focus to the start button after selecting the starter', () => {
    expect(starterSelectSceneSource).toContain(
      'this.startCursor = canStartWithStarterSelection(this.selectedIds);',
    );
  });

  it('loads and reveals every starter candidate sprite above its capsule', () => {
    expect(starterSelectSceneSource).toContain('pathimonSpriteAssets');
    expect(starterSelectSceneSource).toContain('this.candidates.forEach');
    expect(starterSelectSceneSource).toContain('const spriteAssets = pathimonSpriteAssets(monster, this.visualStyle);');
    expect(starterSelectSceneSource).toContain('.setDisplaySize(visual.spriteSize, visual.spriteSize)');
  });

  it('keeps a white selected outline after focus moves to the start button', () => {
    expect(starterSelectSceneSource).toContain('starterSlotVisual(active, chosen)');
    expect(starterSelectSceneSource).toContain('visual.selectedOutline ? 0xffffff');
  });
});

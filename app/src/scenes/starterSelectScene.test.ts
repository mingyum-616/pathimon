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

  it('moves one blue capsule ring with the current slot without drawing a white circle', () => {
    expect(starterSelectSceneSource).toContain('starterSlotVisual(active, chosen)');
    expect(starterSelectSceneSource).toContain('const active = this.slotCursor === index;');
    expect(starterSelectSceneSource).toContain('active ? ACTIVE_LINE : 0x4a2a2a');
    expect(starterSelectSceneSource).not.toContain('visual.selectedOutline');
    expect(starterSelectSceneSource).not.toContain('this.add.circle(slot.x, slot.y + 4');
  });
});

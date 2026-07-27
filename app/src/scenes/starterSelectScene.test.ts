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
    expect(starterSelectSceneSource).toContain('.setDisplaySize(active ? 106 : 96, active ? 106 : 96)');
  });

  it('uses only the moving focus marker instead of a fixed selected badge', () => {
    expect(starterSelectSceneSource).not.toContain('if (chosen)');
    expect(starterSelectSceneSource).not.toContain('const badge = this.add.circle');
    expect(starterSelectSceneSource).toContain(
      'shadow.setStrokeStyle(3, active ? ACTIVE_LINE : 0x4a2a2a, active ? 0.9 : 0.22);',
    );
  });
});

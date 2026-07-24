import { describe, expect, it } from 'vitest';
import modeSelectSceneSource from './ModeSelectScene.ts?raw';

describe('ModeSelectScene copy', () => {
  it('uses concise mode and visual-style labels without helper hints', () => {
    expect(modeSelectSceneSource).toContain('진행 방식과 디자인을 선택합니다.');
    expect(modeSelectSceneSource).toContain('진행 방식');
    expect(modeSelectSceneSource).toContain('디자인');
    expect(modeSelectSceneSource).not.toContain('표현 방식');
    expect(modeSelectSceneSource).not.toContain('학습 핵심:');
    expect(modeSelectSceneSource).not.toContain('진행 모드');
    expect(modeSelectSceneSource).not.toContain('진행 모드와 디자인을 모두 선택하면 시작합니다.');
    expect(modeSelectSceneSource).toContain('queueIntroBgm(this)');
    expect(modeSelectSceneSource).toContain('playIntroBgm(this)');
  });

  it('supports arrow navigation and Enter selection', () => {
    expect(modeSelectSceneSource).toContain("this.input.keyboard?.on('keydown', this.handleKeyboardDown)");
    expect(modeSelectSceneSource).toContain("command === 'confirm'");
    expect(modeSelectSceneSource).toContain('this.optionCursor');
  });

  it('keeps both choices visible until the player confirms the start button', () => {
    expect(modeSelectSceneSource).toContain('private startRun(): void');
    expect(modeSelectSceneSource).toContain("'게임 시작'");
    expect(modeSelectSceneSource).toContain("'선택됨'");
    expect(modeSelectSceneSource).not.toContain("this.time.delayedCall(120, () => this.scene.start('StarterSelectScene'");
  });

  it('aligns the visual-style controls with the run-mode cards', () => {
    expect(modeSelectSceneSource).toContain('private createModeButton');
    expect(modeSelectSceneSource).toContain('private createStyleButton');
    expect(modeSelectSceneSource).toContain('const STYLE_BUTTON_WIDTH = MODE_BUTTON_WIDTH;');
    expect(modeSelectSceneSource).toContain('const STYLE_BUTTON_HEIGHT = 54;');
    expect(modeSelectSceneSource).toContain('this.createStyleButton(142 + index * 390, 402');
    expect(modeSelectSceneSource).toContain("'01  진행 방식'");
    expect(modeSelectSceneSource).toContain("'02  디자인'");
  });
});

import { describe, expect, it } from 'vitest';
import storySceneSource from './StoryScene.ts?raw';

describe('StoryScene flow', () => {
  it('continues to the disclaimer after the opening story', () => {
    expect(storySceneSource).toContain("this.registry.set('introStoryComplete', false)");
    expect(storySceneSource).toContain("this.scene.launch('BgmPreloadScene')");
    expect(storySceneSource).toContain('finishStory');
    expect(storySceneSource).toContain("this.registry.set('introStoryComplete', true)");
    expect(storySceneSource).toContain("if (this.registry.get('battleBgmPreloadComplete'))");
    expect(storySceneSource).toContain('stopPathimonScreensaver');
    expect(storySceneSource).toContain("this.scene.start('DisclaimerScene')");
    expect(storySceneSource).not.toContain("delayedCall(2000");
    expect(storySceneSource).not.toContain("this.scene.start('GameGuideScene')");
  });

  it('supports Enter to advance and keyboard selection of the skip action', () => {
    expect(storySceneSource).toContain("this.input.keyboard?.on('keydown', this.handleKeyboardDown)");
    expect(storySceneSource).toContain("command === 'confirm'");
    expect(storySceneSource).toContain("this.keyboardTarget === 'skip'");
  });
});

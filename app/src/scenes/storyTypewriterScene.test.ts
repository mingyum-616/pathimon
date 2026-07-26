import { describe, expect, it } from 'vitest';
import postDisclaimerSource from './PostDisclaimerStoryScene.ts?raw';
import storySource from './StoryScene.ts?raw';

describe('story typewriter scenes', () => {
  it('types story and wake-up dialogue at the established speed', () => {
    expect(storySource).toContain('const TYPEWRITER_INTERVAL_MS = 24');
    expect(storySource).toContain('advanceTypewriter(');
    expect(postDisclaimerSource).toContain('const TYPEWRITER_INTERVAL_MS = 24');
    expect(postDisclaimerSource).toContain('advanceTypewriter(');
  });

  it('uses confirm input to reveal before advancing', () => {
    expect(storySource).toContain("advance.action === 'reveal'");
    expect(postDisclaimerSource).toContain("advance.action === 'reveal'");
  });
});

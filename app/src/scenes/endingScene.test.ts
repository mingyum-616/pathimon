import { describe, expect, it } from 'vitest';
import endingSceneSource from './EndingScene.ts?raw';

describe('EndingScene', () => {
  it('shows four ending pages and types dialogue at 24ms', () => {
    expect(endingSceneSource).toContain('CONGRATULATIONS!');
    expect(endingSceneSource).toContain('const TYPEWRITER_INTERVAL_MS = 24');
    expect(endingSceneSource).toContain("page: 'feedback'");
  });

  it('requires a rating and preserves feedback on failed submission', () => {
    expect(endingSceneSource).toContain('this.draft.rating <= 0');
    expect(endingSceneSource).toContain('saveEndingFeedbackDraft');
    expect(endingSceneSource).toContain('submitEndingFeedback');
  });

  it('leaves keyboard shortcuts alone while the feedback textarea has focus', () => {
    expect(endingSceneSource).toContain('this.isFeedbackTextareaFocused()');
    expect(endingSceneSource).toContain('data-ending-feedback-textarea');
  });
});

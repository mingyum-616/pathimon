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

  it('uses cropped front sprites and keeps Skip safe while a request is in flight', () => {
    expect(endingSceneSource).toContain('sprite.setCrop(');
    expect(endingSceneSource).toContain('this.textarea?.setDisabled(this.submitting)');
    expect(endingSceneSource).toContain('this.submission.invalidate()');
    expect(endingSceneSource).toContain("'건너뛰기', 'skip', false");
    expect(endingSceneSource).toContain('Phaser.Scenes.Events.DESTROY, this.cleanup, this');
    expect(endingSceneSource).toContain('this.events.off(Phaser.Scenes.Events.DESTROY, this.cleanup, this)');
  });

  it('owns and aborts the active feedback request during scene cleanup', () => {
    expect(endingSceneSource).toContain('new AbortController()');
    expect(endingSceneSource).toContain('signal: controller.signal');
    expect(endingSceneSource).toContain('this.feedbackAbortController?.abort()');
  });
});

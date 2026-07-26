import { describe, expect, it } from 'vitest';
import { EndingFeedbackSubmissionEpoch } from './endingFeedbackSubmission';

describe('ending feedback submission epoch', () => {
  it('makes an in-flight response stale after leaving the feedback page', () => {
    const submission = new EndingFeedbackSubmissionEpoch();
    const request = submission.begin();

    expect(submission.isCurrent(request)).toBe(true);

    submission.invalidate();

    expect(submission.isCurrent(request)).toBe(false);
  });

  it('makes an earlier request stale when a later submission starts', () => {
    const submission = new EndingFeedbackSubmissionEpoch();
    const firstRequest = submission.begin();
    const secondRequest = submission.begin();

    expect(submission.isCurrent(firstRequest)).toBe(false);
    expect(submission.isCurrent(secondRequest)).toBe(true);
  });
});

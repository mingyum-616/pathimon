import { describe, expect, it, vi } from 'vitest';
import {
  clearEndingFeedbackDraft,
  loadEndingFeedbackDraft,
  saveEndingFeedbackDraft,
  submitEndingFeedback,
} from './endingFeedback';

describe('ending feedback', () => {
  it('persists and clears a mobile draft', () => {
    saveEndingFeedbackDraft({ rating: 4, message: '재미있었습니다.' });
    expect(loadEndingFeedbackDraft()).toEqual({ rating: 4, message: '재미있었습니다.' });
    clearEndingFeedbackDraft();
    expect(loadEndingFeedbackDraft()).toEqual({ rating: 0, message: '' });
  });

  it('submits only rating and message through Web3Forms', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await expect(submitEndingFeedback(
      { rating: 5, message: '좋아요.' },
      fetchImpl,
    )).resolves.toEqual({ ok: true });

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.web3forms.com/submit',
      expect.objectContaining({ method: 'POST' }),
    );
    const request = JSON.parse(fetchImpl.mock.calls[0][1].body as string);
    expect(request).toEqual({
      access_key: 'abf86e09-9622-4783-82f8-4e82976b2c26',
      rating: 5,
      message: '좋아요.',
      subject: '[패시몬] 엔딩 피드백 ★5',
      botcheck: '',
    });
  });

  it('returns a retryable result for network and API failures', async () => {
    const rejected = vi.fn().mockRejectedValue(new Error('offline'));
    await expect(submitEndingFeedback({ rating: 3, message: '' }, rejected))
      .resolves.toEqual({ ok: false, reason: 'network' });

    const failed = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false }),
    });
    await expect(submitEndingFeedback({ rating: 3, message: '' }, failed))
      .resolves.toEqual({ ok: false, reason: 'server' });
  });

  it('normalizes stored ratings and ignores malformed drafts', () => {
    const storage = new MapStorage();
    storage.setItem('pathimon-ending-feedback-draft-v1', JSON.stringify({
      rating: 7.8,
      message: 'draft',
    }));

    expect(loadEndingFeedbackDraft(storage)).toEqual({ rating: 5, message: 'draft' });

    storage.setItem('pathimon-ending-feedback-draft-v1', '{');
    expect(loadEndingFeedbackDraft(storage)).toEqual({ rating: 0, message: '' });
  });

  it('rejects submissions without a rating before making a request', async () => {
    const fetchImpl = vi.fn();

    await expect(submitEndingFeedback({ rating: 0, message: '' }, fetchImpl))
      .resolves.toEqual({ ok: false, reason: 'invalid-rating' });

    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

class MapStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

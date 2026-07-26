export interface EndingFeedbackDraft {
  rating: number;
  message: string;
}

export type EndingFeedbackSubmitResult =
  | { ok: true }
  | { ok: false; reason: 'invalid-rating' | 'network' | 'server' };

const DRAFT_STORAGE_KEY = 'pathimon-ending-feedback-draft-v1';
const WEB3FORMS_ACCESS_KEY = 'abf86e09-9622-4783-82f8-4e82976b2c26';
const EMPTY_DRAFT: EndingFeedbackDraft = { rating: 0, message: '' };

export function loadEndingFeedbackDraft(storage?: Storage): EndingFeedbackDraft {
  try {
    const savedDraft = resolveStorage(storage)?.getItem(DRAFT_STORAGE_KEY);
    if (!savedDraft) {
      return { ...EMPTY_DRAFT };
    }

    const draft = JSON.parse(savedDraft) as Partial<EndingFeedbackDraft>;
    if (typeof draft.rating !== 'number' || typeof draft.message !== 'string') {
      return { ...EMPTY_DRAFT };
    }

    return {
      rating: normalizeRating(draft.rating),
      message: draft.message,
    };
  } catch {
    return { ...EMPTY_DRAFT };
  }
}

export function saveEndingFeedbackDraft(
  draft: EndingFeedbackDraft,
  storage?: Storage,
): void {
  try {
    resolveStorage(storage)?.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
      rating: normalizeRating(draft.rating),
      message: draft.message,
    }));
  } catch {
    // Draft persistence is optional when local storage is unavailable.
  }
}

export function clearEndingFeedbackDraft(storage?: Storage): void {
  try {
    resolveStorage(storage)?.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Draft persistence is optional when local storage is unavailable.
  }
}

export async function submitEndingFeedback(
  draft: EndingFeedbackDraft,
  fetchImpl: typeof fetch = fetch,
): Promise<EndingFeedbackSubmitResult> {
  if (!isValidRating(draft.rating)) {
    return { ok: false, reason: 'invalid-rating' };
  }

  let response: Response;
  try {
    response = await fetchImpl('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `[패시몬] 엔딩 피드백 ★${draft.rating}`,
        rating: draft.rating,
        message: draft.message,
        botcheck: '',
      }),
    });
  } catch {
    return { ok: false, reason: 'network' };
  }

  try {
    const body = await response.json() as { success?: boolean };
    return response.ok && body.success === true
      ? { ok: true }
      : { ok: false, reason: 'server' };
  } catch {
    return { ok: false, reason: 'server' };
  }
}

function resolveStorage(storage?: Storage): Storage | undefined {
  if (storage) {
    return storage;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function normalizeRating(rating: number): number {
  return Math.min(5, Math.max(0, Math.trunc(rating)));
}

function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

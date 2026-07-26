export interface EndingFeedbackDraft {
  rating: number;
  message: string;
}

export type EndingFeedbackSubmitResult =
  | { ok: true }
  | { ok: false; reason: 'invalid-rating' | 'network' | 'server' };

export interface EndingFeedbackSubmitOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

const DRAFT_STORAGE_KEY = 'pathimon-ending-feedback-draft-v1';
const WEB3FORMS_ACCESS_KEY = 'abf86e09-9622-4783-82f8-4e82976b2c26';
const DEFAULT_SUBMISSION_TIMEOUT_MS = 10_000;
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
  options: EndingFeedbackSubmitOptions = {},
): Promise<EndingFeedbackSubmitResult> {
  if (!isValidRating(draft.rating)) {
    return { ok: false, reason: 'invalid-rating' };
  }

  const requestController = new AbortController();
  const abortRequest = (): void => requestController.abort();
  const timeoutId = globalThis.setTimeout(
    abortRequest,
    Math.max(0, options.timeoutMs ?? DEFAULT_SUBMISSION_TIMEOUT_MS),
  );
  options.signal?.addEventListener('abort', abortRequest, { once: true });
  if (options.signal?.aborted) {
    abortRequest();
  }

  try {
    const response = await fetchImpl('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `[패시몬] 엔딩 피드백 ★${draft.rating}`,
        rating: draft.rating,
        message: draft.message,
        botcheck: '',
      }),
      signal: requestController.signal,
    });
    if (requestController.signal.aborted) {
      return { ok: false, reason: 'network' };
    }

    let body: { success?: boolean };
    try {
      body = await response.json() as { success?: boolean };
    } catch {
      return requestController.signal.aborted
        ? { ok: false, reason: 'network' }
        : { ok: false, reason: 'server' };
    }
    if (requestController.signal.aborted) {
      return { ok: false, reason: 'network' };
    }
    return response.ok && body.success === true
      ? { ok: true }
      : { ok: false, reason: 'server' };
  } catch {
    return { ok: false, reason: 'network' };
  } finally {
    globalThis.clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', abortRequest);
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

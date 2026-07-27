import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('touch control preference', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('defaults to enabled and persists a disabled preference', async () => {
    const settings = await import('./touchControls');

    expect(settings.getTouchControlsEnabled()).toBe(true);
    settings.setTouchControlsEnabled(false);
    expect(localStorage.getItem(settings.TOUCH_CONTROLS_STORAGE_KEY)).toBe('false');

    vi.resetModules();
    const reloaded = await import('./touchControls');
    expect(reloaded.getTouchControlsEnabled()).toBe(false);
  });

  it('notifies listeners when the preference is toggled', async () => {
    const settings = await import('./touchControls');
    const listener = vi.fn();
    const removeListener = settings.onTouchControlsEnabledChange(listener);

    expect(settings.toggleTouchControlsEnabled()).toBe(false);
    expect(listener).toHaveBeenCalledWith(false);

    removeListener();
    settings.toggleTouchControlsEnabled();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

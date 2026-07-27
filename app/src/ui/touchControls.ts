export const TOUCH_CONTROLS_STORAGE_KEY = 'pathimon-touch-controls-v1';

type TouchControlsListener = (enabled: boolean) => void;

const listeners = new Set<TouchControlsListener>();

function storedPreference(): boolean {
  if (typeof localStorage === 'undefined') return true;

  try {
    return localStorage.getItem(TOUCH_CONTROLS_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

let enabled = storedPreference();

export function getTouchControlsEnabled(): boolean {
  return enabled;
}

export function setTouchControlsEnabled(nextEnabled: boolean): boolean {
  enabled = nextEnabled;
  try {
    localStorage.setItem(TOUCH_CONTROLS_STORAGE_KEY, String(enabled));
  } catch {
    // The in-memory preference still works when storage is unavailable.
  }
  listeners.forEach((listener) => listener(enabled));
  return enabled;
}

export function toggleTouchControlsEnabled(): boolean {
  return setTouchControlsEnabled(!enabled);
}

export function onTouchControlsEnabledChange(listener: TouchControlsListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

type AudioMutedListener = (muted: boolean) => void;

let muted = false;
const listeners = new Set<AudioMutedListener>();

export function getAudioMuted(): boolean {
  return muted;
}

export function setAudioMuted(nextMuted: boolean): boolean {
  muted = nextMuted;
  listeners.forEach((listener) => listener(muted));
  return muted;
}

export function toggleAudioMuted(): boolean {
  return setAudioMuted(!muted);
}

export function onAudioMutedChange(listener: AudioMutedListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

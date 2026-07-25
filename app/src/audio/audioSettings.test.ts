import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAudioMuted, setAudioMuted, toggleAudioMuted } from './audioSettings';
import { playHtmlBattleBgm, stopHtmlBattleBgm } from './htmlBgm';

class FakeAudio {
  currentTime = 0;
  loop = false;
  muted = false;
  preload = '';
  src = '';
  volume = 1;
  pause = vi.fn();
  play = vi.fn(() => Promise.resolve());
  load = vi.fn();
}

describe('global audio settings', () => {
  afterEach(() => {
    setAudioMuted(false);
    stopHtmlBattleBgm();
    vi.unstubAllGlobals();
  });

  it('mutes the streaming BGM and preserves the setting for the next track', async () => {
    const audio = new FakeAudio();
    vi.stubGlobal('Audio', vi.fn(() => audio));

    setAudioMuted(true);
    await playHtmlBattleBgm('audio/bgm/test.mp3');

    expect(getAudioMuted()).toBe(true);
    expect(audio.muted).toBe(true);
  });

  it('toggles the shared mute state', () => {
    expect(toggleAudioMuted()).toBe(true);
    expect(toggleAudioMuted()).toBe(false);
  });
});

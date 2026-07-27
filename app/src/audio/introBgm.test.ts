import { describe, expect, it } from 'vitest';
import introBgmSource from './introBgm.ts?raw';

describe('intro BGM helpers', () => {
  it('uses the Pokerogue title_afd_2 track for intro and mode selection scenes', () => {
    expect(introBgmSource).toContain("audio/bgm/title_afd_2.mp3");
    expect(introBgmSource).toContain('queueIntroBgm');
    expect(introBgmSource).toContain('playIntroBgm');
    expect(introBgmSource).toContain('stopIntroBgm');
    expect(introBgmSource).toContain('cache.audio.exists');
    expect(introBgmSource).toContain('loop: true');
  });

  it('reuses the intro track as a slower and quieter ending arrangement', () => {
    expect(introBgmSource).toContain('playEndingBgm');
    expect(introBgmSource).toContain('rate: 0.92');
    expect(introBgmSource).toContain('volume: 0.22');
  });
});

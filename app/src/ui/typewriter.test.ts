import { describe, expect, it } from 'vitest';
import { advanceTypewriter } from './typewriter';

describe('typewriter dialogue', () => {
  it('reveals the current utterance before advancing to the next one', () => {
    expect(advanceTypewriter(['첫 문장', '둘째 문장'], 0, 2)).toEqual({
      action: 'reveal',
      lineIndex: 0,
      visibleCharacters: 4,
    });
    expect(advanceTypewriter(['첫 문장', '둘째 문장'], 0, 4)).toEqual({
      action: 'next',
      lineIndex: 1,
      visibleCharacters: 0,
    });
  });

  it('finishes only after the last fully revealed utterance', () => {
    expect(advanceTypewriter(['마지막'], 0, 3)).toEqual({
      action: 'finish',
      lineIndex: 0,
      visibleCharacters: 3,
    });
  });
});

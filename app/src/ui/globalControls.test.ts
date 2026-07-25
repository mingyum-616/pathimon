import { describe, expect, it } from 'vitest';
import { globalControlLabels } from './globalControls';

describe('global controls', () => {
  it('provides mute and battle-guide controls with accessible labels', () => {
    expect(globalControlLabels()).toEqual({
      guide: '전투 안내 열기',
      mute: '음소거',
      unmute: '소리 켜기',
    });
  });
});

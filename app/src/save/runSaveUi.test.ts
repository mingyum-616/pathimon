import { describe, expect, it } from 'vitest';
import type { RunSaveSlot } from './runSaveStore';
import { defaultRunSaveDialogMode, runSaveSlotSummary } from './runSaveUi';

const slot = {
  floor: 27,
  mode: 'learning',
  visualStyle: 'micro',
  partyNames: ['테스트몬', '두번째몬'],
  savedAt: '2026-07-27T10:00:00.000Z',
} as RunSaveSlot;

describe('run save dialog presentation', () => {
  it('starts in save mode only while an active run can be saved', () => {
    expect(defaultRunSaveDialogMode(true)).toBe('save');
    expect(defaultRunSaveDialogMode(false)).toBe('load');
  });

  it('summarizes the saved floor, mode, style, and party size', () => {
    expect(runSaveSlotSummary(slot)).toEqual({
      primary: '27층 · 학습모드 · 실사풍',
      secondary: '파티 2마리 · 테스트몬, 두번째몬',
    });
  });
});

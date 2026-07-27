import { describe, expect, it } from 'vitest';
import { MONSTERS, STARTER_ID, starterCandidateRoster } from '../data/monsters';
import { NOTE_MONSTERS } from '../data/pathimonNoteData';
import {
  addStarterSelection,
  canStartWithStarterSelection,
  pickStarterCandidates,
  starterCandidateRolls,
  starterCapsuleSlots,
  starterChoiceSummary,
  starterSelectCopy,
  starterSlotVisual,
} from './starterSelectUi';

describe('starter select UI helpers', () => {
  it('starts with the default starter and note-managed pathimon without duplicates', () => {
    const noteIdsNewestFirst = [...NOTE_MONSTERS].reverse().map((monster) => monster.id);
    const noteIdsAfterStarter = noteIdsNewestFirst.filter((id) => id !== STARTER_ID);
    const expectedChoiceIds = [STARTER_ID, ...noteIdsAfterStarter].slice(0, 3);
    const choices = pickStarterCandidates(starterCandidateRoster(), []);
    const choiceIds = choices.map((monster) => monster.id);

    expect(starterCandidateRoster().slice(1, 1 + noteIdsAfterStarter.length).map((monster) => monster.id)).toEqual(noteIdsAfterStarter);
    expect(choiceIds).toEqual(expectedChoiceIds);
    expect(new Set(choiceIds).size).toBe(choiceIds.length);
  });

  it('builds random starter candidate rolls for the starter scene', () => {
    const values = [0.99, 0.49, 0.01];
    let index = 0;

    expect(starterCandidateRolls(() => values[index++] ?? 0)).toEqual(values);
  });

  it('describes the selected capsule contents below the choices', () => {
    const copy = starterSelectCopy();
    const cereus = MONSTERS.find((monster) => monster.id === 'cereus');
    if (!cereus) throw new Error('cereus missing');
    const summary = starterChoiceSummary(cereus);

    expect(copy.prompt).toBe('함께할 패시몬을 선택해주세요');
    expect(summary.title).toBe('세레우톡스');
    expect(summary.lines).toContain('세레우스균 (Bacillus cereus)');
    expect(summary.lines).toContain('계열: 세균');
    expect(summary.lines).toContain(`HP ${cereus.maxHp} · 공격 ${cereus.attack} · 방어 ${cereus.defense}`);
    expect(summary.lines.join(' ')).not.toContain('속도');
  });

  it('keeps starter selection to one capsule at a time', () => {
    const first = addStarterSelection([], STARTER_ID);
    const replaced = addStarterSelection(first, 'cereus');

    expect(first).toEqual([STARTER_ID]);
    expect(replaced).toEqual(['cereus']);
    expect(canStartWithStarterSelection([])).toBe(false);
    expect(canStartWithStarterSelection(first)).toBe(true);
    expect(canStartWithStarterSelection([STARTER_ID, 'cereus'])).toBe(false);
  });

  it('places three capsule slots across the opened case', () => {
    const slots = starterCapsuleSlots();

    expect(slots).toHaveLength(3);
    expect(slots.map((slot) => slot.markerY)).toEqual([206, 206, 206]);
    expect(slots.map((slot) => slot.x)).toEqual([356, 512, 668]);
  });

  it('keeps a selected starter visibly enlarged without adding a second selection ring', () => {
    expect(starterSlotVisual(false, true)).toMatchObject({
      capsuleSize: 56,
      spriteSize: 104,
    });
    expect(starterSlotVisual(false, false)).toMatchObject({
      capsuleSize: 52,
      spriteSize: 96,
    });
  });
});

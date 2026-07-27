import type { RunMode, RunState, VisualStyle } from '../types/game';
import type { RunCheckpoint, RunResumeScene } from './runCheckpoint';

export const RUN_SAVE_SLOT_COUNT = 5;
const SAVE_SCHEMA_VERSION = 1;
const STORAGE_KEY_PREFIX = 'pathimon-run-save-v1-';

export interface RunSaveSlot {
  schemaVersion: typeof SAVE_SCHEMA_VERSION;
  savedAt: string;
  floor: number;
  mode: RunMode;
  visualStyle: VisualStyle;
  partyNames: string[];
  sceneKey: RunResumeScene;
  state: RunState;
}

function storageKey(slotIndex: number): string {
  return `${STORAGE_KEY_PREFIX}${slotIndex + 1}`;
}

function validSlotIndex(slotIndex: number): boolean {
  return Number.isInteger(slotIndex) && slotIndex >= 0 && slotIndex < RUN_SAVE_SLOT_COUNT;
}

function isRunSaveSlot(value: unknown): value is RunSaveSlot {
  if (!value || typeof value !== 'object') return false;
  const slot = value as Partial<RunSaveSlot>;
  return (
    slot.schemaVersion === SAVE_SCHEMA_VERSION
    && typeof slot.savedAt === 'string'
    && typeof slot.floor === 'number'
    && slot.floor > 0
    && (slot.sceneKey === 'BattleScene' || slot.sceneKey === 'BossIntroScene')
    && Boolean(slot.state)
    && slot.state?.floor === slot.floor
    && Array.isArray(slot.state?.party)
  );
}

export function loadRunSaveSlots(storage: Storage = window.localStorage): Array<RunSaveSlot | null> {
  return Array.from({ length: RUN_SAVE_SLOT_COUNT }, (_, slotIndex) => {
    const saved = storage.getItem(storageKey(slotIndex));
    if (!saved) return null;

    try {
      const parsed = JSON.parse(saved) as unknown;
      return isRunSaveSlot(parsed) ? parsed : null;
    } catch {
      return null;
    }
  });
}

export function writeRunSaveSlot(
  slotIndex: number,
  checkpoint: RunCheckpoint,
  storage: Storage = window.localStorage,
  savedAt = new Date(),
): RunSaveSlot {
  if (!validSlotIndex(slotIndex)) {
    throw new RangeError(`invalid run save slot: ${slotIndex}`);
  }

  const slot: RunSaveSlot = {
    schemaVersion: SAVE_SCHEMA_VERSION,
    savedAt: savedAt.toISOString(),
    floor: checkpoint.state.floor,
    mode: checkpoint.state.mode,
    visualStyle: checkpoint.state.visualStyle,
    partyNames: checkpoint.state.party.map((monster) => monster.name),
    sceneKey: checkpoint.sceneKey,
    state: checkpoint.state,
  };
  const detached = JSON.parse(JSON.stringify(slot)) as RunSaveSlot;
  storage.setItem(storageKey(slotIndex), JSON.stringify(detached));
  return detached;
}

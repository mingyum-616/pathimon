import type { RunState } from '../types/game';

export type RunResumeScene = 'BattleScene' | 'BossIntroScene';

export interface RunCheckpoint {
  sceneKey: RunResumeScene;
  state: RunState;
}

let activeCheckpoint: RunCheckpoint | undefined;
let activeFloorKey = '';

function cloneCheckpoint(checkpoint: RunCheckpoint): RunCheckpoint {
  return JSON.parse(JSON.stringify(checkpoint)) as RunCheckpoint;
}

function floorKey(state: RunState): string {
  return `${state.bgmSeed}:${state.mode}:${state.floor}`;
}

export function captureFloorCheckpoint(state: RunState, sceneKey: RunResumeScene): void {
  const key = floorKey(state);
  if (activeCheckpoint && activeFloorKey === key) return;

  activeCheckpoint = cloneCheckpoint({ sceneKey, state });
  activeFloorKey = key;
}

export function getActiveRunCheckpoint(): RunCheckpoint | undefined {
  return activeCheckpoint ? cloneCheckpoint(activeCheckpoint) : undefined;
}

export function restoreActiveRunCheckpoint(checkpoint: RunCheckpoint): void {
  activeCheckpoint = cloneCheckpoint(checkpoint);
  activeFloorKey = floorKey(checkpoint.state);
}

export function clearActiveRunCheckpoint(): void {
  activeCheckpoint = undefined;
  activeFloorKey = '';
}

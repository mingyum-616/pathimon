import type Phaser from 'phaser';
import { stopHtmlBattleBgm } from '../audio/htmlBgm';
import { FONT_FAMILY } from '../game/constants';
import {
  getActiveRunCheckpoint,
  restoreActiveRunCheckpoint,
  type RunCheckpoint,
} from './runCheckpoint';
import {
  loadRunSaveSlots,
  writeRunSaveSlot,
  type RunSaveSlot,
} from './runSaveStore';

type RunSaveDialogMode = 'save' | 'load';

interface PendingSlotAction {
  mode: RunSaveDialogMode;
  slotIndex: number;
}

export function defaultRunSaveDialogMode(hasActiveCheckpoint: boolean): RunSaveDialogMode {
  return hasActiveCheckpoint ? 'save' : 'load';
}

export function runSaveSlotSummary(slot: RunSaveSlot): { primary: string; secondary: string } {
  const mode = slot.mode === 'learning' ? '학습모드' : '도전모드';
  const style = slot.visualStyle === 'micro' ? '실사풍' : '캐릭터풍';
  return {
    primary: `${slot.floor}층 · ${mode} · ${style}`,
    secondary: `파티 ${slot.partyNames.length}마리 · ${slot.partyNames.join(', ')}`,
  };
}

function button(label: string): HTMLButtonElement {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  Object.assign(element.style, {
    background: '#211b2d',
    border: '2px solid #5b5170',
    color: '#f4f0ff',
    cursor: 'pointer',
    fontFamily: FONT_FAMILY,
  });
  return element;
}

function stopRunningScenes(game: Phaser.Game, runningKeys: string[]): void {
  runningKeys.forEach((key) => game.scene.stop(key));
  game.sound.stopAll();
  stopHtmlBattleBgm();
}

function resumeCheckpoint(game: Phaser.Game, runningKeys: string[], checkpoint: RunCheckpoint): void {
  stopRunningScenes(game, runningKeys);
  restoreActiveRunCheckpoint(checkpoint);
  game.scene.start(checkpoint.sceneKey, { state: checkpoint.state });
}

export function openRunSaveDialog(game: Phaser.Game): void {
  const activeCheckpoint = getActiveRunCheckpoint();
  const runningKeys = game.scene.getScenes(true).map((scene) => scene.scene.key);
  runningKeys.forEach((key) => game.scene.pause(key));

  let mode = defaultRunSaveDialogMode(Boolean(activeCheckpoint));
  let pendingAction: PendingSlotAction | undefined;
  let status = '';

  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', '저장 및 불러오기');
  Object.assign(overlay.style, {
    alignItems: 'center',
    background: 'rgba(8, 10, 18, 0.86)',
    display: 'flex',
    inset: '0',
    justifyContent: 'center',
    padding: '14px',
    position: 'fixed',
    zIndex: '10040',
  });

  const panel = document.createElement('section');
  Object.assign(panel.style, {
    background: '#302840',
    border: '2px solid #72d6ff',
    color: '#f4f0ff',
    fontFamily: FONT_FAMILY,
    maxHeight: '94vh',
    maxWidth: '720px',
    overflowY: 'auto',
    padding: '20px',
    width: 'min(92vw, 720px)',
  });

  const dismiss = (resumeScenes = true): void => {
    overlay.remove();
    if (resumeScenes) runningKeys.forEach((key) => game.scene.resume(key));
  };

  const render = (): void => {
    const slots = loadRunSaveSlots();
    panel.replaceChildren();

    const header = document.createElement('div');
    Object.assign(header.style, {
      alignItems: 'start',
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '14px',
    });
    const headingGroup = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = '저장 및 불러오기';
    Object.assign(title.style, { fontSize: '26px', margin: '0 0 4px' });
    const subtitle = document.createElement('p');
    subtitle.textContent = activeCheckpoint
      ? `현재 ${activeCheckpoint.state.floor}층의 시작 상태를 저장합니다.`
      : '저장된 게임을 선택해 이어서 진행합니다.';
    Object.assign(subtitle.style, {
      color: '#c9c2d6',
      fontSize: '14px',
      lineHeight: '1.5',
      margin: '0',
    });
    headingGroup.append(title, subtitle);
    const close = button('닫기');
    Object.assign(close.style, {
      borderColor: '#d64541',
      fontSize: '14px',
      minHeight: '36px',
      padding: '5px 18px',
    });
    close.addEventListener('click', () => dismiss());
    header.append(headingGroup, close);
    panel.appendChild(header);

    const tabs = document.createElement('div');
    Object.assign(tabs.style, {
      display: 'grid',
      gap: '8px',
      gridTemplateColumns: '1fr 1fr',
      marginBottom: '12px',
    });
    (['save', 'load'] as const).forEach((tabMode) => {
      const tab = button(tabMode === 'save' ? '저장' : '불러오기');
      const disabled = tabMode === 'save' && !activeCheckpoint;
      tab.disabled = disabled;
      Object.assign(tab.style, {
        background: mode === tabMode ? '#4a405d' : '#211b2d',
        borderColor: mode === tabMode ? '#72d6ff' : '#5b5170',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: '17px',
        minHeight: '40px',
        opacity: disabled ? '0.45' : '1',
      });
      tab.addEventListener('click', () => {
        if (disabled) return;
        mode = tabMode;
        pendingAction = undefined;
        status = '';
        render();
      });
      tabs.appendChild(tab);
    });
    panel.appendChild(tabs);

    const instruction = document.createElement('p');
    instruction.textContent = status || (
      mode === 'save'
        ? '슬롯을 선택하세요. 불러오면 이 층의 전투 시작 시점으로 돌아옵니다.'
        : '이어갈 저장 슬롯을 선택하세요.'
    );
    Object.assign(instruction.style, {
      color: status ? '#72d6ff' : '#d6d0e2',
      fontSize: '14px',
      lineHeight: '1.5',
      margin: '0 0 10px',
      minHeight: '22px',
    });
    panel.appendChild(instruction);

    const slotList = document.createElement('div');
    Object.assign(slotList.style, {
      display: 'grid',
      gap: '8px',
    });

    slots.forEach((slot, slotIndex) => {
      const slotButton = button('');
      const unavailable = mode === 'load' && !slot;
      slotButton.disabled = unavailable;
      slotButton.ariaLabel = slot
        ? `슬롯 ${slotIndex + 1}, ${slot.floor}층`
        : `슬롯 ${slotIndex + 1}, 빈 슬롯`;
      Object.assign(slotButton.style, {
        alignItems: 'center',
        background: '#282135',
        borderColor: unavailable ? '#463d55' : '#5b5170',
        cursor: unavailable ? 'default' : 'pointer',
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: '72px minmax(0, 1fr) 126px',
        minHeight: '64px',
        opacity: unavailable ? '0.5' : '1',
        padding: '8px 12px',
        textAlign: 'left',
        width: '100%',
      });

      const number = document.createElement('strong');
      number.textContent = `슬롯 ${slotIndex + 1}`;
      Object.assign(number.style, { color: '#72d6ff', fontSize: '16px' });
      const details = document.createElement('span');
      Object.assign(details.style, {
        display: 'grid',
        gap: '3px',
        minWidth: '0',
      });
      const primary = document.createElement('strong');
      const secondary = document.createElement('span');
      if (slot) {
        const summary = runSaveSlotSummary(slot);
        primary.textContent = summary.primary;
        secondary.textContent = summary.secondary;
      } else {
        primary.textContent = '빈 슬롯';
        secondary.textContent = mode === 'save' ? '새 게임을 저장할 수 있습니다.' : '저장된 게임이 없습니다.';
      }
      Object.assign(primary.style, {
        fontSize: '15px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      });
      Object.assign(secondary.style, {
        color: '#c9c2d6',
        fontSize: '12px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      });
      details.append(primary, secondary);

      const timestamp = document.createElement('span');
      timestamp.textContent = slot
        ? new Intl.DateTimeFormat('ko-KR', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(slot.savedAt))
        : mode === 'save' ? '저장' : '사용 불가';
      Object.assign(timestamp.style, {
        color: slot ? '#d6d0e2' : '#9e94ae',
        fontSize: '13px',
        textAlign: 'right',
      });
      slotButton.append(number, details, timestamp);
      slotButton.addEventListener('click', () => {
        if (mode === 'save') {
          if (!activeCheckpoint) return;
          if (slot) {
            pendingAction = { mode, slotIndex };
            status = `슬롯 ${slotIndex + 1}의 저장 데이터를 덮어쓸까요?`;
            render();
            return;
          }
          writeRunSaveSlot(slotIndex, activeCheckpoint);
          status = `슬롯 ${slotIndex + 1}에 ${activeCheckpoint.state.floor}층을 저장했습니다.`;
          render();
          return;
        }

        if (!slot) return;
        pendingAction = { mode, slotIndex };
        status = `슬롯 ${slotIndex + 1}의 ${slot.floor}층부터 이어서 진행할까요?`;
        render();
      });
      slotList.appendChild(slotButton);
    });
    panel.appendChild(slotList);

    if (pendingAction) {
      const confirmation = document.createElement('div');
      Object.assign(confirmation.style, {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
        marginTop: '12px',
      });
      const cancel = button('취소');
      const confirm = button(pendingAction.mode === 'save' ? '덮어쓰기' : '불러오기');
      [cancel, confirm].forEach((element) => {
        Object.assign(element.style, {
          fontSize: '15px',
          minHeight: '38px',
          padding: '6px 22px',
        });
      });
      confirm.style.borderColor = pendingAction.mode === 'save' ? '#d64541' : '#72d6ff';
      cancel.addEventListener('click', () => {
        pendingAction = undefined;
        status = '';
        render();
      });
      confirm.addEventListener('click', () => {
        const action = pendingAction;
        if (!action) return;

        if (action.mode === 'save' && activeCheckpoint) {
          writeRunSaveSlot(action.slotIndex, activeCheckpoint);
          pendingAction = undefined;
          status = `슬롯 ${action.slotIndex + 1}에 ${activeCheckpoint.state.floor}층을 저장했습니다.`;
          render();
          return;
        }

        const saved = loadRunSaveSlots()[action.slotIndex];
        if (!saved) return;
        dismiss(false);
        resumeCheckpoint(game, runningKeys, {
          sceneKey: saved.sceneKey,
          state: saved.state,
        });
      });
      confirmation.append(cancel, confirm);
      panel.appendChild(confirmation);
    }

    const firstSlot = slotList.querySelector<HTMLButtonElement>('button:not(:disabled)');
    firstSlot?.focus();
  };

  overlay.addEventListener('pointerdown', (event) => {
    if (event.target === overlay) dismiss();
  });
  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss();
    }
  });
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  render();
}

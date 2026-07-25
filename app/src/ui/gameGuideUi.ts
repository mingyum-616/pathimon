import { RESISTANCE_FLOOR } from '../battle/effectiveness';
import { MAX_STATUS_CONDITION_STACKS } from '../data/statusConditions';

export interface GameGuideSection {
  title: string;
  lines: string[];
}

export interface GameGuideContent {
  title: string;
  subtitle: string;
  sections: GameGuideSection[];
  continueLabel: string;
}

export interface GameGuideLineLayout {
  lineHeight: number;
  maxLines: number;
  secondLineOffset: number;
}

export function gameGuideLineLayout(): GameGuideLineLayout {
  return {
    lineHeight: 48,
    maxLines: 2,
    secondLineOffset: 48,
  };
}

export interface GameGuideChip {
  label: string;
  tone: 'strong' | 'medium' | 'neutral';
}

// 배율은 안내문 한가운데 묻혀 있으면 안 읽힌다. 머리말에 칩으로 세워 둔다.
export function gameGuideMultiplierChips(): GameGuideChip[] {
  return [
    { label: '직접 처치 ×4', tone: 'strong' },
    { label: '간접 처치 ×2', tone: 'medium' },
    { label: '무관 ×1', tone: 'neutral' },
  ];
}

// 첫 플레이에서 가장 먼저 막히는 두 단어만 미리 풀어 준다.
export function gameGuideGlossaryLine(): string {
  return '처치 = 약·치료법 · 예고 = 상대가 다음 턴에 쓸 처치';
}

export function gameGuideContent(): GameGuideContent {
  return {
    title: '전투 안내',
    subtitle: '모드 선택 전에 핵심 규칙을 확인하세요.',
    continueLabel: '모드 선택',
    sections: [
      {
        title: '피해 계산',
        lines: [
          '데미지 공식은 포켓몬 본가 시리즈를 따릅니다.',
          '적의 공격은 직접적인 처치 4배, 간접적인 처치 2배, 무관한 처치 1배로 반영됩니다.',
          'OX 퀴즈를 맞히면 포획에 확정적으로 성공합니다. 오답 피해: 학습모드 20%, 도전모드 40%.',
        ],
      },
      {
        title: '행동 순서',
        lines: [
          '전투에서는 항상 패시몬이 먼저 행동합니다.',
          '상대가 예고한 처치와 내 패시몬을 비교하여 교체 타이밍을 잡는 것이 중요합니다.',
          '교체해도 턴을 소비하지 않습니다.',
        ],
      },
      {
        title: '기술과 예고',
        lines: [
          '패시몬의 기술은 준비기, 공격기, 전용기로 나뉘며 전용기는 전투당 한 번만 사용할 수 있습니다.',
          '도전모드에서는 이상한 사탕으로 해금됩니다.',
          '보스는 체력이 절반 이하가 되면 2페이즈에 돌입해 한 턴에 두 가지 처치를 예고하고 사용합니다.',
        ],
      },
      {
        title: '상태와 증상',
        lines: [
          '상태이상과 증상은 누적되며, 상태이상은 실제로 전투에 영향을 끼치고, 증상은 텍스트만 표기됩니다.',
          `상태이상은 종류별로 ${MAX_STATUS_CONDITION_STACKS}스택까지만 쌓입니다.`,
          '상태이상을 누적시켜 전투를 승리로 이끌어 보세요!',
        ],
      },
      {
        title: '보스 방어특성',
        lines: [
          '보스는 10층마다 방어특성이 1개씩 늘어납니다. 계열·감염 경로·외피·서식 위치·크기 축으로 나뉩니다.',
          '예: 기생충학 마스터(기생충 계열 반감), 마스크(호흡기 경로 반감), 알코올 소독(피막 바이러스 반감).',
          `방어특성은 중첩되지만 누적 반감은 ×${RESISTANCE_FLOOR}에서 멈춥니다. 파티를 여러 타입으로 채워보세요!`,
        ],
      },
    ],
  };
}

// 안내 화면은 2열 × 2행 고정 패널이라 한 페이지에 네 항목까지 들어간다.
export const GAME_GUIDE_SECTIONS_PER_PAGE = 4;

export function gameGuidePageCount(content: GameGuideContent = gameGuideContent()): number {
  return Math.max(1, Math.ceil(content.sections.length / GAME_GUIDE_SECTIONS_PER_PAGE));
}

export function gameGuidePageSections(page: number, content: GameGuideContent = gameGuideContent()): GameGuideSection[] {
  const clamped = Math.min(Math.max(0, page), gameGuidePageCount(content) - 1);
  const start = clamped * GAME_GUIDE_SECTIONS_PER_PAGE;
  return content.sections.slice(start, start + GAME_GUIDE_SECTIONS_PER_PAGE);
}

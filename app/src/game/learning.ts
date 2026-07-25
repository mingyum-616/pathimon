import type { MoveId, RuntimeMonster } from '../types/game';

export function sanitizeLearningText(text: string): string {
  return text.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
}

export function conciseLearningFeedback(text: string, maxLength = 140): string {
  const sanitized = sanitizeLearningText(text);
  if (!sanitized) return '';

  const firstSentence = sanitized.split(/(?<=[.!?])\s+(?=[가-힣A-Z0-9])/)[0] ?? sanitized;
  if (firstSentence.length <= maxLength) return firstSentence;

  const clipped = firstSentence.slice(0, Math.max(1, maxLength - 1));
  const lastSpace = clipped.lastIndexOf(' ');
  const boundary = lastSpace >= Math.floor(maxLength * 0.6) ? lastSpace : clipped.length;
  return `${clipped.slice(0, boundary).trimEnd()}…`;
}

export function randomLearningPoint(
  monster: Pick<RuntimeMonster, 'profileMemo'> | undefined,
  random: () => number = Math.random,
): string {
  const points = monster?.profileMemo?.filter((line) => line.trim().length > 0) ?? [];
  if (points.length === 0) return '';

  const index = Math.min(points.length - 1, Math.max(0, Math.floor(random() * points.length)));
  return points[index] ?? '';
}

type LearningMonster = Pick<RuntimeMonster, 'profileMemo' | 'movePointMap'> | undefined;

interface CaptureQuizMonster {
  id?: string;
  name: string;
  profileMemo?: string[];
  templateId?: string;
}

export interface CaptureQuiz {
  answer: boolean;
  statement: string;
}

function quizStatement(text: string): string {
  return sanitizeLearningText(text)
    .replace(/^L\d+\s*(?:\[[^\]]+\])?\s*/, '')
    .trim();
}

export function createCaptureQuiz(
  target: CaptureQuizMonster,
  catalog: CaptureQuizMonster[],
  random: () => number = Math.random,
): CaptureQuiz {
  const targetPoints = target.profileMemo?.filter((line) => quizStatement(line).length > 0) ?? [];
  const targetId = target.templateId ?? target.id;
  const decoys = catalog.filter((monster) => (
    (monster.templateId ?? monster.id) !== targetId
    && monster.profileMemo?.some((line) => quizStatement(line).length > 0)
  ));
  const useTarget = random() < 0.5 || decoys.length === 0;
  const source = useTarget
    ? target
    : decoys[Math.min(decoys.length - 1, Math.floor(random() * decoys.length))];
  const points = source.profileMemo?.filter((line) => quizStatement(line).length > 0) ?? targetPoints;
  const point = points[Math.min(points.length - 1, Math.max(0, Math.floor(random() * points.length)))] ?? '';

  return {
    answer: useTarget,
    statement: quizStatement(point) || `${target.name}은 현재 분류와 일치하는 특징을 가진다.`,
  };
}

// 기술을 쓰면 그 기술에 묶인 학습포인트를 보여준다(맥락 연결). 매핑이 없으면 무작위로 폴백한다.
export function contextualLearningPoint(
  monster: LearningMonster,
  moveId: MoveId,
  random: () => number = Math.random,
): string {
  const memo = monster?.profileMemo ?? [];
  const mapped = (monster?.movePointMap?.[moveId] ?? [])
    .map((position) => memo[position])
    .filter((line): line is string => Boolean(line && line.trim().length > 0));

  if (mapped.length > 0) {
    const index = Math.min(mapped.length - 1, Math.max(0, Math.floor(random() * mapped.length)));
    return mapped[index] ?? '';
  }

  return randomLearningPoint(monster, random);
}

// 어느 기술에도 묶이지 않은 학습포인트(순수 감별점·역학) — 학습모드 전용으로 표출한다.
export function leftoverLearningPoints(monster: LearningMonster): string[] {
  const memo = monster?.profileMemo ?? [];
  const mapped = new Set<number>();
  for (const indices of Object.values(monster?.movePointMap ?? {})) {
    for (const position of indices) mapped.add(position);
  }
  return memo.filter((line, position) => !mapped.has(position) && line.trim().length > 0);
}

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

export interface CaptureQuiz {
  answer: boolean;
  statement: string;
  explain?: string;
}

function quizStatement(text: string): string {
  return sanitizeLearningText(text)
    .replace(/^L\d+\s*(?:\[[^\]]+\])?\s*/, '')
    .trim();
}

type CaptureQuizSource = Pick<RuntimeMonster, 'name' | 'captureQuiz' | 'profileMemo'> | undefined;

// 포획 OX 퀴즈를 고른다. 노트 저작 항목(`포획 OX:`)이 있으면 무작위 1개를 낸다.
// 없으면 **자기 학습포인트 1개를 정답 O 문항으로** 폴백한다(저작 이행기 한정).
// 이전 방식(타 병원체 학습포인트를 오답으로 뽑던 createCaptureQuiz)은 폐기했다.
// 공통 병독인자·치료제·같은 속 문장이 대상에게도 참인데 X로 강제돼 오정보를 정답으로 만들었기 때문이다.
export function pickCaptureQuiz(
  monster: CaptureQuizSource,
  random: () => number = Math.random,
): CaptureQuiz {
  const authored = monster?.captureQuiz ?? [];
  if (authored.length > 0) {
    const index = Math.min(authored.length - 1, Math.max(0, Math.floor(random() * authored.length)));
    const item = authored[index]!;
    return { statement: item.statement, answer: item.answer, explain: item.explain };
  }

  const point = randomLearningPoint(monster, random);
  const statement = point ? quizStatement(point) : '';
  return {
    statement: statement || `${monster?.name ?? '이 패시몬'}은 현재 분류와 일치하는 특징을 가진다.`,
    answer: true,
    explain: statement,
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

import { describe, expect, it } from 'vitest';
import type { RuntimeMonster } from '../types/game';
import {
  conciseLearningFeedback,
  pickCaptureQuiz,
  contextualLearningPoint,
  leftoverLearningPoints,
  randomLearningPoint,
  sanitizeLearningText,
} from './learning';

function monsterWithLearningPoints(points?: string[]): RuntimeMonster {
  return {
    templateId: 'test',
    name: '테스트몬',
    scientificName: 'Testimon example',
    category: '세균',
    glyph: 'TST',
    tags: {},
    maxHp: 60,
    hp: 60,
    attack: 60,
    defense: 60,
    speed: 1,
    captureRate: 0.5,
    ability: 'none',
    abilities: [],
    moveset: [],
    profileMemo: points,
    effects: [],
    statusConditions: {},
    stunned: false,
    fainted: false,
    isBoss: false,
  };
}

describe('learning points', () => {
  it('selects one numbered learning point with an injected random roll', () => {
    const monster = monsterWithLearningPoints([
      'L1 [감별점] 첫 번째 포인트',
      'L2 [기전] 두 번째 포인트',
      'L3 [치료] 세 번째 포인트',
    ]);

    expect(randomLearningPoint(monster, () => 0)).toBe('L1 [감별점] 첫 번째 포인트');
    expect(randomLearningPoint(monster, () => 0.99)).toBe('L3 [치료] 세 번째 포인트');
  });

  it('ignores blank lines and falls back when no learning point exists', () => {
    const monster = monsterWithLearningPoints(['', '  ', 'L1 [감별점] 유효한 포인트']);
    const emptyMonster = monsterWithLearningPoints();

    expect(randomLearningPoint(monster, () => 0.5)).toBe('L1 [감별점] 유효한 포인트');
    expect(randomLearningPoint(emptyMonster, () => 0.5)).toBe('');
  });

  it('shows a point mapped to the used move, and falls back to random when unmapped', () => {
    const monster = monsterWithLearningPoints([
      'L1 [감별점] 포인트 A',
      'L2 [기전] 포인트 B',
      'L3 [치료] 포인트 C',
      'L4 [역학] 포인트 D',
    ]);
    monster.movePointMap = { atk: [1, 2] }; // atk → L2·L3

    expect(contextualLearningPoint(monster, 'atk', () => 0)).toBe('L2 [기전] 포인트 B');
    expect(contextualLearningPoint(monster, 'atk', () => 0.99)).toBe('L3 [치료] 포인트 C');
    // 매핑 없는 기술은 무작위 폴백(전체 풀).
    expect(contextualLearningPoint(monster, 'unmapped', () => 0)).toBe('L1 [감별점] 포인트 A');
  });

  it('collects unmapped points as learning-mode leftovers', () => {
    const monster = monsterWithLearningPoints([
      'L1 [감별점] 포인트 A',
      'L2 [기전] 포인트 B',
      'L3 [치료] 포인트 C',
      'L4 [역학] 포인트 D',
    ]);
    monster.movePointMap = { atk: [1, 2] };

    expect(leftoverLearningPoints(monster)).toEqual(['L1 [감별점] 포인트 A', 'L4 [역학] 포인트 D']);
  });

  it('removes note markup and keeps combat feedback to one concise sentence', () => {
    const text = 'L4 [기전] **장열**을 일으킨다. 두 번째 문장은 도감에서 확인한다.';

    expect(sanitizeLearningText(text)).toBe('장열을 일으킨다. 두 번째 문장은 도감에서 확인한다.');
    expect(conciseLearningFeedback(text)).toBe('장열을 일으킨다.');
  });

  it('shortens a single very long sentence at a word boundary', () => {
    const text = `L7 [생활사] ${'감염 경로를 따라 이동한다 '.repeat(12).trim()}.`;
    const feedback = conciseLearningFeedback(text, 70);

    expect(feedback.length).toBeLessThanOrEqual(71);
    expect(feedback.endsWith('…')).toBe(true);
    expect(feedback).not.toContain('**');
  });

  it('picks an authored capture OX item (O/X with explanation)', () => {
    const monster = monsterWithLearningPoints(['L1 [감별점] 그람음성 막대균이다.']);
    monster.captureQuiz = [
      { statement: '이 균은 그람양성이다.', answer: false, explain: 'L1 [감별점] 그람음성 막대균이다.', sourceL: 1 },
      { statement: '이 균은 그람음성 막대균이다.', answer: true, explain: '그람음성 막대균이다.', sourceL: 1 },
    ];

    expect(pickCaptureQuiz(monster, () => 0)).toEqual({
      statement: '이 균은 그람양성이다.',
      answer: false,
      explain: '그람음성 막대균이다.',
    });
    expect(pickCaptureQuiz(monster, () => 0.9)).toEqual({
      statement: '이 균은 그람음성 막대균이다.',
      answer: true,
      explain: '그람음성 막대균이다.',
    });
  });

  it('falls back to a safe self-O statement (no cross-pathogen decoys) when no OX is authored', () => {
    const monster = monsterWithLearningPoints(['L1 [감별점] 대상 패시몬의 실제 특징이다.']);
    // 저작된 포획 OX가 없으면 자기 학습포인트를 정답 O로만 낸다 — 타 병원체 오답 강제(오정보) 불가.
    expect(pickCaptureQuiz(monster, () => 0)).toEqual({
      statement: '대상 패시몬의 실제 특징이다.',
      answer: true,
      explain: '대상 패시몬의 실제 특징이다.',
    });
  });
});

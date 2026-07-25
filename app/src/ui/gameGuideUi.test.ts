import { describe, expect, it } from 'vitest';
import {
  GAME_GUIDE_SECTIONS_PER_PAGE,
  gameGuideContent,
  gameGuideLineLayout,
  gameGuidePageCount,
  gameGuidePageSections,
} from './gameGuideUi';

describe('game guide UI content', () => {
  it('summarizes the battle rules before mode selection', () => {
    const content = gameGuideContent();
    const text = content.sections.flatMap((section) => [section.title, ...section.lines]).join(' ');

    expect(content.title).toBe('전투 안내');
    expect(content.continueLabel).toBe('모드 선택');
    expect(text).toContain('데미지 공식은 포켓몬 본가 시리즈를 따릅니다.');
    expect(text).toContain('적의 공격은 직접적인 처치 4배, 간접적인 처치 2배, 무관한 처치 1배로 반영됩니다.');
    expect(text).toContain('항상 패시몬이 먼저');
    expect(text).not.toContain('항상 병원체 패시몬이');
    expect(text).toContain('이상한 사탕으로 해금됩니다.');
    expect(text).toContain('상태이상은 실제로 전투에 영향을 끼치고');
    expect(text).toContain('증상은 텍스트만 표기됩니다.');
    expect(text).toContain('상태이상을 누적시켜 전투를 승리로 이끌어 보세요!');
    expect(text).toContain('상태이상은 종류별로 5스택까지만 쌓입니다.');
    expect(text).toContain('보스는 10층마다 방어특성이 1개씩 늘어납니다.');
    expect(text).toContain('누적 반감은 ×0.25에서 멈춥니다.');
    expect(text).toContain('파티를 여러 타입으로 채워보세요!');
    expect(text).toContain('2페이즈에 돌입해');
    // 굳이 알려줄 필요 없는 내부 수치는 노출하지 않는다.
    expect(text).not.toContain('MAX처럼 표시');
    expect(text).not.toContain('편차가 압축');
    expect(text).not.toContain('최대 체력 기준');
    expect(text).not.toContain('교체 보상은 최대');
    expect(text).toContain('패시몬의 기술은 준비기, 공격기');
    expect(text).toContain('두 가지 처치를 예고하고 사용합니다.');
    expect(text).toContain('상대가 예고한 처치와 내 패시몬을 비교하여 교체 타이밍을 잡는 것이 중요합니다.');
    expect(text).toContain('교체해도 턴을 소비하지 않습니다.');
    expect(text).toContain('OX 퀴즈를 맞히면 포획에 확정적으로 성공합니다.');
    expect(text).toContain('학습모드 20%');
    expect(text).toContain('도전모드 40%');
    expect(text).not.toContain('대처 기술');
    expect(text).not.toContain('봉인');

    const statusSection = content.sections.find((section) => section.title === '상태와 증상');
    expect(statusSection?.lines[statusSection.lines.length - 1])
      .toBe('상태이상을 누적시켜 전투를 승리로 이끌어 보세요!');
  });

  it('paginates sections so no page overflows the 2x2 panel grid', () => {
    const content = gameGuideContent();
    const pageCount = gameGuidePageCount(content);

    expect(pageCount).toBeGreaterThan(1);

    const paged = Array.from({ length: pageCount }, (_, page) => gameGuidePageSections(page, content));

    expect(paged.flat()).toEqual(content.sections);
    for (const sections of paged) {
      expect(sections.length).toBeLessThanOrEqual(GAME_GUIDE_SECTIONS_PER_PAGE);
      // 셀 높이는 196px, 제목 36px + 줄당 46px이라 세 줄이 한계다.
      for (const section of sections) {
        expect(section.lines.length).toBeLessThanOrEqual(3);
      }
    }
  });

  it('clamps out-of-range page requests to the available pages', () => {
    expect(gameGuidePageSections(-5)).toEqual(gameGuidePageSections(0));
    expect(gameGuidePageSections(99)).toEqual(gameGuidePageSections(gameGuidePageCount() - 1));
  });

  it('reserves fixed non-overlapping boxes for wrapped guide lines', () => {
    const layout = gameGuideLineLayout();

    expect(layout.lineHeight).toBeGreaterThanOrEqual(42);
    expect(layout.maxLines).toBe(2);
    expect(layout.secondLineOffset).toBeGreaterThanOrEqual(layout.lineHeight);
  });
});

import { describe, expect, it } from 'vitest';
import {
  ENDING_CREDITS,
  ENDING_CREDITS_DURATION_MS,
  ENDING_FINAL_COPY,
} from './endingCredits';

describe('ending curtain-call credits', () => {
  it('scrolls for 15 seconds and includes every requested collaborator', () => {
    const fullCredits = ENDING_CREDITS.flatMap((entry) => [entry.role, entry.names]).join(' ');

    expect(ENDING_CREDITS_DURATION_MS).toBe(15_000);
    expect(fullCredits).toContain('박민겸');
    expect(fullCredits).toContain('Claude');
    expect(fullCredits).toContain('GPT/Codex');
    expect(fullCredits).toContain('Gemini');
  });

  it('places the two advisers together in a brief middle credit', () => {
    const adviceIndex = ENDING_CREDITS.findIndex((entry) => entry.role === '조언');

    expect(ENDING_CREDITS[adviceIndex]?.names).toBe('박헌구 · 오지운');
    expect(adviceIndex).toBeGreaterThan(1);
    expect(adviceIndex).toBeLessThan(ENDING_CREDITS.length - 2);
  });

  it('credits Pokerogue for the BGM', () => {
    expect(ENDING_CREDITS).toContainEqual({ role: 'BGM', names: '포켓로그' });
  });

  it('ends by naming the students as the protagonists', () => {
    expect(ENDING_FINAL_COPY.hero).toBe('감염과 면역을 수강한 여러분');
    expect(ENDING_FINAL_COPY.cheer).toBe('수고하셨습니다. 화이팅!');
  });
});

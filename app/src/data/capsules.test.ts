import { describe, expect, it } from 'vitest';
import { capsuleCanCatch, capsuleOrderForMode } from './capsules';
import type { RuntimeMonster } from '../types/game';

function enemyWithCategory(category: string): RuntimeMonster {
  return {
    templateId: 'test',
    name: category,
    scientificName: category,
    category,
    glyph: 'T',
    tags: {},
    maxHp: 10,
    hp: 10,
    attack: 5,
    defense: 5,
    speed: 5,
    captureRate: 0.5,
    ability: 'none',
    moveset: ['alpha_toxin'],
    effects: [],
    stunned: false,
    fainted: false,
    isBoss: false,
  };
}

describe('capsule type matching', () => {
  it('shows only the universal capsule in learning mode', () => {
    expect(capsuleOrderForMode('learning')).toEqual(['universal']);
    expect(capsuleOrderForMode('challenge')).toEqual([
      'universal',
      'virus',
      'bacteria',
      'parasite',
      'fungus',
      'protozoa',
      'prion',
    ]);
  });

  it('treats bacterial subtype labels as bacteria capsule targets', () => {
    expect(capsuleCanCatch('bacteria', enemyWithCategory('세균'))).toBe(true);
    expect(capsuleCanCatch('bacteria', enemyWithCategory('세균 병원형'))).toBe(true);
    expect(capsuleCanCatch('bacteria', enemyWithCategory('세균 내성형'))).toBe(true);
    expect(capsuleCanCatch('bacteria', enemyWithCategory('박테리아'))).toBe(true);
  });

  it('treats parasite stage labels as parasite capsule targets', () => {
    expect(capsuleCanCatch('parasite', enemyWithCategory('선충-유충'))).toBe(true);
    expect(capsuleCanCatch('parasite', enemyWithCategory('선충-성충'))).toBe(true);
    expect(capsuleCanCatch('parasite', enemyWithCategory('흡충-충란'))).toBe(true);
    expect(capsuleCanCatch('parasite', enemyWithCategory('반크림프-유충'))).toBe(true);
  });
});

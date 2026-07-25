import { describe, expect, it } from 'vitest';
import { interpolatePathimonName, withParticle } from './text';

describe('Korean particles', () => {
  it('selects subject, topic, and object particles from the final consonant', () => {
    expect(withParticle('시겔러시', '이')).toBe('시겔러시가');
    expect(withParticle('대장콜리', '이')).toBe('대장콜리가');
    expect(withParticle('페스틱', '이')).toBe('페스틱이');
    expect(withParticle('시겔러시', '은')).toBe('시겔러시는');
    expect(withParticle('페스틱', '을')).toBe('페스틱을');
  });

  it('selects companion and directional particles', () => {
    expect(withParticle('시겔러시', '와')).toBe('시겔러시와');
    expect(withParticle('페스틱', '와')).toBe('페스틱과');
    expect(withParticle('시겔러시', '으로')).toBe('시겔러시로');
    expect(withParticle('페스틱', '으로')).toBe('페스틱으로');
    expect(withParticle('캡슐', '으로')).toBe('캡슐로');
  });

  it('interpolates every supported particle after a pathimon name', () => {
    expect(interpolatePathimonName('{name}이 {name}와 {name}(으)로 간다.', '시겔러시'))
      .toBe('시겔러시가 시겔러시와 시겔러시로 간다.');
  });
});

import { describe, expect, it } from 'vitest';
import { createMaintenanceInventory } from './shop';

describe('maintenance shop data', () => {
  it('orders one random capsule and five fixed maintenance items', () => {
    const inventory = createMaintenanceInventory(5);

    expect(inventory).toHaveLength(6);
    expect(inventory.map((item) => item.id)).toEqual([
      'slot-capsule-a',
      'slot-potion-a',
      'slot-potion-b',
      'slot-rare-candy',
      'slot-evolution-stone',
      'slot-gene-splicer',
    ]);
    expect(inventory.filter((item) => item.kind === 'capsule')).toHaveLength(1);
  });

  it('prices and describes selected-target maintenance items clearly', () => {
    const inventory = createMaintenanceInventory(5);

    expect(inventory.find((item) => item.id === 'slot-potion-a')?.price).toBe(1);
    expect(inventory.find((item) => item.id === 'slot-potion-b')?.price).toBe(3);
    expect(inventory.find((item) => item.id === 'slot-rare-candy')?.price).toBe(2);
    expect(inventory.find((item) => item.id === 'slot-evolution-stone')?.price).toBe(2);
    expect(inventory.find((item) => item.id === 'slot-potion-a')?.description).toContain('선택한 패시몬 1마리');
    expect(inventory.find((item) => item.id === 'slot-potion-b')?.description).toContain('모든 패시몬');
    expect(inventory.find((item) => item.id === 'slot-rare-candy')?.description).toContain('전용기를 해금');
    expect(inventory.find((item) => item.id === 'slot-evolution-stone')?.description).toContain('진화');
  });

  it('describes capsules by what they can capture', () => {
    const capsules = new Map(
      Array.from({ length: 24 }, (_, index) => createMaintenanceInventory(index + 1))
        .flat()
        .filter((item) => item.kind === 'capsule')
        .map((item) => [item.name, item]),
    );

    expect([...capsules.keys()].sort()).toEqual([
      '기생충 캡슐',
      '만능 캡슐',
      '바이러스 캡슐',
      '세균 캡슐',
      '원생동물 캡슐',
      '진균 캡슐',
      '프리온 캡슐',
    ]);
    expect(capsules.get('만능 캡슐')?.price).toBe(2);
    expect(capsules.get('만능 캡슐')?.capsuleId).toBe('universal');
    expect(capsules.get('만능 캡슐')?.imagePath).toBe('images/capsules/universal.png');
    expect([...capsules.values()].every((item) => item.description.endsWith('패시몬을 포획할 수 있습니다.'))).toBe(true);
    expect([...capsules.values()].some((item) => item.description.includes('상정'))).toBe(false);
  });
});

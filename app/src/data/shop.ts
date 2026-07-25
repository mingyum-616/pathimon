import type { ShopItem } from '../types/game';

type ShopItemTemplate = Omit<ShopItem, 'id' | 'purchased'>;

const CAPSULE_TEMPLATES: ShopItemTemplate[] = [
  {
    kind: 'capsule',
    capsuleId: 'virus',
    name: '바이러스 캡슐',
    price: 1,
    imagePath: 'images/capsules/virus.png',
    description: '바이러스 계열 패시몬을 포획할 수 있습니다.',
  },
  {
    kind: 'capsule',
    capsuleId: 'bacteria',
    name: '세균 캡슐',
    price: 1,
    imagePath: 'images/capsules/bacteria.png',
    description: '세균 계열 패시몬을 포획할 수 있습니다.',
  },
  {
    kind: 'capsule',
    capsuleId: 'parasite',
    name: '기생충 캡슐',
    price: 1,
    imagePath: 'images/capsules/parasite.png',
    description: '기생충 계열 패시몬을 포획할 수 있습니다.',
  },
  {
    kind: 'capsule',
    capsuleId: 'fungus',
    name: '진균 캡슐',
    price: 1,
    imagePath: 'images/capsules/fungus.png',
    description: '진균 계열 패시몬을 포획할 수 있습니다.',
  },
  {
    kind: 'capsule',
    capsuleId: 'protozoa',
    name: '원생동물 캡슐',
    price: 1,
    imagePath: 'images/capsules/protozoa.png',
    description: '원생동물 계열 패시몬을 포획할 수 있습니다.',
  },
  {
    kind: 'capsule',
    capsuleId: 'prion',
    name: '프리온 캡슐',
    price: 1,
    imagePath: 'images/capsules/prion.png',
    description: '프리온 계열 패시몬을 포획할 수 있습니다.',
  },
  {
    kind: 'capsule',
    capsuleId: 'universal',
    name: '만능 캡슐',
    price: 2,
    imagePath: 'images/capsules/universal.png',
    description: '모든 계열 패시몬을 포획할 수 있습니다.',
  },
];

const FIXED_TEMPLATES: ShopItemTemplate[] = [
  {
    kind: 'potion',
    name: '상처약',
    price: 1,
    imagePath: 'images/items/potion.png',
    description: '선택한 패시몬 1마리를 회복합니다.',
  },
  {
    kind: 'advancedPotion',
    name: '고급 상처약',
    price: 3,
    imagePath: 'images/items/super_potion.png',
    description: '소지 중인 모든 패시몬을 회복합니다.',
  },
  {
    kind: 'rareCandy',
    name: '이상한 사탕',
    price: 2,
    imagePath: 'images/items/rare_candy.png',
    description: '패시몬 1마리의 전용기를 해금합니다.',
  },
  {
    kind: 'evolutionStone',
    name: '진화의 돌',
    price: 2,
    imagePath: 'images/items/evolution_stone.png',
    description: '패시몬 1마리를 진화시킵니다.',
  },
  {
    kind: 'geneSplicer',
    name: '유전자 쐐기',
    price: 0,
    imagePath: 'images/items/dna_splicers.png',
    description: '아직 기능 준비 중입니다.',
  },
];

function cloneTemplate(template: ShopItemTemplate, id: string): ShopItem {
  return {
    ...template,
    id,
    purchased: false,
  };
}

export function createMaintenanceInventory(floor: number, roll = 0): ShopItem[] {
  const baseIndex = Math.abs(Math.floor((floor + roll) * 997)) % CAPSULE_TEMPLATES.length;
  const capsuleA = cloneTemplate(CAPSULE_TEMPLATES[baseIndex], 'slot-capsule-a');

  return [
    capsuleA,
    cloneTemplate(FIXED_TEMPLATES[0], 'slot-potion-a'),
    cloneTemplate(FIXED_TEMPLATES[1], 'slot-potion-b'),
    cloneTemplate(FIXED_TEMPLATES[2], 'slot-rare-candy'),
    cloneTemplate(FIXED_TEMPLATES[3], 'slot-evolution-stone'),
    cloneTemplate(FIXED_TEMPLATES[4], 'slot-gene-splicer'),
  ];
}

export function shopItemAssetPaths(): string[] {
  return [...CAPSULE_TEMPLATES, ...FIXED_TEMPLATES].map((item) => item.imagePath);
}

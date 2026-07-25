import type { AbilityData, AbilityId } from '../types/game';

export const ABILITIES: Record<AbilityId, AbilityData> = {
  none: { id: 'none', name: '무방비' },
  capsule: { id: 'capsule', name: '피막장벽' },
  catalase: { id: 'catalase', name: '활성산소중화' },
  proteinA: { id: 'proteinA', name: '항체무력화' },
  comp_evade: { id: 'comp_evade', name: '보체회피' },
  acidfast: { id: 'acidfast', name: '항산성막' },
  biofilm: { id: 'biofilm', name: '바이오필름' },
  antigen_var: { id: 'antigen_var', name: '항원변이' },
  latency: { id: 'latency', name: '잠복' },
  phagolysosome_block: { id: 'phagolysosome_block', name: '식포융합차단' },
  oxidative_neutral: { id: 'oxidative_neutral', name: '활성산소중화' },
  immune_cell_kill: { id: 'immune_cell_kill', name: '면역세포살해' },
  large_resistance: { id: 'large_resistance', name: '대형저항' },
  antigen_disguise: { id: 'antigen_disguise', name: '항원위장' },
  spore: { id: 'spore', name: '포자내성' },
  no_nucleic: { id: 'no_nucleic', name: '무핵산' },
  barrier: { id: 'barrier', name: '물리장벽' },
  comp_patrol: { id: 'comp_patrol', name: '보체순환' },
  epithelial_barrier: {
    id: 'epithelial_barrier',
    name: '상피장벽',
    description: '확산·용해 기술 피해를 0.5배로 줄입니다.',
    resistTag: {
      pathway: {
        skin: 0.5,
        transcutaneous: 0.5,
      },
    },
  },
  mucociliary: {
    id: 'mucociliary',
    name: '점액섬모',
    description: '확산·용해 기술 피해를 0.5배로 줄입니다.',
    resistTag: {
      pathway: {
        respiratory: 0.5,
      },
    },
  },
  gastric_acid: {
    id: 'gastric_acid',
    name: '위산',
    description: '확산·용해·독소 기술 피해를 0.5배로 줄입니다.',
    resistTag: {
      pathway: {
        gut: 0.5,
      },
    },
  },
  microbiota_defense: {
    id: 'microbiota_defense',
    name: '정상균총',
    description: '확산·용해 기술 피해를 0.5배로 줄입니다.',
    resistTag: {
      reservoir: {
        microbiota: 0.5,
      },
    },
  },
  iron_limitation: { id: 'iron_limitation', name: '철제한', description: '용해 기술 피해를 0.5배로 줄입니다.' },
  antitoxin: { id: 'antitoxin', name: '항독소', description: '독소 기술 피해를 무효화합니다.' },
  receptor_defect: {
    id: 'receptor_defect',
    name: '수용체결핍',
    description: '용해·독소·특수 기술 피해를 0.5배로 줄입니다.',
  },
  immune_regulation: {
    id: 'immune_regulation',
    name: '면역조절',
    description: '면역매개 기술 피해를 0.5배로 줄입니다.',
  },
  parasite_master: {
    id: 'parasite_master',
    name: '기생충학 마스터',
    description: '기생충 계열 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistCategory: { 기생충: 0.5, 연충: 0.5, 선충: 0.5, 흡충: 0.5, 조충: 0.5 },
  },
  mask: {
    id: 'mask',
    name: '마스크',
    description: '호흡기 경로 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistTag: {
      pathway: {
        respiratory: 0.5,
      },
    },
  },

  // ── 보스(사람) 방어특성 ──────────────────────────────────────────────
  // 전부 ×0.5이고 중첩된다. 다만 누적 반감은 battle/effectiveness.ts의 RESISTANCE_FLOOR(0.25)에서 멈춘다.
  // 축을 나눠 둬서 파티를 한 계열·한 경로로만 채우면 후반 보스에게 화력이 죽도록 설계했다.

  // 계열 축
  virology_master: {
    id: 'virology_master',
    name: '바이러스학 마스터',
    description: '바이러스 계열 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistCategory: { 바이러스: 0.5 },
  },
  bacteriology_master: {
    id: 'bacteriology_master',
    name: '세균학 마스터',
    description: '세균 계열 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistCategory: { 세균: 0.5, '세균 병원형': 0.5, '세균 내성형': 0.5, 박테리아: 0.5 },
  },
  mycology_master: {
    id: 'mycology_master',
    name: '진균학 마스터',
    description: '진균 계열 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistCategory: { 진균: 0.5, 곰팡이: 0.5 },
  },
  protozoology_master: {
    id: 'protozoology_master',
    name: '원충학 마스터',
    description: '원충 계열 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistCategory: { 원충: 0.5, 원생동물: 0.5, 프로토조아: 0.5 },
  },

  // 감염 경로 축
  hand_hygiene: {
    id: 'hand_hygiene',
    name: '손위생',
    description: '접촉 경로 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistTag: { pathway: { contact: 0.5 } },
  },
  food_safety: {
    id: 'food_safety',
    name: '식품위생',
    description: '소화기 경로 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistTag: { pathway: { gut: 0.5 } },
  },
  safer_sex: {
    id: 'safer_sex',
    name: '성매개 차단',
    description: '성접촉 경로 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistTag: { pathway: { sexual: 0.5 } },
  },
  blood_screening: {
    id: 'blood_screening',
    name: '혈액 선별검사',
    description: '혈액 경로 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistTag: { pathway: { blood: 0.5 } },
  },
  wound_asepsis: {
    id: 'wound_asepsis',
    name: '무균 창상관리',
    description: '상처·피부·경피 경로 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistTag: { pathway: { wound: 0.5, skin: 0.5, transcutaneous: 0.5 } },
  },
  vector_control: {
    id: 'vector_control',
    name: '매개체 방제',
    description: '모기·수생 달팽이를 매개로 하는 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistTag: { vector: { mosquito: 0.5, freshwater_snail: 0.5 } },
  },

  // 구조 축
  alcohol_disinfection: {
    id: 'alcohol_disinfection',
    name: '알코올 소독',
    description: '피막 바이러스에게 받는 피해를 0.5배로 줄입니다. 지질 피막은 알코올에 약합니다.',
    resistTag: { wall: { enveloped_virus: 0.5 } },
  },
  bcg_memory: {
    id: 'bcg_memory',
    name: 'BCG 면역기억',
    description: '항산성 마이코박테리아에게 받는 피해를 0.5배로 줄입니다.',
    resistTag: { wall: { mycobacterial: 0.5 } },
  },
  endotoxin_neutralization: {
    id: 'endotoxin_neutralization',
    name: '내독소 중화',
    description: '그람음성 패시몬에게 받는 피해를 0.5배로 줄입니다. LPS를 붙잡아 무력화합니다.',
    resistTag: { wall: { gram_negative: 0.5 } },
  },

  // 위치·크기 축
  ctl_surveillance: {
    id: 'ctl_surveillance',
    name: '세포독성T 감시',
    description: '세포 안에 숨은 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistTag: {
      location: {
        intracellular: 0.5,
        intracellular_cytosol: 0.5,
        intracellular_phagosome: 0.5,
      },
    },
  },
  humoral_patrol: {
    id: 'humoral_patrol',
    name: '체액성 순찰',
    description: '세포 밖·혈관에 있는 패시몬에게 받는 피해를 0.5배로 줄입니다.',
    resistTag: { location: { extracellular: 0.5, vascular: 0.5 } },
  },
  eosinophil_recruitment: {
    id: 'eosinophil_recruitment',
    name: '호산구 동원',
    description: '대형 기생충에게 받는 피해를 0.5배로 줄입니다.',
    resistTag: { size: { large: 0.5 } },
  },
  cyst: { id: 'cyst', name: '낭종' },
  larval_migration: { id: 'larval_migration', name: '유충이행' },
  autoinfection: { id: 'autoinfection', name: '자가감염' },
  acid_tolerance: { id: 'acid_tolerance', name: '위산저항' },
  environmental_resistance: { id: 'environmental_resistance', name: '환경저항' },
  iron_piracy: { id: 'iron_piracy', name: '철획득' },
  tissue_migration: { id: 'tissue_migration', name: '조직이행' },
  lysozyme: {
    id: 'lysozyme',
    name: '라이소자임',
    description: '그람양성 패시몬에게 받는 피해를 0.5배로 줄입니다. 두꺼운 펩티도글리칸을 끊습니다.',
    resistTag: {
      wall: {
        gram_positive: 0.5,
      },
    },
  },
};

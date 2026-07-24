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
    description: '기생충 타입 패시몬에게 받는 직접 피해를 0.5배로 줄입니다.',
  },
  mask: {
    id: 'mask',
    name: '점액섬모',
    resistTag: {
      pathway: {
        respiratory: 0.5,
      },
    },
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
    resistTag: {
      wall: {
        gram_positive: 0.5,
      },
    },
  },
};

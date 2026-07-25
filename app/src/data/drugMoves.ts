import type { AttackType, MonsterData, MoveData, MoveId } from '../types/game';
import { withParticle } from '../game/text';
import { NOTE_MONSTERS } from './pathimonNoteData';

// 뭉쳐 있던 약물 계열 기술(항바이러스제 투약 등)을 개별 약물 기술(아시클로버 투여 등)로 분리한다.
// 각 패시몬 대처법의 약물명 → 계열을 파서가 넘겨주므로(directDrugClasses), 실제 등장한 약물마다 기술을 자동 생성한다.
// 면역·백신·물리제거·대증은 약물이 아니라 계열 기술을 유지한다(moves.ts / bossAttackMatchups.ts).

// 처치 계열 → 적 기술 템플릿(타입·위력·명중·표시 라벨). 타입은 표시·상성표(패시몬→적)용이고, ×4 판정은 targetTags로 한다.
const CLASS_MOVE_TEMPLATE: Record<string, { type: AttackType; power: number; accuracy: number; typeLabel: string }> = {
  세포벽억제: { type: 'cell_wall_drug', power: 18, accuracy: 0.9, typeLabel: '세포벽억제' },
  단백합성억제: { type: 'protein_synthesis_drug', power: 16, accuracy: 0.88, typeLabel: '단백합성억제' },
  핵산합성억제: { type: 'targeted_antibacterial', power: 17, accuracy: 0.88, typeLabel: '핵산합성억제' },
  엽산대사억제: { type: 'targeted_antibacterial', power: 16, accuracy: 0.88, typeLabel: '엽산대사억제' },
  세포막공격: { type: 'targeted_antibacterial', power: 17, accuracy: 0.86, typeLabel: '세포막공격' },
  항결핵제: { type: 'targeted_antibacterial', power: 17, accuracy: 0.88, typeLabel: '항결핵제' },
  항바이러스제: { type: 'antiviral_replication', power: 16, accuracy: 0.9, typeLabel: '항바이러스제' },
  항기생충제: { type: 'anthelmintic', power: 18, accuracy: 0.86, typeLabel: '항기생충제' },
  항진균제: { type: 'antifungal_membrane', power: 17, accuracy: 0.88, typeLabel: '항진균제' },
  항원충제: { type: 'protein_synthesis_drug', power: 17, accuracy: 0.88, typeLabel: '항원충제' },
  항독소: { type: 'antitoxin_therapy', power: 15, accuracy: 0.92, typeLabel: '항독소' },
};

function drugMoveId(drug: string): MoveId {
  return `m_rx_${drug}`;
}

// 모든 노트에서 약물 → 계열을 모은다(약물이 처음 등장하는 계열 채택).
function aggregateDrugClasses(monsters: MonsterData[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const monster of monsters) {
    const classes = monster.countermeasures?.directDrugClasses ?? {};
    for (const [drug, cls] of Object.entries(classes)) {
      if (!map.has(drug) && CLASS_MOVE_TEMPLATE[cls]) map.set(drug, cls);
    }
  }
  return map;
}

const DRUG_CLASS_MAP = aggregateDrugClasses(NOTE_MONSTERS);

export const DRUG_MOVES: Record<MoveId, MoveData> = Object.fromEntries(
  [...DRUG_CLASS_MAP.entries()].map(([drug, cls]) => {
    const template = CLASS_MOVE_TEMPLATE[cls]!;
    const id = drugMoveId(drug);
    const move: MoveData = {
      id,
      name: `${drug} 투여`,
      type: template.type,
      typeLabel: template.typeLabel,
      power: template.power,
      accuracy: template.accuracy,
      description: `${drug}로 병원체를 직접 겨눈다.`,
      learnText: `${withParticle(drug, '은')} ${template.typeLabel} 계열 처치다.`,
      targetTags: [drug],
    };
    return [id, move] as const;
  }),
);

export const DRUG_MOVE_IDS: MoveId[] = Object.keys(DRUG_MOVES);

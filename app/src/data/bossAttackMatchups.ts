import type { MoveId } from '../types/game';
import { DRUG_MOVE_IDS } from './drugMoves';

// 면역·대증·물리제거·백신은 계열 기술을 유지한다(약물이 아님).
// 약물 계열(세포벽억제·항바이러스제 등)은 data/drugMoves.ts에서 노트 대처법의 약물별로 자동 생성해 합친다.
const NON_DRUG_ENEMY_MOVE_IDS: MoveId[] = [
  // 면역
  'm_phago',
  'm_opsonin',
  'm_antibody',
  'm_complement',
  'm_ctl',
  'm_th1',
  'm_th2',
  'm_interferon',
  'm_oxidative_burst',
  // 물리제거·지지
  'm_surgery_drainage',
  'm_rehydration',
  // ×2 전파차단 — 구 `환경차단` 한 칸을 VOCAB v2.8이 7개로 쪼갠 것. 어느 경로를 끊는 처치인지가 계열로 드러난다.
  'm_heat_sterilization',
  'm_water_food_hygiene',
  'm_hand_hygiene',
  'm_vector_control',
  'm_sterilization_isolation',
  'm_exposure_barrier',
  'm_reinfection_block',
  // ×2 대증(증상 완화) — 증상/상태이상 태그를 겨눈다.
  'm_antipyretic',
  'm_analgesic',
  'm_antidiarrheal',
  'm_antitussive',
  'm_antiemetic',
  // ×4 백신·항체.
  'm_vaccination',
];

export const BOSS_ATTACK_MOVE_IDS: MoveId[] = [...NON_DRUG_ENEMY_MOVE_IDS, ...DRUG_MOVE_IDS];

export type AttackType =
  | 'lysis'
  | 'toxin'
  | 'superantigen'
  | 'spread'
  | 'endotoxin'
  | 'immune_mediated'
  | 'special'
  | 'misfold'
  | 'phago'
  | 'oxidative'
  | 'net'
  | 'opsonin'
  | 'antibody'
  | 'complement'
  | 'ctl'
  | 'th1'
  | 'th2'
  | 'interferon'
  | 'cell_wall_drug'
  | 'protein_synthesis_drug'
  | 'targeted_antibacterial'
  | 'antifungal_membrane'
  | 'anthelmintic'
  | 'antitoxin_therapy'
  | 'antiviral_replication';
export type BossAttackType = AttackType;
export type TagAxis = 'pathway' | 'wall' | 'location' | 'size' | 'vector' | 'oxygen' | 'reservoir' | 'stage';
export type TagValue =
  | 'respiratory'
  | 'gut'
  | 'blood'
  | 'wound'
  | 'skin'
  | 'mucosal'
  | 'urinary'
  | 'contact'
  | 'sexual'
  | 'transcutaneous'
  | 'gram_positive'
  | 'gram_negative'
  | 'mycobacterial'
  | 'enveloped_virus'
  | 'retrovirus'
  | 'fungal'
  | 'fungal_dimorphic'
  | 'fungal_hypha'
  | 'protozoa'
  | 'nematode'
  | 'trematode'
  | 'cestode'
  | 'none'
  | 'extracellular'
  | 'intracellular'
  | 'intracellular_cytosol'
  | 'intracellular_phagosome'
  | 'erythrocyte'
  | 'tissue_invasive'
  | 'intestinal_lumen'
  | 'vascular'
  | 'microscopic'
  | 'large'
  | 'mosquito'
  | 'freshwater_snail'
  | 'aerobic'
  | 'microbiota'
  | 'environment'
  | 'larva_adult';
export type AbilityId =
  | 'none'
  | 'capsule'
  | 'catalase'
  | 'proteinA'
  | 'comp_evade'
  | 'acidfast'
  | 'biofilm'
  | 'antigen_var'
  | 'spore'
  | 'no_nucleic'
  | 'barrier'
  | 'comp_patrol'
  | 'mask'
  | 'lysozyme'
  | 'latency'
  | 'phagolysosome_block'
  | 'oxidative_neutral'
  | 'immune_cell_kill'
  | 'large_resistance'
  | 'antigen_disguise'
  | 'epithelial_barrier'
  | 'mucociliary'
  | 'gastric_acid'
  | 'microbiota_defense'
  | 'iron_limitation'
  | 'antitoxin'
  | 'receptor_defect'
  | 'immune_regulation'
  | 'parasite_master'
  // VOCAB.md §2-3 evasion 중 기존 값으로 표현되지 않던 것 (구 파서는 large_resistance로 뭉갰다)
  | 'cyst'
  | 'larval_migration'
  | 'autoinfection'
  | 'acid_tolerance'
  | 'environmental_resistance'
  | 'iron_piracy'
  // 성충이 조직을 옮겨 다니며 정착을 회피한다. `larval_migration`(유충)과 생활사 단계가 다르다.
  | 'tissue_migration'
  // 보스(사람) 전용 방어특성. 10층마다 1개씩 늘어나 후반 보스의 난도를 만든다(state/factory.ts selectBossAbilities).
  // 계열 축 — 공격해 오는 패시몬의 category를 본다.
  | 'virology_master'
  | 'bacteriology_master'
  | 'mycology_master'
  | 'protozoology_master'
  // 감염 경로 축 — 공격해 오는 패시몬의 pathway 태그를 본다.
  | 'hand_hygiene'
  | 'food_safety'
  | 'safer_sex'
  | 'blood_screening'
  | 'wound_asepsis'
  | 'vector_control'
  // 구조 축 — wall 태그를 본다.
  | 'alcohol_disinfection'
  | 'bcg_memory'
  | 'endotoxin_neutralization'
  // 위치·크기 축.
  | 'ctl_surveillance'
  | 'humoral_patrol'
  | 'eosinophil_recruitment';
export type MoveId = string;

export interface CountermeasureProfile {
  direct: string[];
  symptomTags: string[];
  // 직접 처치약 이름 → 처치 계열(세포벽억제 등). 약물별 적 기술 자동 생성에 쓴다(data/drugMoves.ts).
  directDrugClasses?: Record<string, string>;
}

export type StatusConditionId =
  | 'fever'
  | 'dehydration'
  | 'fatigue'
  | 'vomiting'
  | 'excretory_dysfunction'
  | 'cough'
  | 'blood_pressure'
  | 'dyspnea'
  | 'edema'
  | 'neurologic'
  | 'paralysis'
  | 'bleeding'
  | 'anemia'
  | 'immune_abnormal'
  | 'necrosis'
  | 'blindness'
  | 'hearing_abnormal'
  | 'pain'
  | 'itching'
  | 'jaundice';

export type StatusConditionStacks = Partial<Record<StatusConditionId, number>>;

export interface Tags {
  pathway?: TagValue;
  wall?: TagValue;
  location?: TagValue;
  size?: TagValue;
  vector?: TagValue;
  oxygen?: TagValue;
  reservoir?: TagValue;
  stage?: TagValue;
}

export type EffectPrimitive =
  | { kind: 'buff'; stat: 'attack' | 'defense'; pct: number; turns: number; target: 'self' | 'enemy'; rank?: number; stacks?: number }
  | { kind: 'status'; status: 'confusion' | 'stun'; chance: number; turns?: number; target: 'self' | 'enemy'; stacks?: number }
  | { kind: 'condition'; condition: StatusConditionId; chance: number; target: 'self' | 'enemy'; stacks?: number }
  | { kind: 'invuln'; turns: number; target: 'self' | 'enemy'; stacks?: number }
  | { kind: 'field'; side: 'incoming'; factor: number; turns: number; target: 'self' | 'enemy'; stacks?: number }
  | { kind: 'dot'; power: number; turns: number; target: 'self' | 'enemy'; stacks?: number }
  | { kind: 'convert'; power: number; target: 'self' | 'enemy'; stacks?: number }
  | { kind: 'heal'; pct: number; target: 'self' | 'enemy'; stacks?: number }
  // 준비기 독소벼림: 다음에 적에게 부여하는 상태이상 스택을 multiplier배로 키운다(1회 소모).
  | { kind: 'empower_status'; multiplier: number; turns?: number; target: 'self'; stacks?: number };

export type MoveSlot = MoveId | null;

export interface MoveOutcome {
  chance: number;
  description: string;
  effectText?: string;
  effects?: EffectPrimitive[];
  learnText: string;
  power?: number;
  symptom?: string;
}

export interface MoveStageData {
  description: string;
  effectText?: string;
  effects?: EffectPrimitive[];
  learnText: string;
  name: string;
  power: number;
  symptom?: string;
}

export interface AbilityData {
  id: AbilityId;
  name: string;
  description?: string;
  resistTag?: Partial<Record<TagAxis, Partial<Record<TagValue, number>>>>;
  // 공격해 오는 패시몬의 `category`(계열)로 반감한다. 태그가 아니라 계열 축이라 resistTag와 별도로 둔다.
  resistCategory?: Record<string, number>;
}

export interface MoveData {
  id: MoveId;
  kind?: 'attack' | 'prep' | 'signature';
  name: string;
  type: AttackType;
  typeLabel?: string;
  power: number;
  accuracy: number;
  signature?: boolean;
  description: string;
  effectText?: string;
  learnText: string;
  effects?: EffectPrimitive[];
  outcomes?: MoveOutcome[];
  stageCycle?: MoveStageData[];
  symptom?: string;
  targetTags?: string[];
}

// 포획 OX 퀴즈 한 문항. 노트의 `포획 OX:` 섹션에서 파싱한다.
// answer: O=true, X=false. explain: 근거 학습포인트(L#) 원문 — 답한 뒤 해설로 보여준다.
export interface CaptureQuizItem {
  statement: string;
  answer: boolean;
  explain: string;
  sourceL: number;
}

export interface MonsterData {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  glyph: string;
  tags: Tags;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  captureRate: number;
  assetBaseId?: string;
  ability: AbilityId;
  abilities?: AbilityId[];
  learnset: MoveId[];
  profileMemo?: string[];
  // 기술 사용 시 맥락 학습을 위해, 기술 → profileMemo 인덱스 매핑(노트 `기술↔학습포인트 대응`).
  movePointMap?: Record<MoveId, number[]>;
  // 야생 포획 시 내는 OX 퀴즈(노트 `포획 OX:`). 종당 4~5문항.
  captureQuiz?: CaptureQuizItem[];
  countermeasures?: CountermeasureProfile;
  prep?: MoveId;
  signature?: MoveId;
  evolvesTo?: string;
  legendary?: boolean;
}

export interface BossData {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  glyph: string;
  assetPath: string;
  maxHp: number;
  attack: number;
  defense: number;
  abilityPool: AbilityId[];
  fixedAbilities?: AbilityId[];
  movePool: MoveId[];
  symptoms: string[];
  encounterDialogue?: string[];
  phase2Dialogue?: string[];
  fixedAttack?: number;
  finalBossSkill?: FinalBossSkillId;
  finalBossSkillName?: string;
  finalBossSkillDialogue?: string[];
  finalBossSkillAnnouncement?: string;
}

export type FinalBossSkillId = 'parasitization' | 'seal' | 'keen_eye' | 'nk_activation';

export interface TrainerData {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  glyph: string;
  assetPath: string;
  maxHp: number;
  attack: number;
  defense: number;
  movePool: MoveId[];
}

export interface ActiveEffect {
  kind: EffectPrimitive['kind'] | 'confusion';
  source?: 'switch';
  stat?: 'attack' | 'defense';
  status?: 'confusion' | 'stun';
  pct?: number;
  rank?: number;
  side?: 'incoming';
  factor?: number;
  power?: number;
  turns?: number;
  multiplier?: number;
}

export interface RuntimeMonster {
  templateId: string;
  name: string;
  scientificName: string;
  category: string;
  glyph: string;
  tags: Tags;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  captureRate: number;
  assetBaseId?: string;
  ability: AbilityId;
  abilities?: AbilityId[];
  moveset: MoveId[];
  moveSlots?: MoveSlot[];
  moveStages?: Partial<Record<MoveId, number>>;
  plannedMoveId?: MoveId;
  sealedMoveIds?: MoveId[];
  bossMaintenanceQueued?: boolean;
  plannedMoveIds?: MoveId[];
  bossPhase2Activated?: boolean;
  bossPhase2Pending?: boolean;
  encounterDialogue?: string[];
  phase2Dialogue?: string[];
  finalBossSkill?: FinalBossSkillId;
  finalBossSkillName?: string;
  finalBossSkillDialogue?: string[];
  finalBossSkillAnnouncement?: string;
  finalBossSkillApplied?: boolean;
  parasitizationStage?: 'armed' | 'egg' | 'adult';
  parasitizationEggTurnsRemaining?: number;
  parasitizationBaseName?: string;
  sealedByBoss?: boolean;
  sealedOriginalName?: string;
  spriteCrop?: {
    frontX: number;
    backX: number;
    width: number;
    height: number;
  };
  profileMemo?: string[];
  // 기술 사용 시 맥락 학습을 위해, 기술 → profileMemo 인덱스 매핑(노트 `기술↔학습포인트 대응`).
  movePointMap?: Record<MoveId, number[]>;
  // 야생 포획 시 내는 OX 퀴즈(노트 `포획 OX:`). 종당 4~5문항.
  captureQuiz?: CaptureQuizItem[];
  countermeasures?: CountermeasureProfile;
  // 진화 조건. 이 패시몬을 내보낸 채로 끝낸 전투 수. 지나가기는 세지 않는다.
  battlesCompleted?: number;
  // 이번 전투에 한 번이라도 나왔는지. 승리 시 battlesCompleted로 정산하고 지운다.
  enteredCurrentBattle?: boolean;
  effects: ActiveEffect[];
  statusConditions?: StatusConditionStacks;
  stunned: boolean;
  fainted: boolean;
  isBoss: boolean;
  isTrainer?: boolean;
  assetPath?: string;
  symptoms?: string[];
  symptomAttributions?: SymptomAttribution[];
  signatureUnlocked?: boolean;
  usedSignatureMoveIds?: MoveId[];
}

export interface SymptomAttribution {
  symptom: string;
  sourceName: string;
}

export type RunMode = 'learning' | 'challenge';
export type VisualStyle = 'character' | 'micro';
export type EncounterKind = 'wild' | 'trainer' | 'boss';
export type CapsuleId = 'universal' | 'virus' | 'bacteria' | 'parasite' | 'fungus' | 'protozoa' | 'prion';
export type CapsuleInventory = Record<CapsuleId, number>;

export type BattlePhase =
  | 'story'
  | 'battle'
  | 'shop'
  | 'floorClear'
  | 'forcedSwitch'
  | 'releaseCapture'
  | 'bossIntro'
  | 'victory'
  | 'defeat';

export type HitEffectiveness = 'none' | 'normal' | 'super';

export type ShopItemKind = 'capsule' | 'potion' | 'advancedPotion' | 'rareCandy' | 'evolutionStone' | 'geneSplicer';

export interface ShopItem {
  id: string;
  kind: ShopItemKind;
  capsuleId?: CapsuleId;
  name: string;
  price: number;
  imagePath: string;
  purchased: boolean;
  description: string;
}

export interface RunState {
  floor: number;
  bgmSeed: number;
  mode: RunMode;
  visualStyle: VisualStyle;
  money: number;
  capsules: number;
  capsuleInventory: CapsuleInventory;
  wildRosterIds?: string[];
  bossRosterIds?: string[];
  party: RuntimeMonster[];
  activeIndex: number;
  enemy: RuntimeMonster | null;
  pendingCapture?: RuntimeMonster;
  pendingCaptureCapsuleId?: CapsuleId;
  encounterKind: EncounterKind;
  phase: BattlePhase;
  lastLog: string;
  battleResultLog?: string;
  battleActionLog?: string;
  battleStatusLog?: string;
  battleStatusDamage?: {
    player: number;
    enemy: number;
  };
  lastEnemyHitEffectiveness?: HitEffectiveness;
  lastPlayerHitEffectiveness?: HitEffectiveness;
  battleStatUpCue?: {
    stat: 'attack';
    target: 'player' | 'enemy';
  };
  pendingSwitchAttackReward?: boolean;
  shopInventory?: ShopItem[];
  shopRefreshCount?: number;
}

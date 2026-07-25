import type {
  AbilityId,
  AttackType,
  CaptureQuizItem,
  CountermeasureProfile,
  EffectPrimitive,
  MonsterData,
  MoveData,
  MoveId,
  MoveOutcome,
  MoveStageData,
  StatusConditionId,
  TagValue,
} from '../types/game';
import { withParticle } from '../game/text';

interface NoteMoveResult {
  chance: number;
  description: string;
  effect: string;
  learnText: string;
  power?: number;
  stage?: string;
  statusConditions: string;
  symptom?: string;
}

interface NoteMove {
  accuracy: number;
  description: string;
  effect: string;
  kind?: MoveData['kind'];
  learnText: string;
  name: string;
  power: number;
  resultPowers: number[];
  results: NoteMoveResult[];
  type: AttackType;
  typeLabel?: string;
}

interface ParsedPathimonNote {
  category: string;
  countermeasures: CountermeasureProfile;
  defenseAbilities: AbilityId[];
  koreanScientificName: string;
  memo: string[];
  moves: NoteMove[];
  name: string;
  scientificName: string;
  tags: Partial<Record<'pathway' | 'wall' | 'location' | 'size', TagValue>>;
}

export interface PathimonNoteBuildOptions {
  captureRate: number;
  defaultStats: {
    attack: number;
    defense: number;
    maxHp: number;
  };
  fallbackName?: string;
  glyph: string;
  id: string;
  moveIds?: Partial<Record<string, MoveId>>;
}

interface BuiltPathimonNoteData {
  monster: MonsterData;
  moves: Partial<Record<MoveId, MoveData>>;
}

const ATTACK_TYPE_BY_NOTE_VALUE: Record<string, AttackType> = {
  준비: 'special',
  독소: 'toxin',
  효소독소: 'toxin',
  효소: 'toxin',
  방어: 'special',
  특수: 'special',
  침습: 'spread',
  부착: 'special',
  소화기: 'toxin',
  호흡기: 'lysis',
  이동: 'spread',
  전파: 'spread',
  만성: 'immune_mediated',
  신경: 'toxin',
  잠복: 'special',
  눈: 'lysis',
  증식: 'special',
  유전: 'special',
  흡혈: 'lysis',
  요로: 'lysis',
  내성: 'special',
  대형기생: 'lysis',
  조직융해: 'spread',
  조직이행: 'spread',
  혈관: 'lysis',
  세포용해: 'lysis',
  면역매개: 'immune_mediated',
};

const KIND_BY_NOTE_VALUE: Record<string, MoveData['kind']> = {
  준비기: 'prep',
  공격기: 'attack',
  전용기: 'signature',
};

const TAG_BY_NOTE_VALUE: Record<string, TagValue> = {
  // ── VOCAB.md §2 정식 값 ──────────────────────────────────────
  // 정본에 있는 값은 전부 여기서 받아야 한다. 매핑이 없으면 firstMappedTag가 조용히 건너뛴다.
  // (그래서 페스트의 `매개곤충`, 결핵의 `폐`, CRE의 `의료관련`이 유실되고 있었다)
  // TagValue에 대응이 없는 값(나선균·담관·뇌·눈·근육·림프계·간·피하)은 일부러 비워 둔다 —
  // 그래야 다음 토큰으로 넘어가고, 억지 매핑으로 상성이 틀어지지 않는다.
  세포벽없음: 'none',
  외피없음: 'none',
  DNA바이러스: 'none',
  RNA바이러스: 'none',
  성충: 'large',
  충란: 'large',
  효모형: 'fungal',
  균사형: 'fungal_hypha',
  이형성: 'fungal_dimorphic',
  // 54강(원충 총론) 반영. `protozoa`는 TagValue·캡슐·라벨에 이미 있었는데 노트 어휘만 비어 있었다.
  원충: 'protozoa',
  편모충: 'protozoa',
  섬모충: 'protozoa',
  포자충: 'protozoa',
  영양형: 'protozoa',
  포낭형: 'protozoa',
  세포내외겸용: 'intracellular',
  점막표면: 'mucosal',
  폐: 'respiratory',
  피부접촉: 'contact',
  매개곤충: 'blood',
  토양접촉: 'transcutaneous',
  육류섭취: 'gut',
  채소섭취: 'gut',
  분변경구: 'gut',
  의료관련: 'contact',
  // ── v1 노트 표기 ─────────────────────────────────────────────
  그람양성: 'gram_positive',
  그람음성: 'gram_negative',
  그람음성쌍알균: 'gram_negative',
  그람음성유사: 'gram_negative',
  그람가변성: 'gram_positive',
  항산성: 'mycobacterial',
  약항산성: 'mycobacterial',
  산저항성: 'mycobacterial',
  무세포벽: 'none',
  피막바이러스: 'enveloped_virus',
  외피보유: 'enveloped_virus',
  레트로바이러스: 'retrovirus',
  비외피: 'none',
  DNA: 'none',
  RNA: 'none',
  dsRNA: 'none',
  HAV: 'none',
  HEV: 'none',
  HBV: 'enveloped_virus',
  HCV: 'enveloped_virus',
  HDV: 'enveloped_virus',
  코로나바이러스: 'enveloped_virus',
  파라믹소바이러스: 'enveloped_virus',
  헤르페스바이러스: 'enveloped_virus',
  아레나바이러스: 'enveloped_virus',
  탄환형: 'enveloped_virus',
  피코르나바이러스: 'none',
  칼리시바이러스: 'none',
  이중캡시드: 'none',
  선충: 'nematode',
  사상충: 'nematode',
  심장사상충: 'nematode',
  구충: 'nematode',
  쥐폐선충: 'nematode',
  흡충: 'trematode',
  간질: 'trematode',
  잎모양흡충: 'trematode',
  소형장흡충: 'trematode',
  장흡충: 'trematode',
  조충: 'cestode',
  소형조충: 'cestode',
  조충유충: 'cestode',
  연충: 'large',
  유충: 'large',
  유충성충: 'large',
  '유충-성충': 'large',
  이동유충: 'large',
  미세사상충: 'large',
  두관극: 'large',
  두관극부착: 'large',
  무구두절: 'cestode',
  세포외: 'extracellular',
  세포내: 'intracellular',
  세포질: 'intracellular_cytosol',
  식포: 'intracellular_phagosome',
  대식세포내: 'intracellular_phagosome',
  포식소체: 'intracellular_phagosome',
  적혈구: 'erythrocyte',
  적혈구내: 'erythrocyte',
  장관: 'intestinal_lumen',
  장관강: 'intestinal_lumen',
  소장: 'intestinal_lumen',
  소장점막: 'intestinal_lumen',
  대장: 'intestinal_lumen',
  결막: 'mucosal',
  결막낭: 'mucosal',
  눈물관: 'mucosal',
  혈관: 'vascular',
  혈류: 'vascular',
  상처: 'wound',
  호흡기: 'respiratory',
  비말: 'respiratory',
  호흡기비말: 'respiratory',
  흡입: 'respiratory',
  에어로졸: 'respiratory',
  에어로졸흡입: 'respiratory',
  공기매개: 'respiratory',
  포자흡입: 'respiratory',
  소화기: 'gut',
  음식: 'gut',
  오염식품: 'gut',
  오염수: 'gut',
  분변구강: 'gut',
  '분변-구강': 'gut',
  '분변-경구': 'gut',
  포낭섭취: 'gut',
  충란섭취: 'gut',
  낭미충섭취: 'gut',
  조직낭종섭취: 'gut',
  중간숙주섭취: 'gut',
  덜익힘: 'gut',
  덜익힌돼지고기: 'gut',
  돼지고기: 'gut',
  소고기: 'gut',
  해산물: 'gut',
  해산물생식: 'gut',
  해산어섭취: 'gut',
  패류: 'gut',
  참게: 'gut',
  가재섭취: 'gut',
  민물고기: 'gut',
  민물고기생식: 'gut',
  갑각류생식: 'gut',
  민물고기섭취: 'gut',
  어류: 'gut',
  어류섭취: 'gut',
  수생식물섭취: 'gut',
  피부: 'skin',
  피부침투: 'transcutaneous',
  점막: 'mucosal',
  요로: 'urinary',
  접촉: 'contact',
  동물접촉: 'contact',
  동물교상: 'contact',
  구강상재: 'contact',
  구강구강: 'contact',
  '구강-구강': 'contact',
  내인성: 'contact',
  기회감염: 'contact',
  병원내: 'contact',
  의료기구: 'contact',
  치과시술: 'contact',
  카테터: 'contact',
  성접촉: 'sexual',
  경피: 'transcutaneous',
  물접촉: 'transcutaneous',
  상처해수: 'wound',
  혈액: 'blood',
  수직감염: 'blood',
  태반: 'blood',
  모기매개: 'blood',
  진드기매개: 'blood',
  벼룩: 'blood',
  먹파리매개: 'blood',
  등에매개: 'blood',
  모래파리매개: 'blood',
  절지동물매개: 'blood',
  흡혈곤충매개: 'blood',
  초파리매개: 'blood',
};

const ABILITY_BY_NOTE_VALUE: Record<string, AbilityId> = {
  없음: 'none',
  아포: 'spore',
  협막: 'capsule',
  피막: 'capsule',
  Vi협막: 'capsule',
  F1협막: 'capsule',
  과점액협막: 'capsule',
  바이오필름: 'biofilm',
  세포내생존: 'phagolysosome_block',
  세포내침입: 'phagolysosome_block',
  포식소체성숙차단: 'phagolysosome_block',
  잠복: 'latency',
  항산성막: 'acidfast',
  산저항: 'acidfast',
  무세포벽: 'barrier',
  위막장벽: 'barrier',
  M단백: 'comp_evade',
  부착선모: 'epithelial_barrier',
  내성효소: 'antitoxin',
  대형저항: 'large_resistance',
  유충이행: 'large_resistance',
  흡혈: 'large_resistance',
  자가감염: 'large_resistance',
  근육낭종: 'large_resistance',
  접촉전파: 'large_resistance',
  장점막고정: 'large_resistance',
  피하결절: 'large_resistance',
  피하이동: 'large_resistance',
  눈기생: 'large_resistance',
  담관정착: 'large_resistance',
  간이행: 'large_resistance',
  폐낭종: 'large_resistance',
  조직이행: 'large_resistance',
  낭미충: 'large_resistance',
  림프정착: 'antigen_disguise',
  항원위장: 'antigen_disguise',
};

// VOCAB.md §2-3 evasion 정식 값 → AbilityId. v2 노트의 `태그.evasion`이 여기를 탄다.
// 구 `방어특성` 표기는 위 ABILITY_BY_NOTE_VALUE가 계속 받는다(§2-5 정규화 전 노트 호환).
const ABILITY_BY_EVASION_VALUE: Record<string, AbilityId> = {
  협막: 'capsule',
  아포: 'spore',
  세포벽없음: 'barrier',
  항산성: 'acidfast',
  세포내은신: 'phagolysosome_block',
  잠복: 'latency',
  항원변이: 'antigen_var',
  생물막: 'biofilm',
  낭종: 'cyst',
  유충이행: 'larval_migration',
  조직이행: 'tissue_migration',
  항원위장: 'antigen_disguise',
  자가감염: 'autoinfection',
  내성효소: 'antitoxin',
  보체회피: 'comp_evade',
  위산저항: 'acid_tolerance',
  환경저항: 'environmental_resistance',
  철획득: 'iron_piracy',
  없음: 'none',
};

const CONDITION_BY_NOTE_VALUE: Record<string, StatusConditionId> = {
  발열: 'fever',
  열: 'fever',
  탈수: 'dehydration',
  피로: 'fatigue',
  구토: 'vomiting',
  '배설 이상': 'excretory_dysfunction',
  배설이상: 'excretory_dysfunction',
  '배변 이상': 'excretory_dysfunction',
  배변이상: 'excretory_dysfunction',
  '배뇨 이상': 'excretory_dysfunction',
  배뇨이상: 'excretory_dysfunction',
  기침: 'cough',
  '혈압 이상': 'blood_pressure',
  '호흡 곤란': 'dyspnea',
  부종: 'edema',
  '신경 이상': 'neurologic',
  마비: 'paralysis',
  출혈: 'bleeding',
  빈혈: 'anemia',
  철결핍: 'anemia',
  '철결핍성 빈혈': 'anemia',
  철결핍성빈혈: 'anemia',
  '면역 이상': 'immune_abnormal',
  '면역 붕괴': 'immune_abnormal',
  '호산구 증가': 'immune_abnormal',
  호산구증가: 'immune_abnormal',
  괴사: 'necrosis',
  '시력 이상': 'blindness',
  시력이상: 'blindness',
  복시: 'blindness',
  안검하수: 'blindness',
  '청력 이상': 'hearing_abnormal',
  청력이상: 'hearing_abnormal',
  통증: 'pain',
  근육통: 'pain',
  복통: 'pain',
  가려움: 'itching',
  황달: 'jaundice',
};

function normalizeLines(note: string): string[] {
  return note.replace(/\r\n/g, '\n').split('\n');
}

function readField(lines: string[], key: string): string {
  const prefix = `${key}:`;
  return lines.find((line) => line.startsWith(prefix))?.slice(prefix.length).trim() ?? '';
}

function sectionLines(lines: string[], section: string): string[] {
  const start = lines.findIndex((line) => line.trim() === `${section}:`);
  if (start < 0) return [];

  const result: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^[^\s:#][^:]*:\s*$/.test(line)) break;
    result.push(line);
  }
  return result;
}

function readListValue(lines: string[], key: string): string {
  const prefix = `- ${key}:`;
  return lines.find((line) => line.trimStart().startsWith(prefix))?.trimStart().slice(prefix.length).trim() ?? '';
}

function parseScientificName(value: string): { koreanScientificName: string; scientificName: string } {
  const match = value.match(/^(.*?)\((.*?)\)\s*$/);
  if (!match) {
    return { koreanScientificName: value.trim(), scientificName: value.trim() };
  }

  return {
    koreanScientificName: match[1].trim(),
    scientificName: match[2].trim(),
  };
}

// v1은 `structure: 선충/유충`처럼 슬래시로, v2(TEMPLATE-v2)는 `structure: 그람양성, 아포형성`처럼 쉼표로 나눈다.
function firstMappedTag(value: string): TagValue | undefined {
  return value
    .split(/[,/]/)
    .map((token) => TAG_BY_NOTE_VALUE[token.trim()])
    .find(Boolean);
}

function parseTags(lines: string[]): ParsedPathimonNote['tags'] {
  const structure = firstMappedTag(readListValue(lines, 'structure'));
  const location = firstMappedTag(readListValue(lines, 'location')) ?? 'extracellular';
  const pathway = firstMappedTag(readListValue(lines, 'pathway'));

  return {
    ...(pathway ? { pathway } : {}),
    ...(structure ? { wall: structure } : {}),
    location,
    size: 'microscopic',
  };
}

function mapAbilityTokens(value: string, table: Record<string, AbilityId>): AbilityId[] {
  return value
    .split(/[,\s/]+/)
    .map((token) => table[token.trim()])
    .filter((ability): ability is AbilityId => Boolean(ability) && ability !== 'none');
}

// v2 `태그.evasion`을 우선하고, 없으면 v1 `방어특성:`으로 되돌아간다.
function parseDefenseAbilities(evasionValue: string, legacyValue: string): AbilityId[] {
  const fromEvasion = mapAbilityTokens(evasionValue, ABILITY_BY_EVASION_VALUE);
  if (fromEvasion.length > 0) return fromEvasion;

  const fromLegacy = mapAbilityTokens(legacyValue, ABILITY_BY_NOTE_VALUE);
  return fromLegacy.length > 0 ? fromLegacy : ['none'];
}

function parseMemoLines(lines: string[]): string[] {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
    .filter((line) => line.length > 0);
}

// v2는 `메모:`를 폐기하고 `학습포인트:`로 대체했다(TEMPLATE-v2). 둘 다 같은 패널에 실린다.
function parseNoteMemo(lines: string[]): string[] {
  const learningPoints = parseMemoLines(sectionLines(lines, '학습포인트'));
  return learningPoints.length > 0 ? learningPoints : parseMemoLines(sectionLines(lines, '메모'));
}

// 작업메모의 `기술↔학습포인트 대응: 탄저 독소 → L4·L5·L6 / 협막 형성 → L7·L9`를 기술명 → L번호로 파싱.
function parseMovePointMapping(lines: string[]): Record<string, number[]> {
  const line = lines.find((raw) => raw.replace(/^\s*-?\s*/, '').startsWith('기술↔학습포인트 대응:'));
  if (!line) return {};
  const body = line.slice(line.indexOf('대응:') + '대응:'.length).trim();
  const map: Record<string, number[]> = {};
  for (const part of body.split('/')) {
    const [name, refs] = part.split('→').map((token) => token.trim());
    if (!name || !refs) continue;
    const lNums = [...refs.matchAll(/L(\d+)/g)].map((match) => Number(match[1]));
    if (lNums.length > 0) map[normalizeTerm(name)] = lNums;
  }
  return map;
}

// profileMemo(`L4 [기전] …`)에서 L번호 → 배열 인덱스.
function memoIndexByL(memo: string[]): Map<number, number> {
  const index = new Map<number, number>();
  memo.forEach((line, position) => {
    const match = line.match(/^L(\d+)\b/);
    if (match) index.set(Number(match[1]), position);
  });
  return index;
}

function buildMovePointMap(
  noteText: string,
  memo: string[],
  moveEntries: ReadonlyArray<readonly [MoveId, MoveData]>,
): Record<MoveId, number[]> {
  const rawMapping = parseMovePointMapping(normalizeLines(noteText));
  const nameToMoveId = new Map(moveEntries.map(([moveId, move]) => [normalizeTerm(move.name), moveId]));
  const lToIndex = memoIndexByL(memo);
  const map: Record<MoveId, number[]> = {};

  for (const [moveName, lNums] of Object.entries(rawMapping)) {
    const moveId = nameToMoveId.get(moveName);
    if (!moveId) continue;
    const indices = lNums
      .map((n) => lToIndex.get(n))
      .filter((position): position is number => position !== undefined);
    if (indices.length > 0) map[moveId] = indices;
  }

  return map;
}

// 학습포인트 `L4 [기전] …`에서 `L4 [기전]` 접두어를 떼어 본문만 남긴다(해설 표기용).
function stripLearningPrefix(line: string): string {
  return line.replace(/^L\d+\s*(?:\[[^\]]+\])?\s*/, '').trim();
}

// `포획 OX:` 섹션의 `- 문장 | O/X | L#`를 파싱한다.
// 근거 L#은 그 노트 학습포인트의 원문(해설)으로 해석한다. 형식 오류는 빌드 시 던진다.
function buildCaptureQuiz(noteText: string, memo: string[], noteName: string): CaptureQuizItem[] {
  const lines = sectionLines(normalizeLines(noteText), '포획 OX');
  const lToIndex = memoIndexByL(memo);
  const items: CaptureQuizItem[] = [];

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed.startsWith('- ')) continue;
    const body = trimmed.slice(2).trim();
    if (!body) continue;

    const parts = body.split('|').map((token) => token.trim());
    if (parts.length !== 3) {
      throw new Error(`[${noteName}] 포획 OX 형식 오류(문장 | O/X | L#): ${body}`);
    }
    const [statement, answerToken, lToken] = parts;
    if (answerToken !== 'O' && answerToken !== 'X') {
      throw new Error(`[${noteName}] 포획 OX 정답은 O/X여야 함: ${body}`);
    }
    const lMatch = lToken.match(/^L(\d+)$/);
    if (!lMatch) {
      throw new Error(`[${noteName}] 포획 OX 근거는 L숫자여야 함: ${body}`);
    }
    const sourceL = Number(lMatch[1]);
    const memoIndex = lToIndex.get(sourceL);
    if (memoIndex === undefined) {
      throw new Error(`[${noteName}] 포획 OX 근거 ${lToken}이 학습포인트에 없음: ${body}`);
    }

    items.push({
      statement,
      answer: answerToken === 'O',
      explain: stripLearningPrefix(memo[memoIndex] ?? ''),
      sourceL,
    });
  }

  return items;
}

function normalizeTerm(term: string): string {
  return term.trim().replace(/\s+/g, ' ');
}

function uniqueTerms(terms: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const term of terms.map(normalizeTerm).filter(Boolean)) {
    const key = term.toLocaleLowerCase('ko');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(term);
  }

  return result;
}

function splitCountermeasureList(value: string): string[] {
  // `·`(가운뎃점)도 나열 구분자로 본다 → "이소니아지드·리팜핀·에탐부톨" 같은 복합 처방을 개별 약물로 분해한다.
  return uniqueTerms(value.split(/[,/·]/).map((token) => token.trim()));
}

function expandSymptomTerm(value: string): string[] {
  const whole = normalizeTerm(value);
  if (!whole) return [];
  const parts = whole.split(/[·,/]/).map(normalizeTerm).filter(Boolean);
  return uniqueTerms([whole, ...parts]);
}

function countermeasureField(lines: string[], key: string): string {
  const prefix = `${key}:`;
  for (const line of lines) {
    const normalized = line.trimStart().replace(/^-\s*/, '').trimStart();
    if (normalized.startsWith(prefix)) return normalized.slice(prefix.length).trim();
  }
  return '';
}

// v2 대처법은 `- 1차: 시프로플록사신 | 계열: 핵산합성억제 | 기전: … | 표적 태그: …` 구조다(TEMPLATE-v2).
// `계열:`로 배율 범주를 가른다(설계: docs/pathimon-treatment-coverage-audit-2026-07-24.md):
//   ×4(직접) = 항균제·항바이러스제·구충제·항진균제·항원충제·항독소 + 면역(선천/세포성/백신·항체) → direct
//   ×2(간접) = 물리제거·수술 → symptomTags에 '물리제거' 마커(계열 매칭). 지지요법(대증)은 증상 태그가 이미 ×2를 만든다
//   무관 = 환경차단(예방·위생) → 드롭
// `무효/금기:` 줄은 안 통하는 약이라 1차/2차/보조만 읽어 자동 제외한다.
const V2_COUNTERMEASURE_KEYS = ['1차', '2차', '보조'];

// 약물명 단위로 ×4를 판정하는 계열 (VOCAB.md §6 중 병원체를 직접 잡는 약). 어떤 약이냐가 학습이라 정밀 매칭한다.
const X4_DRUG_CLASSES = new Set([
  '세포벽억제', '단백합성억제', '핵산합성억제', '엽산대사억제', '세포막공격',
  '항결핵제', '항바이러스제', '항기생충제', '항진균제', '항원충제', '항독소',
]);
// 면역·백신은 계열 자체로 ×4를 판정한다. 노트가 계열을 처치로 적고(선천/세포성), 백신은 병원체별로 하나뿐이라 계열 매칭이 과하지 않다.
// direct에 개별 약물명 대신 계열 문자열을 넣어, 계열을 대표하는 면역/백신 기술(선천면역·세포성면역·백신·항체 태그)이 매칭된다.
const IMMUNE_VACCINE_CLASSES = new Set(['선천면역', '세포성면역', '백신·항체']);
const PHYSICAL_COUNTERMEASURE_CLASS = '물리제거';
const PHYSICAL_REMOVAL_TAG = '물리제거';

// "이소니아지드·리팜핀·에탐부톨·피라진아마이드 4제", "프라지콴텔 고용량", "고용량 페니실린", "리팜핀 유지요법"처럼
// 용량·요법 수식어가 붙어도 약물명 코어가 기술 targetTags와 매칭되게 다듬는다(splitCountermeasureList가 `·`로 이미 쪼갠다).
function stripRegimenSuffix(drug: string): string {
  return drug
    .replace(/\s*\d+제$/, '')
    .replace(/\s*(고용량|저용량|고단위|유지요법)$/, '')
    .replace(/^(고용량|저용량|고단위)\s+/, '')
    .trim();
}

interface ParsedV2Countermeasures {
  direct: string[];
  drugClasses: Record<string, string>;
  physical: boolean;
  sawV2: boolean;
}

function parseV2Countermeasures(lines: string[]): ParsedV2Countermeasures {
  const direct: string[] = [];
  const drugClasses: Record<string, string> = {};
  let physical = false;
  let sawV2 = false;

  for (const line of lines) {
    const normalized = line.trimStart().replace(/^-\s*/, '');
    const key = V2_COUNTERMEASURE_KEYS.find((candidate) => normalized.startsWith(`${candidate}:`));
    if (!key) continue;
    sawV2 = true;

    const cells = normalized.slice(key.length + 1).split('|');
    const classCell = cells.find((cell) => cell.trim().startsWith('계열:'));
    const cls = classCell ? normalizeTerm(classCell.replace(/.*계열:/, '')) : '';

    if (cls === PHYSICAL_COUNTERMEASURE_CLASS) {
      physical = true;
      continue;
    }
    // 면역·백신은 계열 문자열 자체를 direct로 → 특정 약물명 없이 계열 매칭(선천/세포성/백신·항체).
    if (IMMUNE_VACCINE_CLASSES.has(cls)) {
      direct.push(cls);
      continue;
    }
    // 계열이 적혀 있고 ×4 약물 계열이 아니면(지지요법·환경차단 등) 드롭. 계열 미기재는 v1 호환으로 direct에 넣는다.
    if (cls && !X4_DRUG_CLASSES.has(cls)) continue;

    const drugs = splitCountermeasureList(cells[0] ?? '')
      .map(stripRegimenSuffix)
      .filter((drug) => drug && drug !== '—' && drug !== '없음');
    for (const drug of drugs) {
      if (cls) drugClasses[drug] = cls; // 약물 → 처치 계열 (약물별 기술 자동 생성용)
    }
    direct.push(...drugs);
  }

  return { direct: uniqueTerms(direct), drugClasses, physical, sawV2 };
}

function parseCountermeasures(lines: string[], moves: NoteMove[]): CountermeasureProfile {
  const v2 = parseV2Countermeasures(lines);
  const direct = v2.sawV2 ? v2.direct : splitCountermeasureList(countermeasureField(lines, '직접'));
  const manualSymptomTags = splitCountermeasureList(countermeasureField(lines, '증상/태그'));
  const moveSymptoms = moves.flatMap((move) => move.results.flatMap((result) => expandSymptomTerm(result.symptom ?? '')));
  const physicalTag = v2.physical ? [PHYSICAL_REMOVAL_TAG] : [];

  return {
    direct,
    symptomTags: uniqueTerms([...manualSymptomTags, ...moveSymptoms, ...physicalTag]),
    directDrugClasses: v2.drugClasses,
  };
}

function parsePercent(value: string, fallback = 1): number {
  const numeric = Number(value.replace('%', '').trim());
  return Number.isFinite(numeric) ? numeric / 100 : fallback;
}

function parsePower(value: string): { basePower: number; resultPowers: number[] } {
  const staged = value.match(/단계별\(([^)]*)\)/);
  if (staged) {
    const resultPowers = staged[1]
      .split('/')
      .map((token) => Number(token.trim()))
      .filter((power) => Number.isFinite(power));
    return { basePower: resultPowers[0] ?? 0, resultPowers };
  }

  const basePower = Number(value.trim());
  return { basePower: Number.isFinite(basePower) ? basePower : 0, resultPowers: [] };
}

function parseMoveBlocks(lines: string[]): string[][] {
  const blocks: string[][] = [];
  let current: string[] | undefined;

  for (const line of lines) {
    if (line.startsWith('- 이름:')) {
      current = [line];
      blocks.push(current);
      continue;
    }

    if (current) current.push(line);
  }

  return blocks;
}

// TEMPLATE-v2는 빈 필드를 금지하고 해당 없음을 `—`로 적게 한다. 파서에서는 빈 값과 동일하게 다룬다.
// (정규화하지 않으면 `단계: —`가 다단계 기술 표식으로 잡혀 v2 노트가 전부 가짜 stageCycle이 된다)
function withoutPlaceholder(value: string): string {
  return value === '—' || value === '-' ? '' : value;
}

function fieldFromBlock(block: string[], key: string): string {
  const match = block.find((line) => line.trimStart().startsWith(`${key}:`));
  return withoutPlaceholder(match?.trimStart().slice(key.length + 1).trim() ?? '');
}

function topLevelFieldFromBlock(block: string[], key: string): string {
  const prefix = `  ${key}:`;
  return withoutPlaceholder(block.find((line) => line.startsWith(prefix))?.slice(prefix.length).trim() ?? '');
}

function parseResultBlocks(block: string[]): string[][] {
  const blocks: string[][] = [];
  let current: string[] | undefined;

  for (const line of block) {
    if (line.trimStart().startsWith('- 확률:')) {
      current = [line];
      blocks.push(current);
      continue;
    }

    if (current && line.startsWith('      ')) current.push(line);
  }

  return blocks;
}

function parseMoveResult(block: string[], power?: number): NoteMoveResult {
  return {
    chance: parsePercent(fieldFromBlock(block, '- 확률')),
    description: fieldFromBlock(block, 'description'),
    effect: fieldFromBlock(block, '효과'),
    learnText: fieldFromBlock(block, 'learnText'),
    power,
    stage: fieldFromBlock(block, '단계'),
    statusConditions: fieldFromBlock(block, '상태이상'),
    symptom: fieldFromBlock(block, '증상') || undefined,
  };
}

function fallbackMoveDescription(moveName: string, kind?: MoveData['kind']): string {
  if (kind === 'prep') return `{name}이 ${withParticle(moveName, '으로')} 감염을 준비한다.`;
  if (kind === 'signature') return `{name}이 ${withParticle(moveName, '을')} 사용한다.`;
  return `{name}이 ${withParticle(moveName, '을')} 사용한다.`;
}

function typeLabelForMove(rawType: string, kind?: MoveData['kind']): string | undefined {
  if (rawType) return rawType;
  if (kind === 'prep') return '준비';
  if (kind === 'signature') return '전용';
  return undefined;
}

function parseMove(block: string[]): NoteMove {
  const name = block[0].slice('- 이름:'.length).trim();
  const kind = KIND_BY_NOTE_VALUE[topLevelFieldFromBlock(block, '종류')];
  const rawType = topLevelFieldFromBlock(block, '타입');
  const type = ATTACK_TYPE_BY_NOTE_VALUE[rawType] ?? 'special';
  const { basePower, resultPowers } = parsePower(topLevelFieldFromBlock(block, '위력'));
  const resultBlocks = parseResultBlocks(block);
  const results = resultBlocks.map((resultBlock, index) => parseMoveResult(resultBlock, resultPowers[index]));

  return {
    accuracy: parsePercent(topLevelFieldFromBlock(block, '명중')),
    description: topLevelFieldFromBlock(block, 'description') || fallbackMoveDescription(name, kind),
    effect: topLevelFieldFromBlock(block, '효과'),
    kind,
    learnText: topLevelFieldFromBlock(block, 'learnText') || results[0]?.learnText || '',
    name,
    power: basePower,
    resultPowers,
    results,
    type,
    typeLabel: typeLabelForMove(rawType, kind),
  };
}

function parseNote(note: string, fallbackName?: string): ParsedPathimonNote {
  const lines = normalizeLines(note);
  const scientific = parseScientificName(readField(lines, '학명'));
  const moves = parseMoveBlocks(sectionLines(lines, '기술')).map(parseMove);

  return {
    category: readField(lines, '타입'),
    countermeasures: parseCountermeasures(sectionLines(lines, '대처법'), moves),
    defenseAbilities: parseDefenseAbilities(
      readListValue(sectionLines(lines, '태그'), 'evasion'),
      readField(lines, '방어특성'),
    ),
    koreanScientificName: scientific.koreanScientificName,
    memo: parseNoteMemo(lines),
    moves,
    name: readField(lines, '이름') || fallbackName || scientific.koreanScientificName,
    scientificName: scientific.scientificName,
    tags: parseTags(sectionLines(lines, '태그')),
  };
}

// VOCAB.md §4는 `공격 +n랭크` / `방어 -n랭크` 표기다. v1 노트는 `공격력 +1랭크`를 쓰므로 '력'을 선택적으로 받는다.
// `명중 ±n랭크`는 EffectPrimitive의 buff.stat이 attack/defense뿐이라 아직 표현할 수 없다.
function rankEffect(effect: string): EffectPrimitive | undefined {
  const match = effect.match(/(공격|방어)력?\s*([+-])(\d+)\s*랭크/);
  if (!match) return undefined;

  const stat = match[1] === '공격' ? 'attack' : 'defense';
  const sign = match[2] === '-' ? -1 : 1;
  const rank = Number(match[3]);
  // 1랭크 = ×1.5(+50%). 이전엔 ×2(+100%)라 과했다. rank n = ×1.5^n.
  const RANK_BASE = 1.5;
  const magnitude = Math.round((RANK_BASE ** rank - 1) * 100);

  return {
    kind: 'buff',
    stat,
    rank: sign * rank,
    pct: sign > 0 ? magnitude : -Math.round((1 - RANK_BASE ** -rank) * 100),
    turns: 99,
    target: sign > 0 ? 'self' : 'enemy',
  };
}

// VOCAB.md §4는 `무적(n)`. v1 노트는 `2턴 무적`으로 적어 구 정규식이 통째로 놓치고 있었다.
function invulnerabilityEffect(effect: string): EffectPrimitive | undefined {
  const match = effect.match(/무적\((\d+)\)/) ?? effect.match(/(\d+)\s*턴\s*무적/);
  if (!match) return undefined;

  return {
    kind: 'invuln',
    turns: Number(match[1]),
    target: 'self',
  };
}

// VOCAB.md §4 `회복(n%)`
function healEffect(effect: string): EffectPrimitive | undefined {
  const match = effect.match(/회복\((\d+)%\)/);
  if (!match) return undefined;

  return { kind: 'heal', pct: Number(match[1]), target: 'self' };
}

// VOCAB.md §4 `반감(n)` — n턴간 받는 피해 절반
function damageHalvingEffect(effect: string): EffectPrimitive | undefined {
  const match = effect.match(/반감\((\d+)\)/);
  if (!match) return undefined;

  return { kind: 'field', side: 'incoming', factor: 0.5, turns: Number(match[1]), target: 'self' };
}

// VOCAB.md §4 `증식(n)` — 자가감염 표현(STATS.md §7 패턴 D).
// 쓸 때마다 공격 랭크가 영구히 쌓여, 전투가 길어질수록 강해진다.
// n턴 지연은 EffectPrimitive에 지연 발현 종류가 없어 아직 모델링하지 않는다.
function proliferationEffect(effect: string): EffectPrimitive | undefined {
  if (!/증식\(\d+\)/.test(effect)) return undefined;

  // 1랭크 = ×1.5(+50%)로 통일(rankEffect와 동일 스케일).
  return { kind: 'buff', stat: 'attack', rank: 1, pct: 50, turns: 99, target: 'self' };
}

function removeNonSignatureInvulnerabilityText(effect: string, kind?: MoveData['kind']): string {
  const trimmed = effect.trim();
  if (!trimmed || kind === 'signature') return trimmed;

  return trimmed
    .replace(/무적\(\d+\)/g, '')
    .replace(/\d+\s*턴\s*무적/g, '')
    .replace(/\s*,\s*,\s*/g, ', ')
    .replace(/^\s*,\s*|\s*,\s*$/g, '')
    .trim();
}

function parseConditionToken(token: string): { condition: StatusConditionId; stacks?: number } | undefined {
  const match = token.trim().match(/^(.+?)(?:\((\d+)\))?$/);
  if (!match) return undefined;

  const rawName = match[1].trim();
  const condition = CONDITION_BY_NOTE_VALUE[rawName];
  if (!condition) return undefined;

  const stacks = match[2] ? Number(match[2]) : rawName === '면역 붕괴' ? 2 : undefined;
  return stacks && stacks > 1 ? { condition, stacks } : { condition };
}

function statusConditionEffects(statusConditions: string): EffectPrimitive[] {
  return statusConditions
    .split(',')
    .map(parseConditionToken)
    .filter((parsed): parsed is { condition: StatusConditionId; stacks?: number } => Boolean(parsed))
    .map(({ condition, stacks }) => ({
      kind: 'condition',
      condition,
      chance: 1,
      target: 'enemy',
      ...(stacks ? { stacks } : {}),
    }));
}

function resultEffects(result: NoteMoveResult, kind?: MoveData['kind']): EffectPrimitive[] | undefined {
  const effects = [
    rankEffect(result.effect),
    kind === 'signature' ? invulnerabilityEffect(result.effect) : undefined,
    healEffect(result.effect),
    damageHalvingEffect(result.effect),
    proliferationEffect(result.effect),
    ...statusConditionEffects(result.statusConditions),
  ].filter((effect): effect is EffectPrimitive => Boolean(effect));

  return effects.length > 0 ? effects : undefined;
}

function resultEffectText(result: Pick<NoteMoveResult, 'effect' | 'statusConditions'>, kind?: MoveData['kind']): string {
  const effect = removeNonSignatureInvulnerabilityText(result.effect, kind);
  const parts = [effect, result.statusConditions ? `상태이상: ${result.statusConditions}` : ''].filter(Boolean);
  return parts.join(', ');
}

function percentLabel(chance: number): string {
  return `${Math.round(chance * 100)}%`;
}

function moveEffectText(move: NoteMove): string | undefined {
  if (move.effect) return removeNonSignatureInvulnerabilityText(move.effect, move.kind) || undefined;
  if (!move.results.length) return undefined;

  const results = move.results
    .map((result) => {
      const effectText = resultEffectText(result, move.kind);
      return effectText ? `${percentLabel(result.chance)} ${effectText}` : '';
    })
    .filter(Boolean);

  return results.length > 0 ? results.join(' / ') : undefined;
}

function buildOutcome(move: NoteMove, result: NoteMoveResult): MoveOutcome {
  return {
    chance: result.chance,
    description: result.description || move.description,
    effectText: resultEffectText(result, move.kind) || undefined,
    effects: resultEffects(result, move.kind),
    learnText: result.learnText || move.learnText,
    power: result.power,
    symptom: result.symptom,
  };
}

function buildStage(move: NoteMove, result: NoteMoveResult): MoveStageData {
  return {
    name: result.stage ? `${move.name} ${result.stage}` : move.name,
    power: result.power ?? move.power,
    description: result.description || move.description,
    effectText: resultEffectText(result, move.kind) || undefined,
    effects: resultEffects(result, move.kind),
    learnText: result.learnText || move.learnText,
    symptom: result.symptom,
  };
}

function buildMove(move: NoteMove, id: MoveId): MoveData {
  const stagedResults = move.results.filter((result) => result.stage);
  const baseMove: MoveData = {
    id,
    kind: move.kind,
    name: move.name,
    type: move.type,
    typeLabel: move.typeLabel,
    power: move.power,
    accuracy: move.accuracy,
    signature: move.kind === 'signature' || undefined,
    description: move.description,
    effectText: moveEffectText(move),
    learnText: move.learnText || move.results[0]?.learnText || '',
    symptom: move.results[0]?.symptom,
  };

  if (stagedResults.length > 0) {
    return {
      ...baseMove,
      stageCycle: stagedResults.map((result) => buildStage(move, result)),
    };
  }

  if (move.results.length > 1) {
    return {
      ...baseMove,
      outcomes: move.results.map((result) => buildOutcome(move, result)),
    };
  }

  const onlyResult = move.results[0];
  if (!onlyResult) return baseMove;

  return {
    ...baseMove,
    effectText: resultEffectText(onlyResult, move.kind) || baseMove.effectText,
    effects: resultEffects(onlyResult, move.kind),
    learnText: onlyResult.learnText || baseMove.learnText,
    symptom: onlyResult.symptom || baseMove.symptom,
  };
}

function buildScientificLabel(note: ParsedPathimonNote): string {
  return `${note.koreanScientificName} (${note.scientificName})`;
}

function readStat(noteValue: string, fallback: number): number {
  // v2는 `- 공격: 95   # 밴드: 5   근거: …` 처럼 판정 근거를 주석으로 남긴다(STATS.md §5).
  const trimmed = noteValue.split('#')[0].trim();
  if (!trimmed) return fallback;

  const numeric = Number(trimmed);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function automaticMoveId(monsterId: string, index: number): MoveId {
  return `${monsterId}_move_${index + 1}`;
}

export function buildPathimonFromNote(noteText: string, options: PathimonNoteBuildOptions): BuiltPathimonNoteData {
  const note = parseNote(noteText, options.fallbackName);
  const moveEntries = note.moves.map((move, index) => {
    const moveId = options.moveIds?.[move.name] ?? automaticMoveId(options.id, index);
    return [moveId, buildMove(move, moveId)] as const;
  });
  const moves = Object.fromEntries(moveEntries) as Partial<Record<MoveId, MoveData>>;
  const prep = moveEntries.find(([, move]) => move.kind === 'prep')?.[0];
  const signature = moveEntries.find(([, move]) => move.kind === 'signature')?.[0];
  const abilities = note.defenseAbilities.filter((ability) => ability !== 'none');
  const statLines = sectionLines(normalizeLines(noteText), '능력치');

  return {
    monster: {
      id: options.id,
      name: note.name,
      scientificName: buildScientificLabel(note),
      category: note.category,
      glyph: options.glyph,
      tags: note.tags,
      maxHp: readStat(readListValue(statLines, 'HP'), options.defaultStats.maxHp),
      attack: readStat(readListValue(statLines, '공격'), options.defaultStats.attack),
      defense: readStat(readListValue(statLines, '방어'), options.defaultStats.defense),
      speed: 5,
      captureRate: options.captureRate,
      ability: abilities[0] ?? 'none',
      abilities,
      learnset: moveEntries.map(([moveId]) => moveId),
      profileMemo: note.memo,
      movePointMap: buildMovePointMap(noteText, note.memo, moveEntries),
      captureQuiz: (() => {
        const quiz = buildCaptureQuiz(noteText, note.memo, note.name);
        return quiz.length > 0 ? quiz : undefined;
      })(),
      countermeasures: note.countermeasures,
      prep,
      signature,
    },
    moves,
  };
}

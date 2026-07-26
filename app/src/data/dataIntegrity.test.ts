import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { ABILITIES } from './abilities';
import { BOSSES, BOSS_COMBAT_STATS, LATE_GAME_BOSS_IDS, createBossRosterIds } from './bosses';
import { BOSS_ATTACK_MOVE_IDS } from './bossAttackMatchups';
import { EFFECTIVENESS } from './effectiveness';
import { MONSTERS, STARTER_ID, TOTAL_FLOORS } from './monsters';
import { TRAINERS } from './trainers';
import { BOSS_CHARACTER_ASSETS, TRAINER_CHARACTER_ASSETS } from './characterAssets';
import { buildLoadout, buildMoveSlots } from '../battle/loadout';
import { MOVES } from './moves';
import { NOTE_MONSTERS } from './pathimonNoteData';
import { createBossInstance, createMonsterInstance, createTrainerInstance } from '../state/factory';
import { bossMoveEffectiveness, createBossDefenseProfile } from '../battle/bossMatchup';
import { DEFENSE_COMPRESSION_MIN_SCALE } from '../battle/damage';

const pathimonAssets = import.meta.glob('/public/images/pathimon/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const pathimonNoteFiles = import.meta.glob('/src/data/pathimon-notes/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const bossCharacterAssets = import.meta.glob('/public/images/trainers/boss/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const trainerRootAssets = import.meta.glob('/public/images/trainers/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const trainerCharacterAssets = import.meta.glob('/public/images/trainers/trainer/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

function readPngSize(path: string): { width: number; height: number } {
  const bytes = readFileSync(path);
  return {
    width: (bytes[16] << 24) + (bytes[17] << 16) + (bytes[18] << 8) + bytes[19],
    height: (bytes[20] << 24) + (bytes[21] << 16) + (bytes[22] << 8) + bytes[23],
  };
}

function hasInvulnerabilityPrimitive(move: (typeof MOVES)[string]): boolean {
  const effectGroups = [
    move.effects ?? [],
    ...(move.outcomes ?? []).map((outcome) => outcome.effects ?? []),
    ...(move.stageCycle ?? []).map((stage) => stage.effects ?? []),
  ];

  return effectGroups.some((effects) => effects.some((effect) => effect.kind === 'invuln'));
}

describe('Pathimon data', () => {
  it('reserves floors 70-100 for the four professor bosses in shuffled order', () => {
    const roster = createBossRosterIds(() => 0, 10);

    expect(roster).toHaveLength(10);
    expect(new Set(roster.slice(6))).toEqual(new Set(LATE_GAME_BOSS_IDS));
    expect(roster.slice(0, 6).some((bossId) => LATE_GAME_BOSS_IDS.includes(bossId))).toBe(false);
  });

  it('gives every professor boss its approved identity, dialogue, defenses, and floor-100 skill', () => {
    const professors = LATE_GAME_BOSS_IDS.map((id) => BOSSES.find((boss) => boss.id === id));
    const [profP, profS, profK, profW] = professors;

    expect(professors.every(Boolean)).toBe(true);
    expect(professors.map((boss) => boss?.assetPath)).toEqual([
      'images/trainers/boss/prof_p.png',
      'images/trainers/boss/prof_s.png',
      'images/trainers/glacia.png',
      'images/trainers/boss/ghetsis.png',
    ]);
    expect(new Set(professors.map((boss) => boss?.assetPath)).size).toBe(4);

    expect(profP?.fixedAbilities).toEqual(['parasite_master']);
    expect(profP?.phase2Dialogue).toEqual(['음.. 아침에 먹은 연어 칼국수가..']);
    expect(profP?.finalBossSkill).toBe('parasitization');
    expect(profP?.finalBossSkillName).toBe('기생충화');
    expect(profP?.finalBossSkillDialogue).toEqual(['최후의 기생충학은... 나 자신이 기생충이 되는 것!']);

    expect(profS?.finalBossSkill).toBe('seal');
    expect(profS?.finalBossSkillDialogue).toEqual(['새로운 인형이네..?']);

    expect(profK?.fixedAbilities).toEqual(['mycology_master', 'protozoology_master']);
    expect(profK?.encounterDialogue).toEqual(['안녕하세요 패시몬 여러분?']);
    expect(profK?.phase2Dialogue).toEqual(['학습태도가 참 좋네요.. 어렵게 해볼까요?']);
    expect(profK?.finalBossSkill).toBe('keen_eye');
    expect(profK?.finalBossSkillDialogue).toEqual(['여기서는 다 보인답니다.']);

    expect(profW?.name).toBe('병리학 교수 Prof. W');
    expect(profW?.fixedAbilities).toEqual(['virology_master']);
    expect(profW?.encounterDialogue).toEqual(['목이 아프군.. 긴 말 않겠다. 사라져라.']);
    expect(profW?.phase2Dialogue).toEqual(['음..']);
    expect(profW?.finalBossSkill).toBe('nk_activation');
    expect(profW?.finalBossSkillDialogue).toEqual(['.....!']);

    const profPIndex = BOSSES.findIndex((boss) => boss.id === profP?.id);
    const profKIndex = BOSSES.findIndex((boss) => boss.id === profK?.id);
    expect(createBossInstance(profPIndex, 70).abilities).toContain('parasite_master');
    expect(createBossInstance(profKIndex, 70).attack).toBe(40);

    expect(ABILITIES.parasite_master.name).toBe('기생충 마스터');
    expect(ABILITIES.virology_master.name).toBe('바이러스 마스터');
    expect(ABILITIES.mycology_master.name).toBe('진균 마스터');
    expect(ABILITIES.protozoology_master.name).toBe('원생동물 마스터');
  });

  // 난도 곡선이 여기 하나에 걸려 있다. 풀이 얕으면 층이 깊어져도 방어특성이 안 늘어난다.
  it('ramps boss defense traits by one per ten floors across distinct axes', () => {
    const bossIndex = BOSSES.findIndex((boss) => boss.id === 'immune_hq');

    expect(createBossInstance(bossIndex, 10).abilities).toHaveLength(1);
    expect(createBossInstance(bossIndex, 50).abilities).toHaveLength(5);
    expect(createBossInstance(bossIndex, 100).abilities).toHaveLength(10);

    for (const boss of BOSSES) {
      expect(boss.abilityPool.length).toBeGreaterThanOrEqual(10);
      expect(new Set(boss.abilityPool).size).toBe(boss.abilityPool.length);
    }

    // 계열·경로·외피·위치·크기 축이 모두 풀에 들어 있어야 파티 편식이 실제로 벌을 받는다.
    const pool = new Set(BOSSES[0].abilityPool);
    for (const required of [
      'parasite_master',
      'virology_master',
      'bacteriology_master',
      'mask',
      'endotoxin_neutralization',
      'ctl_surveillance',
      'eosinophil_recruitment',
    ]) {
      expect(pool.has(required as never)).toBe(true);
    }
  });

  it('gives every boss defense trait a live halving rule and a player-facing description', () => {
    for (const abilityId of new Set(BOSSES.flatMap((boss) => boss.abilityPool))) {
      const ability = ABILITIES[abilityId];
      const hasTagRule = Boolean(ability.resistTag);
      const hasCategoryRule = Boolean(ability.resistCategory);
      const hasTableRule = Object.values(EFFECTIVENESS).some((row) => row?.[abilityId] !== undefined);

      expect(hasTagRule || hasCategoryRule || hasTableRule, `${abilityId} has no halving rule`).toBe(true);
      expect(ability.description?.length ?? 0, `${abilityId} description`).toBeGreaterThan(8);
    }
  });

  it('has a valid starter with a scientific name', () => {
    const starter = MONSTERS.find((monster) => monster.id === STARTER_ID);

    expect(starter?.name).toBe('탄저록스');
    expect(starter?.scientificName).toBe('탄저균 (Bacillus anthracis)');
    expect(starter?.scientificName.length).toBeGreaterThan(3);
  });

  it('uses playful pathimon names and bilingual scientific labels', () => {
    const names = MONSTERS.map((monster) => monster.name);
    expect(names).toEqual(expect.arrayContaining(['탄저록스', '세레우톡스', '리스냉장']));
    expect(names).not.toContain('노카가지');
    expect(new Set(names).size).toBe(names.length);

    for (const monster of MONSTERS) {
      expect(monster.scientificName).toMatch(/^.+\(.+\)$/);
    }
  });

  it('loads every selected first-wave pathimon note into the note roster', () => {
    // 59 → 77 → 84 → 83 → 81 → 80. 41~50강 승격 17종 + `물혹돼지`(60~77번), 57·58강 신규 7종(78~84번)이 추가됐고,
    // `유레아플라`(57번)는 강의 근거가 없어 `마이코막` 노트의 감별점으로 흡수하며 제외했다.
    // `레트로잠`(31번, HIV), `가드네라`(58번), `노카가지`(59번)는 승격을 취소했다.
    // 레트로잠은 강의 미도착, 가드네라는 강의 근거 부족, 노카가지는 사용자 보류 결정에 따른다.
    expect(NOTE_MONSTERS).toHaveLength(85);
    expect(NOTE_MONSTERS.map((monster) => monster.name).slice(0, 5)).toEqual([
      '탄저록스',
      '세레우톡스',
      '리스냉장',
      '디프막스',
      '디피실룩',
    ]);
    // 승격 취소 항목 다음에는 60번 물혹돼지가 온다. 노트 순서가 NAME_SELECTIONS.json의 selections 배열 순서라는 점을 잡아 두는 검사다.
    expect(NOTE_MONSTERS[55]?.name).toBe('물혹돼지');
    // `pathimonNoteData.ts`의 createParasiteEvolutionMonsters가 기생충 노트를 무조건 유충/성충으로 쪼개면서
    // 이름에 `-유충`을 붙인다. 노트의 `진화: 패턴 B`(사람 안에서 성충이 되지 못함)와 어긋나는 지점이라 재검토 대상이다.
    expect(NOTE_MONSTERS[72]?.name).toBe('기어가기-유충');
    // 85~89번: 55강(이질아메바·파울러자유아메바·가시아메바) + 61강(대장섬모충·폐포자충) 신규 5종을 selections 끝에 이어 붙였다.
    // 폐포자충(폐포지롱)은 로스터 최초의 진균이자 마지막 selection이라 꼬리 앵커가 여기로 바뀐다.
    expect(NOTE_MONSTERS[NOTE_MONSTERS.length - 1]?.name).toBe('폐포지롱');
  });

  it('keeps generation source sheets out of public runtime assets', () => {
    const sourceSheets = Object.keys(pathimonAssets).filter((path) => /source/i.test(path));

    expect(sourceSheets).toEqual([]);
  });

  it('keeps inactive notes out of the eager game loading path', () => {
    const categorizedNotes = Object.keys(pathimonNoteFiles).filter((path) =>
      /\/drafts\/[^/]+\/[^/]+\.md$/.test(path),
    );
    const rootSelectedNoteCount = 2;
    const inactiveDraftDocuments = [
      'NAME_CANDIDATES.md',
      'NAME_PROMPT.md',
      'NAME_SELECTIONS.md',
      'REVIEW_NEEDED_PATHIMON.md',
      'REVIEW_NOTES.md',
    ];

    expect(categorizedNotes).toHaveLength(NOTE_MONSTERS.length - rootSelectedNoteCount);
    for (const fileName of inactiveDraftDocuments) {
      expect(pathimonNoteFiles[`/src/data/pathimon-notes/drafts/${fileName}`]).toBeUndefined();
    }
  });

  it('uses note stats as battle-ready hp, attack, and defense values', () => {
    const byId = new Map(NOTE_MONSTERS.map((monster) => [monster.id, monster]));

    // 탄저록스는 STATS.md §5 앵커(95/45/40)로 재작성됐다. 밴드 주석이 붙은 `- 공격: 95   # 밴드: 5 …`도 읽혀야 한다.
    expect(byId.get('anthrax')).toMatchObject({ maxHp: 40, attack: 95, defense: 45 });
    // 세레우톡스도 STATS.md §5 앵커(35/25/20)로 재작성됐다. v1의 HP 95는 자가 한정 식중독을 만성으로 오독시켰다.
    expect(byId.get('cereus')).toMatchObject({ maxHp: 20, attack: 35, defense: 25 });

    for (const monster of NOTE_MONSTERS) {
      expect(monster.maxHp).toBeGreaterThan(0);
      expect(monster.attack).toBeGreaterThan(0);
      expect(monster.defense).toBeGreaterThan(0);
    }
  });

  // battle/damage.ts는 노트 스케일(25 이상)만 압축하고 레거시 대표종의 한 자릿수 방어는 통과시킨다.
  // 노트 방어가 그 경계 아래로 내려오면 압축이 조용히 꺼지므로 여기서 막는다.
  it('keeps every note pathimon defense at or above the compression scale floor', () => {
    for (const monster of NOTE_MONSTERS) {
      expect(monster.defense).toBeGreaterThanOrEqual(DEFENSE_COMPRESSION_MIN_SCALE);
    }
  });

  it('loads display memo lines from every selected pathimon note', () => {
    for (const monster of NOTE_MONSTERS) {
      // v1 `메모:`는 4줄 고정이었지만 v2 `학습포인트:`는 최소 4개다(TEMPLATE-v2).
      expect(monster.profileMemo?.length, `${monster.id} memo lines`).toBeGreaterThanOrEqual(4);
      for (const line of monster.profileMemo ?? []) {
        expect(line.trim().length).toBeGreaterThan(8);
      }
    }

    // 탄저록스는 v2로 재작성되어 메모 대신 번호 붙은 학습포인트가 실린다.
    const anthraxMemo = NOTE_MONSTERS.find((monster) => monster.id === 'anthrax')?.profileMemo ?? [];
    expect(anthraxMemo).toHaveLength(15);
    expect(anthraxMemo[0]).toMatch(/^L1 \[감별점\]/);
    expect(anthraxMemo[anthraxMemo.length - 1]).toMatch(/^L15 \[생활사·역학\]/);
  });
  it('loads countermeasure profiles from every selected pathimon note', () => {
    for (const monster of NOTE_MONSTERS) {
      expect(monster.countermeasures, `${monster.id} countermeasures`).toBeDefined();
      expect(monster.countermeasures?.symptomTags.length, `${monster.id} symptom/tag countermeasures`).toBeGreaterThan(0);
    }

    const anthrax = NOTE_MONSTERS.find((monster) => monster.id === 'anthrax');
    expect(anthrax?.countermeasures?.direct).toEqual(expect.arrayContaining(['시프로플록사신', '독시사이클린', '탄저 항독소']));
    expect(anthrax?.countermeasures?.symptomTags).toEqual(expect.arrayContaining(['피부탄저', '흡입탄저', '발열', '기침', '피로']));
  });

  it('maps moves to their related learning points from 기술↔학습포인트 대응', () => {
    const anthrax = NOTE_MONSTERS.find((monster) => monster.id === 'anthrax');
    const memo = anthrax?.profileMemo ?? [];
    // 탄저 독소 → L4·L5·L6
    const toxinPoints = (anthrax?.movePointMap?.anthrax_toxin ?? []).map((index) => memo[index]);
    expect(toxinPoints).toHaveLength(3);
    expect(toxinPoints.every((line) => /^L[456] /.test(line ?? ''))).toBe(true);

    // 대부분의 노트가 매핑을 갖는다(81/82).
    const withMap = NOTE_MONSTERS.filter((monster) => monster.movePointMap && Object.keys(monster.movePointMap).length > 0);
    expect(withMap.length).toBeGreaterThan(NOTE_MONSTERS.length * 0.8);
  });

  // ×4 커버리지 가드 — 적 기술 풀에서 각 패시몬에 ×4/×2가 실제로 뜨는지 검사한다.
  // 참고: docs/pathimon-treatment-coverage-audit-2026-07-24.md. 새 노트가 계열만 제대로 쓰면 이 검사를 자동 통과한다.
  describe('treatment coverage', () => {
    // ×4를 만드는 직접 처치약이 현실에 없어 ×2(물리제거·대증)만 있는 종. 이것 자체가 학습 내용이다.
    //  아니사키·눈물안충·스파르강 = 수술로만 제거 / 시가콜리(EHEC) = 항생제 금기, 지지요법만.
    const X2_ONLY_IDS = new Set([
      'anisakis_simplex',
      'thelazia_callipaeda',
      'sparganum_spirometra_spp',
      'ehec_stec_e_coli_o157_h7',
    ]);

    function bestMultiplier(monster: (typeof NOTE_MONSTERS)[number]): number {
      const runtime = createMonsterInstance(monster);
      const profile = createBossDefenseProfile(runtime);
      let best = 1;
      for (const moveId of BOSS_ATTACK_MOVE_IDS) {
        const move = MOVES[moveId];
        if (!move) continue;
        best = Math.max(best, bossMoveEffectiveness(move, profile).multiplier);
      }
      return best;
    }

    it('gives every pathimon a working ×4 direct treatment, except documented ×2-only cases', () => {
      const missingX4 = NOTE_MONSTERS
        .filter((monster) => bestMultiplier(monster) < 4)
        .map((monster) => monster.id);

      // ×4가 없는 종은 문서화된 ×2-only 목록과 정확히 일치해야 한다(새 구멍 조기 발견).
      expect(new Set(missingX4)).toEqual(X2_ONLY_IDS);
    });

    it('still gives the ×2-only pathimon a working ×2 indirect treatment', () => {
      for (const monster of NOTE_MONSTERS) {
        if (!X2_ONLY_IDS.has(monster.id)) continue;
        expect(bestMultiplier(monster), `${monster.id} needs a working ×2`).toBeGreaterThanOrEqual(2);
      }
    });
  });


  it('parses every first-wave note into battle defense tags and explicit defense traits', () => {
    for (const monster of NOTE_MONSTERS) {
      expect(monster.tags.wall, `${monster.id} wall tag`).toBeTruthy();
      expect(monster.tags.location, `${monster.id} location tag`).toBeTruthy();
      expect(monster.tags.pathway, `${monster.id} pathway tag`).toBeTruthy();
      expect(monster.abilities, `${monster.id} defense traits`).toBeDefined();
      expect(monster.ability, `${monster.id} primary defense trait`).toBeTruthy();
    }
  });

  // VOCAB.md §2-3은 `없음`을 정식 evasion 값으로 둔다("특기할 회피 구조 없음").
  // 아래는 강의 근거상 회피 구조가 실제로 없다고 판정한 노트다. 그 외에 'none'이 나오면 파서 매핑 실패로 본다.
  const INTENTIONAL_NO_EVASION = [
    'clonorchis_sinensis', // 프라지콴텔 1~2일이면 구제된다. 방어 60은 담관이라는 위치에서 온다
    'taenia_solium', // 장 성충형. 프라지콴텔 단회로 끝난다. 낭종은 분리된 `물혹돼지`가 가져갔다
    'bacteroides_spp', // 46·20·21강 어디에도 협막 언급이 없다. 장관 파열이라는 계기로만 성립하는 내인성 감염
    'vibrio_cholerae', // 병독인자가 독소·TCP·전사인자뿐이다. 수액만으로 치명률이 1% 미만이 된다
    'vibrio_parahaemolyticus', // 자가 한정 장염. v1의 `염분선호`는 VOCAB §2-6이 폐기로 분류한 값이다
    'taenia_saginata', // 장 성충형. 편절 탈락은 회피가 아니라 전파 구조라 공격기로 갔다
    'diphyllobothrium_latum', // 44강이 회피 구조를 다루지 않는다. 프라지콴텔 단회로 끝난다
    'metagonimus', // v1의 `장점막부착`은 회피가 아니라 정착이다. 강의가 "임상적으로 큰 문제 없음"이라 못 박았다
    'escherichia_coli', // v1 `부착선모`는 회피가 아니라 정착이다. 33강이 대장균 기본형의 회피 구조를 다루지 않는다
    'etec', // 위와 동일. 병원성은 정착인자와 장독소 두 축이고 침습도 회피도 없다
    'epec', // 위와 동일. 병인이 A/E 부착 그 자체다. 소장 조에서 생물막을 가진 것은 EAEC뿐이다
    'ehec_stec_e_coli_o157_h7', // v1 `산저항`은 33강에 없다. 낮은 감염량에서 역추론한 값이라 뺐다. 방어력은 항생제 금기에서 온다
    'upec', // v1 `부착선모`는 회피가 아니라 정착이다. 병독인자는 부착소와 용혈소 HlyA 둘뿐이다
    'wuchereria_bancrofti', // v1 `림프정착`은 회피가 아니라 정착이다. 방어력은 약이 미세사상충에만 듣는다는 사실에서 온다
    'brugia_malayi', // 위와 동일. 29강이 이 종의 회피 구조를 따로 다루지 않는다
    'thelazia_callipaeda', // v1 `눈기생`은 기생 부위이지 회피가 아니다. 눈에 보여 집어내면 끝나는 것이 오히려 약점이다
    'ancylostoma_duodenale', // v1 `흡혈`은 공격이지 회피가 아니다. 흡혈은 공격기로, 항응고 물질은 전용기로 옮겼다
    'necator_americanus', // 위와 동일. 23강이 구충의 회피 구조를 다루지 않는다
    'trichuris_trichiura', // v1 `장점막고정`은 정착이지 회피가 아니다. 19강이 편충의 회피 구조를 다루지 않는다
    'capillaria_hepatica', // v1 `간이행`은 경로이지 회피가 아니다. 방어력은 알이 간에 갇혀 대변검사가 음성이라는 데서 온다
    'ascaris', // 빙글회충. v1 `대형저항`은 크기일 뿐 회피가 아니다. 26강이 회충의 회피 구조를 다루지 않는다 (id는 NOTE_OPTION_OVERRIDES가 지정)
    'corynebacterium_diphtheriae', // 디프막스. v1 `위막장벽`은 VOCAB §2-6이 병인 산물로 분류해 공격기로 이관했다. 24강이 회피 구조를 다루지 않는다
    'schistosoma', // 달팽혈충 (id는 NOTE_OPTION_OVERRIDES가 지정). v1 `항원위장`은 38·30강 어디에도 없다. 14강이 숙주 항원 가장을 기생충 일반 기전으로만 가르치고 종을 지목하지 않는다
    'naegleria_fowleri', // 뇌먹아메바. 55강이 못 박은 대로 위협은 은신·약제저항이 아니라 속도다 — 암포테리신 B는 듣지만 급성 경과·진단 지연으로 진다. 회피 구조 없는 유리대포로 설계했다
  ];

  it('does not leave selected first-wave notes with an accidental empty defense trait', () => {
    const emptyDefenseIds = NOTE_MONSTERS
      .filter((monster) => monster.ability === 'none' || !monster.abilities?.length)
      .map((monster) => monster.id)
      .filter((id) => !INTENTIONAL_NO_EVASION.includes(id));

    expect(emptyDefenseIds).toEqual([]);
  });

  it('gives the starter four battle slots with note-defined moves', () => {
    const starter = MONSTERS.find((monster) => monster.id === STARTER_ID);
    if (!starter) throw new Error('starter missing');

    const moveSlots = buildMoveSlots(starter);

    expect(moveSlots).toHaveLength(4);
    expect(moveSlots[0]).toBe(starter.prep);
    expect(moveSlots[3]).toBe(starter.signature);
    expect(buildLoadout(starter)).toEqual(moveSlots.filter(Boolean));
    expect(buildLoadout(starter).length).toBeGreaterThanOrEqual(3);
  });

  it('keeps only note-managed pathimon active while legacy representatives are disabled', () => {
    const monsterIds = MONSTERS.map((monster) => monster.id);
    const noteMonsterIds = NOTE_MONSTERS.map((monster) => monster.id);

    expect(monsterIds).toEqual(expect.arrayContaining(noteMonsterIds));
    expect(monsterIds).not.toEqual(expect.arrayContaining([
      'influenza',
      'cholera',
      'candida',
      'aspergillus',
      'malaria',
      'entamoeba',
    ]));
    expect(monsterIds).toEqual(expect.arrayContaining([
      'anthrax',
      'cereus',
      'listeria_monocytogenes',
      'staph',
      'strep',
      'tb',
      'ascaris',
      'schistosoma',
    ]));
    expect(NOTE_MONSTERS).toHaveLength(85);
    expect(monsterIds).not.toContain('hiv');
    expect(monsterIds).not.toContain('gardnerella_vaginalis');
    expect(monsterIds).not.toContain('nocardia_spp');
    expect(MONSTERS.length).toBeGreaterThan(NOTE_MONSTERS.length);
    expect(BOSSES.map((boss) => boss.id)).toContain('immune_hq');
    expect(BOSSES.length).toBeGreaterThanOrEqual(12);
    expect(TOTAL_FLOORS).toBe(100);
  });

  it('creates note-derived parasite stage evolutions with stronger later forms', () => {
    const byId = new Map(MONSTERS.map((monster) => [monster.id, monster]));
    const ascarisEgg = byId.get('ascaris');
    const ascarisLarva = byId.get('ascaris_larva');
    const ascarisAdult = byId.get('ascaris_adult');
    const trichinellaLarva = byId.get('trichinella_spiralis');
    const trichinellaAdult = byId.get('trichinella_spiralis_adult');

    expect(ascarisEgg?.name).toContain('충란');
    expect(ascarisEgg?.evolvesTo).toBe('ascaris_larva');
    expect(ascarisLarva?.name).toContain('유충');
    expect(ascarisLarva?.evolvesTo).toBe('ascaris_adult');
    expect(ascarisAdult?.name).toContain('성충');
    expect(ascarisAdult?.attack).toBeGreaterThan(ascarisEgg?.attack ?? 0);
    expect(ascarisAdult?.defense).toBeGreaterThan(ascarisEgg?.defense ?? 0);

    expect(trichinellaLarva?.name).toContain('유충');
    expect(trichinellaLarva?.evolvesTo).toBe('trichinella_spiralis_adult');
    expect(trichinellaAdult?.name).toContain('성충');
    expect(trichinellaAdult?.maxHp).toBeGreaterThan(trichinellaLarva?.maxHp ?? 0);
  });

  // STATS.md §7 패턴 B(유충 정점)는 사람 안에서 성충이 되지 못하는 기생충이다.
  // `pathimonNoteData.ts`의 evolutionPattern이 노트의 `- 패턴: B`를 읽어 성충 단계를 만들지 않는다.
  it('stops larva-peak parasites at the larval stage instead of inventing an adult form', () => {
    const byId = new Map(MONSTERS.map((monster) => [monster.id, monster]));

    // 감염원을 유충으로 먹는 쪽: 유충 하나로 끝난다
    for (const id of ['anisakis_simplex', 'gnathostoma_spp', 'ancylostoma_braziliense']) {
      expect(byId.get(id)?.name, `${id} name`).toContain('유충');
      expect(byId.get(id)?.evolvesTo, `${id} evolvesTo`).toBeUndefined();
      expect(byId.get(`${id}_adult`), `${id} adult form`).toBeUndefined();
    }

    // 충란으로 먹는 쪽: 충란 → 유충까지만 간다. 사람은 중간숙주라 포충낭이 종점이다
    const hydatidEgg = byId.get('echinococcus_granulosus');
    expect(hydatidEgg?.name).toContain('충란');
    expect(hydatidEgg?.evolvesTo).toBe('echinococcus_granulosus_larva');
    expect(byId.get('echinococcus_granulosus_larva')?.evolvesTo).toBeUndefined();
    expect(byId.get('echinococcus_granulosus_adult')).toBeUndefined();
  });

  // STATS.md §7 패턴 C(분기 진화)는 한 종에서 갈라진 두 병을 별개 패시몬으로 둔 것이다.
  // 양쪽 다 종점이라 단계를 자동 생성하면 서로의 자리를 침범한다 — 유구조충은 장 성충, 유구낭미충은 낭미충이다.
  it('leaves branching parasites as two standalone pathimon without inventing stages', () => {
    const byId = new Map(MONSTERS.map((monster) => [monster.id, monster]));

    for (const id of ['taenia_solium', 'cysticercus_cellulosae']) {
      expect(byId.get(id)?.name, `${id} name`).not.toMatch(/-(충란|유충|성충)$/);
      expect(byId.get(id)?.evolvesTo, `${id} evolvesTo`).toBeUndefined();
      expect(byId.get(`${id}_larva`), `${id} larva form`).toBeUndefined();
      expect(byId.get(`${id}_adult`), `${id} adult form`).toBeUndefined();
    }

    expect(byId.get('taenia_solium')?.name).toBe('리본돼지');
    expect(byId.get('cysticercus_cellulosae')?.name).toBe('물혹돼지');
  });

  it('uses every image from the organized trainers boss and trainer folders', () => {
    const supersededProfessorAssets = new Set([
      'images/trainers/boss/prof_k.png',
      'images/trainers/boss/prof_w.png',
    ]);
    const activeBossFolderAssets = BOSS_CHARACTER_ASSETS.filter(
      (assetPath) => !supersededProfessorAssets.has(assetPath),
    );

    expect(TRAINER_CHARACTER_ASSETS).toHaveLength(Object.keys(trainerCharacterAssets).length);
    expect(BOSS_CHARACTER_ASSETS).toHaveLength(Object.keys(bossCharacterAssets).length);
    expect(TRAINER_CHARACTER_ASSETS.length).toBeGreaterThanOrEqual(20);
    expect(BOSS_CHARACTER_ASSETS.length).toBeGreaterThanOrEqual(50);
    expect(TRAINERS.map((trainer) => trainer.assetPath)).toEqual(expect.arrayContaining(TRAINER_CHARACTER_ASSETS));
    expect(BOSSES.map((boss) => boss.assetPath)).toEqual(expect.arrayContaining(activeBossFolderAssets));

    for (const trainer of TRAINERS) {
      expect(trainer.assetPath.startsWith('images/trainers/trainer/')).toBe(true);
      expect(trainerCharacterAssets[`/public/${trainer.assetPath}`]).toBeDefined();
    }

    for (const boss of BOSSES) {
      const asset = boss.assetPath.startsWith('images/trainers/boss/')
        ? bossCharacterAssets[`/public/${boss.assetPath}`]
        : trainerRootAssets[`/public/${boss.assetPath}`];
      expect(asset).toBeDefined();
    }
  });

  it('scales boss runtime hp to the anthrax-calibrated boss value', () => {
    const boss = createBossInstance(0, 10);

    expect(boss.maxHp).toBe(BOSSES[0].maxHp * 104);
    expect(boss.hp).toBe(BOSSES[0].maxHp * 104);
    // 공격력은 밸런싱 상수라 값을 박아두지 않는다. 런타임 인스턴스가 상수를 그대로 쓰는지만 본다.
    expect(boss.attack).toBe(BOSS_COMBAT_STATS.attack);
  });

  it('starts boss encounters without pre-existing symptoms', () => {
    const boss = createBossInstance(0, 10);

    expect(boss.symptoms).toEqual([]);
  });

  it('sets trainer runtime hp and attack below the paired boss values', () => {
    const boss = createBossInstance(0, 10);
    const trainer = createTrainerInstance(0);

    // 1/5은 트레이너 전투가 2턴으로 너무 짧아 1/4로 올렸다.
    expect(trainer.maxHp).toBe(Math.round(boss.maxHp / 4));
    expect(trainer.hp).toBe(Math.round(boss.maxHp / 4));
    expect(trainer.attack).toBe(45);
    expect(boss.attack).toBe(60);
    expect(trainer.attack).toBeLessThan(boss.attack);
    expect(trainer.defense).toBe(boss.defense);
  });

  // 보스·트레이너는 전체 기술 풀을 그대로 들고, 매 턴 chooseBossMove가 ×4/×2/×1 그룹에서 1/3씩 고른다.
  // 프리셋 4개 방식은 폐기했다 — 프리셋이 특정 대상의 ×4를 안 담으면 분포가 깨졌다.
  it('gives bosses and trainers the entire attack pool, not a preset of four', () => {
    const boss = createBossInstance(0, 10);
    const trainer = createTrainerInstance(0);

    expect(boss.moveset).toEqual(BOSS_ATTACK_MOVE_IDS);
    expect(trainer.moveset).toEqual(BOSS_ATTACK_MOVE_IDS);
    // 모든 트레이너가 보스와 동일한 풀을 공유한다(테마 코어 폐기).
    for (const t of TRAINERS) expect(t.movePool).toEqual(BOSS_ATTACK_MOVE_IDS);
    for (const b of BOSSES) expect(b.movePool).toEqual(BOSS_ATTACK_MOVE_IDS);
  });

  it('adds the v3 pathogen sheet fields to every representative pathogen', () => {
    for (const monster of MONSTERS) {
      expect(monster.prep).toBeDefined();
      expect(MOVES[monster.prep!]?.kind).toBe('prep');
      expect(monster.signature).toBeDefined();
      expect(monster.tags.location).toBeDefined();
      expect(monster.tags.size).toBeDefined();
    }
  });

  it('covers every ability and move id from the domain types', () => {
    expect(Object.keys(ABILITIES).sort()).toEqual([
      'acid_tolerance',
      'acidfast',
      'alcohol_disinfection',
      'antigen_disguise',
      'antigen_var',
      'antitoxin',
      'autoinfection',
      'bacteriology_master',
      'barrier',
      'bcg_memory',
      'biofilm',
      'blood_screening',
      'capsule',
      'catalase',
      'comp_evade',
      'comp_patrol',
      'ctl_surveillance',
      'cyst',
      'endotoxin_neutralization',
      'environmental_resistance',
      'eosinophil_recruitment',
      'epithelial_barrier',
      'food_safety',
      'gastric_acid',
      'hand_hygiene',
      'humoral_patrol',
      'immune_cell_kill',
      'immune_regulation',
      'iron_limitation',
      'iron_piracy',
      'large_resistance',
      'larval_migration',
      'latency',
      'lysozyme',
      'mask',
      'microbiota_defense',
      'mucociliary',
      'mycology_master',
      'no_nucleic',
      'none',
      'oxidative_neutral',
      'parasite_master',
      'phagolysosome_block',
      'proteinA',
      'protozoology_master',
      'receptor_defect',
      'safer_sex',
      'spore',
      'tissue_migration',
      'vector_control',
      'virology_master',
      'wound_asepsis',
    ]);

    const requiredMoveIds = [
      'alpha_toxin',
      'amoeba_attach',
      'amoeba_lysis',
      'anthrax_toxin',
      'ascaris_migration',
      'ascaris_obstruction',
      'aspergillus_angio',
      'aspergillus_germination',
      'candida_hypha',
      'candida_switch',
      'capsule_formation',
      'cereus_diarrheal_toxin',
      'cereus_emetic_toxin',
      'cereus_endophthalmitis',
      'cereus_gut_infection',
      'cholera_attach',
      'cholera_toxin',
      'coagulase',
      'cpe',
      'enterotoxin',
      'flood',
      'hiv_cd4',
      'hiv_gp120',
      'hyaluronidase',
      'influenza_attach',
      'influenza_spread',
      'm_antibody',
      'm_complement',
      'm_ctl',
      'm_interferon',
      'm_opsonin',
      'm_phago',
      'm_th1',
      'm_th2',
      'malaria_burst',
      'malaria_invasion',
      'pvl',
      'schisto_disguise',
      'schisto_granuloma',
      'spore_germination',
      'streptokinase',
      'tb_chronic',
      'tb_macrophage_entry',
      'tsst',
    ];

    expect(Object.keys(MOVES).sort()).toEqual(expect.arrayContaining(requiredMoveIds));
    expect(Object.keys(MOVES).length).toBeGreaterThan(requiredMoveIds.length);
    expect(MOVES.listeria_monocytogenes_move_1.kind).toBe('prep');
  });

  it('includes the required effectiveness core rows', () => {
    // 이 표는 **패시몬 → 적** 방향에만 쓴다. 반대 방향은 노트 태그 적중으로 ×4·×2·×1만 정한다(bossMatchup.ts).
    expect(Object.keys(EFFECTIVENESS).sort()).toEqual([
      'antibody',
      'complement',
      'ctl',
      'endotoxin',
      'immune_mediated',
      'interferon',
      'lysis',
      'opsonin',
      'phago',
      'special',
      'spread',
      'superantigen',
      'th1',
      'th2',
      'toxin',
    ]);
  });

  it('keeps pathimon evasion traits out of the matchup table', () => {
    // 방어 특성은 학습 텍스트 전용이다. 상성표에 들어가면 적 공격에 반감·무효가 생겨 설계와 어긋난다.
    const evasionOnlyAbilities = [
      'cyst',
      'larval_migration',
      'tissue_migration',
      'autoinfection',
      'acid_tolerance',
      'environmental_resistance',
      'iron_piracy',
    ] as const;

    for (const ability of evasionOnlyAbilities) {
      const rows = Object.entries(EFFECTIVENESS).filter(([, row]) => row?.[ability] !== undefined);
      expect(rows.map(([type]) => type), `${ability} must stay out of EFFECTIVENESS`).toEqual([]);
    }
  });

  it('references only defined abilities and moves', () => {
    for (const monster of MONSTERS) {
      expect(ABILITIES[monster.ability]).toBeDefined();
      for (const abilityId of monster.abilities ?? []) expect(ABILITIES[abilityId]).toBeDefined();
      for (const moveId of monster.learnset) expect(MOVES[moveId]).toBeDefined();
      if (monster.signature) expect(MOVES[monster.signature]).toBeDefined();
      if (monster.prep) expect(MOVES[monster.prep]).toBeDefined();
    }

    for (const boss of BOSSES) {
      for (const abilityId of boss.abilityPool) expect(ABILITIES[abilityId]).toBeDefined();
      for (const moveId of boss.movePool) expect(MOVES[moveId]).toBeDefined();
    }
  });

  it('has move explanation text for the battle description panel', () => {
    for (const move of Object.values(MOVES)) {
      expect(move.description.length).toBeGreaterThan(0);
      expect(move.learnText.length).toBeGreaterThan(0);
    }
  });

  it('limits invulnerability primitives to once-per-battle signature and prep moves', () => {
    // 준비기도 전투당 1회 제한이라(휴면버스트 아키타입이 무적을 쓴다) 전용기와 함께 허용한다.
    const unrestrictedInvulnerabilityMoves = Object.values(MOVES)
      .filter((move) => move.kind !== 'signature' && move.kind !== 'prep' && hasInvulnerabilityPrimitive(move))
      .map((move) => move.name);

    expect(unrestrictedInvulnerabilityMoves).toEqual([]);
  });

  it('maps eosinophil pressure to one immune abnormality stack', () => {
    expect(MOVES.m_th2.effects).toEqual([{ kind: 'condition', condition: 'immune_abnormal', chance: 1, target: 'enemy' }]);
  });

  it('uses pathimon notes as the source for note-managed moves', () => {
    expect(MOVES.spore_germination.kind).toBe('prep');
    expect(MOVES.spore_germination.typeLabel).toBe('준비');
    expect(MOVES.spore_germination.description).toBe('{name}이 아포를 발아시켜 감염을 준비한다.');
    // 준비기 효과는 아키타입으로 주입된다(이름/서술은 노트 유지). 탄저=독소벼림(외독소 기술 보유).
    expect(MOVES.spore_germination.outcomes?.[0]?.effects).toEqual([
      { kind: 'empower_status', multiplier: 2, turns: 99, target: 'self' },
      { kind: 'buff', stat: 'attack', rank: 1, pct: 50, turns: 99, target: 'self' },
    ]);
    expect(MOVES.capsule_formation.effects).toEqual([{ kind: 'invuln', turns: 3, target: 'self' }]);
    expect(MOVES.capsule_formation.symptom).toBeUndefined();
    expect(MOVES.cereus_emetic_toxin.effects).toEqual([{ kind: 'condition', condition: 'vomiting', chance: 1, target: 'enemy' }]);
    expect(MOVES.cereus_diarrheal_toxin.effects).toEqual([
      { kind: 'condition', condition: 'excretory_dysfunction', chance: 1, target: 'enemy' },
      { kind: 'condition', condition: 'dehydration', chance: 1, target: 'enemy' },
    ]);
    expect(MOVES.cereus_endophthalmitis.effects).toEqual([
      { kind: 'condition', condition: 'blindness', chance: 1, target: 'enemy', stacks: 2 },
    ]);
  });

  it('has character and microscope image assets for the representative pathogens', () => {
    for (const monster of MONSTERS) {
      const assetId = monster.assetBaseId ?? monster.id;
      expect(pathimonAssets[`/public/images/pathimon/${assetId}-front.png`]).toBeDefined();
      expect(pathimonAssets[`/public/images/pathimon/${assetId}-back.png`]).toBeDefined();
      expect(pathimonAssets[`/public/images/pathimon/${assetId}-micro-front.png`]).toBeDefined();
    }
  });

  it('uses display-ready high resolution capsule icons', () => {
    for (const capsuleId of ['universal', 'virus', 'bacteria', 'parasite', 'fungus', 'protozoa', 'prion']) {
      const size = readPngSize(`public/images/capsules/${capsuleId}.png`);
      expect(size.width).toBeGreaterThanOrEqual(96);
      expect(size.height).toBeGreaterThanOrEqual(96);
    }
  });
});

describe('capture OX quiz authoring', () => {
  const withQuiz = NOTE_MONSTERS.filter((monster) => (monster.captureQuiz?.length ?? 0) > 0);

  function memoLineForL(memo: string[], l: number): string | undefined {
    return memo.find((line) => new RegExp(`^L${l}\\b`).test(line));
  }

  // 전종 저작 완료 → "활성 전종 필수"로 강화됐다. 새 노트는 포획 OX를 반드시 저작해야 한다
  // (미저작 시 런타임은 안전 폴백으로 동작하지만 이 테스트가 실패한다).
  it('every active pathimon has an authored capture OX (full coverage)', () => {
    const missing = NOTE_MONSTERS.filter((monster) => (monster.captureQuiz?.length ?? 0) === 0).map((monster) => monster.name);
    expect(missing, `포획 OX 미저작: ${missing.join(', ')}`).toEqual([]);
  });

  it('follows composition rules: 4~5 items, mixed O/X, >=1 direct-treatment, valid 근거 L#', () => {
    for (const monster of withQuiz) {
      const quiz = monster.captureQuiz!;
      const memo = monster.profileMemo ?? [];

      expect(quiz.length, `${monster.name} 문항 수`).toBeGreaterThanOrEqual(4);
      expect(quiz.length, `${monster.name} 문항 수`).toBeLessThanOrEqual(5);
      expect(quiz.some((item) => item.answer === true), `${monster.name} 참(O) 문항 필요`).toBe(true);
      expect(quiz.some((item) => item.answer === false), `${monster.name} 거짓(X) 문항 필요`).toBe(true);

      for (const item of quiz) {
        expect(memoLineForL(memo, item.sourceL), `${monster.name} 근거 L${item.sourceL} 존재`).toBeTruthy();
        expect(item.explain.length, `${monster.name} 해설(L${item.sourceL})`).toBeGreaterThan(0);
      }

      // 직접처치 OX ≥1 — 근거가 `[치료]` 학습포인트인 문항.
      // 단 `[치료]` 학습포인트가 아예 없는 노트(치료가 `대처법`에만 있는 상위형)는 면제한다.
      const hasTreatmentPoint = memo.some((line) => line.includes('[치료]'));
      if (hasTreatmentPoint) {
        const hasTreatmentOX = quiz.some((item) => memoLineForL(memo, item.sourceL)?.includes('[치료]') ?? false);
        expect(hasTreatmentOX, `${monster.name} 직접처치 OX(>=1) 필요`).toBe(true);
      }
    }
  });
});

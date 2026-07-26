import { describe, expect, it } from 'vitest';
import { CAPSULE_ORDER } from '../data/capsules';
import { statusConditionEffectText } from '../data/statusConditions';
import type { RuntimeMonster } from '../types/game';
import {
  battleActionOptions,
  battleBgmAssetPaths,
  battleBgmAudioPaths,
  battleMoveUnavailableReason,
  capsuleIconPath,
  battleFieldLayerLayouts,
  battleHpBarLayout,
  battleSceneAssetPaths,
  battleSpriteLayouts,
  combatSpriteScale,
  cursorMarkerPoint,
  battleUnitPanelLayouts,
  battleUnitPanelRows,
  canUseBattleMove,
  chooseBattleBgm,
  clampProfileMemoScroll,
  commandViewLines,
  defenseTraitDetailLines,
  effectLabels,
  enemyIntentText,
  battleDexSummary,
  formatAnnouncedTreatmentMatchups,
  formatBossAttackMatchupRows,
  formatBattleMatchupSections,
  formatWildTreatmentRows,
  formatMoveDetailSections,
  formatMoveDetails,
  formatMoveName,
  formatPokedexEffectivenessRows,
  formatPokedexMoveRows,
  hpPct,
  hpPercentLabel,
  lockedMoveOverlayPath,
  mobileControlOverlayInteractive,
  mobileHomeButtonLayout,
  monsterStatLine,
  normalizedSpriteScale,
  paginateWrappedTextBlocks,
  paginateWrappedTextLines,
  pathimonTypeIconAssetPaths,
  pathimonSpriteAssets,
  pathimonTypeBorderColor,
  pathimonTypeIcon,
  partyMenuOptions,
  pokerogueAtlasJsonPath,
  resolveMoveSelectionPress,
  statusConditionDetailLines,
  statusProfileMemoLines,
  symptomDetailLines,
  symptomSummary,
  statusSummary,
  shouldPreserveBattleBgm,
  stripMarkdownEmphasis,
} from './battleUi';

function createMonster(overrides: Partial<RuntimeMonster> = {}): RuntimeMonster {
  return {
    templateId: 'strep',
    name: '화농성연쇄상구균',
    scientificName: 'Streptococcus pyogenes',
    category: '세균',
    glyph: '🔗',
    tags: { pathway: 'respiratory', wall: 'gram_positive', location: 'extracellular' },
    maxHp: 44,
    hp: 22,
    attack: 10,
    defense: 3,
    speed: 9,
    captureRate: 0.5,
    ability: 'comp_evade',
    moveset: ['streptokinase', 'hyaluronidase', 'enterotoxin', 'alpha_toxin'],
    effects: [],
    stunned: false,
    fainted: false,
    isBoss: false,
    ...overrides,
  };
}

describe('battle UI helpers', () => {
  it('enables mobile controls when the browser reports touch points', () => {
    expect(mobileControlOverlayInteractive({
      hasTouch: false,
      coarsePointer: false,
      maxTouchPoints: 2,
    })).toBe(true);
  });

  it('formats HP, attack, and defense together for the status card', () => {
    const monster = createMonster({
      hp: 55,
      maxHp: 55,
      attack: 80,
      defense: 50,
    });

    expect(monsterStatLine(monster)).toBe('HP 55/55 · 공격 80 · 방어 50');
  });

  it('preserves all wrapped learning lines across fixed-size pages', () => {
    const lines = Array.from({ length: 9 }, (_, index) => `줄 ${index + 1}`);

    expect(paginateWrappedTextLines(lines, 4)).toEqual([
      '줄 1\n줄 2\n줄 3\n줄 4',
      '줄 5\n줄 6\n줄 7\n줄 8',
      '줄 9',
    ]);
    expect(stripMarkdownEmphasis('**요코가와흡충**과 *타카하시흡충*')).toBe('요코가와흡충과 타카하시흡충');
  });

  it('shows NK as an active battle marker in the pathimon status line', () => {
    expect(statusSummary(createMonster(), ['NK'])).toBe('상태: NK');
    expect(battleUnitPanelRows(createMonster(), 'player', ['NK'])).toContainEqual({
      kind: 'status',
      text: '상태: NK',
    });
  });

  it('places panels opposite the combat sprites like pokerogue', () => {
    const panelLayout = battleUnitPanelLayouts();
    const spriteLayout = battleSpriteLayouts();

    expect(spriteLayout.enemy.x).toBeGreaterThan(spriteLayout.player.x);
    expect(spriteLayout.enemy.y).toBeLessThan(spriteLayout.player.y);
    expect(panelLayout.enemy.x).toBeLessThan(panelLayout.player.x);
    expect(panelLayout.enemy.y).toBeLessThan(panelLayout.player.y);
  });

  it('centers both combat sprites on the visible battlefield platforms', () => {
    const layerLayout = battleFieldLayerLayouts();
    const spriteLayout = battleSpriteLayouts();

    expect(spriteLayout.enemy.x).toBeCloseTo(
      layerLayout.enemyPlatform.x + 215.5 * layerLayout.enemyPlatform.scale,
      5,
    );
    expect(spriteLayout.player.x).toBeCloseTo(
      layerLayout.playerPlatform.x + 103.5 * layerLayout.playerPlatform.scale,
      5,
    );
  });

  it('raises combat sprite bases so platforms stay clear of the unit panels', () => {
    const spriteLayout = battleSpriteLayouts();

    expect(spriteLayout.enemy.y).toBe(218);
    expect(spriteLayout.player.y).toBe(382);
  });

  it('keeps the player sprite below the enemy info panel', () => {
    const panelLayout = battleUnitPanelLayouts();
    const spriteLayout = battleSpriteLayouts();
    const displayHeight = 192 * normalizedSpriteScale(spriteLayout.player.scale, 192);
    const playerTop = spriteLayout.player.y - displayHeight;
    const enemyPanelBottom = panelLayout.enemy.y + panelLayout.enemy.height;

    expect(playerTop).toBeGreaterThanOrEqual(enemyPanelBottom + 8);
  });

  it('keeps battle sprites enlarged for pathimon readability', () => {
    const spriteLayout = battleSpriteLayouts();

    expect(spriteLayout.enemy.scale).toBe(2.5);
    expect(spriteLayout.player.scale).toBe(2.1);
  });

  it('scales trainer sprites up from extracted pokerogue frames', () => {
    const trainer = createMonster({ isTrainer: true, assetPath: 'images/trainers/trainer/doctor_m.png' });

    expect(combatSpriteScale(trainer, 2.5)).toBe(2.75);
    expect(combatSpriteScale(createMonster(), 2.5)).toBe(2.5);
  });

  it('uses capsule-derived pathimon type border colors only in challenge mode', () => {
    expect(pathimonTypeBorderColor(createMonster({ category: '바이러스' }), 'challenge')).toBe(0xeff3f7);
    expect(pathimonTypeBorderColor(createMonster({ category: '세균' }), 'challenge')).toBe(0x409bf4);
    expect(pathimonTypeBorderColor(createMonster({ category: '진균' }), 'challenge')).toBe(0x181818);
    expect(pathimonTypeBorderColor(createMonster({ category: '원충' }), 'challenge')).toBe(0x21167e);
    expect(pathimonTypeBorderColor(createMonster({ category: '연충' }), 'challenge')).toBe(0xeaab1d);
    expect(pathimonTypeBorderColor(createMonster({ category: '프리온' }), 'challenge')).toBe(0xa441bd);
    expect(pathimonTypeBorderColor(createMonster({ category: '박테리아' }), 'challenge')).toBe(0x409bf4);
    expect(pathimonTypeBorderColor(createMonster({ category: '곰팡이' }), 'challenge')).toBe(0x181818);
    expect(pathimonTypeBorderColor(createMonster({ category: '프로토조아' }), 'challenge')).toBe(0x21167e);
    expect(pathimonTypeBorderColor(createMonster({ category: '기생충' }), 'challenge')).toBe(0xeaab1d);
    expect(pathimonTypeBorderColor(createMonster({ category: '세균' }), 'learning')).toBeUndefined();
    expect(pathimonTypeBorderColor(createMonster({ category: '사람', isTrainer: true }), 'challenge')).toBeUndefined();
  });

  it('shows type icons for challenge-mode player pathimon only', () => {
    expect(pathimonTypeIcon(createMonster({ category: '기생충' }), 'challenge')).toEqual({
      assetPath: 'images/ui/types/parasite.png',
      color: 0xeaab1d,
      kind: 'parasite',
    });
    expect(pathimonTypeIcon(createMonster({ category: '세균' }), 'learning')).toBeUndefined();
    expect(pathimonTypeIcon(createMonster({ category: '사람', isTrainer: true }), 'challenge')).toBeUndefined();
  });

  it('exposes image assets for pathimon type badges and sealed signature moves', () => {
    expect(pathimonTypeIconAssetPaths()).toEqual([
      'images/ui/types/virus.png',
      'images/ui/types/bacteria.png',
      'images/ui/types/fungus.png',
      'images/ui/types/protozoa.png',
      'images/ui/types/parasite.png',
      'images/ui/types/prion.png',
    ]);
    expect(lockedMoveOverlayPath()).toBe('images/ui/locked-move-chain.png');
  });

  it('keeps unit panel text focused on role-specific battle information', () => {
    const playerRows = battleUnitPanelRows(createMonster(), 'player');
    const wildRows = battleUnitPanelRows(createMonster({ name: '결핵잠' }), 'enemy');
    const trainerRows = battleUnitPanelRows(createMonster({ isTrainer: true, name: '역학 분석가', scientificName: '일반 사람 (Human Host)' }), 'enemy');
    const bossRows = battleUnitPanelRows(createMonster({ isTrainer: true, isBoss: true, name: '면역 지휘관', scientificName: '보스 사람' }), 'enemy');

    expect(playerRows.map((row) => row.kind)).not.toContain('heading');
    expect(playerRows).toContainEqual({ kind: 'defense', text: '방어특성: 보체회피' });
    expect(wildRows.map((row) => row.kind)).not.toContain('heading');
    expect(wildRows).toContainEqual({ kind: 'defense', text: '방어특성: 보체회피' });
    expect(trainerRows.map((row) => row.kind)).not.toContain('scientificName');
    expect(bossRows).toContainEqual({ kind: 'heading', text: 'BOSS' });
  });
  it('keeps high-resolution microscope sprites at the same displayed battle size', () => {
    expect(normalizedSpriteScale(2.5, 96)).toBe(2.5);
    expect(normalizedSpriteScale(2.5, 1254)).toBeCloseTo(2.5 * 96 / 1254, 5);
    expect(normalizedSpriteScale(2.75, 80)).toBe(2.75);
  });

  it('places the command cursor marker outside the left edge of the active button', () => {
    const button = { x: 646, y: 420, width: 144, height: 42 };
    const marker = cursorMarkerPoint(button);

    expect(marker.x).toBeLessThan(button.x);
    expect(marker.y).toBe(button.y + button.height / 2);
  });

  it('keeps the mobile home button small in the lower-right corner', () => {
    const button = mobileHomeButtonLayout();

    expect(button.label).toBe('처음으로');
    expect(button.x + button.width).toBeLessThanOrEqual(1024);
    expect(button.y + button.height).toBeLessThanOrEqual(576);
    expect(button.width).toBeLessThan(130);
  });

  it('exposes capture-only command actions for wild pathimon encounters', () => {
    expect(battleActionOptions('wild')).toEqual([
      { id: 'pass', label: '지나간다' },
      { id: 'capsule', label: '캡슐' },
      { id: 'dex', label: '도감' },
      { id: 'party', label: '패시몬' },
    ]);
  });

  it('keeps fight commands for human encounters and disables capsules', () => {
    expect(battleActionOptions('trainer')).toEqual([
      { id: 'fight', label: '싸운다' },
      { id: 'dex', label: '도감' },
      { id: 'party', label: '패시몬' },
      { id: 'capsule', label: '캡슐 불가', disabled: true },
    ]);
  });

  it('maps capsule ids to readable menu icon assets', () => {
    expect(CAPSULE_ORDER.map(capsuleIconPath)).toEqual([
      'images/capsules/universal.png',
      'images/capsules/virus.png',
      'images/capsules/bacteria.png',
      'images/capsules/parasite.png',
      'images/capsules/fungus.png',
      'images/capsules/protozoa.png',
      'images/capsules/prion.png',
    ]);
  });

  it('shows contextual party submenu options', () => {
    expect(partyMenuOptions('switch')).toEqual(['교체한다', '능력치를 본다', '그만둔다']);
    expect(partyMenuOptions('release')).toEqual(['놓아준다', '능력치를 본다', '그만둔다']);
    expect(partyMenuOptions('forced')).toEqual(['교체한다', '능력치를 본다']);
  });

  it('offers a free evolution entry only when the selected pathimon can evolve', () => {
    expect(partyMenuOptions('switch', true)).toEqual(['교체한다', '진화한다', '능력치를 본다', '그만둔다']);
    expect(partyMenuOptions('forced', true)).toEqual(['교체한다', '진화한다', '능력치를 본다']);
    expect(partyMenuOptions('release', true)).toEqual(['놓아준다', '능력치를 본다', '그만둔다']);
  });

  it('derives pokerogue atlas json paths from sprite png paths', () => {
    expect(pokerogueAtlasJsonPath('images/pokemon/back/10.png')).toBe('images/pokemon/back/10.json');
  });

  it('keeps the pokerogue battlefield layers at native scale instead of stretching platform pads', () => {
    expect(battleFieldLayerLayouts()).toEqual({
      background: { x: 0, y: 0, scale: 3.2 },
      enemyPlatform: { x: 0, y: -18, scale: 3.2 },
      playerPlatform: { x: 0, y: -40, scale: 3.2 },
    });
  });

  it('uses project-owned pathimon sprites for battle monsters', () => {
    expect(battleSceneAssetPaths()).toEqual({
      grassBack: 'images/arenas/grass_bg.png',
      grassMid: 'images/arenas/grass_a.png',
      grassFront: 'images/arenas/grass_b.png',
    });

    expect(pathimonSpriteAssets(createMonster({ templateId: 'staph' }), 'character')).toEqual({
      front: 'images/pathimon/staph-front.png',
      back: 'images/pathimon/staph-back.png',
    });

    expect(pathimonSpriteAssets(createMonster({ templateId: 'staph' }), 'micro')).toEqual({
      front: 'images/pathimon/staph-micro-front.png',
      back: 'images/pathimon/staph-micro-front.png',
    });
  });

  it('formats move details with a fixed readable battle panel order', () => {
    expect(formatMoveDetails('streptokinase')).toEqual([
      '혈전융해',
      '종류: 공격기',
      '위력: 11',
      '명중률: 92%',
      '효과: 방어 -25%',
      '상태이상: 없음',
      '기술 설명: 혈전과 장벽을 무너뜨려 방어를 깎는다.',
      '학습: 확산하기 쉽게 숙주의 방어선을 흐린다.',
    ]);
  });

  it('formats note-generated prep moves with note effects and name interpolation', () => {
    const monster = createMonster({
      name: '탄저록스',
      moveset: ['spore_germination'],
    });

    expect(formatMoveDetails('spore_germination', monster)).toEqual([
      '아포 발아',
      '종류: 준비기',
      '위력: 0',
      '명중률: 100%',
      // 준비기 효과는 아키타입(탄저=독소벼림)으로 주입된다. 상태이상은 준비기가 직접 걸지 않고 다음 공격을 강화한다.
      '효과: 다음 공격의 상태이상 2배 + 공격력 상승 (전투당 1회)',
      '상태이상: 없음',
      '기술 설명: 탄저록스가 아포를 발아시켜 감염을 준비한다.',
      '학습: 탄저균은 아포 상태로 토양과 동물 제품에서 버티다가 숙주 안에서 발아해 감염을 시작한다.',
    ]);
  });

  it('formats move details into compact metadata and separate text sections', () => {
    const monster = createMonster({
      name: '탄저록스',
      moveset: ['spore_germination'],
    });

    expect(formatMoveDetailSections('spore_germination', monster)).toEqual({
      title: '아포 발아',
      kind: '종류: 준비기',
      power: '위력: 0',
      accuracy: '명중률: 100%',
      effect: '효과: 다음 공격의 상태이상 2배 + 공격력 상승 (전투당 1회)',
      conditions: '상태이상: 없음',
      description: '기술 설명: 탄저록스가 아포를 발아시켜 감염을 준비한다.',
      learnText: '학습: 탄저균은 아포 상태로 토양과 동물 제품에서 버티다가 숙주 안에서 발아해 감염을 시작한다.',
      outcomeRows: [],
    });
  });

  it('formats four-way toxin outcomes as separate probability rows', () => {
    const staph = createMonster({
      name: '황금포도',
      moveset: ['staph_move_3'],
    });

    expect(formatMoveDetailSections('staph_move_3', staph).outcomeRows).toEqual([
      '25%  독소충격증후군 → 혈압 이상, 발열',
      '25%  백혈구 용해 → 면역 이상, 괴사',
      '25%  표피탈락증후군 → 부종, 통증',
      '25%  포도알균 식중독 → 구토, 배설 이상',
    ]);
  });

  it('shows one random profile learning point instead of the move fallback text', () => {
    const monster = createMonster({
      name: '탄저록스',
      moveset: ['spore_germination'],
      profileMemo: [
        'L1 [감별점] 첫 번째 학습포인트',
        'L2 [기전] 두 번째 학습포인트',
      ],
    });

    expect(formatMoveDetailSections('spore_germination', monster, () => 0.99).learnText)
      .toBe('학습: 두 번째 학습포인트');
  });

  it('formats status profile memo lines from pathimon note data', () => {
    const monster = createMonster({
      profileMemo: [
        '세균 타입이며 방어특성은 아포이다.',
        '그람양성 구조와 세포외 위치가 핵심이다.',
        '상처, 호흡기, 소화기 경로로 감염될 수 있다.',
        '아포와 독소, 협막 형성이 대표 병인이다.',
      ],
    });

    expect(statusProfileMemoLines(monster)).toEqual([
      '세균 타입이며 방어특성은 아포이다.',
      '그람양성 구조와 세포외 위치가 핵심이다.',
      '상처, 호흡기, 소화기 경로로 감염될 수 있다.',
      '아포와 독소, 협막 형성이 대표 병인이다.',
    ]);
  });

  it('clamps profile memo scrolling to the visible content range', () => {
    expect(clampProfileMemoScroll(-40, 520, 150)).toBe(0);
    expect(clampProfileMemoScroll(120, 520, 150)).toBe(120);
    expect(clampProfileMemoScroll(999, 520, 150)).toBe(370);
    expect(clampProfileMemoScroll(40, 120, 150)).toBe(0);
  });

  it('shows the current stage in staged move names and details', () => {
    const monster = createMonster({
      moveset: ['anthrax_toxin'],
      moveStages: { anthrax_toxin: 2 },
    });

    expect(formatMoveName('anthrax_toxin', monster)).toBe('탄저 독소 3단계');
    expect(formatMoveDetails('anthrax_toxin', monster)).toEqual([
      '탄저 독소 3단계',
      '종류: 공격기',
      '위력: 95',
      '명중률: 100%',
      '효과: 없음',
      '상태이상: 괴사, 혈압 이상',
      '기술 설명: 화농성연쇄상구균은 LF(lethal factor)로 MAP kinase를 잘라 세포를 괴사시켰다.',
      '학습: LF는 MAP kinase를 절단한다. 스트레스와 염증을 조절하던 축이 끊기면 세포가 조절을 잃고 괴사한다. PA와 합쳐 치사독소가 된다.',
    ]);
  });

  it('describes the enemy planned move for the command view', () => {
    const enemy = createMonster({ name: '황색포도알균', moveset: ['tsst', 'alpha_toxin', 'pvl', 'coagulase'] });

    expect(enemyIntentText(enemy)).toBe('황색포도알균은 TSST 폭주를 하려고 한다.');
  });

  it('uses the boss planned move when one has been selected', () => {
    const enemy = createMonster({
      name: '면역챔피언',
      isBoss: true,
      isTrainer: true,
      moveset: ['m_phago', 'm_opsonin'],
      plannedMoveId: 'm_opsonin',
    });

    expect(enemyIntentText(enemy)).toBe('면역챔피언은 옵소닌 표적화를 하려고 한다.');
  });

  it('describes two planned boss moves during phase two', () => {
    const enemy = createMonster({
      name: '면역챔피언',
      isBoss: true,
      isTrainer: true,
      moveset: ['m_rx_알벤다졸', 'm_interferon'],
      plannedMoveIds: ['m_rx_알벤다졸', 'm_interferon'],
    });

    expect(enemyIntentText(enemy)).toBe('면역챔피언은 알벤다졸 투여와 인터페론 활성화를 준비하고 있다.');
  });

  it('shows only the prompt and planned move on the human battle preparation screen', () => {
    const player = createMonster({ name: '플루리온' });
    const enemy = createMonster({ name: '검체 연구원', isTrainer: true, moveset: ['m_interferon'] });

    expect(commandViewLines(player, enemy, 'trainer', '검체 연구원이 승부를 걸어왔다.', '도움말')).toEqual([
      '플루리온은 무엇을 할까?',
      '검체 연구원은 인터페론 활성화를 하려고 한다.',
    ]);
  });

  it('does not mix the previous round result into the next preparation screen', () => {
    const player = createMonster({ name: '디피실룩' });
    const enemy = createMonster({ name: '현장 대응 요원 4', isTrainer: true, moveset: ['m_complement'] });

    expect(commandViewLines(
      player,
      enemy,
      'trainer',
      '현장 대응 요원 4의 공격이 시력 이상으로 빗나갔다.',
      '도움말',
    )).toEqual([
      '디피실룩은 무엇을 할까?',
      '현장 대응 요원 4는 보체 MAC 형성을 하려고 한다.',
    ]);
  });

  it('does not show planned enemy moves for wild pathimon command copy', () => {
    const player = createMonster({ name: '플루리온' });
    const enemy = createMonster({ name: '결핵잠', moveset: ['tb_chronic'] });

    expect(commandViewLines(player, enemy, 'wild', '결핵잠이 나타났다.', '도움말')).toEqual([
      '플루리온은 무엇을 할까?',
      '결핵잠이 나타났다.',
    ]);
  });

  it('adds the first wild encounter hint without hiding the encounter message', () => {
    const player = createMonster({ name: '플루리온' });
    const enemy = createMonster({ name: '결핵잠', moveset: ['tb_chronic'] });

    expect(commandViewLines(
      player,
      enemy,
      'wild',
      '결핵잠이 나타났다.',
      '도움말',
      '야생 조우에서는 캡슐로 포획하거나 지나갈 수 있습니다.',
    )).toEqual([
      '플루리온은 무엇을 할까?',
      '결핵잠이 나타났다.',
      '야생 조우에서는 캡슐로 포획하거나 지나갈 수 있습니다.',
    ]);
  });

  it('places the hp percent label to the right of the hp bar', () => {
    const panel = battleUnitPanelLayouts().player;
    const layout = battleHpBarLayout(panel);

    expect(layout.percentX).toBe(panel.x + panel.width - 36);
    expect(layout.percentX).toBeGreaterThan(layout.barX + layout.barWidth);
  });
  it('returns hp percentage and effect labels for the unit panel', () => {
    const monster = createMonster({
      effects: [
        { kind: 'buff', stat: 'attack', rank: 1, pct: 100, turns: 2 },
        { kind: 'field', side: 'incoming', factor: 0.5, turns: 2 },
        { kind: 'invuln', turns: 3 },
        { kind: 'dot', power: 4, turns: 2 },
        { kind: 'convert', power: 6, turns: 99 },
      ],
    });

    expect(hpPct(monster)).toBe(0.5);
    expect(hpPercentLabel(monster)).toBe('50%');
    expect(effectLabels(monster)).toEqual([
      '공격 +1',
      '피해감소',
      '무적 3턴',
      '지속피해',
      '개종',
    ]);
    expect(statusSummary(monster)).toBe('상태: 공격 +1, 피해감소, 무적 3턴 외 2');
  });

  it('uses player-facing labels for temporary preparation effects', () => {
    const monster = createMonster({
      effects: [{ kind: 'empower_status', multiplier: 2, turns: 99 }],
    });

    expect(effectLabels(monster)).toContain('다음 공격 상태이상 2배');
    expect(effectLabels(monster)).not.toContain('empower_status');
  });

  it('keeps learning blocks together and balances an oversized block', () => {
    expect(paginateWrappedTextBlocks([
      ['포획에 성공했습니다.'],
      ['L1 첫째 줄', '둘째 줄', '셋째 줄', '넷째 줄'],
    ], 4)).toEqual([
      '포획에 성공했습니다.',
      'L1 첫째 줄\n둘째 줄\n셋째 줄\n넷째 줄',
    ]);

    expect(paginateWrappedTextBlocks([
      ['L5 첫째 줄', '둘째 줄', '셋째 줄', '넷째 줄', '다섯째 줄', '여섯째 줄'],
    ], 4)).toEqual([
      'L5 첫째 줄\n둘째 줄\n셋째 줄',
      '(계속) 넷째 줄\n다섯째 줄\n여섯째 줄',
    ]);
  });

  it('combines repeated rank effects into one status label', () => {
    const monster = createMonster({
      effects: Array.from({ length: 6 }, () => ({ kind: 'buff' as const, stat: 'attack' as const, rank: 1, pct: 100, turns: 2 })),
    });

    expect(effectLabels(monster)).toEqual(['공격 +6']);
    expect(statusSummary(monster)).toBe('상태: 공격 +6');
  });

  it('builds status condition detail lines for hover and long-press tooltips', () => {
    const monster = createMonster({
      statusConditions: {
        fever: 2,
        dehydration: 1,
        fatigue: 2,
        excretory_dysfunction: 3,
        immune_abnormal: 3,
        blindness: 3,
        pain: 2,
      },
    });

    expect(statusConditionDetailLines(monster)).toEqual([
      '발열(2): 매 턴 최대 체력 4% 피해',
      '탈수: 체력 회복량 12.5% 감소',
      '피로(2): 공격력 10% 감소',
      '배설 이상(3): 매 턴 최대 체력 3% 피해, 턴 종료 시 60% 확률로 탈수 1스택 추가',
      '면역 이상(3): 방어 특성 무력화 없음 (4스택마다 1개)',
      '시력 이상(3): 명중률 30% 감소',
      '통증(2): 방어력 10% 감소',
    ]);
  });

  it('builds boss defense trait descriptions for hover and long-press tooltips', () => {
    const boss = createMonster({
      ability: 'epithelial_barrier',
      abilities: ['epithelial_barrier', 'antitoxin'],
      isBoss: true,
      isTrainer: true,
    });

    expect(defenseTraitDetailLines(boss)).toEqual([
      '상피장벽: 확산·용해 기술 피해를 0.5배로 줄입니다.',
      '항독소: 독소 기술 피해를 무효화합니다.',
    ]);
  });

  it('shows each symptom source once in the boss symptom tooltip', () => {
    const boss = createMonster({
      isBoss: true,
      isTrainer: true,
      symptoms: ['기침', '기침', '발열'],
      symptomAttributions: [
        { symptom: '기침', sourceName: '탄저록스' },
        { symptom: '기침', sourceName: '탄저록스' },
        { symptom: '기침', sourceName: '띠포진' },
        { symptom: '발열', sourceName: '세레우톡스' },
      ],
    });

    expect(symptomDetailLines(boss)).toEqual([
      '기침(2): 탄저록스, 띠포진이 부여',
      '발열: 세레우톡스가 부여',
    ]);
  });

  it('matches status tooltip limits to the combat formulas', () => {
    expect(statusConditionEffectText('fever', 60)).toBe('매 턴 최대 체력 120% 피해');
    expect(statusConditionEffectText('fatigue', 30)).toBe('공격력 90% 감소');
    expect(statusConditionEffectText('pain', 30)).toBe('방어력 90% 감소');
    expect(statusConditionEffectText('blindness', 30)).toBe('명중률 100% 감소');
  });

  it('adds stacked canonical status conditions to the unit panel status text', () => {
    const monster = createMonster({
      statusConditions: {
        fever: 3,
        cough: 1,
        immune_abnormal: 2,
        necrosis: 2,
        blindness: 2,
        hearing_abnormal: 1,
        pain: 1,
        itching: 1,
        jaundice: 1,
      },
    });

    expect(effectLabels(monster)).toEqual(['발열(3)', '기침', '면역 이상(2)', '괴사(2)', '시력 이상(2)', '청력 이상', '통증', '가려움', '황달']);
    expect(statusSummary(monster)).toBe('상태: 발열(3), 기침, 면역 이상(2) 외 6');
  });

  it('stacks repeated boss symptoms in the displayed symptom summary', () => {
    const boss = createMonster({
      isTrainer: true,
      symptoms: ['기침', '발열', '기침', '호흡 곤란(2)', '호흡 곤란'],
    });

    expect(symptomSummary(boss)).toBe('기침(2), 발열, 호흡 곤란(3)');
  });

  it('locks signature moves after they are used once in the current battle', () => {
    const monster = createMonster({
      signatureUnlocked: true,
      usedSignatureMoveIds: ['capsule_formation'],
    });

    expect(canUseBattleMove(monster, 'capsule_formation')).toBe(false);
    expect(battleMoveUnavailableReason(monster, 'capsule_formation')).toBe('전용기는 전투당 한 번만 사용할 수 있습니다.');
    expect(canUseBattleMove(createMonster({ signatureUnlocked: false }), 'capsule_formation')).toBe(false);
    expect(battleMoveUnavailableReason(createMonster({ signatureUnlocked: false }), 'capsule_formation')).toBe('전용기가 아직 해금되지 않았습니다.');
    expect(canUseBattleMove(monster, 'hyaluronidase')).toBe(true);
  });

  it('keeps hp percentage relative to base max hp when necrosis lowers the cap', () => {
    const monster = createMonster({
      maxHp: 200,
      hp: 95,
      // 상한은 190으로 줄지만, 퍼센트는 회복처럼 올라가 보이지 않도록 원래 최대 HP를 기준으로 한다.
      statusConditions: { necrosis: 2 },
    });

    expect(hpPct(monster)).toBe(0.475);
    expect(hpPercentLabel(monster)).toBe('48%');
  });

  it('uses a short fallback label when no status effects are active', () => {
    expect(statusSummary(createMonster())).toBe('상태: 정상');
  });

  it('formats only the active pathimon moves for the battle pokedex view', () => {
    const rows = formatPokedexMoveRows(createMonster().moveset);

    expect(rows).toHaveLength(4);
    expect(rows[0]).toEqual({
      name: '혈전융해',
      type: '조직융해',
      power: '11',
      accuracy: '92%',
      description: '혈전과 장벽을 무너뜨려 방어를 깎는다.',
      learnText: '확산하기 쉽게 숙주의 방어선을 흐린다.',
    });
  });

  it('formats type matchup rows for the battle pokedex view', () => {
    const rows = formatPokedexEffectivenessRows();

    expect(rows).toContainEqual({
      attackType: '포식소화',
      target: '피막장벽',
      multiplier: '무효',
    });
    expect(rows).toContainEqual({
      attackType: '대식세포각성',
      target: '세포내',
      multiplier: '강함 x2',
    });
  });

  it('shows the wild opponent own moves in the pokedex move list', () => {
    const enemy = createMonster({
      name: '간실질 잠입',
      category: '흡충',
      hp: 31,
      maxHp: 80,
      attack: 14,
      defense: 8,
      moveset: ['coagulase', 'hyaluronidase', 'enterotoxin', 'streptokinase'],
      countermeasures: {
        direct: ['프라지콴텔'],
        symptomTags: ['복통'],
      },
    });

    const summary = battleDexSummary(enemy);

    expect(summary.opponentName).toBe('간실질 잠입');
    expect(summary.typeLine).toBe('타입: 흡충');
    expect(summary.statLine).toBe('HP 31/80 · 공격 14 · 방어 8');
    expect(summary.moveTabLabel).toBe('기술 목록');
    expect(summary.moveHeading).toBe('간실질 잠입의 기술');
    expect(summary.moveRows.map((row) => row.name)).toEqual([
      '코아굴라제',
      '조직융해',
      '장독소',
      '혈전융해',
    ]);
    expect(summary.moveRows.every((row) => row.multiplier === undefined && row.matchReason === undefined)).toBe(true);
    expect(summary.moveRows.map((row) => row.name)).not.toContain('프라지콴텔 투여');
  });
  it('summarizes attack and defense advice for the current battle matchup', () => {
    const player = createMonster({ ability: 'large_resistance', tags: { pathway: 'gut', wall: 'nematode', location: 'intestinal_lumen', size: 'large' } });
    const enemy = createMonster({ name: '황색포도알균', ability: 'capsule' });
    const sections = formatBattleMatchupSections(player, enemy);

    expect(sections.offense).toContainEqual({
      attackType: '옵소닌표적',
      target: '피막장벽',
      multiplier: '강함 x2',
    });
    expect(sections.defense).toContainEqual({
      attackType: '호산구공격',
      target: '선충',
      multiplier: '강함 x2',
    });
  });

  it('summarizes current boss attacks by target tags', () => {
    const boss = createMonster({
      isBoss: true,
      isTrainer: true,
      moveset: ['m_phago', 'm_opsonin', 'm_rx_페니실린', 'm_rx_아시클로버'],
    });

    const rows = formatBossAttackMatchupRows(boss);

    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({
      attackName: '대식세포 포식',
      attackType: '포식소화',
      targetTags: '대식세포 포식, 포식, 선천면역',
    });
    expect(rows[2]).toMatchObject({
      attackName: '페니실린 투여',
      attackType: '세포벽억제',
      targetTags: expect.stringContaining('페니실린'),
    });
  });

  it('marks the vaccine treatment with a (백신) label in the boss attack list', () => {
    const boss = createMonster({
      isBoss: true,
      isTrainer: true,
      moveset: ['m_vaccination', 'm_phago'],
    });

    const rows = formatBossAttackMatchupRows(boss);

    expect(rows[0].attackName).toBe('백신·항체 접종 (백신)');
    expect(rows[1].attackName).not.toContain('(백신)');
  });

  it('sorts boss attacks by effectiveness vs the defender so effective drugs surface', () => {
    const boss = createMonster({ isBoss: true, isTrainer: true, moveset: ['m_phago', 'm_antibody', 'm_rx_페니실린'] });
    const defender = createMonster({ countermeasures: { direct: ['페니실린'], symptomTags: [] } });

    const rows = formatBossAttackMatchupRows(boss, defender);

    // 페니실린이 걸리는 세포벽억제제(×4)가 맨 위로.
    expect(rows[0].attackName).toContain('페니실린');
    expect(rows[0].multiplier).toBe(4);
    // defender 없으면 정렬·배율 없음(하위 호환).
    expect(formatBossAttackMatchupRows(boss)[0].multiplier).toBeUndefined();
  });

  it('filters a human opponent move list to treatments effective against the active pathimon', () => {
    const trainer = createMonster({
      isTrainer: true,
      moveset: ['m_phago', 'm_rx_페니실린', 'm_rehydration'],
    });
    const defender = createMonster({
      countermeasures: {
        direct: ['페니실린'],
        symptomTags: ['탈수'],
      },
    });

    const summary = battleDexSummary(trainer, defender);

    expect(summary.moveTabLabel).toBe('효과 기술');
    expect(summary.moveHeading).toBe('현재 선출: 화농성연쇄상구균에게 효과적인 적의 처치');
    expect(summary.moveRows.map((row) => [row.name, row.multiplier])).toEqual([
      ['페니실린 투여', 4],
      ['수액요법', 2],
    ]);
    expect(summary.moveRows.map((row) => row.matchReason)).toEqual(['페니실린', '탈수']);
  });

  it('compares every party member with the currently announced enemy treatments', () => {
    const trainer = createMonster({
      name: '감염 순찰대원',
      isTrainer: true,
      moveset: ['m_rx_페니실린', 'm_rehydration'],
      plannedMoveIds: ['m_rx_페니실린', 'm_rehydration'],
    });
    const bacterium = createMonster({
      name: '세균몬',
      countermeasures: { direct: ['페니실린'], symptomTags: [] },
    });
    const dehydrated = createMonster({
      name: '탈수몬',
      countermeasures: { direct: [], symptomTags: ['탈수'] },
    });

    const groups = formatAnnouncedTreatmentMatchups(trainer, [bacterium, dehydrated]);

    expect(groups).toEqual([
      expect.objectContaining({
        attackName: '페니실린 투여',
        party: [
          { monsterName: '세균몬', multiplier: 4 },
          { monsterName: '탈수몬', multiplier: 1 },
        ],
      }),
      expect.objectContaining({
        attackName: '수액요법',
        party: [
          { monsterName: '세균몬', multiplier: 1 },
          { monsterName: '탈수몬', multiplier: 2 },
        ],
      }),
    ]);
  });

  it('groups direct and indirect treatments for a wild pathimon', () => {
    const wild = createMonster({
      countermeasures: {
        direct: ['프라지콴텔'],
        symptomTags: ['복통'],
      },
    });

    const rows = formatWildTreatmentRows(wild);

    expect(rows.some((row) => row.attackName === '프라지콴텔 투여' && row.multiplier === 4)).toBe(true);
    expect(rows.some((row) => row.attackName === '진통제' && row.multiplier === 2)).toBe(true);
    expect(rows.every((row) => (row.multiplier ?? 1) > 1)).toBe(true);
  });

  it('lets a prep move be used once per battle like a signature', () => {
    const fresh = createMonster({ moveset: ['spore_germination'] });
    expect(canUseBattleMove(fresh, 'spore_germination')).toBe(true);

    const used = createMonster({ moveset: ['spore_germination'], usedSignatureMoveIds: ['spore_germination'] });
    expect(canUseBattleMove(used, 'spore_germination')).toBe(false);
    expect(battleMoveUnavailableReason(used, 'spore_germination')).toContain('준비기');
  });
  it('chooses BGM by encounter playlist with fixed late-floor overrides', () => {
    const assets = battleBgmAssetPaths();

    expect(assets.wild).toContain('audio/bgm/abyss.mp3');
    expect(assets.trainer).toContain('audio/bgm/battle_rival.mp3');
    expect(assets.boss).toContain('audio/bgm/battle_unova_gym.mp3');
    expect(battleBgmAudioPaths()).toContain('audio/bgm/battle_galar_gym.mp3');
    expect(battleBgmAudioPaths()).toContain('audio/bgm/end_summit.mp3');
    expect(battleBgmAudioPaths()).toContain('audio/bgm/battle_legendary_unova.mp3');

    expect(chooseBattleBgm({ floor: 1, encounterKind: 'wild', roll: 0, seed: 1234 }))
      .toBe(chooseBattleBgm({ floor: 4, encounterKind: 'wild', roll: 0.99, seed: 1234 }));
    expect(chooseBattleBgm({ floor: 31, encounterKind: 'wild', roll: 0, seed: 1234 }))
      .toBe(chooseBattleBgm({ floor: 34, encounterKind: 'wild', roll: 0.99, seed: 1234 }));
    expect(chooseBattleBgm({ floor: 5, encounterKind: 'trainer', roll: 0.99, seed: 1234 }))
      .toBe(chooseBattleBgm({ floor: 5, encounterKind: 'trainer', roll: 0, seed: 1234 }));
    expect(chooseBattleBgm({ floor: 80, encounterKind: 'boss', roll: 0.99, seed: 1234 }))
      .toBe(chooseBattleBgm({ floor: 80, encounterKind: 'boss', roll: 0, seed: 1234 }));
    expect(chooseBattleBgm({ floor: 70, encounterKind: 'boss', roll: 0, seed: 1234 }))
      .toBe('audio/bgm/battle_galar_gym.mp3');
    expect(chooseBattleBgm({ floor: 90, encounterKind: 'boss', roll: 0, seed: 1234 }))
      .toBe('audio/bgm/end_summit.mp3');
    expect(chooseBattleBgm({ floor: 94, encounterKind: 'wild', roll: 0, seed: 1234 }))
      .toBe('audio/bgm/end_summit.mp3');
    expect(chooseBattleBgm({ floor: 96, encounterKind: 'wild', roll: 0, seed: 1234 }))
      .toBe('audio/bgm/end_summit.mp3');
    expect(chooseBattleBgm({ floor: 99, encounterKind: 'wild', roll: 0, seed: 1234 }))
      .toBe('audio/bgm/end_summit.mp3');
    expect(chooseBattleBgm({ floor: 100, encounterKind: 'boss', roll: 0, seed: 1234 }))
      .toBe('audio/bgm/battle_legendary_unova.mp3');
  });

  it('preserves wild BGM only while staying inside the same four-floor wild block', () => {
    const currentKey = chooseBattleBgm({ floor: 1, encounterKind: 'wild', roll: 0, seed: 777 });

    expect(shouldPreserveBattleBgm({
      currentEncounterKind: 'wild',
      currentKey,
      nextEncounterKind: 'wild',
      nextFloor: 2,
      seed: 777,
    })).toBe(true);
    expect(shouldPreserveBattleBgm({
      currentEncounterKind: 'wild',
      currentKey,
      nextEncounterKind: 'trainer',
      nextFloor: 5,
      seed: 777,
    })).toBe(false);
  });

  it('previews a different move before arming it for execution', () => {
    expect(
      resolveMoveSelectionPress({
        armedMoveId: 'streptokinase',
        moveId: 'hyaluronidase',
        selectedMoveId: 'streptokinase',
      }),
    ).toEqual({
      intent: 'preview',
      armedMoveId: 'hyaluronidase',
      selectedMoveId: 'hyaluronidase',
    });
  });

  it('keeps a hover-previewed move from executing on its first press', () => {
    expect(
      resolveMoveSelectionPress({
        armedMoveId: 'streptokinase',
        moveId: 'hyaluronidase',
        selectedMoveId: 'hyaluronidase',
      }),
    ).toEqual({
      intent: 'preview',
      armedMoveId: 'hyaluronidase',
      selectedMoveId: 'hyaluronidase',
    });
  });

  it('executes a move only after it has already been previewed', () => {
    expect(
      resolveMoveSelectionPress({
        armedMoveId: 'hyaluronidase',
        moveId: 'hyaluronidase',
        selectedMoveId: 'hyaluronidase',
      }),
    ).toEqual({
      intent: 'execute',
      armedMoveId: 'hyaluronidase',
      selectedMoveId: 'hyaluronidase',
    });
  });
});

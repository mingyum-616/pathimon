# Late-Game Professor Boss Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the four shuffled 70~100 floor professor bosses exclusive dialogue, defense traits, images, and distinct floor-100 skills.

**Architecture:** Extend the existing data-driven `finalBossSkill` model instead of branching on boss IDs throughout the battle engine. Keep one-shot skill application in `BossIntroScene`, persistent skill state on the runtime boss, round effects in `battle/turn.ts`, and the NK marker as battle-panel presentation derived from the active enemy.

**Tech Stack:** TypeScript, Phaser 3, Vitest, Vite

## Global Constraints

- Professor bosses remain shuffled across floors 70, 80, 90, and 100.
- A professor's final skill activates only when that professor is assigned to floor 100.
- Dialogue order is encounter dialogue, final-skill dialogue, `{name}은 {skill}을 사용했다!`, then effect application.
- Prof. K gains attack ranks only from voluntary player switches, never initial deployment or forced switches.
- Prof. P's adult attack is 80.
- Existing unrelated `BattleScene.ts` profile-scroll edits must remain intact.

---

### Task 1: Professor Data And Runtime Types

**Files:**
- Modify: `app/src/types/game.ts`
- Modify: `app/src/data/abilities.ts`
- Modify: `app/src/data/bosses.ts`
- Modify: `app/src/state/factory.ts`
- Test: `app/src/data/dataIntegrity.test.ts`

**Interfaces:**
- Produces: `FinalBossSkillId`, `finalBossSkillDialogue`, Prof. K attack override, professor-specific fixed abilities and image paths.
- Consumes: existing `BossData`, `RuntimeMonster`, `createBossInstance`.

- [ ] **Step 1: Write failing professor data tests**

Assert that P/S/K/W have the requested image, name, fixed abilities, dialogue, final skill, and skill dialogue; assert Prof. K's runtime attack is 40 and the others retain their configured boss attack.

- [ ] **Step 2: Run the data tests and verify failure**

Run: `npx.cmd vitest run src/data/dataIntegrity.test.ts -t "professor"`

Expected: failures for missing final skills, dialogue, ability assignments, image changes, and Prof. K attack override.

- [ ] **Step 3: Extend the data types and professor records**

Add:

```ts
export type FinalBossSkillId = 'parasitization' | 'seal' | 'keen_eye' | 'nk_activation';
```

Use it for `BossData.finalBossSkill` and `RuntimeMonster.finalBossSkill`. Add `finalBossSkillDialogue?: string[]`, `fixedAttack?: number`, `parasitizationStage?: 'armed' | 'egg' | 'adult'`, and `parasitizationEggTurnsRemaining?: number`.

Populate the four professor records exactly from the approved spec. Change the displayed ability names to 기생충 마스터, 바이러스 마스터, 진균 마스터, 원생동물 마스터.

- [ ] **Step 4: Preserve Prof. K's attack override in factory output**

Map boss attack as:

```ts
attack: boss.fixedAttack ?? BOSS_COMBAT_STATS.attack
```

Copy skill dialogue and parasitization runtime fields in `createBossInstance`.

- [ ] **Step 5: Run data tests**

Run: `npx.cmd vitest run src/data/dataIntegrity.test.ts`

Expected: all data-integrity tests pass.

### Task 2: Common Floor-100 Dialogue And Skill Activation

**Files:**
- Modify: `app/src/scenes/BossIntroScene.ts`
- Modify: `app/src/battle/turn.ts`
- Test: `app/src/scenes/bossIntroScene.test.ts`
- Test: `app/src/battle/battle.test.ts`

**Interfaces:**
- Produces: `applyFinalBossSkill(state, random)` support for all four skills.
- Consumes: `RuntimeMonster.finalBossSkillDialogue`, `finalBossSkillName`, `finalBossSkillApplied`.

- [ ] **Step 1: Write failing intro-order and activation tests**

Assert that floor 100 appends skill dialogue followed by `${enemy.name}은 ${enemy.finalBossSkillName}을 사용했다!`, and that floors 70~90 do not append or activate the final skill.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npx.cmd vitest run src/scenes/bossIntroScene.test.ts src/battle/battle.test.ts -t "final boss skill|floor 100"`

- [ ] **Step 3: Build the common dialogue sequence**

In `BossIntroScene.init`, append `finalBossSkillDialogue`, then the exact use message only at floor 100. Keep the existing typewriter and click/Enter progression unchanged.

- [ ] **Step 4: Arm persistent skills and preserve immediate seal**

In `applyFinalBossSkill`, mark all supported final skills applied. Keep `seal`'s immediate doll conversion; arm P/W/K by preserving their skill ID and runtime state without immediate damage.

- [ ] **Step 5: Run focused tests**

Expected: intro order and all four one-time activations pass.

### Task 3: Prof. P Parasitization Lifecycle

**Files:**
- Modify: `app/src/battle/effects.ts`
- Modify: `app/src/battle/turn.ts`
- Test: `app/src/battle/battle.test.ts`

**Interfaces:**
- Produces: lethal-hit interception, egg damage immunity, two skipped attacks, adult emergence.
- Consumes: `effectiveMaxHp`, `parasitizationStage`, `parasitizationEggTurnsRemaining`.

- [ ] **Step 1: Write failing lifecycle tests**

Cover direct lethal damage and status lethal damage. Assert first death becomes `-충란` at 1 HP, attacks and status damage cannot lower HP, new status stacks still apply, exactly two enemy attacks are skipped, and emergence sets `-성충`, attack 80, and HP to `effectiveMaxHp`.

- [ ] **Step 2: Run lifecycle tests and verify failure**

Run: `npx.cmd vitest run src/battle/battle.test.ts -t "parasitization|충란|성충"`

- [ ] **Step 3: Add egg damage immunity**

Guard both direct damage and effect/status damage paths when `parasitizationStage === 'egg'`. Do not block `applyEffects`, so status stacks continue accumulating.

- [ ] **Step 4: Intercept first death**

Before boss victory resolution, convert an armed Prof. P at zero HP to:

```ts
parasitizationStage = 'egg';
parasitizationEggTurnsRemaining = 2;
hp = 1;
name = `${baseName}-충란`;
```

Do not allow a second egg conversion after adult emergence.

- [ ] **Step 5: Count skipped attacks and emerge**

Each attempted boss action while in egg state skips the attack and decrements the counter. After the second skipped attack and status phase, set adult state, name suffix `-성충`, attack 80, and HP to `effectiveMaxHp(enemy)`.

- [ ] **Step 6: Run lifecycle tests**

Expected: all parasitization lifecycle tests pass.

### Task 4: Prof. W NK And Prof. K Keen Eye

**Files:**
- Modify: `app/src/battle/turn.ts`
- Modify: `app/src/ui/battleUi.ts`
- Modify: `app/src/scenes/BattleScene.ts`
- Test: `app/src/battle/battle.test.ts`
- Test: `app/src/ui/battleUi.test.ts`

**Interfaces:**
- Produces: NK round damage and panel marker; voluntary-switch attack ranks.
- Consumes: `finalBossSkill`, `finalBossSkillApplied`, existing attack-rank effects.

- [ ] **Step 1: Write failing NK tests**

Assert that an active NK skill deals `ceil(effectiveMaxHp(actor) * 0.1)` during every status phase, follows the newly selected lead, can cause forced switch, and adds an NK line to the status-phase log.

- [ ] **Step 2: Write failing keen-eye tests**

Assert voluntary `resolveSwitchMonster` adds one attack rank to Prof. K on every valid switch. Assert `resolveForcedSwitchMonster`, invalid switches, and initial battle entry do not add ranks.

- [ ] **Step 3: Run focused battle tests and verify failure**

Run: `npx.cmd vitest run src/battle/battle.test.ts -t "NK|keen eye|예민한 눈초리"`

- [ ] **Step 4: Apply NK status-phase damage**

After normal effect damage, damage the current actor by 10% of effective maximum HP, add it to `battleStatusDamage.player`, and append `NK 활성화로 피해를 받고 있다.` to `battleStatusLog`.

- [ ] **Step 5: Apply keen-eye voluntary-switch ranks**

Only inside the successful non-wild path of `resolveSwitchMonster`, push an attack `buff` with `rank: 1` and persistent battle duration onto the boss, then append Prof. K's attack-rise message.

- [ ] **Step 6: Display NK on the active player's panel**

Allow `statusSummary` and `battleUnitPanelRows` to accept optional extra labels. In `BattleScene`, pass `['NK']` only for the active player panel while the enemy's applied final skill is `nk_activation`.

- [ ] **Step 7: Run battle and UI tests**

Expected: NK, keen-eye, and panel-marker tests pass without changing forced-switch behavior.

### Task 5: Integration Verification

**Files:**
- Test: all changed test suites

**Interfaces:**
- Consumes: all prior tasks.
- Produces: verified implementation ready for user review.

- [ ] **Step 1: Run focused suites**

Run:

```powershell
npx.cmd vitest run src/data/dataIntegrity.test.ts src/battle/battle.test.ts src/scenes/bossIntroScene.test.ts src/ui/battleUi.test.ts
```

- [ ] **Step 2: Run the full suite**

Run: `npm.cmd run test:run`

Expected: all tests pass.

- [ ] **Step 3: Build production assets**

Run: `npm.cmd run build`

Expected: TypeScript and Vite production build succeed.

- [ ] **Step 4: Inspect the final diff**

Confirm only professor data, shared skill runtime, battle/UI behavior, tests, and approved design/plan documentation changed. Preserve the pre-existing profile-scroll geometry-mask edit in `BattleScene.ts`.

# Status Card Combat Stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show HP, attack, and defense together on the left status card without overflowing its fixed width.

**Architecture:** Extract the existing combat-stat text into one pure formatter in `battleUi.ts`. Reuse it in the status card and dex summary, rendering the status card value through `addBoxLabel` so long values shrink within one line.

**Tech Stack:** TypeScript, Phaser 3, Vitest

## Global Constraints

- Keep the existing status card dimensions, HP bar position, and name position.
- Display exactly `HP {hp}/{maxHp} · 공격 {attack} · 방어 {defense}`.
- Keep the text on one line and allow automatic font-size reduction.

---

### Task 1: Status card combat-stat line

**Files:**
- Modify: `app/src/ui/battleUi.ts`
- Modify: `app/src/ui/battleUi.test.ts`
- Modify: `app/src/scenes/BattleScene.ts`

**Interfaces:**
- Produces: `monsterStatLine(monster: RuntimeMonster): string`
- Consumes: `addBoxLabel` for fixed-width one-line rendering

- [ ] **Step 1: Write the failing formatter test**

```ts
expect(monsterStatLine(createMonster({
  hp: 55,
  maxHp: 55,
  attack: 80,
  defense: 50,
}))).toBe('HP 55/55 · 공격 80 · 방어 50');
```

- [ ] **Step 2: Run the focused test and verify it fails because `monsterStatLine` is missing**

Run: `npm.cmd test -- --run src/ui/battleUi.test.ts`

- [ ] **Step 3: Implement the formatter and use it in the status card**

```ts
export function monsterStatLine(monster: RuntimeMonster): string {
  return `HP ${monster.hp}/${monster.maxHp} · 공격 ${monster.attack} · 방어 ${monster.defense}`;
}
```

Replace the left-card HP label with a one-line `addBoxLabel` using width `276`, size `17`, minimum size `12`, and `monsterStatLine(monster)`.

- [ ] **Step 4: Run focused tests, the full suite, and the production build**

Run:

```powershell
npm.cmd test -- --run src/ui/battleUi.test.ts
npm.cmd test -- --run
npm.cmd run build
```

- [ ] **Step 5: Commit and push only the status-card implementation files and this plan**

```powershell
git add -- app/src/ui/battleUi.ts app/src/ui/battleUi.test.ts app/src/scenes/BattleScene.ts docs/superpowers/plans/2026-07-26-status-card-combat-stats.md
git commit -m "fix: show combat stats on status card"
git push origin main
```

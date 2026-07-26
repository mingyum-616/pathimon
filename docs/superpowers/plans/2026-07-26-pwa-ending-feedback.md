# Pathimon PWA Ending Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Pathimon installable as a landscape mobile PWA, restore mobile battle controls, and route floor-100 victory through a typed ending and Web3Forms rating screen.

**Architecture:** Keep Phaser's existing 1024×576 game and add a small DOM layer for PWA orientation and mobile text entry. Add an `ending` battle phase and a focused `EndingScene`; keep Web3Forms transport and local draft storage in a Phaser-independent module. Use `vite-plugin-pwa` only at build time so BGM, video, and large gameplay images are not service-worker precached.

**Tech Stack:** TypeScript 5.5, Phaser 3.90, Vite 5, Vitest 2, jsdom, vite-plugin-pwa, Web3Forms JSON API, GitHub Pages

## Global Constraints

- Preserve Phaser's `1024×576`, `Phaser.Scale.FIT`, and smooth `pixelArt: false` rendering.
- Installed PWA and ordinary mobile browser must both support landscape play.
- Cache only the app shell; never precache `audio/**`, video files, or `images/pathimon/**`.
- Never route `https://api.web3forms.com` through a service-worker runtime cache.
- Keep the existing fast dialogue speed at exactly 24ms per character.
- Type story, boss, and ending dialogue; keep ordinary combat-resolution text immediate.
- Floor 100 must not open maintenance, award a usable postgame shop, or enter floor 101.
- Feedback rating is required; feedback text is optional.
- Submit only rating and feedback text. Do not add user email, device, browser, or analytics fields.
- Keep unrelated untracked `claudecode/**` and `docs/pathimon-v2-migration-2026-07-23.md` files untouched.

---

### Task 1: Add the minimal PWA application shell

**Files:**
- Modify: `app/package.json`
- Modify: `app/package-lock.json`
- Modify: `app/vite.config.ts`
- Modify: `app/index.html`
- Modify: `app/src/main.ts`
- Modify: `app/src/vite-env.d.ts`
- Create: `app/public/manifest.webmanifest`
- Create: `app/public/icons/pathimon-192.png`
- Create: `app/public/icons/pathimon-512.png`
- Create: `app/src/pwa/pwaShell.test.ts`

**Interfaces:**
- Consumes: Vite's existing relative `base: './'`.
- Produces: generated `sw.js`, `manifest.webmanifest`, install icons, and automatic service-worker registration.

- [ ] **Step 1: Write the failing PWA shell test**

Create `app/src/pwa/pwaShell.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const appRoot = new URL('../../', import.meta.url);
const indexHtml = readFileSync(new URL('index.html', appRoot), 'utf8');
const manifestText = readFileSync(new URL('public/manifest.webmanifest', appRoot), 'utf8');
const viteConfigSource = readFileSync(new URL('vite.config.ts', appRoot), 'utf8');

describe('PWA application shell', () => {
  it('declares a standalone landscape manifest', () => {
    const manifest = JSON.parse(manifestText) as {
      display: string;
      orientation: string;
      start_url: string;
      icons: Array<{ sizes: string }>;
    };

    expect(manifest.display).toBe('standalone');
    expect(manifest.orientation).toBe('landscape');
    expect(manifest.start_url).toBe('./');
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(['192x192', '512x512']);
  });

  it('adds mobile PWA metadata and excludes heavy assets from precache', () => {
    expect(indexHtml).toContain('rel="manifest" href="./manifest.webmanifest"');
    expect(indexHtml).toContain('viewport-fit=cover');
    expect(viteConfigSource).toContain("globIgnores: ['audio/**/*', 'video/**/*', 'videos/**/*', 'images/**/*']");
    expect(viteConfigSource).toContain("navigateFallback: 'index.html'");
  });
});
```

- [ ] **Step 2: Run the PWA shell test and verify it fails**

Run:

```powershell
cd app
npm run test:run -- src/pwa/pwaShell.test.ts
```

Expected: FAIL because `manifest.webmanifest` and `vite-plugin-pwa` configuration do not exist.

- [ ] **Step 3: Install the build-time PWA plugin**

Run:

```powershell
cd app
npm install --save-dev vite-plugin-pwa
```

Expected: `package.json` and `package-lock.json` contain `vite-plugin-pwa`.

- [ ] **Step 4: Create the manifest and installation icons**

Create `app/public/manifest.webmanifest`:

```json
{
  "name": "패시몬: 감염과 면역",
  "short_name": "패시몬",
  "description": "병원체 패시몬과 함께 감염과 면역을 익히는 전투 게임",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#182131",
  "theme_color": "#182131",
  "icons": [
    {
      "src": "./icons/pathimon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "./icons/pathimon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

Create both PNGs from the existing `app/public/images/pathimon/anthrax-front.png`: center the complete character inside a square `#182131` background with 12% edge padding. Preserve its current artwork and alpha edges; only scale and compose it.

- [ ] **Step 5: Configure Workbox to cache only the shell**

Update `app/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      includeAssets: [
        'manifest.webmanifest',
        'icons/pathimon-192.png',
        'icons/pathimon-512.png',
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,webmanifest,png}'],
        globIgnores: ['audio/**/*', 'video/**/*', 'videos/**/*', 'images/**/*'],
        navigateFallback: 'index.html',
        runtimeCaching: [],
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

Add the PWA client reference to `app/src/vite-env.d.ts`:

```ts
/// <reference types="vite-plugin-pwa/client" />
```

- [ ] **Step 6: Register the worker without blocking game boot**

Add to `app/src/main.ts`:

```ts
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onRegisterError(error) {
    console.warn('PWA service worker registration failed.', error);
  },
});
```

Registration failure must only log a warning and must not stop `boot()`.

- [ ] **Step 7: Add mobile manifest metadata**

Set the head of `app/index.html` to include:

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, viewport-fit=cover"
/>
<meta name="theme-color" content="#182131" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="manifest" href="./manifest.webmanifest" />
<link rel="apple-touch-icon" href="./icons/pathimon-192.png" />
```

- [ ] **Step 8: Run focused tests and production build**

Run:

```powershell
cd app
npm run test:run -- src/pwa/pwaShell.test.ts
npm run build
```

Expected: PASS; `app/dist/manifest.webmanifest`, `app/dist/sw.js`, and both icons exist. Search generated `sw.js` and confirm it does not contain BGM filenames or `api.web3forms.com`.

- [ ] **Step 9: Commit the PWA shell**

```powershell
git add app/package.json app/package-lock.json app/vite.config.ts app/index.html app/src/main.ts app/src/vite-env.d.ts app/public/manifest.webmanifest app/public/icons app/src/pwa/pwaShell.test.ts
git commit -m "feat: add installable PWA shell"
```

---

### Task 2: Make mobile layout and battle controls reliable

**Files:**
- Create: `app/src/ui/mobileLayout.ts`
- Create: `app/src/ui/mobileLayout.test.ts`
- Modify: `app/src/main.ts`
- Modify: `app/src/ui/battleUi.ts`
- Modify: `app/src/ui/battleUi.test.ts`
- Modify: `app/src/scenes/BattleScene.ts`
- Modify: `app/index.html`

**Interfaces:**
- Produces: `isTouchCapable(signals: TouchCapabilitySignals): boolean`.
- Produces: `mountMobileLayout(game: Phaser.Game): () => void`.
- Extends: `mobileControlOverlayInteractive()` input with `maxTouchPoints`.

- [ ] **Step 1: Write failing mobile capability tests**

Create `app/src/ui/mobileLayout.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { isTouchCapable, shouldShowRotateOverlay } from './mobileLayout';

describe('mobile layout', () => {
  it.each([
    [{ hasTouch: true, coarsePointer: false, maxTouchPoints: 0 }, true],
    [{ hasTouch: false, coarsePointer: true, maxTouchPoints: 0 }, true],
    [{ hasTouch: false, coarsePointer: false, maxTouchPoints: 5 }, true],
    [{ hasTouch: false, coarsePointer: false, maxTouchPoints: 0 }, false],
  ])('detects touch capability from any supported signal', (signals, expected) => {
    expect(isTouchCapable(signals)).toBe(expected);
  });

  it('shows rotation guidance only for portrait touch devices', () => {
    const touch = { hasTouch: false, coarsePointer: false, maxTouchPoints: 5 };
    expect(shouldShowRotateOverlay(touch, 390, 844)).toBe(true);
    expect(shouldShowRotateOverlay(touch, 844, 390)).toBe(false);
  });
});
```

Extend the existing `mobileControlOverlayInteractive` tests in `app/src/ui/battleUi.test.ts`:

```ts
expect(mobileControlOverlayInteractive({
  hasTouch: false,
  coarsePointer: false,
  maxTouchPoints: 2,
})).toBe(true);
```

- [ ] **Step 2: Run focused tests and verify they fail**

```powershell
cd app
npm run test:run -- src/ui/mobileLayout.test.ts src/ui/battleUi.test.ts
```

Expected: FAIL because `mobileLayout.ts` and `maxTouchPoints` support do not exist.

- [ ] **Step 3: Implement capability detection**

Create `app/src/ui/mobileLayout.ts` with:

```ts
import type Phaser from 'phaser';

export interface TouchCapabilitySignals {
  hasTouch: boolean;
  coarsePointer: boolean;
  maxTouchPoints: number;
}

export function isTouchCapable(signals: TouchCapabilitySignals): boolean {
  return signals.hasTouch || signals.coarsePointer || signals.maxTouchPoints > 0;
}

export function shouldShowRotateOverlay(
  signals: TouchCapabilitySignals,
  width: number,
  height: number,
): boolean {
  return isTouchCapable(signals) && height > width;
}

export function mountMobileLayout(game: Phaser.Game): () => void {
  // Create one fixed DOM overlay, recalculate on resize/orientationchange,
  // block pointer input while portrait, and request landscape orientation
  // only when the browser exposes screen.orientation.lock.
}
```

The overlay text is exactly `기기를 가로로 돌려주세요`. Set `role="status"`, fixed inset `0`, background `#182131`, centered text, and z-index above game/global controls. Remove all listeners and the overlay in the returned cleanup function.

- [ ] **Step 4: Mount the layout controller**

In `app/src/main.ts`, retain both cleanup functions:

```ts
const game = new Phaser.Game(createGameConfig('game'));
const unmountGlobalControls = mountGlobalControls(game);
const unmountMobileLayout = mountMobileLayout(game);

window.addEventListener('beforeunload', () => {
  unmountMobileLayout();
  unmountGlobalControls();
}, { once: true });
```

- [ ] **Step 5: Extend battle overlay detection**

Change `mobileControlOverlayInteractive` in `app/src/ui/battleUi.ts` to consume `TouchCapabilitySignals` and return `isTouchCapable(input)`.

Change `BattleScene.mobileControlOverlayInteractive()` to pass:

```ts
return mobileControlOverlayInteractive({
  hasTouch: this.sys.game.device.input.touch,
  coarsePointer: window.matchMedia('(pointer: coarse)').matches,
  maxTouchPoints: navigator.maxTouchPoints ?? 0,
});
```

Do not change which BattleScene views intentionally hide the overlay.

- [ ] **Step 6: Add safe-area CSS**

Update `app/index.html` styles. Apply safe-area padding only to `body`; applying it to both `html` and `body` would double the inset:

```css
html {
  box-sizing: border-box;
}

body {
  box-sizing: border-box;
  padding:
    env(safe-area-inset-top)
    env(safe-area-inset-right)
    env(safe-area-inset-bottom)
    env(safe-area-inset-left);
}

*,
*::before,
*::after {
  box-sizing: inherit;
}
```

Keep `#game` at 100% of the remaining safe area and keep `overflow: hidden`.

- [ ] **Step 7: Run focused tests**

```powershell
cd app
npm run test:run -- src/ui/mobileLayout.test.ts src/ui/battleUi.test.ts src/scenes/sceneCleanupLifecycle.test.ts
npm run typecheck
```

Expected: all pass.

- [ ] **Step 8: Commit mobile support**

```powershell
git add app/src/ui/mobileLayout.ts app/src/ui/mobileLayout.test.ts app/src/main.ts app/src/ui/battleUi.ts app/src/ui/battleUi.test.ts app/src/scenes/BattleScene.ts app/index.html
git commit -m "fix: support mobile PWA controls and rotation"
```

---

### Task 3: Route floor-100 victory into an ending phase

**Files:**
- Modify: `app/src/types/game.ts`
- Modify: `app/src/battle/turn.ts`
- Modify: `app/src/battle/battle.test.ts`
- Modify: `app/src/scenes/BattleScene.ts`
- Create: `app/src/scenes/battleEndingTransition.test.ts`

**Interfaces:**
- Produces: new `BattlePhase` value `'ending'`.
- Consumes: existing floor cap `TOTAL_FLOORS` from `app/src/data/monsters.ts`.
- Produces: `EndingScene` start data `{ state: RunState }`.

- [ ] **Step 1: Write failing floor-100 victory tests**

Add to `app/src/battle/battle.test.ts` using the file's existing state and move helpers:

```ts
it.each(['learning', 'challenge'] as const)(
  'enters the ending instead of maintenance after floor 100 in %s mode',
  (mode) => {
    const result = resolvePlayerMove(createBattleState({
      floor: 100,
      mode,
      encounterKind: 'boss',
      enemy: createMonster({ hp: 1, maxHp: 100, isBoss: true, isTrainer: true }),
    }), 'hyaluronidase', 1, 0, 0);

    expect(result.phase).toBe('ending');
    expect(result.shopInventory).toBeUndefined();
  },
);
```

Add a control assertion that a floor-90 challenge boss victory still enters `shop`.

Create `app/src/scenes/battleEndingTransition.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import battleSceneSource from './BattleScene.ts?raw';

describe('BattleScene ending transition', () => {
  it('starts EndingScene when the battle state reaches the ending phase', () => {
    expect(battleSceneSource).toContain("if (this.state.phase === 'ending')");
    expect(battleSceneSource).toContain("this.scene.start('EndingScene', { state: this.state })");
  });
});
```

- [ ] **Step 2: Run focused tests and verify they fail**

```powershell
cd app
npm run test:run -- src/battle/battle.test.ts src/scenes/battleEndingTransition.test.ts
```

Expected: FAIL because `'ending'` is not a phase and BattleScene does not route it.

- [ ] **Step 3: Add the ending phase to battle state**

Add `'ending'` to `BattlePhase` in `app/src/types/game.ts`.

In `setWinState()` in `app/src/battle/turn.ts`:

```ts
const isFinalFloor = state.floor >= TOTAL_FLOORS;
const shouldOpenShop = !isFinalFloor && state.mode === 'challenge' && isHumanEncounter;
const phase: BattlePhase = isFinalFloor
  ? 'ending'
  : shouldOpenShop
    ? 'shop'
    : 'floorClear';
```

Use `phase` in the returned state. Keep battle-only state cleanup and learning-mode post-human healing, but never create shop inventory on the ending phase.

- [ ] **Step 4: Start EndingScene before any floor-clear rendering**

At the top of `BattleScene.afterBattleAction()`:

```ts
if (this.state.phase === 'ending') {
  this.scene.start('EndingScene', { state: this.state });
  return;
}
```

Do not call `advanceFromShop()` for this phase.

- [ ] **Step 5: Run focused tests**

```powershell
cd app
npm run test:run -- src/battle/battle.test.ts src/scenes/battleEndingTransition.test.ts
npm run typecheck
```

Expected: all pass.

- [ ] **Step 6: Commit the ending transition**

```powershell
git add app/src/types/game.ts app/src/battle/turn.ts app/src/battle/battle.test.ts app/src/scenes/BattleScene.ts app/src/scenes/battleEndingTransition.test.ts
git commit -m "feat: route floor 100 victory to ending"
```

---

### Task 4: Apply typewriter behavior to story dialogue

**Files:**
- Modify: `app/src/scenes/StoryScene.ts`
- Modify: `app/src/scenes/PostDisclaimerStoryScene.ts`
- Create: `app/src/scenes/storyTypewriterScene.test.ts`
- Reuse: `app/src/ui/typewriter.ts`

**Interfaces:**
- Consumes: `advanceTypewriter(lines, lineIndex, visibleCharacters)`.
- Uses: fixed `TYPEWRITER_INTERVAL_MS = 24`.

- [ ] **Step 1: Write failing source-contract tests**

Create `app/src/scenes/storyTypewriterScene.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import postDisclaimerSource from './PostDisclaimerStoryScene.ts?raw';
import storySource from './StoryScene.ts?raw';

describe('story typewriter scenes', () => {
  it('types story and wake-up dialogue at the established speed', () => {
    expect(storySource).toContain('const TYPEWRITER_INTERVAL_MS = 24');
    expect(storySource).toContain('advanceTypewriter(');
    expect(postDisclaimerSource).toContain('const TYPEWRITER_INTERVAL_MS = 24');
    expect(postDisclaimerSource).toContain('advanceTypewriter(');
  });

  it('uses confirm input to reveal before advancing', () => {
    expect(storySource).toContain("advance.action === 'reveal'");
    expect(postDisclaimerSource).toContain("advance.action === 'reveal'");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

```powershell
cd app
npm run test:run -- src/scenes/storyTypewriterScene.test.ts
```

Expected: FAIL because these scenes currently draw complete lines.

- [ ] **Step 3: Type StoryScene lines cumulatively**

Add these fields to `StoryScene`:

```ts
private lineIndex = 0;
private visibleCharacters = 0;
private typewriterTimer?: Phaser.Time.TimerEvent;
private dialogueText?: Phaser.GameObjects.Text;
```

For the current page, render completed lines plus the current partial line in one wrapped text object. On pointer/confirm:

1. Reveal the current line if incomplete.
2. Move to the next line if one remains.
3. Move to the next page only after the last line is complete.

Reset `lineIndex` and `visibleCharacters` when changing pages. Cancel the timer on render, skip, and scene shutdown.

- [ ] **Step 4: Type PostDisclaimerStoryScene dialogue**

Keep its existing black-screen delay. Once `... 일어나세요..!` appears, type it at 24ms per character. The first accepted pointer/confirm completes the line; the next accepted input runs the existing one-second black transition to `GameGuideScene`.

- [ ] **Step 5: Run focused tests**

```powershell
cd app
npm run test:run -- src/ui/typewriter.test.ts src/scenes/storyTypewriterScene.test.ts src/scenes/bossIntroScene.test.ts src/scenes/battlePhaseTwoScene.test.ts
npm run typecheck
```

Expected: all pass; existing boss typewriter behavior remains unchanged.

- [ ] **Step 6: Commit story typing**

```powershell
git add app/src/scenes/StoryScene.ts app/src/scenes/PostDisclaimerStoryScene.ts app/src/scenes/storyTypewriterScene.test.ts
git commit -m "feat: type story dialogue progressively"
```

---

### Task 5: Add Web3Forms transport and mobile draft persistence

**Files:**
- Create: `app/src/feedback/endingFeedback.ts`
- Create: `app/src/feedback/endingFeedback.test.ts`

**Interfaces:**
- Produces: `EndingFeedbackDraft`.
- Produces: `loadEndingFeedbackDraft(storage?)`, `saveEndingFeedbackDraft(draft, storage?)`, `clearEndingFeedbackDraft(storage?)`.
- Produces: `submitEndingFeedback(draft, fetchImpl?)`.

- [ ] **Step 1: Write failing feedback module tests**

Create `app/src/feedback/endingFeedback.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import {
  clearEndingFeedbackDraft,
  loadEndingFeedbackDraft,
  saveEndingFeedbackDraft,
  submitEndingFeedback,
} from './endingFeedback';

describe('ending feedback', () => {
  it('persists and clears a mobile draft', () => {
    saveEndingFeedbackDraft({ rating: 4, message: '재미있었습니다.' });
    expect(loadEndingFeedbackDraft()).toEqual({ rating: 4, message: '재미있었습니다.' });
    clearEndingFeedbackDraft();
    expect(loadEndingFeedbackDraft()).toEqual({ rating: 0, message: '' });
  });

  it('submits only rating and message through Web3Forms', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await expect(submitEndingFeedback(
      { rating: 5, message: '좋아요.' },
      fetchImpl,
    )).resolves.toEqual({ ok: true });

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.web3forms.com/submit',
      expect.objectContaining({ method: 'POST' }),
    );
    const request = JSON.parse(fetchImpl.mock.calls[0][1].body as string);
    expect(request).toMatchObject({
      rating: 5,
      message: '좋아요.',
      subject: '[패시몬] 엔딩 피드백 ★5',
      botcheck: '',
    });
    expect(request.email).toBeUndefined();
  });

  it('returns a retryable result for network and API failures', async () => {
    const rejected = vi.fn().mockRejectedValue(new Error('offline'));
    await expect(submitEndingFeedback({ rating: 3, message: '' }, rejected))
      .resolves.toEqual({ ok: false, reason: 'network' });

    const failed = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false }),
    });
    await expect(submitEndingFeedback({ rating: 3, message: '' }, failed))
      .resolves.toEqual({ ok: false, reason: 'server' });
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

```powershell
cd app
npm run test:run -- src/feedback/endingFeedback.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the pure feedback module**

Use these public types and signatures:

```ts
export interface EndingFeedbackDraft {
  rating: number;
  message: string;
}

export type EndingFeedbackSubmitResult =
  | { ok: true }
  | { ok: false; reason: 'invalid-rating' | 'network' | 'server' };

export function loadEndingFeedbackDraft(
  storage?: Storage,
): EndingFeedbackDraft;

export function saveEndingFeedbackDraft(
  draft: EndingFeedbackDraft,
  storage?: Storage,
): void;

export function clearEndingFeedbackDraft(
  storage?: Storage,
): void;

export async function submitEndingFeedback(
  draft: EndingFeedbackDraft,
  fetchImpl: typeof fetch = fetch,
): Promise<EndingFeedbackSubmitResult>;
```

When the optional storage argument is omitted, resolve `window.localStorage` inside a `try` block. Use storage key `pathimon-ending-feedback-draft-v1`. Clamp stored ratings to integer `0..5`; return the empty draft when JSON or localStorage access fails.

POST JSON to `https://api.web3forms.com/submit` with the user-provided public access key, `subject`, `rating`, `message`, and empty `botcheck`. Treat only `response.ok && body.success === true` as success.

- [ ] **Step 4: Run focused tests**

```powershell
cd app
npm run test:run -- src/feedback/endingFeedback.test.ts
npm run typecheck
```

Expected: all pass.

- [ ] **Step 5: Commit feedback transport**

```powershell
git add app/src/feedback/endingFeedback.ts app/src/feedback/endingFeedback.test.ts
git commit -m "feat: add ending feedback transport"
```

---

### Task 6: Build EndingScene and the mobile feedback overlay

**Files:**
- Create: `app/src/ui/endingUi.ts`
- Create: `app/src/ui/endingUi.test.ts`
- Create: `app/src/ui/endingFeedbackOverlay.ts`
- Create: `app/src/ui/endingFeedbackOverlay.test.ts`
- Create: `app/src/scenes/EndingScene.ts`
- Create: `app/src/scenes/endingScene.test.ts`
- Modify: `app/src/game/config.ts`
- Modify: `app/src/game/config.test.ts`

**Interfaces:**
- Consumes: `{ state: RunState }` from Task 3.
- Consumes: feedback module from Task 5.
- Produces: registered Phaser scene key `EndingScene`.
- Produces: `endingRosterEntries(state): EndingRosterEntry[]`.
- Produces: `mountEndingFeedbackTextarea(options): EndingFeedbackTextareaHandle`.

- [ ] **Step 1: Write failing ending-data tests**

Create `app/src/ui/endingUi.test.ts` with a local complete runtime-monster fixture so the test does not depend on another test file's private helper:

```ts
import { describe, expect, it } from 'vitest';
import type { RuntimeMonster } from '../types/game';
import { endingRosterEntries, ENDING_PAGES } from './endingUi';

function createMonster(overrides: Partial<RuntimeMonster> = {}): RuntimeMonster {
  return {
    templateId: 'test',
    name: '테스트몬',
    scientificName: 'Testimon',
    category: '세균',
    glyph: 'T',
    tags: {},
    maxHp: 10,
    hp: 10,
    attack: 10,
    defense: 10,
    speed: 1,
    captureRate: 0,
    ability: 'none',
    abilities: [],
    moveset: [],
    moveSlots: [],
    moveStages: {},
    effects: [],
    statusConditions: {},
    stunned: false,
    fainted: false,
    isBoss: false,
    ...overrides,
  };
}

describe('ending UI data', () => {
  it('uses the final party order and limits the roster to six', () => {
    const party = Array.from({ length: 7 }, (_, index) => createMonster({
      templateId: `monster-${index}`,
      name: `패시몬 ${index}`,
      assetBaseId: `monster-${index}`,
    }));

    expect(endingRosterEntries({ party, visualStyle: 'character' })).toHaveLength(6);
    expect(endingRosterEntries({ party, visualStyle: 'character' })[0].name).toBe('패시몬 0');
  });

  it('keeps a Prof. S substitute visible as a sealed doll', () => {
    const party = [createMonster({
      name: '봉인 인형',
      sealedByBoss: true,
      assetPath: 'images/pathimon/substitute-doll.png',
    })];

    expect(endingRosterEntries({ party, visualStyle: 'character' })[0]).toMatchObject({
      name: '봉인 인형',
      assetPath: 'images/pathimon/substitute-doll.png',
    });
  });

  it('contains the approved ending copy', () => {
    expect(ENDING_PAGES.roster).toEqual([
      '고마워. 이제 네 세계로 돌려보내줄게.',
      '시험 잘 봐!',
    ]);
    expect(ENDING_PAGES.epilogue).toEqual([
      '그러나 패시몬 세계에 모든 힘을 쏟은 주인공은',
      '거짓말같이 감면 시험을 망치고 말았다...',
    ]);
  });
});
```

- [ ] **Step 2: Write failing scene and DOM overlay tests**

Create `app/src/scenes/endingScene.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import endingSceneSource from './EndingScene.ts?raw';

describe('EndingScene', () => {
  it('shows four ending pages and types dialogue at 24ms', () => {
    expect(endingSceneSource).toContain('CONGRATULATIONS!');
    expect(endingSceneSource).toContain('const TYPEWRITER_INTERVAL_MS = 24');
    expect(endingSceneSource).toContain("page: 'feedback'");
  });

  it('requires a rating and preserves feedback on failed submission', () => {
    expect(endingSceneSource).toContain('this.draft.rating <= 0');
    expect(endingSceneSource).toContain('saveEndingFeedbackDraft');
    expect(endingSceneSource).toContain('submitEndingFeedback');
  });
});
```

Create `app/src/ui/endingFeedbackOverlay.test.ts` to mount the overlay against a fake canvas rectangle, assert that it creates a `textarea`, forwards `input`, and removes the element and resize listeners from `destroy()`.

Update `app/src/game/config.test.ts` expected scenes to end with:

```ts
'BossIntroScene',
'EndingScene',
```

- [ ] **Step 3: Run tests and verify they fail**

```powershell
cd app
npm run test:run -- src/ui/endingUi.test.ts src/ui/endingFeedbackOverlay.test.ts src/scenes/endingScene.test.ts src/game/config.test.ts
```

Expected: FAIL because ending files and registration do not exist.

- [ ] **Step 4: Implement ending content and roster mapping**

Create `app/src/ui/endingUi.ts`:

```ts
import type { RuntimeMonster, VisualStyle } from '../types/game';
import { pathimonSpriteAssets } from './battleUi';

export const ENDING_PAGES = {
  roster: [
    '고마워. 이제 네 세계로 돌려보내줄게.',
    '시험 잘 봐!',
  ],
  epilogue: [
    '그러나 패시몬 세계에 모든 힘을 쏟은 주인공은',
    '거짓말같이 감면 시험을 망치고 말았다...',
  ],
} as const;

export interface EndingRosterEntry {
  name: string;
  assetPath: string;
}

export function endingRosterEntries(input: {
  party: RuntimeMonster[];
  visualStyle: VisualStyle;
}): EndingRosterEntry[] {
  return input.party.slice(0, 6).map((monster) => ({
    name: monster.sealedByBoss ? '봉인 인형' : monster.name,
    assetPath: monster.sealedByBoss && monster.assetPath
      ? monster.assetPath
      : pathimonSpriteAssets(monster, input.visualStyle).front,
  }));
}
```

- [ ] **Step 5: Implement the actual mobile textarea overlay**

Create `app/src/ui/endingFeedbackOverlay.ts` with:

```ts
export interface EndingFeedbackTextareaHandle {
  focus(): void;
  setValue(value: string): void;
  destroy(): void;
}

export function mountEndingFeedbackTextarea(options: {
  canvas: HTMLCanvasElement;
  value: string;
  onInput(value: string): void;
}): EndingFeedbackTextareaHandle;
```

The textarea must:

- use `position: fixed` and z-index above Phaser but below the portrait-rotation overlay;
- use `font-family: Pretendard Variable`, translucent `#201c2be6`, white text, and a visible focus border;
- derive its x/y/width/height from the canvas bounding rectangle so it scales with Phaser;
- recalculate on `window.resize`, `orientationchange`, and `visualViewport.resize`;
- set `maxlength="1200"` and placeholder `패시몬에서 느낀 점을 자유롭게 적어주세요.`;
- remove itself and every listener in `destroy()`.

- [ ] **Step 6: Implement EndingScene**

Create `app/src/scenes/EndingScene.ts` with scene key `EndingScene` and data `{ state?: RunState }`.

Required behavior:

1. Preload every `endingRosterEntries()` image.
2. Page `congratulations`: draw gold `CONGRATULATIONS!`; pointer/Enter advances.
3. Page `roster`: draw up to six evenly spaced images and type `ENDING_PAGES.roster`.
4. Page `epilogue`: type `ENDING_PAGES.epilogue`.
5. Page `feedback`: draw five hollow stars, title `패시몬은 어떠셨나요?`, send and skip buttons, and mount the HTML textarea.
6. Type at exactly 24ms per character. First pointer/Enter reveals the current line; next input advances.
7. On star selection, fill stars `1..rating` gold and persist the draft.
8. Disable send while rating is zero or a request is in flight.
9. If `navigator.onLine === false`, keep the draft and show the retry message without calling Web3Forms.
10. Success: clear draft, destroy textarea, show `피드백을 보내주셔서 감사합니다.` and a `처음으로` button.
11. Failure: retain draft and show `전송하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.` with `다시 보내기`.
12. Skip: clear draft, destroy textarea, start `TitleScene`.
13. On scene shutdown/destroy, cancel timers, remove keyboard/pointer listeners, and destroy the textarea idempotently.
14. While the textarea has focus, ignore EndingScene confirm/cancel shortcuts so Enter inserts a line break instead of advancing or submitting.
15. Outside the textarea, left/right changes the star rating and Enter activates the selected feedback button.

- [ ] **Step 7: Register EndingScene**

Import `EndingScene` in `app/src/game/config.ts` and append it after `BossIntroScene` in the scene array.

- [ ] **Step 8: Run focused tests**

```powershell
cd app
npm run test:run -- src/ui/endingUi.test.ts src/ui/endingFeedbackOverlay.test.ts src/scenes/endingScene.test.ts src/game/config.test.ts src/feedback/endingFeedback.test.ts src/ui/typewriter.test.ts
npm run typecheck
```

Expected: all pass.

- [ ] **Step 9: Commit the ending UI**

```powershell
git add app/src/ui/endingUi.ts app/src/ui/endingUi.test.ts app/src/ui/endingFeedbackOverlay.ts app/src/ui/endingFeedbackOverlay.test.ts app/src/scenes/EndingScene.ts app/src/scenes/endingScene.test.ts app/src/game/config.ts app/src/game/config.test.ts
git commit -m "feat: add floor 100 ending and feedback"
```

---

### Task 7: Verify production behavior and publish

**Files:**
- Modify only files required to correct failures found by the checks below.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: a tested GitHub Pages PWA deployment on `main`.

- [ ] **Step 1: Run the full automated verification**

```powershell
cd app
npm run typecheck
npm run test:run
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 2: Inspect the production shell**

Verify:

```powershell
Test-Path app/dist/manifest.webmanifest
Test-Path app/dist/sw.js
Get-ChildItem app/dist/icons/pathimon-*.png
Select-String -LiteralPath app/dist/sw.js -Pattern 'api.web3forms.com|title_afd_2|audio/bgm'
```

Expected: manifest, worker, and both icons exist; the final search returns no Web3Forms or BGM cache entries.

- [ ] **Step 3: Check the focused end-to-end state contracts**

```powershell
cd app
npm run test:run -- src/battle/battle.test.ts src/scenes/battleEndingTransition.test.ts src/scenes/endingScene.test.ts src/feedback/endingFeedback.test.ts src/ui/mobileLayout.test.ts src/pwa/pwaShell.test.ts
```

Expected: floor 100 routes to ending in both modes, mobile detection works, and feedback success/failure tests pass.

- [ ] **Step 4: Review the final diff**

```powershell
git diff --check
git status --short
git diff --stat HEAD~6..HEAD
```

Expected: no whitespace errors; only PWA, mobile, ending, feedback, tests, lockfile, and approved spec/plan files are included. The unrelated untracked files remain untracked.

- [ ] **Step 5: Push main and check Pages**

```powershell
git push origin main
gh run list --workflow "Deploy Pathimon to GitHub Pages" --limit 1
```

Wait for the newest workflow to complete successfully, then verify:

- `https://mushpiba.github.io/pathimon/manifest.webmanifest` loads.
- Installed Android/iOS PWA opens in landscape standalone mode.
- Portrait mode shows the rotation overlay.
- Battle screens show the virtual controls on touch devices.
- A floor-100 test run reaches all four ending pages.
- A 5-star test message arrives through Web3Forms.
- Failed/offline submission keeps the draft and can be retried.

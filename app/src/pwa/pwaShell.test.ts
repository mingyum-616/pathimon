import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readText = (path: string) => new TextDecoder().decode(readFileSync(path));
const indexHtml = readText('index.html');
const manifestText = readText('public/manifest.webmanifest');
const viteConfigSource = readText('vite.config.ts');

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

  it('gives the Phaser parent a definite full viewport while retaining safe-area padding', () => {
    const htmlRule = indexHtml.match(/html\s*\{([^}]*)\}/s)?.[1] ?? '';

    expect(htmlRule).toContain('height: 100%');
    expect(htmlRule).toContain('width: 100%');
    expect(indexHtml).toContain('env(safe-area-inset-top)');
    expect(indexHtml).toContain('env(safe-area-inset-left)');
  });

  it('does not distort the fixed-aspect Phaser canvas on landscape touch screens', () => {
    expect(indexHtml).not.toContain('body.pathimon-touch-landscape #game canvas');
    expect(indexHtml).not.toContain('width: 100% !important');
    expect(indexHtml).not.toContain('height: 100% !important');
  });
});

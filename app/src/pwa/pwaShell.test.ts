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
});

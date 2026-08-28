import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { BILLING_BASE, CHECKOUT_URL } from '../lib/license';

describe('release configuration regressions', () => {
  it('declares every claim once with one matching tagged regression', async () => {
    const claims = JSON.parse(await readFile('.factory/claims.json', 'utf8')) as Array<{ id: string; test: string }>;
    expect(claims.length).toBeGreaterThan(0);
    expect(new Set(claims.map(({ id }) => id)).size).toBe(claims.length);
    const sources = await Promise.all([
      'tests/e2e/claims.spec.ts', 'tests/e2e/extension.spec.ts', 'tests/license.test.ts',
    ].map((path) => readFile(path, 'utf8')));
    const joined = sources.join('\n');
    for (const claim of claims) {
      expect(claim.test).toContain(`@claim:${claim.id}`);
      expect(joined.match(new RegExp(`@claim:${claim.id}(?![a-z-])`, 'g'))).toHaveLength(1);
    }
  });

  it('documents a real demo route and its isolated namespace', async () => {
    expect(await readFile('site/demo/index.html', 'utf8')).toContain('Try Recipe Source Card');
    expect(await readFile('site/demo.ts', 'utf8')).toContain("'demo:recipe-source-card:draft'");
    expect(await readFile('.factory/demo.md', 'utf8')).toContain('demo:recipe-source-card:draft');
  });

  it('uses only the production Sociobot billing host', async () => {
    expect(BILLING_BASE).toBe('https://api.sociobot.in/api/v1');
    expect(CHECKOUT_URL).toBe('https://api.sociobot.in/api/v1/products/recipe-source-card/checkout');
    expect(await readFile('wxt.config.ts', 'utf8')).not.toContain('pilot-api.sociobot.in');
  });

  it('ships Azure response policies and immutable asset caching', async () => {
    const config = JSON.parse(await readFile('site/public/staticwebapp.config.json', 'utf8')) as { globalHeaders: Record<string, string>; routes: Array<{ route: string; headers: Record<string, string> }> };
    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
    expect(config.routes.find((route) => route.route === '/assets/*')?.headers['Cache-Control']).toBe('public, max-age=31536000, immutable');
  });
});

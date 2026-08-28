import { afterEach, describe, expect, it, vi } from 'vitest';
import { DAY, shouldVerify, verifyLicense } from '../lib/license';

afterEach(() => vi.unstubAllGlobals());

describe('license cache', () => {
  it('verifies a token without a cached check', () => expect(shouldVerify({ token: 'token', valid: false, checkedAt: 0 }, 10)).toBe(true));
  it('@claim:daily-license-cache does not request verification more than once per day', () => {
    expect(shouldVerify({ token: 'token', valid: true, checkedAt: 1000 }, 1000 + DAY - 1)).toBe(false);
    expect(shouldVerify({ token: 'token', valid: true, checkedAt: 1000 }, 1000 + DAY)).toBe(true);
  });
});

it('@claim:license-request-privacy sends only the encoded token to the production verification endpoint', async () => {
  const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ valid: true }), { status: 200 }));
  vi.stubGlobal('fetch', request);
  await expect(verifyLicense('receipt token')).resolves.toBe(true);
  expect(request).toHaveBeenCalledWith(
    'https://api.sociobot.in/api/v1/products/recipe-source-card/verify?license=receipt%20token',
    { signal: undefined },
  );
});

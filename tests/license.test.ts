import { describe, expect, it } from 'vitest';
import { DAY, shouldVerify } from '../lib/license';

describe('license cache', () => {
  it('verifies a token without a cached check', () => expect(shouldVerify({ token: 'token', valid: false, checkedAt: 0 }, 10)).toBe(true));
  it('does not call home more than once per day', () => {
    expect(shouldVerify({ token: 'token', valid: true, checkedAt: 1000 }, 1000 + DAY - 1)).toBe(false);
    expect(shouldVerify({ token: 'token', valid: true, checkedAt: 1000 }, 1000 + DAY)).toBe(true);
  });
});

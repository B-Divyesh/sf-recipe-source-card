import type { StoredLicense } from './types';

export const PRODUCT_SLUG = 'recipe-source-card';
export const BILLING_BASE = 'https://pilot-api.sociobot.in/api/v1';
export const CHECKOUT_URL = `${BILLING_BASE}/products/${PRODUCT_SLUG}/checkout`;
export const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
export const LICENSE_CACHE_KEY = `${LICENSE_KEY}:verdict`;
export const DAY = 86_400_000;

export async function verifyLicense(token: string, signal?: AbortSignal): Promise<boolean> {
  const response = await fetch(
    `${BILLING_BASE}/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`,
    { signal },
  );
  if (!response.ok) throw new Error('License service unavailable');
  const data = (await response.json()) as { valid?: boolean };
  return data.valid === true;
}

export function shouldVerify(record: StoredLicense | undefined, now = Date.now()): boolean {
  return Boolean(record?.token) && (!record?.checkedAt || now - record.checkedAt >= DAY);
}

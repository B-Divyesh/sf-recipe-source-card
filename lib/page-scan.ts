import type { PageScan } from './types';

/** This function is serialized into the active page. Keep it self-contained. */
export function scanVisibleRecipeMetadata(): PageScan {
  const jsonLd = Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'))
    .map((script) => script.textContent?.trim() ?? '')
    .filter(Boolean);
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  const siteName =
    document.querySelector<HTMLMetaElement>('meta[property="og:site_name"]')?.content || location.hostname;

  return {
    url: location.href,
    canonicalUrl: canonical && /^https?:/.test(canonical) ? canonical : location.href,
    siteName,
    jsonLd,
  };
}

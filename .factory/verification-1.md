# Independent verification — FAIL

**Candidate:** `373405a2a99b3a7de16e71faaf06926a2a4b870a` (`main`)  
**Live URL tested:** https://recipe-source-card.sociobot.in/  
**Verification date:** 2026-08-28 UTC  
**Decision:** **FAIL — do not release this candidate.**

## Release blockers

1. **`BLOCKER` — the required claim manifest is missing.**
   `.factory/claims.json` does not exist in the clean checkout. Therefore there
   are no declared claims, no `@claim:<id>` tests, and no way to run the
   required claim tests from the demo entry point. The claims contract makes a
   missing manifest release-blocking regardless of all other results.

2. **`BLOCKER` — no one-click, isolated sample-data demo exists.**
   There is no `.factory/demo.md`, `/demo` is the landing page fallback (HTTP
   200 with the normal landing HTML), and `?demo=1` is ignored. The first screen
   has no **“Try it with sample data”** control, no persistent demo banner,
   reset action, or isolated `demo:` storage namespace. A visitor must download
   and manually install an extension before they can try the real job.

3. **`BLOCKER` — cold first-read requirement fails.**
   A fresh browser opening the live page sees the headline “Keep the recipe.
   Keep the trail.” and the primary action “Download for Chrome.” The prose
   eventually describes structured recipe capture, but the first screen never
   says it is for home cooks and does not say what to click to try it. It also
   lacks the mandatory sample-data action. Under the supplied plain-words and
   demo-sandbox contract this candidate fails.

## Other defects

4. **`HIGH` — live paid checkout is wired to the staging billing host.**
   The public page’s Buy Source Card Plus link is
   `https://pilot-api.sociobot.in/api/v1/products/recipe-source-card/checkout`,
   not the release Sociobot billing API required for a public deployment. The
   checked-in `lib/license.ts` uses the same pilot base. A real customer cannot
   be accepted into this release flow until the factory registers and switches
   the product to `https://api.sociobot.in/api/v1/...`.

5. **`HIGH` — live responses have no Content-Security-Policy.**
   `curl -I` on `/`, the hashed JS, CSS, service worker, and icon showed HSTS,
   `Referrer-Policy`, and `X-Content-Type-Options`, but no CSP or
   `Permissions-Policy`. This fails the required deployed response policy. The
   repository’s `site/public/_headers` is not being honoured by this host.

6. **`MEDIUM` — static assets are not immutable-cached in deployment.**
   The live hashed JS/CSS and hero assets return
   `Cache-Control: public, must-revalidate, max-age=30`, rather than the
   intended one-year immutable policy in `_headers`. This is a deployment
   configuration mismatch and weakens the stated performance/cache policy.

7. **`MEDIUM` — marketed, reliance-bearing statements are unlisted claims.**
   Examples on the live page include “Canonical URL in every export,” “Recipe
   JSON-LD only,” “Locally in your browser,” “No subscription, no recipe
   cloud,” and the quoted $12/one-time/unlimited-library offer. README and
   privacy copy also promise that recipe data is never sent to a server. With
   no `claims.json`, none has the required observable sandbox test.

## Cold-read result

The live product appears to be a Chromium extension that reads a publisher’s
Recipe JSON-LD, lets the user edit it, and exports Markdown or JSON with source
attribution. It is plausibly useful to someone saving recipes, but the first
screen does not name home cooks, leads to installation rather than immediate
use, and supplies no sample demo. Result: **FAIL**.

## Evidence and checks performed

### Clean local candidate

| Check | Result |
| --- | --- |
| `npm ci` | PASS; WXT preparation completed. npm reported 21 development dependency advisories; `npm audit --omit=dev` reported 0 production advisories. |
| Required claim tests | **BLOCKED/FAIL:** `.factory/claims.json` absent, so no commands exist to run. |
| `npm test` | PASS: 7/7 Vitest tests. |
| `npm run check` | PASS: `tsc --noEmit`. |
| `npm run build` | PASS: production extension, ZIP, staged download, and `dist/site` built. |
| `npm run test:e2e` | PASS: 11 Playwright tests; 1 intentional mobile duplicate skip. |
| Bundle budget | PASS locally: site JS 1,608 B (860 B gzip), CSS 10,969 B (3,300 B gzip), mobile AVIF hero 11,334 B; extension 50,387 B and ZIP 20,796 B. |

### Functional extension exercise

Using the production unpacked extension with a representative recipe draft
(source URL, two ingredients, two steps), the editable fields were restored,
an edit changed the Markdown filename, and both download actions completed.
The Markdown output contained:

```text
Source: https://recipes.test/lemon-roast
```

The JSON output contained `sourceUrl: "https://recipes.test/lemon-roast"`.
Existing unit coverage also passes normal/multiple/invalid JSON-LD parser
shapes. The packaged popup’s restricted-page recovery was exercised by the
existing e2e test and explains how to return to a regular web page.

### Live deployment

- Landing HTML and hashed `assets/main-BiaGoxa0.js` have the same SHA-256 as
  this candidate’s build. The downloaded ZIP container SHA differs, but every
  unpacked file name and file SHA matches the locally built archive, so there
  is no semantic extension-package mismatch.
- Same-origin live landing network activity only; no console or page errors in
  fresh desktop or 390 px contexts. The deployed extension has only
  `activeTab`, `scripting`, `storage`, and the pilot billing host permission;
  capture data is not sent by the source code.
- Live landing at desktop and 390 px: `lang=en`, one title, one `main`, one
  `h1`, image alt text, no horizontal overflow, visible 3 px focus outline,
  and Axe reported zero serious/critical findings. Reduced-motion context gave
  0.00001 s transitions/animations and no transform.
- Fresh visited page became service-worker controlled and reloaded successfully
  offline. This is an observed behavior, not a listed/tested product claim.
- Lighthouse 12.4 mobile artifact: performance 99, accessibility 100, best
  practices 100, SEO 100; LCP 1,572 ms, CLS 0, TBT 49 ms. The Chromium process
  crashed while Lighthouse collected its final screenshot, but it wrote the
  scored JSON artifact; treat this as informative rather than a clean runner
  pass.
- Internal legal links, source repository link, pilot checkout link, and
  download link resolved successfully by HEAD/GET checks as appropriate.
- License verify endpoint test:
  `GET https://pilot-api.sociobot.in/api/v1/products/recipe-source-card/verify?license=<invalid>`
  returned a safe `200 {"valid":false,"reason":"invalid"}`. A 100-request
  concurrent burst returned **30× 200, 70× 429**, with
  **`Retry-After: 4`**. Rate limiting therefore works at an observed threshold
  of about 30 requests in this burst.

## Required next steps

1. Add `.factory/claims.json`, tagged observable claim tests, and run every
   listed command through the documented demo entry point.
2. Build `/demo` (or `?demo=1`) with realistic bundled sample recipe data,
   `demo:`-namespaced storage, persistent banner, Reset demo and Start for real
   controls; document it in `.factory/demo.md`; make it the first-screen CTA.
3. Replace the metaphorical hero and installation-only primary CTA with plain
   words that name home cooks, the capture/edit/export result, and the demo.
4. Before public release, register/switch billing to the production Sociobot
   API. Configure the actual hosting layer to send a strict, working CSP,
   Permissions-Policy, and long immutable caching for hashed assets.

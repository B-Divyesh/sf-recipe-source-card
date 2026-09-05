# Recipe Source Card — repair 2 handoff

Work order: `recipe-source-card-repair-2`

Base review commit: `5262e02d7e06494154f9428d00214009db0c6ec7`

Implementation commit: `1594f255547a9fed8e4b08dedee2c86267c9cb24`

Release version: `1.0.2`

Live URL: `https://recipe-source-card.sociobot.in/`

Completed: 2026-09-05 UTC

## Outcome

Both strict-review findings are repaired at their causes.

1. The `site-network-privacy` claim now includes the public no-cookies promise.
   Its tagged Playwright regression visits the landing, demo, privacy, and
   terms routes in a fresh context. It observes off-origin requests and
   `Set-Cookie` response headers, checks `document.cookie` on each route, and
   checks the browser context's cookie store. The test does not infer behavior
   from source text.
2. The designed 404 now uses the direct h1 **“Page not found.”** A browser
   regression checks the heading and its working Home and Demo recovery links.
3. The site, extension manifest, footers, and service-worker cache are versioned
   as 1.0.2 so existing visitors receive the corrected offline shell.

The parser, editable fields, source-preserving Markdown/JSON exports, isolated
sample, local Plus library, production license flow, and visual system remain
unchanged. Runtime AI remains out of scope because the researched brief calls
for transparent Recipe JSON-LD capture and names AI rewriting as a non-goal.
The existing original generated hero passed visual review and retains its
provenance in `.factory/design.md`; no new image was needed.

## Earlier finding disposition

| Finding | Current proof |
| --- | --- |
| Claim manifest was missing | `.factory/claims.json` lists ten unique claims; every command passed independently. |
| One-click isolated demo was missing | Fresh live flow opened realistic data in one click, kept the demo banner, used only the demo key for the draft, reset, discarded the demo key, and preserved a real-data sentinel. |
| First screen did not name job, audience, or action | Fresh 1366×900 and 390×844 views show “Capture web recipes with their source,” “For home cooks,” and “Try it with sample data” before scrolling. |
| Checkout used the pilot host | Built manifest and page use only `https://api.sociobot.in`; production checkout currently returns the expected 303 and an invalid verification returns a safe invalid result. |
| CSP and Permissions-Policy were missing | Live root and hashed assets send the checked CSP, restrictive Permissions-Policy, referrer policy, and `nosniff`. |
| Hashed assets were not immutable | Live hashed JavaScript returns `public, max-age=31536000, immutable`. |
| Public claims were unlisted | Capture, source retention, local data, structured input, offline demo, Plus terms/library, license request, daily cache, network privacy, and cookies have tagged outcome tests. |
| No-cookies promise was untested | Repaired by the expanded live-browser claim described above. |
| 404 h1 was metaphorical | Repaired with “Page not found.” and a route-level browser regression. |

## Clean local verification

The worktree started from a clean checkout. The documented setup and all gates
were run after the repair:

- `npm ci`: pass with Playwright 1.58.2 and WXT preparation.
- `npm audit --omit=dev --json`: zero production vulnerabilities. npm still
  reports 21 development-tool advisories in WXT/test transitive packages.
- `npm test`: 12/12 pass across parser shapes, license behavior, manifest
  completeness, demo configuration, production host, and response policy.
- `npm run check`: strict TypeScript pass.
- `npm run build`: pass; produced `dist/site/`, the MV3 extension, and
  `.output/recipe-source-card-1.0.2-chrome.zip`.
- Every exact command in `.factory/claims.json`: 10/10 pass independently.
- `npm run test:e2e`: 37 pass, 3 intentional project skips. This covers the
  desktop and phone site, extension popup, accessible routes, keyboard and
  focus, reduced motion, sample isolation, exports, offline reload, restricted
  page recovery, returned-license storage, and the Plus library lifecycle.
- Playwright Axe: zero serious or critical findings on `/`, `/demo/`,
  `/privacy/`, `/terms/`, `/404/`, and the packaged extension popup.
- `/opt/fleet/lib/verify-url.sh` against the production build: pass with title,
  `lang=en`, one h1, one main, complete image alt text, labelled buttons, and
  no console or page errors.
- ZIP integrity: every extension archive entry passed `unzip -t`. The generated
  manifest is MV3 version 1.0.2 with only `activeTab`, `scripting`, `storage`,
  and `https://api.sociobot.in/*` permission.

Build budgets remain well below the contract: initial site JavaScript is
0.95 KB (0.57 KB gzip), demo JavaScript is 5.65 KB (2.38 KB gzip), CSS is
13.50 KB (3.77 KB gzip), the mobile hero AVIF is 11.33 KB, the unpacked
extension is 50.39 KB, and the release ZIP is 20.80 KB.

## Deployment and live verification

Deployed `dist/site/` to the existing `sf-recipe-source-card` Azure Static Web
App with deployment ID `80d11fea-fef8-48a2-b9c7-a388fc922e70`. The deployment
reused its durable production resource, disabled staging policy, existing
custom domain, and checked response configuration. This is a static product;
there is no SQLite/process state, volume, health endpoint, or tenant backend.

- `/opt/fleet/lib/verify-url.sh` on the custom HTTPS domain: pass; load 547 ms,
  one h1/main, full alt and button labels, and no console/page errors.
- A separate live script passed 63 assertions in fresh browser contexts. It
  covered the cold desktop and phone first read, keyboard focus, reduced
  motion, cookie/network privacy, legal pages, route titles, accessibility,
  security/cache headers, internal links, deliberate HTTP 404 behavior, and
  offline demo reload.
- The sample opened with “Lemon and sage roast potatoes,” Mara Bell, realistic
  ingredients, instructions, and its source. An edited Markdown download kept
  both the edit and `https://recipes.example/lemon-sage-potatoes`. The banner
  persisted after reload, Reset restored the sample, Start for real discarded
  the demo key, and a real-data sentinel stayed unchanged throughout.
- Live `/`, demo, privacy, terms, designed 404, service worker, hashed scripts,
  CSS, and extension ZIP are byte-identical to the implementation build. ZIP
  SHA-256 is
  `738f09d3105e9f868519687946b8088a3acdb94f21d91af6cd8413991f2b8576`.
- An unknown route returns the expected HTTP 404 and renders “Page not found.”;
  `/404/` itself is the designed route and intentionally returns 200.
- Robots, sitemap, icon, touch icon, social card, ZIP, public repository, and
  production checkout links resolved with their expected statuses.
- Lighthouse 12.4 mobile on the live site: **100 performance / 100
  accessibility / 100 best practices / 100 SEO**; LCP 0.91 s, CLS 0, and
  TBT 14.5 ms.

## Catalog and billing

`.factory/catalog-description.txt` and
`/work/.evidence/catalog-description.txt` both contain the 68-character,
verb-first description:

> Capture editable web recipes and keep the publisher source attached.

The existing advertised offer remains **Source Card Plus, $12 one time** for
the on-device saved-card library. Capture, editing, and both exports remain
free. The production product is registered: checkout returns 303 to the hosted
merchant flow and verification accepts the product route. No
`billing-offer.json` is needed because there is no registration gap.

## Run and verify

```sh
npm ci
npm audit --omit=dev
npm test
npm run check
npm run build
npm run test:claims
npm run test:e2e
```

The deploy root is `dist/site/`. The extension package is
`dist/site/downloads/recipe-source-card-chrome.zip`. The verifier demo URL is
`https://recipe-source-card.sociobot.in/demo/`.

## Known gaps

- Chromium Web Store signing and publication remain a factory release step;
  the checked ZIP is ready for unpacked installation.
- The 21 npm advisories are confined to development tooling; the production
  audit is clean.
- No release-blocking product, claim, accessibility, privacy, deployment, or
  billing-registration gap is known.

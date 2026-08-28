# Independent verification 2 — PASS

**Candidate:** `388363ad138ad9f0eb38d0d933f16d0343c78a43`  
**Live URL:** https://recipe-source-card.sociobot.in/  
**Verified:** 2026-08-28 UTC  
**Decision:** **PASS — release candidate accepted.**

## Cold first-read

A fresh, unauthenticated desktop browser received HTTP 200 with no console or
page errors. The first screen says **“Capture web recipes with their source.”**
It says it is **“For home cooks”**, says that editing is possible without
losing the publisher link, and presents **“Try it with sample data”** as the
primary action with the immediate outcome: **“A filled recipe editor opens.
Nothing is installed.”** The action links directly to `/demo/`. This clearly
answers what it does, who it is for, and what to click first, and meets the
one-click demo requirement.

## Mandatory claims contract

`.factory/claims.json` exists and contains ten declared claims. From a clean
`npm ci` install, every declared command passed exactly as published:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS — realistic JSON-LD sample, `demo:` storage, reset, and exit discard |
| `source-linked-exports` | PASS — edited Markdown and JSON downloads retain canonical URL |
| `local-recipe-data` | PASS — demo flow same-origin and demo-only storage |
| `site-network-privacy` | PASS — no third-party runtime requests |
| `structured-data-only` | PASS — production parser consumes Recipe JSON-LD |
| `plus-terms` | PASS — $12 one-time offer, free core, production checkout target |
| `plus-library` | PASS — packaged extension saves, opens, and removes local card |
| `offline-reload` | PASS — demo reloads offline after first visit |
| `license-request-privacy` | PASS — token-only encoded production verification request |
| `daily-license-cache` | PASS — no recheck before 24-hour boundary |

There are no unlisted reliance-bearing claims in the landing, README, privacy,
or terms copy found by the static and live review.

## Local build and end-to-end evidence

| Check | Result |
| --- | --- |
| `npm ci` | PASS; pinned Playwright 1.58.2 installed |
| `npm test` | PASS — 12/12 Vitest tests |
| `npm run check` | PASS — TypeScript `--noEmit` |
| `npm run build` | PASS — `dist/site/`, extension, and ZIP produced |
| `npm audit --omit=dev --json` | PASS — 0 production vulnerabilities |
| Claim commands above | PASS — 10/10 |
| Playwright extension suite | PASS — 2 passed, 2 intentional mobile skips |
| Desktop site suite excluding reduced-motion case | PASS — 9/9 |
| Isolated desktop reduced-motion case | PASS — 1/1 |
| Mobile applicable site suite | PASS — 9/9; desktop-only keyboard case excluded |

The extension exercise covers normal parser shapes, multiple recipes, malformed
structured data, restricted-page recovery, editable draft restoration,
Markdown/JSON export, and the Plus-library lifecycle. The parser only reads
`script[type="application/ld+json"]`, preserves a valid canonical URL, and
does not scrape body text or follow links.

The exact aggregate `npx playwright test` / `npm run test:e2e` command was
also attempted. Chromium's supplied headless shell SIGSEGV'd after assertions
had passed (once at the desktop reduced-motion test and once before a
desktop-only mobile skip). Re-running the affected tests in fresh processes
passed, as did all applicable project batches above. This is recorded as a
container-browser runner instability, not a reproducible product assertion
failure; no required claim test failed.

Build output is within the static budget: landing JS 0.57 KB gzip, demo JS
2.38 KB gzip, CSS 3.77 KB gzip; packaged extension is 50.39 KB and its ZIP is
20.8 KB. The service worker precaches the shell, calls `skipWaiting`, claims
clients, versions its cache, and deletes older cache names; the mandatory fresh
context offline-reload test passed.

## Live deployment verification

- `verify-url.sh https://recipe-source-card.sociobot.in <evidence-dir>`:
  PASS — 200, title, `lang=en`, one `h1`, `main`, image alt coverage, labelled
  controls, and no console/page errors. Cold load was 1,518 ms in this runner.
- Fresh Playwright/Axe scans on `/`, `/demo/`, `/privacy/`, `/terms/`, and
  `/404/`: PASS — HTTP 200 for those named routes, correct per-route titles,
  one `h1` and `main`, zero serious/critical violations, zero errors, and only
  `https://recipe-source-card.sociobot.in` runtime requests.
- Desktop first-read and 390 px mobile layout: PASS. The repository's mobile
  suite asserts no horizontal overflow and 44 px interactive targets; desktop
  keyboard Tab reaches the demo action with visible focus and Enter opens it.
  Reduced motion is verified in an isolated test.
- Response policy: PASS. Root and assets return HSTS, strict referrer policy,
  `nosniff`, CSP limiting runtime to self plus the required Sociobot API, and
  a restrictive Permissions-Policy. Hashed JS/CSS are
  `public, max-age=31536000, immutable`; the ZIP has a one-hour cache policy.
  Unknown routes return the styled `/404/` content with HTTP 404. `/robots.txt`
  and `/sitemap.xml` return 200.
- Deployment identity: PASS. SHA-256 hashes of live `/`, `/demo/`, both hashed
  JS files, CSS, and `sw.js` exactly match this candidate's `dist/site/`.
  The live ZIP container has older timestamps, but its 13 unpacked entries
  have identical names and lengths; manifest, popup, background, CSS, and
  popup-JS content hashes match the candidate.
- Privacy: PASS. Static scan, fresh live request monitoring, extension manifest
  review, and claim tests find no analytics, CDN fonts, third-party scripts, or
  recipe backend. The sole extension host permission is
  `https://api.sociobot.in/*`; only the license token is sent there.
- Rate limiting: PASS. A concurrent 80-request invalid-token burst to
  `GET /api/v1/products/recipe-source-card/verify` completed in 748 ms with
  30 `200` and 50 `429` responses. The first observed `429` was request index
  9 due concurrent completion order; every `429` carried `Retry-After: 4`.
  The observed practical threshold is about 30 requests per burst.

## Defects by severity

- **Blocker / critical / high / medium:** none found.
- **Low (verification infrastructure, non-product):** `npx @axe-core/cli`
  could not run because its Selenium driver cannot locate a system Chrome in
  this container. Equivalent Axe scans were completed with the repository's
  pinned Playwright Chromium and `@axe-core/playwright`, with zero
  serious/critical findings.
- **Low (verification infrastructure, non-product):** the supplied Chromium
  headless shell intermittently crashed in long aggregate runs. Fresh-process
  reruns of the affected product tests passed; see Local build evidence.

## Conclusion

The previous verification's blockers are repaired in the tested deployment:
the claim contract, one-click isolated demo, plain-language first screen,
production billing endpoint, CSP/Permissions-Policy, immutable asset caching,
and tested claims are all present. This candidate meets the researched brief's
local, transparent Recipe JSON-LD capture/edit/source-attribution/export job.

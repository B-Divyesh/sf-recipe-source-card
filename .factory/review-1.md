# Review — capture web recipes with their source

**Verdict: FAIL**

**Implementation reviewed:** `388363ad138ad9f0eb38d0d933f16d0343c78a43`  
**Documentation reviewed:** `107b7da45ba5fc28292cbf403a980172d188e3dc`  
**Live URL:** https://recipe-source-card.sociobot.in/  
**Review date:** 2026-09-05 UTC  
**Findings:** 2 (1 medium, 1 low)  
**Untested public claims:** 1

`107b7da` differs from the implementation candidate only in
`.factory/handoff.md` and `.factory/verification-2.md`. The freshly built
product assets and the live site/extension package match `388363ad`.

## Job, audience, and first action

The job is to capture a web recipe into an editable card while keeping its
publisher source. The audience is home cooks saving recipes. Before scrolling,
both fresh desktop and 390 px phone sessions show the heading “Capture web
recipes with their source,” name home cooks in the next sentence, and show
“Try it with sample data.” The adjacent text says that a filled editor opens
and nothing is installed.

The live demo opened in one click with lemon and sage roast potatoes by Mara
Bell, ingredients, instructions, and the publisher source. Its persistent
banner says “Demo — sample data, nothing is saved to your real data.” Editing
the name and exporting Markdown produced `review-potato-card.md`, including
both the edited name and `Source: https://recipes.example/lemon-sage-potatoes`.
The demo stored only `demo:recipe-source-card:draft`, Reset restored the
bundled recipe, and Start for real removed that key.

## Findings

1. **MEDIUM — the public no-cookies privacy promise has no declared claim or
   test.**

   `/privacy/` says, “The website uses no analytics, cookies, third-party
   fonts, or third-party runtime scripts.” The `site-network-privacy` manifest
   claim and its tagged test cover analytics, fonts, and third-party runtime
   scripts, but do not include cookies. The test only records off-origin
   requests; it does not assert `document.cookie` or absence of `Set-Cookie`.
   This is a reliance-bearing privacy statement without a matching executable
   claim, which fails the claims contract. Fresh live checks currently observed
   an empty `document.cookie` and no `Set-Cookie` on `/`, `/demo/`, `/privacy/`,
   or `/terms/`; that observation does not replace a declared regression test.

   Repair by extending the manifest claim and its browser test to assert no
   cookies for those public routes, or remove “cookies” from the public copy.

2. **LOW — the 404 heading uses a metaphor instead of plain words.**

   The designed 404 page works and returns HTTP 404 for an unknown route, but
   its sole h1 is “This page is not on the card.” The plain-words contract
   forbids metaphorical headings on every page, including 404 pages. Use a
   direct heading such as “Page not found.”

## Declared claim commands

From a separate clean clone of `107b7da`, after `npm ci`, all ten commands in
`.factory/claims.json` passed individually. There were no failed declared
claims.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `source-linked-exports` | PASS |
| `local-recipe-data` | PASS |
| `site-network-privacy` | PASS for its declared analytics/font/runtime-script scope |
| `structured-data-only` | PASS |
| `plus-terms` | PASS |
| `plus-library` | PASS with a freshly built unpacked production extension |
| `offline-reload` | PASS |
| `license-request-privacy` | PASS |
| `daily-license-cache` | PASS |

The untested-claim count is one because the separate “no cookies” promise is
not included in that declared scope or test.

## Local product checks

- `npm ci`: PASS from the clean clone. WXT preparation completed.
- `npm audit --omit=dev --json`: PASS; zero production vulnerabilities.
- `npm test`: PASS; 12 tests passed.
- `npm run check`: PASS.
- `npm run build`: PASS; it produced `dist/site/`, the production extension,
  and the ZIP.
- The production extension claim exercised saving, reopening, and removing a
  Plus card in fresh extension storage. Parser/unit coverage covers normal,
  multiple, malformed, and recovery paths.
- Targeted desktop keyboard, mobile no-overflow/44 px controls, and
  reduced-motion tests each passed in fresh browser processes.

The aggregate `npm run test:e2e` and per-project aggregate Playwright runs
were also attempted. The supplied Chromium headless shell crashed with
`SIGSEGV` while creating a later browser context; the interrupted assertion
was `browser.newContext: Target page, context or browser has been closed`, not
a product assertion. The affected `plus-terms` and keyboard tests, all
declared claim commands, and the targeted mobile/reduced-motion tests passed
when rerun in fresh processes. This is a repeated container-browser tooling
caveat, not a product finding.

## Live checks

- Fresh desktop and 390 px phone pages loaded without console or page errors.
  Both had no horizontal overflow. The desktop and phone first screens were
  visually inspected.
- Fresh live Axe scans on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/`
  found zero serious or critical violations. Each named route had its own
  title, exactly one h1, one main landmark, and no off-origin runtime request.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, title, `lang=en`, one h1,
  main, complete image alt text, labelled controls, and no console/page errors.
- Keyboard focus reaches the sample action, Enter opens the demo, and the
  reduced-motion check passes. The demo's service-worker offline-reload claim
  passed in its isolated fresh context.
- All discovered internal links returned 200; the ZIP returned 200; checkout
  returned its expected 303; the source repository returned 200. `/404/` is a
  deliberate designed 200 route, while an unknown URL returned the designed
  404 page with HTTP 404.
- Root and asset responses have HSTS, strict referrer policy, `nosniff`, the
  expected CSP, and restrictive Permissions-Policy. Hashed assets are
  `public, max-age=31536000, immutable`.
- Live SHA-256 values for root, demo, both JS files, CSS, and `sw.js` equal the
  clean candidate build. The downloaded live ZIP extracted to the same ten
  files as the candidate ZIP, with no content differences; `unzip -t` passed.
- An 80-request invalid-license burst to the production product verification
  endpoint returned 30 `200` and 50 `429`; every 429 carried `Retry-After: 4`.

`npx @axe-core/cli https://recipe-source-card.sociobot.in/` could not start
because its Selenium driver cannot locate a system Chrome in this container.
The pinned Playwright Chromium and `@axe-core/playwright` completed the live
Axe checks above. This is the second known non-product tooling caveat and is
not counted as a product finding.

## Earlier findings and current disposition

| Earlier finding | Current disposition |
| --- | --- |
| Claim manifest missing | Repaired: manifest exists and all ten published commands pass. The separate no-cookies promise remains a new, narrower scope gap recorded above. |
| One-click isolated demo missing | Repaired: live one-click demo, banner, demo-only key, reset, and exit discard all observed. |
| First screen did not name job, audience, or trial action | Repaired on desktop and phone before scrolling. |
| Checkout used the pilot billing host | Repaired: the live checkout target is the production Sociobot API and responds 303. |
| CSP and Permissions-Policy missing | Repaired: both headers are live on root, assets, and 404 responses. |
| Hashed assets lacked immutable caching | Repaired: the checked live JS asset is one-year immutable cached. |
| Earlier unlisted marketing/privacy claims | Repaired for the tested capture, source, local-data, structured-data, offline, and Plus claims. The no-cookies statement is the one remaining public claim gap. |

## Conclusion

The capture/edit/source/export job, extension package, sample sandbox, live
site, legal routes, accessibility checks, offline behavior, headers, cache
policy, and license rate limiting all work as reviewed. This is nevertheless
**FAIL** because a public privacy claim is untested and the 404 h1 violates the
plain-words contract. No product code was changed during this review.

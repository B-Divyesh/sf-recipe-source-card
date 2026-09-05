# Verification 3 — capture web recipes with their source

**Verdict: FAIL**

**Implementation reviewed:** `1594f255547a9fed8e4b08dedee2c86267c9cb24`  
**Documentation reviewed:** `181cce4a596ad3c7c2fbbff0093900c0c3f339ea`  
**Deployment reviewed:** `80d11fea-fef8-48a2-b9c7-a388fc922e70`  
**Live URL:** https://recipe-source-card.sociobot.in/  
**Verified:** 2026-09-05 UTC  
**Findings:** 8  
**Untested public claims:** 5

`181cce4` changes only `.factory/handoff.md` after the implementation commit.
The live HTML, JavaScript, CSS, service worker, and unpacked extension contents
match the clean build from `1594f25`.

## Job, audience, and first action

The job is to capture a web recipe into an editable card while keeping the
publisher source. The audience is home cooks saving web recipes. Before
scrolling, fresh desktop and 390 × 844 phone browsers show “Capture web recipes
with their source,” name home cooks, and show “Try it with sample data.” The
adjacent text says a filled editor opens and nothing is installed.

The sample action ends at 671 CSS px on the 900 px desktop viewport and 676 CSS
px on the 844 px phone viewport. Both views therefore show the first action
before scrolling.

## Findings

1. **HIGH — the extension privacy promise is not tested by its declared claim.**

   The installed popup says “Nothing is sent away” and “No recipe data leaves
   your browser.” README and Privacy make the same product-wide promise. The
   `local-recipe-data` command only opens the website demo and records that
   page's requests and `localStorage`. It never loads the unpacked extension,
   captures from a recipe page, records extension requests, or checks extension
   storage. The behavior looks consistent with the source and limited manifest
   permissions, but the public extension claim has no required observable
   regression.

2. **MEDIUM — the extension's offline capture and export promise is unlisted and
   untested.**

   The popup states, “Capture and export still work on loaded pages” while
   offline. The only offline claim and test cover reloading the website demo.
   No claim entry or installed-extension test takes the extension offline and
   completes capture and export.

3. **MEDIUM — the capture-date export promise is not asserted.**

   The landing page says, “Both files include the publisher URL and capture
   date.” `source-linked-exports` checks the edited filename and source URL, but
   does not assert a capture date in either Markdown or JSON. No other claim
   lists the date promise.

4. **MEDIUM — the declared free-core claim checks copy, not the promised
   outcome.**

   `plus-terms` says capture and export remain free, but its test only reads the
   pricing text and checkout link. The unpacked-extension tests cover a
   restricted-page error and a library with a seeded valid license. No tagged
   test proves that a fresh extension with no license can capture, edit, and
   export both formats.

5. **LOW — “no account required” is an unlisted public claim.**

   The extension shows “$12 once · no account required.” The claim manifest
   covers the price, purchase type, and local library, but not the account
   statement. No declared command checks it.

6. **MEDIUM — secondary routes omit required site metadata.**

   Live `/demo/` has no Apple touch icon, Open Graph metadata, or Twitter card.
   Live `/privacy/` and `/terms/` also lack a theme color and favicon. The
   attached site-structure contract requires the product metadata set on real
   routes, not only on `/`. Titles, descriptions, and canonicals are present.

7. **LOW — legal and 404 headers do not use the standard site navigation.**

   `/privacy/`, `/terms/`, and `/404/` render only the home wordmark in their
   headers and have no header `nav`. The landing and demo routes include header
   navigation. This fails the required consistent header skeleton, although
   footer links still provide recovery.

8. **LOW — the website license form gives no response for empty input.**

   In a fresh live browser, opening “Have a license?” and choosing “Save
   license” with an empty field leaves the status empty, stores nothing, and
   does not move focus. The input is not marked required and has no announced
   error. This fails the invalid-form and accessible-error requirements. The
   extension's own restore form does provide a useful empty-token error.

Because findings 1–5 leave five public claims untested, the claims contract
requires a FAIL even though all ten commands currently listed in
`.factory/claims.json` exit successfully.

## Sample sandbox evidence

A fresh live desktop context entered the sample from the landing page in one
click. It showed the persistent “Demo — sample data, nothing is saved to your
real data” label and filled:

- Lemon and sage roast potatoes
- Mara Bell
- 4 servings and PT55M
- five realistic ingredients and three instructions
- `recipes.example` as the displayed publisher

An edited name and yield survived reload. Markdown and JSON downloads kept the
edit and `https://recipes.example/lemon-sage-potatoes`. Reset restored the
original sample and focused the recipe-name input. Start for real removed
`demo:recipe-source-card:draft`. A separately seeded real-data sentinel stayed
unchanged through edit, reload, reset, and exit. Corrupt demo JSON recovered to
the bundled sample, and an empty recipe name exported as “Untitled recipe.”

The same demo reloaded offline after its first visit in a separate browser
context.

## Declared claim commands

All commands were run exactly as published from a separate clean clone of
`181cce4` after `npm ci`.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `source-linked-exports` | PASS |
| `local-recipe-data` | PASS for its demo-only sandbox |
| `site-network-privacy` | PASS |
| `structured-data-only` | PASS |
| `plus-terms` | PASS for copy and checkout-target assertions; incomplete outcome coverage is finding 4 |
| `plus-library` | PASS |
| `offline-reload` | PASS for the website demo |
| `license-request-privacy` | PASS |
| `daily-license-cache` | PASS |

## Clean checkout and installed artifact

- `npm ci`: PASS with the pinned Playwright 1.58.2 package.
- `npm audit --omit=dev`: PASS, zero production vulnerabilities. npm reports 21
  advisories in development tooling.
- `npm test`: PASS, 12/12 tests.
- `npm run check`: PASS.
- `npm run build`: PASS; produced `dist/site/`, the MV3 extension, and ZIP.
- All ten claim commands: PASS independently.
- `npx playwright test tests/e2e/extension.spec.ts --project=desktop`: PASS,
  2/2. This exercises the unpacked build's accessibility, restricted-page
  recovery, and Plus library lifecycle in fresh extension storage.
- The full `npm run test:e2e` runner reached 36 passes and 3 intentional skips,
  then its Chromium headless shell crashed with `SIGSEGV` before creating the
  mobile 404 context. The interrupted 404 test passed alone in a new process.
  A later desktop batch reproduced the same runner crash; its interrupted 404
  and reduced-motion tests each passed alone. These are browser-process
  failures, not failed product assertions, and match the earlier recorded
  container caveat.
- The live ZIP passes `unzip -t`. Its container hash differs because of ZIP
  timestamps, while every unpacked file is byte-identical to the clean build.

The build remains within budget: landing JavaScript is 0.95 KB (0.58 KB gzip),
demo JavaScript is 5.65 KB (2.39 KB gzip), CSS is 13.50 KB (3.79 KB gzip), the
mobile hero AVIF is 11.33 KB, and the extension ZIP is 20.80 KB.

## Live accessibility, privacy, routes, and deployment

- `/opt/fleet/lib/verify-url.sh`: PASS; 749 ms load, correct title and language,
  one h1 and main, complete alt text, labelled buttons, and no unexpected
  console or page errors.
- A separate live browser run passed 85 assertions across fresh desktop,
  phone, demo, offline, reduced-motion, keyboard, route, privacy, and recovery
  contexts.
- Playwright Axe found zero violations of any impact on `/`, `/demo/`,
  `/privacy/`, `/terms/`, and `/404/`.
- Desktop Tab reaches the skip link first, the skip link works, the sample
  action has a visible focus ring, and Enter opens the demo.
- The 390 px landing and demo have no horizontal overflow. Every visible link,
  button, input, textarea, and summary checked on the phone is at least 44 × 44
  CSS px.
- Reduced motion removes the landing animation and transition.
- Public routes made no off-origin runtime requests, set no cookies, and left
  both `document.cookie` and the browser cookie jar empty.
- `/`, demo, Privacy, Terms, `/404/`, robots, sitemap, icons, social image,
  download, and public source links resolve. Checkout returns the expected 303
  to the hosted merchant flow. An invalid verification token returns the safe
  `valid: false` response.
- An unknown route intentionally returns HTTP 404 with “Page not found.” and
  working Home and Demo recovery links. `/404/` itself intentionally returns
  200. The expected failed main-resource console entry for the unknown URL is
  not classified as a defect.
- Root and asset responses include CSP, restrictive Permissions-Policy, HSTS,
  strict referrer policy, and `nosniff`. Hashed assets use one-year immutable
  caching.
- Live root, demo, JavaScript, CSS, and service-worker hashes equal the clean
  candidate build. This also makes the prior 100/100/100/100 Lighthouse result
  applicable to the reviewed deployment; no product asset changed afterward.

This is a static site and browser extension. It has no product backend,
tenant store, process restart, health route, or SQLite persistence to test.
The Sociobot billing API is an external product dependency, not a product data
backend. Runtime AI is correctly absent because the brief names AI rewriting
as a non-goal.

## Earlier finding disposition

| Earlier finding or caveat | Current disposition |
| --- | --- |
| Claim manifest missing | The manifest exists and all ten commands pass, but findings 1–5 show that its public-claim inventory and test scope are still incomplete. |
| One-click isolated demo missing | Repaired and re-proved live, including a real-data sentinel. |
| Cold first screen did not name job, audience, or action | Repaired on fresh desktop and phone before scroll. |
| Checkout used the pilot host | Repaired; live uses the production Sociobot route and returns 303. |
| CSP and Permissions-Policy missing | Repaired and present live. |
| Hashed assets lacked immutable caching | Repaired and present live. |
| Public claims were unlisted | Partially repaired; five remaining gaps are findings 1–5. |
| No-cookies promise was untested | Repaired; the exact tagged command and independent live cookie checks pass. |
| 404 h1 was metaphorical | Repaired; both `/404/` and an unknown route say “Page not found.” |
| Axe CLI could not find system Chrome | Playwright Axe ran with the pinned browser and found zero violations. |
| Long aggregate Chromium runs crashed | Reproduced as a runner SIGSEGV; affected tests pass in fresh processes. Not a product assertion failure. |

## Required next steps

1. Add tagged installed-extension tests for the product-wide privacy promise,
   offline capture/export, and unlicensed capture/edit/export.
2. Add a claim and assertion for capture dates in both exports, and either test
   or remove “no account required.”
3. Add the required metadata set to Demo, Privacy, and Terms, and restore a
   consistent header navigation on legal and 404 routes.
4. Make the website license field required and announce an empty-input error.
5. Rerun every claim command and independent verification before Chromium Web
   Store publication.

No product code was changed during this verification.

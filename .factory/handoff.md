# Recipe Source Card — repair handoff

Work order: `recipe-source-card-repair-1`

Base report: `8ae05891ede7c99698df3e0029005de19f0ece5d`

Failed candidate: `373405a2a99b3a7de16e71faaf06926a2a4b870a`

Repair version: `1.0.1`

Completed: 2026-08-28 UTC

## Repair outcome

All seven findings in `.factory/verification-1.md` are repaired without
changing the browser-extension or static-deployment artifact classes.

1. Added `.factory/claims.json` with ten unique reliance-bearing claims. Each
   entry has exactly one matching `@claim:<id>` regression and an executable
   command. A config test prevents a missing, duplicate, or untagged manifest.
2. Added a real `/demo/` using the production recipe parser and exporters with
   bundled lemon-and-sage sample data. The visible banner, reset, and exit
   actions use only `demo:recipe-source-card:draft`; exit discards it.
3. Replaced the metaphorical first read with “Capture web recipes with their
   source,” names home cooks, makes the sample demo primary, explains the next
   screen, and shows privacy/offline/price facts.
4. Switched website checkout, extension verification, and MV3 host permission
   from the pilot host to `https://api.sociobot.in/api/v1`.
5. Added Azure Static Web Apps-native `staticwebapp.config.json` with a strict
   CSP, Permissions-Policy, Referrer-Policy, nosniff, and a styled 404.
6. Added the Azure route rule `Cache-Control: public, max-age=31536000,
   immutable` for `/assets/*`; download ZIPs retain a one-hour policy.
7. Removed unprovable “unlimited” wording, listed remaining product claims,
   and tested observable results: downloaded contents, network requests,
   storage keys, offline reload, license request shape/cache, and paid-library
   save/reopen/remove behavior.

The existing Recipe JSON-LD parser, field editor, Markdown/JSON formats,
restricted-page recovery, free core, and source retention remain intact.

## Verification evidence

Executed from a clean checkout/install:

- `npm ci`: pass with the pinned Playwright 1.58.2 toolchain.
- `npm audit --omit=dev`: **0 production vulnerabilities**. npm reports 21
  development-only transitive advisories in WXT/test tooling.
- `npm test`: **12/12 pass** across parser, license, claim-manifest, deployment
  policy, demo, and production-host configuration.
- `npm run check`: strict TypeScript pass.
- Every command in `.factory/claims.json`: pass independently from a fresh
  Playwright context or mocked unit sandbox.
- `npm run test:e2e`: **35 pass, 3 intentional project skips**. Coverage
  includes desktop, 390 px mobile, no overflow, keyboard/Enter, visible focus,
  44 px controls, reduced motion, offline update path, extension popup, paid
  local library, and all demo flows.
- Axe through Playwright: zero serious/critical findings on `/`, `/demo/`,
  `/privacy/`, `/terms/`, `/404/`, and the packaged extension popup.
- `/opt/fleet/lib/verify-url.sh` on the production build: title, `lang=en`, one
  `h1`, `main`, image alt text, and no console/page errors pass.
- Lighthouse 12.4 mobile production build: **100 performance / 100
  accessibility / 100 best practices / 100 SEO**; LCP 1.1 s, CLS 0, TBT 0 ms.
- Build budgets: initial site JS 0.95 KB, demo JS 5.65 KB, CSS 13.50 KB;
  mobile hero AVIF 11.3 KB; extension 50.39 KB; ZIP 20.80 KB.
- `unzip -t .output/recipe-source-card-1.0.1-chrome.zip`: every entry passes.
  Generated manifest permissions are `activeTab`, `scripting`, `storage`, and
  only `https://api.sociobot.in/*` as a host permission.
- Live billing identity before deploy: invalid production verification returns
  `200 {"reason":"invalid","valid":false}`; production checkout returns 303
  to the hosted Dodo checkout.

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
`dist/site/downloads/recipe-source-card-chrome.zip`. The catalog/verifier demo
entry point is `https://recipe-source-card.sociobot.in/demo/`.

## Known gaps and next steps

- Chromium Web Store signing/publication remains a factory release operation;
  the checked ZIP is the unpacked-install package.
- npm's advisories are confined to development tooling; the production audit
  is clean.
- No release-blocking product or deployment gap is known.

# Recipe Source Card — verification 3 handoff

Work order: `recipe-source-card-verify-3`

Implementation reviewed: `1594f255547a9fed8e4b08dedee2c86267c9cb24`

Documentation base: `181cce4a596ad3c7c2fbbff0093900c0c3f339ea`

Deployment reviewed: `80d11fea-fef8-48a2-b9c7-a388fc922e70`

Live URL: `https://recipe-source-card.sociobot.in/`

Completed: 2026-09-05 UTC

## Outcome

**FAIL — 8 findings, including 5 untested public claims.**

The repaired cookie claim and plain 404 heading pass. The cold desktop and
phone screens, isolated sample, source-preserving exports, reset and exit,
offline demo, accessibility, privacy observation, response policy, build, and
all ten declared claim commands also pass.

The release still fails the supplied contracts because product-wide extension
privacy, extension offline behavior, capture-date exports, free unlicensed
core behavior, and “no account required” are not fully represented by tagged
observable tests. Secondary routes also miss required metadata and consistent
header navigation, and the website license form silently ignores empty input.

Full evidence and repair details are in
[`.factory/verification-3.md`](verification-3.md).

## Verification summary

- Fresh clean clone at documentation SHA `181cce4`.
- `npm ci`, production audit, `npm test`, `npm run check`, and `npm run build`:
  PASS.
- Every exact `.factory/claims.json` command: PASS, 10/10.
- Unpacked extension suite: PASS, 2/2.
- Full E2E attempt: 36 pass, 3 intentional skips, then the known Chromium
  headless-shell SIGSEGV interrupted one mobile test. Interrupted 404 and
  reduced-motion tests pass in fresh processes.
- Fresh live verification: 85 assertions pass; Playwright Axe reports zero
  violations on all five public page types.
- `/opt/fleet/lib/verify-url.sh`: PASS, 749 ms.
- Live desktop and 390 × 844 phone cold-read: PASS.
- Live demo edit, persistence, both exports, reset, exit discard, real-data
  isolation, corrupt-storage recovery, and offline reload: PASS.
- Live HTML, JS, CSS, service worker, and unpacked ZIP files match the clean
  implementation build.
- Previous live Lighthouse result remains 100/100/100/100 on byte-identical
  product assets.

## Run locally

```sh
npm ci
npm audit --omit=dev
npm test
npm run check
npm run build
npm run test:claims
npm run test:e2e
```

The deployment root is `dist/site/`. The packaged extension is
`dist/site/downloads/recipe-source-card-chrome.zip`.

## Next steps

Repair the eight findings in `.factory/verification-3.md`, rerun all claim and
quality commands, deploy the repaired assets, and request another independent
verification. Chromium Web Store publication remains a later factory release
step.

No product code was modified in this verification.

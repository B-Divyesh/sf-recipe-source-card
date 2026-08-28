# Recipe Source Card — build handoff

Work order: `recipe-source-card-build-1`  
Completed: 2026-08-28

## What shipped

- WXT + TypeScript Manifest V3 extension with `activeTab`, `scripting`, and
  local `storage` only, plus the Sociobot pilot license host permission.
- User-initiated extraction of visible `application/ld+json` blocks. The parser
  handles root recipes, arrays, `@graph`, multiple recipes, nested instruction
  sections, object/array authors, yields, images, and malformed JSON blocks.
- Canonical URL and site attribution pinned to every draft. Capture does not
  crawl prose, follow links, bypass access controls, or call an AI service.
- Complete field-by-field editor for name, description, author, yield, times,
  ingredients, and instructions; current draft restore; multiple-recipe picker;
  source link; Markdown and JSON downloads. Both exports always retain the
  source URL and capture timestamp.
- First-class empty, capture-progress, missing/invalid schema, restricted-page,
  offline, success, and license-service states. The popup is responsive down to
  360 px and has a `Ctrl/Command+Shift+Y` keyboard command.
- Free core includes capture, editing, and both export formats. $12 one-time
  Source Card Plus unlocks an unlimited on-device saved library. Token restore,
  daily verification cache, optimistic cached unlock, invalid-license locking,
  offline fallback, and hosted Sociobot/Dodo checkout are implemented. No
  provider is embedded and no product ID is hardcoded.
- Cinematic, product-specific landing site with an original generated kitchen
  hero, installation guidance, paid tier, license return handling, service
  worker, responsive 390 px treatment, and `/privacy/` and `/terms/` pages.
- Original icon system, web manifest assets, `robots.txt`, sitemap, immutable
  asset cache headers, README, and MIT license.

## Build and verification

From a clean checkout with Node 20+:

```sh
npm install
npm test
npm run check
npm run build
npm run test:e2e
```

`npm run build` is the exact deploy build. It creates the extension, packages
`.output/recipe-source-card-1.0.0-chrome.zip`, copies it into the site, and
writes the deploy root to `dist/site/` with `dist/site/index.html`.

Verification completed locally:

- `npm test`: 7/7 Vitest tests passed (schema variants, malformed blocks,
  no-guess behavior, source retention in both exports, license cache timing).
- `npm run check`: strict TypeScript passed.
- `npm run build`: passed; deploy output is 316 KB total.
- `npm run test:e2e`: 11 Playwright tests passed, one intentionally skipped
  duplicate mobile extension run. Desktop/mobile site, 390 px overflow,
  license-return storage, legal routes, popup load/error state, and Axe checks
  are covered.
- Axe: zero serious or critical findings on the landing site and extension
  popup.
- `npm audit --omit=dev`: zero production vulnerabilities.
- Local Lighthouse 12.4 mobile run: **97 performance, 100 accessibility,
  100 best practices, 100 SEO**. LCP 2.2 s, CLS 0, total blocking time 0 ms.
- Performance sizes: landing JS 1.60 KB, CSS 10.97 KB; mobile hero 11.3 KB
  AVIF / 21.1 KB WebP; extension total 50.4 KB and package 20.8 KB. All are
  comfortably below the 200 KB JS, 50 KB CSS, and 300 KB hero budgets.
- Production extension manifest was inspected: no broad site host permission,
  no analytics, and only the pilot billing endpoint can be contacted.

## Art provenance

`assets/src/kitchen-source-hero.png` was generated specifically for this
product on 2026-08-28 with the factory Azure image deployment. The exact prompt,
review notes, and license provenance are in
`assets/src/kitchen-source-hero.prompt.json` and `.factory/design.md`. The
candidate was inspected for brands, watermarks, malformed objects, unwanted
text, and palette/composition fit. Responsive AVIF, WebP, and JPEG derivatives
are shipped; the mobile versions are far below 300 KB. The footer discloses the
AI-generated hero.

## Known gaps and release steps

- Billing intentionally targets `https://pilot-api.sociobot.in` for staging.
  After the factory registers the product, switch both `lib/license.ts` and the
  landing checkout link to `https://api.sociobot.in`; no other payment work is
  required.
- The website and extension storage are separate browser security origins, so
  a token returned to the website is stored there and the receipt flow asks the
  buyer to paste it once into the extension Restore panel. The extension also
  accepts `?license=` when opened directly.
- The 85% import-quality success measure needs a publisher-diverse pilot set;
  automated coverage proves parser shapes and source retention but does not
  claim a real-world pilot rate yet.
- The package is ready for unpacked Chromium installation. Store signing and
  publication are factory deployment responsibilities.

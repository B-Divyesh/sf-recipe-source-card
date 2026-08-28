# Recipe Source Card

Capture web recipes with their source. Recipe Source Card is a Chromium
extension for home cooks who want editable cards without losing publisher
links.

The extension reads published schema.org Recipe JSON-LD after you choose
**Capture recipe**. It opens labeled fields and exports Markdown or JSON. Both
exports include the canonical source URL. It does not crawl linked pages,
guess from page prose, or bypass access controls.

Try the isolated sample at
[`/demo/`](https://recipe-source-card.sociobot.in/demo/). It needs no install
and uses only the `demo:recipe-source-card:draft` storage key. Reset restores
the bundled lemon and sage potato recipe. Start for real discards demo data.

Capture, editing, and both exports are free. A $12 one-time Plus
license adds a saved card library in local extension storage. Sociobot/Dodo
hosts payment as merchant of record.

## Stack

- WXT + TypeScript Manifest V3 extension
- Vite + vanilla TypeScript static site and sample demo
- Vitest unit tests and Playwright/Axe browser tests
- No runtime framework, CDN, analytics, remote fonts, or recipe backend

## Run locally

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
```

WXT prints the unpacked development extension path. Load that directory from
`chrome://extensions` with Developer mode enabled. Open a recipe page, select
the toolbar icon, and choose **Capture recipe**.

Run the companion site with `npm run dev:site`. Its sample is at
`http://127.0.0.1:5173/demo/` by default.

## Test and build

```sh
npm test
npm run check
npm run build
npm run test:claims
npm run test:e2e
```

Each reliance-bearing statement and its command are listed in
[`.factory/claims.json`](.factory/claims.json). Demo isolation is documented in
[`.factory/demo.md`](.factory/demo.md).

`npm run build` creates the production extension and ZIP. It stages the ZIP at
`dist/site/downloads/recipe-source-card-chrome.zip` and builds the site into
`dist/site/`. Deploy that directory with the static work-order configuration.

## Privacy and limitations

Drafts, licenses, and Plus library cards use browser-local storage. Recipe
content is not sent during capture, editing, or export. License checks send
only the token to the production Sociobot API, at most once daily. Always
review allergen, temperature, and food-safety details.

See the shipped [privacy policy](site/privacy/index.html) and
[terms](site/terms/index.html).

## License

MIT. See [LICENSE](LICENSE).

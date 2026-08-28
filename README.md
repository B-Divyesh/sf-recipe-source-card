# Recipe Source Card

Recipe Source Card is a local-first Chromium extension for home cooks who save
web recipes. It reads schema.org `Recipe` JSON-LD published on the active page,
opens a field-by-field editable card, and exports Markdown or JSON with the
canonical source URL attached.

It is not a recipe crawler, hosted catalog, paywall bypass, or AI rewriter. The
free core includes capture, editing, draft restore, and both exports. A $12
one-time Plus license adds an unlimited on-device saved library.

## Stack

- WXT + TypeScript, Manifest V3 extension
- Vite + vanilla TypeScript static product site
- Vitest unit coverage and Playwright/Axe browser checks
- No runtime framework, CDN, analytics, remote fonts, or recipe backend

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

WXT prints the development extension directory. Load that directory from
`chrome://extensions` with Developer mode enabled. Open any page that publishes
`Recipe` JSON-LD, select the toolbar icon, and choose **Capture recipe**.

Run the companion site separately with `npm run dev:site`.

## Test and build

```sh
npm test
npm run check
npm run build
npm run test:e2e
```

`npm run build` is the deploy command. It builds and zips the extension, stages
the package as `downloads/recipe-source-card-chrome.zip`, and writes the static
site to `dist/site/`. The deployment root is exactly `dist/site` and contains
`index.html`, `/privacy/`, and `/terms/`.

The billing links use the Sociobot pilot API for staging. The factory switches
the base URL when registering the production product; no payment-provider code
or product ID is embedded here.

## Privacy and limitations

Capture happens only after a user gesture and only reads JSON-LD, the canonical
URL, and site name from the active tab. Drafts, licenses, and Plus library cards
use browser-local extension storage. Recipe data is never sent to a server.
License verification sends only the pasted token to Sociobot at most daily.
Always review captures, especially allergen, temperature, and food-safety data.

See the shipped [privacy policy](site/privacy/index.html) and
[terms](site/terms/index.html).

## License

MIT. See [LICENSE](LICENSE).

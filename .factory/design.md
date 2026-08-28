# Recipe Source Card — visual thesis

## Direction: cinematic environmental art

Recipe Source Card lives in the moment after cooking: the worktop is quiet,
the browser is still open, and a cook is deciding what is worth keeping. The
visual system treats a recipe import like a small act of archival care. Warm
kitchen light and tactile paper sit behind a precise, translucent inspection
layer. The result should feel like a useful instrument in a real kitchen, not
a generic recipe blog or a SaaS dashboard.

The single-mode treatment is intentionally dark. It evokes a late-evening
kitchen and gives the pale recipe sheet exceptional legibility. The extension
uses the same tokens but places the editable card in the foreground so the
chrome always defers to the captured content.

## Palette

| Token | Value | Purpose |
| --- | --- | --- |
| `ink` | `#F7F1E4` | Primary text, paper highlights |
| `night` | `#111713` | Main background, deep green-black |
| `counter` | `#1A241E` | Raised surfaces |
| `counter-high` | `#243129` | Inputs and secondary surfaces |
| `sage` | `#A9B8A2` | Muted text (7.2:1 on `night`) |
| `ember` | `#F0A45D` | Primary actions and focus (8.4:1 dark text) |
| `ember-deep` | `#B95F29` | Pressed/accent detail |
| `leaf` | `#92C99B` | Success |
| `saffron` | `#F4C66A` | Warning |
| `tomato` | `#FF8A78` | Error |
| `line` | `#526158` | Borders and dividers |

Status always includes words or an icon; color never carries state alone.

## Typography

- Display: **Georgia**, a local system serif. It recalls annotated cookbooks
  without downloading a font or adding page weight.
- Interface/body: **Inter-compatible system stack** (`ui-sans-serif`,
  `system-ui`, `Segoe UI`, sans-serif) for crisp form editing.
- Scale: 14 / 16 / 18 / 24 / 34 / 56 px. Body is never below 16 px on the
  site or extension content; 14 px is reserved for compact metadata.
- Long copy is capped at 68 characters and uses 1.55 line height.

## Spacing and shape

- 4 px base rhythm; principal spaces are 8, 12, 16, 24, 32, 48, 72 px.
- Corners use 3 px on controls and 18–28 px only on real sheet/panel layers.
  The contrast makes the recipe card feel physical rather than “card UI.”
- Controls are at least 44 px tall with 8 px between adjacent targets.
- Desktop site: split scene/copy composition. At 760 px and below the scene
  becomes a shallow atmospheric header and the task/copy stacks beneath it.
- Extension: 390 px popup baseline. Navigation and actions wrap; the editor
  becomes a single column without hiding fields.

## Interaction grammar

- **Trace:** extraction status moves through “Reading structured data” to a
  plain result, always stating what was found and from which URL.
- **Reveal:** source values sit beside editable values. A small “From source”
  label makes provenance visible instead of presenting a magical transform.
- **Repair:** edits happen in ordinary labeled controls. Re-import is explicit
  and never silently overwrites the current draft.
- **Keep:** export buttons are equal, while paid library saving is visually
  secondary so payment never blocks the core capture job.
- Focus is a 3 px ember outline with 2 px separation. Buttons compress by one
  pixel on press to give immediate, physical feedback.

## Motion policy

- Interface transitions last 160–240 ms and animate only opacity/transform.
- The environmental scene enters with a slight focus/opacity settle; the
  recipe sheet rises from the counter by 10 px when a capture succeeds.
- Nothing loops. `prefers-reduced-motion: reduce` disables transforms and
  smooth scrolling and makes state changes immediate; hierarchy remains via
  light, border, and scale.

## Asset plan and provenance

### Hero: `kitchen-source-hero`

- Use case: `photorealistic-natural`
- Intended use: landing-page environmental hero, supporting rather than
  depicting the extension UI.
- Subject/world: a quiet home-kitchen counter at blue hour, an open handwritten
  recipe notebook beside a tablet showing an abstract structured recipe page,
  herbs and a wooden spoon, with a warm pool of practical light.
- Materials: worn walnut, uncoated cream paper, glazed ceramic, brushed steel,
  condensation and natural imperfections.
- Lens/light: cinematic 35 mm environmental still, low camera, shallow but
  readable depth, warm tungsten key against cool window ambience.
- Palette words: green-black, parchment, ember orange, muted sage.
- Composition: landscape with the lit still life on the right and calm dark
  negative space on the left for page copy; no people.
- Negative list: no legible text, no brand marks, no logos, no watermark, no
  floating UI, no impossible utensils, no excessive food styling, no neon,
  no generic gradient.
- Final generation prompt:

  > Use case: photorealistic-natural. Asset type: cinematic landing-page hero
  > for a privacy-first recipe capture browser extension. Scene: a quiet,
  > lived-in home kitchen at blue hour; worn walnut counter, open cream-paper
  > recipe notebook, a thin unbranded tablet with a softly glowing abstract
  > recipe layout made only of illegible lines and blocks, a small ceramic bowl
  > of sage leaves and one wooden spoon. Composition: wide environmental still,
  > low 35 mm viewpoint, still life weighted to the right half, generous dark
  > negative space on the left. Lighting: warm tungsten pool across paper and
  > wood against cool window ambience, gentle atmospheric falloff, realistic
  > shadows and natural surface imperfections. Palette: green-black, parchment,
  > ember orange, muted sage. Mood: calm, trustworthy, archival, useful.
  > Photorealistic editorial cinematography, restrained depth of field.
  > Constraints: no people, no readable text, no brands, no logos, no watermark,
  > no floating interface, no surreal objects, no generic gradient.

- Generator: Azure AI Foundry factory image deployment via
  `/opt/fleet/lib/gen-image.sh` (OpenAI image model).
- Generated: 2026-08-28.
- License/provenance: original AI-generated artwork commissioned for this
  product; no reference image or third-party asset was used. The shipped site
  discloses AI-generated imagery in its footer.
- Source PNG and prompt sidecar live in `assets/src/`; optimized WebP/AVIF
  derivatives live with the landing site assets. Candidates are visually
  inspected for malformed objects, accidental text/marks, and palette fit.

### Icons

The extension mark and interface glyphs are original inline SVG made from a
single “recipe sheet + source link” geometry. They use `currentColor`, remain
legible at 16 px, and add no raster or font dependency.

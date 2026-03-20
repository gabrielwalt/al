# AGENTS.md

**⚠️ THIS IS A CROSSWALK (xwalk / Universal Editor) PROJECT — NOT DOCUMENT AUTHORING.**

This project migrates **https://www.allianz.com.au/** to AEM Edge Delivery Services using the **Universal Editor (UE)** authoring model (codename "crosswalk" / "xwalk"). Based on [aem-boilerplate-xwalk](https://github.com/adobe-rnd/aem-boilerplate-xwalk), set up per the [UE tutorial](https://www.aem.live/developer/ue-tutorial).

**What crosswalk means in practice:**
- Content is authored in AEM via the Universal Editor, stored in JCR — **NOT** Google Docs/SharePoint, **NOT** `.plain.html` or `.md` files
- Blocks have component models (`_*.json`) compiled via `npm run build:json` — DA projects have none
- Block JS **must** use `moveInstrumentation()` when restructuring DOM — DA projects don't need this
- Variants use `classes` property in component models — DA uses parenthetical block names like `cards (featured)`
- Auto-blocking is disabled — all content is explicitly modeled
- `fstab.yaml` uses `type: "markup"` with `suffix: ".html"` — DA points to Google Drive/SharePoint

**Every decision you make must account for these crosswalk differences.** If you catch yourself writing DA patterns (auto-blocking, Google Drive references, `.md` content files, skipping `moveInstrumentation`, etc.), stop and correct course immediately.

For standard EDS patterns (three-phase loading, performance, accessibility, deployment, publishing), refer to https://www.aem.live/docs/ and https://www.aem.live/developer/keeping-it-100.

---

## DA vs UE — Key Differences

This table is the most important reference for avoiding DA assumptions:

| Aspect | Document Authoring | This Project (UE / xwalk) |
|--------|-------------------|---------------------------|
| Content source | Google Drive / SharePoint | AEM Author instance (JCR) |
| `fstab.yaml` | Points to gdrive/sharepoint | `type: "markup"`, `suffix: ".html"`, points to AEM Author |
| Authoring tool | Google Docs / Word | Universal Editor (WYSIWYG in-context) |
| Component modeling | None — blocks by content convention | `component-definition.json`, `component-models.json`, `component-filters.json` |
| Block model files | None | `_*.json` inside each block directory |
| Model build system | None | `merge-json-cli` (`npm run build:json`) |
| Auto-blocking | Active (hero from picture+h1) | Disabled — content is explicitly modeled |
| DOM instrumentation | None | `data-aue-*` and `data-richtext-*` attributes |
| `moveInstrumentation()` | Not needed | **Essential** — must transfer UE attributes when restructuring DOM |
| Editor support | None | `editor-support.js` + `editor-support-rte.js` + DOMPurify |
| Variants | Block name classes (e.g., `cards (featured)`) | `classes` property in component model |
| Button decoration | Custom in scripts.js (strong/em wrap) | Imported from `aem.js` (`button-container` class) |

---

## Critical Rules

### Knowledge Persistence — Keep Everything in Project Code

- **NEVER store project knowledge in Claude memory files** (`.claude/` directory). Those files are ephemeral and invisible to the project.
- **ALL learnings, patterns, and instructions MUST live in Git-tracked files**: `AGENTS.md` for instructions, `PROJECT.md` for project state.
- `AGENTS.md` = **how to work** (instructions, rules, patterns, pitfalls, techniques)
- `PROJECT.md` = **what the project is** (blocks, tokens, templates, migration status, source site details)

**Self-improvement obligation**: After every task, ask yourself:
1. "Did I discover a new pattern, pitfall, or technique?" → Add it to `AGENTS.md`
2. "Did I hit a bug that cost time to diagnose?" → Add the root cause and fix to `AGENTS.md` so it never happens again
3. "Did the user correct me or clarify a preference?" → Capture it as a rule in `AGENTS.md`
4. "Did I create, modify, or delete a block, variant, section style, CSS variable, parser, or transformer?" → Update `PROJECT.md`

This is not optional. Stale instructions cause repeated mistakes across sessions. Every correction from the user is a signal that the instructions are incomplete — fix them immediately.

### Git — Hands Off

- **NEVER commit or push to Git yourself.** No `git add`, `git commit`, `git push` — the user handles ALL Git operations, no exceptions. Do not offer to commit. Do not commit "for convenience". If asked to commit, remind the user this is their responsibility.
- **NEVER push HTML content to Git.** Content lives in AEM (JCR), code lives in Git. HTML files are for local preview only. Never add `.html` files to `.gitignore` tracking, never `git add` content files. The `/content/` directory is a local working area, not a Git-tracked deliverable.

### PROJECT.md — Always Up-to-Date and Complete

- **Update `PROJECT.md` immediately after every change** that affects any of the following: new block, new variant, modified variant, deleted block, new/changed section style, new/changed design token, new/changed icon, new/changed font, new/changed parser or transformer, component model changes, migration status updates.
- Do this as the **final step** of every task, not as an afterthought. If you created a block, the task is not done until `PROJECT.md` reflects it. If you added a variant, the task is not done until the variant table is updated.
- When in doubt, update `PROJECT.md`. It is better to update it unnecessarily than to leave it stale.

**PROJECT.md completeness checklist** — the file must always contain accurate, current entries for ALL of:
- [ ] Every block (name, location, variants, authoring table, features, parser reference)
- [ ] Every section style (name, class, background, text color)
- [ ] Every CSS custom property / design token (token name, value, usage)
- [ ] Every parser (file, source selector)
- [ ] Every transformer (file, hook, purpose)
- [ ] Import section table (section #, blocks, default content, style)
- [ ] Migration status per page (source URL, output, status)
- [ ] Content verification table (what was captured, details)
- [ ] Source site architecture (DOM patterns, CDN, image sources)
- [ ] Fonts (families, fallbacks, loading status)

If any of these is missing or stale, fix it before finishing the task.

### Import Scripts — Keep Aligned with Content Structure

- **When changing content structure (blocks, models, field names, section layout), always update the corresponding import infrastructure** — parsers, transformers, and import scripts in `/tools/importer/`. Content structure and import scripts must stay in sync at all times.
- Before modifying any parser, check `/PAGES.txt` to understand which pages may be affected. Flag concerns to the user before proceeding.
- If you modify a block's `_*.json` model (add/remove/rename fields), verify that the parser for that block still produces markup matching the new model. If not, update the parser.
- The pipeline direction is: parser change → re-bundle → re-import. Direct `.plain.html` edits are a last resort.

### Single Universal Import Script Architecture

There is **one import script** (`import.js`) that handles **all pages** across the site. It is NOT template-specific or page-specific. The script must:

1. **Detect blocks by DOM selectors, not by page URL or template.** Every parser has a CSS selector that matches its source content. If the selector matches, the parser runs. If not, it's skipped. No `if (url === ...)` logic.
2. **Never assume block order or presence.** A page might have a hero, or it might not. It might have 3 card sections or none. Each parser must independently find its content and produce its block table — no parser should depend on another parser having run first.
3. **Use the sections transformer for all section detection.** The sections transformer scans for `.wrapper` boundaries and background colors universally. It doesn't know or care which blocks are inside — it just inserts `<hr>` breaks and section-metadata based on visual cues (backgrounds, themes).
4. **Treat parsers as independent, composable units.** Adding a new page to the import should only require: (a) adding new parsers for any blocks not yet handled, (b) registering them in the single import script. No new import script file, no template branching.
5. **Handle missing content gracefully.** If a parser's selector finds no matches on a given page, it must do nothing (return without error). Never throw if expected content is absent.
6. **Keep selector specificity high.** Selectors must be specific enough to avoid false positives across different page types. Test parsers against multiple pages when possible. Watch for selectors that accidentally match content on pages they weren't designed for.

When migrating additional pages, the workflow is:
1. Analyze the new page's DOM structure
2. Identify which existing parsers already handle its blocks (reuse!)
3. Write new parsers only for genuinely new block patterns
4. Register any new parsers in the single `import.js`
5. Re-bundle and test against ALL pages (old and new) to catch regressions

### Block Development

1. **Always use `moveInstrumentation()`** when restructuring DOM elements in block JS. Without this, UE editing breaks.
2. **Always run `npm run build:json`** after modifying any `_*.json` model file. The compiled root-level JSONs are what UE consumes.
3. **Never edit compiled JSON files directly** — edit source `_*.json` in `models/` or `blocks/*/`, then recompile.
4. **REUSE existing blocks** — check `PROJECT.md` Block Reference before creating new blocks. Use variants via `classes` property.
5. **Never modify `editor-support.js`** unless fixing a specific live-editing bug.
6. **Never modify `aem.js`**.
7. **Test in preview** at `http://localhost:3000`.

---

## Project Structure (xwalk-specific files)

Standard EDS structure (`blocks/`, `styles/`, `scripts/`, `icons/`, `fonts/`) plus:

```
models/                            # Shared component model fragments
  _component-definition.json       # Master definition (spread refs to blocks/*/_*.json)
  _component-models.json           # Master models (spread refs)
  _component-filters.json          # Master filters (spread refs)
  _page.json, _section.json, _text.json, _title.json, _image.json, _button.json

blocks/{blockname}/
  _{blockname}.json                # Block's UE model (definitions, models, filters)
  {blockname}.js                   # Decoration (import moveInstrumentation!)
  {blockname}.css

component-definition.json          # COMPILED (do not edit directly)
component-models.json              # COMPILED (do not edit directly)
component-filters.json             # COMPILED (do not edit directly)

scripts/
  editor-support.js                # UE live-editing (event patching, DOM updates)
  editor-support-rte.js            # Richtext instrumentation grouping
  dompurify.min.js                 # Sanitizes UE content updates

tools/importer/
  import.js                        # Single universal import script (all pages)
  import.bundle.js                 # COMPILED bundle (do not edit directly)
  urls.txt                         # URL list for bulk import (all pages)
  parsers/                         # Block parsers (one per block, selector-based)
  transformers/                    # Page transformers (cleanup, sections)

fstab.yaml                         # type: "markup", points to AEM Author
head.html                          # Includes CSP with nonce-aem for UE iframe
```

The `{ "...": "path#/jsonPointer" }` syntax in model source files is a **spread directive** for `merge-json-cli`. The glob `../blocks/*/_*.json#/definitions` auto-includes all block model files.

---

## Component Modeling

Ref: https://www.aem.live/developer/universal-editor-blocks and https://www.aem.live/developer/component-model-definitions

### The Three JSON Files

1. **`component-definition.json`** — What components exist, their AEM resource types, default templates
2. **`component-models.json`** — Editable fields per component (UE properties panel)
3. **`component-filters.json`** — Which components can be children of which containers

### Component Definition Pattern

```json
{
  "title": "My Block",
  "id": "my-block",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "My Block",
          "model": "my-block"
        }
      }
    }
  }
}
```

- `resourceType`: `core/franklin/components/block/v1/block` for blocks, `.../block/item` for child items, `.../section/v1/section` for sections, `.../text/v1/text`, `.../title/v1/title`, `.../image/v1/image`, `.../button/v1/button` for default content, `.../columns/v1/columns` for columns
- `template.name`: Block name in EDS markup
- `template.model`: References a model ID in `component-models.json`
- `template.filter`: References a filter ID in `component-filters.json` (container blocks)

### Container Blocks

Container blocks (Cards, Carousel, Tabs, Accordion) need **two** components:
- **Container**: `resourceType: .../block`, `template.filter` → filter allowing child items
- **Item**: `resourceType: .../block/item`, `template.model` → per-item fields

### Field Types

| `component` | Purpose | Notes |
|-------------|---------|-------|
| `text` | Single-line text | `valueType`: string/number. `multi: true` for tag-like input |
| `richtext` | WYSIWYG rich text | `valueType: "string"` |
| `reference` | DAM asset picker | `multi: false` for single image |
| `select` | Single-select dropdown | `options: [{ "name": "Label", "value": "stored" }]` |
| `multiselect` | Multi-select checkboxes | Same options format |
| `aem-content` | AEM page/content reference | For links, fragment references |
| `aem-tag` | Tag picker | Taxonomy tags |
| `boolean` | Toggle | `true`/`false` |
| `number` | Numeric input | |
| `date-time` | Date/time picker | ISO8601 |
| `tab` | Visual tab separator | Groups fields in properties panel |
| `container` | Composite multi-field | `multi: true` with nested `fields[]` |

### Field Collapse (crucial naming conventions)

Multiple properties collapse into semantic HTML based on **suffixes**:

- **Images**: `image` + `imageAlt` → `<picture><img src="..." alt="...">`
- **Links**: `link` + `linkText` + `linkTitle` + `linkType` → `<a href="..." title="...">text</a>` with type class
- **Headings**: `title` + `titleType` → `<h2>Title</h2>` (type sets level)

These suffixes are case-sensitive. Getting them wrong breaks the markup output.

### Element Grouping (underscore convention)

Properties prefixed with `groupName_` (e.g., `teaserText_title`, `teaserText_description`) are grouped into a **single cell** in rendered table markup. Field collapse rules apply within groups.

### Block Options via `classes`

Authors select variants through a `classes` field in the model:

```json
{
  "component": "select",
  "name": "classes",
  "label": "Style",
  "valueType": "string",
  "options": [
    { "name": "Default", "value": "" },
    { "name": "Featured", "value": "featured" }
  ]
}
```

Result: `<div class="my-block featured">`. Also supports `classes_*` grouped properties and booleans (property name becomes class when true).

### Section Metadata

Sections use `core/franklin/components/section/v1/section` resource type with a `style` multiselect field for section styles. Section filter controls which blocks/components are allowed inside. Custom section types can define their own model and filter IDs.

---

## moveInstrumentation

The single most important xwalk pattern. `moveInstrumentation(from, to)` (from `scripts.js`) transfers `data-aue-*` and `data-richtext-*` attributes when you replace DOM elements.

**Use it whenever you:**
- Replace a row `<div>` with `<li>`, `<tr>`, `<details>`, or any semantic element
- Replace `<img>` with optimized `<picture>`
- Move content to a new wrapper element

```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);
}
```

The xwalk `aem.js` also has double-decoration guards (`data-section-status`, `data-block-status`) and `wrapTextNodes()` that auto-preserves instrumentation.

---

## Creating a New Block (Checklist)

1. Create `blocks/{blockname}/_{blockname}.json` with `definitions[]`, `models[]`, `filters[]`
2. Create `blocks/{blockname}/{blockname}.js` — import and use `moveInstrumentation`
3. Create `blocks/{blockname}/{blockname}.css`
4. **Update `models/_section.json`** → add the block ID to the section filter's `components` array
5. Run `npm run build:json`
6. Create parser in `tools/importer/parsers/{blockname}.js` if the block needs import
7. Register parser in the import script (`import-homepage.js` or relevant template)
8. Re-bundle the import script
9. Document in `PROJECT.md`

### Adding a Variant

1. Add `classes` options to the block's model in `_{blockname}.json`
2. Add variant CSS in `{blockname}.css` (e.g., `.cards.featured { ... }`)
3. Update block JS only if the variant needs different DOM structure
4. Run `npm run build:json`

### Placeholder Blocks (No Editable Content)

For blocks where the author controls placement but not content (e.g., social-follow):
1. Set `"fields": []` (empty array) in the block's UE model
2. Block JS renders all content at runtime (hardcoded)
3. Import creates an empty block table: `WebImporter.Blocks.createBlock(doc, { name: 'Block Name', cells: [] })`

---

## CSS Rules

### BEM-like Naming Convention

Use a **BEM-inspired naming convention** scoped to each block. The block name is the namespace; child elements use `{block}-{element}`, and modifiers use `{block}--{modifier}` or `{block}.{variant}` (via `classes`).

```css
/* Block */
.cards { }

/* Elements — prefixed with block name */
.cards-card { }
.cards-card-image { }
.cards-card-body { }
.cards-card-title { }

/* Variant (from `classes` model field) */
.cards.featured { }
.cards.featured .cards-card-body { }

/* DO NOT use unprefixed class names */
/* Bad:  .card-image  — ambiguous, could clash across blocks */
/* Bad:  .image       — global, not scoped */
/* Good: .cards-card-image — clearly belongs to cards block */
```

When adding classes in block JS via `element.className = '...'` or `classList.add(...)`, always prefix with the block name: `.{blockname}-{element}`. This ensures styles never leak between blocks.

### General Tips (EDS-specific)

- **Scope all selectors to the block class.** Every rule must start with `.{blockname}` or target a `.{blockname}-*` child.
- Avoid `-container` / `-wrapper` class names (reserved for sections).
- Edge-to-edge blocks: `main > div:has(.block-name)` on the wrapper.
- Visually hidden: `clip-path: inset(50%)` not deprecated `clip`.
- Include `-webkit-backdrop-filter` alongside `backdrop-filter`.
- `box-sizing: border-box` when setting explicit width/height with padding.
- Never `!important` — increase specificity instead.
- **Avoid brittle selectors.** Authors can reorder, add, or remove blocks and sections at any time via the Universal Editor. Never rely on `:nth-child()`, `:first-of-type`, sibling combinators (`+`, `~`), or a specific sequence of blocks/sections. Prefer explicit class names (block variants via `classes`, section styles via `style` field) over positional selectors. If styling depends on context, use `:has()` or scope to a section style class — never assume "the hero is always the first block" or "there are always exactly 3 cards".

---

## Import Infrastructure — Patterns & Pitfalls

These are hard-won lessons from building the import pipeline for this project. Follow them to avoid re-discovering the same bugs.

### Transformer Execution Order

1. `beforeTransform` — cleanup (span→em, XF replacement) + sections (hr + metadata)
2. Parsers run (replace matched elements with block tables)
3. `afterTransform` — post-parser work (block table creation from placeholders, chrome removal)
4. WebImporter built-in rules (metadata, background images, URL adjustment)

**Critical**: Section breaks (`<hr>`) and section-metadata MUST be inserted in `beforeTransform` because parsers replace wrapper elements, making `afterTransform` selectors fail.

### Section-Metadata Placement

- Two-pass approach: (1) insert all `<hr>` between wrappers going forward, (2) add section-metadata AFTER each styled wrapper before the next `<hr>`
- This ensures metadata lands at the END of its section, not the START of the next one
- For the last section, append after the wrapper (no next `<hr>`)

### Heading Highlight Preservation

- The cleanup transformer converts colored `<span>` to `<em>` in `beforeTransform`
- **CRITICAL**: Parsers that create new heading elements MUST use `innerHTML` (not `textContent`) to preserve `<em>` tags. Using `textContent` strips all inner HTML including the highlights. This bug was found in the columns-awards parser and is easy to reintroduce.

### Fake Wrapper Trick for Section Boundaries

- The sections transformer only detects `.wrapper` elements as section boundaries
- Non-wrapper elements (e.g., `.experiencefragment`) must be replaced with fake `<div class="wrapper ...">` in `beforeTransform` to become section boundaries
- If no background is detected on the fake wrapper, no section-metadata is generated — this is useful for sections that should have no special styling

### Shadow DOM Pre-Extraction

- Allianz `<one-stage>` web components use shadow DOM
- Shadow DOM content is lost during `outerHTML` serialization
- The import script includes an IIFE at bundle top that extracts `one-heading` and `one-button` data into `data-extracted-*` attributes BEFORE the document is serialized
- The hero parser reads from data attributes instead of shadow DOM

### Parser Selector Ordering

- `columns-feature` (`.l-grid__column-large-3`) MUST be matched BEFORE `cards-article` (`a[href$='/insights.html']`)
- The features section contains an inline link with "insights" that would falsely trigger the cards-article selector if it ran first
- When adding new parsers, consider selector specificity and potential false matches

### Background Detection

- `.theme--inverted` or `.theme--negative` on wrapper or children → `style: "dark"`
- `background-color: #F1F9FA` on `.l-container` children → `style: "light-teal"`
- Inline styles on `.l-container` descendants carry the background info, not the wrapper itself

### Hero Modal Buttons

- "Get a quote" on the original site is a `<button>` (modal trigger) with no href
- The parser converts it to `<a href="#quote">` for EDS compatibility (EDS only has links, not buttons)

### Bundling & Import Commands

```bash
# Bundle: always re-bundle after ANY parser/transformer/import-script change
npx esbuild tools/importer/import.js --bundle --format=iife --global-name=CustomImportScript --outfile=tools/importer/import.bundle.js

# Import: runs bundled script against URL list, outputs to content/
node /home/node/.claude/plugins/cache/excat-marketplace/excat/2.1.1/skills/excat-content-import/scripts/run-bulk-import.js --urls tools/importer/urls.txt --import-script tools/importer/import.bundle.js --output content
```

The pipeline: edit source → bundle → import → verify in preview. Never edit `.bundle.js` directly.

**Note**: The URL list (`urls.txt`) contains ALL pages to import. When adding new pages, append their URLs to this single file and re-run. The universal import script handles all pages through selector-based block detection.

---

## Key Files

| File | Purpose |
|------|---------|
| `/PROJECT.md` | Blocks, tokens, templates, migration status |
| `/AGENTS.md` | Instructions, rules, patterns, pitfalls |
| `/models/_section.json` | Section filter — **update when adding new blocks** |
| `/models/_component-*.json` | Master model sources with spread refs |
| `/blocks/*/_*.json` | Per-block UE model definitions |
| `/scripts/scripts.js` | `moveInstrumentation()`, `moveAttributes()` |
| `/scripts/editor-support.js` | UE live-editing — do not modify |
| `/fstab.yaml` | AEM Author content source |
| `/tools/importer/` | Import infrastructure (parsers, transformers, scripts) |
| `/tools/importer/import.js` | Single universal import script (all pages) |
| `/tools/importer/import.bundle.js` | Compiled bundle — do not edit |
| `/tools/importer/urls.txt` | URL list for all pages to import |
| `/PAGES.txt` | Imported page inventory |

---

## Documentation Search

Search EDS docs full-text: `curl -s https://www.aem.live/docpages-index.json | jq -r '.data[] | select(.content | test("KEYWORD"; "i")) | "\(.path): \(.title)"'`

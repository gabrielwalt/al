# AGENTS.md

This is a **Universal Editor (xwalk)** project for Edge Delivery Services, migrating **https://www.allianz.com.au/** to AEM. Based on [aem-boilerplate-xwalk](https://github.com/adobe-rnd/aem-boilerplate-xwalk), set up per the [UE tutorial](https://www.aem.live/developer/ue-tutorial).

**This is NOT a Document Authoring project.** Content is authored in AEM via the Universal Editor, stored in JCR — not Google Docs/SharePoint, not `.plain.html` or `.md` files.

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

### Git — Hands Off

- **NEVER commit or push to Git yourself.** No `git add`, `git commit`, `git push` — the user handles ALL Git operations, no exceptions. Do not offer to commit. Do not commit "for convenience". If asked to commit, remind the user this is their responsibility.
- **NEVER push HTML content to Git.** Content lives in AEM (JCR), code lives in Git. HTML files are for local preview only. Never add `.html` files to `.gitignore` tracking, never `git add` content files. The `/content/` directory is a local working area, not a Git-tracked deliverable.

### PROJECT.md — Always Up-to-Date

- **Update `PROJECT.md` immediately after every change** that affects any of the following: new block, new variant, modified variant, deleted block, new/changed section style, new/changed design token, new/changed icon, new/changed font, new/changed parser or transformer, component model changes, migration status updates.
- Do this as the **final step** of every task, not as an afterthought. If you created a block, the task is not done until `PROJECT.md` reflects it. If you added a variant, the task is not done until the variant table is updated.
- When in doubt, update `PROJECT.md`. It is better to update it unnecessarily than to leave it stale.

### Import Scripts — Keep Aligned with Content Structure

- **When changing content structure (blocks, models, field names, section layout), always update the corresponding import infrastructure** — parsers, transformers, and import scripts in `/tools/importer/`. Content structure and import scripts must stay in sync at all times.
- Before modifying any parser, check `/PAGES.txt` to understand which pages may be affected. Flag concerns to the user before proceeding.
- If you modify a block's `_*.json` model (add/remove/rename fields), verify that the parser for that block still produces markup matching the new model. If not, update the parser.
- The pipeline direction is: parser change → re-bundle → re-import. Direct `.plain.html` edits are a last resort.

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
6. Document in `PROJECT.md`

### Adding a Variant

1. Add `classes` options to the block's model in `_{blockname}.json`
2. Add variant CSS in `{blockname}.css` (e.g., `.cards.featured { ... }`)
3. Update block JS only if the variant needs different DOM structure
4. Run `npm run build:json`

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

## Key Files

| File | Purpose |
|------|---------|
| `/PROJECT.md` | Blocks, tokens, templates, migration status |
| `/models/_section.json` | Section filter — **update when adding new blocks** |
| `/models/_component-*.json` | Master model sources with spread refs |
| `/blocks/*/_*.json` | Per-block UE model definitions |
| `/scripts/scripts.js` | `moveInstrumentation()`, `moveAttributes()` |
| `/scripts/editor-support.js` | UE live-editing — do not modify |
| `/fstab.yaml` | AEM Author content source |
| `/tools/importer/` | Import infrastructure |
| `/PAGES.txt` | Imported page inventory |

---

## Documentation Search

Search EDS docs full-text: `curl -s https://www.aem.live/docpages-index.json | jq -r '.data[] | select(.content | test("KEYWORD"; "i")) | "\(.path): \(.title)"'`

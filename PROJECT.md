# Allianz Australia — EDS Project Reference

**Source site**: https://www.allianz.com.au/
**Content path prefix**: `/`
**Content directory**: `/content/`
**Page inventory**: `/PAGES.txt`

---

## Source Site Architecture

- Built on AEM Classic (JCR-based) with custom Allianz One Web (A1) component library
- Uses `<one-stage>`, `<one-heading>`, `<one-button>` web components with shadow DOM
- Main content in `.root.parsys` or `#main-parsys`
- Sections wrapped in `.wrapper.container` or `.wrapper` divs
- Hero stage is `.stage.container` or `.a1stage` (sibling of parsys, not inside a wrapper)
- Grid layouts use `.multi-column-grid` with `.l-grid__column-large-N` for column sizing

### CDN & CORS

| CDN | Domain | Notes |
|-----|--------|-------|
| Elements | `elements.cdn.allianz.com` | CORS-blocked in headless Chrome |
| Base components | `base-components.cdn.allianz.com` | CORS-blocked |

Both behind Cloudflare challenges for direct curl access. Workaround: use visual screenshots and known brand values for design token extraction.

### Image CDN Sources

| CDN | URL Pattern | Notes |
|-----|-------------|-------|
| AEM DAM | `/content/dam/onemarketing/aal/au_site/...` | Product icons (SVG), hero images (JPG), awards badges (PNG) |
| AEM JCR | `/_jcr_content/root/parsys/.../image.img.82.3360.{svg,jpeg,png}/...` | Inline images with rendition params |

### Source DOM — Section Identification

- Each `.wrapper` = one logical section
- Background via inline `style="background-color:..."` on `.l-container` children
- Dark theme via `.theme--inverted` class on wrapper or children
- Light teal (`#F1F9FA`) on features and hardship sections
- Dark navy on customer support section
- Experience fragments (`.experiencefragment`) are NOT wrappers — they need special handling to become section boundaries

---

## Brand Identity

| Property | Value |
|----------|-------|
| Primary color | `#003781` (Allianz blue) |
| Primary hover | `#002A63` |
| Accent/secondary | `#007AB3` (teal accent in headings) |
| Dark navy | `#003058` (dark section backgrounds) |
| Light teal | `#F1F9FA` (light section backgrounds) |
| Text | `#1C1C1C` |
| Text secondary | `#4A4A4A` |
| Border | `#E0E0E0` |
| Body font | `roboto, roboto-fallback, sans-serif` |
| Display font | `roboto-condensed, roboto-condensed-fallback, sans-serif` |
| Breakpoint — desktop | `900px` |
| Content max width | `1200px` |

### Heading Highlights

Certain words in headings display in teal (`--color-secondary: #007AB3`). In the source site, these are `<span style="color: rgb(0,122,179);">` (or any non-black inline color). The import converts them to `<em>` tags. CSS rule: `h1 em, h2 em, h3 em { color: var(--color-secondary); font-style: normal; }`.

Examples: "An **award-winning** insurer", "What **care** looks like", "Let us help **you**", "Financial hardship **support**"

---

## Section Styles

Applied via `section-metadata` block with `Style: <name>`.

| Style | Class | Background | Text color |
|-------|-------|------------|------------|
| `dark` | `.section.dark` | Dark navy (Allianz customer section) | White |
| `light-teal` | `.section.light-teal` | `#F1F9FA` (features, hardship sections) | Default |

---

## Block Reference

### hero-homepage

**Location**: `/blocks/hero-homepage/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Homepage | `.hero-homepage` | Full-width background image with heading, subheading, and CTA buttons |

**Authoring**:
| Hero (homepage) |
|---|
| Background image |
| h2 heading + p subheading + CTA links |

**Features**:
- Source uses `<one-stage>` web component with shadow DOM
- Import pre-extracts shadow DOM content into data attributes before serialization
- "Get a quote" on original site is a `<button>` (modal trigger) — parser converts to `<a href="#quote">`
- Field hints: `field:image`, `field:text`

**Parser**: `parsers/hero-homepage.js` — Selector: `.a1stage`

---

### cards-product

**Location**: `/blocks/cards-product/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Product | `.cards-product` | Insurance product cards with icon, linked title, sub-links, and CTA |

**Authoring**:
| Cards (product) |
|---|
| Icon SVG \| h3 linked title + ul sub-links + CTA link |

**Features**:
- 3 cards: Home Insurance, Car Insurance, CTP Insurance
- Each card has: icon SVG, linked product title, 3 sub-product links, CTA button
- Section also has "More Allianz Insurance products" pills as default content below
- Field hints: `field:image`, `field:text`

**Parser**: `parsers/cards-product.js` — Selector: `.wrapper:has(.buttons-group) .multi-column-grid`

---

### cards-support

**Location**: `/blocks/cards-support/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Support | `.cards-support` | Customer action cards on dark background with icon + CTA |

**Authoring**:
| Cards (support) |
|---|
| Icon SVG \| h3 title + CTA link |

**Features**:
- 3 cards: 24/7 online claims, Manage policy, Manage renewals
- Dark section (`style: dark`)
- Nested grid structure: outer 2-col (heading | 3 inner 2-col grids)
- Heading extracted as default content above block
- Field hints: `field:image`, `field:text`

**Parser**: `parsers/cards-support.js` — Selector: `.wrapper:has(.theme--inverted)`

---

### cards-article

**Location**: `/blocks/cards-article/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Article | `.cards-article` | Article/insight cards with photo, linked title, description, CTA |

**Authoring**:
| Cards (article) |
|---|
| Photo image \| h3 linked title + p description + CTA link |

**Features**:
- 3 article cards with JPEG photos (652x325)
- Linked h3 titles and "Read article" CTAs
- Section intro text + "Explore insights" link as default content above
- Field hints: `field:image`, `field:text`

**Parser**: `parsers/cards-article.js` — Selector: `.wrapper:has(a[href$='/insights.html']) .multi-column-grid`

---

### columns-awards

**Location**: `/blocks/columns-awards/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Awards | `.columns-awards` | 2-column: text content | awards badge image |

**Authoring**:
| Columns (awards) |
|---|
| h2 + p + CTA link \| Awards badge image |

**Features**:
- Left column: heading, description text, "See all our awards" link
- Right column: awards badge PNG (652x135)

**Parser**: `parsers/columns-awards.js` — Selector: `.wrapper:has(a[href*='awards']) .multi-column-grid`

---

### columns-feature

**Location**: `/blocks/columns-feature/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Feature | `.columns-feature` | 4-column icon grid with text descriptions |

**Authoring**:
| Columns (feature) |
|---|
| Icon + text \| Icon + text \| Icon + text \| Icon + text |

**Features**:
- 4 columns, each with icon SVG + descriptive text
- Heading uses `span.c-heading--subsection-medium` (not h3)
- Some columns contain inline links or superscript footnote markers
- Section has `style: light-teal` background

**Parser**: `parsers/columns-feature.js` — Selector: `.multi-column-grid:has(.l-grid__column-large-3)`

---

### social-follow

**Location**: `/blocks/social-follow/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.social-follow` | Placeholder block rendering hardcoded social media links |

**Authoring**:
| Social Follow |
|---|
| _(no editable content — placement only)_ |

**Features**:
- Placeholder block — authors control placement, not content
- UE model has empty `fields: []` (no editable properties)
- JS renders hardcoded social links: Facebook, X, LinkedIn, YouTube, Instagram, TikTok
- Centered layout with circular icon buttons
- Heading "Follow us on" rendered by block JS

**Import**: Cleanup transformer replaces social XF (`.experiencefragment:has(.social-media-divider)`) with a `Social Follow` block table via `WebImporter.Blocks.createBlock()`

---

### header

**Location**: `/blocks/header/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.header` | Site navigation |

**Features**: Fragment-loaded from `/nav`. Three nav zones: brand, sections, tools.

---

### footer

**Location**: `/blocks/footer/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.footer` | Site footer |

**Features**: Fragment-loaded from `/footer`.

---

## Import Infrastructure

Located in `/tools/importer/`.

### Universal Import Script

Defined in `import.js`. A single script handles all pages via selector-based block detection — parsers run when their CSS selectors match, skipped otherwise. No URL-based branching.

**Key technique**: Shadow DOM pre-extraction IIFE runs before html2md serialization, extracting `one-heading`/`one-button` content from `<one-stage>` shadow DOM into `data-extracted-headings` and `data-extracted-buttons` attributes.

**Sections**:

| # | Section | Block(s) | Default Content | Style |
|---|---------|----------|-----------------|-------|
| 1 | Hero | hero-homepage | — | — |
| 2 | Insurance with Allianz | cards-product | h2, intro text, "More products" pills | — |
| 3 | Already an Allianz customer? | cards-support | h2 heading | dark |
| 4 | Award-Winning Insurer | columns-awards | — | — |
| 5 | What Care Looks Like | columns-feature | h2 heading | light-teal |
| 6 | Let Us Help You | cards-article | h2, intro text, "Explore insights" link | — |
| 7 | Financial Hardship Support | — (default content) | h2, text, CTA link | light-teal |
| 8 | Follow Us | social-follow | — | — |
| 9 | Conditions / Disclaimers | — (default content) | h2, footnotes ordered list | — |

### Parsers

| Parser | File | Source Selectors |
|--------|------|------------------|
| hero-homepage | `parsers/hero-homepage.js` | `.a1stage` |
| cards-product | `parsers/cards-product.js` | `.wrapper:has(.buttons-group) .multi-column-grid` |
| cards-support | `parsers/cards-support.js` | `.wrapper:has(.theme--inverted)` |
| columns-awards | `parsers/columns-awards.js` | `.wrapper:has(a[href*='awards']) .multi-column-grid` |
| columns-feature | `parsers/columns-feature.js` | `.multi-column-grid:has(.l-grid__column-large-3)` |
| cards-article | `parsers/cards-article.js` | `.wrapper:has(a[href$='/insights.html']) .multi-column-grid` |

**Parser selector ordering**: `columns-feature` MUST be matched BEFORE `cards-article` because the features section contains an inline link with "insights" that would falsely trigger the cards-article selector.

### Transformers

| Transformer | File | Hook | Purpose |
|-------------|------|------|---------|
| cleanup | `transformers/allianz-cleanup.js` | before + after | **before**: Convert highlighted `<span>` → `<em>` in headings (general detection: any non-black inline color); replace social XF with fake `.wrapper` for section boundary detection. **after**: Remove footer/legal/acknowledgement XFs; convert social-follow placeholder to `Social Follow` block table; remove site chrome |
| sections | `transformers/allianz-sections.js` | before | Detect `.wrapper` section boundaries, insert `<hr>` breaks, add section-metadata (dark/light-teal) based on background detection |

### Bundling & Import

```bash
# Bundle import script
npx esbuild tools/importer/import.js --bundle --format=iife --global-name=CustomImportScript --outfile=tools/importer/import.bundle.js

# Run bulk import (all pages)
node /home/node/.claude/plugins/cache/excat-marketplace/excat/2.1.1/skills/excat-content-import/scripts/run-bulk-import.js --urls tools/importer/urls.txt --import-script tools/importer/import.bundle.js --output content
```

---

## Migration Status

### Imported Pages

| Page | Source URL | Output | Status |
|------|-----------|--------|--------|
| Homepage | `https://www.allianz.com.au/` | `content/index.plain.html` | Imported + Blocks Implemented |

### Content Verification (Homepage)

| Content | Captured | Details |
|---------|----------|---------|
| Hero heading + subheading | Yes | "Allianz Insurance" + "Care you can count on" |
| Hero CTAs | Yes | "Get a quote" (`#quote` link, was modal trigger) + "Renew now" (link) |
| Hero background image | Yes | Desktop eagle image with alt text |
| Product cards (3) | Yes | Home/Car/CTP with icons, linked titles, sub-links, CTAs |
| "More products" pills (6) | Yes | Travel, Life, Business, Caravan, Boat, Workers' Comp |
| Customer action cards (3) | Yes | Claims, Manage policy, Renewals with icons + CTAs |
| Awards column | Yes | Heading + text + link + badge image with alt |
| Feature columns (4) | Yes | Icons + text (including inline links and footnotes) |
| Article cards (3) | Yes | Photos + linked titles + descriptions + CTAs |
| Financial hardship | Yes | Heading + text + "Learn more" CTA |
| Social-follow block | Yes | Placeholder block in own section (no light-teal); JS renders 6 social links |
| Conditions footnotes | Yes | 2 footnotes in ordered list |
| Highlighted heading words | Yes | `<em>` tags for teal-accented words (award-winning, care, you, support) |
| Section backgrounds | Yes | Dark (customer), light-teal (features, hardship); social-follow has no background |
| XWalk field hints | Yes | 10x `field:image` + 10x `field:text` |
| Page metadata | Yes | Title, Description, OG Image |

---

## Design Tokens (styles.css)

All Allianz brand tokens are defined as CSS custom properties in `/styles/styles.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#003781` | Headings, primary buttons, links |
| `--color-primary-hover` | `#002A63` | Button/link hover state |
| `--color-secondary` | `#007AB3` | Heading highlights (`<em>`), secondary links |
| `--color-dark-navy` | `#003058` | Dark section background |
| `--color-light-teal` | `#F1F9FA` | Light section background |
| `--color-white` | `#FFF` | Text on dark backgrounds |
| `--color-text` | `#1C1C1C` | Default body text |
| `--color-text-secondary` | `#4A4A4A` | Descriptions, secondary text |
| `--color-border` | `#E0E0E0` | Card borders |
| `--content-max-width` | `1200px` | Section content max width |

---

## Fonts

| Font | Fallback | Usage |
|------|----------|-------|
| Roboto | `roboto-fallback` (Arial, size-adjust 99.529%) | Body text |
| Roboto Condensed | `roboto-condensed-fallback` (Arial, size-adjust 88.82%) | Headings |

**Note**: Font files not yet loaded from CDN (CORS-blocked). Currently using fallback fonts only.

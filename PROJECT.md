# [Project Name] — EDS Project Reference

**Source site**: _https://example.com/_
**Content path prefix**: _e.g. `/pages/` or `/content/`_
**Content directory**: `/content/`
**Page inventory**: `/PAGES.txt`

---

## Brand Identity

| Property | Value |
|----------|-------|
| Primary color | _e.g. `#126bea`_ |
| Accent color | _e.g. `#fdb900`_ |
| Body font | _e.g. Open Sans (Google Fonts, weights 400/600/700)_ |
| Display font | _e.g. Oswald (optional)_ |
| Base body size | _e.g. 14px (`--body-font-size-s`)_ |
| Breakpoint — tablet | _e.g. 768px_ |
| Breakpoint — desktop | _e.g. 992px_ |
| Content max-width | _e.g. 1200px_ |
| Container max-width | _e.g. 1400px_ |

---

## Design Tokens

All defined in `/styles/styles.css` as CSS custom properties on `:root`.

### Core Colors

_Define your palette. Example structure:_

| Token | Value |
|-------|-------|
| `--color-primary` | _e.g. `#126bea`_ |
| `--color-primary-hover` | _e.g. `#185bd2`_ |
| `--color-text` | _e.g. `#252a31`_ |
| `--color-text-secondary` | _e.g. `#4f5e71`_ |
| `--color-background` | _e.g. `#fff`_ |
| `--color-border` | _e.g. `#e9ebf1`_ |

### Semantic Aliases

| Token | Maps to |
|-------|---------|
| `--background-color` | _e.g. `--color-white`_ |
| `--text-color` | _e.g. `--color-slate-dark`_ |
| `--link-color` | _e.g. `--color-primary`_ |
| `--border-color` | _e.g. `--color-stone-base`_ |

### Spacing

| Token | Value |
|-------|-------|
| `--spacing-xs` | `0.25rem` (4px) |
| `--spacing-sm` | `0.5rem` (8px) |
| `--spacing-md` | `0.75rem` (12px) |
| `--spacing-lg` | `1rem` (16px) |
| `--spacing-xl` | `1.5rem` (24px) |
| `--spacing-2xl` | `2rem` (32px) |

### Typography

| Token | Mobile | Desktop |
|-------|--------|---------|
| `--heading-font-size-xl` | _e.g. 24px_ | _e.g. 30px_ |
| `--heading-font-size-l` | _e.g. 18px_ | _e.g. 24px_ |
| `--body-font-size-m` | _e.g. 16px_ | — |
| `--body-font-size-s` | _e.g. 14px_ | — |

### Radius, Shadows, Transitions

| Token | Value |
|-------|-------|
| `--radius-sm` | `0.25rem` |
| `--radius-md` | `0.375rem` |
| `--radius-lg` | `0.75rem` |
| `--transition-base` | `200ms ease` |

### Component Tokens

| Token | Value |
|-------|-------|
| `--button-border-radius` | `--radius-md` |
| `--content-max-width` | _e.g. `1200px`_ |
| `--container-max-width` | _e.g. `1400px`_ |

---

## Button Variants

Defined in `/styles/styles.css`. Authoring pattern in `/scripts/scripts.js`:

| Variant | Authoring | Appearance |
|---------|-----------|------------|
| **Primary** | `**[link text](url)**` (`<strong>` wraps link) | _e.g. Primary bg, white text_ |
| **Secondary** | `*[link text](url)*` (`<em>` wraps link) | _e.g. White bg, border_ |

---

## Section Styles

Applied via `section-metadata` block with `Style: <name>`. Defined in `/styles/styles.css`.

| Style | Class | Background | Text color |
|-------|-------|------------|------------|
| `light` | `.section.light` | _e.g. `--color-stone-light`_ | default |
| `dark` | `.section.dark` | _e.g. `--color-slate-dark`_ | inverse white |

---

## Block Reference

_Add each block with: Location, Variants table, Authoring, Features, Responsive, Parser (if applicable)._

### hero

**Location**: `/blocks/hero/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.hero` | _e.g. Full-width background image with h1 overlay_ |

**Authoring**: _Describe how authors create this block (auto-built, block table, etc.)_

**Features**: _Key implementation details_

**Responsive**: _Breakpoint behavior_

---

### cards

**Location**: `/blocks/cards/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.cards` | _e.g. Generic card grid_ |

**Authoring**:
| Cards |
|---|
| Image \| Body content |

**Features**: _Key implementation details_

**Responsive**: _Breakpoint behavior_

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

_Add more blocks as you create them. Keep this section up-to-date._

---

## Icons

Located in `/icons/`. Used via `:icon-name:` syntax in authored content.

| File | Icon | Usage |
|------|------|-------|
| _e.g. `search.svg`_ | Search | _e.g. Search functionality_ |

---

## Import Infrastructure

Located in `/tools/importer/`.

### Template: [template-name]

Defined in `page-templates.json` or custom runner. Source: _Describe source page type_.

**Sections**:

| # | Section | Block(s) | Default Content | Style |
|---|---------|----------|-----------------|-------|
| 1 | _e.g. Hero_ | hero | — | — |
| 2 | _e.g. Content_ | cards | h2 | — |

### Parsers

| Parser | File | Source Selectors |
|--------|------|------------------|
| _e.g. cards_ | `parsers/cards.js` | _e.g. `.card-list`_ |

### Transformers

| Transformer | File | Purpose |
|-------------|------|---------|
| _e.g. cleanup_ | `transformers/cleanup.js` | _e.g. Site-wide DOM cleanup, image URL fixes_ |

### Bundling

```bash
npx esbuild tools/importer/import-[name].js --bundle --format=iife --global-name=CustomImportScript --outfile=tools/importer/import-[name].bundle.js
```

---

## Image CDN Sources

_If your project uses specific image CDNs, document them here. Include URL patterns, format requirements, size limits, and any proxy/transformation steps._

| CDN | URL Pattern | Notes |
|-----|-------------|-------|
| _e.g. AEM Assets_ | `media_xxx` hashes | Already optimized |
| _e.g. Custom CDN_ | _pattern_ | _Any special handling_ |

---

## Migration Status

### Imported Pages

All imported pages are listed in `/PAGES.txt`. Each line is a path relative to the project root, e.g. `content/pages/about.plain.html`.

---

## Fonts

| Font | Source | Usage |
|------|--------|-------|
| _e.g. Open Sans (400/600/700)_ | Google Fonts (`/styles/fonts.css`) | Body + headings |
| _e.g. open-sans-fallback_ | Local Arial with size-adjust | Fallback |

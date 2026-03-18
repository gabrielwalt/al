/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-feature
 * Base block: columns
 * Source: https://www.allianz.com.au/
 * Source selector: .multi-column-grid (first instance, section 3 "Why Choose Allianz")
 *
 * Columns block library structure (multi-column, multi-row):
 *   Row 1: block name (handled by createBlock)
 *   Row 2+: N cells per row, each cell can contain text, images, links
 *
 * Source DOM (3-column trust signals):
 *   .multi-column-grid > div > .l-grid__row > .column (×3)
 *   Each .column: picture > img (SVG illustration), h3 heading, .c-copy text
 */
export default function parse(element, { document }) {
  // Find all columns
  const columns = element.querySelectorAll('.column, .l-grid__column-large-4');
  if (columns.length === 0) return;

  // Build one row with N cells (one per column)
  const row = [];
  columns.forEach((col) => {
    const cellContent = [];

    // Image
    const img = col.querySelector('img');
    if (img) {
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || '';
      cellContent.push(newImg);
    }

    // Heading (h3)
    const heading = col.querySelector('h3, h2');
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      cellContent.push(h3);
    }

    // Body text
    const text = col.querySelector('.c-copy, .text .c-copy');
    if (text) {
      const p = document.createElement('p');
      p.textContent = text.textContent.trim();
      cellContent.push(p);
    }

    // CTA link (if any)
    const link = col.querySelector('a.c-link, .link a');
    if (link) {
      const a = document.createElement('a');
      a.href = link.href || '#';
      a.textContent = link.textContent.trim();
      const p = document.createElement('p');
      p.append(a);
      cellContent.push(p);
    }

    row.push(cellContent);
  });

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}

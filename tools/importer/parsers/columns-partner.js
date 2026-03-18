/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-partner
 * Base block: columns
 * Source: https://www.allianz.com.au/
 * Source selector: .wrapper:has(img[alt*='Olympic'])
 *
 * Columns block library structure (multi-column, multi-row):
 *   Row 1: block name (handled by createBlock)
 *   Row 2: 2 cells — image | text
 *
 * Source DOM (2-column: logo + description):
 *   .multi-column-grid > .l-grid__row > 2 .column elements:
 *     Column 1: img (Olympic/Paralympic partner logo)
 *     Column 2: .c-copy text (partnership description)
 */
export default function parse(element, { document }) {
  // Column 1: Partner logo image
  const col1Content = [];
  const img = element.querySelector('img[alt*="Olympic"], img[alt*="Partner"]');
  if (img) {
    const newImg = document.createElement('img');
    newImg.src = img.src;
    newImg.alt = img.alt || '';
    col1Content.push(newImg);
  }

  // Column 2: Description text
  const col2Content = [];
  const text = element.querySelector('.c-copy, .text .c-copy');
  if (text) {
    const p = document.createElement('p');
    p.textContent = text.textContent.trim();
    col2Content.push(p);
  }

  const cells = [[col1Content, col2Content]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-partner', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-awards
 * Base block: columns
 * Source: https://www.allianz.com.au/
 * Source selector: .wrapper:has(.c-heading--section):has(.c-image)
 *
 * Columns block library structure (multi-column, multi-row):
 *   Row 1: block name (handled by createBlock)
 *   Row 2+: N cells per row
 *
 * Source DOM (2-column: text + awards):
 *   wrapper containing:
 *     h2 "Award-winning insurer"
 *     .multi-column-grid with 2 columns:
 *       Column 1: .c-copy text + a.c-link "See our awards"
 *       Column 2: nested .multi-column-grid with 2 award badge images
 */
export default function parse(element, { document }) {
  // Column 1: heading + text + CTA
  const col1Content = [];

  const heading = element.querySelector('h2, .c-heading--section');
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    col1Content.push(h2);
  }

  const bodyText = element.querySelector('.c-copy, .text .c-copy');
  if (bodyText) {
    const p = document.createElement('p');
    p.textContent = bodyText.textContent.trim();
    col1Content.push(p);
  }

  const ctaLink = element.querySelector('a.c-link, .link a');
  if (ctaLink) {
    const a = document.createElement('a');
    a.href = ctaLink.href || '#';
    a.textContent = ctaLink.textContent.trim();
    const p = document.createElement('p');
    p.append(a);
    col1Content.push(p);
  }

  // Column 2: award badge images
  const col2Content = [];
  const images = element.querySelectorAll('img[alt]');
  images.forEach((img) => {
    if (img.alt && img.alt.trim()) {
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt;
      col2Content.push(newImg);
    }
  });

  const cells = [[col1Content, col2Content]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-awards', cells });
  element.replaceWith(block);
}

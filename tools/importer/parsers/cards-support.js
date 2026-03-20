/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-support
 * Base block: cards
 * Source: https://www.allianz.com.au/
 * Source selector: .wrapper:has(.theme--inverted)
 *
 * Live site DOM ("Already an Allianz customer?" dark section):
 *   Outer 2-col grid (6-6):
 *     LEFT column: h2 heading
 *     RIGHT column: 3 nested 2-col grids (2-10 each):
 *       Each nested grid: icon SVG (col 2) | h3 + link (col 10)
 *
 * Cards block structure (2 columns per row):
 *   Row 1: block name (handled by createBlock)
 *   Row 2+: [icon image] | [h3 title + CTA link]
 *
 * The heading "Already an Allianz customer?" is extracted and
 * prepended before the block table as default content.
 */
export default function parse(element, { document }) {
  // Extract heading and prepend it before the block (becomes default content)
  const sectionHeading = element.querySelector('h2');
  if (sectionHeading) {
    const h2 = document.createElement('h2');
    h2.textContent = sectionHeading.textContent.trim();
    element.before(h2);
  }

  // Find the nested grids (cards) — multi-column-grid INSIDE another multi-column-grid
  const nestedGrids = element.querySelectorAll('.multi-column-grid .multi-column-grid');
  if (nestedGrids.length === 0) return;

  const cells = [];
  nestedGrids.forEach((grid) => {
    const cols = grid.querySelectorAll('.column');
    if (cols.length < 2) return;

    // Cell 1: Icon (first/narrow column)
    const iconCol = cols[0];
    const img = iconCol.querySelector('img');
    let imgCell;
    if (img) {
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || '';
      imgCell = newImg;
    } else {
      imgCell = '';
    }

    // Cell 2: Text content (wider column — h3 + link)
    const textCol = cols[1];
    const textContent = [];

    const heading = textCol.querySelector('h3, h2');
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      textContent.push(h3);
    }

    const link = textCol.querySelector('a.c-link, .link a, a');
    if (link) {
      const a = document.createElement('a');
      a.href = link.href || '#';
      const linkText = link.querySelector('.c-link__text');
      a.textContent = (linkText || link).textContent.trim();
      const p = document.createElement('p');
      p.append(a);
      textContent.push(p);
    }

    // XWalk field hints
    let imgHinted = imgCell;
    if (imgCell && imgCell !== '') {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(' field:image '));
      imgFrag.appendChild(imgCell);
      imgHinted = imgFrag;
    }
    let textHinted = textContent;
    if (textContent.length > 0) {
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(' field:text '));
      textContent.forEach((el) => textFrag.appendChild(el));
      textHinted = textFrag;
    }

    if (textContent.length > 0 || (imgCell && imgCell !== '')) {
      cells.push([imgHinted, textHinted]);
    }
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-support', cells });
  element.replaceWith(block);
}

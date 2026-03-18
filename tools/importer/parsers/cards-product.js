/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-product
 * Base block: cards
 * Source: https://www.allianz.com.au/
 * Source selector: .wrapper:has(.theme--inverted) .multi-column-grid,
 *                  .wrapper:has(.theme--negative) .multi-column-grid
 *
 * Cards block library structure (2 columns per row):
 *   Row 1: block name (handled by createBlock)
 *   Row 2+: [image] | [heading + description + CTA]
 *
 * Source DOM (3 product cards in dark section):
 *   .multi-column-grid > div > .l-grid__row > .column (×3)
 *   Each .column: img (product photo), h3 heading, .c-copy text, a.c-link CTA
 */
export default function parse(element, { document }) {
  const columns = element.querySelectorAll(':scope .column, :scope .l-grid__column-large-4');
  if (columns.length === 0) return;

  const cells = [];
  columns.forEach((col) => {
    // Cell 1: Image
    const img = col.querySelector('img');
    let imgCell;
    if (img) {
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || '';
      imgCell = newImg;
    } else {
      imgCell = '';
    }

    // Cell 2: Text content (heading + description + CTA)
    const textContent = [];

    const heading = col.querySelector('h3, h2');
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      textContent.push(h3);
    }

    const body = col.querySelector('.c-copy, .text .c-copy');
    if (body) {
      const p = document.createElement('p');
      p.textContent = body.textContent.trim();
      textContent.push(p);
    }

    // CTA link — specifically from .link container, not from inline footnotes in .c-copy
    const cta = col.querySelector('div.link a, a.c-link--block');
    if (cta) {
      const a = document.createElement('a');
      a.href = cta.href || '#';
      a.textContent = (cta.querySelector('.c-link__text') || cta).textContent.trim();
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
    cells.push([imgHinted, textHinted]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}

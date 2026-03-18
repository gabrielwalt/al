/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-support
 * Base block: cards
 * Source: https://www.allianz.com.au/
 * Source selector: .wrapper:has(a[href*='support']) .multi-column-grid
 *
 * Cards block library structure (2 columns per row):
 *   Row 1: block name (handled by createBlock)
 *   Row 2+: [image] | [heading + description + CTA]
 *
 * Source DOM structure:
 *   .multi-column-grid > div > .l-grid__row > .column (x2)
 *   Each .column contains:
 *     div.cmp-image > picture > img (photo)
 *     div.headline > h3 (title)
 *     div.text > .c-copy (description)
 *     div.link > a (Learn more CTA)
 */
export default function parse(element, { document }) {
  // Select only top-level column containers
  const columns = element.querySelectorAll('.l-grid__row > .column');
  if (columns.length === 0) return;

  const cells = [];
  columns.forEach((col) => {
    // Cell 1: Image
    const img = col.querySelector('img');
    let imgCell;
    if (img) {
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || img.title || '';
      imgCell = newImg;
    } else {
      imgCell = '';
    }

    // Cell 2: Text content
    const textContent = [];

    // Heading
    const heading = col.querySelector('h3, h2');
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      textContent.push(h3);
    }

    // Description
    const desc = col.querySelector('.text .c-copy, .text p, .c-copy, p');
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      textContent.push(p);
    }

    // CTA link — from .link container
    const cta = col.querySelector('div.link a');
    if (cta) {
      const a = document.createElement('a');
      a.href = cta.href || '#';
      a.textContent = (cta.querySelector('.c-link__text') || cta).textContent.trim();
      const p = document.createElement('p');
      p.append(a);
      textContent.push(p);
    }

    if (textContent.length > 0 || imgCell) {
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
    }
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-support', cells });
  element.replaceWith(block);
}

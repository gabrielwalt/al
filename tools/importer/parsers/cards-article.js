/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-article
 * Base block: cards
 * Source: https://www.allianz.com.au/
 * Source selector: .wrapper:has(a[href*='insights']) .multi-column-grid
 *
 * Live site DOM ("Let us help you" section, 3 article cards):
 *   .multi-column-grid > div > .l-grid__row > .column (x3)
 *   Each .column:
 *     div.cmp.cmp-image > picture > img (photo, 652x325 JPEG)
 *     div.headline > h3 > a (linked article title)
 *     div.text > p (description)
 *     div.link > a (CTA: "Read article")
 *
 * Cards block structure (2 columns per row):
 *   Row 1: block name (handled by createBlock)
 *   Row 2+: [photo image] | [h3 linked title + description + CTA]
 */
export default function parse(element, { document }) {
  const columns = element.querySelectorAll('.column');
  if (columns.length === 0) return;

  const cells = [];
  columns.forEach((col) => {
    // Cell 1: Photo image
    const img = col.querySelector('.cmp-image img, .cmp img, img');
    let imgCell;
    if (img) {
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || '';
      imgCell = newImg;
    } else {
      imgCell = '';
    }

    // Cell 2: Text content
    const textContent = [];

    // Linked heading (h3 > a)
    const headingLink = col.querySelector('.headline h3 a, h3 a');
    const heading = col.querySelector('h3, h2');
    if (headingLink) {
      const h3 = document.createElement('h3');
      const a = document.createElement('a');
      a.href = headingLink.href || '#';
      a.textContent = headingLink.textContent.trim();
      h3.append(a);
      textContent.push(h3);
    } else if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      textContent.push(h3);
    }

    // Description
    const descEl = col.querySelector('.text p, .text .c-copy');
    if (descEl) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.trim();
      textContent.push(p);
    }

    // CTA link (from .link container, not from heading links)
    const cta = col.querySelector('div.link a, .link > a');
    if (cta) {
      const a = document.createElement('a');
      a.href = cta.href || '#';
      const ctaText = cta.querySelector('.c-link__text');
      a.textContent = (ctaText || cta).textContent.trim();
      const p = document.createElement('p');
      p.append(a);
      textContent.push(p);
    }

    if (textContent.length > 0 || (imgCell && imgCell !== '')) {
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}

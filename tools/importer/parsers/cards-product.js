/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-product
 * Base block: cards
 * Source: https://www.allianz.com.au/
 * Source selector: .wrapper:has(.buttons-group) .multi-column-grid
 *
 * Live site DOM (3 product columns in "Insurance with Allianz" section):
 *   .multi-column-grid > div > .l-grid__row > .column (x3)
 *   Each .column:
 *     div.cmp.cmp-image > picture > img (icon SVG)
 *     div.link-list > h3 > a (linked product title)
 *     div.link-list > ul.c-link-list__list > li > a (sub-product links)
 *     div.button > a.c-button (CTA: "Start a quote" / "Select your state")
 *
 * Cards block structure (2 columns per row):
 *   Row 1: block name (handled by createBlock)
 *   Row 2+: [icon image] | [h3 title + sub-links list + CTA]
 */
export default function parse(element, { document }) {
  const columns = element.querySelectorAll('.column');
  if (columns.length === 0) return;

  const cells = [];
  columns.forEach((col) => {
    // Cell 1: Icon image
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

    // Product title (h3 with link)
    const titleLink = col.querySelector('.link-list h3 a, .c-link-list h3 a, h3 a');
    const titleH3 = col.querySelector('h3');
    if (titleLink) {
      const h3 = document.createElement('h3');
      const a = document.createElement('a');
      a.href = titleLink.href || '#';
      a.textContent = titleLink.textContent.trim();
      h3.append(a);
      textContent.push(h3);
    } else if (titleH3) {
      const h3 = document.createElement('h3');
      h3.textContent = titleH3.textContent.trim();
      textContent.push(h3);
    }

    // Sub-product links (e.g., Home & Contents, Renters, Landlord)
    const subLinks = col.querySelectorAll('.c-link-list__list a, .c-link-list__link-row a');
    if (subLinks.length > 0) {
      const ul = document.createElement('ul');
      subLinks.forEach((link) => {
        const text = link.textContent.trim();
        if (!text) return;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href || '#';
        a.textContent = text;
        li.append(a);
        ul.append(li);
      });
      if (ul.children.length > 0) {
        textContent.push(ul);
      }
    }

    // CTA button
    const ctaBtn = col.querySelector('.button a.c-button, a.c-button--link, .button a');
    if (ctaBtn) {
      const a = document.createElement('a');
      a.href = ctaBtn.href || '#';
      // Get text from the button, stripping icon spans
      const btnText = ctaBtn.querySelector('.c-button__text');
      a.textContent = (btnText || ctaBtn).textContent.trim();
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}

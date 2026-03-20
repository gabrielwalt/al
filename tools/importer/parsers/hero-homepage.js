/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-homepage
 * Base block: hero
 * Source: https://www.allianz.com.au/
 * Source selector: .a1stage
 *
 * The hero uses <one-stage> web component with shadow DOM.
 * Shadow DOM is lost during html2md serialization (outerHTML).
 * The import script's pre-extraction IIFE injects:
 *   data-extracted-headings: JSON array of {level, text}
 *   data-extracted-buttons: JSON array of {text, href, variant}
 * on the <one-stage> element before serialization.
 *
 * Hero block structure (1 column, 2 data rows):
 *   Row 1 (header): block name (handled by createBlock)
 *   Row 2: background image
 *   Row 3: heading + subheading + CTAs
 */
export default function parse(element, { document }) {
  const cells = [];
  const oneStage = element.querySelector('one-stage');

  // === Row 1: Background image ===
  // Available via data-image attribute (survives serialization)
  let imgSrc = null;
  let imgAlt = '';

  if (oneStage) {
    const dataImg = oneStage.getAttribute('data-image');
    imgAlt = oneStage.getAttribute('data-stageimagealt') || '';
    if (dataImg) {
      imgSrc = dataImg.startsWith('http') ? dataImg : `https://www.allianz.com.au${dataImg}`;
    }
  }

  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = imgAlt;
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    imgFrag.appendChild(img);
    cells.push([imgFrag]);
  }

  // === Row 2: Text content (heading + subheading + CTAs) ===
  const contentCell = [];

  // Primary source: pre-extracted data attributes (injected by IIFE before serialization)
  let headingsData = [];
  let buttonsData = [];

  if (oneStage) {
    try {
      const rawHeadings = oneStage.getAttribute('data-extracted-headings');
      if (rawHeadings) headingsData = JSON.parse(rawHeadings);
    } catch (e) { /* ignore parse errors */ }

    try {
      const rawButtons = oneStage.getAttribute('data-extracted-buttons');
      if (rawButtons) buttonsData = JSON.parse(rawButtons);
    } catch (e) { /* ignore parse errors */ }
  }

  // Heading (h1 level -> output as h2 for EDS)
  const h1Entry = headingsData.find((h) => h.level === 'h1');
  if (h1Entry && h1Entry.text) {
    const h2 = document.createElement('h2');
    h2.textContent = h1Entry.text;
    contentCell.push(h2);
  }

  // Subheading (span level)
  const spanEntry = headingsData.find((h) => h.level === 'span');
  if (spanEntry && spanEntry.text) {
    const p = document.createElement('p');
    p.textContent = spanEntry.text;
    contentCell.push(p);
  }

  // CTA buttons
  buttonsData.forEach((btn) => {
    if (!btn.text) return;

    const a = document.createElement('a');
    // Modal trigger buttons (no href or #) get a placeholder anchor
    if (!btn.href || btn.href === '#') {
      a.href = '#quote';
    } else {
      a.href = btn.href.startsWith('/') ? 'https://www.allianz.com.au' + btn.href : btn.href;
    }
    a.textContent = btn.text;
    const p = document.createElement('p');
    p.append(a);
    contentCell.push(p);
  });

  // Fallback: if pre-extraction did not work, try direct DOM queries
  if (contentCell.length === 0) {
    const h = element.querySelector('h1, h2');
    if (h) {
      const h2 = document.createElement('h2');
      h2.textContent = h.textContent.trim();
      contentCell.push(h2);
    }
    element.querySelectorAll('a[href]').forEach((link) => {
      const text = link.textContent.trim();
      if (!text) return;
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = text;
      const p = document.createElement('p');
      p.append(a);
      contentCell.push(p);
    });
  }

  if (contentCell.length > 0) {
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    contentCell.forEach((el) => textFrag.appendChild(el));
    cells.push([textFrag]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-homepage', cells });
  element.replaceWith(block);
}

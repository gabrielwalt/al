/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-homepage
 * Base block: hero
 * Source: https://www.allianz.com.au/
 * Source selector: .a1stage
 *
 * Hero block library structure (1 column, 3 rows):
 *   Row 1: block name (handled by createBlock)
 *   Row 2: background image
 *   Row 3: heading + subheading + CTAs
 *
 * Source DOM: <one-stage> web component with Shadow DOM containing:
 *   img.stage__image (background)
 *   one-heading > h1 "Allianz Insurance"
 *   one-heading > span "Care you can count on"
 *   one-button > button "Get your quote"
 *   one-button > a "Renew now"
 */
export default function parse(element, { document }) {
  const cells = [];

  // Access <one-stage> shadow DOM for rendered content
  const oneStage = element.querySelector('one-stage');
  const shadow = oneStage ? oneStage.shadowRoot : null;

  // Helper: query in shadow root first, fall back to element
  const q = (sel) => (shadow && shadow.querySelector(sel)) || element.querySelector(sel);
  const qAll = (sel) => {
    const fromShadow = shadow ? Array.from(shadow.querySelectorAll(sel)) : [];
    return fromShadow.length > 0 ? fromShadow : Array.from(element.querySelectorAll(sel));
  };

  // Row 1: Background image
  let bgImg = q('img.stage__image, img:not(.stage__image-mobile)');
  if (!bgImg && oneStage) {
    // Fallback to data attribute
    const imgSrc = oneStage.getAttribute('data-image');
    const imgAlt = oneStage.getAttribute('data-stageimagealt') || '';
    if (imgSrc) {
      bgImg = document.createElement('img');
      bgImg.src = imgSrc.startsWith('http') ? imgSrc : `https://www.allianz.com.au${imgSrc}`;
      bgImg.alt = imgAlt;
    }
  }
  if (bgImg) {
    const img = document.createElement('img');
    img.src = bgImg.src;
    img.alt = bgImg.alt || '';
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    imgFrag.appendChild(img);
    cells.push([imgFrag]);
  }

  // Row 2: Content (heading + subheading + CTAs)
  const contentCell = [];

  // Heading — use h2 in block table (h1 breaks markdown table conversion)
  const heading = q('h1, h2');
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    contentCell.push(h2);
  }

  // Subheading — span.heading--h3 or similar
  const subheading = q('span.heading--h3, span.heading, one-heading[data-level="span"]');
  if (subheading) {
    const p = document.createElement('p');
    p.textContent = subheading.textContent.trim();
    contentCell.push(p);
  }

  // CTAs — collect buttons and links from shadow DOM
  const ctaElements = qAll('one-button');
  ctaElements.forEach((oneBtn) => {
    const btnShadow = oneBtn.shadowRoot;
    const anchor = btnShadow
      ? btnShadow.querySelector('a') || btnShadow.querySelector('button')
      : oneBtn.querySelector('a, button');
    if (!anchor) return;

    const linkText = (anchor.textContent || '').trim()
      || oneBtn.getAttribute('data-text') || '';
    if (!linkText) return;

    const a = document.createElement('a');
    const href = oneBtn.getAttribute('data-href')
      || (anchor.tagName === 'A' ? anchor.getAttribute('href') : '')
      || '#';
    a.href = href.startsWith('/') ? `https://www.allianz.com.au${href}` : href;
    a.textContent = linkText;
    const p = document.createElement('p');
    p.append(a);
    contentCell.push(p);
  });

  // Fallback: if no one-button found, try direct a/button elements
  if (ctaElements.length === 0) {
    const links = qAll('a[href], button[data-href]');
    links.forEach((link) => {
      const text = link.textContent.trim();
      if (!text) return;
      const a = document.createElement('a');
      a.href = link.href || link.getAttribute('data-href') || '#';
      a.textContent = text;
      const p = document.createElement('p');
      p.append(a);
      contentCell.push(p);
    });
  }

  console.log(`[HERO DEBUG] contentCell length: ${contentCell.length}`);
  contentCell.forEach((el, i) => {
    console.log(`[HERO DEBUG]   [${i}] tag=${el.tagName} text="${(el.textContent || '').substring(0, 40)}"`);
  });

  if (contentCell.length > 0) {
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    contentCell.forEach((el) => textFrag.appendChild(el));
    cells.push([textFrag]);
  }

  console.log(`[HERO DEBUG] cells length: ${cells.length}`);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-homepage', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-awards
 * Base block: columns
 * Source: https://www.allianz.com.au/
 * Source selector: .wrapper:has(a[href*='awards']) .multi-column-grid
 *
 * Live site DOM ("An award-winning insurer" section):
 *   .multi-column-grid (2-col grid, 6-6):
 *     LEFT column: h2 heading + p text + a link ("See all our awards")
 *     RIGHT column: picture > img (awards badge, 652x135 PNG)
 *
 * Columns block structure:
 *   Row 1: block name (handled by createBlock)
 *   Row 2: [heading + text + CTA] | [awards image]
 */
export default function parse(element, { document }) {
  var columns = element.querySelectorAll('.column');
  if (columns.length < 2) return;

  // Column 1: heading + text + CTA link
  var col1 = columns[0];
  var col1Content = [];

  var heading = col1.querySelector('h2');
  if (heading) {
    var h2 = document.createElement('h2');
    // Preserve innerHTML to keep <em> highlights from cleanup transformer
    h2.innerHTML = heading.innerHTML;
    col1Content.push(h2);
  }

  var bodyText = col1.querySelector('.text .c-copy, .text p, .c-copy');
  if (bodyText) {
    var p = document.createElement('p');
    p.textContent = bodyText.textContent.trim();
    col1Content.push(p);
  }

  var ctaLink = col1.querySelector('.link a, a.c-link');
  if (ctaLink) {
    var a = document.createElement('a');
    a.href = ctaLink.href || '#';
    var linkText = ctaLink.querySelector('.c-link__text');
    a.textContent = (linkText || ctaLink).textContent.trim();
    var ctaP = document.createElement('p');
    ctaP.append(a);
    col1Content.push(ctaP);
  }

  // Column 2: awards badge image
  var col2 = columns[1];
  var col2Content = [];

  var img = col2.querySelector('img');
  if (img) {
    var newImg = document.createElement('img');
    newImg.src = img.src;
    newImg.alt = img.alt || '';
    col2Content.push(newImg);
  }

  var cells = [[col1Content, col2Content]];
  var block = WebImporter.Blocks.createBlock(document, { name: 'columns-awards', cells: cells });
  element.replaceWith(block);
}

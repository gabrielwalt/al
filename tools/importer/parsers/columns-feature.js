/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-feature
 * Base block: columns
 * Source: https://www.allianz.com.au/
 * Source selector: .wrapper:has(.c-heading--subsection-medium) .multi-column-grid
 *
 * Live site DOM ("What care looks like" section, 4 icon columns):
 *   .multi-column-grid > div > .l-grid__row > .column (x4)
 *   Each .column (l-grid__column-large-3):
 *     div.cmp.cmp-image > picture > img (icon SVG)
 *     div.headline > span.c-heading.c-heading--subsection-medium (text)
 *       Some headings contain <sup> footnote refs or inline <a> links
 *
 * Columns block structure:
 *   Row 1: block name (handled by createBlock)
 *   Row 2: N cells (one per column), each with icon + text
 */
export default function parse(element, { document }) {
  const columns = element.querySelectorAll('.column');
  if (columns.length === 0) return;

  // Build one row with N cells (one per column)
  const row = [];
  columns.forEach((col) => {
    const cellContent = [];

    // Icon image
    const img = col.querySelector('.cmp-image img, .cmp img, img');
    if (img) {
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || '';
      cellContent.push(newImg);
    }

    // Heading text (span.c-heading--subsection-medium, NOT h2/h3)
    const headingSpan = col.querySelector('.c-heading--subsection-medium, .c-heading');
    if (headingSpan) {
      const p = document.createElement('p');
      // Preserve inline links within the heading text
      const inlineLink = headingSpan.querySelector('a');
      if (inlineLink) {
        // Clone the text content, preserving the link
        const textBefore = headingSpan.firstChild;
        if (textBefore && textBefore.nodeType === 3) {
          p.append(textBefore.textContent);
        }
        const a = document.createElement('a');
        a.href = inlineLink.href || '#';
        a.textContent = inlineLink.textContent.trim();
        p.append(a);
        // Get remaining text after the link
        let afterLink = inlineLink.nextSibling;
        while (afterLink) {
          if (afterLink.nodeType === 3) {
            p.append(afterLink.textContent);
          }
          afterLink = afterLink.nextSibling;
        }
      } else {
        // Plain text (strip <sup> footnote references)
        p.textContent = headingSpan.textContent.trim();
      }
      cellContent.push(p);
    }

    // Fallback: check for h3/h2 if span not found
    if (!headingSpan) {
      const heading = col.querySelector('h3, h2');
      if (heading) {
        const h3 = document.createElement('h3');
        h3.textContent = heading.textContent.trim();
        cellContent.push(h3);
      }
    }

    if (cellContent.length > 0) {
      row.push(cellContent);
    }
  });

  if (row.length === 0) return;

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Allianz Australia section breaks and section metadata.
 * Runs in afterTransform only. Uses payload.template.sections.
 * Selectors from captured DOM of https://www.allianz.com.au/
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const { document } = payload;
    const sections = payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to preserve DOM positions
    const reversedSections = [...sections].reverse();

    reversedSections.forEach((section) => {
      // Try selector(s) - can be string or array
      const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
      let sectionEl = null;

      for (const sel of selectors) {
        try {
          sectionEl = element.querySelector(sel);
        } catch (e) {
          // :contains() not supported in native querySelector — try text-based fallback
          const match = sel.match(/:contains\(['"]([^'"]+)['"]\)/);
          if (match) {
            const text = match[1];
            const tag = sel.split(':contains')[0].split(' ').pop() || '*';
            const candidates = element.querySelectorAll(tag);
            for (const c of candidates) {
              if (c.textContent.includes(text)) {
                // Walk up to find the wrapper/container ancestor
                sectionEl = c.closest('.wrapper') || c.closest('.l-container') || c.parentElement;
                break;
              }
            }
          }
        }
        if (sectionEl) break;
      }

      if (!sectionEl) return;

      // Add section-metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Add <hr> before section (except for the first section)
      if (section.id !== sections[0].id) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    });
  }
}

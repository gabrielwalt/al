/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Allianz Australia cleanup.
 * Removes non-authorable content (navigation, breadcrumbs, site chrome).
 * Selectors from captured DOM of https://www.allianz.com.au/
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie/consent overlays and tracking (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '[id*="cookie"]',
      '[class*="cookie"]',
      '[id*="consent"]',
      '[class*="consent"]',
      'noscript',
    ]);

    // Fix overflow issues for full-page capture
    const overflowEls = element.querySelectorAll('[style*="overflow: hidden"]');
    overflowEls.forEach((el) => { el.style.overflow = 'visible'; });
  }

  if (hookName === H.after) {
    // Remove non-authorable site chrome (from captured DOM)
    // Note: Do NOT remove .experiencefragment globally — some content sections use XFs
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav',
      '.c-stage--only-breadcrumbs',
      '.agent-card-xf',
      'iframe',
      'link',
      'script',
      '.spacer',
      '[class*="breadcrumb"]',
      '.c-skip-link',
      '#skip-link-component',
      '.om-cookie-disclaimer',
    ]);

    // Clean tracking attributes from all elements (from captured DOM)
    element.querySelectorAll('[data-component-id], [data-component-name], [data-component-type]').forEach((el) => {
      el.removeAttribute('data-component-id');
      el.removeAttribute('data-component-name');
      el.removeAttribute('data-component-type');
    });

    // Remove empty AEM Grid wrappers that only contain whitespace
    element.querySelectorAll('.aem-Grid, .aem-GridColumn, .parsys').forEach((el) => {
      if (el.textContent.trim() === '' && !el.querySelector('img, picture, video')) {
        el.remove();
      }
    });
  }
}

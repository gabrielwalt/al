/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Allianz Australia cleanup.
 * Removes non-authorable content (navigation, breadcrumbs, site chrome, footer XFs).
 * Preserves highlighted words in headings (colored spans → <em>).
 * Converts "Follow us on" social XF into a social-follow block in its own section.
 * Selectors from live DOM of https://www.allianz.com.au/
 */
var H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    WebImporter.DOMUtils.remove(element, [
      '[id*="cookie"]',
      '[class*="cookie"]',
      '[id*="consent"]',
      '[class*="consent"]',
      'noscript',
      '#wm-ipp-base',
      '#wm-ipp',
      '#donato',
      '#playback',
      '[id*="wayback"]',
      '.wb-autocomplete-suggestions',
    ]);

    var overflowEls = element.querySelectorAll('[style*="overflow: hidden"]');
    overflowEls.forEach(function(el) { el.style.overflow = 'visible'; });

    // Convert highlighted words in headings: colored <span> → <em>
    // Allianz uses inline colored spans to accent specific words in headings.
    // Any <span> inside a heading with an inline color style is converted to <em>.
    var headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(function(heading) {
      var spans = heading.querySelectorAll('span[style]');
      spans.forEach(function(span) {
        var style = span.getAttribute('style') || '';
        if (style.match(/(?:^|;)\s*color\s*:/i)) {
          var isBlack = style.match(/color:\s*(?:black|inherit|currentcolor)/i);
          if (!isBlack) {
            var em = payload.document.createElement('em');
            em.textContent = span.textContent;
            span.replaceWith(em);
          }
        }
      });
    });

    // Replace social links XF with a fake .wrapper so sections transformer
    // treats it as its own section boundary (no background = no section-metadata).
    // The actual block table is created in afterTransform.
    var socialXFs = element.querySelectorAll('.experiencefragment:has(.social-media-divider), .experiencefragment:has(.c-social-divider)');
    socialXFs.forEach(function(xf) {
      var fakeWrapper = payload.document.createElement('div');
      fakeWrapper.className = 'wrapper social-follow-wrapper';
      fakeWrapper.setAttribute('data-social-follow', 'true');
      xf.replaceWith(fakeWrapper);
    });
  }

  if (hookName === H.after) {
    // Remove experience fragments that are NOT content sections
    WebImporter.DOMUtils.remove(element, [
      '.experiencefragment:has(.footer_navigation)',
      '.experiencefragment:has(.c-footer__navigation)',
      '.experiencefragment:has([style*="91, 91, 91"])',
      '.experiencefragment:has(.c-rte-dialog-background-color-grey)',
      '.experiencefragment:has(a[href*="policy-documents"])',
    ]);

    // Convert social-follow-wrapper placeholder into a block table
    var socialWrappers = element.querySelectorAll('[data-social-follow]');
    socialWrappers.forEach(function(wrapper) {
      var blockTable = WebImporter.Blocks.createBlock(payload.document, {
        name: 'Social Follow',
        cells: [],
      });
      wrapper.replaceWith(blockTable);
    });

    // Remove remaining non-authorable site chrome
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav',
      '.c-stage--only-breadcrumbs',
      '.agent-card-xf',
      'iframe',
      'link',
      'script',
      '.spacer.parbase',
      '[class*="breadcrumb"]',
      '.c-skip-link',
      '#skip-link-component',
      '.om-cookie-disclaimer',
      '.footer_navigation',
      '.c-footer',
      '.c-footer__navigation',
      '.c-footer__legal',
      '[class*="popup"]',
      '[class*="modal"]',
      '.c-rating',
      '[class*="rating"]',
    ]);

    // Clean tracking attributes
    element.querySelectorAll('[data-component-id], [data-component-name], [data-component-type]').forEach(function(el) {
      el.removeAttribute('data-component-id');
      el.removeAttribute('data-component-name');
      el.removeAttribute('data-component-type');
    });

    // Remove empty AEM Grid wrappers
    element.querySelectorAll('.aem-Grid, .aem-GridColumn, .parsys').forEach(function(el) {
      if (el.textContent.trim() === '' && !el.querySelector('img, picture, video')) {
        el.remove();
      }
    });
  }
}

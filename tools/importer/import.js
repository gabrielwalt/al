/* eslint-disable */
/* global WebImporter */

// ============================================================
// PRE-EXTRACTION: Run in live browser context BEFORE html2md
// serializes the DOM. Shadow DOM content is lost during
// outerHTML serialization, so we extract it into data attributes.
// ============================================================
(function extractShadowDomContent() {
  try {
    var stages = document.querySelectorAll('one-stage');
    stages.forEach(function(stage) {
      var shadow = stage.shadowRoot;
      if (!shadow) return;

      // Extract headings from shadow DOM
      var headings = shadow.querySelectorAll('one-heading');
      var headingData = [];
      headings.forEach(function(h) {
        var level = h.getAttribute('data-level') || '';
        var text = h.getAttribute('data-text') || h.textContent.trim();
        headingData.push({ level: level, text: text });
      });
      if (headingData.length > 0) {
        stage.setAttribute('data-extracted-headings', JSON.stringify(headingData));
      }

      // Extract buttons from shadow DOM
      var buttons = shadow.querySelectorAll('one-button');
      var buttonData = [];
      buttons.forEach(function(b) {
        var btnTextEl = b.querySelector('.button__text');
        var renderedText = btnTextEl ? btnTextEl.textContent.trim() : '';
        var text = renderedText || b.getAttribute('data-text') || '';
        var href = b.getAttribute('data-href') || '';
        var variant = b.getAttribute('data-variant') || 'primary';
        buttonData.push({ text: text, href: href, variant: variant });
      });
      if (buttonData.length > 0) {
        stage.setAttribute('data-extracted-buttons', JSON.stringify(buttonData));
      }
    });
  } catch (e) {
    console.warn('[PRE-EXTRACT] Shadow DOM extraction failed:', e);
  }
})();

// PARSER IMPORTS
import heroHomepageParser from './parsers/hero-homepage.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import columnsAwardsParser from './parsers/columns-awards.js';
import cardsProductParser from './parsers/cards-product.js';
import cardsArticleParser from './parsers/cards-article.js';
import cardsSupportParser from './parsers/cards-support.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/allianz-cleanup.js';
import sectionsTransformer from './transformers/allianz-sections.js';

// PARSER REGISTRY
var parsers = {
  'hero-homepage': heroHomepageParser,
  'columns-feature': columnsFeatureParser,
  'columns-awards': columnsAwardsParser,
  'cards-product': cardsProductParser,
  'cards-article': cardsArticleParser,
  'cards-support': cardsSupportParser,
};

// TRANSFORMER REGISTRY
var transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
// Block order matters: specific selectors first, deduplication Set prevents double-matching.
var PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Allianz Australia homepage - hero, product cards, customer actions, awards, features, articles',
  urls: [
    'https://www.allianz.com.au/',
  ],
  blocks: [
    {
      name: 'hero-homepage',
      instances: ['.a1stage'],
    },
    {
      name: 'cards-product',
      instances: ['.wrapper:has(.buttons-group) .multi-column-grid'],
    },
    {
      name: 'cards-support',
      instances: ['.wrapper:has(.theme--inverted)'],
    },
    {
      name: 'columns-awards',
      instances: [".wrapper:has(a[href*='awards']) .multi-column-grid"],
    },
    {
      // MUST come before cards-article — the features section has an inline
      // link containing "insights" that would otherwise match cards-article.
      // Target grids with 4-column layout (unique to this section).
      name: 'columns-feature',
      instances: ['.multi-column-grid:has(.l-grid__column-large-3)'],
    },
    {
      // Use exact path ending to avoid matching inline links in other sections
      name: 'cards-article',
      instances: [".wrapper:has(a[href$='/insights.html']) .multi-column-grid"],
    },
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero',
      selector: '.a1stage',
      style: null,
      blocks: ['hero-homepage'],
      defaultContent: [],
    },
    {
      id: 'section-products',
      name: 'Insurance with Allianz',
      selector: '.wrapper:has(.buttons-group)',
      style: null,
      blocks: ['cards-product'],
      defaultContent: [],
    },
    {
      id: 'section-customer',
      name: 'Already an Allianz customer?',
      selector: '.wrapper:has(.theme--inverted)',
      style: 'dark',
      blocks: ['cards-support'],
      defaultContent: [],
    },
    {
      id: 'section-awards',
      name: 'Award-Winning Insurer',
      selector: ".wrapper:has(a[href*='awards'])",
      style: null,
      blocks: ['columns-awards'],
      defaultContent: [],
    },
    {
      id: 'section-features',
      name: 'What Care Looks Like',
      selector: '.wrapper:has(.c-heading--subsection-medium)',
      style: 'light-teal',
      blocks: ['columns-feature'],
      defaultContent: [],
    },
    {
      id: 'section-articles',
      name: 'Let Us Help You',
      selector: ".wrapper:has(a[href$='/insights.html'])",
      style: null,
      blocks: ['cards-article'],
      defaultContent: [],
    },
    {
      id: 'section-hardship',
      name: 'Financial Hardship Support',
      selector: ".wrapper:has(a[href*='financial-hardship'])",
      style: 'light-teal',
      blocks: [],
      defaultContent: [],
    },
    {
      id: 'section-conditions',
      name: 'Conditions / Disclaimers',
      selector: '.wrapper:has(#conditions)',
      style: null,
      blocks: [],
      defaultContent: [],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  var enhancedPayload = {};
  for (var key in payload) {
    enhancedPayload[key] = payload[key];
  }
  enhancedPayload.template = PAGE_TEMPLATE;

  transformers.forEach(function(transformerFn) {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error('Transformer failed at ' + hookName + ':', e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  var pageBlocks = [];
  var matchedElements = new Set();

  template.blocks.forEach(function(blockDef) {
    blockDef.instances.forEach(function(selector) {
      try {
        var elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
          if (!matchedElements.has(el)) {
            matchedElements.add(el);
            pageBlocks.push({
              name: blockDef.name,
              selector: selector,
              element: el,
            });
          }
        });
      } catch (e) {
        console.warn('Block "' + blockDef.name + '" selector failed: ' + selector, e);
      }
    });
  });

  console.log('Found ' + pageBlocks.length + ' block instances on page');
  pageBlocks.forEach(function(b) { console.log('  - ' + b.name + ': ' + b.selector); });
  return pageBlocks;
}

export default {
  transform: function(payload) {
    var document = payload.document;
    var url = payload.url;
    var params = payload.params;

    var main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    var pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach(function(block) {
      var parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document: document, url: url, params: params });
        } catch (e) {
          console.error('Failed to parse ' + block.name + ' (' + block.selector + '):', e);
        }
      } else {
        console.warn('No parser found for block: ' + block.name);
      }
    });

    // 4. Execute afterTransform transformers (section breaks + metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    var hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    var originalURL = params.originalURL;
    var originalPath = new URL(originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html$/, '');
    var path = WebImporter.FileUtils.sanitizePath(originalPath || '/index');

    return [{
      element: main,
      path: path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map(function(b) { return b.name; }),
      },
    }];
  },
};

/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHomepageParser from './parsers/hero-homepage.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import columnsAwardsParser from './parsers/columns-awards.js';
import columnsPartnerParser from './parsers/columns-partner.js';
import cardsProductParser from './parsers/cards-product.js';
import cardsArticleParser from './parsers/cards-article.js';
import cardsSupportParser from './parsers/cards-support.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/allianz-cleanup.js';
import sectionsTransformer from './transformers/allianz-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-homepage': heroHomepageParser,
  'columns-feature': columnsFeatureParser,
  'columns-awards': columnsAwardsParser,
  'columns-partner': columnsPartnerParser,
  'cards-product': cardsProductParser,
  'cards-article': cardsArticleParser,
  'cards-support': cardsSupportParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Allianz Australia homepage with hero, insurance product cards, promotional content, and trust signals',
  urls: [
    'https://web.archive.org/web/2025/https://www.allianz.com.au/',
  ],
  blocks: [
    {
      name: 'hero-homepage',
      instances: ['.a1stage'],
    },
    {
      name: 'columns-feature',
      instances: ['.multi-column-grid'],
    },
    {
      name: 'columns-awards',
      instances: [".wrapper:has(.c-heading--section):has(.c-image)"],
    },
    {
      name: 'columns-partner',
      instances: [".wrapper:has(img[alt*='Olympic'])"],
    },
    {
      name: 'cards-product',
      instances: ['.wrapper:has(.theme--inverted) .multi-column-grid', '.wrapper:has(.theme--negative) .multi-column-grid'],
    },
    {
      name: 'cards-article',
      instances: [".wrapper:has(a[href*='insights']) .multi-column-grid"],
    },
    {
      name: 'cards-support',
      instances: [".wrapper:has(a[href*='support']) .multi-column-grid"],
    },
  ],
  sections: [
    {
      id: 'section-1-alert-banner',
      name: 'Alert Banner',
      selector: ".l-container[style*='FDD25C']",
      style: 'alert-yellow',
      blocks: [],
      defaultContent: [".l-container[style*='FDD25C'] .c-copy"],
    },
    {
      id: 'section-2-hero',
      name: 'Hero',
      selector: '.a1stage',
      style: null,
      blocks: ['hero-homepage'],
      defaultContent: [],
    },
    {
      id: 'section-3-why-choose',
      name: 'Why Choose Allianz',
      selector: ".wrapper:has(h2:contains('Why choose'))",
      style: null,
      blocks: ['columns-feature'],
      defaultContent: [".wrapper:has(h2:contains('Why choose')) h2"],
    },
    {
      id: 'section-4-awards',
      name: 'Award-Winning Insurer',
      selector: ".wrapper:has(h2:contains('Award-winning'))",
      style: null,
      blocks: ['columns-awards'],
      defaultContent: [],
    },
    {
      id: 'section-5-olympic-partner',
      name: 'Olympic Partner Banner',
      selector: ".wrapper:has(img[alt*='Olympic'])",
      style: null,
      blocks: ['columns-partner'],
      defaultContent: [],
    },
    {
      id: 'section-6-insurance-products',
      name: 'Insurance with Allianz',
      selector: '.wrapper:has(.theme--inverted)',
      style: 'dark',
      blocks: ['cards-product'],
      defaultContent: ['.wrapper:has(.theme--inverted) h2', '.wrapper:has(.theme--inverted) .c-heading--subsection-xsmall'],
    },
    {
      id: 'section-7-claims-cta',
      name: 'Claims CTA',
      selector: ".wrapper:has(h2:contains('claim'))",
      style: null,
      blocks: [],
      defaultContent: [".wrapper:has(h2:contains('claim')) h2", ".wrapper:has(h2:contains('claim')) .c-copy", ".wrapper:has(h2:contains('claim')) .c-link"],
    },
    {
      id: 'section-8-insights',
      name: 'Insights / Help Articles',
      selector: ".wrapper:has(h2:contains('help you'))",
      style: null,
      blocks: ['cards-article'],
      defaultContent: [".wrapper:has(h2:contains('help you')) h2", ".wrapper:has(h2:contains('help you')) > .c-copy"],
    },
    {
      id: 'section-9-support',
      name: 'Support Section',
      selector: ".wrapper:has(h2:contains('support'))",
      style: null,
      blocks: ['cards-support'],
      defaultContent: [".wrapper:has(h2:contains('support')) h2", ".wrapper:has(h2:contains('support')) > .c-copy"],
    },
    {
      id: 'section-10-social',
      name: 'Social Follow',
      selector: '.social-bar',
      style: null,
      blocks: [],
      defaultContent: ['.social-bar h2', '.social-bar ul'],
    },
    {
      id: 'section-11-conditions',
      name: 'Conditions / Disclaimers',
      selector: ".wrapper:has(h3:contains('Conditions'))",
      style: null,
      blocks: [],
      defaultContent: [".wrapper:has(h3:contains('Conditions')) h3", ".wrapper:has(h3:contains('Conditions')) ol"],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
          });
        });
      } catch (e) {
        console.warn(`Block "${blockDef.name}" selector failed: ${selector}`, e);
      }
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (section breaks + metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (handle Wayback Machine URLs)
    let originalURL = params.originalURL;
    // Extract real URL from Wayback Machine pattern
    const waybackMatch = originalURL.match(/web\.archive\.org\/web\/\d+\/(https?:\/\/.+)/);
    if (waybackMatch) {
      originalURL = waybackMatch[1];
    }
    const originalPath = new URL(originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html$/, '');
    const path = WebImporter.FileUtils.sanitizePath(originalPath || '/index');

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};

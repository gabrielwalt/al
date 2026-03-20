/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Allianz Australia section breaks and section metadata.
 *
 * Runs in beforeTransform so wrappers still exist (before parsers replace them).
 * Detects section boundaries from .wrapper elements in the main parsys.
 * Also handles the .stage container (hero) which is a sibling of the parsys.
 * Detects backgrounds automatically from inline styles.
 *
 * Background detection:
 *   - .theme--inverted → style: "dark"
 *   - background-color:#F1F9FA → style: "light-teal"
 */
var H = { before: 'beforeTransform', after: 'afterTransform' };

function detectSectionStyle(wrapper) {
  if (wrapper.querySelector('.theme--inverted, .theme--negative')) {
    return 'dark';
  }
  var containers = wrapper.querySelectorAll('.l-container, [class*="l-container"]');
  for (var i = 0; i < containers.length; i++) {
    var style = containers[i].getAttribute('style') || '';
    if (style.match(/background-color\s*:\s*#F1F9FA/i)) {
      return 'light-teal';
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== H.before) return;

  var doc = payload.document;

  // Find all wrapper elements (section boundaries on the Allianz site)
  var allWrappers = Array.from(element.querySelectorAll('.wrapper.container, .wrapper'));

  // Also find the hero stage container and treat it as the first section element
  var stage = element.querySelector('.stage.container, .a1stage');
  if (stage) {
    // Find the stage's parent wrapper (the stage container div)
    var stageContainer = stage.closest('.stage') || stage;
    // Only add if not already in the list
    var isInList = false;
    for (var s = 0; s < allWrappers.length; s++) {
      if (allWrappers[s] === stageContainer || allWrappers[s].contains(stageContainer)) {
        isInList = true;
        break;
      }
    }
    if (!isInList) {
      allWrappers.unshift(stageContainer);
    }
  }

  console.log('[SECTIONS] Found ' + allWrappers.length + ' section elements');

  if (allWrappers.length < 2) return;

  // Step 1: Insert <hr> between consecutive section elements (forward order)
  for (var j = 1; j < allWrappers.length; j++) {
    var hr = doc.createElement('hr');
    allWrappers[j].before(hr);
    console.log('[SECTIONS] Added <hr> before element ' + j);
  }

  // Step 2: Add section-metadata at the END of each styled section
  // The section-metadata must go right BEFORE the next <hr> (end of current section)
  for (var k = 0; k < allWrappers.length; k++) {
    var style = detectSectionStyle(allWrappers[k]);
    if (!style) continue;

    // Find the next <hr> after this wrapper (marks the end of this section)
    var nextHr = null;
    var sibling = allWrappers[k].nextElementSibling;
    while (sibling) {
      if (sibling.tagName === 'HR') {
        nextHr = sibling;
        break;
      }
      sibling = sibling.nextElementSibling;
    }

    var meta = WebImporter.Blocks.createBlock(doc, {
      name: 'Section Metadata',
      cells: { style: style },
    });

    if (nextHr) {
      // Insert section-metadata right before the <hr> → at end of this section
      nextHr.before(meta);
    } else {
      // Last section: just append after the wrapper
      allWrappers[k].after(meta);
    }
    console.log('[SECTIONS] Added section-metadata (style: ' + style + ') at end of section ' + k);
  }
}

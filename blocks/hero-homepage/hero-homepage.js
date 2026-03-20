import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  // Row 0: background image, Row 1: text content
  const imageRow = rows[0];
  const textRow = rows[1];

  if (imageRow) {
    const img = imageRow.querySelector('img');
    if (img) {
      const bgWrapper = document.createElement('div');
      bgWrapper.className = 'hero-homepage-bg';
      moveInstrumentation(imageRow, bgWrapper);
      const picture = img.closest('picture') || img;
      bgWrapper.append(picture);
      block.prepend(bgWrapper);
    }
    imageRow.remove();
  }

  if (textRow) {
    const content = document.createElement('div');
    content.className = 'hero-homepage-content';
    moveInstrumentation(textRow, content);
    while (textRow.firstElementChild) {
      const child = textRow.firstElementChild;
      while (child.firstChild) content.append(child.firstChild);
      child.remove();
    }
    textRow.remove();
    block.append(content);
  }
}

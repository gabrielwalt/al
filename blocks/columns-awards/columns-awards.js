import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  [...block.children].forEach((row) => {
    moveInstrumentation(row, row);
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        col.classList.add('columns-awards-img-col');
      } else {
        col.classList.add('columns-awards-text-col');
      }
    });
  });
}

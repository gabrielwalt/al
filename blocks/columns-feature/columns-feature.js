import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const grid = document.createElement('div');
  grid.className = 'columns-feature-grid';
  moveInstrumentation(row, grid);

  [...row.children].forEach((col) => {
    const cell = document.createElement('div');
    cell.className = 'columns-feature-cell';
    while (col.firstChild) cell.append(col.firstChild);
    grid.append(cell);
  });

  block.textContent = '';
  block.append(grid);
}

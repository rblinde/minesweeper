type Grid = Array<Number> | Array<Grid>;

const matrix = (size: number, fill: any): Grid =>
  Array.from({
    length: size
  }, () => new Array(size).fill(fill));

const randInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min));


class Game {
  boardElem: HTMLDivElement;
  cellElems: HTMLDivElement[];
  grid: Grid;
  bombs: number;
  size: number;

  constructor(bombs: number, size: number) {
    this.boardElem = <HTMLDivElement>document.querySelector('.board');
    this.bombs = bombs;
    this.size = size;

    this.fillGrid();
    this.buildCellElems();
    this.addEventListeners();

    // For dev purposes only
    const gridAsString = this.grid.map(row => row.map(e => e.toString().padStart(2)).join(' ')).join('\n');
    console.log(gridAsString);
  }


  /**
   * Creates an empty grid, places bombs and then
   * sets remaining accordint to the number of bombs
   * in the vicinity
   */
  private fillGrid() {
    this.grid = matrix(this.size, 0);
    this.placeBombs();

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        this.grid[y][x] = this.getBombsInVicinity(y, x);
      }
    }
  }


  /**
   * Create `bombs` amount of bombs and places them
   * in the grid
   */
  private placeBombs() {
    const bombs: number[] = [];

    while (bombs.length < this.bombs) {
      const index = randInt(0, this.size * this.size);

      if (!bombs.includes(index)) {
        bombs.push(index);
      }
    }

    // Place bombs in grid
    for (const bomb of bombs) {
      const y = Math.floor(bomb / this.size);
      const x = bomb % this.size;
      this.grid[x][y] = -1;
    }
  }


  /**
   * Return number of bombs in vicinity of y,x in grid
   * @param y
   * @param x
   * @returns number of bombs
   */
  private getBombsInVicinity(y: number, x: number): number {
    if (this.grid[y][x] === -1) {
      return -1;
    }

    let count = 0;
    const toCheck = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];

    for (const [dy, dx] of toCheck) {
      if (y + dy >= 0 && y + dy < this.size && // y coordinates within field
        x + dx >= 0 && x + dx < this.size && // x coordinates within field
        this.grid[y + dy][x + dx] === -1 // neighbour is a bomb
      ) {
        count += 1;
      }
    }

    return count;
  }


  /**
   * Creates HTML grid of cell elems with x,y coordinates
   * on data-attributes
   */
  private buildCellElems() {
    this.cellElems = [];

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const elem: HTMLDivElement = document.createElement('div');
        elem.classList.add('cell');
        elem.dataset.y = y.toString();
        elem.dataset.x = x.toString();
        this.boardElem.append(elem);
        this.cellElems.push(elem);
      }
    }
  }


  private addEventListeners() {
    this.cellElems.forEach(cell => cell.addEventListener('click', (e) => this.handleCellClick(e), false));
  }


  private handleCellClick(e: MouseEvent) {
    e.preventDefault();

    const cell = e.target as HTMLDivElement;
    const { x, y } = cell.dataset;

    if (!x || !y) {
      return;
    }

    const value = this.grid[parseInt(y)][parseInt(x)];

    switch (value) {
      case -1:
        // TODO: should be game over
        cell.innerHTML = '💣';
        break;
      case 0:
        this.discoverArea(parseInt(y), parseInt(x));
      default:
        cell.innerHTML = value;
        cell.classList.add('clicked');
        break;
    }
  }


  /**
   * Discovers an larger area when users clicks on an empty
   * cell by opening all nearby empty cells and their
   * neighbours
   * @param startY initial Y position
   * @param startX initial X position
   */
  private discoverArea(startY: number, startX: number) {
    const toCheck = [[startY, startX]];
    const discovered: number[][] = [];
    const seen: Set<String> = new Set();

    const neighbours = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];

    while (toCheck.length) {
      const [y, x] = toCheck.shift() ?? [];
      const key = `${y}${x}`;

      if (seen.has(key)) {
        continue;
      }

      if (this.grid[y][x] === 0) {
        for (const [dy, dx] of neighbours) {
          if (y + dy >= 0 && y + dy < this.size && // y coordinates within field
            x + dx >= 0 && x + dx < this.size // x coordinates within field
          ) {
            toCheck.push([y + dy, x + dx]);
          }
        }
      }

      discovered.push([y, x]);
      seen.add(key);
    }

    for (const [y, x] of discovered) {
      const index = y * this.size + x;
      this.cellElems[index].classList.add('clicked');
      this.cellElems[index].innerHTML = this.grid[y][x];
    }
  }
}

export default Game;

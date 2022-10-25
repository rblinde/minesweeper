const POSSIBLE_NEIGHBOURS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

const matrix = (size: number, fill: any): number[][] =>
  Array.from({
    length: size
  }, () => new Array(size).fill(fill));

const randInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min));


class Game {
  boardElem: HTMLDivElement;
  cellElems: HTMLDivElement[];
  grid: number[][];
  bombs: number;
  bombLocations: number[][];
  size: number;
  isGameOver: boolean;

  constructor(bombs: number, size: number) {
    this.boardElem = <HTMLDivElement>document.querySelector('.board');
    this.bombs = bombs;
    this.size = size;
    this.isGameOver = false;

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
   * in the grid and stores them in bombLocations
   */
  private placeBombs() {
    const bombs: number[] = [];
    this.bombLocations = [];

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
      this.grid[y][x] = -1;
      this.bombLocations.push([y, x]);
    }
  }


  /**
   * Returns a list of neighbours of `y,x` where the
   * value in `this.grid` equals to `value` if set
   * @param y
   * @param x
   * @param value value to search for
   * @returns list of valid neighbours
   */
  private getValidNeighbours(y: number, x: number, value?: number): number[][] {
    const neighbours: number[][] = [];

    for (const [dy, dx] of POSSIBLE_NEIGHBOURS) {
      const isWithinXCoords = x + dx >= 0 && x + dx < this.size;
      const isWithinYCoords = y + dy >= 0 && y + dy < this.size;
      const hasValue = value !== undefined;

      if (isWithinXCoords && isWithinYCoords && (!hasValue || this.grid[y + dy][x + dx] === value)) {
        neighbours.push([y + dy, x + dx]);
      }
    }

    return neighbours;
  }


  /**
   * Return number of bombs in vicinity of y,x in grid
   * Returns -1 when current cell is a bomb
   * @param y
   * @param x
   * @returns number of bombs
   */
  private getBombsInVicinity(y: number, x: number): number {
    if (this.grid[y][x] === -1) {
      return -1;
    }

    return this.getValidNeighbours(y, x, -1).length;
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

    if (this.isGameOver) {
      return;
    }

    const cell = e.target as HTMLDivElement;
    const x = parseInt(cell.dataset.x ?? '');
    const y = parseInt(cell.dataset.y ?? '');

    if (isNaN(x) || isNaN(y)) {
      return;
    }

    const value = this.grid[y][x];

    switch (value) {
      case -1:
        this.endGame();
        break;
      case 0:
        this.discoverArea(y, x);
      default:
        this.activateCell(y, x, value);
        break;
    }
  }


  /**
   * End game when clicking on a bomb
   */
  endGame() {
    this.isGameOver = true;
    this.showAllBombs();
  }


  /**
   * Show all cells with bombs
   */
  showAllBombs() {
    for (const [y, x] of this.bombLocations) {
      this.activateCell(y, x, -1);
    }
  }


  /**
   * Discovers an larger area when users clicks on an
   * empty cell by opening all nearby empty cells and
   * their neighbours
   * @param startY initial Y position
   * @param startX initial X position
   */
  private discoverArea(startY: number, startX: number) {
    const toCheck = [[startY, startX]];
    const discovered: number[][] = [];
    const seen: Set<String> = new Set();

    while (toCheck.length) {
      const [y, x] = toCheck.shift() ?? [];
      const key = `${y}${x}`;
      discovered.push([y, x]);

      if (seen.has(key)) {
        continue;
      }

      if (this.grid[y][x] === 0) {
        const neighbours = this.getValidNeighbours(y, x);

        for (const neighbour of neighbours) {
          toCheck.push(neighbour);
        }
      }

      seen.add(key);
    }

    for (const [y, x] of discovered) {
      this.activateCell(y, x, this.grid[y][x]);
    }
  }


  /**
   * Shows cell value with proper color or bomb
   * emoji when value is equal to -1
   * @param y Y position
   * @param x X position
   * @param value value in grid[y][x]
   */
  private activateCell(y: number, x: number, value: number) {
    const index = y * this.size + x;
    const cell = this.cellElems[index];
    cell.classList.add('clicked');

    if (value === -1) {
      cell.innerHTML = '💣';
      return;
    }

    if (value > 0) {
      cell.innerHTML = value.toString();
      cell.dataset.value = value.toString();
    }
  }
}

export default Game;

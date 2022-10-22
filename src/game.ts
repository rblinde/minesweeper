type Grid = Array<Number> | Array<Grid>;

const matrix = (size: number, fill: any): Grid =>
  Array.from({
    length: size
  }, () => new Array(size).fill(fill));

const randInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min));


class Game {
  cellElems: HTMLDivElement[];
  grid: Grid;
  bombs: number;
  size: number;

  constructor(bombs: number, size: number) {
    this.cellElems = [...document.querySelectorAll('.cell')] as HTMLDivElement[];
    this.bombs = bombs;
    this.size = size;

    this.fillGrid();
    this.addEventListeners();

    // For dev purposes only
    this.displayGrid()
  }


  displayGrid() {
    for (let i = 0; i < this.cellElems.length; i++) {
      const y = Math.floor(i / this.size);
      const x = i % this.size;
      this.cellElems[i].innerHTML = this.grid[y][x];
      this.cellElems[i].classList.add('clicked');
    }
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


  addEventListeners() {
    this.cellElems.forEach(cell => cell.addEventListener('click', (e) => this.handleCellClick(e), false));
  }


  handleCellClick(e: MouseEvent) {
    e.preventDefault();

    const cell = e.target as HTMLDivElement;
    const index = this.cellElems.indexOf(cell);
    console.log(index);
  }
}

export default Game;

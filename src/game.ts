class Game {
  cellElems: HTMLDivElement[];

  constructor() {
    this.cellElems = [...document.querySelectorAll('.cell')] as HTMLDivElement[];

    this.addEventListeners();
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

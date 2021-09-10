const { input } = require('console-input');

class BombCell {
  static cellStates = {
    free: 0,
    bomb: 1,
    revealedFree: 2,
    revealedBomb: 3,
  };
  static cellStatesToConsole = {
    [this.cellStates.free]: 'H',
    [this.cellStates.bomb]: 'H',
    [this.cellStates.revealedFree]: 'F',
    [this.cellStates.revealedBomb]: 'X',
  };
  constructor() {
    this.state = BombCell.cellStates.free;
    this.adjacentBombs = 0;
  }
  getCellState() {
    return this.state;
  }
  setCellState(newState) {
    this.state = newState;
  }
  setAdjacentBombs (adjBombs) {
    this.adjacentBombs = adjBombs;
  }
  setBomb() {
    this.state = BombCell.cellStates.bomb;
  }
  isBomb () {
    return this.state === BombCell.cellStates.bomb;
  }
  reveal() {
    if (this.state === BombCell.cellStates.free) {
      this.state = BombCell.cellStates.revealedFree;
      return false;
    }
    if (this.state === BombCell.cellStates.bomb) {
      this.state = BombCell.cellStates.revealedBomb;
      return true;
    }
  }
}

class Minesweeper {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.bombs = 0;
    this.bombPositions = [];
    this.board = Array(rows).fill().map(() => Array(cols).fill());
  }
  // initialize the board
  async init (bombs) {
    if (!bombs || bombs <= 0 || bombs > this.rows * this.cols) {
      throw new Error(this.logFormat('error', 'Invalid number of bombs specified'));
    }
    for (let i = 0; i < this.rows; i += 1) {
      for (let j = 0; j < this.cols; j += 1) {
        this.board[i][j] = new BombCell();
      }
    }
    this.bombs = bombs;
    let bombsInserted = 0;
    while (bombsInserted != bombs) {
      let positionX = Math.floor(Math.random() * this.rows);
      let positionY = Math.floor(Math.random() * this.cols);
      if (this.board[positionX][positionY].isBomb()) {
        continue;
      }
      else {
        this.board[positionX][positionY].setBomb();
        this.bombPositions = this.bombPositions.concat({ x: positionX, y: positionY });
        // this.logFormat('info', `Inserted bomb at [${positionX} ${positionY}]`);
        bombsInserted += 1;
      }
      // await new Promise((resolve, reject) => setTimeout(resolve, 500));
    }
    this.bombPositions.forEach(({ x, y }) => {
      this.board[x][y].setAdjacentBombs(this.getAdjacentBombs(x, y));
    });
  }

  clickBoard(x, y) {
    let clickedCell = this.board[x][y];
    let wasBomb = clickedCell.reveal();
    this.drawBoard();
    if (wasBomb) {
      this.logFormat('info', 'Game Over. Boom!');
    }
    return wasBomb;
  }

  logFormat(logLevel, message) {
    console[logLevel]("Minesweeper: ".concat(message));
  }

  // get adjacent bombs
  getAdjacentBombs(x, y) {
    let adjBombs = 0;
    if (x - 1 >= 0 && y - 1 >= 0 && this.board[x - 1][y - 1].isBomb()) adjBombs += 1;
    if (x - 1 >= 0 && this.board[x - 1][y].isBomb()) adjBombs += 1;
    if (x - 1 >= 0 && y + 1 < this.cols && this.board[x - 1][y + 1].isBomb()) adjBombs += 1;
    if (y - 1 >= 0 && this.board[x][y - 1].isBomb()) adjBombs += 1;
    if (y + 1 < this.cols && this.board[x][y + 1].isBomb()) adjBombs += 1;
    if (x + 1 < this.rows && y - 1 >= 0 && this.board[x + 1][y - 1].isBomb()) adjBombs += 1;
    if (x + 1 < this.rows && this.board[x + 1][y].isBomb()) adjBombs += 1;
    if (x + 1 < this.rows && y + 1 < this.cols && this.board[x + 1][y + 1].isBomb()) adjBombs += 1;
    return adjBombs;
  }

  printBoard() {
    this.logFormat('info', 'Printing Current Board State');
    for (let i = 0; i < this.rows; i += 1) {
      console.log(...this.board[i]);
    }
  }

  printAdjBombs() {
    for (let i = 0; i < this.rows; i += 1) {
      console.log(...this.adjBombs[i]);
    }
  }

  drawBoard() {
    for (let i = 0; i < this.rows; i += 1) {
      console.log(...this.board[i].map(bc => BombCell.cellStatesToConsole[bc.getCellState()]));
    }
  }
}

(async function () {
  let gameOver = false;
  let percentageBombs = 0.5;
  let gameRows = 10, gameCols = 10;
  let randomNumberOfBombs = Math.floor(percentageBombs * Math.floor(Math.random() * gameRows * gameCols));
  while (randomNumberOfBombs <= 0) {
    randomNumberOfBombs = Math.floor(percentageBombs * Math.floor(Math.random() * gameRows * gameCols));
  }
  const game = new Minesweeper(gameRows, gameCols);
  game.logFormat('info', `Creating minesweeper [${gameRows}, ${gameCols}] with ${randomNumberOfBombs} bombs`);
  await game.init(randomNumberOfBombs);
  game.drawBoard();

  const inputChoice = input('Enter your option: \n1. Auto Play\n2. Manual\n Choice: ');
  const choice = parseInt(inputChoice, 10);
  if (![1, 2].includes(parseInt(choice, 10))) {
    throw new Error(game.logFormat('error', 'Invalid input'));
  }
  if (choice === 1) {
    while (!gameOver) {
      await new Promise((resolve, reject) => setTimeout(resolve, 1000));
      let rX = Math.floor(Math.random() * gameRows), rY = Math.floor(Math.random() * gameCols);
      game.logFormat('info', `Clicking on ${rX} ${rY} on board`);
      gameOver = game.clickBoard(rX, rY);
    }
  }
  if (choice === 2) {
    while (!gameOver) {
      await new Promise((resolve, reject) => setTimeout(resolve, 1000));
      let userPositions = input('Enter your positions (x,y). e.g. 1,2: ');
      let [rX, rY] = userPositions.split(',');
      game.logFormat('info', `Clicking on ${rX} ${rY} on board`);
      gameOver = game.clickBoard(rX, rY);
    }
  }
})();
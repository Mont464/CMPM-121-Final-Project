import "./style.css";
import { InternalBoard } from "./internalBoard.ts";
//INIT GLOBAL VARS==========================================================================================================================================

//instructions and game state string
let currentDay = 1;
let selectedSave = 0; //0, 1, 2
let topText = "";
let topTextFormat =
  "Use WASD to move the player. \n Use Arrow Keys to choose item. \n Use 'E' to use item. \n Use 'H' to harvest ";
topTextFormat +=
  "\nGrowth Rules: Plant needs to have at least 2 sun and 2 water, one neighbor of the same plant";
topTextFormat += "\n\n Day  " + currentDay + ".";
//player object
interface Player {
  x: number;
  y: number;
  seeds_inventory: string[];
  plants_inventory: string[];
  digitalCursorIndex: number;
}
//IMPORTANT: player's starting position (0, 0) is at the top left corner of the board
const player: Player = {
  x: 0,
  y: 0,
  seeds_inventory: ["corn kernels", "bean sprout", "tomato seeds"],
  plants_inventory: [],
  digitalCursorIndex: 0,
};

//cell object (replaced the string 2d array in internalBoard)
interface Cell {
  content: string;
  sun: number;
  water: number;
  x: number;
  y: number;
}

interface gameState {
  playerPlants: string[];
  playerSeeds: string[];
  playerX: number;
  playerY: number;
  currDay: number;
  width: number;
  height: number;
  grid: number[];
}

//board dimensions
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 10;

//create 2D "board" array
const board: string[][] = [];

let internalBoard = new InternalBoard(BOARD_WIDTH, BOARD_HEIGHT);
let allSaves0: gameState[] = [];
let redoSaves0: gameState[] = [];
let allSaves1: gameState[] = [];
let redoSaves1: gameState[] = [];
let allSaves2: gameState[] = [];
let redoSaves2: gameState[] = [];

//MAIN========================================================================================================================================================
function Start(): void {
  //init game state
  selectedSave = selectSaveFile();
  resetGameState();

  //load the most recently saved game state
  document.addEventListener("DOMContentLoaded", () => {
    loadGame();
  });

  //create reset button that calls displayBoard
  const buttonsDiv = document.createElement("div");
  const _app = document.getElementById("app")!;

  const resetButton = document.createElement("button");
  resetButton.innerHTML = "Reset";
  resetButton.onclick = resetGameState;
  resetButton.style.userSelect = "none"; // Disable text selection
  resetButton.style.cursor = "default"; // Disable text cursor
  buttonsDiv.appendChild(resetButton);

  //create button that passes time and calls passTime
  const passTimeButton = document.createElement("button");
  passTimeButton.innerHTML = "Sleep";
  passTimeButton.onclick = passTime;
  passTimeButton.style.userSelect = "none"; // Disable text selection
  passTimeButton.style.cursor = "default"; // Disable text cursor
  buttonsDiv.appendChild(passTimeButton);

  //create button that saves the game and calls saveGame
  const saveGameButton = document.createElement("button");
  saveGameButton.innerHTML = "Save";
  saveGameButton.style.userSelect = "none"; // Disable text selection
  saveGameButton.style.cursor = "default"; // Disable text cursor
  saveGameButton.addEventListener("click", () => {
    saveGame(internalBoard);
  });
  buttonsDiv.appendChild(saveGameButton);

  //create button that undoes the game state and calls undoGameState
  const undoButton = document.createElement("button");
  undoButton.innerHTML = "Undo";
  switch (selectedSave) {
    case 0:
      undoButton.onclick = () =>
        undoRedoGameState(allSaves0, redoSaves0, 0, "undo");
      break;
    case 1:
      undoButton.onclick = () =>
        undoRedoGameState(allSaves1, redoSaves1, 1, "undo");
      break;
    case 2:
      undoButton.onclick = () =>
        undoRedoGameState(allSaves2, redoSaves2, 2, "undo");
  }
  undoButton.style.userSelect = "none"; // Disable text selection
  undoButton.style.cursor = "default"; // Disable text cursor
  buttonsDiv.appendChild(undoButton);

  //create button that redoes the game state and calls redoGameState
  const redoButton = document.createElement("button");
  redoButton.innerHTML = "Redo";
  switch (selectedSave) {
    case 0:
      redoButton.onclick = () =>
        undoRedoGameState(allSaves0, redoSaves0, 0, "redo");
      break;
    case 1:
      redoButton.onclick = () =>
        undoRedoGameState(allSaves1, redoSaves1, 1, "redo");
      break;
    case 2:
      redoButton.onclick = () =>
        undoRedoGameState(allSaves2, redoSaves2, 2, "redo");
  }
  redoButton.style.userSelect = "none"; // Disable text selection
  redoButton.style.cursor = "default"; // Disable text cursor
  buttonsDiv.appendChild(redoButton);
  //if(app){
  document.body.appendChild(buttonsDiv);
  //}
}
//FUNCTIONS==================================================================================================================================================

function selectSaveFile(): number {
  const saveFile = prompt("Enter save file number (0, 1, 2): ");
  if (saveFile === null) {
    alert("No save file selected. Defaulting to save file 0.");
    return 0;
  }
  const saveFileNum = parseInt(saveFile);
  if (saveFileNum >= 0 && saveFileNum <= 2) {
    return saveFileNum;
  } else {
    alert("Invalid save file number. Defaulting to save file 0.");
    return 0;
  }
}

//call on initialize, and when game state should be reset
function resetGameState(): void {
  console.log("Game state reset.");
  currentDay = 1;
  switch (selectedSave) {
    case 0:
      allSaves0 = [];
      redoSaves0 = [];
      break;
    case 1:
      allSaves1 = [];
      redoSaves1 = [];
      break;
    case 2:
      allSaves2 = [];
      redoSaves2 = [];
  }
  topText = topTextFormat;
  player.x = 0;
  player.y = 0;
  player.seeds_inventory = ["corn kernels", "bean sprout", "tomato seeds"];
  player.plants_inventory = [];
  //clear the external board
  for (let i = 0; i < BOARD_HEIGHT; i++) {
    board[i] = [];
    for (let j = 0; j < BOARD_WIDTH; j++) {
      //if (i === 0 && j === 0) board[i][j] = "[_P_]";
      /**else**/ board[i][j] = "[__]";
    }
  }
  //create cells for the internal board
  for (let i = 0; i < BOARD_HEIGHT; i++) {
    for (let j = 0; j < BOARD_WIDTH; j++) {
      const cell = { content: "", sun: 0, water: 0, x: j, y: i };
      if (i === 0 && j === 0) cell.content = "🧍";
      internalBoard.setCell(j, i, cell);
    }
  }
  randomizeSunAndWater();
  //saveGame(internalBoard);
  displayBoard();
  updateDay();
}

//displayBoard helper function, creates the table
function createTable(table: HTMLTableElement): void {
  //create the rows
  for (let i = 0; i < BOARD_HEIGHT; i++) {
    const tr = document.createElement("tr");
    table.appendChild(tr);

    //create the columns
    for (let j = 0; j < BOARD_WIDTH; j++) {
      const td = document.createElement("td");
      const cellContent = internalBoard.getCell(j, i).content;
      if (cellContent && cellContent != "") {
        td.innerHTML = "[" + cellContent + "]";
      } else {
        if ((i != player.y || j != player.x) && board[i][j] == "[🧍]")
          td.innerHTML = "[__]";
        else td.innerHTML = board[i][j];
      }
      td.style.userSelect = "none"; // Disable text selection
      td.style.cursor = "default"; // Disable text cursor
      tr.appendChild(td);
    }
  }
}

//call whenever the screen should be refreshed to reflect the current game state
function displayBoard(): void {
  //grab HTML element
  const app = document.getElementById("app");
  if (app === null) throw new Error("App element not found");
  else {
    //clear the board
    app.innerHTML = "";
    app.style.userSelect = "none"; // Disable text selection
    app.style.cursor = "default"; // Disable text cursor
    app.style.display = "flex"; // Use flexbox
    app.style.flexDirection = "column"; // Arrange children in a column
    app.style.alignItems = "center"; // Center horizontally
    app.style.justifyContent = "center"; // Center vertically
    app.style.height = "100vh"; // Full viewport height

    //add header with instructions
    const headerInstructions = document.createElement("h2");
    headerInstructions.innerHTML = topText;
    headerInstructions.style.userSelect = "none"; // Disable text selection
    headerInstructions.style.cursor = "default"; // Disable text cursor
    app.prepend(headerInstructions);

    //add header with info on cell's water and sun
    const playerCell = internalBoard.getCell(player.x, player.y);
    const headerCellInfo = document.createElement("h3");
    const s = playerCell.sun;
    const w = playerCell.water;
    headerCellInfo.innerHTML = `Sun: ${s}     Water: ${w}`;
    headerCellInfo.style.userSelect = "none"; // Disable text selection
    headerCellInfo.style.cursor = "default"; // Disable text cursor
    app.append(headerCellInfo);

    //add body text with player inventory
    const body = document.createElement("p");
    let inventoryString = " Seed Inventory: "; //Placable Plant options
    for (let i = 0; i < player.seeds_inventory.length; i++) {
      if (i === player.digitalCursorIndex) inventoryString += ">";
      inventoryString += player.seeds_inventory[i];
      if (i !== player.seeds_inventory.length - 1) inventoryString += ", ";
    }
    inventoryString += "\n Plant Inventory: "; //Harvested plant display to show progress towards win
    for (let i = 0; i < player.plants_inventory.length; i++) {
      if (i === player.digitalCursorIndex) inventoryString += ">";
      inventoryString += player.plants_inventory[i];
      if (i !== player.plants_inventory.length - 1) inventoryString += ", ";
    }

    body.innerHTML = inventoryString;
    body.style.userSelect = "none"; // Disable text selection
    body.style.cursor = "default"; // Disable text cursor
    app.append(body);

    //create the table
    const table = document.createElement("table");

    //add the table to the app
    app.appendChild(table);

    createTable(table);
  }
}

// Helper function to remove instances of "🧍" from a string
function removePlayerEmoji(cell: string): string {
  return cell.replace(/🧍/g, "");
}

function removePlayerMarker(x: number, y: number) {
  const newContent = removePlayerEmoji(internalBoard.getCell(x, y).content);
  internalBoard.setContent(x, y, newContent);
}

function movePlayer(moveDirection: string): void {
  // Clear the current player cell
  board[player.y][player.x] = "[__]";
  removePlayerMarker(player.x, player.y);

  switch (moveDirection) {
    case "up":
      if (player.y > 0) {
        player.y--;
      }
      break;
    case "down":
      if (player.y < BOARD_HEIGHT - 1) {
        player.y++;
      }
      break;
    case "left":
      if (player.x > 0) {
        player.x--;
      }
      break;
    case "right":
      if (player.x < BOARD_WIDTH - 1) {
        player.x++;
      }
      break;
  }

  // After moving, update the new position with the player representation
  board[player.y][player.x] = "[🧍]";
  internalBoard.appendContent(player.x, player.y, "🧍");

  displayBoard(); // Refresh the display after moving
}

//call on arrow key input
function handleDigitalCursor(direction: boolean): void {
  //direction: true is right, false is left
  if (direction) {
    if (player.digitalCursorIndex < player.seeds_inventory.length - 1) {
      player.digitalCursorIndex++;
    }
  } else {
    if (player.digitalCursorIndex > 0) player.digitalCursorIndex--;
  }
  displayBoard();
}

//call on space bar input
function useItem(): void {
  const item = player.seeds_inventory[player.digitalCursorIndex];
  let itemText: string[] = [];
  switch (item) {
    case "corn kernels":
      itemText = ["corn", "🌿"];
      break;
    case "bean sprout":
      itemText = ["beans", "🌱"];
      break;
    case "tomato seeds":
      itemText = ["tomatoes", "🥬"];
      break;
  }
  console.log("You planted " + itemText[0] + "!");
  internalBoard.appendContent(player.x, player.y, itemText[1]);

  displayBoard();
  saveGame(internalBoard);
}

function updateDay(): void {
  topText = "Use WASD to move the player. Day " + currentDay + ".";
  displayBoard();
}

//call on sleep button input
function passTime(): void {
  currentDay++;
  randomizeSunAndWater();
  growPlants();
  topText = "Use WASD to move the player. Day " + currentDay + ".";
  displayBoard();
  saveGame(internalBoard);
}

// call whenever player passes the time
function growPlants(): void {
  const growthStages: { [key: string]: string } = {
    "🌿": "🌾",
    "🌾": "🌽",
    "🌱": "🫛",
    "🫛": "🫘",
    "🥬": "🌼",
    "🌼": "🍅",
  };

  for (let i = 0; i < BOARD_HEIGHT; i++) {
    for (let j = 0; j < BOARD_WIDTH; j++) {
      const cell = internalBoard.getCell(j, i);
      if (
        cell.sun >= 2 &&
        cell.water >= 2 &&
        hasNeighbor(cell, cell.content.replace("🧍", ""))
      ) {
        const hasPlayer = cell.content.includes("🧍");
        const cellContentNoPlayer = cell.content.replace("🧍", "");

        const cellContent =
          growthStages[cellContentNoPlayer] || cellContentNoPlayer;
        cell.content = hasPlayer ? cellContent + "🧍" : cellContent;
        cell.water--; // reduce cell water by two for growing plant
        internalBoard.setCell(j, i, cell);
      }
    }
  }
}

//check neighbor of cell.
function hasNeighbor(cell: Cell, plant: string): boolean {
  const directions = [
    { dx: -1, dy: -1 }, // Top-left
    { dx: 0, dy: -1 }, // Top
    { dx: 1, dy: -1 }, // Top-right
    { dx: -1, dy: 0 }, // Left
    { dx: 1, dy: 0 }, // Right
    { dx: -1, dy: 1 }, // Bottom-left
    { dx: 0, dy: 1 }, // Bottom
    { dx: 1, dy: 1 }, // Bottom-right
  ];

  const rows = BOARD_HEIGHT;
  const cols = BOARD_WIDTH;

  //Check each neighbor for the same plant
  for (const { dx, dy } of directions) {
    const X = cell.x + dx;
    const Y = cell.y + dy;

    if (X >= 0 && X < cols && Y >= 0 && Y < rows) {
      if (internalBoard.getCell(X, Y).content[0] === plant[0]) {
        return true;
      }
    }
  }

  return false;
}

// call whenever player passes the time
function randomizeSunAndWater(): void {
  for (let i = 0; i < BOARD_HEIGHT; i++) {
    for (let j = 0; j < BOARD_WIDTH; j++) {
      const cell = internalBoard.getCell(j, i);

      cell.sun = Math.floor(Math.random() * 3) + 1;

      const waterIncrease = Math.floor(Math.random() * 3);
      cell.water += waterIncrease;
      cell.water = Math.min(cell.water, 10);
      internalBoard.setCell(j, i, cell);
    }
  }
}

//Remove fully grown plant from grid and check for win condition
function harvest() {
  const cell = internalBoard.getCell(player.x, player.y);
  switch (cell.content) {
    case "🌽🧍":
      cell.content = "";
      player.plants_inventory.push("corn");
      break;
    case "🫘🧍":
      cell.content = "";
      player.plants_inventory.push("beans");
      break;
    case "🍅🧍":
      cell.content = "";
      player.plants_inventory.push("tomato");
      break;
  }

  if (player.plants_inventory.length > 5) {
    alert("You win!");
    resetGameState();
  }

  internalBoard.setCell(player.x, player.y, cell);
  displayBoard();
  saveGame(internalBoard);
}

//input handling
document.onkeydown = function (e) {
  switch (e.key) {
    case "w":
      movePlayer("up");
      break;
    case "s":
      movePlayer("down");
      break;
    case "a":
      movePlayer("left");
      break;
    case "d":
      movePlayer("right");
      break;
    case "ArrowLeft":
      handleDigitalCursor(false);
      break;
    case "ArrowRight":
      handleDigitalCursor(true);
      break;
    case "h":
      harvest();
      break;
    case "e":
      if (
        internalBoard.getCell(player.x, player.y).content == "" ||
        internalBoard.getCell(player.x, player.y).content == "🧍"
      ) {
        useItem();
        break;
      }
  }
};

function undoRedoGameState(
  allSaves: gameState[],
  redoSaves: gameState[],
  selectedSave: number,
  undoRedoSelection: string
) {
  if (allSaves.length > 1) {
    let save: gameState | undefined;

    if (undoRedoSelection == "undo") {
      save = allSaves.pop();
      if (save) {
        redoSaves.push(save);
      }
    } else if (undoRedoSelection == "redo") {
      save = redoSaves.pop();
      if (save) {
        allSaves.push(save);
      }
    }

    if (save) {
      switch (selectedSave) {
        case 0:
          localStorage.setItem("gameSaves0", JSON.stringify(allSaves));
          localStorage.setItem("redoSaves0", JSON.stringify(redoSaves));
          break;
        case 1:
          localStorage.setItem("gameSaves1", JSON.stringify(allSaves));
          localStorage.setItem("redoSaves1", JSON.stringify(redoSaves));
          break;
        case 2:
          localStorage.setItem("gameSaves2", JSON.stringify(allSaves));
          localStorage.setItem("redoSaves2", JSON.stringify(redoSaves));
          break;
      }
      loadGame();
      console.log(undoRedoSelection + "!");
    }
  }
}

function saveGame(board: InternalBoard) {
  const gameState: gameState = {
    playerPlants: player.plants_inventory,
    playerSeeds: player.seeds_inventory,
    playerX: player.x,
    playerY: player.y,
    currDay: currentDay,
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    grid: Array.from(board.getCells()), // Convert Uint8Array to a regular array
  };
  switch (selectedSave) {
    case 0:
      allSaves0.push(gameState);
      localStorage.setItem("gameSaves0", JSON.stringify(allSaves0));
      break;
    case 1:
      allSaves1.push(gameState);
      localStorage.setItem("gameSaves1", JSON.stringify(allSaves1));
      break;
    case 2:
      allSaves2.push(gameState);
      localStorage.setItem("gameSaves2", JSON.stringify(allSaves2));
      break;
  }
  console.log("Game saved!");
}

function loadGame() {
  let gameSaves = null;
  let rSaves = null;
  switch (selectedSave) {
    case 0:
      gameSaves = localStorage.getItem("gameSaves0");
      rSaves = localStorage.getItem("redoSaves0");
      break;
    case 1:
      gameSaves = localStorage.getItem("gameSaves1");
      rSaves = localStorage.getItem("redoSaves1");
      break;
    case 2:
      gameSaves = localStorage.getItem("gameSaves2");
      rSaves = localStorage.getItem("redoSaves2");
      break;
  }

  if (gameSaves) {
    const savesToLoad = JSON.parse(gameSaves); // savesToLoad = parsed array of game states
    if (rSaves) {
      const redoSavesToLoad = JSON.parse(rSaves);
      switch (selectedSave) {
        case 0:
          if (redoSavesToLoad) redoSaves0 = redoSavesToLoad;
          break;
        case 1:
          if (redoSavesToLoad) redoSaves1 = redoSavesToLoad;
          break;
        case 2:
          if (redoSavesToLoad) redoSaves2 = redoSavesToLoad;
      }
    }
    if (savesToLoad) {
      const gameState = savesToLoad[savesToLoad.length - 1]; // gameState = first item of parsed array of game states
      player.plants_inventory = gameState.playerPlants;
      if (gameState.playerSeeds != undefined)
        player.seeds_inventory = gameState.playerSeeds;
      player.x = gameState.playerX;
      player.y = gameState.playerY;
      currentDay = gameState.currDay;

      topTextFormat =
        "Use WASD to move the player. \n Use Arrow Keys to choose item. \n Use 'E' to use item. \n Use 'H' to harvest ";
      topTextFormat +=
        "\nGrowth Rules: Plant needs to have at least 2 sun and 2 water, one neighbor of the same plant";
      topTextFormat += "\n\n Day  " + currentDay + ".";
      switch (selectedSave) {
        case 0:
          allSaves0 = savesToLoad;
          break;
        case 1:
          allSaves1 = savesToLoad;
          break;
        case 2:
          allSaves2 = savesToLoad;
      }
      internalBoard = new InternalBoard(gameState.width, gameState.height);
      internalBoard.setCells(new Uint8Array(gameState.grid)); // Convert back to Uint8Array
      updateDay();
      displayBoard();

      console.log("Game loaded");
    } else {
      alert("Parsing unsuccessful");
    }
  } else {
    alert("No game saves to load");
  }
}

//Main Call================================================================================================================================================
Start(); //main call

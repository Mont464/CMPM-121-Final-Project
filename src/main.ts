import "./style.css";

//INIT GLOBAL VARS==========================================================================================================================================

//instructions and game state string
let currentDay = 1;
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

//create 2D "board" array
const board: string[][] = [];
const internalBoard: Cell[][] = [];

//board dimensions
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 10;

//MAIN========================================================================================================================================================
function Start(): void {
  //init game state
  resetGameState();

  //create reset button that calls displayBoard
  const resetButton = document.createElement("button");
  resetButton.innerHTML = "Reset";
  resetButton.onclick = resetGameState;
  resetButton.style.userSelect = "none"; // Disable text selection
  resetButton.style.cursor = "default"; // Disable text cursor
  document.body.appendChild(resetButton);

  //create button that passes time and calls passTime
  const passTimeButton = document.createElement("button");
  passTimeButton.innerHTML = "Sleep";
  passTimeButton.onclick = passTime;
  passTimeButton.style.userSelect = "none"; // Disable text selection
  passTimeButton.style.cursor = "default"; // Disable text cursor
  document.body.appendChild(passTimeButton);
}

//FUNCTIONS==================================================================================================================================================

//call on initialize, and when game state should be reset
function resetGameState(): void {
  console.log("Game state reset.");
  currentDay = 1;
  topText = topTextFormat;
  player.x = 0;
  player.y = 0;
  player.seeds_inventory = ["corn kernels", "bean sprout", "tomato seeds"];
  player.plants_inventory = [];
  //clear the board
  for (let i = 0; i < BOARD_HEIGHT; i++) {
    board[i] = [];
    for (let j = 0; j < BOARD_WIDTH; j++) {
      if (i === 0 && j === 0) board[i][j] = "[_P_]";
      else board[i][j] = "[___]";
    }
  }
  internalBoard.length = 0;
  for (let i = 0; i < BOARD_HEIGHT; i++) {
    const row: Cell[] = [];
    for (let j = 0; j < BOARD_WIDTH; j++) {
      row.push({ content: "", sun: 0, water: 0, x: j, y: i });
    }
    internalBoard.push(row);
  }
  randomizeSunAndWater();
  displayBoard();
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
      if (internalBoard[i][j].content && internalBoard[i][j].content != "") {
        td.innerHTML = "[_" + internalBoard[i][j].content + "_]";
      } else td.innerHTML = board[i][j];
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
    const playerCell = internalBoard[player.y][player.x];
    const headerCellInfo = document.createElement("h3");
    const s = playerCell.sun;
    const w = playerCell.water;
    headerCellInfo.innerHTML = `Sun: ${s}     Water: ${w}`;
    headerCellInfo.style.userSelect = "none"; // Disable text selection
    headerCellInfo.style.cursor = "default"; // Disable text cursor
    app.append(headerCellInfo);

    //add body text with player inventory
    const body = document.createElement("p");
    let inventoryString = " Seed Inventory: ";
    for (let i = 0; i < player.seeds_inventory.length; i++) {
      if (i === player.digitalCursorIndex) inventoryString += ">";
      inventoryString += player.seeds_inventory[i];
      if (i !== player.seeds_inventory.length - 1) inventoryString += ", ";
    }
    inventoryString += "\n Plant Inventory: ";
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

// Helper function to remove instances of "P" from a string
function removePlayerMarker(cell: string): string {
  return cell.replace(/P/g, "");
}

//call on WASD input
function movePlayer(dir: string): void {
  switch (dir) {
    case "up":
      if (player.y > 0) {
        board[player.y][player.x] = "[___]";
        internalBoard[player.y][player.x].content = removePlayerMarker(
          internalBoard[player.y][player.x].content,
        );
        player.y--;
        board[player.y][player.x] = "[_P_]";
        internalBoard[player.y][player.x].content += "P";
      }
      break;
    case "down":
      if (player.y < BOARD_HEIGHT - 1) {
        board[player.y][player.x] = "[___]";
        internalBoard[player.y][player.x].content = removePlayerMarker(
          internalBoard[player.y][player.x].content,
        );
        player.y++;
        board[player.y][player.x] = "[_P_]";
        internalBoard[player.y][player.x].content += "P";
      }
      break;
    case "left":
      if (player.x > 0) {
        board[player.y][player.x] = "[___]";
        internalBoard[player.y][player.x].content = removePlayerMarker(
          internalBoard[player.y][player.x].content,
        );
        player.x--;
        board[player.y][player.x] = "[_P_]";
        internalBoard[player.y][player.x].content += "P";
      }
      break;
    case "right":
      if (player.x < BOARD_WIDTH - 1) {
        board[player.y][player.x] = "[___]";
        internalBoard[player.y][player.x].content = removePlayerMarker(
          internalBoard[player.y][player.x].content,
        );
        player.x++;
        board[player.y][player.x] = "[_P_]";
        internalBoard[player.y][player.x].content += "P";
      }
      break;
  }
  displayBoard();
}

//call on arrow key input
function handleDigitalCursor(dir: boolean): void {
  //true is right, false is left
  if (dir) {
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
  console.log("Used " + player.seeds_inventory[player.digitalCursorIndex]);
  const item = player.seeds_inventory[player.digitalCursorIndex];
  //Uncomment to deacrease item, infinite items for now.
  //player.inventory.splice(player.digitalCursorIndex, 1);
  //if(player.digitalCursorIndex > 0) player.digitalCursorIndex--;
  switch (item) {
    case "corn kernels":
      console.log("You planted corn!");
      internalBoard[player.y][player.x].content += "C1";
      break;
    case "bean sprout":
      console.log("You planted beans!");
      internalBoard[player.y][player.x].content += "B1";
      break;
    case "tomato seeds":
      console.log("You planted tomatoes!");
      internalBoard[player.y][player.x].content += "T1";
      break;
  }
  displayBoard();
}

//call on sleep button input
function passTime(): void {
  currentDay++;
  randomizeSunAndWater();
  growPlants();
  topText = "Use WASD to move the player. Day " + currentDay + ".";
  displayBoard();
}

// call whenever player passes the time
function growPlants(): void {
  const growthStages: { [key: string]: string } = {
    C1: "C2",
    C2: "C3",
    B1: "B2",
    B2: "B3",
    T1: "T2",
    T2: "T3",
  };

  internalBoard.forEach((row) => {
    row.forEach((cell) => {
      if (
        cell.sun >= 2 &&
        cell.water >= 2 &&
        hasNeighbor(cell, cell.content.replace("P", ""))
      ) {
        const hasPlayer = cell.content.includes("P");
        const cellContentNoPlayer = cell.content.replace("P", "");

        const cellContent = growthStages[cellContentNoPlayer] || 
        cellContentNoPlayer;
        cell.content = hasPlayer ? cellContent + "P" : cellContent;
        cell.water--; // reduce cell water by two for growing plant
      }
    });
  });
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

  const rows = internalBoard.length;
  const cols = internalBoard[0].length;

  for (const { dx, dy } of directions) {
    const X = cell.x + dx;
    const Y = cell.y + dy;

    if (X >= 0 && X < cols && Y >= 0 && Y < rows) {
      if (internalBoard[Y][X].content[0] === plant[0]) {
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
      const cell = internalBoard[i][j];

      cell.sun = Math.floor(Math.random() * 3) + 1;

      const waterIncrease = Math.floor(Math.random() * 3);
      cell.water += waterIncrease;
      cell.water = Math.min(cell.water, 10);
    }
  }
}

function harvest() {
  const cell = internalBoard[player.y][player.x];
  if (cell.content.indexOf("3") >= 0) {
    switch (cell.content[0]) {
      case "C":
        cell.content = "";
        player.plants_inventory.push("corn");
        break;
      case "B":
        cell.content = "";
        player.plants_inventory.push("beans");
        break;
      case "T":
        cell.content = "";
        player.plants_inventory.push("tomato");
        break;
    }
    if (player.plants_inventory.length > 5) {
      alert("You win!");
      resetGameState();
    }
    displayBoard();
  }
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
        internalBoard[player.y][player.x].content == "" ||
        internalBoard[player.y][player.x].content == "P"
      ) {
        useItem();
        break;
      }
  }
};

//Main Call================================================================================================================================================
Start(); //main call

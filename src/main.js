import "./style.css";  // Keep this if the target environment supports ES modules
import { InternalBoard } from "./internalBoard.js";  // Change .ts to .js for JavaScript file extension

// INIT GLOBAL VARS
let currentDay = 1;
let selectedSave = 0; // 0, 1, 2
let topText = "";
let topTextFormat =
  "Use WASD to move the player. \n Use Arrow Keys to choose item. \n Use 'E' to use item. \n Use 'H' to harvest ";
topTextFormat +=
  "\nGrowth Rules: Plant needs to have at least 2 sun and 2 water, one neighbor of the same plant";
topTextFormat += "\n\n Day  " + currentDay + ".";

// player object
const player = {
  x: 0,
  y: 0,
  seeds_inventory: ["corn kernels", "bean sprout", "tomato seeds"],
  plants_inventory: [],
  digitalCursorIndex: 0,
};

// cell object
const board = [];
let internalBoard = new InternalBoard(10, 10);
let allSaves0 = [];
let redoSaves0 = [];
let allSaves1 = [];
let redoSaves1 = [];
let allSaves2 = [];
let redoSaves2 = [];

// MAIN
function Start() {
  selectedSave = selectSaveFile();
  resetGameState();
  document.addEventListener("DOMContentLoaded", () => {
      loadGame();
  });

  const buttonsDiv = document.createElement("div");
  const _app = document.getElementById("app");
  const resetButton = document.createElement("button");
  resetButton.innerHTML = "Reset";
  resetButton.onclick = resetGameState;
  resetButton.style.userSelect = "none"; 
  resetButton.style.cursor = "default"; 
  buttonsDiv.appendChild(resetButton);

  const passTimeButton = document.createElement("button");
  passTimeButton.innerHTML = "Sleep";
  passTimeButton.onclick = passTime;
  passTimeButton.style.userSelect = "none"; 
  passTimeButton.style.cursor = "default"; 
  buttonsDiv.appendChild(passTimeButton);

  const saveGameButton = document.createElement("button");
  saveGameButton.innerHTML = "Save";
  saveGameButton.style.userSelect = "none"; 
  saveGameButton.style.cursor = "default"; 
  saveGameButton.addEventListener("click", () => {
    saveGame(internalBoard);
  });
  buttonsDiv.appendChild(saveGameButton);

  const undoButton = document.createElement("button");
  undoButton.innerHTML = "Undo";
  switch(selectedSave){
    case 0:
      undoButton.onclick = () => undoGameState(allSaves0, redoSaves0, 0);
      break;
    case 1:
      undoButton.onclick = () => undoGameState(allSaves1, redoSaves1, 1);
      break;
    case 2:
      undoButton.onclick = () => undoGameState(allSaves2, redoSaves2, 2);
  }
  undoButton.style.userSelect = "none"; 
  undoButton.style.cursor = "default"; 
  buttonsDiv.appendChild(undoButton);

  const redoButton = document.createElement("button");
  redoButton.innerHTML = "Redo";
  switch(selectedSave){
    case 0:
      redoButton.onclick = () => redoGameState(allSaves0, redoSaves0, 0);
      break;
    case 1:
      redoButton.onclick = () => redoGameState(allSaves1, redoSaves1, 1);
      break;
    case 2:
      redoButton.onclick = () => redoGameState(allSaves2, redoSaves2, 2);
  }
  redoButton.style.userSelect = "none"; 
  redoButton.style.cursor = "default"; 
  buttonsDiv.appendChild(redoButton);
  
  document.body.appendChild(buttonsDiv);
}

// FUNCTIONS
function selectSaveFile() {
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

function resetGameState() {
  console.log("Game state reset.");
  currentDay = 1;
  switch(selectedSave){
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
  
  for (let i = 0; i < 10; i++) {
    board[i] = [];
    for (let j = 0; j < 10; j++) {
      board[i][j] = "[__]";
    }
  }

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const cell = { content: "", sun: 0, water: 0, x: j, y: i };
      if (i === 0 && j === 0) cell.content = "🧍";
      internalBoard.setCell(j,i,cell);
    }
  }
  randomizeSunAndWater();
  displayBoard();
  updateDay();
}

// (The rest of the converted functions would follow a similar pattern)

// Main Call
Start();
import "./style.css";

//INIT GLOBAL VARS==========================================================================================================================================

//player object
interface Player {
    x: number;
    y: number;
    inventory: string[];
}
//IMPORTANT: player's starting position (0, 0) is at the top left corner of the board
const player: Player = {x: 0, y: 0, inventory: []};

//create 2D "board" array
const board: string[][] = [];

//board dimensions
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 10;


//MAIN========================================================================================================================================================
function Start(): void {
    clearDisplayBoard();
    //create reset button that calls displayBoard
    const resetButton = document.createElement("button");
    resetButton.innerHTML = "Reset";
    resetButton.onclick = clearDisplayBoard;
    resetButton.style.userSelect = "none"; // Disable text selection
    resetButton.style.cursor = "default"; // Disable text cursor
    document.body.appendChild(resetButton);
}

//FUNCTIONS==================================================================================================================================================

//call on initialize, and when game state should be reset
function clearDisplayBoard(): void {
    //clear the board
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if(i === 0 && j === 0) board[i][j] = "[_P_]";
            else board[i][j] = "[___]";
        }
    }
    displayBoard();
}

//call whenever the screen should be refreshed to reflect the current game state
function displayBoard(): void {
    //grab HTML element
    const app = document.getElementById("app");
    if(app === null) throw new Error("App element not found");
    else {
        //clear the board
        app.innerHTML = "";
        app.style.userSelect = "none"; // Disable text selection
        app.style.cursor = "default"; // Disable text cursor

        //add header with instructions
        const header = document.createElement("h2");
        header.innerHTML = "Use WASD to move the player";
        header.style.userSelect = "none"; // Disable text selection
        header.style.cursor = "default"; // Disable text cursor
        app.prepend(header);

        //create the table
        const table = document.createElement("table");

        //add the table to the app
        app.appendChild(table);

        //create the rows
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            const tr = document.createElement("tr");
            table.appendChild(tr);

            //create the columns
            for (let j = 0; j < BOARD_WIDTH; j++) {
                const td = document.createElement("td");
                td.innerHTML = board[i][j];
                td.style.userSelect = "none"; // Disable text selection
                td.style.cursor = "default"; // Disable text cursor
                tr.appendChild(td);
            }
        }
    }
}

//call on player input
function movePlayer(dir: string): void {
    switch (dir) {
        case "up":
            if(player.y > 0) {
                board[player.y][player.x] = "[___]";
                player.y--;
                board[player.y][player.x] = "[_P_]";
            }
            break;
        case "down":
            if(player.y < BOARD_HEIGHT - 1) {
                board[player.y][player.x] = "[___]";
                player.y++;
                board[player.y][player.x] = "[_P_]";
            }
            break;
        case "left":
            if(player.x > 0) {
                board[player.y][player.x] = "[___]";
                player.x--;
                board[player.y][player.x] = "[_P_]";
            }
            break;
        case "right":
            if(player.x < BOARD_WIDTH - 1) {
                board[player.y][player.x] = "[___]";
                player.x++;
                board[player.y][player.x] = "[_P_]";
            }
            break;
    }
    displayBoard();
}

//input handling
document.onkeydown = function(e) {
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
    }
};


//Main Call================================================================================================================================================
Start();//main call
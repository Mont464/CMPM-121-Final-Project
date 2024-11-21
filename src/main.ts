import "./style.css";

//INIT GLOBAL VARS==========================================================================================================================================

//instructions and game state string
let currentDay = 1;
let topText = "";
const topTextFormat = "Use WASD to move the player. \n Use Arrow Keys to choose item. \n Use E to use item. \n Day  " + currentDay + ".";

//player object
interface Player {
    x: number;
    y: number;
    inventory: string[];
    digitalCursorIndex: number;
}
//IMPORTANT: player's starting position (0, 0) is at the top left corner of the board
const player: Player = {x: 0, y: 0, inventory: ["corn kernels", "bean sprout", "tomato seeds"], digitalCursorIndex: 0};

//create 2D "board" array
const board: string[][] = [];
const internalBoard: string[][] = [];

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
    player.inventory = ["corn kernels", "bean sprout", "tomato seeds"];
    //clear the board
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if(i === 0 && j === 0) board[i][j] = "[_P_]";
            else board[i][j] = "[___]";
        }
    }
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        internalBoard[i] = [];
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if(i === 0 && j === 0) internalBoard[i][j] = "P";
            else internalBoard[i][j] = "";
        }
    }
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
            if(internalBoard[i][j] && internalBoard[i][j] != "") td.innerHTML = "[_" + internalBoard[i][j] + "_]";
            else td.innerHTML = board[i][j];
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
    if(app === null) throw new Error("App element not found");
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
        const header = document.createElement("h2");
        header.innerHTML = topText;
        header.style.userSelect = "none"; // Disable text selection
        header.style.cursor = "default"; // Disable text cursor
        app.prepend(header);

        //add body text with player inventory
        const body = document.createElement("p");
        let inventoryString = "Inventory: ";
        for (let i = 0; i < player.inventory.length; i++) {
            if(i === player.digitalCursorIndex) inventoryString += ">";
            inventoryString += player.inventory[i];
            if(i !== player.inventory.length - 1) inventoryString += ", ";
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
            if(player.y > 0) {
                board[player.y][player.x] = "[___]";
                internalBoard[player.y][player.x] = removePlayerMarker(internalBoard[player.y][player.x]);
                player.y--;
                board[player.y][player.x] = "[_P_]";
                internalBoard[player.y][player.x] += "P";
            }
            break;
        case "down":
            if(player.y < BOARD_HEIGHT - 1) {
                board[player.y][player.x] = "[___]";
                internalBoard[player.y][player.x] = removePlayerMarker(internalBoard[player.y][player.x]);
                player.y++;
                board[player.y][player.x] = "[_P_]";
                internalBoard[player.y][player.x] += "P";
            }
            break;
        case "left":
            if(player.x > 0) {
                board[player.y][player.x] = "[___]";
                internalBoard[player.y][player.x] = removePlayerMarker(internalBoard[player.y][player.x]);
                player.x--;
                board[player.y][player.x] = "[_P_]";
                internalBoard[player.y][player.x] += "P";
            }
            break;
        case "right":
            if(player.x < BOARD_WIDTH - 1) {
                board[player.y][player.x] = "[___]";
                internalBoard[player.y][player.x] = removePlayerMarker(internalBoard[player.y][player.x]);
                player.x++;
                board[player.y][player.x] = "[_P_]";
                internalBoard[player.y][player.x] += "P";
            }
            break;
    }
    displayBoard();
}

//call on arrow key input
function handleDigitalCursor(dir: boolean): void {//true is right, false is left
    if(dir) {
        if(player.digitalCursorIndex < player.inventory.length - 1) player.digitalCursorIndex++;
    } else {
        if(player.digitalCursorIndex > 0) player.digitalCursorIndex--;
    }
    displayBoard();
}

//call on space bar input
function useItem(): void {
    console.log("Used " + player.inventory[player.digitalCursorIndex]);
    const item = player.inventory[player.digitalCursorIndex];
    player.inventory.splice(player.digitalCursorIndex, 1);
    if(player.digitalCursorIndex > 0) player.digitalCursorIndex--;
    switch (item) {
        case "corn kernels":
            console.log("You planted corn!");
            internalBoard[player.y][player.x] += "c";
            break;
        case "bean sprout":
            console.log("You planted beans!");
            internalBoard[player.y][player.x] += "b";
            break;
        case "tomato seeds":
            console.log("You planted tomatoes!");
            internalBoard[player.y][player.x] += "t";
            break;
    }
    displayBoard();
}

//call on sleep button input
function passTime(): void {
    currentDay++;
    topText = "Use WASD to move the player. Day " + currentDay + ".";
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
        case "ArrowLeft":
            handleDigitalCursor(false);
            break;
        case "ArrowRight":
            handleDigitalCursor(true);
            break;
        case "e":
            useItem();
            break;
    }
};




//Main Call================================================================================================================================================
Start();//main call
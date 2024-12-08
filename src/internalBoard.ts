interface Cell {
    content: string;
    sun: number;
    water: number;
    x: number;
    y: number;
  }

// Contiguous byte array for storing state of the board
export class InternalBoard {
    private cells: Uint8Array;
    private width: number;
    private height: number;
    // Bytes per cell
    private cellSize: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        // 8 bytes for Content, 4 for sun, 4 for water
        this.cellSize = 16;
        this.cells = new Uint8Array(this.width * this.height * this.cellSize);
    }

    private getCellIndex(x: number, y: number): number {
        return (y * this.width + x) * this.cellSize;
    }

    setCell(x: number, y: number, cell: Cell): void {
        const index = this.getCellIndex(x, y);

        //Serialize 'content' as 8 bytes UTF-8 String 
        const contentBytes = encodeContent(cell.content, 8);
        this.cells.set(contentBytes, index);

        // Serialize `sun` and `water` as 4-byte integers
        new DataView(this.cells.buffer).setUint32(index + 8, cell.sun, true); // little-endian
        new DataView(this.cells.buffer).setUint32(index + 12, cell.water, true); // little-endian
    }

    getCell(x: number, y: number): Cell {
        const index = this.getCellIndex(x, y);

        // Deserialize `content`
        const contentBytes = this.cells.slice(index, index + 8);
        const content = decodeContent(contentBytes);
        // Deserialize `sun` and `water`
        const sun = new DataView(this.cells.buffer).getUint32(index + 8, true);
        const water = new DataView(this.cells.buffer).getUint32(index + 12, true);

        // Return the cell object
        return { content, sun, water, x, y };
    }

    //Set the contents of cell at x,y
    setContent(x: number, y: number, content: string): void {
        const index = this.getCellIndex(x, y);
        const contentBytes = encodeContent(content, 8);
        this.cells.set(contentBytes, index);
    }

    //Append a string to the contents of cell at x,y 
    appendContent(x: number, y: number, appendStr: string): void {
        const index = this.getCellIndex(x, y);
    
        // Decode the existing content
        const contentBytes = this.cells.slice(index, index + 8);
        const existingContent = decodeContent(contentBytes);
    
        // Append the new string and encode the updated content
        const updatedContent = encodeContent(existingContent + appendStr, 8);
        this.cells.set(updatedContent, index);
    }
    getCells(): Uint8Array{
        return this.cells;
    }
    setCells(newCells: Uint8Array): void{
        this.cells = newCells 
    }
}

//Serialize 'content' as 8 bytes UTF-8 String 
function encodeContent(content: string, length: number): Uint8Array {
    const encoded = new TextEncoder().encode(padEnd(content, length, '\0'));
    return encoded;
}

// Deserialize 8 bytes UTF-8 String to string 
function decodeContent(contentBytes: Uint8Array): string {
    const decoded = new TextDecoder().decode(contentBytes); // Decode the bytes to a string
    return decoded.replace(/\0/g, ''); // Remove null padding
}

//Helper function because TS.padEnd was not Compiling
//Adds padding at end of string 
function padEnd(str: string, targetLength: number, padChar: string = '\0'): string {
    while (str.length < targetLength) {
        str += padChar;
    }
    return str.slice(0, targetLength);
}
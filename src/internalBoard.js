import {TextEncoder} from ;

// Contiguous byte array for storing state of the board
export class InternalBoard {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        // 8 bytes for Content, 4 for sun, 4 for water
        this.cellSize = 16;
        this.cells = new Uint8Array(this.width * this.height * this.cellSize);
    }

    getCellIndex(x, y) {
        return (y * this.width + x) * this.cellSize;
    }

    setCell(x, y, cell) {
        const index = this.getCellIndex(x, y);
        // Serialize 'content' as 8 bytes UTF-8 String 
        const contentBytes = encodeContent(cell.content, 8);
        this.cells.set(contentBytes, index);
        // Serialize `sun` and `water` as 4-byte integers
        new DataView(this.cells.buffer).setUint32(index + 8, cell.sun, true); // little-endian
        new DataView(this.cells.buffer).setUint32(index + 12, cell.water, true); // little-endian
    }

    getCell(x, y) {
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

    // Set the contents of cell at x,y
    setContent(x, y, content) {
        const index = this.getCellIndex(x, y);
        const contentBytes = encodeContent(content, 8);
        this.cells.set(contentBytes, index);
    }

    // Append a string to the contents of cell at x,y 
    appendContent(x, y, appendStr) {
        const index = this.getCellIndex(x, y);
        // Decode the existing content
        const contentBytes = this.cells.slice(index, index + 8);
        const existingContent = decodeContent(contentBytes);
        // Append the new string and encode the updated content
        const updatedContent = encodeContent(existingContent + appendStr, 8);
        this.cells.set(updatedContent, index);
    }

    getCells() {
        return this.cells;
    }

    setCells(newCells) {
        this.cells = newCells;
    }
}
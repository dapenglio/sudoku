function isValid(grid, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num || grid[i][col] === num) {
            return false;
        }
    }
    const startRow = 3 * Math.floor(row / 3);
    const startCol = 3 * Math.floor(col / 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }
    return true;
}

function findEmptyLocation(grid) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return null;
}

function solveSudoku(grid) {
    const emptyLocation = findEmptyLocation(grid);
    if (!emptyLocation) {
        return true; // Grid is solved
    }
    const [row, col] = emptyLocation;

    for (let num = 1; num <= 9; num++) {
        if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) {
                return true;
            }
            grid[row][col] = 0; // Backtrack
        }
    }
    return false;
}

function generateSolvedGrid() {
    const grid = Array(9).fill(null).map(() => Array(9).fill(0));
    solveSudoku(grid);
    return grid;
}

function generateSudokuSeed(solvedGrid, numGivens) {
    const grid = solvedGrid.map(row => row.slice()); // Deep copy
    const cells = [];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            cells.push([row, col]);
        }
    }
    // Fisher-Yates shuffle
    for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    let currentGivens = 81;

    for (const [row, col] of cells) {
        if(currentGivens <= numGivens) break;
        
        const temp = grid[row][col];
        grid[row][col] = 0;
        currentGivens--;


        const gridCopy = grid.map(row => row.slice());
        if (!solveSudoku(gridCopy)) {
            grid[row][col] = temp;
            currentGivens++;
        } else {
          const gridCopy2 = grid.map(row => row.slice());
          gridCopy2[row][col] = temp;
          solveSudoku(gridCopy2);
          let isEqual = true;

          for(let r = 0; r < 9; r++){
            for(let c = 0; c < 9; c++){
              if(gridCopy[r][c] !== gridCopy2[r][c]){
                isEqual = false;
                break;
              }
            }
          }
          if(!isEqual){
            grid[row][col] = temp;
            currentGivens++;
          }
        }
    }
    return grid;
}


function printGrid(grid) {
    for (const row of grid) {
        console.log(row.map(num => num !== 0 ? num.toString() : ".").join(" "));
    }
}


// --- Main Execution ---
const solvedGrid = generateSolvedGrid();
console.log("Solved Grid:");
printGrid(solvedGrid);

const seed30 = generateSudokuSeed(solvedGrid, 30);
console.log("\nSudoku Seed (30 Givens):");
printGrid(seed30);

const seed45 = generateSudokuSeed(solvedGrid, 45);
console.log("\nSudoku Seed (45 Givens):");
printGrid(seed45);

const seed60 = generateSudokuSeed(solvedGrid, 60);
console.log("\nSudoku Seed (60 Givens):");
printGrid(seed60);

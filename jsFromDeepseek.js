function generateCompleteSudoku() {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

    function solve(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (const num of numbers) {
                        if (isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (solve(grid)) return true;
                            grid[row][col] = 0; // Backtrack
                        }
                    }
                    return false; // No valid number found
                }
            }
        }
        return true; // Grid is complete
    }

    solve(grid);
    return grid;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function isValid(grid, row, col, num) {
    // Check row
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num) return false;
    }

    // Check column
    for (let i = 0; i < 9; i++) {
        if (grid[i][col] === num) return false;
    }

    // Check 3x3 subgrid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[startRow + i][startCol + j] === num) return false;
        }
    }

    return true;
}

function generateSudokuPuzzle(difficulty = 'medium') {
    const grid = generateCompleteSudoku();
    let cellsToRemove;

    switch (difficulty) {
        case 'easy':
            cellsToRemove = 30 + Math.floor(Math.random() * 10); // 30–40 cells
            break;
        case 'medium':
            cellsToRemove = 40 + Math.floor(Math.random() * 10); // 40–50 cells
            break;
        case 'hard':
            cellsToRemove = 50 + Math.floor(Math.random() * 10); // 50–60 cells
            break;
        default:
            cellsToRemove = 40 + Math.floor(Math.random() * 10); // Default to medium
    }

    // Remove cells while ensuring the puzzle has a unique solution
    let removedCells = 0;
    while (removedCells < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (grid[row][col] !== 0) {
            const backup = grid[row][col];
            grid[row][col] = 0;

            // Check if the puzzle still has a unique solution
            if (hasUniqueSolution(grid)) {
                removedCells++;
            } else {
                grid[row][col] = backup; // Restore the cell
            }
        }
    }

    return grid;
}

function hasUniqueSolution(grid) {
    const solutions = [];
    solveAndCount(grid, solutions);
    return solutions.length === 1; // Only one solution is allowed
}

function solveAndCount(grid, solutions) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        solveAndCount(grid, solutions);
                        grid[row][col] = 0; // Backtrack
                    }
                }
                return; // No valid number found
            }
        }
    }
    solutions.push(JSON.stringify(grid)); // Store the solution
}

const puzzle = generateSudokuPuzzle('medium');
console.log(puzzle);

renderBoard(puzzle);


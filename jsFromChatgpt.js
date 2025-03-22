// Sudoku puzzle generator with approximate difficulty

// Generates a fully solved Sudoku board
function generateSolvedSudoku() {
    const board = Array(9).fill(0).map(() => Array(9).fill(0));

    function isSafe(row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num || board[x][col] === num) return false;
        }
        const startRow = row - row % 3, startCol = col - col % 3;
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if (board[i + startRow][j + startCol] === num) return false;
        return true;
    }

    function fillBoard() {
        for (let i = 0; i < 81; i++) {
            const row = Math.floor(i / 9);
            const col = i % 9;

            if (board[row][col] === 0) {
                const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
                for (let num of nums) {
                    if (isSafe(row, col, num)) {
                        board[row][col] = num;
                        if (fillBoard()) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
        return true;
    }

    fillBoard();
    return board;
}

// Removes cells based on difficulty
function createPuzzle(board, difficulty) {
    const levels = { 'easy': 40, 'medium': 34, 'hard': 28, 'expert': 22 };
    let cellsToKeep = levels[difficulty] || 34;
    const puzzle = board.map(row => row.slice());

    let cellsToRemove = 81 - cellsToKeep;
    while (cellsToRemove > 0) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            cellsToRemove--;
        }
    }
    return puzzle;
}

// Helper function to print Sudoku in readable format
function printSudoku(board) {
    board.forEach(row => {
        console.log(row.map(n => n || ' ').join(' '));
    });
}

// Example usage:
const solved = generateSolvedSudoku();
const puzzle = createPuzzle(solved, 'medium');

console.log("Generated Sudoku Puzzle (medium difficulty):");
printSudoku(puzzle);


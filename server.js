const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/generate', (req, res) => {
    const puzzle = generateSudoku();
    res.json(puzzle);
});

app.post('/api/validate', express.json(), (req, res) => {
    const { puzzle, solution } = req.body;
    const isValid = validateSudoku(puzzle, solution);
    res.json({ valid: isValid });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

function generateSudoku() {
    const puzzle = [
      /*
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
        */
        [0, 0, 0,   0, 9, 0,   2, 0, 3],
        [0, 0, 0,   0, 3, 0,   0, 0, 8],
        [0, 0, 0,   5, 7, 4,   0, 0, 0],

        [0, 0, 3,   6, 0, 0,   0, 0, 0],
        [0, 9, 0,   0, 0, 5,   0, 0, 0],
        [0, 2, 0,   0, 0, 0,   0, 6, 1],

        [7, 0, 4,   0, 0, 0,   0, 3, 0],
        [5, 0, 0,   9, 0, 0,   7, 0, 0],
        [0, 0, 0,   0, 0, 0,   4, 0, 0],
    ];
    return puzzle;
}

function validateSudoku(puzzle0, solution0) {
    /*
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (solution[i][j] !== 0 && puzzle[i][j] !== solution[i][j]) {
                return false;
            }
        }
    }
    */
    const solution = Array.from({ length: 9 }, () => Array(9).fill(0));
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            solution[i][j] = solution0[i][j] + puzzle0[i][j];
        }
    }
    for (let i = 0; i < 9; i++) {
        const row = new Set();
        const col = new Set();
        const grid = new Set();
        for (let j = 0; j < 9; j++) {
            if (solution[i][j] === 0 || row.has(solution[i][j])) {
              console.log('Dapeng row failed', i, j, solution[i][j] );
              return false;
            }
            row.add(solution[i][j]);

            if (solution[j][i] === 0 || col.has(solution[j][i])) {
              console.log('Dapeng col failed', j, i, solution[j][i] );
              return false;
            }
            col.add(solution[j][i]);

            const gridRow = 3 * Math.floor(i / 3) + Math.floor(j / 3);
            const gridCol = 3 * (i % 3) + (j % 3);
            if (solution[gridRow][gridCol] === 0 || grid.has(solution[gridRow][gridCol])) {
              console.log('Dapeng tile failed', gridRow, gridCol, solution[gridRow][gridCol], i, j );
              return false;
            }
            grid.add(solution[gridRow][gridCol]);
        }
    }
    return true;
}

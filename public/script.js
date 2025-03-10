document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('sudoku-board');
    const digitIndicator = document.getElementById('digit-indicator').children;
    let puzzle = [];
    let solution = Array.from({ length: 9 }, () => Array(9).fill(0));

    fetch('/api/generate')
        .then(response => response.json())
        .then(data => {
            puzzle = data;
            renderBoard(puzzle);
        });

    function renderBoard(puzzle) {
        board.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                if (puzzle[i][j] !== 0) {
                    cell.textContent = puzzle[i][j];
                } else {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = 1;
                    input.max = 9;
                    input.addEventListener('input', (e) => {
                        const value = parseInt(e.target.value);
                        solution[i][j] = isNaN(value) ? 0 : value;

                        // Immediately check for completed digits
                        checkCompletedDigits();

                        // Highlight all occurrences of the updated digit
                        if (value !== 0) {
                            highlightAllOccurrences(value);
                        } else {
                            removeAllHighlights();
                        }
                    });
                    cell.appendChild(input);
                }

                // Add click event listener to handle highlighting
                cell.addEventListener('click', () => {
                    const digit = cell.textContent || solution[i][j];
                    if (digit !== 0) {
                        highlightAllOccurrences(digit);
                    } else {
                        removeAllHighlights();
                    }
                });

                board.appendChild(cell);
            }
        }
        checkCompletedDigits(); // Initial check for pre-filled digits
    }

    function highlightAllOccurrences(digit) {
        // Remove existing highlights
        removeAllHighlights();

        // Convert digit to a number
        const digitNumber = parseInt(digit, 10);

        // Highlight all occurrences of the digit
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = board.children[i * 9 + j];
                const cellValue = puzzle[i][j] || solution[i][j];

                if (cellValue === digitNumber) {
                    // Highlight the clicked digit
                    cell.classList.add('highlight-digit');

                    // Highlight the row, column, and 3x3 subgrid for this occurrence
                    highlightRow(i);
                    highlightColumn(j);
                    highlightSubgrid(i, j);
                } else if (cellValue !== 0) {
                    // Highlight other digits
                    cell.classList.add('highlight-other-digit');
                }
            }
        }

        // Auto-fill cells where the digit must go
        autoFillDigit(digitNumber);
    }

    function autoFillDigit(digit) {
        // Check rows
        const rowCandidates = new Set();
        for (let i = 0; i < 9; i++) {
            const emptyCells = [];
            for (let j = 0; j < 9; j++) {
                const cell = board.children[i * 9 + j];
                const cellValue = puzzle[i][j] || solution[i][j];
                if (cellValue === 0 && !cell.classList.contains('highlight-row') && !cell.classList.contains('highlight-col') && !cell.classList.contains('highlight-subgrid')) {
                    emptyCells.push({ row: i, col: j });
                }
            }
          console.log('Dapeng check row ', i, emptyCells )
            if (emptyCells.length === 1) {
                const { row, col } = emptyCells[0];
                rowCandidates.add( JSON.stringify( { row, col } ) )
                //solution[row][col] = digit;
                //updateCell(row, col, digit);
            }
        }

        // Check columns
        const colCandidates = new Set();
        for (let j = 0; j < 9; j++) {
            const emptyCells = [];
            for (let i = 0; i < 9; i++) {
                const cell = board.children[i * 9 + j];
                const cellValue = puzzle[i][j] || solution[i][j];
                if (cellValue === 0 && !cell.classList.contains('highlight-row') && !cell.classList.contains('highlight-col') && !cell.classList.contains('highlight-subgrid')) {
                    emptyCells.push({ row: i, col: j });
                }
            }
          console.log('Dapeng check column ', j, emptyCells )
            if (emptyCells.length === 1) {
                const { row, col } = emptyCells[0];
                colCandidates.add( JSON.stringify( { row, col } ) )
                //solution[row][col] = digit;
                //updateCell(row, col, digit);
            }
        }

        // Check 3x3 subgrids
        const tileCandidates = new Set();
        for (let gridRow = 0; gridRow < 3; gridRow++) {
            for (let gridCol = 0; gridCol < 3; gridCol++) {
                const emptyCells = [];
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const row = 3 * gridRow + i;
                        const col = 3 * gridCol + j;
                        const cell = board.children[row * 9 + col];
                        const cellValue = puzzle[row][col] || solution[row][col];
                        if (cellValue === 0 && !cell.classList.contains('highlight-row') && !cell.classList.contains('highlight-col') && !cell.classList.contains('highlight-subgrid')) {
                            emptyCells.push({ row, col });
                        }
                    }
                }
          console.log('Dapeng check tile ', gridRow, gridCol, emptyCells )
                if (emptyCells.length === 1) {
                    const { row, col } = emptyCells[0];
                    //tileCandidates.add( JSON.stringify( { row, col } ) )
                    solution[row][col] = digit;
                    updateCell(row, col, digit);
                }
            }
        }

        const setRC = new Set( [...rowCandidates].filter(cell => rowCandidates.has(cell)));
        //const setRCT = new Set( [...setRC].filter(cell => tileCandidates.has(cell)));
        for (const rc of setRC) {
            const { row, col } = JSON.parse(rc)
            solution[row][col] = digit;
            updateCell(row, col, digit);
        }

    }

    function updateCell(row, col, digit) {
        const cell = board.children[row * 9 + col];
        const input = cell.querySelector('input');
        if (input) {
            input.value = digit;
        } else {
            cell.textContent = digit;
        }
        cell.classList.remove('highlight-row', 'highlight-col', 'highlight-subgrid');
        cell.classList.add('highlight-digit');
    }

    function removeAllHighlights() {
        const cells = board.querySelectorAll('div');
        cells.forEach((cell) => {
            cell.classList.remove(
                'highlight-row',
                'highlight-col',
                'highlight-subgrid',
                'highlight-digit',
                'highlight-other-digit'
            );
        });
    }

    function highlightRow(row) {
        for (let col = 0; col < 9; col++) {
            const cell = board.children[row * 9 + col];
            if (!cell.classList.contains('highlight-digit')) {
                cell.classList.add('highlight-row');
            }
        }
    }

    function highlightColumn(col) {
        for (let row = 0; row < 9; row++) {
            const cell = board.children[row * 9 + col];
            if (!cell.classList.contains('highlight-digit')) {
                cell.classList.add('highlight-col');
            }
        }
    }

    function highlightSubgrid(row, col) {
        const startRow = 3 * Math.floor(row / 3);
        const startCol = 3 * Math.floor(col / 3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cell = board.children[(startRow + i) * 9 + (startCol + j)];
                if (!cell.classList.contains('highlight-digit')) {
                    cell.classList.add('highlight-subgrid');
                }
            }
        }
    }

    function checkCompletedDigits() {
        const digitCounts = Array(9).fill(0); // Track counts for digits 1-9

        // Count occurrences in both puzzle and solution
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                // Check puzzle (pre-filled digits)
                if (puzzle[i][j] !== 0) {
                    digitCounts[puzzle[i][j] - 1]++;
                }
                // Check solution (player's input)
                if (solution[i][j] !== 0) {
                    digitCounts[solution[i][j] - 1]++;
                }
            }
        }

        // Update the digit indicator and gray out completed digits in the board
        for (let i = 0; i < 9; i++) {
            if (digitCounts[i] === 9) {
                digitIndicator[i].classList.add('completed');
                grayOutCompletedDigits(i + 1); // Gray out all instances of this digit
            } else {
                digitIndicator[i].classList.remove('completed');
                unGrayOutDigits(i + 1); // Remove gray-out if not completed
            }
        }
    }

    function grayOutCompletedDigits(digit) {
        const cells = board.querySelectorAll('div');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            // Check both puzzle and solution for the digit
            if (puzzle[row][col] === digit || solution[row][col] === digit) {
                cell.classList.add('completed-digit');
            }
        });
    }

    function unGrayOutDigits(digit) {
        const cells = board.querySelectorAll('div');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            // Check both puzzle and solution for the digit
            if (puzzle[row][col] === digit || solution[row][col] === digit) {
                cell.classList.remove('completed-digit');
            }
        });
    }

    document.getElementById('check-solution').addEventListener('click', () => {
        fetch('/api/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ puzzle, solution })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.valid ? 'Correct solution!' : 'Incorrect solution. Try again.');
            });
    });
});

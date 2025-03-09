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
                        checkCompletedDigits();
                    });
                    cell.appendChild(input);
                }
                board.appendChild(cell);
            }
        }
        checkCompletedDigits(); // Initial check for pre-filled digits
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
        cells.forEach((cell) => {
            if (cell.textContent == digit) {
                cell.classList.add('completed-digit');
            }
        });
    }

    function unGrayOutDigits(digit) {
        const cells = board.querySelectorAll('div');
        cells.forEach((cell) => {
            if (cell.textContent == digit) {
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

document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('sudoku-board');
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
                    });
                    cell.appendChild(input);
                }
                board.appendChild(cell);
            }
        }
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

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
                    if (solution[i][j] !== 0) {
                        //cell.textContent = solution[i][j];
                        input.value = solution[i][j];
                    }
                    input.addEventListener('input', (e) => {
                        const value = parseInt(e.target.value);
                        solution[i][j] = isNaN(value) ? 0 : value;
                      console.log('Dapeng after value change', value, solution[i][j], i, j);

                        // Immediately check for completed digits
                        checkCompletedDigits();

                        // Highlight all occurrences of the updated digit
                        if (value !== 0) {
                            highlightAllOccurrences(value);
                        } else {
                            removeAllHighlights();
                            showPossibleValues(i, j);
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
                        showPossibleValues(i, j);
                    }
                });

                cell.addEventListener('mouseover', () => {
                    const digit = cell.textContent || solution[i][j];
                    if (digit === 0) {
                        showPossibleValues(i, j);
                    } else {
                        clearHintArea();
                    }
                });

                cell.addEventListener('dblclick', () => {
                    const digit = cell.textContent || solution[i][j];
                    const digitNumber = parseInt(digit, 10);
                    if (digit !== 0) {
                        autoFillDigit(digitNumber);
                    }
                });

                board.appendChild(cell);
            }
        }
        checkCompletedDigits(); // Initial check for pre-filled digits
    }

    function clearHintArea() {
        document.getElementById('hint-area').innerHTML = ''; // Clear hints when the mouse leaves
    }

    function showPossibleValues(row, col) {
        const possibleValues = getPossibleValues(row, col);
        const hintArea = document.getElementById('hint-area');
        
        hintArea.innerHTML = ''; // Clear previous hints
    
        if (possibleValues.length === 0) {
            hintArea.textContent = 'No valid moves!';
            return;
        }
    
        possibleValues.forEach(digit => {
            const digitSpan = document.createElement('span');
            digitSpan.textContent = digit;
            digitSpan.classList.add('possible-digit');
            hintArea.appendChild(digitSpan);
        });
    }

    function getPossibleValues(row, col) {
        const possible = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
        // Remove numbers already in the row
        for (let j = 0; j < 9; j++) {
            possible.delete( puzzle[row][j] || solution[row][j] );
        }
//      console.log('Dapeng, get possible values', 'after filtering row', possible);
    
        // Remove numbers already in the column
        for (let i = 0; i < 9; i++) {
            possible.delete( puzzle[i][col] || solution[i][col] );
        }
//      console.log('Dapeng, get possible values', 'after filtering column', possible);
    
        // Remove numbers in the 3x3 subgrid
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                possible.delete( puzzle[startRow + i][startCol + j] || solution[startRow + i][startCol + j] );
            }
        }
//      console.log('Dapeng, get possible values', 'after filtering tile', possible);
    
        return Array.from(possible);
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
        //autoFillDigit(digitNumber);
    }

    function autoFillDigit(digit) {
        toFillCells = [];
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
                toFillCells.push( { row, col } );
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
                toFillCells.push( { row, col } );
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
          //console.log('Dapeng check tile ', gridRow, gridCol, emptyCells )
                if (emptyCells.length === 1) {
                    const { row, col } = emptyCells[0];
                    //tileCandidates.add( JSON.stringify( { row, col } ) )
                    toFillCells.push( { row, col } );
                    //solution[row][col] = digit;
                    //updateCell(row, col, digit);
                }
            }
        }

        for ( const { row, col } of toFillCells ) {
            solution[row][col] = digit;
            updateCell(row, col, digit);
        }
        /*
        const setRC = new Set( [...rowCandidates].filter(cell => rowCandidates.has(cell)));
        //const setRCT = new Set( [...setRC].filter(cell => tileCandidates.has(cell)));
        for (const rc of setRC) {
            const { row, col } = JSON.parse(rc)
            solution[row][col] = digit;
            updateCell(row, col, digit);
        }
        */
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
        checkCompletedDigits();
    }

    function removeAllHighlights() {
        const cells = board.querySelectorAll('div');
        cells.forEach((cell) => {
          if ( ! cell.textContent || cell.textContent === '0' )
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

    const snapshots = []; // Stack to store snapshots
    const snapshotNames = []; // Stores snapshot names

    document.getElementById('snapshot-btn').addEventListener('click', saveSnapshot);
    
    function saveSnapshot() {
        // Deep copy the solution array
        const snapshot = solution.map(row => [...row]);
      console.log('Dapeng solution', solution);
      console.log('Dapeng snapshot', snapshot);
        snapshots.push(snapshot);

        const defaultName = `Snapshot ${snapshots.length + 1}`; // Default name
        snapshotNames.push(defaultName);
        
        // Update snapshot list
        updateSnapshotList();
    }

    function updateSnapshotList() {
        const snapshotList = document.getElementById('snapshot-list');
        snapshotList.innerHTML = ''; // Clear previous list
    
        snapshots.forEach((snapshot, index) => {
            const snapshotItem = document.createElement('div');
            snapshotItem.classList.add('snapshot-item');
    
            const nameSpan = document.createElement('span');
            nameSpan.textContent = snapshotNames[index];
            nameSpan.classList.add('snapshot-name');
            nameSpan.setAttribute('data-index', index);
    
            nameSpan.addEventListener('click', () => renameSnapshot(index, nameSpan));
    
            snapshotItem.appendChild(nameSpan);
    
            // Double-click restores snapshot
            snapshotItem.addEventListener('dblclick', () => restoreSnapshot(index));
    
            snapshotList.appendChild(snapshotItem);
        });
    }
    
    function renameSnapshot(index, nameSpan) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = snapshotNames[index];
        input.classList.add('snapshot-input');
    
        // Replace the name span with the input field
        nameSpan.replaceWith(input);
        input.focus();
    
        // Save name when Enter is pressed or input loses focus
        function saveName() {
            const newName = input.value.trim() || snapshotNames[index]; // Keep old name if empty
            snapshotNames[index] = newName;
            updateSnapshotList(); // Refresh the list
        }
    
        input.addEventListener('blur', saveName);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveName();
        });
    }

    function restoreSnapshot(index) {
        if (index < 0 || index >= snapshots.length) return;
    
        // Restore the solution array
        solution = snapshots[index].map(row => [...row]);
      console.log('Dapeng restore solution', solution);
    
        // Re-render the board with the restored solution
        renderBoard(puzzle);
        updateSnapshotList();
    }

    for (let i = 0; i < digitIndicator.length; i++) {
        digitIndicator[i].addEventListener('click', () => {
            const digit = i + 1; // Digits are 1-based
            removeAllHighlights();
            highlightAllOccurrences(digit);
        });
        digitIndicator[i].addEventListener('dblclick', () => {
            const digit = i + 1; // Digits are 1-based
            autoFillDigit(digit);
            removeAllHighlights();
            highlightAllOccurrences(digit);
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


document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('sudoku-board');
    const digitIndicator = document.getElementById('digit-indicator').children;
    let puzzle = [];
    let solution = Array.from({ length: 9 }, () => Array(9).fill(0));

    // Generate the Sudoku puzzle locally
    puzzle = generateSudoku();
    renderBoard(puzzle);

    function generateSudoku() {
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
      
      const puzzle = generateSudokuPuzzle('hard');
      console.log(JSON.stringify(puzzle));
      //renderBoard(puzzle);
      // return [[2,0,0,0,8,0,0,0,6],[0,0,0,4,6,0,0,0,0],[9,0,0,7,0,0,0,1,0],[0,9,0,8,0,0,0,7,0],[1,8,0,0,0,2,3,0,0],[0,0,0,0,5,0,0,0,4],[0,4,0,0,0,0,5,0,2],[0,0,0,5,0,0,0,0,9],[0,6,0,0,0,0,0,4,0]]
      return puzzle

    }

    function validateSudoku(puzzle0, solution0) {
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
                    console.log('Dapeng row failed', i, j, solution[i][j]);
                    return false;
                }
                row.add(solution[i][j]);

                if (solution[j][i] === 0 || col.has(solution[j][i])) {
                    console.log('Dapeng col failed', j, i, solution[j][i]);
                    return false;
                }
                col.add(solution[j][i]);

                const gridRow = 3 * Math.floor(i / 3) + Math.floor(j / 3);
                const gridCol = 3 * (i % 3) + (j % 3);
                if (solution[gridRow][gridCol] === 0 || grid.has(solution[gridRow][gridCol])) {
                    console.log('Dapeng tile failed', gridRow, gridCol, solution[gridRow][gridCol], i, j);
                    return false;
                }
                grid.add(solution[gridRow][gridCol]);
            }
        }
        return true;
    }

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
                    } else {
                        const possibleValues = getPossibleValues(i, j);
                        if (possibleValues.length === 1) {
                            const digitToFill = possibleValues[0];
                            solution[i][j] = digitToFill;
                            updateCell(i, j, digitToFill);
                        }
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
            possible.delete(puzzle[row][j] || solution[row][j]);
        }
        // console.log('Dapeng, get possible values', 'after filtering row', possible);

        // Remove numbers already in the column
        for (let i = 0; i < 9; i++) {
            possible.delete(puzzle[i][col] || solution[i][col]);
        }
        // console.log('Dapeng, get possible values', 'after filtering column', possible);

        // Remove numbers in the 3x3 subgrid
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                possible.delete(puzzle[startRow + i][startCol + j] || solution[startRow + i][startCol + j]);
            }
        }
        // console.log('Dapeng, get possible values', 'after filtering tile', possible);

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
            console.log('Dapeng check row ', i, emptyCells);
            if (emptyCells.length === 1) {
                const { row, col } = emptyCells[0];
                toFillCells.push({ row, col });
                rowCandidates.add(JSON.stringify({ row, col }));
                // solution[row][col] = digit;
                // updateCell(row, col, digit);

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
            console.log('Dapeng check column ', j, emptyCells);
            if (emptyCells.length === 1) {
                const { row, col } = emptyCells[0];
                colCandidates.add(JSON.stringify({ row, col }));
                toFillCells.push({ row, col });
            }
            //solution[row][col] = digit;
            //updateCell(row, col, digit);
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
                    toFillCells.push({ row, col });
                    //tileCandidates.add( JSON.stringify( { row, col } ) )
                    //solution[row][col] = digit;
                    //updateCell(row, col, digit);
                }
            }
        }

        /*
-        const setRC = new Set( [...rowCandidates].filter(cell => rowCandidates.has(cell)));
-        //const setRCT = new Set( [...setRC].filter(cell => tileCandidates.has(cell)));
-        for (const rc of setRC) {
-            const { row, col } = JSON.parse(rc)
*/
        for (const { row, col } of toFillCells) {
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
        checkCompletedDigits();
    }

    function removeAllHighlights() {
        const cells = board.querySelectorAll('div');
        cells.forEach((cell) => {
            if (!cell.textContent || cell.textContent === '0') {
                cell.classList.remove(
                    'highlight-row',
                    'highlight-col',
                    'highlight-subgrid',
                    'highlight-digit',
                    'highlight-other-digit'
                );
            }
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
        const isValid = validateSudoku(puzzle, solution);
        alert(isValid ? 'Correct solution!' : 'Incorrect solution. Try again.');
    });
});

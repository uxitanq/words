// Crosswordle Game Logic - Drag & Drop mechanics
// Green = correct letter in correct position for its word
// Yellow = letter exists in the SAME word (horizontal or vertical)
// Gray = letter doesn't exist in this word at all

function initializeCrosswordle() {
    if (fullDictionary.size === 0) {
        const loadingEl = document.getElementById('crosswordle-loading');
        if (loadingEl) loadingEl.textContent = 'Загрузка слоўніка...';
        loadFullDictionary().then(() => {
            if (loadingEl) loadingEl.textContent = '';
            startNewCrosswordleGame();
        });
        return;
    }
    startNewCrosswordleGame();
}

function startNewCrosswordleGame() {
    const words = selectCrosswordleWords();
    
    crosswordleGameState = {
        words: words,
        grid: Array(10).fill().map(() => Array(10).fill(null)),
        cellStates: {},
        selectedCell: null,
        totalCells: 0,
        correctCells: 0,
        moves: 0,
        gameOver: false,
        hintsRemaining: 3
    };
    
    placeWordsOnGrid();
    buildWordMapping(); // Build mapping of which words each cell belongs to
    scrambleLetters();
    renderCrosswordleGrid();
    renderCrosswordleClues();
    updateCrosswordleScore();
    
    const messageEl = document.getElementById('crosswordle-message');
    if (messageEl) {
        messageEl.textContent = 'Клікніце на дзве літары, каб памяняць іх месцамі. Зрабіце ўсе літары зялёнымі!';
        messageEl.className = 'game-message';
    }
    
    // Hide unused UI elements if they exist
    const attemptsEl = document.getElementById('crosswordle-attempts');
    const inputEl = document.getElementById('crosswordle-input');
    const submitBtn = document.getElementById('crosswordle-submit');
    const selectBtn = document.getElementById('crosswordle-select-word');
    const keyboardEl = document.getElementById('crosswordle-keyboard');
    
    if (attemptsEl) attemptsEl.style.display = 'none';
    if (inputEl) inputEl.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'none';
    if (selectBtn) selectBtn.style.display = 'none';
    if (keyboardEl) keyboardEl.style.display = 'none';
    
    console.log('Crosswordle started with words:', words.map(w => w.word));
}

function selectCrosswordleWords() {
    const dictionaryArray = Array.from(fullDictionary);
    const selectedWords = [];
    const usedWords = new Set();
    const lengths = [4, 5, 6, 5, 4];
    
    for (let i = 0; i < 5; i++) {
        const targetLength = lengths[i];
        const eligibleWords = dictionaryArray.filter(w => 
            w.length === targetLength && 
            !usedWords.has(w) && 
            !w.includes(APOSTROPHE)
        );
        
        if (eligibleWords.length > 0) {
            const word = eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
            selectedWords.push({
                word: word,
                clue: generateClue(word),
                direction: i < 3 ? 'horizontal' : 'vertical',
                row: 0,
                col: 0,
                id: i
            });
            usedWords.add(word);
        } else {
            selectedWords.push({
                word: FALLBACK_WORDS_WORDLE[i % FALLBACK_WORDS_WORDLE.length],
                clue: 'Беларускае слова',
                direction: 'horizontal',
                row: 0,
                col: 0,
                id: i
            });
        }
    }
    
    return selectedWords;
}

function generateClue(word) {
    const clues = {
        'сонца': 'Зорка, якая дае святло',
        'зорка': 'Нябеснае цела',
        'кветка': 'Расліна з пялёсткамі',
        'мова': 'Сродак камунікацыі',
        'радасць': 'Станоўчая эмоцыя',
        'любоў': 'Моцнае пачуццё',
        'школа': 'Месца для навучання',
        'кніга': 'Друкаванае выданне',
        'песня': 'Музычны твор',
        'вочы': 'Орган зроку',
        'сэрца': 'Орган пачуццяў',
        'вокны': 'Праз іх глядзяць на вуліцу',
        'стол': 'Прадмет мэблі',
        'стул': 'На ім сядзяць',
    };
    
    return clues[word] || `Слова з ${word.length} літар`;
}

function placeWordsOnGrid() {
    const words = crosswordleGameState.words;
    
    // Place words on grid with strategic positions for intersections
    words[0].direction = 'horizontal';
    words[0].row = 2;
    words[0].col = 1;
    placeWordOnGrid(words[0]);
    
    words[1].direction = 'horizontal';
    words[1].row = 5;
    words[1].col = 2;
    placeWordOnGrid(words[1]);
    
    words[2].direction = 'vertical';
    words[2].row = 0;
    words[2].col = 3;
    placeWordOnGrid(words[2]);
    
    words[3].direction = 'vertical';
    words[3].row = 3;
    words[3].col = 6;
    placeWordOnGrid(words[3]);
    
    words[4].direction = 'horizontal';
    words[4].row = 7;
    words[4].col = 3;
    placeWordOnGrid(words[4]);
    
    // Initialize cell states
    crosswordleGameState.totalCells = 0;
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            if (crosswordleGameState.grid[row][col]) {
                const correctLetter = crosswordleGameState.grid[row][col];
                crosswordleGameState.cellStates[`${row},${col}`] = {
                    correctLetter: correctLetter,
                    currentLetter: correctLetter,
                    state: 'correct',
                    wordIds: [] // Will be filled by buildWordMapping
                };
                crosswordleGameState.totalCells++;
            }
        }
    }
}

function placeWordOnGrid(wordObj) {
    const grid = crosswordleGameState.grid;
    const { word, direction, row, col } = wordObj;
    
    for (let i = 0; i < word.length; i++) {
        const r = direction === 'horizontal' ? row : row + i;
        const c = direction === 'horizontal' ? col + i : col;
        
        if (r < 10 && c < 10) {
            grid[r][c] = word[i];
        }
    }
}

// Build mapping: for each cell, store which word IDs it belongs to
function buildWordMapping() {
    const words = crosswordleGameState.words;
    
    // Clear existing mappings
    for (const key in crosswordleGameState.cellStates) {
        crosswordleGameState.cellStates[key].wordIds = [];
    }
    
    // For each word, mark all its cells with the word ID
    words.forEach(wordObj => {
        const { word, direction, row, col, id } = wordObj;
        
        for (let i = 0; i < word.length; i++) {
            const r = direction === 'horizontal' ? row : row + i;
            const c = direction === 'horizontal' ? col + i : col;
            const key = `${r},${c}`;
            
            if (crosswordleGameState.cellStates[key]) {
                crosswordleGameState.cellStates[key].wordIds.push(id);
            }
        }
    });
}

// Get all unique letters that appear in the words this cell belongs to
function getLettersInSameWords(cellKey) {
    const cellState = crosswordleGameState.cellStates[cellKey];
    if (!cellState || !cellState.wordIds) return new Set();
    
    const lettersInWords = new Set();
    const words = crosswordleGameState.words;
    
    // For each word this cell belongs to
    cellState.wordIds.forEach(wordId => {
        const wordObj = words.find(w => w.id === wordId);
        if (wordObj) {
            // Add all letters from this word
            for (const ch of wordObj.word) {
                lettersInWords.add(ch);
            }
        }
    });
    
    return lettersInWords;
}

function scrambleLetters() {
    const cells = [];
    for (const key in crosswordleGameState.cellStates) {
        cells.push({
            key: key,
            ...crosswordleGameState.cellStates[key]
        });
    }
    
    // Extract just the letters
    const letters = cells.map(c => c.currentLetter);
    
    // Fisher-Yates shuffle
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    // Make sure not all letters end up in correct positions by accident
    let allCorrect = true;
    cells.forEach((cell, index) => {
        if (letters[index] !== cell.correctLetter) {
            allCorrect = false;
        }
    });
    
    // If by miracle all are correct, swap first two
    if (allCorrect && cells.length >= 2) {
        [letters[0], letters[1]] = [letters[1], letters[0]];
    }
    
    // Assign shuffled letters and update states
    crosswordleGameState.correctCells = 0;
    
    cells.forEach((cell, index) => {
        const newLetter = letters[index];
        crosswordleGameState.cellStates[cell.key].currentLetter = newLetter;
        
        // Update state based on new letter
        updateCellStateAfterScramble(cell.key);
    });
}

function updateCellStateAfterScramble(key) {
    const cellState = crosswordleGameState.cellStates[key];
    
    if (cellState.currentLetter === cellState.correctLetter) {
        cellState.state = 'correct';
        crosswordleGameState.correctCells++;
        return;
    }
    
    // Check if this letter exists in ANY of the words this cell belongs to
    const lettersInSameWords = getLettersInSameWords(key);
    
    if (lettersInSameWords.has(cellState.currentLetter)) {
        cellState.state = 'present'; // Yellow - letter is in the same word(s)
    } else {
        cellState.state = 'wrong'; // Gray - letter doesn't belong to any connected word
    }
}

function renderCrosswordleGrid() {
    const gridEl = document.getElementById('crosswordle-grid');
    if (!gridEl) return;
    
    gridEl.innerHTML = '';
    const grid = crosswordleGameState.grid;
    
    // Find boundaries of the crossword
    let minRow = 10, maxRow = 0, minCol = 10, maxCol = 0;
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            if (grid[row][col]) {
                minRow = Math.min(minRow, row);
                maxRow = Math.max(maxRow, row);
                minCol = Math.min(minCol, col);
                maxCol = Math.max(maxCol, col);
            }
        }
    }
    
    // Add padding
    minRow = Math.max(0, minRow - 1);
    maxRow = Math.min(9, maxRow + 1);
    minCol = Math.max(0, minCol - 1);
    maxCol = Math.min(9, maxCol + 1);
    
    for (let row = minRow; row <= maxRow; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'crosswordle-row';
        
        for (let col = minCol; col <= maxCol; col++) {
            const cell = document.createElement('div');
            cell.className = 'crosswordle-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const key = `${row},${col}`;
            const cellState = crosswordleGameState.cellStates[key];
            
            if (cellState) {
                cell.textContent = cellState.currentLetter.toUpperCase();
                cell.classList.add('has-letter', cellState.state);
                
                // Highlight selected cell
                if (crosswordleGameState.selectedCell && 
                    crosswordleGameState.selectedCell.row === row && 
                    crosswordleGameState.selectedCell.col === col) {
                    cell.classList.add('selected');
                }
                
                cell.addEventListener('click', () => onCellClick(row, col));
            } else {
                cell.classList.add('empty');
            }
            
            rowElement.appendChild(cell);
        }
        
        gridEl.appendChild(rowElement);
    }
}

function onCellClick(row, col) {
    if (crosswordleGameState.gameOver) return;
    
    const key = `${row},${col}`;
    const cellState = crosswordleGameState.cellStates[key];
    if (!cellState) return;
    
    const selected = crosswordleGameState.selectedCell;
    
    if (!selected) {
        // Select first cell
        crosswordleGameState.selectedCell = { row, col };
        renderCrosswordleGrid();
    } else if (selected.row === row && selected.col === col) {
        // Deselect
        crosswordleGameState.selectedCell = null;
        renderCrosswordleGrid();
    } else {
        // Swap two cells
        swapCells(selected.row, selected.col, row, col);
        crosswordleGameState.selectedCell = null;
        renderCrosswordleGrid();
        renderCrosswordleClues(); // Update clues to show completed words
    }
}

function swapCells(row1, col1, row2, col2) {
    const key1 = `${row1},${col1}`;
    const key2 = `${row2},${col2}`;
    
    const state1 = crosswordleGameState.cellStates[key1];
    const state2 = crosswordleGameState.cellStates[key2];
    
    if (!state1 || !state2) return;
    
    // Swap letters
    const tempLetter = state1.currentLetter;
    state1.currentLetter = state2.currentLetter;
    state2.currentLetter = tempLetter;
    
    // Update states for both cells
    updateCellState(key1, state1);
    updateCellState(key2, state2);
    
    crosswordleGameState.moves++;
    updateCrosswordleScore();
    checkWinCondition();
}

function updateCellState(key, cellState) {
    const wasCorrect = cellState.state === 'correct';
    
    if (cellState.currentLetter === cellState.correctLetter) {
        cellState.state = 'correct';
        if (!wasCorrect) crosswordleGameState.correctCells++;
    } else {
        if (wasCorrect) crosswordleGameState.correctCells--;
        
        // Check if letter exists in the SAME words this cell belongs to
        const lettersInSameWords = getLettersInSameWords(key);
        
        if (lettersInSameWords.has(cellState.currentLetter)) {
            cellState.state = 'present'; // Yellow
        } else {
            cellState.state = 'wrong'; // Gray
        }
        
        // BUT: if the letter IS correct for some OTHER cell in the same word,
        // and that other cell already has its correct letter, 
        // this cell should be yellow (the letter belongs somewhere in this word)
    }
}

function checkWinCondition() {
    if (crosswordleGameState.correctCells === crosswordleGameState.totalCells && 
        crosswordleGameState.totalCells > 0 && 
        !crosswordleGameState.gameOver) {
        
        crosswordleGameState.gameOver = true;
        
        const messageEl = document.getElementById('crosswordle-message');
        if (messageEl) {
            messageEl.textContent = `Віншую! Вы разгадалі крыжаванку за ${crosswordleGameState.moves} хадоў! 🎉`;
            messageEl.className = 'game-message success';
        }
        
        // Update clues one final time
        renderCrosswordleClues();
        renderCrosswordleGrid();
        
        // Celebration animation
        const gridEl = document.getElementById('crosswordle-grid');
        if (gridEl) {
            gridEl.style.animation = 'celebrate 0.5s ease';
            setTimeout(() => {
                gridEl.style.animation = '';
            }, 500);
        }
    }
}

function renderCrosswordleClues() {
    const cluesEl = document.getElementById('crosswordle-clues');
    if (!cluesEl) return;
    
    cluesEl.innerHTML = '';
    const words = crosswordleGameState.words;
    
    const horizontalClues = words.filter(w => w.direction === 'horizontal');
    const verticalClues = words.filter(w => w.direction === 'vertical');
    
    if (horizontalClues.length > 0) {
        const h3 = document.createElement('h4');
        h3.textContent = 'Па гарызанталі:';
        cluesEl.appendChild(h3);
        
        horizontalClues.forEach((word, index) => {
            const isComplete = isWordComplete(word);
            const clueElement = document.createElement('div');
            clueElement.className = `crosswordle-clue ${isComplete ? 'found' : ''}`;
            clueElement.innerHTML = `
                <span class="clue-number">${index + 1}</span>
                <span class="clue-text">${word.clue} (${word.word.length})</span>
                ${isComplete ? '<span class="clue-found">✅</span>' : ''}
            `;
            cluesEl.appendChild(clueElement);
        });
    }
    
    if (verticalClues.length > 0) {
        const h3 = document.createElement('h4');
        h3.textContent = 'Па вертыкалі:';
        cluesEl.appendChild(h3);
        
        verticalClues.forEach((word, index) => {
            const isComplete = isWordComplete(word);
            const clueElement = document.createElement('div');
            clueElement.className = `crosswordle-clue ${isComplete ? 'found' : ''}`;
            clueElement.innerHTML = `
                <span class="clue-number">${index + 4}</span>
                <span class="clue-text">${word.clue} (${word.word.length})</span>
                ${isComplete ? '<span class="clue-found">✅</span>' : ''}
            `;
            cluesEl.appendChild(clueElement);
        });
    }
}

function isWordComplete(wordObj) {
    const { word, direction, row, col } = wordObj;
    
    for (let i = 0; i < word.length; i++) {
        const r = direction === 'horizontal' ? row : row + i;
        const c = direction === 'horizontal' ? col + i : col;
        const key = `${r},${c}`;
        const cellState = crosswordleGameState.cellStates[key];
        
        if (!cellState || cellState.currentLetter !== word[i]) {
            return false;
        }
    }
    
    return true;
}

function giveCrosswordleHint() {
    if (crosswordleGameState.gameOver) return;
    if (crosswordleGameState.hintsRemaining <= 0) {
        const messageEl = document.getElementById('crosswordle-message');
        if (messageEl) {
            messageEl.textContent = 'Падказкі скончыліся!';
            messageEl.className = 'game-message warning';
        }
        return;
    }
    
    // Find a wrong cell
    const wrongCells = [];
    for (const key in crosswordleGameState.cellStates) {
        const state = crosswordleGameState.cellStates[key];
        if (state.state !== 'correct') {
            wrongCells.push({ key, ...state });
        }
    }
    
    if (wrongCells.length > 0) {
        const randomCell = wrongCells[Math.floor(Math.random() * wrongCells.length)];
        const [row, col] = randomCell.key.split(',').map(Number);
        
        // Find the cell that HAS the correct letter for this position
        let foundSwap = false;
        for (const otherKey in crosswordleGameState.cellStates) {
            if (otherKey !== randomCell.key && 
                crosswordleGameState.cellStates[otherKey].currentLetter === randomCell.correctLetter) {
                const [r2, c2] = otherKey.split(',').map(Number);
                swapCells(row, col, r2, c2);
                crosswordleGameState.hintsRemaining--;
                foundSwap = true;
                break;
            }
        }
        
        // If correct letter not found on grid, just place it directly
        if (!foundSwap) {
            crosswordleGameState.cellStates[randomCell.key].currentLetter = randomCell.correctLetter;
            updateCellState(randomCell.key, crosswordleGameState.cellStates[randomCell.key]);
            crosswordleGameState.hintsRemaining--;
        }
        
        renderCrosswordleGrid();
        updateCrosswordleScore();
        
        const messageEl = document.getElementById('crosswordle-message');
        if (messageEl) {
            messageEl.textContent = `Падказка! Засталося: ${crosswordleGameState.hintsRemaining}`;
            messageEl.className = 'game-message warning';
        }
        
        // Update hint button text
        const hintBtn = document.getElementById('crosswordle-hint');
        if (hintBtn) {
            hintBtn.textContent = `Падказка (${crosswordleGameState.hintsRemaining})`;
        }
        
        checkWinCondition();
    }
}

function updateCrosswordleScore() {
    const scoreEl = document.getElementById('crosswordle-score');
    if (scoreEl) {
        scoreEl.textContent = `Правільна: ${crosswordleGameState.correctCells}/${crosswordleGameState.totalCells} | Хады: ${crosswordleGameState.moves}`;
    }
}

function resetCrosswordleGame() {
    startNewCrosswordleGame();
}
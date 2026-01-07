let isKeyProcessing = false; 

function setupWordleKeyListeners() {
    
    document.addEventListener('keydown', (event) => {
        if (wordleGameState.gameOver) 
            return;

        if (typeof wordleModal !== 'undefined' && wordleModal.style.display !== 'block') {
            return;
        }

        const key = event.key;
        const lowerCaseKey = key.toLowerCase();

        if (key === 'Enter') {
            event.preventDefault(); 
            handleWordleKeyPress('Enter');
        } else if (key === 'Backspace') {
            event.preventDefault(); 
            handleWordleKeyPress('Backspace');
        } 
        else {
            if (lowerCaseKey.length === 1 && /[а-яёіў']/.test(lowerCaseKey)) { 
                event.preventDefault(); 
                if (isKeyProcessing) {
                    return; 
                }

                isKeyProcessing = true;
                setTimeout(() => {
                    isKeyProcessing = false;
                }, 50); 

                if (!belarusianAlphabet.includes(lowerCaseKey)) {
                    return; 
                }
                
                addWordleLetter(lowerCaseKey);
            }
        }
    });
}

/**
 * Обрабатывает нажатие клавиши (в основном для виртуальной клавиатуры и спец. клавиш)
 * @param {string} key - Нажатая клавиша (Enter, Backspace или буква)
 */
function handleWordleKeyPress(key) {
    if (wordleGameState.gameOver) return;
    
    if (key === 'Enter') {
        submitWordleGuess();
    } else if (key === 'Backspace') {
        deleteWordleLetter();
    } else {
        const lowerCaseKey = key.toLowerCase();
         if (lowerCaseKey.length === 1 && belarusianAlphabet.includes(lowerCaseKey)) {
             addWordleLetter(lowerCaseKey);
         }
    }
}

function initializeWordle() {
    if (wordleWords.length === 0) {
        console.error("Словарь Wordle пуст, игра не может быть инициализирована.");
        return;
    }
    
    wordleGameState.targetWord = wordleWords[Math.floor(Math.random() * wordleWords.length)];
    
    createWordleGrid();
    createWordleKeyboard();
    updateAttemptsCount(); 
    
    setupWordleKeyListeners(); 
    
    console.log('Wordle Target word:', wordleGameState.targetWord);
}

function createWordleGrid() {
    wordleGrid.innerHTML = '';
    for (let row = 0; row < wordleGameState.maxAttempts; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'wordle-row';
        rowElement.dataset.row = row;
        
        for (let col = 0; col < WORD_LENGTH; col++) {
            const cell = document.createElement('div');
            cell.className = 'wordle-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.textContent = wordleGameState.grid[row][col].toUpperCase(); 
            
            if (wordleGameState.evaluations[row][col]) {
                cell.classList.add(wordleGameState.evaluations[row][col]);
            }
            if (wordleGameState.grid[row][col]) {
                cell.classList.add('filled');
            }
            
            rowElement.appendChild(cell);
        }
        
        wordleGrid.appendChild(rowElement);
    }
}

function createWordleKeyboard() {
    const keyboardLayout = [
        ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Ў', 'З', 'Х'],
        ['Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э', APOSTROPHE], 
        ['Я', 'Ч', 'С', 'М', 'І', 'Т', 'Ь', 'Б', 'Ю', 'Ё']
    ];
    
    wordleKeyboard.innerHTML = '';
    
    keyboardLayout.forEach(row => {
        const rowElement = document.createElement('div');
        rowElement.className = 'keyboard-row';
        
        row.forEach(key => {
            const keyElement = document.createElement('button');
            keyElement.className = 'keyboard-key';
            keyElement.textContent = key;
            keyElement.dataset.key = key; 

            const keyLower = key.toLowerCase();
            let keyClass = '';

            for(let r = 0; r < wordleGameState.currentRow; r++) {
                 for(let c = 0; c < WORD_LENGTH; c++) {
                    if(wordleGameState.grid[r][c] === keyLower) {
                        const eval = wordleGameState.evaluations[r][c];
                        if (eval === 'correct') {
                            keyClass = 'correct';
                            break;
                        } else if (eval === 'present' && keyClass !== 'correct') {
                            keyClass = 'present';
                        }
                    }
                }
                if (keyClass === 'correct') break;
            }
            if (!keyClass && wordleGameState.attempts > 0) {}
            if (keyClass) keyElement.classList.add(keyClass);
            
            rowElement.appendChild(keyElement);
        });
        
        wordleKeyboard.appendChild(rowElement);
    });
    
    const specialRow = document.createElement('div');
    specialRow.className = 'keyboard-row';
    
    const enterKey = document.createElement('button');
    enterKey.className = 'keyboard-key wide';
    enterKey.textContent = 'Enter';
    enterKey.dataset.key = 'Enter';
    specialRow.appendChild(enterKey);
    
    const backspaceKey = document.createElement('button');
    backspaceKey.className = 'keyboard-key wide';
    backspaceKey.textContent = '⌫';
    backspaceKey.dataset.key = 'Backspace';
    specialRow.appendChild(backspaceKey);
    
    wordleKeyboard.appendChild(specialRow);
}

/**
 * Добавляет букву в текущую ячейку.
 * @param {string} letter - Буква в нижнем регистре.
 */
function addWordleLetter(letter) {
    if (wordleGameState.currentCol < WORD_LENGTH) {
        
        wordleGameState.grid[wordleGameState.currentRow][wordleGameState.currentCol] = letter;
        
        const cell = document.querySelector(
            `.wordle-cell[data-row="${wordleGameState.currentRow}"][data-col="${wordleGameState.currentCol}"]`
        );
        if (cell) {
            cell.textContent = letter.toUpperCase();
            cell.classList.add('filled');
        }
        
        wordleGameState.currentCol++;
    }
}

function deleteWordleLetter() {
    if (wordleGameState.currentCol > 0) {
        wordleGameState.currentCol--;
        
        wordleGameState.grid[wordleGameState.currentRow][wordleGameState.currentCol] = '';
        
        const cell = document.querySelector(
            `.wordle-cell[data-row="${wordleGameState.currentRow}"][data-col="${wordleGameState.currentCol}"]`
        );
        if (cell) {
            cell.textContent = '';
            cell.classList.remove('filled');
        }
    }
}

function submitWordleGuess() {
    if (wordleGameState.currentCol !== WORD_LENGTH) {
        showWordleMessage(`Уводзіце слова з ${WORD_LENGTH} літар!`, 'error');
        shakeCurrentRow();
        return;
    }
    
    const guess = getCurrentGuess();
    
    const isWordValid = wordleWords.includes(guess) || (typeof fullDictionary !== 'undefined' && fullDictionary.has(guess));
    
    if (!isWordValid) { 
        showWordleMessage('Слова не знойдзена ў слоўніку Wordle!', 'error');
        shakeCurrentRow();
        return; 
    }
    
    evaluateWordleGuess(guess);
}

/**
 * Получает текущую попытку (слово) из сетки.
 * @returns {string} Текущее слово в нижнем регистре.
 */
function getCurrentGuess() {
    return wordleGameState.grid[wordleGameState.currentRow].join('');
}

/**
 * Оценивает введенное слово.
 * @param {string} guess - Введенное слово.
 */
function evaluateWordleGuess(guess) {
    const target = wordleGameState.targetWord;
    const result = Array(WORD_LENGTH).fill('absent');
    const targetLetters = target.split('');
    const guessLetters = guess.split('');
    
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessLetters[i] === targetLetters[i]) {
            result[i] = 'correct';
            targetLetters[i] = null; 
        }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
        if (result[i] === 'correct') continue;
        
        const foundIndex = targetLetters.indexOf(guessLetters[i]);
        if (foundIndex !== -1) {
            result[i] = 'present';
            targetLetters[foundIndex] = null; 
        }
    }
    
    for (let i = 0; i < WORD_LENGTH; i++) {
        wordleGameState.evaluations[wordleGameState.currentRow][i] = result[i];
    }
    
    animateWordleResult(result);
}

/**
 * Анимирует результат попытки.
 * @param {string[]} result - Массив результатов оценки ('correct', 'present', 'absent').
 */
function animateWordleResult(result) {
    let completedAnimations = 0;
    
    for (let i = 0; i < WORD_LENGTH; i++) {
        const cell = document.querySelector(
            `.wordle-cell[data-row="${wordleGameState.currentRow}"][data-col="${i}"]`
        );
        let keyText = wordleGameState.grid[wordleGameState.currentRow][i];
        if (keyText !== APOSTROPHE.toLowerCase()) { 
             keyText = keyText.toUpperCase();
        } else {
             keyText = APOSTROPHE; 
        }

        const key = document.querySelector(`.keyboard-key[data-key="${keyText}"]`); 
        
        setTimeout(() => {
            if (cell) {
                cell.classList.add('flip');
                
                setTimeout(() => {
                    cell.classList.add(result[i]);
                    cell.classList.remove('flip');
                    
                    if (key) {
                        // Обновление цвета клавиатуры: correct > present > absent
                        if (!key.classList.contains('correct')) {
                            if (result[i] === 'correct') {
                                key.classList.remove('present');
                                key.classList.add('correct');
                            } else if (result[i] === 'present' && !key.classList.contains('correct')) {
                                key.classList.add('present');
                            } else if (result[i] === 'absent' && !key.classList.contains('present') && !key.classList.contains('correct')) {
                                key.classList.add('absent');
                            }
                        }
                    }
                    
                    completedAnimations++;
                    
                    if (completedAnimations === WORD_LENGTH) {
                        finishWordleEvaluation();
                    }
                }, 300);
            }
        }, i * 400);
    }
}

function finishWordleEvaluation() {
    const guess = getCurrentGuess();
    wordleGameState.attempts++;
    updateAttemptsCount();
    
    if (guess === wordleGameState.targetWord) {
        wordleGameState.gameOver = true;
        showWordleMessage(`Віншую! Вы адгадалі слова!`, 'success');
        showTargetWord(`Слова было: ${wordleGameState.targetWord.toUpperCase()}`);
        celebrateWin();
    } else if (wordleGameState.attempts >= wordleGameState.maxAttempts) {
        wordleGameState.gameOver = true;
        showWordleMessage(`Гульня скончана!`, 'error');
        showTargetWord(`Слова было: ${wordleGameState.targetWord.toUpperCase()}`);
    } else {
        wordleGameState.currentRow++;
        wordleGameState.currentCol = 0;
        showWordleMessage('');
        hideTargetWord();
    }
}

function shakeCurrentRow() {
    const row = document.querySelector(`.wordle-row[data-row="${wordleGameState.currentRow}"]`);
    if (row) {
        row.classList.add('shake');
        setTimeout(() => row.classList.remove('shake'), 500);
    }
}

function showWordleMessage(message, type = '') {
    wordleMessage.textContent = message;
    wordleMessage.className = 'wordle-message';
    if (type) {
        wordleMessage.classList.add(type);
    }
}

function showTargetWord(message) {
    wordleTarget.textContent = message;
    wordleTarget.style.display = 'flex';
}

function hideTargetWord() {
    wordleTarget.textContent = '';
    wordleTarget.style.display = 'none';
}

function updateAttemptsCount() {
    attemptsCount.textContent = `${wordleGameState.attempts}/${wordleGameState.maxAttempts}`;
}

function celebrateWin() {
    const cells = document.querySelectorAll(
        `.wordle-cell[data-row="${wordleGameState.currentRow}"]`
    );
    
    cells.forEach((cell, index) => {
        setTimeout(() => {
            cell.style.transform = 'scale(1.1)';
            setTimeout(() => {
                cell.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
}

/**
 * Сбрасывает игру.
 * @param {boolean} newWord - Нужно ли выбрать новое слово.
 */
function resetWordleGame(newWord = true) {
    if (wordleWords.length === 0) {
        if (typeof loadAndInitializeGames === 'function') {
             loadAndInitializeGames(); 
        }
        return;
    }
    
    if (newWord) {
        wordleGameState.targetWord = wordleWords[Math.floor(Math.random() * wordleWords.length)];
    }
    
    wordleGameState.currentRow = 0;
    wordleGameState.currentCol = 0;
    wordleGameState.gameOver = false;
    wordleGameState.attempts = 0;
    wordleGameState.grid = Array(6).fill().map(() => Array(WORD_LENGTH).fill(''));
    wordleGameState.evaluations = Array(6).fill().map(() => Array(WORD_LENGTH).fill(''));
    
    createWordleGrid(); 
    createWordleKeyboard(); 
    
    showWordleMessage('');
    hideTargetWord();
    updateAttemptsCount();
    
    console.log('Wordle Target word:', wordleGameState.targetWord);
}

function giveWordleHint() {
    if (wordleGameState.gameOver) {
        showWordleMessage('Гульня скончана!', 'warning');
        return;
    }

    if (wordleGameState.attempts >= 2) {
        const unrevealedPositions = [];
        for (let i = 0; i < WORD_LENGTH; i++) {
            const cell = document.querySelector(
                `.wordle-cell[data-row="${wordleGameState.currentRow}"][data-col="${i}"]`
            );
            if (!cell || !cell.classList.contains('correct')) 
                 unrevealedPositions.push(i);
        }    
        
        if (unrevealedPositions.length > 0) {
            const randomPos = unrevealedPositions[Math.floor(Math.random() * unrevealedPositions.length)];
            const correctLetter = wordleGameState.targetWord[randomPos]; 
            
            if (wordleGameState.currentCol < WORD_LENGTH) {
                addWordleLetter(correctLetter);
            }
            
            showWordleMessage(`Падказка: літара "${correctLetter.toUpperCase()}"`, 'warning');
        } else {
            showWordleMessage('Немагчыма даць падказку ў бягучым слове.', 'warning');
        }

    } else {
        showWordleMessage('Падказка даступная пасля 2 спроб', 'error');
    }
}
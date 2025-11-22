// Belarusian words database (Used for daily word section)
const wordsDatabase = [
    {
        word: "Прывітанне",
        pronunciation: "пры-ві-та́н-не",
        definition: "Слова ці выраз, якімі вітаюцца пры сустрэчы.",
        example: "Прывітанне, сябры! Як вашы справы?"
    },
    {
        word: "Сонца",
        pronunciation: "со́н-ца",
        definition: "Зорка, вакол якой абарачаецца Зямля, крыніца святла і цяпла.",
        example: "Сонца свеціць ярка сёння."
    },
    {
        word: "Радасць",
        pronunciation: "ра́-дасць",
        definition: "Пачуццё задавальнення, шчасця, прыемнае ўзрушэнне.",
        example: "Яе твар выказваў чыстую радасць."
    },
    {
        word: "Любоў",
        pronunciation: "лю-бо́ў",
        definition: "Моцнае пачуццё глыбокай прыхільнасці да каго-небудзь ці чаго-небудзь.",
        example: "Любоў да Радзімы - гэта важная рыса беларуса."
    },
    {
        word: "Сяброўства",
        pronunciation: "ся-бро́ў-ства",
        definition: "Блізкія адносіны, заснаваныя на ўзаемнай даверы, павазе.",
        example: "Іх сяброўства працягвалася з дзяцінства."
    }
];

// Wordle-specific data
let wordleWords = []; // Будет заполнено из words5.txt
const WORDS_FILE_PATH = 'words5.txt'; // Файл должен быть в одной папке с HTML
const WORD_LENGTH = 5;

// Резервный список слов в НИЖНЕМ РЕГИСТРЕ
const FALLBACK_WORDS = [
    "сонца", "вочы", "сэрца", "водка", "песня", 
    "кніга", "школа", "мова", "зорка", "кветка",
    "вокны", "дзверы", "стол", "стул", "люстра"
];

// Алфавит в НИЖНЕМ РЕГИСТРЕ для сравнения
const belarusianAlphabet = [
    'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'і', 
    'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 
    'у', 'ў', 'ф', 'х', 'ц', 'ч', 'ш', 'ы', 'ь', 'э', 'ю', 'я'
];

// DOM elements
const dailyWordElement = document.getElementById('daily-word');
const wordPronunciationElement = document.getElementById('word-pronunciation');
const wordDefinitionElement = document.getElementById('word-definition');
const wordExampleElement = document.getElementById('word-example');
const currentDateElement = document.getElementById('current-date');
const previousWordsListElement = document.getElementById('previous-words-list');
const themeToggle = document.getElementById('theme-toggle');
const soundToggle = document.getElementById('sound-toggle');
const speakWordButton = document.getElementById('speak-word');
const saveWordButton = document.getElementById('save-word');
const shareWordButton = document.getElementById('share-word');
const donateButton = document.getElementById('donate-btn');
const donateModal = document.getElementById('donate-modal');
const closeModal = document.querySelector('.close');
const crosswordButton = document.getElementById('crossword-btn');
const wordleButton = document.getElementById('wordle-btn');
const wordBuilderButton = document.getElementById('word-builder-btn');

// Wordle DOM elements
const wordleModal = document.getElementById('wordle-modal');
const wordleGrid = document.getElementById('wordle-grid');
const wordleKeyboard = document.getElementById('wordle-keyboard');
const wordleSubmit = document.getElementById('wordle-submit');
const wordleReset = document.getElementById('wordle-reset');
const wordleHint = document.getElementById('wordle-hint');
const wordleMessage = document.getElementById('wordle-message');
const wordleTarget = document.getElementById('wordle-target');
const attemptsCount = document.getElementById('attempts-count');

// State variables
let soundEnabled = true;
let savedWords = JSON.parse(localStorage.getItem('savedWords')) || [];

// Wordle state variables
let wordleGameState = {
    targetWord: '', // Хранится в нижнем регистре
    currentRow: 0,
    currentCol: 0,
    gameOver: false,
    attempts: 0,
    maxAttempts: 6,
    grid: Array(6).fill().map(() => Array(WORD_LENGTH).fill('')), // Grid хранит нижний регистр
    evaluations: Array(6).fill().map(() => Array(WORD_LENGTH).fill(''))
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadAndInitializeWordle(); 
});

async function loadAndInitializeWordle() {
    await loadWordleWords(); // Ждем загрузки слов
    initializeWordle(); // Инициализируем игру
}

async function loadWordleWords() {
    try {
        const response = await fetch(WORDS_FILE_PATH);
        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        // Переводим слова в НИЖНИЙ регистр и фильтруем по длине
        wordleWords = text.trim()
                         .split('\n')
                         .map(word => word.trim().toLowerCase())
                         .filter(word => word.length === WORD_LENGTH); 
        
        if (wordleWords.length === 0) {
            console.error("Слова не загружены или не найдены 5-буквенные слова. Используем резервный список.");
            wordleWords = FALLBACK_WORDS;
        }

        console.log(`Загружено слов для Wordle: ${wordleWords.length}`);
        
    } catch (error) {
        console.error("Ошибка загрузки файла words5.txt. Используем резервный список.", error);
        wordleWords = FALLBACK_WORDS;
    }
}


function initializeApp() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = today.toLocaleDateString('be-BY', options);
    
    const dailyWord = getDailyWord();
    displayWord(dailyWord);
    
    displayPreviousWords();
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
    
    const savedSoundPreference = localStorage.getItem('soundEnabled');
    if (savedSoundPreference !== null) {
        soundEnabled = savedSoundPreference === 'true';
        updateSoundIcon();
    }
}

function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    soundToggle.addEventListener('click', toggleSound);
    speakWordButton.addEventListener('click', speakWord);
    saveWordButton.addEventListener('click', saveWord);
    shareWordButton.addEventListener('click', shareWord);
    
    donateButton.addEventListener('click', () => {
        donateModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', () => {
        donateModal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === donateModal) {
            donateModal.style.display = 'none';
        }
        if (event.target === wordleModal) {
            wordleModal.style.display = 'none';
        }
    });
    
    crosswordButton.addEventListener('click', () => {
        alert('Крыжыванка будзе даступная з 1 кастрычніка 2024 года!');
    });
    
    wordleButton.addEventListener('click', () => {
        wordleModal.style.display = 'block';
        if (wordleGameState.gameOver || wordleGameState.attempts === 0) {
             resetWordleGame(false); 
        }
    });
    
    wordBuilderButton.addEventListener('click', () => {
        alert('Складальнік слоў будзе даступны ў бліжэйшы час!');
    });
    
    document.querySelector('.wordle-close').addEventListener('click', () => {
        wordleModal.style.display = 'none';
    });
    
    const donateOptions = document.querySelectorAll('.donate-option');
    donateOptions.forEach(option => {
        option.addEventListener('click', function() {
            if (this.textContent === 'Іншая сума') {
                const amount = prompt('Увядзіце суму ў BYN:');
                if (amount && !isNaN(amount)) {
                    alert(`Дзякуй за падтрымку! Сумa: ${amount} BYN`);
                    donateModal.style.display = 'none';
                }
            } else {
                alert(`Дзякуй за падтрымку! ${this.textContent}`);
                donateModal.style.display = 'none';
            }
        });
    });
}

// WORDLE GAME FUNCTIONS
function initializeWordle() {
    if (wordleWords.length === 0) {
        console.error("Словарь Wordle пуст, игра не может быть инициализирована.");
        return;
    }
    
    // Выбираем целевое слово (оно уже в нижнем регистре)
    wordleGameState.targetWord = wordleWords[Math.floor(Math.random() * wordleWords.length)];
    
    createWordleGrid();
    createWordleKeyboard();
    setupWordleEventListeners();
    updateAttemptsCount(); 
    
    console.log('Target word:', wordleGameState.targetWord);
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
            // Текст ячейки в нижнем регистре
            cell.textContent = wordleGameState.grid[row][col]; 
            
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
    // Клавиатура остается в верхнем регистре для визуальной ясности, но при нажатии вернет нижний регистр
    const keyboardLayout = [
        ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Ў', 'З', 'Х'],
        ['Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э'],
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
            // dataset.key остается верхним, конвертация в handleWordleKeyPress
            keyElement.dataset.key = key; 
            rowElement.appendChild(keyElement);
        });
        
        wordleKeyboard.appendChild(rowElement);
    });
    
    // Add special keys row
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

function setupWordleEventListeners() {
    // Keyboard click events (виртуальная клавиатура)
    wordleKeyboard.addEventListener('click', function(e) {
        if (e.target.classList.contains('keyboard-key') && !wordleGameState.gameOver) {
            const key = e.target.dataset.key;
            handleWordleKeyPress(key);
        }
    });
    
    // Physical keyboard events (физическая клавиатура)
    document.addEventListener('keydown', function(e) {
        if (wordleModal.style.display === 'block' && !wordleGameState.gameOver) {
            
            if (e.key === 'Enter' || e.key === 'Backspace') {
                e.preventDefault(); 
            }
            
            // Получаем ключ в нижнем регистре
            const key = e.key.toLowerCase();

            if (key === 'enter') {
                handleWordleKeyPress('Enter');
            } else if (key === 'backspace') {
                handleWordleKeyPress('Backspace');
            } else if (belarusianAlphabet.includes(key) && key.length === 1) {
                // Если это буква бел. алфавита (уже в нижнем регистре)
                handleWordleKeyPress(key);
            }
        }
    });
    
    // Wordle control buttons
    wordleSubmit.addEventListener('click', function() {
        submitWordleGuess();
    });
    
    wordleReset.addEventListener('click', function() {
        resetWordleGame(true); // Явный сброс
    });
    
    wordleHint.addEventListener('click', function() {
        giveWordleHint();
    });
}

function handleWordleKeyPress(key) {
    if (wordleGameState.gameOver) return;
    
    if (key === 'Enter' || key === 'enter') {
        submitWordleGuess();
    } else if (key === 'Backspace' || key === 'backspace') {
        deleteWordleLetter();
    } else {
        // Input from physical or virtual keyboard. Convert to lowercase and check.
        const lowerCaseKey = key.toLowerCase();
        if (belarusianAlphabet.includes(lowerCaseKey) && lowerCaseKey.length === 1) {
            addWordleLetter(lowerCaseKey);
        }
    }
}

function addWordleLetter(letter) {
    // letter гарантированно в нижнем регистре
    if (wordleGameState.currentCol < WORD_LENGTH) {
        
        // Обновляем состояние
        wordleGameState.grid[wordleGameState.currentRow][wordleGameState.currentCol] = letter;
        
        // Обновляем отображение (отображается нижний регистр)
        const cell = document.querySelector(
            `.wordle-cell[data-row="${wordleGameState.currentRow}"][data-col="${wordleGameState.currentCol}"]`
        );
        if (cell) {
            cell.textContent = letter;
            cell.classList.add('filled');
        }
        
        wordleGameState.currentCol++;
    }
}

function deleteWordleLetter() {
    if (wordleGameState.currentCol > 0) {
        wordleGameState.currentCol--;
        
        // Обновляем состояние
        wordleGameState.grid[wordleGameState.currentRow][wordleGameState.currentCol] = '';
        
        // Обновляем отображение
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
    
    const guess = getCurrentGuess(); // Guess в нижнем регистре
    
    // Check if word is valid (in our word list, которое тоже в нижнем регистре)
    if (!wordleWords.includes(guess)) { 
        showWordleMessage('Слова не знойдзена ў слоўніку!', 'error');
        shakeCurrentRow();
        return; 
    }
    
    evaluateWordleGuess(guess);
}

function getCurrentGuess() {
    return wordleGameState.grid[wordleGameState.currentRow].join('');
}

function evaluateWordleGuess(guess) {
    // 'guess' и 'target' теперь в НИЖНЕМ РЕГИСТРЕ
    const target = wordleGameState.targetWord;
    const result = Array(WORD_LENGTH).fill('absent');
    const targetLetters = target.split('');
    const guessLetters = guess.split('');
    
    // First pass: mark correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessLetters[i] === targetLetters[i]) {
            result[i] = 'correct';
            targetLetters[i] = null; // Mark as used
        }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (result[i] === 'correct') continue;
        
        const foundIndex = targetLetters.indexOf(guessLetters[i]);
        if (foundIndex !== -1) {
            result[i] = 'present';
            targetLetters[foundIndex] = null; // Mark as used
        }
    }
    
    for (let i = 0; i < WORD_LENGTH; i++) {
        wordleGameState.evaluations[wordleGameState.currentRow][i] = result[i];
    }
    
    animateWordleResult(result);
}

function animateWordleResult(result) {
    let completedAnimations = 0;
    
    for (let i = 0; i < WORD_LENGTH; i++) {
        const cell = document.querySelector(
            `.wordle-cell[data-row="${wordleGameState.currentRow}"][data-col="${i}"]`
        );
        // Клавиша на клавиатуре - В ВЕРХНЕМ РЕГИСТРЕ (для поиска кнопки по метке)
        const key = document.querySelector(`.keyboard-key[data-key="${wordleGameState.grid[wordleGameState.currentRow][i].toUpperCase()}"]`); 
        
        setTimeout(() => {
            if (cell) {
                cell.classList.add('flip');
                
                setTimeout(() => {
                    cell.classList.add(result[i]);
                    cell.classList.remove('flip');
                    
                    // Обновляем клавиатуру
                    if (key) {
                        if (!key.classList.contains('correct')) {
                            if (result[i] === 'correct') {
                                key.classList.remove('present');
                                key.classList.add('correct');
                            } else if (result[i] === 'present' && !key.classList.contains('correct')) {
                                key.classList.add('present');
                            } else if (result[i] === 'absent') {
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
        // Player won
        wordleGameState.gameOver = true;
        showWordleMessage(`Віншую! Вы адгадалі слова!`, 'success');
        showTargetWord(`Слова было: ${wordleGameState.targetWord}`);
        celebrateWin();
    } else if (wordleGameState.attempts >= wordleGameState.maxAttempts) {
        // Player lost
        wordleGameState.gameOver = true;
        showWordleMessage(`Гульня скончана!`, 'error');
        showTargetWord(`Слова было: ${wordleGameState.targetWord}`);
    } else {
        // Continue game
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

function giveWordleHint() {
    if (wordleGameState.attempts >= 2 && !wordleGameState.gameOver) {
        const unrevealedPositions = [];
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (!wordleGameState.grid[wordleGameState.currentRow][i]) {
                unrevealedPositions.push(i);
            }
        }
        
        if (unrevealedPositions.length > 0) {
            const randomPos = unrevealedPositions[Math.floor(Math.random() * unrevealedPositions.length)];
            // correctLetter уже в нижнем регистре
            const correctLetter = wordleGameState.targetWord[randomPos]; 
            
            addWordleLetter(correctLetter);
            
            showWordleMessage(`Падказка: літара "${correctLetter}"`);
        }
    } else {
        showWordleMessage('Падказка даступная пасля 2 спроб', 'error');
    }
}

function resetWordleGame(newWord = true) {
    if (wordleWords.length === 0) {
        loadAndInitializeWordle(); 
        return;
    }
    
    if (newWord) {
        // Select random word (уже в нижнем регистре)
        wordleGameState.targetWord = wordleWords[Math.floor(Math.random() * wordleWords.length)];
    }
    
    // Reset game state
    wordleGameState.currentRow = 0;
    wordleGameState.currentCol = 0;
    wordleGameState.gameOver = false;
    wordleGameState.attempts = 0;
    wordleGameState.grid = Array(6).fill().map(() => Array(WORD_LENGTH).fill(''));
    wordleGameState.evaluations = Array(6).fill().map(() => Array(WORD_LENGTH).fill(''));
    
    createWordleGrid(); 
    
    // Clear keyboard visually
    const keys = document.querySelectorAll('.keyboard-key');
    keys.forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
    
    // Clear message and update attempts
    showWordleMessage('');
    hideTargetWord();
    updateAttemptsCount();
    
    console.log('Target word:', wordleGameState.targetWord);
}

// MAIN APP FUNCTIONS
function getDailyWord() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const wordIndex = dayOfYear % wordsDatabase.length;
    return wordsDatabase[wordIndex];
}

function displayWord(wordData) {
    dailyWordElement.textContent = wordData.word;
    wordPronunciationElement.textContent = `Вымаўленне: ${wordData.pronunciation}`;
    wordDefinitionElement.textContent = wordData.definition;
    wordExampleElement.textContent = `Прыклад: "${wordData.example}"`;
}

function displayPreviousWords() {
    const today = new Date();
    const previousWords = [];
    
    for (let i = 1; i <= 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const wordIndex = dayOfYear % wordsDatabase.length;
        const wordData = wordsDatabase[wordIndex];
        
        previousWords.push({
            word: wordData.word,
            date: date.toLocaleDateString('be-BY')
        });
    }
    
    previousWordsListElement.innerHTML = '';
    previousWords.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
            <div class="word">${word.word}</div>
            <div class="date">${word.date}</div>
        `;
        
        wordItem.addEventListener('click', () => {
            const wordData = wordsDatabase.find(item => item.word === word.word);
            if (wordData) {
                displayWord(wordData);
                document.querySelector('.daily-word-section').scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        previousWordsListElement.appendChild(wordItem);
    });
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    updateSoundIcon();
}

function updateSoundIcon() {
    const soundIcon = document.querySelector('.sound-icon');
    soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
}

function speakWord() {
    if (!soundEnabled) return;
    
    const word = dailyWordElement.textContent;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'be-BY';
    utterance.rate = 0.8;
    
    const voices = speechSynthesis.getVoices();
    const belarusianVoice = voices.find(voice => voice.lang.includes('be') || voice.lang.includes('BY'));
    if (belarusianVoice) {
        utterance.voice = belarusianVoice;
    }
    
    speechSynthesis.speak(utterance);
}

function saveWord() {
    const word = dailyWordElement.textContent;
    
    if (!savedWords.includes(word)) {
        savedWords.push(word);
        localStorage.setItem('savedWords', JSON.stringify(savedWords));
        saveWordButton.textContent = 'Захавана!';
        saveWordButton.style.backgroundColor = '#28a745';
        setTimeout(() => {
            saveWordButton.textContent = 'Захаваць';
            saveWordButton.style.backgroundColor = '';
        }, 2000);
    } else {
        alert('Гэта слова ўжо захавана!');
    }
}

function shareWord() {
    const word = dailyWordElement.textContent;
    const definition = wordDefinitionElement.textContent;
    const example = wordExampleElement.textContent;
    
    const shareText = `Слова дня: ${word}\n\n${definition}\n\n${example}\n\nДаведайцеся больш на belwords.by`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Беларускае слова дня',
            text: shareText,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(shareText)
            .then(() => alert('Слова скапіявана ў буфер абмену!'));
    }
}

// Add some animation effects
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const elementsToAnimate = document.querySelectorAll('.word-card, .game-card, .hero-content');
    elementsToAnimate.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});
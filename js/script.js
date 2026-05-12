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
let wordleWords = [];
const WORDS_FILE_PATH_5 = 'words5.txt'; // For Wordle
const WORD_LENGTH = 5;
const APOSTROPHE = '’'; // Using modern Belarusian apostrophe

// Word Builder data
let fullDictionary = new Set(); // For all words (112461)
const WORDS_FILE_PATH_FULL = 'words.txt'; // For Word Builder
const BUILDER_WORD_MIN_LENGTH = 8;
const BUILDER_WORD_MAX_LENGTH = 10;
const FALLBACK_WORDS_BUILDER = ["перавага", "заставацца", "настаўнік"];

// Резервный список слов Wordle в НИЖНЕМ РЕГИСТРЕ
const FALLBACK_WORDS_WORDLE = [
    "сонца", "вочы", "сэрца", "песня", 
    "кніга", "школа", "мова", "зорка", "кветка",
    "вокны", "дзверы", "стол", "стул", "люстра"
];

// Алфавит в НИЖНЕМ РЕГИСТРЕ для сравнения, включая апостроф
const belarusianAlphabet = [
    'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'і', 
    'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 
    'у', 'ў', 'ф', 'х', 'ц', 'ч', 'ш', 'ы', 'ь', 'э', 'ю', 'я', APOSTROPHE
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
const wordleLoading = document.getElementById('wordle-loading');
const builderLoading = document.getElementById('builder-loading');

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

// Word Builder DOM elements
const wordBuilderModal = document.getElementById('word-builder-modal');
const builderSourceWordDisplay = document.getElementById('builder-source-word');
const builderInput = document.getElementById('builder-input');
const builderSubmit = document.getElementById('builder-submit');
const builderMessage = document.getElementById('builder-message');
const builderFoundWordsList = document.getElementById('builder-found-words');
const builderNewGameButton = document.getElementById('builder-new-game');
// const builderHintButton = document.getElementById('builder-hint'); // УДАЛЕНО ПО ЗАПРОСУ
const builderShowUnfoundButton = document.getElementById('builder-show-unfound'); 
const builderScore = document.getElementById('builder-score');
const builderCloseModal = document.querySelector('.word-builder-close');


// State variables
let soundEnabled = true;
let savedWords = JSON.parse(localStorage.getItem('savedWords')) || [];

// Wordle state variables
let wordleGameState = {
    targetWord: '', 
    currentRow: 0,
    currentCol: 0,
    gameOver: false,
    attempts: 0,
    maxAttempts: 6,
    grid: Array(6).fill().map(() => Array(WORD_LENGTH).fill('')),
    evaluations: Array(6).fill().map(() => Array(WORD_LENGTH).fill(''))
};

// Word Builder state variables
let builderGameState = {
    sourceWord: '',
    sourceLetters: {}, // Map of letter counts: { 'а': 2, 'б': 1, ... }
    foundWords: new Set(),
    allPossibleWords: [],
    gameOver: false
};


// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadAndInitializeGames(); 
});

async function loadAndInitializeGames() {
    wordleLoading.textContent = 'Загрузка словара 5 букв...';
    await loadWordleWords(); 
    wordleLoading.textContent = '';
    initializeWordle(); 

    builderLoading.textContent = 'Загрузка полного словаря...';
    await loadFullDictionary();
    builderLoading.textContent = '';
    initializeWordBuilder();
}

/**
 * Loads the 5-letter dictionary for Wordle.
 */
async function loadWordleWords() {
    try {
        const response = await fetch(WORDS_FILE_PATH_5);
        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        // Переводим слова в НИЖНИЙ регистр и фильтруем по длине
        wordleWords = text.trim()
                         .split('\n')
                         .map(word => word.trim().toLowerCase())
                         .filter(word => word.length === WORD_LENGTH && !word.includes(APOSTROPHE)); 
        
        if (wordleWords.length === 0) {
            console.error("Слова не загружены или не найдены 5-буквенные слова. Используем резервный список Wordle.");
            wordleWords = FALLBACK_WORDS_WORDLE;
        }

        console.log(`Загружено слов для Wordle: ${wordleWords.length}`);
        
    } catch (error) {
        console.error("Ошибка загрузки файла words5.txt. Используем резервный список Wordle.", error);
        wordleWords = FALLBACK_WORDS_WORDLE;
    }
}

/**
 * Loads the full dictionary for Word Builder.
 */
async function loadFullDictionary() {
    try {
        const response = await fetch(WORDS_FILE_PATH_FULL);
        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        // Фильтруем и добавляем в Set для быстрого поиска. Исключаем слова с апострофом.
        const words = text.trim()
                         .split('\n')
                         .map(word => word.trim().toLowerCase())
                         .filter(word => word.length > 2 && !word.includes(APOSTROPHE)); 
        
        fullDictionary = new Set(words);

        console.log(`Загружено слов в полный словарь: ${fullDictionary.size}`);
        
    } catch (error) {
        console.error("Ошибка загрузки файла words.txt. Word Builder будет использовать только резервные слова.", error);
        // Add fallback words to dictionary if needed, but the main logic relies on the set
        FALLBACK_WORDS_BUILDER.forEach(word => fullDictionary.add(word));
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
    
    // Donate Modal
    donateButton.addEventListener('click', () => {
        donateModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', () => {
        donateModal.style.display = 'none';
    });
    
    // Game buttons
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
        wordBuilderModal.style.display = 'block';
        if (!builderGameState.sourceWord || builderGameState.gameOver) {
             startNewWordBuilderGame();
        }
    });
    
    // Modal Close handlers
    window.addEventListener('click', (event) => {
        if (event.target === donateModal) {
            donateModal.style.display = 'none';
        }
        if (event.target === wordleModal) {
            wordleModal.style.display = 'none';
        }
        if (event.target === wordBuilderModal) {
            wordBuilderModal.style.display = 'none';
        }
    });
    
    document.querySelector('.wordle-close').addEventListener('click', () => {
        wordleModal.style.display = 'none';
    });

    builderCloseModal.addEventListener('click', () => {
        wordBuilderModal.style.display = 'none';
    });

    // Donate options
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

    // Wordle keyboard input listener
    document.addEventListener('keydown', (e) => {
        if (wordleModal.style.display === 'block') {
            handleWordleKeyPress(e.key);
        }
    });
    wordleKeyboard.addEventListener('click', (e) => {
        if (e.target.classList.contains('keyboard-key')) {
            handleWordleKeyPress(e.target.dataset.key);
        }
    });

    // Word Builder controls
    builderSubmit.addEventListener('click', submitBuilderGuess);
    builderNewGameButton.addEventListener('click', startNewWordBuilderGame);
    // builderHintButton.addEventListener('click', showPossibleWordCount); // УДАЛЕНО: По запросу пользователя
    builderShowUnfoundButton.addEventListener('click', showUnfoundWords); 
    builderInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            submitBuilderGuess();
        }
    });
}


// --- WORD BUILDER GAME FUNCTIONS ---

function initializeWordBuilder() {
    // Finds a valid long word from the full dictionary and starts the game
    if (fullDictionary.size > 0) {
        startNewWordBuilderGame();
    }
}

function startNewWordBuilderGame() {
    if (fullDictionary.size === 0) {
        builderMessage.textContent = "Слоўнік яшчэ не загружаны!";
        builderLoading.textContent = 'Загрузка полного словаря...';
        loadFullDictionary().then(() => {
            if (fullDictionary.size > 0) startNewWordBuilderGame();
        });
        return;
    }
    
    // Find a random long word (8-10 letters)
    let candidateWord = '';
    const dictionaryArray = Array.from(fullDictionary); 
    const filteredWords = dictionaryArray.filter(
        word => word.length >= BUILDER_WORD_MIN_LENGTH && word.length <= BUILDER_WORD_MAX_LENGTH
    );

    if (filteredWords.length === 0) {
        console.warn("Не найдено длинных слов в словаре. Используем резервное.");
        candidateWord = FALLBACK_WORDS_BUILDER[Math.floor(Math.random() * FALLBACK_WORDS_BUILDER.length)];
    } else {
        candidateWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    }

    builderGameState.sourceWord = candidateWord;
    builderGameState.foundWords.clear();
    builderGameState.sourceLetters = getLetterCounts(candidateWord);
    builderGameState.allPossibleWords = findPossibleWords(candidateWord);
    builderGameState.gameOver = false;

    displaySourceWord(candidateWord);
    // Восстанавливаем оригинальный заголовок перед обновлением списка
    const container = builderFoundWordsList.parentElement; 
    const originalHeader = container.querySelector('h4');
    originalHeader.textContent = 'Знойдзеныя словы:'; 

    updateBuilderFoundWords();
    updateBuilderScore();
    builderMessage.textContent = `Складзіце словы з ${candidateWord.length} літар. Знойдзена 0.`;
    builderMessage.className = 'wordle-message';
    builderInput.value = '';
    builderInput.focus();

    console.log('Source word:', candidateWord, 'Possible words:', builderGameState.allPossibleWords.length);
}

function getLetterCounts(word) {
    const counts = {};
    for (const char of word) {
        counts[char] = (counts[char] || 0) + 1;
    }
    return counts;
}

function shuffleWord(word) {
    const chars = word.split('');
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
}

function displaySourceWord(word) {
    const shuffled = shuffleWord(word);
    builderSourceWordDisplay.innerHTML = shuffled.split('').map(
        letter => `<span>${letter.toUpperCase()}</span>`
    ).join('');
}

function findPossibleWords(sourceWord) {
    const sourceLetters = getLetterCounts(sourceWord);
    const possibleWords = [];

    // Filter the full dictionary to find words that can be made from sourceWord's letters
    for (const word of fullDictionary) {
        // Words must be at least 3 letters long
        if (word.length < 3 || word.length > sourceWord.length) continue;
        
        // Skip words with apostrophes (already filtered during loading, but good check)
        if (word.includes(APOSTROPHE)) continue;

        const wordLetters = getLetterCounts(word);
        let possible = true;

        for (const letter in wordLetters) {
            // Check if the source word has the letter, and enough of it
            if (!sourceLetters[letter] || wordLetters[letter] > sourceLetters[letter]) {
                possible = false;
                break;
            }
        }

        if (possible) {
            possibleWords.push(word);
        }
    }
    // Filter out the source word itself for better gameplay
    return possibleWords.filter(w => w !== sourceWord);
}

function submitBuilderGuess() {
    if (builderGameState.gameOver) return;

    const guess = builderInput.value.trim().toLowerCase();
    builderInput.value = ''; // Clear input field
    builderInput.focus();

    if (guess.length < 3) {
        builderMessage.textContent = 'Слова павінна быць не менш за 3 літары!';
        builderMessage.className = 'wordle-message error';
        setTimeout(() => builderMessage.className = 'wordle-message', 2000);
        return;
    }

    if (builderGameState.foundWords.has(guess)) {
        builderMessage.textContent = 'Гэтае слова ўжо знойдзена!';
        builderMessage.className = 'wordle-message warning';
        setTimeout(() => builderMessage.className = 'wordle-message', 2000);
        return;
    }

    if (!fullDictionary.has(guess)) {
        builderMessage.textContent = 'Слова не знойдзена ў слоўніку.';
        builderMessage.className = 'wordle-message error';
        setTimeout(() => builderMessage.className = 'wordle-message', 2000);
        return;
    }
    
    // Check if the word can be built from the source letters
    const guessLetters = getLetterCounts(guess);
    let canBeBuilt = true;

    for (const letter in guessLetters) {
        if (!builderGameState.sourceLetters[letter] || guessLetters[letter] > builderGameState.sourceLetters[letter]) {
            canBeBuilt = false;
            break;
        }
    }

    if (canBeBuilt) {
        builderGameState.foundWords.add(guess);
        // Обновляем список найденных слов и восстанавливаем заголовок на "Знойдзеныя словы:"
        const container = builderFoundWordsList.parentElement; 
        const originalHeader = container.querySelector('h4');
        originalHeader.textContent = 'Знойдзеныя словы:'; 

        updateBuilderFoundWords();
        updateBuilderScore();
        
        // Optional: check if all words found
        if (builderGameState.foundWords.size === builderGameState.allPossibleWords.length && builderGameState.allPossibleWords.length > 0) {
            builderMessage.textContent = `Віншую! Вы знайшлі ўсе ${builderGameState.allPossibleWords.length} магчымыя словы!`;
            builderMessage.className = 'wordle-message success';
            builderGameState.gameOver = true;
        } else {
             builderMessage.textContent = `Выдатна! Знойдзена: ${guess}`;
             builderMessage.className = 'wordle-message success';
             setTimeout(() => builderMessage.className = 'wordle-message', 2000);
        }

    } else {
        builderMessage.textContent = `Некаторых літар няма ў гэтым слове!`;
        builderMessage.className = 'wordle-message error';
        setTimeout(() => builderMessage.className = 'wordle-message', 3000);
    }
}

function updateBuilderFoundWords() {
    // ИСПРАВЛЕНО: Очищаем UL и добавляем только LI, чтобы избежать дублирования заголовка <h4>
    builderFoundWordsList.innerHTML = ''; 

    // Применяем стили к UL (они есть в CSS, но для гарантии)
    builderFoundWordsList.style.listStyleType = 'none';
    builderFoundWordsList.style.display = 'flex';
    builderFoundWordsList.style.flexWrap = 'wrap';
    builderFoundWordsList.style.gap = '10px';

    const sortedWords = Array.from(builderGameState.foundWords).sort((a, b) => a.length === b.length ? a.localeCompare(b) : b.length - a.length);
    
    // Добавляем только LI элементы
    sortedWords.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        li.style.backgroundColor = 'var(--primary-color)';
        li.style.color = 'white';
        li.style.padding = '4px 10px';
        li.style.borderRadius = '4px';
        li.style.fontSize = '0.9rem';
        li.style.fontWeight = '600';
        
        builderFoundWordsList.appendChild(li);
    });
}

function updateBuilderScore() {
    builderScore.textContent = `Слоў: ${builderGameState.foundWords.size}${builderGameState.allPossibleWords.length > 0 ? '/' + builderGameState.allPossibleWords.length : ''}`;
}

// УДАЛЕНА ФУНКЦИЯ showPossibleWordCount (бывшая giveBuilderHint)

// НОВАЯ ФУНКЦЫЯ: паказвае не знойдзеныя словы
function showUnfoundWords() {
    const unfoundWords = builderGameState.allPossibleWords.filter(word => !builderGameState.foundWords.has(word));
    
    if (unfoundWords.length === 0) {
        builderMessage.textContent = 'Усе словы знойдзены! Віншую!';
        builderMessage.className = 'wordle-message success';
        setTimeout(() => builderMessage.className = 'wordle-message', 3000);
        return;
    }

    // Сохраняем ссылку на текущий заголовок
    const container = builderFoundWordsList.parentElement; 
    const originalHeader = container.querySelector('h4');
    const originalHeaderText = originalHeader.textContent; 

    // 1. Временно меняем заголовок
    originalHeader.textContent = `Не знойдзена (${unfoundWords.length}) (Слоўнік):`;
    
    // 2. Очищаем UL
    builderFoundWordsList.innerHTML = '';
    
    // 3. Сортируем и заполняем список (используем тот же UL)
    unfoundWords.sort((a, b) => b.length - a.length);

    unfoundWords.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        // Используем стили для ненайденных слов
        li.style.backgroundColor = 'var(--text-light)'; 
        li.style.color = 'white';
        li.style.padding = '4px 10px';
        li.style.borderRadius = '4px';
        li.style.fontSize = '0.9rem';
        li.style.fontWeight = '600';
        builderFoundWordsList.appendChild(li);
    });

    builderMessage.textContent = 'Паказаны словы, якія вы не знайшлі. Для вяртання да знойдзеных слоў увядзіце новае слова або націсніце "Новая гульня".';
    builderMessage.className = 'wordle-message error';
    
    // 4. Восстанавливаем список найденных слов и заголовок через 10 секунд
    setTimeout(() => {
        if (!builderGameState.gameOver) {
            originalHeader.textContent = originalHeaderText; // Восстанавливаем заголовок
            updateBuilderFoundWords(); // Восстанавливает список найденных слов
            builderMessage.textContent = '';
        }
    }, 10000);
}

function initializeWordle() {
    if (wordleWords.length === 0) {
        console.error("Словарь Wordle пуст, игра не может быть инициализирована.");
        return;
    }
    
    // Choose a target word that is not too common, if possible (simplification: random choice)
    wordleGameState.targetWord = wordleWords[Math.floor(Math.random() * wordleWords.length)];
    
    createWordleGrid();
    createWordleKeyboard();
    updateAttemptsCount(); 
    
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
            
            // Check for previous evaluations to color the key
            const keyLower = key.toLowerCase();
            let keyClass = '';

            // Check if the key was marked 'correct' or 'present' in any row
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
            // Fallback check for 'absent' if not correct/present
            if (!keyClass) {
                let isAbsent = true;
                for(let r = 0; r < wordleGameState.currentRow; r++) {
                    if (wordleGameState.grid[r].includes(keyLower)) {
                        isAbsent = false;
                        break;
                    }
                }
                if (isAbsent && wordleGameState.attempts > 0) {
                    keyClass = 'absent';
                }
            }


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

function handleWordleKeyPress(key) {
    if (wordleGameState.gameOver) return;
    
    if (key === 'Enter') {
        submitWordleGuess();
    } else if (key === 'Backspace') {
        deleteWordleLetter();
    } else {
        const lowerCaseKey = key.toLowerCase();
        if (belarusianAlphabet.includes(lowerCaseKey) && lowerCaseKey.length === 1) {
            addWordleLetter(lowerCaseKey);
        }
    }
}

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
    
    const guess = getCurrentGuess(); // Guess в нижнем регистре
    
    // Check if the word is in the 5-letter list (or full list for flexibility)
    if (!wordleWords.includes(guess) && !fullDictionary.has(guess)) { 
        showWordleMessage('Слова не знойдзена ў слоўніку Wordle!', 'error');
        shakeCurrentRow();
        return; 
    }
    
    evaluateWordleGuess(guess);
}

function getCurrentGuess() {
    return wordleGameState.grid[wordleGameState.currentRow].join('');
}

function evaluateWordleGuess(guess) {
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
        let keyText = wordleGameState.grid[wordleGameState.currentRow][i];
        if (keyText !== APOSTROPHE) {
             keyText = keyText.toUpperCase();
        }
        const key = document.querySelector(`.keyboard-key[data-key="${keyText}"]`); 
        
        setTimeout(() => {
            if (cell) {
                cell.classList.add('flip');
                
                setTimeout(() => {
                    cell.classList.add(result[i]);
                    cell.classList.remove('flip');
                    
                    if (key) {
                        // Update keyboard color: correct > present > absent
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

function giveWordleHint() {
    if (wordleGameState.gameOver) {
        showWordleMessage('Гульня скончана!', 'warning');
        return;
    }

    if (wordleGameState.attempts >= 2) {
        const unrevealedPositions = [];
        for (let i = 0; i < WORD_LENGTH; i++) {
            // Check if the cell is not yet 'correct'
            const cell = document.querySelector(
                `.wordle-cell[data-row="${wordleGameState.currentRow}"][data-col="${i}"]`
            );
            if (!cell || !cell.classList.contains('correct')) {
                 unrevealedPositions.push(i);
            }
        }
        
        if (unrevealedPositions.length > 0) {
            const randomPos = unrevealedPositions[Math.floor(Math.random() * unrevealedPositions.length)];
            const correctLetter = wordleGameState.targetWord[randomPos]; 
            
            // Add the correct letter to the current guess position
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

function resetWordleGame(newWord = true) {
    if (wordleWords.length === 0) {
        loadAndInitializeGames(); 
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
    createWordleKeyboard(); // Recreate keyboard to reset classes
    
    showWordleMessage('');
    hideTargetWord();
    updateAttemptsCount();
    
    console.log('Wordle Target word:', wordleGameState.targetWord);
}


// --- MAIN APP FUNCTIONS ---

function getDailyWord() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const diff = today.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
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
        
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const diff = date.getTime() - startOfYear.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
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
    let belarusianVoice = voices.find(voice => voice.lang.includes('be') || voice.lang.includes('BY'));
    // THIS LINE NEEDS TO BE CHANGED BECAUSE WTF
    if (!belarusianVoice) {
         belarusianVoice = voices.find(voice => voice.lang.includes('ru'));
    }

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
        saveWordButton.style.borderColor = '#28a745';
        saveWordButton.style.color = 'white';
        setTimeout(() => {
            saveWordButton.textContent = 'Захаваць';
            saveWordButton.style.backgroundColor = '';
            saveWordButton.style.borderColor = 'var(--primary-color)';
            saveWordButton.style.color = 'var(--primary-color)';
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
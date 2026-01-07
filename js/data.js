const wordsDatabase = [
    {
        word: "Прывітанне",
        pronunciation: "пры-ві-та́н-не",
        definition: "Слова ці выраз, якімі вітаюцца пры сустрэчы.",
        example: "Прывітанне, сябры! Як вашы справы!"
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
    },
     {
        word: "Малайчынка",
        pronunciation: "ма-лай-чын-ка",
        definition: "Блізкія адносіны, заснаваныя на ўзаемнай даверы, павазе.",
        example: "Іх сяброўства працягвалася з дзяцінства."
    }
];

const WORDS_FILE_PATH_5 = 'words5.txt'; 
const WORDS_FILE_PATH_FULL = 'words.txt'; 

const WORD_LENGTH = 5;
const APOSTROPHE = "'";
const FALLBACK_WORDS_WORDLE = [
    "сонца", "вочы", "сэрца", "песня", 
    "кніга", "школа", "мова", "зорка", "кветка",
    "вокны", "дзверы", "стол", "стул", "люстра"
];

const BUILDER_WORD_MIN_LENGTH = 8;
const BUILDER_WORD_MAX_LENGTH = 10;
const FALLBACK_WORDS_BUILDER = ["перавага", "заставацца", "настаўнік"];

const belarusianAlphabet = [
    'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'і', 
    'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 
    'у', 'ў', 'ф', 'х', 'ц', 'ч', 'ш', 'ы', 'ь', 'э', 'ю', 'я', APOSTROPHE
];

let soundEnabled = true;
let savedWords = JSON.parse(localStorage.getItem('savedWords')) || [];

let wordleWords = []; 
let fullDictionary = new Set(); 

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

let builderGameState = {
    sourceWord: '',
    sourceLetters: {}, 
    foundWords: new Set(),
    allPossibleWords: [],
    gameOver: false
};

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

const wordleModal = document.getElementById('wordle-modal');
const wordleGrid = document.getElementById('wordle-grid');
const wordleKeyboard = document.getElementById('wordle-keyboard');
const wordleSubmit = document.getElementById('wordle-submit');
const wordleReset = document.getElementById('wordle-reset');
const wordleHint = document.getElementById('wordle-hint');
const wordleMessage = document.getElementById('wordle-message');
const wordleTarget = document.getElementById('wordle-target');
const attemptsCount = document.getElementById('attempts-count');
const wordleLoading = document.getElementById('wordle-loading');

const wordBuilderModal = document.getElementById('word-builder-modal');
const builderSourceWordDisplay = document.getElementById('builder-source-word');
const builderInput = document.getElementById('builder-input');
const builderSubmit = document.getElementById('builder-submit');
const builderMessage = document.getElementById('builder-message');
const builderFoundWordsList = document.getElementById('builder-found-words');
const builderNewGameButton = document.getElementById('builder-new-game');
const builderShowUnfoundButton = document.getElementById('builder-show-unfound'); 
const builderScore = document.getElementById('builder-score');
const builderCloseModal = document.querySelector('.word-builder-close');
const builderLoading = document.getElementById('builder-loading');
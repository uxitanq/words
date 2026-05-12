// Belarusian words database with June-themed words
const wordsDatabase = [
    {
        word: "Чэрвень",
        pronunciation: "чэ́р-вень",
        definition: "Шосты месяц календарнага года, першы месяц лета.",
        example: "Чэрвень — гэта пачатак лета і самых доўгіх дзён."
    },
    {
        word: "Сонца",
        pronunciation: "со́н-ца",
        definition: "Зорка, вакол якой абарачаецца Зямля, крыніца святла і цяпла.",
        example: "У чэрвені сонца свеціць асабліва ярка і доўга."
    },
    {
        word: "Кветка",
        pronunciation: "кве́т-ка",
        definition: "Орган расліны, які служыць для размнажэння; часта мае яркую афарбоўку.",
        example: "У чэрвені расквітае шмат прыгожых кветак."
    },
    {
        word: "Васілёк",
        pronunciation: "ва-сі-лё́к",
        definition: "Кветка сіняга колеру, якая расце ў жыце і з'яўляецца сімвалам Беларусі.",
        example: "У полі сярод жыта сінеюць васількі."
    },
    {
        word: "Суніца",
        pronunciation: "су-ні́-ца",
        definition: "Шматгадовая травяністая расліна з духмянымі чырвонымі ягадамі.",
        example: "У чэрвені паспяваюць першыя лясныя суніцы."
    },
    {
        word: "Вячэрні",
        pronunciation: "вя-чэ́р-ні",
        definition: "Які адбываецца, бывае ўвечары; звязаны з вечарам.",
        example: "Вячэрні чэрвеньскі змрок ахутвае горад."
    },
    {
        word: "Купалле",
        pronunciation: "ку-па́л-ле",
        definition: "Старажытнае народнае свята летняга сонцастаяння.",
        example: "На Купалле дзяўчаты плятуць вянкі і пускаюць іх па вадзе."
    },
    {
        word: "Пралеска",
        pronunciation: "пра-ле́с-ка",
        definition: "Ранняя веснавая кветка з блакітнымі або сінімі пялёсткамі.",
        example: "Пралескі прабіваюцца праз апошні снег."
    },
    {
        word: "Рамонкі",
        pronunciation: "ра-мо́н-кі",
        definition: "Кветкі з белымі пялёсткамі і жоўтай сярэдзінай.",
        example: "Дзяўчына гадае на рамонках: любіць — не любіць."
    },
    {
        word: "Вясёлка",
        pronunciation: "вя-сё́л-ка",
        definition: "Аптычная з'ява ў атмасферы пасля дажджу ў выглядзе рознакаляровай дугі.",
        example: "Пасля чэрвеньскай навальніцы на небе з'явілася яркая вясёлка."
    },
    {
        word: "Летуценне",
        pronunciation: "ле-ту-це́н-не",
        definition: "Стан, калі чалавек аддаецца марам, фантазіям.",
        example: "Цёплы чэрвеньскі вечар схіляе да летуцення."
    },
    {
        word: "Спеў",
        pronunciation: "спеў",
        definition: "Мелодыя, якую ствараюць птушкі; птушыныя гукі.",
        example: "Раніца ў чэрвені пачынаецца з птушынага спеву."
    },
    {
        word: "Ліпень",
        pronunciation: "лі́-пень",
        definition: "Сёмы месяц календарнага года, другі месяц лета.",
        example: "Ліпень — самы гарачы месяц года."
    },
    {
        word: "Пчала",
        pronunciation: "пча-ла́",
        definition: "Насякомае, якое збірае нектар з кветак і выпрацоўвае мёд.",
        example: "Пчолы гудуць над квітнеючай ліпай."
    },
    {
        word: "Радасць",
        pronunciation: "ра́-дасць",
        definition: "Пачуццё задавальнення, шчасця, прыемнае ўзрушэнне.",
        example: "Першы цёплы дзень лета прыносіць радасць."
    },
    {
        word: "Любоў",
        pronunciation: "лю-бо́ў",
        definition: "Моцнае пачуццё глыбокай прыхільнасці.",
        example: "Любоў да роднай прыроды абуджаецца ў чэрвені."
    },
    {
        word: "Сяброўства",
        pronunciation: "ся-бро́ў-ства",
        definition: "Блізкія адносіны, заснаваныя на ўзаемнай даверы, павазе.",
        example: "Летам сяброўства становіцца яшчэ мацнейшым."
    },
    {
        word: "Прывітанне",
        pronunciation: "пры-ві-та́н-не",
        definition: "Слова ці выраз, якімі вітаюцца пры сустрэчы.",
        example: "Прывітанне, сонечная раніца чэрвеня!"
    },
    {
        word: "Вандроўка",
        pronunciation: "ван-дро́ў-ка",
        definition: "Падарожжа, паездка з мэтай адпачынку ці пазнання новых месцаў.",
        example: "Чэрвень — выдатны час для вандроўкі па Беларусі."
    },
    {
        word: "Ноч",
        pronunciation: "ноч",
        definition: "Частка сутак ад заходу да ўзыходу сонца.",
        example: "Самая кароткая ноч у годзе — купальская."
    },
    {
        word: "Вогнішча",
        pronunciation: "во́г-ніш-ча",
        definition: "Вялікае полымя, агмень, які раскладваюць на адкрытым паветры.",
        example: "На Купалле праз вогнішча скачуць смельчакі."
    },
    {
        word: "Прырода",
        pronunciation: "пры-ро́-да",
        definition: "Усё існае ў Сусвеце, арганічны і неарганічны свет.",
        example: "У чэрвені прырода расквітае ў поўную сілу."
    },
    {
        word: "Рака",
        pronunciation: "ра-ка́",
        definition: "Прыродны водны паток, які цячэ ў выпрацаваным ім рэчышчы.",
        example: "Вада ў рэчцы ў чэрвені становіцца цёплай."
    },
    {
        word: "Вянок",
        pronunciation: "вя-но́к",
        definition: "Упрыгожанне, сплеценае з кветак, лісця, галінак.",
        example: "Дзяўчаты плятуць вянкі з палявых кветак."
    },
    {
        word: "Свята",
        pronunciation: "свя́-та",
        definition: "Дзень або дні, калі адзначаюць якую-небудзь падзею.",
        example: "У чэрвені шмат сонечных і радасных свят."
    },
    {
        word: "Беларусь",
        pronunciation: "бе-ла-ру́сь",
        definition: "Краіна ва Усходняй Еўропе, радзіма беларусаў.",
        example: "Беларусь у чэрвені асабліва прыгожая."
    },
    {
        word: "Воблака",
        pronunciation: "во́б-ла-ка",
        definition: "Вялікае белае або шэрае ўтварэнне на небе з вадзяных кропель.",
        example: "Па небе плывуць лёгкія белыя воблакі."
    },
    {
        word: "Вецер",
        pronunciation: "ве́-цер",
        definition: "Рух паветра ў гарызантальным накірунку.",
        example: "Лёгкі летні вецер калыша траву."
    },
    {
        word: "Дождж",
        pronunciation: "дождж",
        definition: "Ападкі ў выглядзе кропель вады.",
        example: "Цёплы чэрвеньскі дождж напаіў зямлю."
    },
    {
        word: "Вясна",
        pronunciation: "вяс-на́",
        definition: "Пара года паміж зімой і летам.",
        example: "Чэрвень — гэта ўжо пачатак лета, а не вясна."
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
let isFirstVisit = !localStorage.getItem('hasVisited');

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

// DOM elements - only main page elements
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

const crosswordleButton = document.getElementById('crosswordle-btn');
const wordleButton = document.getElementById('wordle-btn');
const wordBuilderButton = document.getElementById('word-builder-btn');

const crosswordleModal = document.getElementById('crosswordle-modal');
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

// Crosswordle DOM elements - делаем их через функции-геттеры или проверяем при использовании
function getCrosswordleGrid() { return document.getElementById('crosswordle-grid'); }
function getCrosswordleClues() { return document.getElementById('crosswordle-clues'); }
function getCrosswordleInput() { return document.getElementById('crosswordle-input'); }
function getCrosswordleSubmitBtn() { return document.getElementById('crosswordle-submit'); }
function getCrosswordleMessage() { return document.getElementById('crosswordle-message'); }
function getCrosswordleScore() { return document.getElementById('crosswordle-score'); }
function getCrosswordleHintBtn() { return document.getElementById('crosswordle-hint'); }
function getCrosswordleReset() { return document.getElementById('crosswordle-reset'); }
function getCrosswordleLoading() { return document.getElementById('crosswordle-loading'); }
function getCrosswordleSelectWord() { return document.getElementById('crosswordle-select-word'); }
function getCrosswordleAttempts() { return document.getElementById('crosswordle-attempts'); }
function getCrosswordleKeyboard() { return document.getElementById('crosswordle-keyboard'); }

var crosswordleGameState = {
    words: [],
    grid: [],
    cellStates: {},
    selectedCell: null,
    totalCells: 0,
    correctCells: 0,
    moves: 0,
    gameOver: false,
    hintsRemaining: 3
};
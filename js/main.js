document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadAndInitializeGames();
    checkFirstVisit();
    setupTabNavigation();
});

function checkFirstVisit() {
    const hasVisited = localStorage.getItem('hasVisited');
    const welcomeOverlay = document.getElementById('welcome-overlay');
    
    if (!hasVisited && welcomeOverlay) {
        welcomeOverlay.style.display = 'flex';
        const startBtn = document.getElementById('start-exploring');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                welcomeOverlay.style.display = 'none';
                localStorage.setItem('hasVisited', 'true');
            });
        }
    }
}

function setupTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (navButtons.length === 0 || tabContents.length === 0) {
        console.warn('Tab navigation elements not found');
        return;
    }
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetTab = this.getAttribute('data-tab');
            
            if (!targetTab) return;
            
            navButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            const targetElement = document.getElementById(`${targetTab}-tab`);
            if (targetElement) {
                targetElement.classList.add('active');
            }
        });
    });
}

async function loadAndInitializeGames() {
    const wordleLoading = document.getElementById('wordle-loading');
    const builderLoading = document.getElementById('builder-loading');
    
    if (wordleLoading) wordleLoading.textContent = 'Загрузка...';
    await loadWordleWords();
    if (wordleLoading) wordleLoading.textContent = '';
    if (typeof initializeWordle === 'function') initializeWordle();

    if (builderLoading) builderLoading.textContent = 'Загрузка...';
    await loadFullDictionary();
    if (builderLoading) builderLoading.textContent = '';
    if (typeof initializeWordBuilder === 'function') initializeWordBuilder();
    if (typeof initializeCrosswordle === 'function') initializeCrosswordle();
}

function initializeApp() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        currentDateElement.textContent = today.toLocaleDateString('be-BY', options);
    }
    
    const dailyWord = getDailyWord();
    displayWord(dailyWord);
    displayPreviousWords();
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    const savedSoundPreference = localStorage.getItem('soundEnabled');
    if (savedSoundPreference !== null) {
        soundEnabled = savedSoundPreference === 'true';
        updateSoundIcon();
    }
}

function setupEventListeners() {
    // Theme toggle
    const themeToggleEl = document.getElementById('theme-toggle');
    if (themeToggleEl) {
        themeToggleEl.addEventListener('click', toggleTheme);
    }
    
    // Sound toggle
    const soundToggleEl = document.getElementById('sound-toggle');
    if (soundToggleEl) {
        soundToggleEl.addEventListener('click', toggleSound);
    }
    
    // Word actions
    const speakBtn = document.getElementById('speak-word');
    if (speakBtn) speakBtn.addEventListener('click', speakWord);
    
    const saveBtn = document.getElementById('save-word');
    if (saveBtn) saveBtn.addEventListener('click', saveWord);
    
    const shareBtn = document.getElementById('share-word');
    if (shareBtn) shareBtn.addEventListener('click', shareWord);
    
    // Donate modal
    const donateModalEl = document.getElementById('donate-modal');
    const donateBtnEl = document.getElementById('donate-btn');
    if (donateBtnEl && donateModalEl) {
        donateBtnEl.addEventListener('click', () => {
            donateModalEl.style.display = 'block';
        });
    }
    
    // Game buttons - open modals
    const crosswordleBtn = document.getElementById('crosswordle-btn');
    const crosswordleModalEl = document.getElementById('crosswordle-modal');
    if (crosswordleBtn && crosswordleModalEl) {
        crosswordleBtn.addEventListener('click', () => {
            crosswordleModalEl.style.display = 'block';
            if (typeof startNewCrosswordleGame === 'function') {
                startNewCrosswordleGame();
            }
        });
    }
    
    const wordleBtn = document.getElementById('wordle-btn');
    const wordleModalEl = document.getElementById('wordle-modal');
    if (wordleBtn && wordleModalEl) {
        wordleBtn.addEventListener('click', () => {
            wordleModalEl.style.display = 'block';
            if (typeof resetWordleGame === 'function') {
                resetWordleGame(false);
            }
        });
    }
    
    const wordBuilderBtn = document.getElementById('word-builder-btn');
    const wordBuilderModalEl = document.getElementById('word-builder-modal');
    if (wordBuilderBtn && wordBuilderModalEl) {
        wordBuilderBtn.addEventListener('click', () => {
            wordBuilderModalEl.style.display = 'block';
            if (typeof startNewWordBuilderGame === 'function') {
                startNewWordBuilderGame();
            }
        });
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    // Close modals on outside click
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Donate options
    document.querySelectorAll('.donate-option').forEach(option => {
        option.addEventListener('click', function() {
            if (this.textContent === 'Іншая сума') {
                const amount = prompt('Увядзіце суму ў BYN:');
                if (amount && !isNaN(amount)) {
                    alert(`Дзякуй за падтрымку! Сумa: ${amount} BYN`);
                    if (donateModalEl) donateModalEl.style.display = 'none';
                }
            } else {
                alert(`Дзякуй за падтрымку! ${this.textContent}`);
                if (donateModalEl) donateModalEl.style.display = 'none';
            }
        });
    });
    
    // Wordle keyboard clicks (виртуальная клавиатура)
    const wordleKeyboardEl = document.getElementById('wordle-keyboard');
    if (wordleKeyboardEl) {
        wordleKeyboardEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('keyboard-key')) {
                const key = e.target.dataset.key;
                if (key && typeof handleWordleKeyPress === 'function') {
                    handleWordleKeyPress(key);
                }
            }
        });
    }
    
    // Wordle control buttons
    const wordleSubmitBtn = document.getElementById('wordle-submit');
    if (wordleSubmitBtn && typeof submitWordleGuess === 'function') {
        wordleSubmitBtn.addEventListener('click', submitWordleGuess);
    }
    
    const wordleResetBtn = document.getElementById('wordle-reset');
    if (wordleResetBtn && typeof resetWordleGame === 'function') {
        wordleResetBtn.addEventListener('click', () => resetWordleGame(true));
    }
    
    const wordleHintBtn = document.getElementById('wordle-hint');
    if (wordleHintBtn && typeof giveWordleHint === 'function') {
        wordleHintBtn.addEventListener('click', giveWordleHint);
    }
    
    // Crosswordle controls
    const crosswordleHintBtn = document.getElementById('crosswordle-hint');
    if (crosswordleHintBtn && typeof giveCrosswordleHint === 'function') {
        crosswordleHintBtn.addEventListener('click', giveCrosswordleHint);
    }
    
    const crosswordleResetBtn = document.getElementById('crosswordle-reset');
    if (crosswordleResetBtn && typeof resetCrosswordleGame === 'function') {
        crosswordleResetBtn.addEventListener('click', resetCrosswordleGame);
    }
    
    // Word Builder controls
    const builderSubmitBtn = document.getElementById('builder-submit');
    if (builderSubmitBtn && typeof submitBuilderGuess === 'function') {
        builderSubmitBtn.addEventListener('click', submitBuilderGuess);
    }
    
    const builderNewGameBtn = document.getElementById('builder-new-game');
    if (builderNewGameBtn && typeof startNewWordBuilderGame === 'function') {
        builderNewGameBtn.addEventListener('click', startNewWordBuilderGame);
    }
    
    const builderShowUnfoundBtn = document.getElementById('builder-show-unfound');
    if (builderShowUnfoundBtn && typeof showUnfoundWords === 'function') {
        builderShowUnfoundBtn.addEventListener('click', showUnfoundWords);
    }
    
    const builderInputEl = document.getElementById('builder-input');
    if (builderInputEl && typeof submitBuilderGuess === 'function') {
        builderInputEl.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                submitBuilderGuess();
            }
        });
    }
}

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
    const dwEl = document.getElementById('daily-word');
    const wpEl = document.getElementById('word-pronunciation');
    const wdEl = document.getElementById('word-definition');
    const weEl = document.getElementById('word-example');
    
    if (dwEl) dwEl.textContent = wordData.word;
    if (wpEl) wpEl.textContent = wordData.pronunciation;
    if (wdEl) wdEl.textContent = wordData.definition;
    if (weEl) weEl.textContent = `"${wordData.example}"`;
}

function displayPreviousWords() {
    const pwEl = document.getElementById('previous-words-list');
    if (!pwEl) return;
    
    const today = new Date();
    pwEl.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const diff = date.getTime() - startOfYear.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        const wordIndex = dayOfYear % wordsDatabase.length;
        const wordData = wordsDatabase[wordIndex];
        
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item-card';
        wordItem.innerHTML = `
            <div class="word">${wordData.word}</div>
            <div class="date">${date.toLocaleDateString('be-BY')}</div>
        `;
        
        wordItem.addEventListener('click', () => {
            displayWord(wordData);
            const dwCard = document.querySelector('.daily-word-card');
            if (dwCard) dwCard.scrollIntoView({ behavior: 'smooth' });
        });
        
        pwEl.appendChild(wordItem);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    // Ищем иконку внутри кнопки theme-toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;
    
    // Ищем span с классом icon внутри кнопки
    const icon = themeToggleBtn.querySelector('.icon');
    if (!icon) {
        // Если нет .icon, ищем любой span
        const span = themeToggleBtn.querySelector('span');
        if (span) {
            span.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        return;
    }
    
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    updateSoundIcon();
}

function updateSoundIcon() {
    // Ищем иконку внутри кнопки sound-toggle
    const soundToggleBtn = document.getElementById('sound-toggle');
    if (!soundToggleBtn) return;
    
    const icon = soundToggleBtn.querySelector('.icon');
    if (!icon) {
        const span = soundToggleBtn.querySelector('span');
        if (span) {
            span.textContent = soundEnabled ? '🔊' : '🔇';
        }
        return;
    }
    
    icon.textContent = soundEnabled ? '🔊' : '🔇';
}

function speakWord() {
    if (!soundEnabled) return;
    
    const word = document.getElementById('daily-word')?.textContent;
    if (!word) return;
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'be-BY';
    utterance.rate = 0.8;
    
    const voices = speechSynthesis.getVoices();
    const belarusianVoice = voices.find(v => v.lang.includes('be') || v.lang.includes('BY')) 
                         || voices.find(v => v.lang.includes('ru'));
    
    if (belarusianVoice) utterance.voice = belarusianVoice;
    speechSynthesis.speak(utterance);
}

function saveWord() {
    const word = document.getElementById('daily-word')?.textContent;
    if (!word) return;
    
    if (!savedWords.includes(word)) {
        savedWords.push(word);
        localStorage.setItem('savedWords', JSON.stringify(savedWords));
        
        const btn = document.getElementById('save-word');
        if (btn) {
            btn.innerHTML = '<span>✅</span><span>Захавана!</span>';
            setTimeout(() => {
                btn.innerHTML = '<span>💾</span><span>Захаваць</span>';
            }, 2000);
        }
    } else {
        alert('Гэта слова ўжо захавана!');
    }
}

function shareWord() {
    const word = document.getElementById('daily-word')?.textContent;
    const definition = document.getElementById('word-definition')?.textContent;
    const example = document.getElementById('word-example')?.textContent;
    
    if (!word) return;
    
    const shareText = `Слова дня: ${word}\n\nАзначэнне: ${definition}\n\nПрыклад: ${example}\n\nДаведайцеся больш на belwords.by`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Беларускае слова дня',
            text: shareText,
            url: window.location.href
        }).catch(() => copyToClipboard(shareText));
    } else {
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => alert('Тэкст скапіяваны ў буфер абмену!'))
        .catch(() => alert('Не ўдалося скапіяваць.'));
}
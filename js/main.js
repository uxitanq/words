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
    wordleKeyboard.addEventListener('click', (e) => {
        if (e.target.classList.contains('keyboard-key')) {
            handleWordleKeyPress(e.target.dataset.key); 
        }
    });

    wordleSubmit.addEventListener('click', submitWordleGuess);
    wordleReset.addEventListener('click', () => resetWordleGame(true));
    wordleHint.addEventListener('click', giveWordleHint);

    builderSubmit.addEventListener('click', submitBuilderGuess);
    builderNewGameButton.addEventListener('click', startNewWordBuilderGame);
    builderShowUnfoundButton.addEventListener('click', showUnfoundWords); 
    builderInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            submitBuilderGuess();
        }
    });
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
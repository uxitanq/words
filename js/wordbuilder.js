function initializeWordBuilder() {
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
    
    const container = builderFoundWordsList.parentElement; 
    const originalHeader = container.querySelector('h4');
    originalHeader.textContent = 'Знойдзеныя словы:'; 

    updateBuilderFoundWords();
    updateBuilderScore();
    builderMessage.textContent = `Складзіце словы, якія можна стварыць з ${candidateWord.length} літар. Знойдзена 0.`;
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

    for (const word of fullDictionary) {
        if (word.length < 3 || word.length > sourceWord.length) continue;
        if (word.includes(APOSTROPHE)) continue;

        const wordLetters = getLetterCounts(word);
        let possible = true;

        for (const letter in wordLetters) {
            if (!sourceLetters[letter] || wordLetters[letter] > sourceLetters[letter]) {
                possible = false;
                break;
            }
        }

        if (possible) {
            possibleWords.push(word);
        }
    }
    return possibleWords.filter(w => w !== sourceWord);
}

function submitBuilderGuess() {
    if (builderGameState.gameOver) return;

    const guess = builderInput.value.trim().toLowerCase();
    builderInput.value = ''; 
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
        
        const container = builderFoundWordsList.parentElement; 
        const originalHeader = container.querySelector('h4');
        originalHeader.textContent = 'Знойдзеныя словы:'; 

        updateBuilderFoundWords();
        updateBuilderScore();
        
        if (builderGameState.foundWords.size === builderGameState.allPossibleWords.length && builderGameState.allPossibleWords.length > 0) {
            builderMessage.textContent = `Віншую! Вы знайшлі ўсе магчымыя словы!`;
            builderMessage.className = 'wordle-message success';
            builderGameState.gameOver = true;
        } else {
             builderMessage.textContent = `Выдатна! Знойдзена: ${guess}`;
             builderMessage.className = 'wordle-message success';
             setTimeout(() => builderMessage.className = 'wordle-message', 2000);
        }

    } else {
        builderMessage.textContent = `Не ўсе літары слова "${guess}" тут ёсць!`;
        builderMessage.className = 'wordle-message error';
        setTimeout(() => builderMessage.className = 'wordle-message', 3000);
    }
}

function updateBuilderFoundWords() {
    builderFoundWordsList.innerHTML = ''; 

    builderFoundWordsList.style.listStyleType = 'none';
    builderFoundWordsList.style.display = 'flex';
    builderFoundWordsList.style.flexWrap = 'wrap';
    builderFoundWordsList.style.gap = '10px';

    const sortedWords = Array.from(builderGameState.foundWords).sort((a, b) => a.length === b.length ? a.localeCompare(b) : b.length - a.length);
    
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

function showUnfoundWords() {
    const unfoundWords = builderGameState.allPossibleWords.filter(word => !builderGameState.foundWords.has(word));
    
    if (unfoundWords.length === 0) {
        builderMessage.textContent = 'Усе словы знойдзены! Віншую!';
        builderMessage.className = 'wordle-message success';
        setTimeout(() => builderMessage.className = 'wordle-message', 3000);
        return;
    }

    const container = builderFoundWordsList.parentElement; 
    const originalHeader = container.querySelector('h4');
    const originalHeaderText = originalHeader.textContent; 

    // 1. Временно меняем заголовок
    originalHeader.textContent = `Не знойдзена (${unfoundWords.length}) (Слоўнік):`;
    
    // 2. Очищаем UL
    builderFoundWordsList.innerHTML = '';
    
    // 3. Сортируем и заполняем список
    unfoundWords.sort((a, b) => b.length - a.length);

    unfoundWords.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
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
            originalHeader.textContent = originalHeaderText; 
            updateBuilderFoundWords(); 
            builderMessage.textContent = '';
        }
    }, 10000);
}
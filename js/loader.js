async function loadWordleWords() {
    try {
        const response = await fetch(WORDS_FILE_PATH_5);
        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
    
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

async function loadFullDictionary() {
    try {
        const response = await fetch(WORDS_FILE_PATH_FULL);
        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
       
        const words = text.trim()
                         .split('\n')
                         .map(word => word.trim().toLowerCase())
                         .filter(word => word.length > 2 && !word.includes(APOSTROPHE)); 
        
        fullDictionary = new Set(words);

        console.log(`Загружено слов в полный словарь: ${fullDictionary.size}`);
        
    } catch (error) {
        console.error("Ошибка загрузки файла words.txt. Word Builder будет использовать только резервные слова.", error);
        FALLBACK_WORDS_BUILDER.forEach(word => fullDictionary.add(word));
    }
}
let wordDictionaryPromise;

export const loadWordDictionary = () => {
    if (!wordDictionaryPromise) {
        wordDictionaryPromise = fetch('/dictionary/scrabble.txt')
            .then((response) => {
                if (!response.ok) throw new Error(`Dictionary request failed with ${response.status}`);
                return response.text();
            })
            .then(text => text.trim().split(/\r?\n/))
            .catch((error) => {
                wordDictionaryPromise = undefined;
                throw error;
            });
    }

    return wordDictionaryPromise;
};

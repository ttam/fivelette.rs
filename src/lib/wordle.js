export const tileStates = ['absent', 'present', 'correct'];

const statePriority = { absent: 1, present: 2, correct: 3 };

export const makeEmptyGuess = () => Array.from(
    { length: 5 },
    () => ({ letter: '', state: 'absent' }),
);

export const cycleTileState = (current) => {
    const index = tileStates.indexOf(current);
    return tileStates[(index + 1) % tileStates.length];
};

export const stateLabel = (state) => ({
    absent: 'not in the word',
    present: 'in the word but in the wrong spot',
    correct: 'in the right spot',
}[state] || 'unknown');

export const stateMark = (state) => ({ absent: '×', present: '•', correct: '✓' }[state] || '');
export const wordFromCells = cells => cells.map(cell => cell.letter).join('').toLowerCase();

export const scoreGuess = (guess, answer) => {
    const result = Array(5).fill('absent');
    const remaining = {};

    for (let index = 0; index < 5; index += 1) {
        if (guess[index] === answer[index]) {
            result[index] = 'correct';
        } else {
            remaining[answer[index]] = (remaining[answer[index]] || 0) + 1;
        }
    }

    for (let index = 0; index < 5; index += 1) {
        const letter = guess[index];
        if (result[index] !== 'correct' && remaining[letter] > 0) {
            result[index] = 'present';
            remaining[letter] -= 1;
        }
    }

    return result;
};

export const matchesClue = (word, cells) => {
    const guess = wordFromCells(cells);
    if (guess.length !== 5) return true;
    const expected = cells.map(cell => cell.state);
    return scoreGuess(guess, word).every((state, index) => state === expected[index]);
};

export const filterCandidates = (dictionary, clues) => dictionary.filter(
    word => clues.every(clue => matchesClue(word, clue)),
);

export const getKeyboardStates = (clues) => {
    const states = {};
    clues.forEach((cells) => {
        cells.forEach(({ letter, state }) => {
            if (!letter || (states[letter] && statePriority[states[letter]] >= statePriority[state])) return;
            states[letter] = state;
        });
    });
    return states;
};

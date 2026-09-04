import assert from 'node:assert/strict';
import {
    cycleTileState,
    filterCandidates,
    getKeyboardStates,
    matchesClue,
    scoreGuess,
} from '../src/lib/wordle.js';

const cellsFor = (guess, answer) => scoreGuess(guess, answer).map((state, index) => ({
    letter: guess[index],
    state,
}));

const tests = [
    ['scores exact, present, and absent tiles', () => {
        assert.deepEqual(
            scoreGuess('raise', 'cigar'),
            ['present', 'present', 'present', 'absent', 'absent'],
        );
    }],
    ['handles repeated letters without inventing extra matches', () => {
        assert.deepEqual(
            scoreGuess('allee', 'apple'),
            ['correct', 'present', 'absent', 'absent', 'correct'],
        );
    }],
    ['matches candidates by reproducing the complete Wordle feedback', () => {
        const clue = cellsFor('allee', 'apple');
        assert.equal(matchesClue('apple', clue), true);
        assert.equal(matchesClue('alley', clue), false);
    }],
    ['filters against multiple clues', () => {
        const words = ['cigar', 'rebut', 'sissy', 'humph', 'awake'];
        const clues = [cellsFor('raise', 'cigar'), cellsFor('cigar', 'cigar')];
        assert.deepEqual(filterCandidates(words, clues), ['cigar']);
    }],
    ['keeps the strongest known keyboard state', () => {
        const states = getKeyboardStates([[
            { letter: 'a', state: 'absent' },
            { letter: 'a', state: 'present' },
            { letter: 'a', state: 'correct' },
            { letter: 'b', state: 'absent' },
            { letter: '', state: 'absent' },
        ]]);
        assert.deepEqual(states, { a: 'correct', b: 'absent' });
    }],
    ['cycles tile states in the interaction order', () => {
        assert.equal(cycleTileState('absent'), 'present');
        assert.equal(cycleTileState('present'), 'correct');
        assert.equal(cycleTileState('correct'), 'absent');
    }],
];

let failures = 0;
tests.forEach(([name, test]) => {
    try {
        test();
        console.log(`✓ ${name}`);
    } catch (error) {
        failures += 1;
        console.error(`✗ ${name}`);
        console.error(error);
    }
});

if (failures) {
    process.exitCode = 1;
} else {
    console.log(`\n${tests.length} tests passed.`);
}

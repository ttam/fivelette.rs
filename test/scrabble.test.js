import assert from 'node:assert/strict';
import {
    canBuildWord,
    normaliseRack,
    scoreWord,
    solveRack,
} from '../src/lib/scrabble.js';

const tests = [
    ['normalises letters, blanks, and hyphen aliases', () => {
        assert.equal(normaliseRack(' Qu-iz! 123 '), 'qu?iz');
        assert.equal(normaliseRack('abcdefghijklmnop'), 'abcdefghijkl');
    }],
    ['requires the rack to contain repeated letters', () => {
        assert.equal(canBuildWord('letter', 'leter'), false);
        assert.equal(canBuildWord('letter', 'leter?'), true);
    }],
    ['uses blank tiles for missing letters', () => {
        assert.equal(canBuildWord('quiz', 'qui?'), true);
        assert.equal(canBuildWord('quiz', 'qu?x'), false);
    }],
    ['does not award points for letters supplied by blanks', () => {
        assert.equal(scoreWord('quiz', 'quiz'), 22);
        assert.equal(scoreWord('quiz', 'qui?'), 12);
    }],
    ['sorts matches by score, then length, then alphabetically', () => {
        assert.deepEqual(solveRack(['it', 'quiz', 'quit', 'qi'], 'quitz'), [
            { word: 'quiz', score: 22 },
            { word: 'quit', score: 13 },
            { word: 'qi', score: 11 },
            { word: 'it', score: 2 },
        ]);
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

if (failures) process.exitCode = 1;
else console.log(`\n${tests.length} tests passed.`);

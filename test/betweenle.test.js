import assert from 'node:assert/strict';
import {
    filterBetween,
    formatDistancePercentage,
    isCompleteBound,
    normaliseBound,
    normalisePercentage,
} from '../src/lib/betweenle.js';

const words = ['aahed', 'apple', 'berry', 'cigar', 'delta', 'eager', 'zymic'];

const tests = [
    ['normalises bound input to five lowercase letters', () => {
        assert.equal(normaliseBound(' C1i-GAR! '), 'cigar');
    }],
    ['recognises only complete five-letter bounds', () => {
        assert.equal(isCompleteBound('cigar'), true);
        assert.equal(isCompleteBound('ciga'), false);
    }],
    ['returns words strictly between two bounds', () => {
        assert.deepEqual(filterBetween(words, 'berry', 'delta'), ['cigar']);
    }],
    ['supports a lower or upper bound on its own', () => {
        assert.deepEqual(filterBetween(words, 'eager'), ['zymic']);
        assert.deepEqual(filterBetween(words, '', 'cigar'), ['aahed', 'apple', 'berry']);
    }],
    ['rejects crossed bounds', () => {
        assert.deepEqual(filterBetween(words, 'delta', 'berry'), []);
    }],
    ['normalises percentage input for the game precision', () => {
        assert.equal(normalisePercentage(' 12.3% '), '12.3');
        assert.equal(normalisePercentage('2..456'), '2.45');
        assert.equal(normalisePercentage('125'), '100');
    }],
    ['formats percentages exactly as Betweenle displays them', () => {
        assert.equal(formatDistancePercentage(12.49), '12');
        assert.equal(formatDistancePercentage(9.96), '10');
        assert.equal(formatDistancePercentage(4.26), '4.3');
        assert.equal(formatDistancePercentage(0.456), '0.46');
    }],
    ['uses percentages from either bound to narrow by dictionary distance', () => {
        assert.deepEqual(filterBetween(words, 'berry', 'eager', '14', '29'), ['cigar']);
    }],
    ['supports the game placeholder endpoints for percentage clues', () => {
        assert.deepEqual(filterBetween(words, 'aaaaa', 'zzzzz', '14', '71'), ['apple']);
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

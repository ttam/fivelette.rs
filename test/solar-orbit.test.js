import assert from 'node:assert/strict';
import { parsePairs, solveSolarOrbit } from '../src/lib/solar-orbit.js';

const tests = [
    ['parses spaced, punctuated, or continuous pairs', () => {
        assert.deepEqual(parsePairs('AN, AU EM FA GO IC OM OR'), ['AN', 'AU', 'EM', 'FA', 'GO', 'IC', 'OM', 'OR']);
        assert.deepEqual(parsePairs('ANAUEMFAGOICOMOR'), ['AN', 'AU', 'EM', 'FA', 'GO', 'IC', 'OM', 'OR']);
        assert.equal(parsePairs('AN AU EM FA GO IC OM OR XX').length, 9);
    }],
    ['finds the shared centre and four complete words', () => {
        const dictionary = ['anthem', 'author', 'fathom', 'gothic', 'other'];
        assert.deepEqual(solveSolarOrbit(dictionary, ['AN', 'AU', 'EM', 'FA', 'GO', 'IC', 'OM', 'OR']), [{
            middle: 'TH',
            words: [
                { word: 'ANTHEM', start: 'AN', end: 'EM' },
                { word: 'AUTHOR', start: 'AU', end: 'OR' },
                { word: 'FATHOM', start: 'FA', end: 'OM' },
                { word: 'GOTHIC', start: 'GO', end: 'IC' },
            ],
        }]);
    }],
    ['uses every supplied pair exactly once', () => {
        const dictionary = ['captor', 'depths', 'laptop', 'tiptoe', 'tiptop'];
        const [solution] = solveSolarOrbit(dictionary, ['CA', 'DE', 'HS', 'LA', 'OE', 'OP', 'OR', 'TI']);
        assert.deepEqual(solution.words.map(item => item.word), ['CAPTOR', 'DEPTHS', 'LAPTOP', 'TIPTOE']);
    }],
    ['rejects four candidates that cannot form a complete orbit', () => {
        const dictionary = ['abcdef', 'abcdgh', 'abcdij', 'abcdkl'];
        assert.deepEqual(solveSolarOrbit(dictionary, ['AB', 'EF', 'GH', 'IJ', 'KL', 'MN', 'OP', 'QR']), []);
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

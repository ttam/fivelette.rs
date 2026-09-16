export const requiredPairCount = 8;

export const parsePairs = (value) => {
    const sequences = String(value).toUpperCase().match(/[A-Z]+/g) || [];
    return sequences
        .flatMap(sequence => sequence.match(/.{1,2}/g) || [])
        .filter(pair => pair.length === 2);
};

const groupCandidates = (words, pairs) => {
    const allowed = new Set(pairs);
    const groups = new Map();

    words.forEach((word) => {
        if (word.length !== 6) return;
        const start = word.slice(0, 2).toUpperCase();
        const end = word.slice(4).toUpperCase();
        if (!allowed.has(start) || !allowed.has(end)) return;

        const middle = word.slice(2, 4).toUpperCase();
        if (!groups.has(middle)) groups.set(middle, []);
        groups.get(middle).push({ word: word.toUpperCase(), start, end });
    });

    return groups;
};

const findMatchings = (pairs, candidates, limit = 20) => {
    const results = [];
    const seen = new Set();

    const visit = (unused, selected) => {
        if (results.length >= limit) return;
        if (unused.length === 0) {
            const key = selected.map(item => item.word).sort().join('|');
            if (!seen.has(key)) {
                seen.add(key);
                results.push([...selected].sort((left, right) => left.word.localeCompare(right.word)));
            }
            return;
        }

        const firstIndex = unused[0];
        const firstPair = pairs[firstIndex];

        for (let position = 1; position < unused.length; position += 1) {
            const secondIndex = unused[position];
            const secondPair = pairs[secondIndex];
            const matchingWords = candidates.filter(candidate => (
                (candidate.start === firstPair && candidate.end === secondPair)
                || (candidate.start === secondPair && candidate.end === firstPair)
            ));

            if (!matchingWords.length) continue;
            const remaining = unused.filter(index => index !== firstIndex && index !== secondIndex);
            matchingWords.forEach(candidate => visit(remaining, [...selected, candidate]));
        }
    };

    visit(pairs.map((_, index) => index), []);
    return results;
};

export const solveSolarOrbit = (dictionary, pairInput) => {
    const pairs = Array.isArray(pairInput) ? pairInput.map(pair => pair.toUpperCase()) : parsePairs(pairInput);
    if (pairs.length !== requiredPairCount || pairs.some(pair => !/^[A-Z]{2}$/.test(pair))) return [];

    const groups = groupCandidates(dictionary, pairs);
    const solutions = [];

    groups.forEach((candidates, middle) => {
        if (candidates.length < 4) return;
        findMatchings(pairs, candidates).forEach(words => solutions.push({ middle, words }));
    });

    return solutions.sort((left, right) => (
        left.middle.localeCompare(right.middle)
        || left.words.map(item => item.word).join('|').localeCompare(right.words.map(item => item.word).join('|'))
    ));
};

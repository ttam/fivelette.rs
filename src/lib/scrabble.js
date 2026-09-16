export const maxRackLength = 12;

export const letterValues = {
    a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1,
    j: 8, k: 5, l: 1, m: 3, n: 1, o: 1, p: 3, q: 10, r: 1,
    s: 1, t: 1, u: 1, v: 4, w: 4, x: 8, y: 4, z: 10,
};

export const normaliseRack = value => String(value)
    .toLowerCase()
    .replace(/-/g, '?')
    .replace(/[^a-z?]/g, '')
    .slice(0, maxRackLength);

const countRack = (rack) => {
    const letters = {};
    let blanks = 0;

    for (const character of rack) {
        if (character === '?') blanks += 1;
        else letters[character] = (letters[character] || 0) + 1;
    }

    return { letters, blanks };
};

export const canBuildWord = (word, rack) => {
    if (word.length < 2 || word.length > rack.length) return false;
    const { letters, blanks } = countRack(rack);
    let blanksUsed = 0;

    for (const character of word) {
        if (letters[character] > 0) letters[character] -= 1;
        else blanksUsed += 1;
        if (blanksUsed > blanks) return false;
    }

    return true;
};

export const scoreWord = (word, rack) => {
    const { letters } = countRack(rack);
    let score = 0;

    for (const character of word) {
        if (letters[character] > 0) {
            letters[character] -= 1;
            score += letterValues[character] || 0;
        }
    }

    return score;
};

export const solveRack = (dictionary, rackValue) => {
    const rack = normaliseRack(rackValue);
    if (rack.length < 2) return [];

    return dictionary
        .filter(word => canBuildWord(word, rack))
        .map(word => ({ word, score: scoreWord(word, rack) }))
        .sort((left, right) => (
            right.score - left.score
            || right.word.length - left.word.length
            || left.word.localeCompare(right.word)
        ));
};

export const normaliseBound = value => value.toLowerCase().replace(/[^a-z]/g, '').slice(0, 5);

export const isCompleteBound = value => /^[a-z]{5}$/.test(value);

export const normalisePercentage = (value) => {
    const cleaned = String(value).replace(/[^\d.]/g, '');
    const [whole = '', ...decimalParts] = cleaned.split('.');
    const hasDecimal = cleaned.includes('.');
    const decimal = decimalParts.join('').slice(0, 2);
    const combined = `${whole.slice(0, 3)}${hasDecimal ? `.${decimal}` : ''}`;

    if (combined === '.') return combined;
    if (Number(combined) > 100) return '100';
    return combined;
};

export const formatDistancePercentage = (distance) => {
    if (distance >= 10) return Math.round(distance).toFixed(0);
    if (distance >= 1) {
        const formatted = distance.toFixed(1);
        return formatted === '10.0' ? '10' : formatted;
    }
    return distance.toFixed(2);
};

const firstAfter = (words, value) => {
    let low = 0;
    let high = words.length;

    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (words[middle] <= value) low = middle + 1;
        else high = middle;
    }

    return low;
};

const firstAtOrAfter = (words, value) => {
    let low = 0;
    let high = words.length;

    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (words[middle] < value) low = middle + 1;
        else high = middle;
    }

    return low;
};

const boundaryIndex = (words, bound, side) => {
    const index = words.indexOf(bound);
    if (index >= 0) return index;
    if (side === 'after' && bound === 'aaaaa') return 0;
    if (side === 'before' && bound === 'zzzzz') return words.length - 1;
    return -1;
};

const percentageMatches = (candidateIndex, boundIndex, percentage, total) => {
    if (percentage === '') return true;
    if (boundIndex < 0 || !Number.isFinite(Number(percentage))) return false;

    const distance = Math.abs(candidateIndex - boundIndex) / total * 100;
    return Number(formatDistancePercentage(distance)) === Number(percentage);
};

export const filterBetween = (words, after = '', before = '', afterPercentage = '', beforePercentage = '') => {
    const lower = isCompleteBound(after) ? after : '';
    const upper = isCompleteBound(before) ? before : '';

    if (lower && upper && lower >= upper) return [];

    const start = lower ? firstAfter(words, lower) : 0;
    const end = upper ? firstAtOrAfter(words, upper) : words.length;
    const lowerIndex = lower ? boundaryIndex(words, lower, 'after') : -1;
    const upperIndex = upper ? boundaryIndex(words, upper, 'before') : -1;

    return words.slice(start, end).filter((word, offset) => {
        const candidateIndex = start + offset;
        return percentageMatches(candidateIndex, lowerIndex, afterPercentage, words.length)
            && percentageMatches(candidateIndex, upperIndex, beforePercentage, words.length);
    });
};

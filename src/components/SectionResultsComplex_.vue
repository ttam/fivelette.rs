<template>
    <section class="results">
        <p v-if="counter === 0">No matching words found</p>
        <p v-else>{{ counter.toLocaleString() }} words found.</p>
        <p class="monospace" v-if="counter <= threshold" v-html="highlightedWords"></p>
    </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useComplexStore } from '../stores/complex.js';

const getExpressionString = characters => {
    const allCharacters = `${characters}${excluded.value}`.toLowerCase();
    const unique = [...new Set(allCharacters.split(''))].sort().join('');

    return `(?![${unique}])[a-z]`
}

const store = useComplexStore();

if (Array.prototype.hasOwnProperty('toUnique') === false) {
    Array.prototype.toUnique = function () {
        return [...new Set(this)];
    };
}

const dictionary = ref([]);
const filter = expected => () => store.letters
    .filter(({ state }) => state === expected)
    .map(({ letter }) => letter)
    .sort()
    .toUnique();

const correct = computed(filter('correct'));
const excluded = computed(filter('exclude'));
const included = computed(filter('include'));

const mask = computed(() => {
    let mask = '?????';

    store.letters.forEach(({ letter, state }, i) => {
        if (state === 'correct') {
            const index = i % 5;
            // console.log(letter + ' correct at ' + index);

            mask = `${mask.substring(0, index)}${letter}${mask.substring(index + 1)}`;
        }
    });

    return mask;
});

const counter = computed(() => results.value.length);
// const highlightedWords = computed(() => results.value);


const highlightedWords = computed(() => results.value.map(i => i.split('').map((letter, index) => {
    const className = mask.value[index] === letter.toLowerCase() ? 'mask' : included.value.includes(letter) ? 'include' : '';

    return `<span class="${className}">${letter}</span>`;
}).join('')).join(' '));

// const included = computed(() => props.advanced ? pluck('include') : props.exclude);
//
const includedX = index => store.letters.map((i, j) => {
    return i.state === 'include' && j % 5 === index ? i.letter : null;
}).filter(i => i).sort().join('');
//
//
//
// const reveal = ref(true);
//
const threshold = 5000;
//

const results = computed(() => {
    let filtered = [...dictionary.value];

    // Remove any words containing a grey letter
    filtered = filtered.filter(word => word.match(new RegExp(`[${excluded.value.join('')}]`)) === null);

    // Find all words with green letters in the right position
    const maskExpression = new RegExp(mask.value.replaceAll('?', function (_, index) {
        console.log('we need to find all yellows at position ' + index);
        const allYellows = includedX(index);
        return getExpressionString(allYellows);
    }));

console.log({maskExpression});
    const expressionString = included.value.join('.*');

    const expression = new RegExp(expressionString);
    filtered = filtered.filter(word => word.match(maskExpression) !== null);
    // filtered = filtered.filter(word => word.match(new RegExp(`[${excluded.value.toLowerCase()}]`)) === null);
    //
    //     // filtered is now all words that contain the "yellow" letters
    //     // but it doesn't take order into account.
    //     // eg: "xoxxx" would match "house" even though "o" at the second position is yellow
    //
    //
    //
    // }

    return filtered;
});

fetch(`/dictionary/wordle.json`)
    .then(response => response.json())
    .then(words => dictionary.value = words);
</script>

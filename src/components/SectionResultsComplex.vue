<template>
    <section className="results">
        <p v-if="counter === 0">No matching words found</p>
        <p v-else>{{ counter.toLocaleString() }} words found.</p>
        <p className="monospace" v-if="counter <= threshold" v-html="highlightedWords"></p>
    </section>
</template>

<script setup>
import './../lib/toUnique.js';

const replaceChar = (source, index, character) => `${source.substring(0, index)}${character}${source.substring(index
    + 1)}`;

import { computed, ref } from 'vue';
import { useComplexStore } from '../stores/complex.js';

const store = useComplexStore();

const filter = expected => () => store.letters
    .filter(({ state }) => state === expected)
    .map(({ letter }) => letter)
    .sort()
    .toUnique();

const getMask = () => {
    // Start with an expressions to match the whole alphabet
    const positions = Array(5).fill('[abcdefghijklmnopqrstuvwxyz]');
    store.letters.forEach(({ letter, state }, i) => {
        const index = i % 5;

        // If the letter is correct then we need that letter in that position
        if (state === 'correct') {
            positions[index] = letter;
        }

        // If the letter is included but not in this position then
        // it must be removed from the expression for this index
        if (state === 'include') {
            positions[index] = positions[index].replace(letter, '');
        }
    });

    return new RegExp(positions.join(''));
}


const correct = computed(filter('correct'));
const excluded = computed(filter('exclude'));
const included = computed(filter('include'));



const counter = computed(() => words.value.length);

const dictionary = ref([]);

const threshold = 5000;

const words = computed(() => {
    let filtered = dictionary.value;

    // Start by removing any words containing $excluded letters
    filtered = filtered.filter(word => word.match(new RegExp(`[${excluded.value.join('').toLowerCase()}]`)) === null);

    // Now remove any words that don't contain all $included letters
    const expressionString = included.value.join('').toLowerCase().split('').toUnique().sort().join('.*');
    filtered = filtered.filter(word => word.split('').sort().join('').match(new RegExp(expressionString)) !== null);

    // Create a mask to match all $correct letters in the right position
    // and exclude $included letters in the wrong position
    const mask = getMask();
    filtered = filtered.filter(word => word.match(mask) !== null);

    return filtered;
});


const highlightedWords = computed(() => words.value.map(i => i.split('').map((letter, index) => {
    const className =
        correct.value.includes(letter) ? 'mask' : (included.value.includes(letter) ? 'include' : '');

    return `<span class="${className}">${letter}</span>`;
}).join('')).join(' '));

fetch(`/dictionary/wordle.json`)
    .then(response => response.json())
    .then(words => dictionary.value = words);
</script>

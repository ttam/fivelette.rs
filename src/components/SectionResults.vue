<template>
    <section class="results">
        <p v-if="counter === 0">No matching words found</p>
        <p v-else-if="counter > 200">{{ counter.toLocaleString() }} words found.</p>
        <p class="monospace" v-else v-html="highlightedWords"></p>
    </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useSimpleStore } from '../stores/simple.js';

const store = useSimpleStore();

const counter = computed(() => words.value.length);

const dictionary = ref([]);

const highlightedWords = computed(() => words.value.map(i => i.split('').map((letter, index) => {
    const className = store.getMask[index] === letter.toLowerCase() ? 'mask' : store.getInclude.includes(letter) ? 'include' : '';

    return `<span class="${className}">${letter}</span>`;
}).join('')).join(' '));

const words = computed(() => {
    let filtered = [...dictionary.value];

    const mask = new RegExp(store.getMask.replaceAll('?', '[a-z]'));
    filtered = filtered.filter(word => word.match(mask) !== null);

    filtered = filtered.filter(word => word.match(new RegExp(`[${store.getExclude}]`)) === null);

    const unique = (value, index, self) => self.indexOf(value) === index;
    const expressionString = store.getInclude.split('').filter(unique).sort().join('.*');
    const expression = new RegExp(expressionString);
    console.log(expression);

    filtered = filtered.filter(word => {
        const letters = word.split('').sort().join('');
        return letters.match(expression) !== null;
    });

    return filtered;
});

fetch(`/dictionary/wordle.json`)
    .then(response => response.json())
    .then(words => dictionary.value = words);
</script>

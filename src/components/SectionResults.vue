<template>
    <section class="results">
        <p v-if="counter === 0">No matching words found</p>
        <p v-else-if="counter > 200">{{ counter.toLocaleString('en-AU') }} words found.</p>
        <p class="monospace" v-else v-html="highlightedWords"></p>
    </section>
</template>

<script setup>
import { computed, ref } from 'vue';

const adjustedMask = computed(() => `${props.mask.toLowerCase()}?????`.substring(0, 5));

const counter = computed(() => words.value.length);

const dictionary = ref([]);

const highlightedWords = computed(() => words.value.map(i => i.split('').map((letter, index) => {
    const className = adjustedMask.value[index] === letter.toLowerCase() ? 'mask' : props.include.toLowerCase().includes(letter) ? 'include' : '';

    return `<span class="${className}">${letter}</span>`;
}).join('')).join(' '));

const words = computed(() => {
    let filtered = [...dictionary.value];

    if (props.mask !== '') {
        const mask = new RegExp(adjustedMask.value.replaceAll('?', '[a-z]'));
        filtered = filtered.filter(word => word.match(mask) !== null);
    }

    if (props.exclude !== '') {
        filtered = filtered.filter(word => word.match(new RegExp(`[${props.exclude.toLowerCase()}]`)) === null);
    }

    if (props.include !== '') {
        const unique = (value, index, self) => self.indexOf(value) === index;
        const expressionString = props.include.toLowerCase().split('').filter(unique).sort().join('.*');
        const expression = new RegExp(expressionString);

        filtered = filtered.filter(word => {
            const letters = word.split('').sort().join('');
            return letters.match(expression) !== null;
        });
    }

    return filtered;
});

const props = defineProps({
    exclude: String,
    include: String,
    mask: String,
})

fetch(`/dictionary/wordle.json`)
    .then(response => response.json())
    .then(words => dictionary.value = words);
</script>

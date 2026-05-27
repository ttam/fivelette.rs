<template>
    <section class="grid">
        <div :class="store.letters[i]['state']" @click="store.cycleState(i)" :key="i" v-for="(_, i) in 30">
            {{ store.letters[i]['letter'] }}
        </div>
    </section>
</template>

<style>
.grid {
    display: grid;
    grid-gap: var(--cell-gap);
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(6, 1fr);

    max-height: calc(var(--cell-size) * 6 + var(--cell-gap) * 5);
    max-width: calc(var(--cell-size) * 5 + var(--cell-gap) * 4);

    text-transform: uppercase;
}

.grid > div {
    aspect-ratio: 1;
    border: 2px solid #3a3a3c;
    font-size: 2rem;
    height: var(--cell-size);
    line-height: var(--cell-size);
    text-align: center;
}

.grid > div.initial:not(:empty) {
    border-color: #565758;
}

.grid > div.correct {
    background: var(--bg-correct);
    color: var(--fg-correct);
}

.grid > div.exclude {
    background: var(--bg-exclude);
    color: var(--fg-exclude);
}

.grid > div.include {
    background: var(--bg-include);
    color: var(--fg-include);
}
</style>

<script setup>
import { onUnmounted } from 'vue';
import { useComplexStore } from '../stores/complex.js';

const store = useComplexStore();

const handleInput = ({ key }) => {
    if (key === 'Backspace') {
        store.removeLetter();
        return;
    }

    if (key.match(/^[a-zA-Z]$/)) {
        store.setLetter(key.toLowerCase());
    }
};

window.addEventListener('keyup', handleInput);

onUnmounted(() => {
    window.removeEventListener('keyup', handleInput);
});
</script>

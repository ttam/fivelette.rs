<template>
    <div class="guess-row" role="group" :aria-label="label">
        <button
            v-for="(cell, index) in cells"
            :key="index"
            class="guess-tile"
            :class="{ 'is-empty': !cell.letter }"
            type="button"
            :data-state="cell.state"
            :disabled="!cell.letter"
            :aria-label="tileLabel(cell, index)"
            @click="$emit('cycle', index)"
        >
            <span>{{ cell.letter }}</span>
        </button>
    </div>
</template>

<script setup>
import { stateLabel } from '../lib/wordle.js';

defineProps({
    cells: { type: Array, required: true },
    label: { type: String, required: true },
});

defineEmits(['cycle']);

const tileLabel = (cell, index) => cell.letter
    ? `${cell.letter.toUpperCase()}, ${stateLabel(cell.state)}. Tap to change colour.`
    : `Letter ${index + 1}, empty`;
</script>

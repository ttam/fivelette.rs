<template>
    <div class="keyboard" role="group" aria-label="Letter keyboard">
        <div v-for="(row, rowIndex) in rows" :key="rowIndex" class="keyboard-row">
            <button
                v-for="key in row"
                :key="key"
                class="keyboard-key"
                :class="{ 'is-wide': key.length > 1 }"
                type="button"
                :data-state="letterStates[key] || null"
                :disabled="disabled || (key === 'Enter' && !canSubmit)"
                :aria-label="keyLabel(key)"
                @click="$emit('key', key)"
            >
                <span v-if="key === 'Backspace'" aria-hidden="true">⌫</span>
                <span v-else>{{ key }}</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { stateLabel } from '../lib/wordle.js';

const props = defineProps({
    letterStates: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    canSubmit: { type: Boolean, default: false },
});

defineEmits(['key']);

const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
];

const keyLabel = (key) => {
    if (key === 'Backspace') return 'Delete last letter';
    if (key === 'Enter') return 'Add clue';
    const status = props.letterStates[key];
    return status ? `${key.toUpperCase()}, ${stateLabel(status)}` : key.toUpperCase();
};
</script>

<template>
    <div class="app-shell">
        <a class="skip-link" href="#results">Skip to matching words</a>

        <header class="site-header">
            <div class="brand-lockup">
                <div class="brand-mark" aria-hidden="true">
                    <span>F</span><span>I</span><span>V</span><span>E</span>
                </div>
                <div>
                    <h1>Five Lette.rs</h1>
                    <p>Less guessing. More knowing.</p>
                </div>
            </div>

            <button v-if="hasProgress" class="text-button" type="button" @click="clearAll">
                Start over
            </button>
        </header>

        <main class="workspace">
            <section class="solver-panel" aria-labelledby="solver-heading">
                <div class="intro">
                    <p class="eyebrow">Word finder</p>
                    <h2 id="solver-heading">Turn your clues into words.</h2>
                    <p>Type a five-letter guess, then tap each tile until its colour matches your game.</p>
                </div>

                <div class="status-legend" aria-label="Tile colour guide">
                    <span><i class="legend-swatch is-absent" aria-hidden="true">×</i> Not in word</span>
                    <span><i class="legend-swatch is-present" aria-hidden="true">•</i> Wrong spot</span>
                    <span><i class="legend-swatch is-correct" aria-hidden="true">✓</i> Right spot</span>
                </div>

                <div v-if="guesses.length" class="saved-clues" aria-label="Saved clues">
                    <article v-for="(guess, guessIndex) in guesses" :key="guess.id" class="saved-clue">
                        <span class="clue-number" aria-hidden="true">{{ guessIndex + 1 }}</span>
                        <GuessRow
                            :cells="guess.cells"
                            :label="`Clue ${guessIndex + 1}`"
                            @cycle="cycleSavedTile(guessIndex, $event)"
                        />
                        <button
                            class="remove-clue"
                            type="button"
                            :aria-label="`Remove ${wordFromCells(guess.cells)}`"
                            @click="removeGuess(guessIndex)"
                        >
                            <span aria-hidden="true">×</span>
                        </button>
                    </article>
                </div>

                <div v-if="guesses.length < maxGuesses" class="composer-card">
                    <div class="composer-heading">
                        <div>
                            <span class="step-label">{{ guesses.length ? 'Next clue' : 'First clue' }}</span>
                            <strong>{{ filledCount }}/5 letters</strong>
                        </div>
                        <span v-if="draftComplete" class="ready-badge">Ready</span>
                    </div>

                    <GuessRow
                        :cells="draft"
                        label="Current guess"
                        @cycle="cycleDraftTile"
                    />

                    <p class="composer-hint" aria-live="polite">{{ composerHint }}</p>
                </div>

                <div v-else class="limit-message">
                    Six clues added. Remove one to enter another.
                </div>

                <OnScreenKeyboard
                    :letter-states="keyboardStates"
                    :disabled="guesses.length >= maxGuesses"
                    :can-submit="draftComplete"
                    @key="handleKey"
                />

                <div class="composer-actions">
                    <button
                        class="secondary-button"
                        type="button"
                        :disabled="filledCount === 0"
                        @click="eraseLetter"
                    >
                        <span aria-hidden="true">⌫</span> Delete
                    </button>
                    <button
                        class="primary-button"
                        type="button"
                        :disabled="!draftComplete || guesses.length >= maxGuesses"
                        @click="saveGuess"
                    >
                        Add clue <span aria-hidden="true">→</span>
                    </button>
                </div>
            </section>

            <CandidatePanel
                id="results"
                :words="candidates"
                :loading="dictionaryStatus === 'loading'"
                :error="dictionaryStatus === 'error'"
                :clue-count="activeClues.length"
                :draft-pending="filledCount > 0 && !draftComplete"
            />
        </main>

        <footer class="site-footer">
            <p>Five useful letters at a time.</p>
            <a href="https://ttam.co/" target="_blank" rel="noopener noreferrer">Made by Matt</a>
        </footer>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import CandidatePanel from './components/CandidatePanel.vue';
import GuessRow from './components/GuessRow.vue';
import OnScreenKeyboard from './components/OnScreenKeyboard.vue';
import {
    cycleTileState,
    filterCandidates,
    getKeyboardStates,
    makeEmptyGuess,
    wordFromCells,
} from './lib/wordle.js';

const maxGuesses = 6;
const dictionary = ref([]);
const dictionaryStatus = ref('loading');
const draft = ref(makeEmptyGuess());
const guesses = ref([]);
let nextGuessId = 1;

const filledCount = computed(() => draft.value.filter(cell => cell.letter).length);
const draftComplete = computed(() => filledCount.value === 5);
const hasProgress = computed(() => guesses.value.length > 0 || filledCount.value > 0);

const activeClues = computed(() => [
    ...guesses.value.map(guess => guess.cells),
    ...(draftComplete.value ? [draft.value] : []),
]);

const candidates = computed(() => filterCandidates(dictionary.value, activeClues.value));

const keyboardStates = computed(() => getKeyboardStates([
    ...guesses.value.map(guess => guess.cells),
    ...(filledCount.value ? [draft.value] : []),
]));

const composerHint = computed(() => {
    if (filledCount.value === 0) {
        return 'Use your keyboard or tap the letters below.';
    }

    if (!draftComplete.value) {
        const remaining = 5 - filledCount.value;
        return `${remaining} ${remaining === 1 ? 'letter' : 'letters'} to go.`;
    }

    return 'Tap any tile to change its colour, then add the clue.';
});

const insertLetter = (letter) => {
    if (guesses.value.length >= maxGuesses || draftComplete.value) {
        return;
    }

    const index = draft.value.findIndex(cell => !cell.letter);
    draft.value[index] = { letter: letter.toLowerCase(), state: 'absent' };
};

const eraseLetter = () => {
    let index = -1;
    for (let candidate = draft.value.length - 1; candidate >= 0; candidate -= 1) {
        if (draft.value[candidate].letter) {
            index = candidate;
            break;
        }
    }

    if (index >= 0) {
        draft.value[index] = { letter: '', state: 'absent' };
    }
};

const cycleDraftTile = (index) => {
    if (!draft.value[index].letter) {
        return;
    }

    draft.value[index] = {
        ...draft.value[index],
        state: cycleTileState(draft.value[index].state),
    };
};

const cycleSavedTile = (guessIndex, tileIndex) => {
    const guess = guesses.value[guessIndex];
    guess.cells[tileIndex] = {
        ...guess.cells[tileIndex],
        state: cycleTileState(guess.cells[tileIndex].state),
    };
};

const saveGuess = () => {
    if (!draftComplete.value || guesses.value.length >= maxGuesses) {
        return;
    }

    guesses.value.push({
        id: nextGuessId++,
        cells: draft.value.map(cell => ({ ...cell })),
    });
    draft.value = makeEmptyGuess();
};

const removeGuess = (index) => {
    guesses.value.splice(index, 1);
};

const clearAll = () => {
    guesses.value = [];
    draft.value = makeEmptyGuess();
};

const handleKey = (key) => {
    if (/^[a-z]$/i.test(key)) {
        insertLetter(key);
    } else if (key === 'Backspace') {
        eraseLetter();
    } else if (key === 'Enter') {
        saveGuess();
    }
};

const handlePhysicalKeyboard = (event) => {
    const target = event.target;
    const isEditing = target instanceof HTMLElement
        && (target.matches('input, textarea, select') || target.isContentEditable);
    const isButtonActivation = event.key === 'Enter'
        && target instanceof HTMLElement
        && target.matches('button, a[href]');

    if (isEditing || isButtonActivation || event.metaKey || event.ctrlKey || event.altKey || event.repeat) {
        return;
    }

    if (/^[a-z]$/i.test(event.key) || ['Backspace', 'Enter'].includes(event.key)) {
        event.preventDefault();
        handleKey(event.key);
    }
};

const loadDictionary = async () => {
    try {
        const response = await fetch('/dictionary/wordle.json');
        if (!response.ok) {
            throw new Error(`Dictionary request failed with ${response.status}`);
        }
        dictionary.value = await response.json();
        dictionaryStatus.value = 'ready';
    } catch (error) {
        console.error(error);
        dictionaryStatus.value = 'error';
    }
};

onMounted(() => {
    window.addEventListener('keydown', handlePhysicalKeyboard);
    loadDictionary();
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handlePhysicalKeyboard);
});
</script>

<template>
    <section class="results-panel" aria-labelledby="results-heading">
        <div class="results-card">
            <p class="results-kicker">Matching words</p>

            <template v-if="loading">
                <h2 id="results-heading" class="result-count">—</h2>
                <p class="result-count-label">Loading the dictionary…</p>
                <div class="result-state"><div class="loading-line" aria-hidden="true"></div></div>
            </template>

            <template v-else-if="error">
                <h2 id="results-heading" class="result-count">Oops</h2>
                <p class="result-count-label">The dictionary could not be loaded.</p>
                <div class="result-state">
                    <div><strong>Try refreshing the page.</strong>Your clues have not caused this problem.</div>
                </div>
            </template>

            <template v-else>
                <h2 id="results-heading" class="result-count" aria-live="polite">{{ words.length.toLocaleString() }}</h2>
                <p class="result-count-label">
                    {{ words.length === 1 ? 'possible word' : 'possible words' }}
                    <template v-if="context"> {{ context }}</template>
                </p>

                <div v-if="empty" class="result-state">
                    <div><strong>{{ emptyTitle }}</strong>{{ emptyMessage }}</div>
                </div>

                <div v-else-if="words.length === 0" class="result-state">
                    <div><strong>{{ zeroTitle }}</strong>{{ zeroMessage }}</div>
                </div>

                <template v-else>
                    <ul class="word-list" :aria-label="`${words.length} matching words`">
                        <li v-for="word in displayedWords" :key="word">{{ word }}</li>
                    </ul>
                    <p v-if="words.length > displayLimit" class="result-note">
                        Showing the first {{ displayLimit }} alphabetically. Add another clue to narrow the list.
                    </p>
                </template>

                <p v-if="draftPending" class="result-note">Finish the current guess to apply it.</p>
            </template>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    words: { type: Array, required: true },
    loading: Boolean,
    error: Boolean,
    context: { type: String, default: '' },
    empty: Boolean,
    emptyTitle: { type: String, default: 'Your shortlist will appear here.' },
    emptyMessage: { type: String, default: 'Enter a complete clue to get started.' },
    zeroTitle: { type: String, default: 'No words fit those clues.' },
    zeroMessage: { type: String, default: 'Check your clues and try again.' },
    draftPending: Boolean,
});

const displayLimit = 240;
const displayedWords = computed(() => props.words.slice(0, displayLimit));
</script>

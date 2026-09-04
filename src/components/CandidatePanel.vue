<template>
    <section class="results-panel" aria-labelledby="results-heading">
        <div class="results-card">
            <header class="results-header">
                <h2 id="results-heading">Results</h2>
                <p aria-live="polite">
                    <template v-if="loading">Loading…</template>
                    <template v-else-if="error">Unavailable</template>
                    <template v-else>
                        {{ resultCount }} {{ resultCount === '1' ? 'match' : 'matches' }}{{ context && !empty ? ` ${context}` : '' }}
                    </template>
                </p>
            </header>

            <div v-if="loading" class="result-state is-loading">
                <div class="loading-line" aria-hidden="true"></div>
                <p>Loading dictionary…</p>
            </div>

            <div v-else-if="error" class="result-state">
                <div class="empty-mark" aria-hidden="true">!</div>
                <strong>The dictionary didn’t load</strong>
                <p>Refresh the page to try again.</p>
            </div>

            <div v-else-if="empty" class="result-state">
                <strong>{{ emptyTitle }}</strong>
                <p>{{ emptyMessage }}</p>
            </div>

            <div v-else-if="words.length === 0" class="result-state">
                <div class="empty-mark" aria-hidden="true">0</div>
                <strong>{{ zeroTitle }}</strong>
                <p>{{ zeroMessage }}</p>
            </div>

            <template v-else>
                <ol class="word-list" :aria-label="`${words.length} matching words`">
                    <li v-for="word in displayedWords" :key="word">
                        <strong>{{ word }}</strong>
                    </li>
                </ol>
                <p v-if="words.length > displayLimit" class="result-note">
                    Showing {{ displayLimit }} of {{ words.length.toLocaleString() }}. Add another clue to narrow the list.
                </p>
            </template>

            <p v-if="draftPending" class="draft-note">Finish the current entry to apply it.</p>
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
    emptyTitle: { type: String, default: 'Start with a clue' },
    emptyMessage: { type: String, default: 'Matching words will appear here.' },
    zeroTitle: { type: String, default: 'No words found' },
    zeroMessage: { type: String, default: 'Check your clues and try again.' },
    draftPending: Boolean,
});

const displayLimit = 240;
const displayedWords = computed(() => props.words.slice(0, displayLimit));
const resultCount = computed(() => {
    if (props.loading) return '···';
    if (props.error) return '—';
    return props.empty ? '0' : props.words.length.toLocaleString();
});
</script>

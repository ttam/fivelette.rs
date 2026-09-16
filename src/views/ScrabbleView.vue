<template>
    <div class="workspace">
        <section class="solver-panel" aria-label="Scrabble solver">
            <form class="scrabble-card" @submit.prevent="solve">
                <div class="scrabble-heading">
                    <label for="scrabble-rack">Letters</label>
                    <span>Use ? for a blank tile</span>
                </div>

                <input
                    id="scrabble-rack"
                    ref="rackInput"
                    :value="rack"
                    class="rack-input"
                    type="text"
                    :maxlength="maxRackLength"
                    autocomplete="off"
                    autocapitalize="characters"
                    spellcheck="false"
                    inputmode="text"
                    placeholder="ENTER LETTERS"
                    aria-describedby="rack-hint"
                    @input="setRack"
                >

                <div class="rack-meta">
                    <span id="rack-hint">{{ rack.length }}/{{ maxRackLength }} tiles</span>
                    <button class="text-button" type="button" :disabled="rack.length >= maxRackLength" @click="addBlank">+ blank tile</button>
                </div>

                <div class="scrabble-actions">
                    <button class="secondary-button" type="button" :disabled="!rack" @click="clear">Clear</button>
                    <button class="primary-button" type="submit" :disabled="rack.length < 2 || loading">Find words</button>
                </div>
            </form>
        </section>

        <section id="results" class="results-panel" aria-labelledby="results-heading">
            <div class="results-card scrabble-results">
                <header class="results-header">
                    <h2 id="results-heading">Results</h2>
                    <p aria-live="polite">
                        <template v-if="loading">Loading dictionary…</template>
                        <template v-else-if="error">Unavailable</template>
                        <template v-else-if="hasSearched">{{ results.length.toLocaleString() }} {{ results.length === 1 ? 'word' : 'words' }}</template>
                        <template v-else>0 words</template>
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

                <div v-else-if="!hasSearched" class="result-state">
                    <strong>Enter your tiles</strong>
                    <p>Add at least two letters, then find every word they can make.</p>
                </div>

                <div v-else-if="results.length === 0" class="result-state">
                    <div class="empty-mark" aria-hidden="true">0</div>
                    <strong>No words found</strong>
                    <p>Try another set of letters or add a blank tile.</p>
                </div>

                <template v-else>
                    <ol class="scrabble-word-list" :aria-label="`${results.length} playable words`">
                        <li v-for="result in displayedResults" :key="result.word">
                            <strong>{{ result.word }}</strong>
                            <span :aria-label="`${result.score} points`">{{ result.score }}</span>
                        </li>
                    </ol>
                    <p v-if="results.length > displayLimit" class="result-note">
                        Showing the top {{ displayLimit }} by tile score.
                    </p>
                </template>
            </div>
        </section>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { loadWordDictionary } from '../lib/dictionary.js';
import { maxRackLength, normaliseRack, solveRack } from '../lib/scrabble.js';

const dictionary = ref([]);
const dictionaryStatus = ref('loading');
const rack = ref('');
const submittedRack = ref('');
const rackInput = ref(null);
const displayLimit = 300;

const loading = computed(() => dictionaryStatus.value === 'loading');
const error = computed(() => dictionaryStatus.value === 'error');
const hasSearched = computed(() => submittedRack.value.length >= 2);
const results = computed(() => solveRack(dictionary.value, submittedRack.value));
const displayedResults = computed(() => results.value.slice(0, displayLimit));

const setRack = (event) => {
    rack.value = normaliseRack(event.target.value);
    event.target.value = rack.value;
};

const addBlank = () => {
    if (rack.value.length >= maxRackLength) return;
    rack.value += '?';
    rackInput.value?.focus();
};

const solve = () => {
    if (rack.value.length < 2 || loading.value) return;
    submittedRack.value = rack.value;
};

const clear = () => {
    rack.value = '';
    submittedRack.value = '';
    rackInput.value?.focus();
};

onMounted(async () => {
    try {
        dictionary.value = await loadWordDictionary();
        dictionaryStatus.value = 'ready';
    } catch (loadError) {
        console.error(loadError);
        dictionaryStatus.value = 'error';
    }
});
</script>

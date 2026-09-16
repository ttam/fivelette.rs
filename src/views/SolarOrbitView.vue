<template>
    <div class="workspace">
        <section class="solver-panel" aria-label="Solar Orbit solver">
            <form class="orbit-card" @submit.prevent="solve">
                <div class="orbit-heading">
                    <label for="orbit-pairs">Letter pairs</label>
                    <span>Enter all eight pairs</span>
                </div>

                <input
                    id="orbit-pairs"
                    ref="pairsInput"
                    v-model="input"
                    class="orbit-input"
                    type="text"
                    autocomplete="off"
                    autocapitalize="characters"
                    spellcheck="false"
                    inputmode="text"
                    placeholder="CA DE HS LA OE OP OR TI"
                    aria-describedby="orbit-hint"
                >

                <div class="orbit-meta">
                    <span id="orbit-hint">{{ pairs.length }}/{{ requiredPairCount }} pairs</span>
                    <span>Two letters per pair</span>
                </div>

                <div class="orbit-actions">
                    <button class="secondary-button" type="button" :disabled="!input" @click="clear">Clear</button>
                    <button class="primary-button" type="submit" :disabled="pairs.length !== requiredPairCount || loading">Find centre</button>
                </div>
            </form>
        </section>

        <section id="results" class="results-panel" aria-labelledby="results-heading">
            <div class="results-card orbit-results">
                <header class="results-header">
                    <h2 id="results-heading">Results</h2>
                    <p aria-live="polite">
                        <template v-if="loading">Loading dictionary…</template>
                        <template v-else-if="error">Unavailable</template>
                        <template v-else-if="hasSearched">{{ solutions.length.toLocaleString() }} {{ solutions.length === 1 ? 'solution' : 'solutions' }}</template>
                        <template v-else>0 solutions</template>
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
                    <strong>Enter the letter pairs</strong>
                    <p>The shared centre and four six-letter words will appear here.</p>
                </div>

                <div v-else-if="solutions.length === 0" class="result-state">
                    <div class="empty-mark" aria-hidden="true">0</div>
                    <strong>No complete orbit found</strong>
                    <p>Check that all eight pairs were copied correctly.</p>
                </div>

                <ol v-else class="orbit-solution-list" :aria-label="`${solutions.length} Solar Orbit solutions`">
                    <li v-for="(solution, solutionIndex) in solutions" :key="`${solution.middle}-${solutionIndex}`" class="orbit-solution">
                        <header>
                            <span>Centre</span>
                            <strong>{{ solution.middle }}</strong>
                        </header>
                        <ul>
                            <li v-for="item in solution.words" :key="item.word">
                                <span>{{ item.start }}</span><b>{{ solution.middle }}</b><span>{{ item.end }}</span>
                                <strong>{{ item.word }}</strong>
                            </li>
                        </ul>
                    </li>
                </ol>
            </div>
        </section>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { loadWordDictionary } from '../lib/dictionary.js';
import { parsePairs, requiredPairCount, solveSolarOrbit } from '../lib/solar-orbit.js';

const sixLetterWords = ref([]);
const dictionaryStatus = ref('loading');
const input = ref('');
const submittedPairs = ref([]);
const pairsInput = ref(null);

const loading = computed(() => dictionaryStatus.value === 'loading');
const error = computed(() => dictionaryStatus.value === 'error');
const pairs = computed(() => parsePairs(input.value));
const hasSearched = computed(() => submittedPairs.value.length === requiredPairCount);
const solutions = computed(() => solveSolarOrbit(sixLetterWords.value, submittedPairs.value));

const solve = () => {
    if (pairs.value.length !== requiredPairCount || loading.value) return;
    submittedPairs.value = [...pairs.value];
};

const clear = () => {
    input.value = '';
    submittedPairs.value = [];
    pairsInput.value?.focus();
};

onMounted(async () => {
    try {
        sixLetterWords.value = (await loadWordDictionary()).filter(word => word.length === 6);
        dictionaryStatus.value = 'ready';
    } catch (loadError) {
        console.error(loadError);
        dictionaryStatus.value = 'error';
    }
});
</script>

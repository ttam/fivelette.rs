<template>
    <div class="workspace betweenle-workspace">
        <section class="solver-panel" aria-labelledby="betweenle-heading">
            <div class="intro-row">
                <div class="intro">
                    <p class="eyebrow">Betweenle helper</p>
                    <h2 id="betweenle-heading">Bracket the hidden word.</h2>
                    <p>Enter the closest words you know on either side, then add the percentages shown in the game for a much tighter shortlist.</p>
                </div>
                <button v-if="hasProgress" class="text-button view-reset" type="button" @click="clearAll">Clear bounds</button>
            </div>

            <div class="betweenle-explainer" aria-label="How Betweenle bounds work">
                <span><i aria-hidden="true">A</i> Earlier in the dictionary</span>
                <span><i aria-hidden="true">Z</i> Later in the dictionary</span>
            </div>

            <div class="betweenle-form">
                <div class="bound-card" :class="{ 'is-complete': afterComplete }">
                    <label class="bound-direction" for="after-bound"><i aria-hidden="true">→</i> The answer comes after</label>
                    <span class="bound-input-row">
                        <input
                            id="after-bound"
                            :value="afterWord"
                            type="text"
                            maxlength="5"
                            autocomplete="off"
                            autocapitalize="characters"
                            spellcheck="false"
                            inputmode="text"
                            placeholder="EARLIER WORD"
                            aria-label="The answer comes alphabetically after this word"
                            @input="setBound('after', $event)"
                        >
                        <button v-if="afterWord" type="button" class="clear-bound" aria-label="Clear earlier word" @click.prevent="clearBound('after')">×</button>
                    </span>
                    <span class="bound-footer">
                        <small>{{ boundHint(afterWord, 'lower') }}</small>
                        <label class="percentage-field" :class="{ 'is-disabled': !afterComplete }" for="after-percentage">
                            <span>Distance</span>
                            <span class="percentage-input">
                                <input
                                    id="after-percentage"
                                    :value="afterPercentage"
                                    type="text"
                                    maxlength="6"
                                    inputmode="decimal"
                                    placeholder="—"
                                    :disabled="!afterComplete"
                                    aria-label="Percentage distance from the earlier word"
                                    @input="setPercentage('after', $event)"
                                >
                                <b aria-hidden="true">%</b>
                            </span>
                        </label>
                    </span>
                </div>

                <div class="range-meter" :class="{ 'is-invalid': rangeInvalid }" aria-live="polite">
                    <span class="range-end">A</span>
                    <span class="range-line"><i></i></span>
                    <strong v-if="rangeInvalid">Bounds crossed</strong>
                    <strong v-else-if="loading">Loading…</strong>
                    <strong v-else>{{ candidates.length.toLocaleString() }} in range</strong>
                    <span class="range-line"><i></i></span>
                    <span class="range-end">Z</span>
                </div>

                <div class="bound-card" :class="{ 'is-complete': beforeComplete }">
                    <label class="bound-direction" for="before-bound"><i aria-hidden="true">←</i> The answer comes before</label>
                    <span class="bound-input-row">
                        <input
                            id="before-bound"
                            :value="beforeWord"
                            type="text"
                            maxlength="5"
                            autocomplete="off"
                            autocapitalize="characters"
                            spellcheck="false"
                            inputmode="text"
                            placeholder="LATER WORD"
                            aria-label="The answer comes alphabetically before this word"
                            @input="setBound('before', $event)"
                        >
                        <button v-if="beforeWord" type="button" class="clear-bound" aria-label="Clear later word" @click.prevent="clearBound('before')">×</button>
                    </span>
                    <span class="bound-footer">
                        <small>{{ boundHint(beforeWord, 'upper') }}</small>
                        <label class="percentage-field" :class="{ 'is-disabled': !beforeComplete }" for="before-percentage">
                            <span>Distance</span>
                            <span class="percentage-input">
                                <input
                                    id="before-percentage"
                                    :value="beforePercentage"
                                    type="text"
                                    maxlength="6"
                                    inputmode="decimal"
                                    placeholder="—"
                                    :disabled="!beforeComplete"
                                    aria-label="Percentage distance from the later word"
                                    @input="setPercentage('before', $event)"
                                >
                                <b aria-hidden="true">%</b>
                            </span>
                        </label>
                    </span>
                </div>
            </div>

            <div class="betweenle-tip">
                <span aria-hidden="true">↕</span>
                <p><strong>Copy the numbers exactly as shown.</strong> Betweenle changes precision below 10% and 1%; either percentage is optional, but using both gives the tightest result.</p>
            </div>
        </section>

        <CandidatePanel
            id="results"
            :words="candidates"
            :loading="loading"
            :error="dictionaryStatus === 'error'"
            :empty="!afterComplete && !beforeComplete"
            :context="resultContext"
            :draft-pending="hasPartialBound"
            empty-title="Your range will appear here."
            empty-message="Enter either word shown by Betweenle to start narrowing the dictionary."
            :zero-title="rangeInvalid ? 'Those bounds cross over.' : 'No words sit inside that range.'"
            :zero-message="rangeInvalid ? 'The earlier word must come before the later word.' : 'Check the spelling or loosen one of the bounds.'"
        />
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import CandidatePanel from '../components/CandidatePanel.vue';
import {
    filterBetween,
    isCompleteBound,
    normaliseBound,
    normalisePercentage,
} from '../lib/betweenle.js';

const dictionary = ref([]);
const dictionaryStatus = ref('loading');
const afterWord = ref('');
const beforeWord = ref('');
const afterPercentage = ref('');
const beforePercentage = ref('');

const loading = computed(() => dictionaryStatus.value === 'loading');
const afterComplete = computed(() => isCompleteBound(afterWord.value));
const beforeComplete = computed(() => isCompleteBound(beforeWord.value));
const hasProgress = computed(() => Boolean(
    afterWord.value || beforeWord.value || afterPercentage.value || beforePercentage.value,
));
const hasPartialBound = computed(() => (
    (afterWord.value.length > 0 && !afterComplete.value)
    || (beforeWord.value.length > 0 && !beforeComplete.value)
));
const rangeInvalid = computed(() => (
    afterComplete.value && beforeComplete.value && afterWord.value >= beforeWord.value
));

const candidates = computed(() => filterBetween(
    dictionary.value,
    afterComplete.value ? afterWord.value : '',
    beforeComplete.value ? beforeWord.value : '',
    afterComplete.value && afterPercentage.value !== '.' ? afterPercentage.value : '',
    beforeComplete.value && beforePercentage.value !== '.' ? beforePercentage.value : '',
));

const boundWithPercentage = (word, percentage) => (
    `${word.toUpperCase()}${percentage && percentage !== '.' ? ` (${percentage}%)` : ''}`
);

const resultContext = computed(() => {
    if (afterComplete.value && beforeComplete.value) {
        return `between ${boundWithPercentage(afterWord.value, afterPercentage.value)} and ${boundWithPercentage(beforeWord.value, beforePercentage.value)}`;
    }
    if (afterComplete.value) return `after ${boundWithPercentage(afterWord.value, afterPercentage.value)}`;
    if (beforeComplete.value) return `before ${boundWithPercentage(beforeWord.value, beforePercentage.value)}`;
    return '';
});

const setBound = (which, event) => {
    const normalised = normaliseBound(event.target.value);
    event.target.value = normalised;
    if (which === 'after') {
        if (normalised !== afterWord.value) afterPercentage.value = '';
        afterWord.value = normalised;
    } else {
        if (normalised !== beforeWord.value) beforePercentage.value = '';
        beforeWord.value = normalised;
    }
};

const setPercentage = (which, event) => {
    const normalised = normalisePercentage(event.target.value);
    event.target.value = normalised;
    if (which === 'after') afterPercentage.value = normalised;
    else beforePercentage.value = normalised;
};

const clearBound = (which) => {
    if (which === 'after') {
        afterWord.value = '';
        afterPercentage.value = '';
    } else {
        beforeWord.value = '';
        beforePercentage.value = '';
    }
};

const boundHint = (word, side) => {
    if (!word) return side === 'lower' ? 'The latest known word before the answer.' : 'The earliest known word after the answer.';
    if (word.length < 5) return `${5 - word.length} ${5 - word.length === 1 ? 'letter' : 'letters'} to go.`;
    return side === 'lower' ? 'Everything before this is ruled out.' : 'Everything after this is ruled out.';
};

const clearAll = () => {
    afterWord.value = '';
    beforeWord.value = '';
    afterPercentage.value = '';
    beforePercentage.value = '';
};

onMounted(async () => {
    try {
        const response = await fetch('/dictionary/betweenle.json');
        if (!response.ok) throw new Error(`Dictionary request failed with ${response.status}`);
        dictionary.value = await response.json();
        dictionaryStatus.value = 'ready';
    } catch (error) {
        console.error(error);
        dictionaryStatus.value = 'error';
    }
});
</script>

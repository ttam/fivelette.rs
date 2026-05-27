<template>
    <section-complex-inputs
            :advanced="advanced"
            v-if="complex"
    ></section-complex-inputs>

    <section-inputs
            :advanced="advanced"
            :complex="false"
            @exclude="exclude = $event"
            @include="include = $event"
            @mask="mask = $event"
            :mask="mask"
            @settings="settings = !settings"
            v-else
    ></section-inputs>

    <section-complex-results
            v-if="complex"
    ></section-complex-results>

    <section-results
            v-else
    ></section-results>


</template>

<script setup>
import { ref } from 'vue';
import SectionComplexInputs from './components/SectionAdvanced.vue';
import SectionInputs from './components/SectionInputs.vue';
import SectionComplexResults from './components/SectionResultsComplex_.vue';
import SectionResults from './components/SectionResults.vue';

const advanced = ref([
    [{ letter: 'h', state: 'correct' }, { letter: 'i', state: 'exclude' }, { letter: 'd', state: 'exclude' }, { letter: 'k', state: 'exclude' }, { letter: 'l', state: 'exclude' }],
    [{ letter: 'm', state: 'exclude' }, { letter: 'n', state: 'exclude' }, { letter: 'o', state: 'include' }, { letter: 'e', state: 'include' }, { letter: 'p', state: 'exclude' }],
    [{ letter: 'm', state: 'exclude' }, { letter: 'z', state: 'exclude' }, { letter: 'y', state: 'exclude' }, { letter: 's', state: 'correct' }, { letter: 'x', state: 'exclude' }],
]);
const complex = ref(false);
const exclude = ref('');
const include = ref('');
const mask = ref('?????');

const settings = ref(false);
</script>

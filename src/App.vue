<template>
    <section-inputs v-if="simple"></section-inputs>
    <section-inputs-complex v-else></section-inputs-complex>

    <section-results v-if="simple"></section-results>
    <section-results-complex v-else></section-results-complex>
</template>

<script setup>
import { ref } from 'vue';

import SectionInputs from './components/SectionInputs.vue';
import SectionInputsComplex from './components/SectionInputsComplex.vue';
import SectionResults from './components/SectionResults.vue';
import SectionResultsComplex from './components/SectionResultsComplex.vue';

const simple = ref(false);
</script>

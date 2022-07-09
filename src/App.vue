<template>
    <section-inputs
            @exclude="exclude = $event"
            @include="include = $event"
            @mask="mask = $event"
            :mask="mask"
    ></section-inputs>

    <section-results
            :exclude="exclude"
            :include="include"
            :mask="mask"
    ></section-results>
</template>

<script setup>
import { ref } from 'vue';
import SectionInputs from './components/SectionInputs.vue';
import SectionResults from './components/SectionResults.vue';

const exclude = ref('');
const include = ref('');
const mask = ref('?????');
</script>

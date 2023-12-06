<template>
    <section>
        <label for="exclude">Exclude</label>

        <input @input="store.setExclude($event.target.value)" type="text"/>

        <label for="include">Include</label>
        <input @input="store.setInclude($event.target.value)" type="text"/>

        <label for="mask">Mask</label>
        <input @input="store.setMask($event.target.value)" type="text" v-cleave="{blocks: [5], numeral: false, autoUnmask: false}" value="?????"/>
    </section>
</template>

<script setup>
import { useSimpleStore } from '../stores/simple.js';

const store = useSimpleStore();

import Cleave from 'cleave.js';

const vCleave = {
    beforeMount: (el, binding) => {
        el.cleave = new Cleave(el, binding.value || {});
    },

    beforeUpdate: (el) => {
        const event = new Event('input', { bubbles: true });
        setTimeout(function () {
            el.value = el.cleave.properties.result;
            el.dispatchEvent(event);
        }, 100);
    }
};
</script>

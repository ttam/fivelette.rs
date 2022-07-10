<template>
    <section class="inputs">
        <label for="exclude">Exclude</label>

        <input @input="$emit('exclude', $event.target.value)" type="text"/>

        <label for="include">Include</label>
        <input @input="$emit('include', $event.target.value)" type="text"/>

        <label for="mask">Mask</label>
        <input @input="$emit('mask', $event.target.value)" type="text" v-cleave="{blocks: [5], numeral: false, autoUnmask: false}" :value="mask"/>
    </section>
</template>

<script setup>
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

const props = defineProps({
    mask: String,
});
</script>

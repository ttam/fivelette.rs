import { defineStore } from 'pinia';

export const useSimpleStore = defineStore('simple', {
    state: () => ({
        exclude: '',
        include: '',
        mask: '?????',
    }),

    actions: {
        setExclude (exclude) {
            this.exclude = exclude;
        },

        setInclude (include) {
            this.include = include;
        },

        setMask (mask) {
            this.mask = mask;
        }
    },

    getters: {
        getExclude: state => state.exclude,
        getInclude: state => state.include,
        getMask: state => `${state.mask.toLowerCase()}?????`.substring(0, 5),
    },
});

import { defineStore } from 'pinia';

const initial = { letter: '', state: 'initial' };
const states = ['exclude', 'include', 'correct'];

export const useComplexStore = defineStore('complex', {
    state: () => ({
        index: 0,
        allInputs: [
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
            { letter: '', state: 'initial' },
        ],
    }),

    actions: {
        cycleState (index)
        {
            const letter = this.allInputs[index].letter;
            if (letter === '') {
                return;
            }

            const state = this.allInputs[index].state;
            const stateIndex = states.indexOf(state);
            this.allInputs[index].state = states[(stateIndex + 1) % states.length];
        },

        decrementIndex ()
        {
            this.index = Math.max(0, this.index - 1);
        },

        incrementIndex ()
        {
            this.index = Math.min(29, this.index + 1);
        },

        removeLetter ()
        {
            this.decrementIndex();
            this.allInputs[this.index] = structuredClone(initial);

        },

        setLetter (letter)
        {
            this.allInputs[this.index].letter = letter.toLowerCase();
            this.incrementIndex();
        },
    },

    getters: {
        letters: state => state.allInputs,

        pluck: (state, x) => (x) => {
            console.log({ state, x });
        }
    },
});

document.addEventListener('DOMContentLoaded', () => {
    new Vue({
        data: {
            dictionary: [],
            exclude: '',
            include: '',
            mask: '?????',
            plural: 'word',
        },

        el: '#app',

        computed: {
            adjustedMask ()
            {
                return `${this.mask.toLowerCase()}?????`.substring(0, 5);
            },

            count ()
            {
                return this.words.length;
            },

            highlightedWords ()
            {
                return this.words.map(i => i.split('').map((letter, index) => {
                    const className = this.adjustedMask[index] === letter.toLowerCase() ? 'mask'
                        : this.include.includes(letter) ? 'include' : '';

                    return `<span class="${className}">${letter}</span>`;
                }).join('')).join(' ');
            },

            words: function () {
                let filtered = [...this.dictionary];

                if (this.mask !== '') {
                    const mask = new RegExp(this.adjustedMask.replaceAll('?', '[a-z]'));
                    filtered = filtered.filter(word => word.match(mask) !== null);
                }

                if (this.exclude !== '') {
                    filtered = filtered.filter(word => word.match(new RegExp(`[${this.exclude.toLowerCase()}]`))
                        === null);
                }

                if (this.include !== '') {
                    const unique = (value, index, self) => self.indexOf(value) === index;
                    const expressionString = this.include.toLowerCase().split('').filter(unique).sort().join('.*');
                    const expression = new RegExp(expressionString);

                    filtered = filtered.filter(word => {
                        const letters = word.split('').sort().join('');
                        return letters.match(expression) !== null;
                    });
                }

                return filtered;
            },
        },

        directives: {
            cleave: {
                inserted: (el, binding) => {
                    el.cleave = new Cleave(el, binding.value || {});
                },
                update: (el) => {
                    const event = new Event('input', { bubbles: true });
                    setTimeout(function () {
                        el.value = el.cleave.properties.result;
                        el.dispatchEvent(event);
                    }, 100);
                }
            }
        },

        methods: {
            loadDictionary (dictionary)
            {
                fetch(`/dictionary/${dictionary}.json`)
                    .then(response => response.json())
                    .then(words => this.dictionary = words);
            },
        },

        mounted ()
        {
            this.loadDictionary('wordle');
        }
    });
});

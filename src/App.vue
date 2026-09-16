<template>
    <div class="app-shell">
        <a class="skip-link" href="#results">Skip to matching words</a>

        <header class="site-header">
            <a class="brand-lockup" href="/" aria-label="Five Letters home">
                <span class="brand-word" aria-hidden="true">
                    <span>f</span><span>i</span><span>v</span><span>e</span><span>l</span><span>e</span><span>t</span><span>t</span><span>e</span><span>r</span><span>s</span>
                </span>
            </a>

            <nav class="game-switch" aria-label="Choose a solver">
                <button
                    v-for="game in games"
                    :key="game.id"
                    type="button"
                    :class="{ 'is-active': activeGame === game.id }"
                    :aria-current="activeGame === game.id ? 'page' : null"
                    @click="selectGame(game.id)"
                >
                    {{ game.label }}
                </button>
            </nav>
        </header>

        <main class="main-content">
            <WordleView v-if="activeGame === 'wordle'" />
            <BetweenleView v-else-if="activeGame === 'betweenle'" />
            <ScrabbleView v-else-if="activeGame === 'scrabble'" />
            <SolarOrbitView v-else />
        </main>

        <footer class="site-footer">
            <p>© 2026 <a href="https://mattbannon.com/" target="_blank" rel="noopener noreferrer">Matt Bannon</a>.</p>
        </footer>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import BetweenleView from './views/BetweenleView.vue';
import ScrabbleView from './views/ScrabbleView.vue';
import SolarOrbitView from './views/SolarOrbitView.vue';
import WordleView from './views/WordleView.vue';

const games = [
    { id: 'wordle', label: 'Wordle' },
    { id: 'betweenle', label: 'Betweenle' },
    { id: 'scrabble', label: 'Scrabble' },
    { id: 'solar', label: 'Solar Orbit' },
];

const gameFromUrl = () => {
    const game = new URLSearchParams(window.location.search).get('game');
    return games.some(option => option.id === game) ? game : 'wordle';
};

const activeGame = ref(gameFromUrl());

const updateTitle = () => {
    const game = games.find(option => option.id === activeGame.value)?.label || 'Wordle';
    document.title = `${game} solver — Five Lette.rs`;
};

const selectGame = (game) => {
    if (game === activeGame.value) return;
    activeGame.value = game;

    const url = new URL(window.location.href);
    if (game === 'wordle') url.searchParams.delete('game');
    else url.searchParams.set('game', game);
    window.history.pushState({}, '', url);
    updateTitle();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
};

const handleHistory = () => {
    activeGame.value = gameFromUrl();
    updateTitle();
};

onMounted(() => {
    window.addEventListener('popstate', handleHistory);
    updateTitle();
});

onBeforeUnmount(() => window.removeEventListener('popstate', handleHistory));
</script>

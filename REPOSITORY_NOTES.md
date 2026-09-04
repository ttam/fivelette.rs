# Five Lette.rs repository notes

Updated 4 September 2026 during the interface overhaul on `feature/v2`.

## Product and interaction model

Five Lette.rs is a client-side Wordle and Betweenle helper. The header switch selects either solver and stores the current choice in the `?game=betweenle` URL parameter, without a router dependency.

### Wordle

The redesigned interface uses a clue-composer model rather than reproducing Wordle's full six-row board:

1. Enter one five-letter guess with the on-screen keyboard or a physical keyboard.
2. Letters begin grey/absent. Tap a tile to cycle grey → yellow/present → green/correct.
3. Candidates update as soon as all five letters are present.
4. Add the clue to clear the composer and enter another. Up to six clues can be saved.
5. Saved tile colours remain editable, and each saved clue can be removed independently.

This gives touch users a complete input path while keeping desktop keyboard entry fast. The responsive layout is one column on narrow screens and a two-panel workspace with sticky results from 900px upwards.

### Betweenle

Betweenle asks for a hidden word's alphabetical position rather than coloured letters. The solver exposes the two bounds that matter:

- "The answer comes after" is the closest known earlier word.
- "The answer comes before" is the closest known later word.

Either bound can be used alone. With both present, candidates must be strictly between them. Each bound also accepts the optional percentage shown beside it in Betweenle; candidates must reproduce that exact displayed percentage. Partial inputs do not affect results, crossed bounds show an explicit error, and native text fields provide the mobile keyboard.

## Current architecture

- `index.html`: metadata, font preconnects, the existing Google Analytics tag, and the Vue mount point.
- `src/App.vue`: shared shell, game switch, URL/history synchronisation, and footer.
- `src/views/WordleView.vue`: Wordle state, dictionary loading, clue lifecycle, and physical-keyboard controller.
- `src/views/BetweenleView.vue`: alphabetical bounds, validation, and Betweenle dictionary loading.
- `src/components/GuessRow.vue`: accessible reusable five-tile row.
- `src/components/OnScreenKeyboard.vue`: touch-friendly QWERTY keyboard with aggregate clue colours.
- `src/components/CandidatePanel.vue`: loading/error/empty/results states and a bounded word list.
- `src/lib/wordle.js`: pure Wordle scoring and filtering functions.
- `src/lib/betweenle.js`: bound normalisation and binary-search range filtering.
- `src/styles.css`: the full visual system and responsive layout.
- `public/dictionary/wordle.json`: the static dictionary.
- `public/dictionary/betweenle.json`: sorted, lowercase, unique list of 11,548 Betweenle words recovered from the existing local stash.
- `test/wordle.test.js`: dependency-free tests for scoring, duplicate letters, matching, filtering, keyboard state, and colour cycling.
- `test/betweenle.test.js`: tests for bound normalisation, completion, one-sided ranges, strict two-sided ranges, and crossed bounds.

The app now depends only on Vue at runtime. Pinia and Cleave were removed along with the unused v1/v2 components, stores, prototype extensions, and legacy Vue 2 script.

## Filtering semantics

Candidates are checked by re-scoring every saved guess against each possible answer and requiring the resulting five tile states to match exactly. The two-pass scorer handles repeated letters the same way Wordle does: greens consume letters first, then yellows consume only remaining occurrences. This replaces the old regex pipeline, which incorrectly treated grey duplicate letters as globally absent.

The 12,974-word dictionary and at most six five-character comparisons are small enough for synchronous computed filtering in the browser. Betweenle uses binary search over its already-sorted 11,548-word dictionary, then slices the strict range between the completed bounds. Percentage distance matches the official game calculation: absolute dictionary-index difference divided by dictionary length, formatted as a whole number at 10% or more, one decimal at 1–10%, and two decimals below 1%.

## Accessibility and responsive details

- Every tile and keyboard key is a real button with an accessible name.
- Tile states have `×`, `•`, and `✓` markers as well as colour.
- Focus rings, a skip link, live result/count updates, reduced-motion handling, and 42–50px keyboard targets are included.
- The global keyboard controller ignores text-editing controls, modifiers, repeats, and Enter when it should activate a focused link/button.
- Results render as Vue nodes; no `v-html` remains.
- Loading, dictionary failure, no-clue, partial-clue, no-match, and long-result states are explicit.

## Commands and verification

```sh
npm run dev
npm test
npm run build
```

`npm test` is deliberately a small Node/ESM harness so it remains compatible with the repository's Node 16-era baseline. The production build and all 15 filtering tests pass.

## Existing branch and stash archaeology

There is still separate, unmerged work that must not be lost:

- `feature/v3` at `b8cdb56` contains a dependency/runtime upgrade plus an older Vue Router experiment for `/wordle` and an empty `/betweenle`.
- `stash@{0}` is labelled `WIP on feature/v3: b8cdb56 Add router and blank betweenle view`.
- The stash contains a small Betweenle view change, the source copy of `public/dictionary/betweenle.json`, and a temporary `d.php` conversion script.

The dictionary was restored into this branch without applying or changing the stash. The stashed UI and v3 toolchain upgrade remain separate.

## Sensible next work

- Add component/browser interaction tests if this product grows beyond the current single-screen flow.
- Decide whether clues should persist locally across refreshes.
- Decide whether the lightweight query-parameter switch should eventually become the routed structure explored on `feature/v3`.
- Revisit the existing Analytics and externally hosted fonts if privacy, consent, or offline use becomes a requirement.

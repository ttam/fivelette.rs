# Five Lette.rs repository notes

Updated 4 September 2026 during the interface overhaul on `feature/v2`.

## Product and interaction model

Five Lette.rs is a client-side Wordle helper. It filters a bundled, sorted dictionary of 12,974 unique five-letter words.

The redesigned interface uses a clue-composer model rather than reproducing Wordle's full six-row board:

1. Enter one five-letter guess with the on-screen keyboard or a physical keyboard.
2. Letters begin grey/absent. Tap a tile to cycle grey → yellow/present → green/correct.
3. Candidates update as soon as all five letters are present.
4. Add the clue to clear the composer and enter another. Up to six clues can be saved.
5. Saved tile colours remain editable, and each saved clue can be removed independently.

This gives touch users a complete input path while keeping desktop keyboard entry fast. The responsive layout is one column on narrow screens and a two-panel workspace with sticky results from 900px upwards.

## Current architecture

- `index.html`: metadata, font preconnects, the existing Google Analytics tag, and the Vue mount point.
- `src/App.vue`: application state, dictionary loading, clue lifecycle, and physical-keyboard controller.
- `src/components/GuessRow.vue`: accessible reusable five-tile row.
- `src/components/OnScreenKeyboard.vue`: touch-friendly QWERTY keyboard with aggregate clue colours.
- `src/components/CandidatePanel.vue`: loading/error/empty/results states and a bounded word list.
- `src/lib/wordle.js`: pure Wordle scoring and filtering functions.
- `src/styles.css`: the full visual system and responsive layout.
- `public/dictionary/wordle.json`: the static dictionary.
- `test/wordle.test.js`: dependency-free tests for scoring, duplicate letters, matching, filtering, keyboard state, and colour cycling.

The app now depends only on Vue at runtime. Pinia and Cleave were removed along with the unused v1/v2 components, stores, prototype extensions, and legacy Vue 2 script.

## Filtering semantics

Candidates are checked by re-scoring every saved guess against each possible answer and requiring the resulting five tile states to match exactly. The two-pass scorer handles repeated letters the same way Wordle does: greens consume letters first, then yellows consume only remaining occurrences. This replaces the old regex pipeline, which incorrectly treated grey duplicate letters as globally absent.

The 12,974-word dictionary and at most six five-character comparisons are small enough for synchronous computed filtering in the browser.

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

`npm test` is deliberately a small Node/ESM harness so it remains compatible with the repository's Node 16-era baseline. The production build and six filtering tests passed after the overhaul.

## Existing branch and stash archaeology

There is still separate, unmerged work that must not be lost:

- `feature/v3` at `b8cdb56` contains a dependency/runtime upgrade plus Vue Router routes for `/wordle` and an empty `/betweenle`.
- `stash@{0}` is labelled `WIP on feature/v3: b8cdb56 Add router and blank betweenle view`.
- The stash contains a small Betweenle view change, `public/dictionary/betweenle.json` with 11,548 words, and a temporary `d.php` conversion script.

The stash has only been inspected read-only. Decide separately whether Betweenle and the v3 toolchain upgrade belong in a future change; they are not mixed into this UI overhaul.

## Sensible next work

- Add component/browser interaction tests if this product grows beyond the current single-screen flow.
- Decide whether clues should persist locally across refreshes.
- Decide whether to incorporate the `/betweenle` direction from `feature/v3`.
- Revisit the existing Analytics and externally hosted fonts if privacy, consent, or offline use becomes a requirement.

# Value Education Word Search

Open `index.html` through a web server. The game fetches `../crossword/puzzles.json`
directly, so both games share the same puzzle answers, clues, hints, and explanations.

Words are placed in eight directions, with matching letters allowed to overlap.
Choose a word by dragging or selecting its two endpoints. Keyboard users can move
with arrow keys and select endpoints with Enter or Space; Escape cancels selection.

The grid seed and found words are saved per puzzle in browser storage. Refresh
restores the last puzzle. New grid requests confirmation before replacing progress.
Word search storage is independent of crossword progress and PDF preferences.

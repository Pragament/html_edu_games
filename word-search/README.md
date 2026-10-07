# Value Education Word Search

Open `index.html` through a web server. The game fetches `../crossword/puzzles.json`
directly, using its puzzle answers and value education explanations. Selecting a
word shows the original prompt without a clue label, followed by its explanation.
Letter hints are not displayed.

Words are placed in eight directions, with matching letters allowed to overlap.
Choose a word by dragging or selecting its two endpoints. Keyboard users can move
with arrow keys and select endpoints with Enter or Space; Escape cancels selection.

The grid seed and found words are saved per puzzle in browser storage. Refresh
restores the last puzzle. New grid requests confirmation before replacing progress.
Word search storage is independent of crossword progress and PDF preferences.

Download PDF worksheet exports the current grid without found-word highlighting,
the original prompts and explanations without a word list or answer headings.
Students identify each value from its text and then find it in the grid. PDFs use A4 pages and
black text on white for printing.

The worksheet places its letter grid at top left and its header and QR code to the
right. The QR links to `/word-search` on the current domain. Values to explore
flows through two columns, with a 6–14 pt size slider. Optional watermarks support
text, opacity, size, top/middle/bottom position, and left/center/right alignment.
PDF preferences are saved independently in this browser and can be reset.

# Value Education Word Scramble

Run through a web server. The game fetches `../crossword/puzzles.json` directly,
using answers for letter tiles, descriptions for questions, progressive hints,
and explanations shown after a correct answer.

Choose any class or vocabulary-level puzzle. Type an answer and press Enter or
Check answer. Letters are shuffled without changing their counts, and the shuffle
avoids displaying the answer in its original order.

Answers, checked solutions, hints, and shuffled letters save per puzzle in browser
storage. Refresh restores the last selected puzzle. Start again asks for confirmation
before clearing progress and reshuffling. Storage is independent of the other games.

Download PDF worksheet exports the current scrambled letters and descriptions
in two columns with blank answer lines, name/date fields, and a QR link to
`/word-scramble` on the current domain. Completed answers are not printed.
PDF controls provide 6–14 pt text size and optional watermark text, opacity, size,
position, and alignment. Preferences save independently and can be reset.
Single-page worksheets omit page numbering.

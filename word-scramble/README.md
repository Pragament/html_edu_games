# Value Education Word Scramble

Run through a web server. The game fetches `../crossword/puzzles.json` directly,
using answers for letter tiles, descriptions for questions, progressive hints,
and explanations shown after a correct answer.

Select one or more class or vocabulary-level puzzles, choose a word count, then
click Create random set. Words are sampled without replacement from the selected
puzzles, with repeated answer words removed from the pool. The available count
shows the maximum valid selection. Each chosen word retains its source description,
hints, and explanation.

Type an answer and press Enter or Check answer. Letters are shuffled without
changing their counts, and the shuffle avoids the original answer order.
The current random set, source selections, word count, answers, hints, and scrambled
letters save in browser storage and restore on refresh. Creating a new set asks
for confirmation if the current set has answers or hints. Start again confirms
before clearing progress and reshuffling the same words.

Download PDF worksheet uses exactly the current online set and scrambled letters.
The single A4 page has two balanced columns with blank answer lines, name/date
fields, and a QR link to `/word-scramble` on the current domain. Completed answers
are not printed. The chosen 6–14 pt text size is reduced down to 6 pt when needed.
If the full selection cannot fit, the export asks for fewer words; no questions
are omitted. Single-page worksheets omit page numbering.

PDF options include watermark text, opacity, size, position, and alignment.
Preferences save independently and can be reset. Game storage is independent of
Word Search and Crossword. Editing selection controls requires Create random set
before downloading, so the online game and PDF always agree.

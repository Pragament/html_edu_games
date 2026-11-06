# Spelling Detectives

Loads `../crossword/puzzles.json` directly. Students correct a misspelled value
word with its description as context. The explanation is shown after checking
or passing, followed by a final review of all words.

Choose a puzzle, word count, and solo or 2–4 teams. Teams take turns locally on
one device, with 10 points per correct correction and 0 for an incorrect answer
or pass. Each question permits one attempt. Teams rotate after each question;
choose a word count divisible by the team count for equal numbers of turns.

Randomly selected words do not repeat within a round. Adjacent unequal letters
are swapped to introduce a spelling error, with a fallback for repeated letters.
Answer checking ignores spaces, punctuation, and letter case.

The round, draft answer, scores, and progress are saved in browser storage.
Refreshing restores the round; replacing an unfinished game requires confirmation.
The homepage service worker precaches this game's files for offline use.

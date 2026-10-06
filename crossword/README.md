# Crossword puzzles

`puzzles.json` supplies the puzzle selector, interactive grids, and PDF worksheets.
Each word includes an answer, clue, explanation, chapter, direction, and starting
row and column. Rows and columns start at zero; answers use uppercase letters
without spaces. Display numbering is generated from the starting positions.
Each word also has a `hints` array ordered from a conceptual clue to progressively
stronger letter hints. The interactive page reveals one hint at a time for the
selected word and remembers progress until the puzzle changes or is cleared.

## Classes VI–VIII

Six puzzles are adapted from **Class VI - VIII - Web.pdf**, with original clues
and explanations based on its activities:

| Class | Puzzle | Source PDF pages |
| --- | --- | --- |
| VI | Working Together | 1–6 |
| VI | Time and Effort | 1–2, 19–20 |
| VII | Freedom and Community | 7–12 |
| VII | Caring for Earth | 17–18 |
| VIII | Peace and Inclusion | 13–16 |
| VIII | Purpose and Care | 1, 3–4, 21–22 |

The source treats VI–VIII as one group. Assignments to individual classes and
the increasing clue difficulty are adaptations, rather than a grade-by-grade
curriculum prescribed by the source. `sourcePages` on each new word records
its supporting PDF pages (one-based).

## Classes IX–XII

Eight puzzles are adapted from **Class IX - XII - Web.pdf**:

| Class | Puzzle | Source PDF pages |
| --- | --- | --- |
| IX | Courtesy and Character | 1–2, 17–18 |
| IX | Discipline and Duty | 5–8 |
| X | Resolving Conflict | 11–12 |
| X | Effective Teams | 13–14 |
| XI | Honesty and Integrity | 8, 15–16 |
| XI | Respecting Differences | 3–4, 14, 19–20 |
| XII | Environmental Responsibility | 21–22 |
| XII | Social Responsibility | 3–4, 7, 9–10 |

This source also groups its classes together. The individual class assignments
and clue difficulty are adaptations. Each new puzzle records its source document
and supporting pages; each word records its supporting pages. Clues and
explanations are paraphrases of the activities and themes.

The three existing Classes III–V puzzles remain available. Serve the repository
over HTTP to load the JSON and download PDF worksheets.

## Value education vocabulary levels

Eight additional value education puzzles offer two themes at each vocabulary level:

| Difficulty | Themes |
| --- | --- |
| Beginner | Everyday Kindness; Making Good Choices |
| Elementary | Values in Action; Our Shared World |
| Intermediate | Understanding Others; Character and Commitment |
| Advanced | Ethical Judgement; Responsibility Beyond Ourselves |

Each puzzle has eight words, clues about values and responsible behaviour,
explanations, and three progressive hints. These puzzles include `subject`
(`Value Education`), `difficulty`, and `difficultyRank` (1–4). Vocabulary ranges
from familiar words such as KIND and FAIR to ethical concepts such as ALTRUISM,
IMPARTIALITY, and STEWARDSHIP. Difficulty describes an approximate vocabulary
progression rather than an official proficiency or grade assessment.

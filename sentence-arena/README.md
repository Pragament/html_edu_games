# Sentence Arena

Run `python3 -m http.server 8765` from the repository root, then open http://localhost:8765/sentence-arena/. Four fixed colored columns provide independent touch controls, player names, progress, timers and scores. Use a landscape panel with four or more touch points, preferably 1920×1080 or larger. Small screens scroll horizontally.

## Independent play and scoring

Teachers choose questions per player, an optional time limit per question, and whole-number points before starting. Defaults: correct +10, wrong -2, skipped -1. Correct points must be zero or positive; wrong/skipped points must be zero or negative. Zero disables a penalty. Both HTML input limits and start-time validation enforce these rules. The points legend is visible before and during play; settings are frozen for the active game.

Every player receives the same number of questions and an independent queue. Their nth questions come from a matched group sharing game type, language skill, English difficulty, subject familiarity and an approximate expected-time band. Groups are shuffled, but unlike tasks are never combined merely to fill four seats. Normalized answers are distinct across all assigned questions, so players cannot encounter the same answer even when progressing at different speeds. If filters offer too few questions, the game reduces the count equally for everyone; no complete matched quartet disables Start. The setup shows capacity and each mode’s usable set count. Unavailable types are disabled (a selected type can still be unchecked). Question type and topic can differ when mixed filters are selected.

Check answer submits one final attempt. Correct/wrong points apply once; then the player's own Next question button becomes available immediately. An empty selection asks the player to answer or skip rather than deducting points. Skip applies the skipped score and moves directly to the next question. Timeouts count as skipped and show Next question. Other players continue without interruption. Memory rounds hide the model after six seconds; this counts toward the question's time limit.

The game ends automatically after everyone resolves their last question. Rankings use highest score first, then shortest elapsed completion time from the common start; exact score/time ties share first place. A player's completion time stops when their last question is resolved, without waiting for peers. Time includes reading, memory display, feedback viewing, and teacher review if enabled. End game counts all remaining unanswered questions as skipped exactly once, then shows standings. This avoids ending early to escape penalties.

Teacher-reviewed Sentence Chain, Creative Sentence and Random Word Sentence activities have a separate optional filter section and are excluded unless their individual boxes are selected. Tags/categories never opt them in. Their word/length check does not award points: the teacher marks a submitted answer correct or wrong using the configured scoring. Missing required words or insufficient length is a wrong answer. Touch word buttons allow independent concurrent creation; optional typing uses the system keyboard's single focus.

Scores and names are session-only. No accounts, uploads, analytics or schedule.

## Content

`questions.json` has 40 mode definitions and 710 editable questions. Question fields include `id`, `mode`, `grades`, `topic`, `tags`, `kind`, `prompt`, `answer`, `explanation`; optional fields include `options`, `letters`, `chunks`, `prefix`, `memory`, and `required`. Related modes share tile, letter, chunk, choice, recall or teacher-reviewed mechanics. Relay continues a supplied subject independently per player; chain continues a supplied link.

Reference themes come from the six supplied ELITE Grade 1–2 and Grade 3–5 lesson plans. Their schedules and teacher instructions are reference content only. Most exercises are newly authored around school, family/friends, nature, healthy living, teamwork and communication; some reuse frames with different names. Passive voice, reported speech and conditionals are Grade 4–5 extensions. Existing `../crossword/puzzles.json` remains unchanged because its vocabulary-clue schema does not fit sentence exercises.

## Versions and checks

Current version: **1.3.0-2026.11.07**. Update the version meta tag, visible badge and CSS/JS query strings in `index.html`, and `SENTENCE_ARENA_VERSION` in root `sw.js` for each release, using `major.minor.patch-YYYY.MM.DD` with the release date. Keep the date fixed for a release rather than changing it on every page load. JSON URLs derive their version from the meta tag. The worker derives its cache name and precache URLs from its version constant and preserves Arena query strings in cache keys. HTTP requests revalidate cached responses; the root worker registers with `updateViaCache: 'none'`. A waiting worker activates after older controlled tabs close, avoiding unexpected mid-game reloads.

Run `node sentence-arena/check.cjs` for content, independent progression, score/penalty validation, timeouts, end-game accounting, ranking, teacher-review selection, and version consistency checks. Run `node --check sentence-arena/game.js` and `node --check sw.js` for syntax checks. Physical simultaneous touch support still needs testing on the target TV.

Filter checkboxes sit inside dedicated `.filter-options` scroll regions rather than scrolling the fieldset itself. Vertical touch panning and contained overscroll keep swipes within a list, including at its boundaries; swipe outside the lists to scroll the page. The regions are keyboard-focusable.

Grade options are derived from the question bank and sorted numerically. The current bank covers Grades 1–10; adding a new grade to question metadata automatically exposes its filter.

## Learning metadata and feedback (1.3.0)

The bank has 230 corrected/enriched legacy records and 480 authored practice records: twelve new records for each of the 40 modes. Each previously empty mode now has playable quartets. New Grade 8–10 ordering exercises include expanded subjects/objects and a time clause. Grade ranges are guidance, not certified curriculum alignment. Foundational/developing/advanced describe English task demand; `subjectKnowledge` separately indicates everyday or curriculum vocabulary. English definitions are tagged vocabulary-in-context rather than subject–verb agreement.

`skill`, `languageDifficulty`, `subjectKnowledge`, `challengeGroup`, `expectedSeconds`, `hints`, `acceptedAnswers` and (for choices) `optionFeedback` are consumed by the game. `expectedSeconds` is an editorial workload estimate used for matching, not the live timer or a classroom-measured calibration. `source` records provenance/review status. Authored `followUpIds` link related exercises for future revision flows; automatic adaptive follow-up is not implemented.

Accepted alternative sentences are validated through the same scoring path as the canonical answer. Existing punctuation/case-insensitive checking remains: this game does not assess punctuation. Hint buttons reveal one step per tap without losing an in-progress answer or deducting points. Hint counts appear in results; time spent reading hints is included in completion time. Wrong choices show their option-specific explanation. Hints and explanations use text content, not HTML.

`tools/enrich_questions.py` reproducibly applies the reviewed corrections and regenerates the `practice-` records. It retains legacy records, but overwrites generated practice records; edit its curated templates to make lasting changes to those records. Run `python3 sentence-arena/tools/enrich_questions.py`, then `node sentence-arena/check.cjs`. The original audit report is a historical snapshot and intentionally retains its original counts/hash.

Long boards have independent contained scroll areas on wide panels, so revealing hints does not force another student’s column to scroll. Hardware multi-touch still requires testing on the target panel. Matching uses task metadata, not a claim of proven psychometric equivalence; teacher piloting is still recommended.

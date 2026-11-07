# Sentence Arena question-bank audit

Audit date: 7 November 2026. Scope: the current `sentence-arena/questions.json` plus the consuming game and its existing checks. All 230 question records were inspected; structural counts were calculated across the whole bank. No questions or game behaviour were changed. This is a content and implementation review, not a classroom learning-outcome study or a curriculum-board alignment certification.

**Assessment:** The bank is structurally usable and contains useful cross-curricular vocabulary, but it is not yet balanced for English sentence formation or fair four-player racing. Prioritise ambiguous answers and game-type availability before adding more questions indiscriminately.

## Snapshot

| Measure | Result |
|---|---:|
| Questions / unique IDs | 230 / 230 |
| Defined game types | 40 |
| Types with no questions | 6 |
| Types with at least four distinct answer keys | 6 |
| Types that cannot run alone under current four-player rules | 34 |
| Multiple choice | 148 (64.3%) |
| Tile tasks, including letter scrambles | 63 (27.4%) |
| Teacher-reviewed creation | 19 (8.3%) |
| Fill in the Blanks | 116 (50.4%) |
| Distinct normalised answer keys | 220 |
| Repeated-answer groups | 10 pairs |

Structural checks found no duplicate IDs, missing required core fields, invalid mode references, choice keys absent from options, duplicate options within a question, incorrect letter inventories, mismatched chunk reconstructions, or creative model answers missing their required words. Existing game checks pass. These results do **not** establish that every explanation, distractor or grade assignment is educationally correct.

All 148 choice records store the correct answer first. The game shuffles options, so this is not currently a visible answer-position leak; maintain that shuffle in exports or future renderers.

## Priority findings with examples

### P1 — fix before relying on competitive scores

| Question(s) | Finding and consequence | Recommendation |
|---|---|---|
| q007 | Explanation calls the vowel in “book” a long /ʊ/ sound. This is misleading phonics instruction. | Use “book is pronounced /bʊk/; oo represents /ʊ/ here,” without labelling it long. [Cambridge pronunciation](https://dictionary.cambridge.org/pronunciation/english/book). |
| q383 | “The teacher said, ‘You have done well.’” is keyed to “we had done well” without saying who was addressed or who reports it. Other pronouns can be appropriate. | Specify: “The teacher said to our group … Report what the teacher told us, using backshift.” Pronouns depend on the reporting perspective; backshift is not always compulsory. [British Council](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/reported-speech-statements). |
| q309 | “The customary way of life practised by a group” can reasonably describe **culture**, an offered distractor, although the key is **tradition**. | Ask for a particular custom handed down across generations, preferably with a concrete example. |
| q367 | “I wanted to go outside, ___ it started raining” allows a grammatical narrative with **and**, an offered distractor. The intended answer **but** requires the unstated goal of expressing contrast. | Add “Choose the conjunction that shows contrast.” Do not call every other grammatical completion wrong without that instruction. |
| q369 | Both “on the graph” and “in the graph” occur naturally, depending on meaning/context. Treating **in** as universally incorrect overstates the rule. | Use an unambiguous relation or a picture; alternatively instruct “Choose the usual preposition for plotting points on a graph.” |
| q404, q382 | A single answer string rejects valid arrangements of the provided tiles: “The ancient river slowly flows through the valley.” versus the keyed “…flows slowly…”; “Wheat is grown in the field by the farmer.” versus the keyed “…by the farmer in the field.” | Add explicit accepted alternative token orders and consume them in validation. Only constrain order when that is the stated objective. Negative marking makes these false rejections especially consequential. |
| q442 | “An organism adapting over generations” confuses an individual organism with population change. | Rewrite as “Change in inherited characteristics of populations over generations is called ___.” [University of Minnesota explanation](https://open.lib.umn.edu/evosex/chapter/2-3-what-is-not-evolution/). |

### P2 — improve instructional precision

| Question(s) | Finding | Recommendation |
|---|---|---|
| q016 | “Add ‘a big blue’ before bag” leaves the existing article in place if followed literally. | Say “Replace ‘a bag’ with ‘a big blue bag’.” |
| q355 | “Add ‘all’ before leaves” does not explain that the intended answer moves it before **the**. | Say “Put ‘All’ before ‘the leaves’ and add ‘slowly’ at the end.” |
| q412 | Prompt supplies “requires,” while the answer uses “is required.” This is a transformation, not just arranging the stated words. | Supply the actual word bank, or explicitly ask for conversion to passive voice. |
| q324 | “A feeling of wanting to know more” defines **curiosity**, but the answer is the adjective **curious**. | Use “eager to learn or know more.” |
| q259 | Median explanation only describes a middle item and omits averaging the two middle values for even-sized datasets. | Add the even-count case or restrict the prompt to an odd-sized dataset. |
| q277 | Explanation includes viruses as examples under a definition that calls all microorganisms living organisms. This introduces a classification dispute unnecessarily. | Use bacteria and microscopic fungi as uncomplicated examples; handle viruses separately. |
| q356 | “Water boils at 100 degrees Celsius” is given as an unconditional fact. | Add “at standard atmospheric pressure,” or choose a sentence without an unstated scientific condition. |
| q362 | The starting statement about friction allowing easy sliding is deliberately negated, but not labelled a false statement to correct. | Separate grammatical transformation from scientific truth: say “Change this scientifically incorrect statement into a negative sentence.” |
| q433 | “An organisation … is called multinational” is less natural than “a multinational” or “a multinational company.” | Use “is called a ___ company” or make “a multinational company” the complete answer. |

Some other science explanations are acceptable school-level simplifications but merit a subject-teacher pass if retained as factual teaching material. This audit does not claim every subject definition has been independently verified against a textbook.

## Coverage does not match the 40-type menu

Empty types: **Sentence Building, Sentence Puzzle, Sentence Combination, Sentence Unscramble, Adverb Sentence, Sentence Construction Challenges**.

Only **Word Scramble, Fill in the Blanks, Sentence Completion, Sentence Correction, Random Word Sentence, Preposition Sentence** can run alone with all grades/topics available. Conjunction has four records but only three distinct answers, so it still cannot start alone. Additional metadata filters can reduce any of these pools below four. Teacher-reviewed modes remain opt-in.

| Game type | Records | Distinct answers | Can run alone? |
|---|---:|---:|---|
| Word Scramble | 21 | 21 | Yes |
| Jumbled Sentence | 1 | 1 | No |
| Sentence Building | 0 | 0 | No |
| Fill in the Blanks | 116 | 112 | Yes |
| Subject–Verb–Object | 2 | 2 | No |
| Sentence Matching | 3 | 3 | No |
| Question Formation | 3 | 3 | No |
| Negative Sentence | 3 | 3 | No |
| Tense Formation | 1 | 1 | No |
| Sentence Completion | 5 | 5 | Yes |
| Word Arrangement | 2 | 2 | No |
| Sentence Correction | 4 | 4 | Yes |
| Sentence Expansion | 3 | 3 | No |
| Sentence Transformation | 3 | 3 | No |
| Sentence Chain | 1 | 1 | No |
| Sentence Puzzle | 0 | 0 | No |
| WH-Question | 3 | 3 | No |
| Conjunction | 4 | 3 | No |
| Creative Sentence | 3 | 3 | No |
| Random Word Sentence | 15 | 15 | Yes |
| Sentence Reordering | 2 | 2 | No |
| Grammar Challenge | 2 | 2 | No |
| Sentence Making Race | 3 | 3 | No |
| Missing Word | 1 | 1 | No |
| Sentence Combination | 0 | 0 | No |
| Sentence Unscramble | 0 | 0 | No |
| Conditional Sentence | 3 | 3 | No |
| Preposition Sentence | 4 | 4 | Yes |
| Adjective Sentence | 1 | 1 | No |
| Adverb Sentence | 0 | 0 | No |
| Pronoun Sentence | 1 | 1 | No |
| Sentence Type Identification | 3 | 3 | No |
| Active and Passive Voice | 3 | 3 | No |
| Direct and Indirect Speech | 3 | 3 | No |
| Sentence Pattern | 3 | 3 | No |
| Sentence Ladder | 2 | 2 | No |
| Sentence Relay | 1 | 1 | No |
| Sentence Memory | 2 | 2 | No |
| Sentence Logic | 3 | 3 | No |
| Sentence Construction Challenges | 0 | 0 | No |

Recommendation: hide or clearly disable empty types; show usable distinct-answer counts before selection. Build at least four *different sentences testing the same skill* per practice group. For a full ten-question race restricted to one skill, target 40 distinct eligible answer keys, not merely 40 record IDs. Until coverage improves, avoid promising that all 40 types are independently playable.

## Grade coverage and available practice

The following capacities apply to **default automatic-scoring questions**, with only a grade selected. Questions can belong to multiple grades, so column totals must not be added across grades. Actual game limits are also capped by the teacher’s 5/10/20 choice.

| Grade | All questions | Choice | Tiles | Creative | Default distinct answers | Maximum questions/player from bank |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 15 | 6 | 8 | 1 | 13 | 3 |
| 2 | 34 | 13 | 15 | 6 | 26 | 6 |
| 3 | 80 | 39 | 28 | 13 | 65 | 16 |
| 4 | 116 | 67 | 33 | 16 | 97 | 24 |
| 5 | 146 | 85 | 44 | 17 | 124 | 31 |
| 6 | 128 | 85 | 33 | 10 | 114 | 28 |
| 7 | 104 | 73 | 25 | 6 | 94 | 23 |
| 8 | 102 | 79 | 19 | 4 | 92 | 23 |
| 9 | 66 | 58 | 6 | 2 | 59 | 14 |
| 10 | 45 | 41 | 4 | 0 | 42 | 10 |

Grade 1 can currently supply only **three questions per player**, even if the teacher requests five, ten or twenty. Grade 10 has **41 choice questions out of 45 (91.1%)** and only three represented modes: Word Scramble, Fill in the Blanks and Sentence Relay. There is no Grade 10 teacher-reviewed creation. Thus the older grades have subject vocabulary, but little opportunity to practise increasingly complex sentence construction.

Thirty-five records span at least five grades; q304 spans Grades 3–10. Seven have non-contiguous assignments: q266, q270, q278, q283, q284, q291 and q296. These are review flags, not proof of error: a topic may legitimately recur in selected years. Document why the same language task belongs at each level. Separate **English proficiency / grammatical demand** from **subject familiarity** and curriculum grade. Logarithms (q418), standard deviation (q419), reported speech and passive voice should be checked against the intended school board rather than assigned from general impressions.

## Sentence formation versus subject recall

The topics are Science (88), Social Studies (50), English (34), Mathematics (31), School (9), Nature (9), Healthy living (4), Teamwork (3), Family and friends (1), and Communication (1). The three named academic subjects Science/Social Studies/Mathematics account for **169/230 (73.5%)** of records.

Cross-curricular content is useful, but many tasks ask the student to recognise a definition rather than construct English. For example, choosing “perimeter” in q245 tests subject vocabulary much more than English syntax. Keep it as a vocabulary warm-up, then connect it to a task such as “The perimeter measures the distance around a shape” → build → make a question → explain using your own sentence.

Recommended editorial target, not a proven optimum: for each taught skill, provide a short sequence of recognition, guided construction, transformation and independent application. Balance everyday communication with academic contexts. Use explicit language outcomes so teachers can choose sentence practice without accidentally selecting mostly subject quizzes.

## Explanations, alternatives and distractors

Every record has an explanation, which is a good foundation. However, none has structured `hints`, `optionFeedback`, `acceptedAnswers`, `skill`, `difficulty`, `challengeGroup`, `prerequisites`, `followUpIds` or per-question `source` metadata.

- q014/q385/q392 use absurd alternatives such as objects reading or eating pencils. These may suit an early meaning check but do little to reveal a grammar misconception. Prefer plausible contrasts where exactly one answer meets an explicitly stated requirement.
- Several explanations use technical terms such as “participle,” “inverting,” “backshift,” or “digraph” without a learner-friendly first sentence. Offer a short student explanation plus an optional teacher explanation.
- Reported-speech items should say whether to use backshift; it is not always required when the statement remains true. Model answers alone should not imply a universal rule.
- Single-word answer keys such as “because” occur in different contexts. The current global answer-deduplication rule suppresses one even though the sentences teach different examples. Prefer comparing complete completed sentences or a task fingerprint, while keeping concurrently visible challenges different enough to prevent copying.
- Ten duplicate-answer pairs are not automatically bad: different modes can intentionally revisit the same sentence. Mark purposeful reuse as a revision link rather than treating all repetition as accidental duplication.

## Four-player fairness and learning progression

The current engine gives equal question counts but randomly mixes recognition, letter unscrambling, longer sentence ordering and teacher-reviewed writing. Equal points and a time tie-break do not make these tasks equally demanding. A student completing a short definition can gain time over a peer arranging a long passive sentence.

Add `skill`, `difficulty`, `challengeGroup` and a rough expected-time band. Draw each player's nth task from a comparable group with different wording and answers. Validate that four suitable members survive the selected filters. Keep teacher-reviewed work in a separate practice format when timing is used for competitive ranking, or explicitly disclose that review waiting time is included.

For learning, add progressive hints and a follow-up exercise targeting the error. The current one-final-attempt race can remain the assessment mode; a separate practice mode could explain a mistake, allow a supported retry and revisit the skill later. Adding JSON fields alone will not implement these behaviours.

## Recommended implementation order

1. **Correct and disambiguate scored content.** Start with q007, q309, q367, q369, q383, q404/q382 and q442. Add regression examples for acceptable alternative orders.
2. **Make the menu honest and usable.** Show pool counts, disable empty/insufficient single-type choices, and report the actual question count before starting. Prioritise Grade 1 capacity and missing core sentence-building modes.
3. **Create matched four-player groups.** Populate comparable word-order, agreement, negative and question-formation tasks before adding more definition blanks.
4. **Add learning metadata and feedback.** Use controlled skill IDs, explicit difficulty, learner-friendly hints, distractor-specific feedback and accepted alternatives. Keep subject/grade/proficiency separate.
5. **Add revision paths and editorial validation.** Record source/provenance, author-review status and next-review date; link errors to easier examples and fresh follow-ups. Validate schema, ambiguity examples, coverage thresholds and supported alternative answers in addition to model-string correctness.
6. **Pilot with teachers and students.** Measure completion time by task family, patterns of wrong answers, hint use and success on later fresh examples. Use those observations to adjust grade ranges and difficulty; do not infer mastery from speed alone.

## Audit evidence and limits

Source snapshot SHA-256: `b8441a4e3ec3f9e2f83703d51f33dde1249a66bffb997e410416cf7252ae1042`.

The accompanying metrics JSON contains the counts, mode/grade coverage and duplicate-answer groups used in this report. Existing `check.cjs` was run successfully. It verifies mechanics and model answers, but currently does not require every menu mode to have a playable four-question pool or establish educational validity. Grade suitability judgements above are editorial recommendations, pending the intended curriculum and classroom review.

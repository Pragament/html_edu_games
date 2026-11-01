# Little Keys

A dependency-free, browser-based beginner piano course. Open `index.html` through the repository's static server or game launcher. Audio starts with the first interaction.

- Four selectable lessons: finger placement, note patterns, two-beat holds, and a first melody.
- Both requested songs with lyrics, note sequences, listen/stop demonstrations, and guided hold durations.
- Free play, including the two black keys; three pitch sets (C3, C4, C5), tempo choices, and sound toggle.
- Touch/pointer support and A/S/D for C/D/E, W/E for C♯/D♯.
- Hold meter, elapsed seconds, beat count, retry feedback, and saved course completion on the device.
- Included in the shared offline cache. No external assets or network services required.

## Instrument tones

Choose among 19 offline synthesized instrument styles in five categories. The displayed numbers follow the requested app tone list, not General MIDI program numbers. Grand Piano is the default; the chosen tone is saved locally and applies to live playing and Listen first. These are synthesized approximations rather than sampled acoustic instruments. Tabla supplies five distinct percussive voices on the five keys; hits decay naturally while the visual hold timer continues.

## Reading notation and comparing practice

The live guide explains each demonstrated or expected note's staff position, shape, beat count, and duration at the selected tempo. Expand the reference for line/space names, ledger lines, treble clef, note heads/stems/flags, and sharps. Practice compares app key presses against the expected note and hold duration, including short/long differences and a 15% timing tolerance. Wrong notes receive a dashed staff marker. The last attempt stays visible when practice moves to the next note. Free play explains notes without scoring them. This is key-input feedback, not microphone pitch detection or onset/rhythm tracking.

## Melody variations by difficulty

Both melodies offer six selectable levels:

1. Basic three-note melody, at any pace (note order only).
2. Repeated-note rhythm using the melody's written beat values.
3. First two phrases in the base octave; remaining phrases one octave higher. Use the base/+1 buttons or ↓/↑.
4. Two left-hand bass pulses per phrase. Z = C bass; X = G bass.
5. Two chord pulses per phrase. V = C major (C–E–G); B = G major (G–B–D).
6. A custom practice arrangement with varied rhythm, alternating bass/chords, staccato, legato, and accents. Choose touch strength with 1/2/3 or the buttons; this is selected strength, not hardware velocity sensing.

Right-hand melody remains A/S/D. Accompaniment buttons support multitouch or simultaneous keyboard chords (for example, Z+D plays C bass with melody E). Each marked accompaniment pulse requires a distinct press overlapping its melody note. On a single-note final phrase, press twice while holding the melody. Tabla keeps its drum mapping; accompaniment uses piano when Tabla is selected.

Levels 2–6 require holds between 85% and 125% of the target. Staccato uses half the written duration and leaves the rest as a gap. Beat-spacing feedback compares consecutive accepted note starts with the previous note's written duration. Level completion requires at least 80% of transitions within 25% of the expected spacing. Retries affect spacing; restart for a fresh assessment. This is self-started practice rather than a fixed external backing-track score. Each song/level completion is stored separately on the device. Listen first demonstrates the selected arrangement, including octave changes, harmony, rhythm, and touch strength, without advancing practice.

The Hot Cross Buns harmony is C / C / C / G / C by phrase. The Mary arrangement uses C / C / G / C / C / C / G / C. These are simplified educational arrangements.

## Melody note layouts

In song practice or free play, choose C–D–E (two black keys) or G–A–B (three black keys). Both songs and all six difficulty levels transpose from C/D/E to G/A/B; Hot Cross Buns starts B–A–G in the new layout. The keyboard, note cards, staff positions, finger guide, explanations, and demonstrations follow the selected layout. Course lessons retain their original C/D/E teaching sequence.

G/A/B fingering: thumb (1) on G, index (2) on A, middle (3) on B. PC A/S/D play G/A/B. F plays the extra F white key; T/W/E play F♯/G♯/A♯. The extra F key shows all three black keys in their proper context. G sits between F♯ and G♯; A sits between G♯ and A♯; B sits immediately to the right of A♯.

G/A/B accompaniment transposes to G and D bass/major chords (D major = D–F♯–A). Completion is tracked separately for each song, layout, and difficulty; previous completion records are preserved as C/D/E results.

Select any staff note to inspect its matching notation explanation without moving the practice index. Tab to a note and press Enter or Space for keyboard access. Selection pauses a running demonstration; playing or restarting restores the live guide.

## Recorder starter guide

A soprano recorder guide follows the demonstrated note, app key input, or clicked staff note. Original SVG diagrams show back thumb hole 0 and front holes 1–7; filled holes are covered. B covers 0+1, A covers 0+1+2, and G covers 0+1+2+3. The guide includes left/right hand placement and gentle tonguing instructions, with a link to Yamaha's recorder charts. These beginner fingerings are for recorder, not concert flute or bansuri. Other notes and upper-octave variations explicitly direct the learner to the full chart.

“Start recorder melody” selects song practice, G/A/B layout, Level 1, High pitch, and the synthesized Flute tone. Soprano recorder sounds an octave above written music. This is a visual fingering aid and synthesized demonstration; app timing feedback still measures on-screen/PC keys, not a real recorder or microphone.

## Harmonica guide

The harmonica guide uses a standard Richter-tuned 10-hole diatonic in C, following HOHNER's tuning chart. It shows all 10 holes with blow/draw pitches and highlights the current cell. Tabs use + for blow and − for draw: C5 = +4, D5 = −4, E5 = +5. This matches the reference's 4+, plain 4 (draw), and 5+ convention with an explicit draw sign. G/A/B layout uses +6 / −6 / −7. Upper-register tabs are provided where playable without bends; unsupported notes receive a clear message.

Both melodies have phrase-by-phrase lyric tabs synchronized with listening, app keys, and staff-note selection. “Start harmonica melody” selects C/D/E, Level 2 rhythm, and High pitch to align the synthesized melody with holes 4–5. The selected instrument tone remains available. Instructions cover hole orientation, isolated single notes, gentle blow/draw breath, and repeated-note articulation. Other harmonica types/tunings require their own charts. No real harmonica sound is detected, and piano accompaniment controls do not represent harmonica technique.

## Percussion guide

The percussion guide separates pitched mallet melody from unpitched snare rhythm. Note-labelled bars follow the current note, octave cue, and selected staff note; clicking a bar previews a ringing Santoor-based mallet sound without scoring or advancing practice. “Start mallet melody” selects C/D/E song practice at Level 2 with that tone. Hand suggestions alternate R/L by melody note and are educational suggestions rather than mandatory sticking.

Three original beginner four-beat snare patterns are available: R L R L, R L rest L, and R rest rest L. They teach right/left strokes, quarter rests, relaxed grip and rebound. Hear pattern demonstrates two bars after a four-beat visual count-in. Practice two bars scores pad clicks or J (left) / K (right) against the selected tempo with a 25% beat tolerance; it checks hand choice, ignores duplicate scoring, and counts untouched rests as correct. Snare uses a short synthesized noise burst. Stop, navigation/reset, pitch/tempo changes, and leaving the page stop an exercise. It is independent from melody progress and does not listen to real instruments.

## Phone landscape play screen

Tap “Play screen” in the header for a viewport-filling piano view. The compact layout keeps the real staff, note strip, keyboard, hold feedback, sound/listen controls, and next-step button. Lesson guides and setup controls return with “Exit / settings”; progress stays intact. Advanced accompaniment and octave/touch controls remain available in the compact view.

The button requests native browser fullscreen and attempts landscape orientation lock when supported. If either API is unavailable or denied, the compact CSS view still works; rotate the phone manually. Viewport-height units, safe-area padding, and short-landscape rules accommodate mobile browser chrome and notches. Exit restores the prior scroll position and focus. Escape exits the compact view when delivered by the browser; the visible Exit button is always available. Some browsers consume Escape to leave native fullscreen first, keeping the compact view active.

'use strict';
function shuffleAnswer(answer, random = Math.random) {
  if (new Set(answer).size < 2) return answer;
  for (let attempt = 0; attempt < 20; attempt++) {
    const letters = [...answer];
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    const result = letters.join('');
    if (result !== answer) return result;
  }
  // A deterministic fallback ensures the displayed letters differ from the answer.
  const index = [...answer].findIndex(letter => letter !== answer[0]);
  const letters = [...answer];
  [letters[0], letters[index]] = [letters[index], letters[0]];
  return letters.join('');
}
function isValidScramble(value, answer) {
  return typeof value === 'string' && value !== answer && [...value].sort().join('') === [...answer].sort().join('');
}
function wordPool(selected) {
  const seen = new Set(), pool = [];
  for (const source of selected) source.words.forEach((word, index) => {
    if (!seen.has(word.answer)) {
      seen.add(word.answer); pool.push({...word, sourceId: source.id, sourceIndex: index});
    }
  });
  return pool;
}
function sampleWords(pool, count, random = Math.random) {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
const $ = id => document.getElementById(id);
const STORAGE = 'wordScramble.progress.v1';
let saved = {}, puzzles = [], puzzle, entries = [];
let roundSettings;
try {
  const data = JSON.parse(localStorage.getItem(STORAGE));
  if (data && typeof data === 'object' && !Array.isArray(data)) saved = data;
} catch { /* Playing works without browser storage. */ }
function saveProgress() {
  if (!puzzle) return;
  saved.round = {settings: roundSettings, refs: puzzle.words.map(w => [w.sourceId, w.sourceIndex]),
    signature: JSON.stringify(puzzle.words.map(w => [w.answer, w.clue])), entries};
  try { localStorage.setItem(STORAGE, JSON.stringify(saved)); } catch {}
}
function updateProgress() {
  const solved = entries.filter(entry => entry.solved).length;
  $('progress').max = entries.length;
  $('progress').value = solved;
  $('status').textContent = solved === entries.length
    ? `Well done! You solved all ${entries.length} words.`
    : `${solved} of ${entries.length} words solved. Progress saves automatically in this browser.`;
}
function renderCard(word, index) {
  const entry = entries[index];
  const card = document.createElement('section');
  card.className = 'card';
  card.setAttribute('aria-labelledby', `word-${index}`);
  const heading = document.createElement('h2');
  heading.id = `word-${index}`;
  heading.textContent = `Word ${index + 1} · ${word.answer.length} letters · ${word.chapter}`;
  const letters = document.createElement('div');
  letters.className = 'letters';
  letters.setAttribute('aria-label', `Scrambled letters: ${entry.scramble.split('').join(', ')}`);
  for (const letter of entry.scramble) {
    const tile = document.createElement('span');
    tile.className = 'tile'; tile.textContent = letter; tile.setAttribute('aria-hidden', 'true');
    letters.appendChild(tile);
  }
  const description = document.createElement('p');
  description.className = 'description'; description.textContent = word.clue;
  const label = document.createElement('label');
  label.className = 'answer-label'; label.htmlFor = `answer-${index}`; label.textContent = 'Your answer';
  const form = document.createElement('form');
  form.className = 'answer-row';
  const input = document.createElement('input');
  input.id = `answer-${index}`; input.type = 'text'; input.maxLength = word.answer.length;
  input.autocomplete = 'off'; input.spellcheck = false; input.autocapitalize = 'characters';
  input.setAttribute('aria-describedby', `feedback-${index}`); input.value = entry.answer;
  const check = document.createElement('button');
  check.type = 'submit'; check.textContent = 'Check answer';
  form.append(input, check);
  const feedback = document.createElement('p');
  feedback.className = 'feedback'; feedback.id = `feedback-${index}`; feedback.setAttribute('role', 'status');
  const hint = document.createElement('button');
  hint.type = 'button'; hint.className = 'hint-button';
  const hints = document.createElement('ol'); hints.className = 'hints';
  const explanation = document.createElement('p');
  explanation.className = 'explanation'; explanation.textContent = word.explain || '';
  function refresh() {
    card.classList.toggle('solved', entry.solved);
    input.readOnly = entry.solved; check.disabled = entry.solved;
    explanation.hidden = !entry.solved;
    if (entry.solved) feedback.textContent = `Correct — ${word.answer}!`;
    hint.disabled = entry.solved || entry.hints >= (word.hints || []).length;
    hint.textContent = entry.solved ? 'Word solved' : hint.disabled ? 'All hints shown' : `Show next hint (${entry.hints}/${(word.hints || []).length})`;
    hints.replaceChildren();
    for (const text of (word.hints || []).slice(0, entry.hints)) {
      const li = document.createElement('li'); li.textContent = text; hints.appendChild(li);
    }
  }
  input.addEventListener('input', () => {
    entry.answer = input.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, word.answer.length);
    if (input.value !== entry.answer) input.value = entry.answer;
    feedback.textContent = ''; saveProgress();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (entry.solved) return;
    if (entry.answer === word.answer) {
      entry.solved = true; refresh(); updateProgress(); saveProgress();
    } else feedback.textContent = !entry.answer ? 'Type your answer first.' : 'Not quite. Try rearranging the letters, or use a hint.';
  });
  hint.addEventListener('click', () => {
    if (entry.hints < (word.hints || []).length) entry.hints++;
    refresh(); saveProgress();
  });
  card.append(heading, letters, description, label, form, feedback, hint, hints, explanation);
  refresh(); return card;
}
function loadPuzzle(selected, reset = false) {
  puzzle = selected;
  const previous = saved.round;
  const valid = !reset && previous && previous.signature === JSON.stringify(puzzle.words.map(w => [w.answer, w.clue])) && Array.isArray(previous.entries);
  entries = puzzle.words.map((word, index) => {
    const stored = valid ? previous.entries[index] : null;
    const answer = typeof stored?.answer === 'string' ? stored.answer.toUpperCase().replace(/[^A-Z]/g, '').slice(0, word.answer.length) : '';
    return {
      scramble: isValidScramble(stored?.scramble, word.answer) ? stored.scramble : shuffleAnswer(word.answer),
      answer, solved: stored?.solved === true && answer === word.answer,
      hints: Number.isInteger(stored?.hints) ? Math.max(0, Math.min(stored.hints, (word.hints || []).length)) : 0
    };
  });
  $('subtitle').textContent = puzzle.subtitle;
  $('cards').replaceChildren(...puzzle.words.map(renderCard));
  updateProgress(); saveProgress();

}
function selectedPuzzles() {
  const ids = new Set([...$('puzzle-choices').querySelectorAll('input:checked')].map(input => input.value));
  return puzzles.filter(item => ids.has(item.id));
}
function updateChoices() {
  const available = wordPool(selectedPuzzles()).length;
  $('word-count').max = Math.max(1, available);
  $('available-count').textContent = `${available} unique words available`;
  $('generate').disabled = !available;
  $('download-pdf').disabled = true;
  $('status').textContent = 'Choose the number of words and click Create random set to apply your selection.';
}
function makePuzzle(words, settings) {
  const selected = puzzles.filter(item => settings.ids.includes(item.id));
  return {id: 'random-set', title: selected.length === 1 ? selected[0].title : 'Mixed Value Education Puzzles',
    subtitle: `${selected.length} puzzle${selected.length === 1 ? '' : 's'} / ${words.length} random words`, words};
}
function createRound() {
  const selected = selectedPuzzles(), pool = wordPool(selected);
  const count = Number($('word-count').value);
  if (!selected.length || !Number.isInteger(count) || count < 1 || count > pool.length) {
    $('status').textContent = `Select puzzles and choose a whole number from 1 to ${pool.length || 1}.`;
    return;
  }
  if (puzzle && entries.some(entry => entry.answer || entry.hints) && !window.confirm('Create a new random set? Your current answers and hints will be cleared.')) return;
  roundSettings = {ids: selected.map(item => item.id), count};
  loadPuzzle(makePuzzle(sampleWords(pool, count), roundSettings), true);
  $('download-pdf').disabled = false; $('reset').disabled = false;
  $('pdf-status').textContent = '';
}
$('generate').addEventListener('click', createRound);
$('word-count').addEventListener('input', updateChoices);
$('reset').addEventListener('click', () => {
  if (window.confirm('Start this set again? Your answers and hints will be cleared and the letters reshuffled.')) loadPuzzle(puzzle, true);
});
(async () => {
  try {
    const response = await fetch('../crossword/puzzles.json');
    if (!response.ok) throw new Error('Unable to load puzzle data');
    puzzles = await response.json();
    if (!Array.isArray(puzzles) || !puzzles.length || puzzles.some(p => !Array.isArray(p.words) || !p.words.length)) throw new Error('Invalid puzzle data');
    const stored = saved.round;
    let restoredWords;
    if (stored && Array.isArray(stored.settings?.ids) && Number.isInteger(stored.settings.count) && Array.isArray(stored.refs)) {
      const pool = wordPool(puzzles.filter(item => stored.settings.ids.includes(item.id)));
      const candidates = stored.refs.map(ref => Array.isArray(ref) ? pool.find(word => word.sourceId === ref[0] && word.sourceIndex === ref[1]) : null);
      if (candidates.length > 0 && candidates.length === stored.settings.count && candidates.every(Boolean)
          && new Set(candidates.map(word => word.answer)).size === candidates.length
          && stored.signature === JSON.stringify(candidates.map(word => [word.answer, word.clue]))) {
        restoredWords = candidates; roundSettings = stored.settings;
      }
    }
    if (!restoredWords) {
      const initial = puzzles.find(item => item.id === saved.last) || puzzles[Math.floor(Math.random() * puzzles.length)];
      const pool = wordPool([initial]);
      roundSettings = {ids: [initial.id], count: Math.min(10, pool.length)};
      restoredWords = sampleWords(pool, roundSettings.count);
    }
    for (const item of puzzles) {
      const label = document.createElement('label'), checkbox = document.createElement('input');
      checkbox.type = 'checkbox'; checkbox.value = item.id;
      checkbox.checked = roundSettings.ids.includes(item.id);
      checkbox.addEventListener('change', updateChoices);
      label.append(checkbox, document.createTextNode(`${item.title.replace(/Crossword/gi, 'Word Scramble')} — ${item.subtitle}`));
      $('puzzle-choices').appendChild(label);
    }
    $('word-count').value = roundSettings.count; $('word-count').disabled = false;
    updateChoices(); loadPuzzle(makePuzzle(restoredWords, roundSettings));
    $('reset').disabled = false; $('download-pdf').disabled = false;
  } catch (error) {
    $('status').textContent = 'Puzzles could not be loaded. Refresh to try again.';
    console.error(error);
  }
})();

$('download-pdf').addEventListener('click', () => {
  if (!puzzle) return;
  try {
    const pdf = createWordScramblePDF(puzzle, entries, {
      singlePage: true, ...getWordScramblePDFOptions(),
      puzzleUrl: new URL('/word-scramble', window.location.origin).href
    });
    const url = URL.createObjectURL(pdf), link = document.createElement('a');
    link.href = url; link.download = 'random-word-scramble.pdf';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    $('pdf-status').textContent = 'PDF worksheet downloaded with the current random word set.';
  } catch (error) {
    $('pdf-status').textContent = error.message || 'The PDF could not be created. Please try again.';
    console.error(error);
  }
});

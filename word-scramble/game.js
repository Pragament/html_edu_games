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
const $ = id => document.getElementById(id);
const STORAGE = 'wordScramble.progress.v1';
let saved = {}, puzzles = [], puzzle, entries = [];
let pdfSelectionTouched = false;
try {
  const data = JSON.parse(localStorage.getItem(STORAGE));
  if (data && typeof data === 'object' && !Array.isArray(data)) saved = data;
} catch { /* Playing works without browser storage. */ }
function saveProgress() {
  if (!puzzle) return;
  saved.last = puzzle.id;
  saved[puzzle.id] = {signature: JSON.stringify(puzzle.words.map(w => w.answer)), entries};
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
  const previous = saved[puzzle.id];
  const valid = !reset && previous && previous.signature === JSON.stringify(puzzle.words.map(w => w.answer)) && Array.isArray(previous.entries);
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
  if (!pdfSelectionTouched) for (const checkbox of $('pdf-puzzles').querySelectorAll('input')) checkbox.checked = checkbox.value === puzzle.id;
}
$('puzzle-select').addEventListener('change', event => loadPuzzle(puzzles[Number(event.target.value)]));
$('reset').addEventListener('click', () => {
  if (window.confirm('Start this puzzle again? Your answers and hints will be cleared and the letters reshuffled.')) loadPuzzle(puzzle, true);
});
(async () => {
  try {
    const response = await fetch('../crossword/puzzles.json');
    if (!response.ok) throw new Error('Unable to load puzzle data');
    puzzles = await response.json();
    if (!Array.isArray(puzzles) || !puzzles.length || puzzles.some(p => !Array.isArray(p.words) || !p.words.length)) throw new Error('Invalid puzzle data');
    for (const [index, item] of puzzles.entries()) {
      const option = document.createElement('option'); option.value = index;
      option.textContent = `${item.title.replace(/Crossword/gi, 'Word Scramble')} — ${item.subtitle}`;
      $('puzzle-select').appendChild(option);
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox'; checkbox.value = item.id;
      checkbox.addEventListener('change', () => { pdfSelectionTouched = true; });
      label.append(checkbox, document.createTextNode(option.textContent));
      $('pdf-puzzles').appendChild(label);
    }
    let index = puzzles.findIndex(item => item.id === saved.last);
    if (index < 0) index = Math.floor(Math.random() * puzzles.length);
    $('puzzle-select').value = index; loadPuzzle(puzzles[index]);
    $('puzzle-select').disabled = false; $('reset').disabled = false; $('download-pdf').disabled = false;
  } catch (error) {
    $('status').textContent = 'Puzzles could not be loaded. Refresh to try again.';
    console.error(error);
  }
})();

$('download-pdf').addEventListener('click', () => {
  if (!puzzle) return;
  try {
    const selectedIds = new Set([...$('pdf-puzzles').querySelectorAll('input:checked')].map(control => control.value));
    const selected = puzzles.filter(item => selectedIds.has(item.id));
    if (!selected.length) { $('pdf-status').textContent = 'Select at least one puzzle for the worksheet.'; return; }
    const combined = {title: selected.length === 1 ? selected[0].title : 'Combined Value Education Puzzles',
      subtitle: `${selected.length} puzzle${selected.length === 1 ? '' : 's'} / ${selected.reduce((sum, item) => sum + item.words.length, 0)} words`,
      words: selected.flatMap(item => item.words)};
    const combinedEntries = selected.flatMap(item => item.id === puzzle.id ? entries : item.words.map((word, index) => {
      const previous = saved[item.id];
      const stored = previous?.signature === JSON.stringify(item.words.map(w => w.answer)) ? previous.entries?.[index] : null;
      return {scramble: isValidScramble(stored?.scramble, word.answer) ? stored.scramble : shuffleAnswer(word.answer)};
    }));
    const pdf = createWordScramblePDF(combined, combinedEntries, {
      singlePage: true,
      ...getWordScramblePDFOptions(),
      puzzleUrl: new URL('/word-scramble', window.location.origin).href
    });
    const url = URL.createObjectURL(pdf);
    const link = document.createElement('a');
    link.href = url; link.download = `${selected.length === 1 ? selected[0].id : 'combined'}-word-scramble.pdf`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    $('pdf-status').textContent = 'PDF worksheet downloaded.';
  } catch (error) {
    $('pdf-status').textContent = error.message || 'The PDF could not be created. Please try again.';
    console.error(error);
  }
});

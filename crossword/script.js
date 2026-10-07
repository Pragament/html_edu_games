/* =========================================================
   1. CROSSWORD DATA (loaded from puzzles.json)
   ========================================================= */
let PUZZLE = null;
let puzzles = [];

/* =========================================================
   2. BUILD THE GRID MODEL
   ========================================================= */
const cells = {};          // "r,c" -> cell object
let ROWS = 0, COLS = 0;

function buildGridModel() {
PUZZLE.words.forEach(w => {
  const letters = w.answer.split('');
  letters.forEach((ch, i) => {
    const r = w.dir === 'down'   ? w.row + i : w.row;
    const c = w.dir === 'across' ? w.col + i : w.col;
    const k = r + ',' + c;
    if (!cells[k]) cells[k] = { r, c, letter: ch, across: null, down: null, number: 0 };
    if (cells[k].letter !== ch) console.error('Letter conflict at', k, cells[k].letter, ch);
    if (w.dir === 'across') cells[k].across = w.n; else cells[k].down = w.n;
    ROWS = Math.max(ROWS, r + 1);
    COLS = Math.max(COLS, c + 1);
  });
});

/* --- numbering (left→right, top→bottom) --- */
const startKeys = [...new Set(PUZZLE.words.map(w => w.row + ',' + w.col))]
  .map(k => k.split(',').map(Number))
  .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

startKeys.forEach(([r, c], i) => { cells[r + ',' + c].number = i + 1; });
PUZZLE.words.forEach(w => { w.display = cells[w.row + ',' + w.col].number; });

acrossWords = PUZZLE.words.filter(w => w.dir === 'across').sort((a, b) => a.display - b.display);
downWords   = PUZZLE.words.filter(w => w.dir === 'down'  ).sort((a, b) => a.display - b.display);

}
let acrossWords = [], downWords = [];

/* =========================================================
   3. HELPERS
   ========================================================= */
const keyOf = (r, c) => r + ',' + c;

function wordCells(w) {
  const out = [];
  for (let i = 0; i < w.answer.length; i++) {
    out.push({
      r: w.dir === 'down'   ? w.row + i : w.row,
      c: w.dir === 'across' ? w.col + i : w.col
    });
  }
  return out;
}

function wordAt(r, c, dir) {
  return PUZZLE.words.find(w => {
    if (w.dir !== dir) return false;
    for (let i = 0; i < w.answer.length; i++) {
      const rr = w.dir === 'down'   ? w.row + i : w.row;
      const cc = w.dir === 'across' ? w.col + i : w.col;
      if (rr === r && cc === c) return true;
    }
    return false;
  });
}

/* =========================================================
   4. STATE
   ========================================================= */
const state = {
  entries: {},          // "r,c" -> letter typed by the player
  sel: null,            // { row, col, dir }
  wrong: new Set(),     // keys marked wrong
  revealed: new Set(),  // keys revealed
  hintCounts: new Map() // word number -> hints already shown
};

const cellEls = {};
const letterInput = document.getElementById('letter-input');

function positionLetterInput() {
  if (!state.sel) return;
  const cell = cellEls[keyOf(state.sel.row, state.sel.col)];
  if (!cell) return;
  Object.assign(letterInput.style, {
    display: 'block', left: `${cell.offsetLeft}px`, top: `${cell.offsetTop}px`,
    width: `${cell.offsetWidth}px`, height: `${cell.offsetHeight}px`
  });
  letterInput.setAttribute('aria-label', `Letter at row ${state.sel.row + 1}, column ${state.sel.col + 1}, ${state.sel.dir}`);
}

function openLetterKeyboard() {
  positionLetterInput();
  letterInput.value = ' ';
  letterInput.focus({ preventScroll: true });
  letterInput.setSelectionRange(1, 1);
}

function readLetterInput(event) {
  if (event.isComposing) return;
  if (event.inputType && event.inputType.startsWith('delete')) backspace();
  else for (const letter of letterInput.value.toUpperCase().replace(/[^A-Z]/g, '')) typeLetter(letter);
  // A space keeps deletion available on software keyboards even in an empty cell.
  letterInput.value = ' ';
  letterInput.setSelectionRange(1, 1);
}

letterInput.addEventListener('input', readLetterInput);
letterInput.addEventListener('compositionend', readLetterInput);
letterInput.addEventListener('beforeinput', event => {
  if (event.inputType.startsWith('delete') && event.cancelable) {
    event.preventDefault();
    backspace();
  }
});
window.addEventListener('resize', positionLetterInput);

/* =========================================================
   5. RENDER THE INTERACTIVE GRID
   ========================================================= */
function buildGridDOM() {
  const g = document.getElementById('grid');
  g.innerHTML = '';
  g.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const k = keyOf(r, c);
      const cell = cells[k];
      const d = document.createElement('div');

      if (!cell) { d.className = 'cell black'; g.appendChild(d); continue; }

      d.className = 'cell';
      d.dataset.key = k;

      if (cell.number) {
        const s = document.createElement('span');
        s.className = 'num';
        s.textContent = cell.number;
        d.appendChild(s);
      }

      const l = document.createElement('span');
      l.className = 'ltr';
      d.appendChild(l);

      d.addEventListener('click', () => onCellClick(r, c));
      cellEls[k] = d;
      g.appendChild(d);
    }
  }
  g.appendChild(letterInput);
}

function updateCell(k) {
  const el = cellEls[k];
  if (!el) return;
  el.querySelector('.ltr').textContent = state.entries[k] || '';
  el.classList.toggle('wrong', state.wrong.has(k));
  el.classList.toggle('revealed', state.revealed.has(k));
}

function paint() {
  Object.values(cellEls).forEach(el => el.classList.remove('sel', 'hl'));
  if (!state.sel) return;

  const { row, col, dir } = state.sel;
  const w = wordAt(row, col, dir);
  if (w) wordCells(w).forEach(({ r, c }) => {
    const el = cellEls[keyOf(r, c)];
    if (el) el.classList.add('hl');
  });

  const el = cellEls[keyOf(row, col)];
  if (el) el.classList.add('sel');
  positionLetterInput();
}

/* =========================================================
   6. CLUE LISTS
   ========================================================= */
function buildClueLists() {
  const fill = (ulId, list) => {
    const ul = document.getElementById(ulId);
    ul.innerHTML = '';
    list.forEach(w => {
      const li = document.createElement('li');
      li.dataset.n = w.display;
      li.dataset.dir = w.dir;
      li.innerHTML = `<b>${w.display}.</b> ${w.clue} <span class="len">(${w.answer.length})</span>`;
      li.addEventListener('click', () => { selectWord(w); openLetterKeyboard(); });
      ul.appendChild(li);
    });
  };
  fill('across-list', acrossWords);
  fill('down-list', downWords);
}

function highlightClue() {
  updateWordHints();
  document.querySelectorAll('.clue-col li').forEach(li => li.classList.remove('active'));
  if (!state.sel) return;
  const w = wordAt(state.sel.row, state.sel.col, state.sel.dir);
  if (!w) return;
  const li = document.querySelector(`.clue-col li[data-n="${w.display}"][data-dir="${w.dir}"]`);
  if (li) {
    li.classList.add('active');
    if (!window.matchMedia('(pointer: coarse)').matches) li.scrollIntoView({ block: 'nearest' });
  }
}

function updateWordHints() {
  const word = state.sel && wordAt(state.sel.row, state.sel.col, state.sel.dir);
  const hints = word && Array.isArray(word.hints) ? word.hints : [];
  const shown = word ? state.hintCounts.get(word.n) || 0 : 0;
  document.getElementById('word-hints-title').textContent = word
    ? `Hints for ${word.display} ${word.dir === 'across' ? 'Across' : 'Down'}` : 'Word hints';
  document.getElementById('word-hints-status').textContent = !word
    ? 'Select a word to see its available hints.'
    : hints.length ? `${shown} of ${hints.length} hints shown.` : 'No hints available for this word.';
  const list = document.getElementById('word-hints-list');
  list.replaceChildren();
  for (const hint of hints.slice(0, shown)) {
    const item = document.createElement('li');
    item.textContent = hint;
    list.appendChild(item);
  }
  const button = document.getElementById('btn-hint');
  button.disabled = !word || shown >= hints.length;
  button.textContent = hints.length && shown >= hints.length ? 'All hints shown' : 'Show next hint';
}

function showNextHint() {
  if (!state.sel) return;
  const word = wordAt(state.sel.row, state.sel.col, state.sel.dir);
  if (!word || !Array.isArray(word.hints)) return;
  const shown = state.hintCounts.get(word.n) || 0;
  state.hintCounts.set(word.n, Math.min(shown + 1, word.hints.length));
  updateWordHints();
  savePuzzleProgress();
}

/* =========================================================
   7. SELECTION + TYPING
   ========================================================= */
function selectCell(r, c, dir) {
  const cell = cells[keyOf(r, c)];
  if (!cell) return;

  if (!dir) dir = cell.across ? 'across' : 'down';
  if (dir === 'across' && !cell.across) dir = 'down';
  if (dir === 'down'   && !cell.down)   dir = 'across';

  state.sel = { row: r, col: c, dir };
  paint();
  highlightClue();
}

function selectWord(w) {
  state.sel = { row: w.row, col: w.col, dir: w.dir };
  paint();
  highlightClue();
}

function onCellClick(r, c) {
  const s = state.sel;
  if (s && s.row === r && s.col === c) {
    // toggle direction
    const cell = cells[keyOf(r, c)];
    const other = s.dir === 'across' ? 'down' : 'across';
    if (cell[other]) { s.dir = other; paint(); highlightClue(); openLetterKeyboard(); return; }
  }
  selectCell(r, c);
  openLetterKeyboard();
}

function typeLetter(ch) {
  if (!state.sel) return;
  const { row, col } = state.sel;
  const k = keyOf(row, col);
  if (!cells[k]) return;

  state.entries[k] = ch;
  state.wrong.delete(k);
  state.revealed.delete(k);
  updateCell(k);
  advance();
  updateStatus();
  savePuzzleProgress();
}

function advance() {
  const { row, col, dir } = state.sel;
  const w = wordAt(row, col, dir);
  if (!w) return;
  const wc = wordCells(w);
  const idx = wc.findIndex(p => p.r === row && p.c === col);
  if (idx > -1 && idx < wc.length - 1) {
    selectCell(wc[idx + 1].r, wc[idx + 1].c, dir);
  }
}

function backspace() {
  if (!state.sel) return;
  const { row, col, dir } = state.sel;
  const k = keyOf(row, col);

  if (state.entries[k]) {
    delete state.entries[k];
    state.wrong.delete(k);
    state.revealed.delete(k);
    updateCell(k);
  } else {
    const w = wordAt(row, col, dir);
    if (!w) return;
    const wc = wordCells(w);
    const idx = wc.findIndex(p => p.r === row && p.c === col);
    if (idx > 0) {
      const p = wc[idx - 1];
      const pk = keyOf(p.r, p.c);
      delete state.entries[pk];
      state.wrong.delete(pk);
      state.revealed.delete(pk);
      updateCell(pk);
      selectCell(p.r, p.c, dir);
    }
  }
  updateStatus();
  savePuzzleProgress();
}

function moveTo(r, c, dir) {
  if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return;
  const cell = cells[keyOf(r, c)];
  if (!cell) return;
  selectCell(r, c, dir || state.sel.dir);
}

/* =========================================================
   8. KEYBOARD
   ========================================================= */
document.addEventListener('keydown', e => {
  if ((e.target !== letterInput && e.target.closest('select, input, textarea, button, a')) || !state.sel || e.isComposing) return;
  const { row, col, dir } = state.sel;

  if (e.key === 'ArrowRight')      { e.preventDefault(); moveTo(row, col + 1, 'across'); }
  else if (e.key === 'ArrowLeft')  { e.preventDefault(); moveTo(row, col - 1, 'across'); }
  else if (e.key === 'ArrowDown')  { e.preventDefault(); moveTo(row + 1, col, 'down'); }
  else if (e.key === 'ArrowUp')    { e.preventDefault(); moveTo(row - 1, col, 'down'); }
  else if (e.key === 'Backspace')  { e.preventDefault(); backspace(); }
  else if (e.key === ' ')          { e.preventDefault();
      const cell = cells[keyOf(row, col)];
      const other = dir === 'across' ? 'down' : 'across';
      if (cell[other]) { state.sel.dir = other; paint(); highlightClue(); }
  }
  else if (e.key === 'Tab') {
    e.preventDefault();
    const all = [...acrossWords, ...downWords];
    const cur = wordAt(row, col, dir);
    let i = all.indexOf(cur);
    i = e.shiftKey ? (i - 1 + all.length) % all.length : (i + 1) % all.length;
    selectWord(all[i]);
  }
  else if (e.target !== letterInput && /^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); typeLetter(e.key.toUpperCase()); }
});

/* =========================================================
   9. TOOLBAR ACTIONS
   ========================================================= */
function checkAll() {
  state.wrong.clear();
  let filled = 0, correct = 0;
  const total = Object.keys(cells).length;

  Object.keys(cells).forEach(k => {
    const v = state.entries[k];
    if (v) filled++;
    if (v && v === cells[k].letter) correct++;
    if (v && v !== cells[k].letter) state.wrong.add(k);
  });

  Object.keys(cellEls).forEach(updateCell);
  updateStatus(true, filled, correct, total);
}

function revealLetter() {
  if (!state.sel) return;
  const k = keyOf(state.sel.row, state.sel.col);
  if (!cells[k]) return;
  state.entries[k] = cells[k].letter;
  state.wrong.delete(k);
  state.revealed.add(k);
  updateCell(k);
  advance();
  updateStatus();
  savePuzzleProgress();
}

function clearAll() {
  if (!window.confirm('Clear all letters and hints for this puzzle? Your saved progress for this puzzle will be cleared.')) return;
  state.hintCounts.clear();
  updateWordHints();
  state.entries = {};
  state.wrong.clear();
  state.revealed.clear();
  Object.keys(cellEls).forEach(updateCell);
  document.getElementById('status').textContent = '';
  savePuzzleProgress();
}

function updateStatus(force, filled, correct, total) {
  const el = document.getElementById('status');
  const totalCells = Object.keys(cells).length;
  const filledCount = Object.keys(cells).filter(k => state.entries[k]).length;
  const correctCount = Object.keys(cells).filter(k => state.entries[k] === cells[k].letter).length;

  if (correctCount === totalCells) {
    el.textContent = '🎉 Excellent! All answers are correct.';
    el.style.color = '#4ade80';
    return;
  }
  if (force) {
    el.textContent = `${correctCount} of ${totalCells} letters correct · ${filledCount} filled`;
    el.style.color = correctCount === totalCells ? '#4ade80' : '#fbbf24';
    return;
  }
  el.textContent = '';
}

/* =========================================================
   10. PRINT / DOWNLOAD A4 WORKSHEET
   ========================================================= */
function buildPrint() {
  const pa = document.getElementById('print-area');
  pa.innerHTML = '';

  /* ---------- PAGE 1 : the worksheet ---------- */
  const p1 = document.createElement('div');
  p1.className = 'print-page';

  const head = document.createElement('div');
  head.innerHTML = `
    <h1>${PUZZLE.title}</h1>
    <p class="psub">${PUZZLE.subtitle}</p>
    <p class="pinst">${getWorksheetInstructions(PUZZLE)}</p>
    <p class="pname">Name: ______________________________ &nbsp;&nbsp; Class: __________ &nbsp;&nbsp; Date: ______________</p>
  `;
  p1.appendChild(head);

  // empty grid (9 mm cells)
  const g1 = document.createElement('div');
  g1.className = 'p-grid';
  g1.style.gridTemplateColumns = `repeat(${COLS}, 9mm)`;
  g1.style.gridAutoRows = '9mm';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cells[keyOf(r, c)];
      const d = document.createElement('div');
      d.className = 'p-cell' + (cell ? '' : ' p-black');
      if (cell && cell.number) d.innerHTML = `<span class="p-num">${cell.number}</span>`;
      g1.appendChild(d);
    }
  }
  p1.appendChild(g1);

  // clues
  const clues = document.createElement('div');
  clues.className = 'p-clues';
  const printClue = w => `<p><b>${w.display}.</b> ${w.clue} <span class="p-len">(${w.answer.length})</span>${(w.hints || []).map((hint, index) => `<span class="p-hint"><b>Hint ${index + 1}:</b> ${hint}</span>`).join('')}${w.explain ? `<span class="p-hint"><b>Explanation:</b> ${w.explain}</span>` : ''}</p>`;
  clues.innerHTML = `
    <div>
      <h2>Across</h2>
      ${acrossWords.map(printClue).join('')}
    </div>
    <div>
      <h2>Down</h2>
      ${downWords.map(printClue).join('')}
    </div>
  `;
  p1.appendChild(clues);
  pa.appendChild(p1);

  /* ---------- PAGE 2 : answer key + explanations ---------- */
  const p2 = document.createElement('div');
  p2.className = 'print-page';
  p2.innerHTML = `
    <h1>Answer Key &amp; Explanations</h1>
    <p class="psub">${PUZZLE.title} — ${PUZZLE.subtitle}</p>
  `;

  const g2 = document.createElement('div');
  g2.className = 'p-grid p-grid-answers';
  g2.style.gridTemplateColumns = `repeat(${COLS}, 6mm)`;
  g2.style.gridAutoRows = '6mm';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cells[keyOf(r, c)];
      const d = document.createElement('div');
      d.className = 'p-cell' + (cell ? '' : ' p-black');
      if (cell) {
        d.innerHTML = `<span class="p-num">${cell.number || ''}</span><span class="p-ltr">${cell.letter}</span>`;
      }
      g2.appendChild(d);
    }
  }
  p2.appendChild(g2);

  const ex = document.createElement('div');
  ex.className = 'p-explain';
  ex.innerHTML = PUZZLE.words
    .slice()
    .sort((a, b) => a.display - b.display)
    .map(w => `
      <p>
        <b>${w.display} ${w.dir === 'across' ? 'ACROSS' : 'DOWN'} — ${w.answer}</b><br>
        <i>${w.clue}</i>
        <span class="p-exp"><b>${w.chapter}:</b> ${w.explain}</span>
      </p>`)
    .join('');
  p2.appendChild(ex);
  pa.appendChild(p2);
}

/* =========================================================
   11. INIT
   ========================================================= */
const LAST_PUZZLE_KEY = 'crossword.lastPuzzle.v1';
const progressKey = id => `crossword.progress.v1.${id}`;
const puzzleSignature = puzzle => JSON.stringify(puzzle.words.map(w => [w.answer, w.row, w.col, w.dir]));

function savePuzzleProgress() {
  if (!PUZZLE) return;
  try {
    localStorage.setItem(progressKey(PUZZLE.id), JSON.stringify({
      signature: puzzleSignature(PUZZLE), entries: state.entries, selection: state.sel,
      revealed: [...state.revealed], hints: [...state.hintCounts]
    }));
    localStorage.setItem(LAST_PUZZLE_KEY, PUZZLE.id);
  } catch {
    // Playing still works when browser storage is unavailable.
  }
}

function restorePuzzleProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey(PUZZLE.id)));
    if (!saved || saved.signature !== puzzleSignature(PUZZLE)) return null;
    if (saved.entries && typeof saved.entries === 'object') {
      for (const [key, letter] of Object.entries(saved.entries)) {
        if (Object.hasOwn(cells, key) && typeof letter === 'string' && /^[A-Z]$/.test(letter)) state.entries[key] = letter;
      }
    }
    if (Array.isArray(saved.revealed)) {
      for (const key of saved.revealed) {
        if (Object.hasOwn(cells, key) && state.entries[key] === cells[key].letter) state.revealed.add(key);
      }
    }
    if (Array.isArray(saved.hints)) {
      for (const pair of saved.hints) {
        if (!Array.isArray(pair) || pair.length !== 2) continue;
        const [n, count] = pair;
        const word = PUZZLE.words.find(w => w.n === n);
        if (word && Number.isInteger(count) && count >= 0) state.hintCounts.set(n, Math.min(count, (word.hints || []).length));
      }
    }
    const selected = saved.selection;
    if (selected && Number.isInteger(selected.row) && Number.isInteger(selected.col)
        && ['across', 'down'].includes(selected.dir) && wordAt(selected.row, selected.col, selected.dir)) return selected;
  } catch {
    // Ignore damaged or outdated progress.
  }
  return null;
}

function loadPuzzle(puzzle) {
  state.hintCounts.clear();
  PUZZLE = structuredClone(puzzle);
  for (const key of Object.keys(cells)) delete cells[key];
  for (const key of Object.keys(cellEls)) delete cellEls[key];
  ROWS = COLS = 0;
  state.entries = {};
  state.sel = null;
  state.wrong.clear();
  state.revealed.clear();
  buildGridModel();
  buildGridDOM();
  buildClueLists();
  document.querySelector('header.top h1').textContent = PUZZLE.title;
  document.querySelector('header.top p').textContent = PUZZLE.subtitle;
  document.title = PUZZLE.title;
  const chips = document.querySelector('.chips');
  chips.replaceChildren();
  for (const chapter of new Set(PUZZLE.words.map(w => w.chapter))) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = chapter;
    chips.appendChild(chip);
  }
  document.getElementById('status').textContent = '';
  document.getElementById('print-area').replaceChildren();
  document.getElementById('pdf-status').textContent = '';
  const selection = restorePuzzleProgress();
  Object.keys(cellEls).forEach(updateCell);
  const first = acrossWords[0] || downWords[0];
  if (selection) selectCell(selection.row, selection.col, selection.dir);
  else selectWord(first);
  updateStatus();
  savePuzzleProgress();
}

async function loadPuzzles() {
  const selector = document.getElementById('puzzle-select');
  const status = document.getElementById('puzzle-load-status');
  const buttons = document.querySelectorAll('.toolbar button, #btn-print, #btn-pdf');
  buttons.forEach(button => button.disabled = true);
  try {
    const response = await fetch('./puzzles.json');
    if (!response.ok) throw new Error('Unable to load puzzles');
    puzzles = await response.json();
    if (!Array.isArray(puzzles) || !puzzles.length || puzzles.some(p => !Array.isArray(p.words) || !p.words.length)) {
      throw new Error('Invalid puzzle list');
    }
    selector.replaceChildren();
    puzzles.forEach((puzzle, index) => selector.add(new Option(puzzle.title, String(index))));
    let savedPuzzleId;
    try { savedPuzzleId = localStorage.getItem(LAST_PUZZLE_KEY); } catch {}
    const savedIndex = puzzles.findIndex(puzzle => puzzle.id === savedPuzzleId);
    const initialIndex = savedIndex >= 0 ? savedIndex : Math.floor(Math.random() * puzzles.length);
    selector.value = String(initialIndex);
    loadPuzzle(puzzles[initialIndex]);
    selector.disabled = false;
    buttons.forEach(button => button.disabled = false);
    updateWordHints();
    status.textContent = 'Progress is saved automatically on this browser.';
  } catch (error) {
    status.textContent = 'Puzzles could not be loaded. Please refresh and try again.';
    console.error(error);
  }
}
document.getElementById('puzzle-select').addEventListener('change', event => {
  loadPuzzle(puzzles[Number(event.target.value)]);
});
loadPuzzles();

document.getElementById('btn-check').addEventListener('click', checkAll);
document.getElementById('btn-letter').addEventListener('click', revealLetter);
document.getElementById('btn-hint').addEventListener('click', showNextHint);
document.getElementById('btn-clear').addEventListener('click', clearAll);

document.getElementById('btn-print').addEventListener('click', () => {
  buildPrint();
  setTimeout(() => window.print(), 80);
});

const pdfTextSizeIds = ['pdf-text-size', 'pdf-across-text-size', 'pdf-down-text-size', 'pdf-header-text-size'];
function updatePDFTextSizeLabel(id) {
  document.getElementById(`${id}-value`).value = `${document.getElementById(id).value} pt`;
}
for (const id of pdfTextSizeIds) {
  for (const eventName of ['input', 'change']) {
    document.getElementById(id).addEventListener(eventName, () => updatePDFTextSizeLabel(id));
  }
}

document.getElementById('pdf-watermark-text').addEventListener('input', event => {
  document.getElementById('pdf-watermark-enabled').checked = event.target.value.trim().length > 0;
});
for (const [name, suffix] of [['opacity', '%'], ['size', ' pt']]) {
  document.getElementById(`pdf-watermark-${name}`).addEventListener('input', event => {
    document.getElementById(`pdf-watermark-${name}-value`).textContent = `${event.target.value}${suffix}`;
  });
}

/* Keep the latest PDF preferences on this browser, replacing older settings. */
const PDF_OPTIONS_KEY = 'crossword.pdfOptions.v1';
const pdfOptionControls = [
  'pdf-answers', ...pdfTextSizeIds, 'pdf-across-side', 'pdf-watermark-enabled', 'pdf-watermark-text',
  'pdf-watermark-opacity', 'pdf-watermark-size', 'pdf-watermark-position',
  'pdf-watermark-alignment'
].map(id => document.getElementById(id));

function savePDFOptions() {
  const options = Object.fromEntries(pdfOptionControls.map(control => [
    control.id, control.type === 'checkbox' ? control.checked : control.value
  ]));
  try {
    localStorage.setItem(PDF_OPTIONS_KEY, JSON.stringify(options));
  } catch {
    // PDF controls remain usable when browser storage is unavailable.
  }
}

function restorePDFOptions() {
  try {
    const options = JSON.parse(localStorage.getItem(PDF_OPTIONS_KEY));
    if (!options || typeof options !== 'object' || Array.isArray(options)) return;
    for (const control of pdfOptionControls) {
      const value = options[control.id] ?? (pdfTextSizeIds.includes(control.id) ? options['pdf-text-size'] : undefined);
      if (control.type === 'checkbox') {
        if (typeof value === 'boolean') control.checked = value;
      } else if (control.type === 'range') {
        if (typeof value !== 'string' && typeof value !== 'number') continue;
        const number = Number(value);
        if (value === '' || !Number.isFinite(number)) continue;
        const min = Number(control.min), max = Number(control.max), step = Number(control.step) || 1;
        control.value = String(Math.min(max, Math.max(min, min + Math.round((number - min) / step) * step)));
      } else if (control.tagName === 'SELECT') {
        if ([...control.options].some(option => option.value === value)) control.value = value;
      } else if (typeof value === 'string') {
        control.value = value.slice(0, control.maxLength);
      }
    }
  } catch {
    // Ignore malformed saved settings and use the existing defaults.
  }
  for (const id of pdfTextSizeIds) {
    updatePDFTextSizeLabel(id);
  }
  document.getElementById('pdf-watermark-opacity-value').textContent = `${document.getElementById('pdf-watermark-opacity').value}%`;
  document.getElementById('pdf-watermark-size-value').textContent = `${document.getElementById('pdf-watermark-size').value} pt`;
}

restorePDFOptions();
for (const eventName of ['input', 'change']) {
  document.querySelector('.pdf-options').addEventListener(eventName, event => {
    if (pdfOptionControls.includes(event.target)) savePDFOptions();
  });
}

document.getElementById('btn-pdf').addEventListener('click', () => {
  if (!PUZZLE) return;
  const status = document.getElementById('pdf-status');
  savePDFOptions();
  try {
    const pdf = createCrosswordPDF(PUZZLE, cells, ROWS, COLS, {
      includeAnswers: document.getElementById('pdf-answers').checked,
      textSize: Number(document.getElementById('pdf-text-size').value),
      acrossTextSize: Number(document.getElementById('pdf-across-text-size').value),
      downTextSize: Number(document.getElementById('pdf-down-text-size').value),
      headerTextSize: Number(document.getElementById('pdf-header-text-size').value),
      acrossSide: document.getElementById('pdf-across-side').value,
      puzzleUrl: new URL('/crossword', window.location.origin).href,
      watermark: document.getElementById('pdf-watermark-enabled').checked ? {
        text: document.getElementById('pdf-watermark-text').value.trim(),
        opacity: Number(document.getElementById('pdf-watermark-opacity').value) / 100,
        size: Number(document.getElementById('pdf-watermark-size').value),
        position: document.getElementById('pdf-watermark-position').value,
        alignment: document.getElementById('pdf-watermark-alignment').value
      } : null
    });
    const url = URL.createObjectURL(pdf);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${PUZZLE.id || 'crossword'}-worksheet.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    status.textContent = 'PDF downloaded.';
  } catch (error) {
    status.textContent = 'PDF download failed. Please try again or use Print A4 Worksheet.';
    console.error(error);
  }
});

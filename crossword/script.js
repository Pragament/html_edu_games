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
  revealed: new Set()   // keys revealed
};

const cellEls = {};

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
      li.addEventListener('click', () => selectWord(w));
      ul.appendChild(li);
    });
  };
  fill('across-list', acrossWords);
  fill('down-list', downWords);
}

function highlightClue() {
  document.querySelectorAll('.clue-col li').forEach(li => li.classList.remove('active'));
  if (!state.sel) return;
  const w = wordAt(state.sel.row, state.sel.col, state.sel.dir);
  if (!w) return;
  const li = document.querySelector(`.clue-col li[data-n="${w.display}"][data-dir="${w.dir}"]`);
  if (li) { li.classList.add('active'); li.scrollIntoView({ block: 'nearest' }); }
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
    if (cell[other]) { s.dir = other; paint(); highlightClue(); return; }
  }
  selectCell(r, c);
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
  if (e.target.closest('select, input, textarea, button, a') || !state.sel) return;
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
  else if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); typeLetter(e.key.toUpperCase()); }
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
}

function revealWord() {
  if (!state.sel) return;
  const w = wordAt(state.sel.row, state.sel.col, state.sel.dir);
  if (!w) return;
  wordCells(w).forEach(({ r, c }) => {
    const k = keyOf(r, c);
    state.entries[k] = cells[k].letter;
    state.wrong.delete(k);
    state.revealed.add(k);
    updateCell(k);
  });
  updateStatus();
}

function revealAll() {
  Object.keys(cells).forEach(k => {
    state.entries[k] = cells[k].letter;
    state.wrong.delete(k);
    state.revealed.add(k);
    updateCell(k);
  });
  updateStatus();
}

function clearAll() {
  state.entries = {};
  state.wrong.clear();
  state.revealed.clear();
  Object.keys(cellEls).forEach(updateCell);
  document.getElementById('status').textContent = '';
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
    <p class="pinst">${PUZZLE.instructions}</p>
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
  clues.innerHTML = `
    <div>
      <h2>Across</h2>
      ${acrossWords.map(w => `<p><b>${w.display}.</b> ${w.clue} <span class="p-len">(${w.answer.length})</span></p>`).join('')}
    </div>
    <div>
      <h2>Down</h2>
      ${downWords.map(w => `<p><b>${w.display}.</b> ${w.clue} <span class="p-len">(${w.answer.length})</span></p>`).join('')}
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
function loadPuzzle(puzzle) {
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
  const first = acrossWords[0] || downWords[0];
  selectWord(first);
}

async function loadPuzzles() {
  const selector = document.getElementById('puzzle-select');
  const status = document.getElementById('puzzle-load-status');
  const buttons = document.querySelectorAll('.toolbar button, #btn-print');
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
    loadPuzzle(puzzles[0]);
    selector.disabled = false;
    buttons.forEach(button => button.disabled = false);
    status.textContent = 'Changing puzzles starts a new grid.';
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
document.getElementById('btn-word').addEventListener('click', revealWord);
document.getElementById('btn-all').addEventListener('click', revealAll);
document.getElementById('btn-clear').addEventListener('click', clearAll);

document.getElementById('btn-print').addEventListener('click', () => {
  buildPrint();
  setTimeout(() => window.print(), 80);
});

// Run with: node spelling-detectives/game.test.cjs (no network or dependencies).
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8');
const puzzles = JSON.parse(fs.readFileSync(path.join(__dirname, '../crossword/puzzles.json')));
class Element {
  constructor() { this.children = []; this.events = {}; this.value = ''; this.classList = {toggle() {}}; }
  append(...items) { this.children.push(...items); }
  appendChild(item) { this.children.push(item); }
  replaceChildren(...items) { this.children = items; }
  addEventListener(name, callback) { this.events[name] = callback; }
  scrollIntoView() {}
  focus() {}
}
const storage = new Map();
async function boot() {
  const elements = {};
  for (const [, id] of fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8').matchAll(/id="([^"]+)"/g)) elements[id] = new Element();
  elements.mode.value = '1'; elements.count.value = '10';
  const context = {console, window: {confirm: () => true},
    document: {getElementById: id => elements[id] ||= new Element(), createElement: () => new Element()},
    localStorage: {getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value)},
    fetch: async () => ({ok: true, json: async () => puzzles})};
  vm.createContext(context); vm.runInContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return {context, elements};
}
(async () => {
  let {context, elements} = await boot();
  for (const puzzle of puzzles) for (const word of puzzle.words) for (let i = 0; i < 20; i++) {
    const changed = context.misspell(word.answer); assert.notEqual(changed, word.answer); assert.match(changed, /^[A-Z]+$/);
  }
  for (const teams of [1, 2, 3, 4]) {
    elements.puzzle.value = puzzles[0].id; elements.mode.value = String(teams); elements.count.value = '4';
    context.start();
    const current = () => JSON.parse(storage.get('spellingDetectives.round.v1'));
    assert.equal(new Set(current().questions.map(q => q.wordIndex)).size, 4);
    const correct = puzzles[0].words[current().questions[0].wordIndex].answer;
    elements.answer.events.input({target: {value: correct.toLowerCase()}});
    // A draft answer survives refresh before checking.
    let restored = await boot();
    assert.equal(restored.elements.answer.value, correct.toLowerCase());
    context = restored.context; elements = restored.elements;
    elements['answer-form'].events.submit({preventDefault() {}});
    assert.equal(context.scores()[0], 10);
    elements['answer-form'].events.submit({preventDefault() {}}); assert.equal(context.scores()[0], 10);
    elements.next.events.click(); assert(elements.turn.textContent.includes(teams === 1 ? 'Solo detective' : 'Team 2'));
    elements.answer.events.input({target: {value: 'INVALID'}});
    elements['answer-form'].events.submit({preventDefault() {}}); elements.next.events.click();
    elements.pass.events.click(); elements.next.events.click();
    elements.pass.events.click(); elements.next.events.click();
    assert.equal(elements.results.hidden, false); assert.equal(context.scores().reduce((a, b) => a + b), 10);
    restored = await boot(); assert.equal(restored.elements.results.hidden, false);
    const invalid = current(); invalid.index = 999; assert.equal(context.restore(invalid), null);
    const forged = current(); forged.questions[0].answer = 'WRONG'; assert.equal(context.restore(forged), null);
  }
  elements.puzzle.value = puzzles[0].id; elements.mode.value = '2'; elements.count.value = '4'; context.start();
  const before = storage.get('spellingDetectives.round.v1'); context.window.confirm = () => false; context.start();
  assert.equal(storage.get('spellingDetectives.round.v1'), before);
  console.log('Passed: spelling errors for all words, random nonrepeating rounds, solo and 2–4 team scoring, one-attempt rules, turn rotation, draft/complete restoration, reset cancellation, and damaged saves.');
})().catch(error => { console.error(error); process.exitCode = 1; });

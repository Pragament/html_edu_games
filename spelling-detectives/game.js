'use strict';
function misspell(answer, random = Math.random) {
  const swaps = [];
  for (let i = 0; i < answer.length - 1; i++) if (answer[i] !== answer[i + 1]) swaps.push(i);
  if (swaps.length) {
    const index = swaps[Math.floor(random() * swaps.length)], letters = [...answer];
    [letters[index], letters[index + 1]] = [letters[index + 1], letters[index]];
    return letters.join('');
  }
  return answer.length > 1 ? answer.slice(1) : (answer === 'A' ? 'E' : 'A');
}
function sample(items, count, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]];
  }
  return result.slice(0, count);
}
const normalize = answer => String(answer).toUpperCase().replace(/[^A-Z]/g, '');
const $ = id => document.getElementById(id);
const STORAGE = 'spellingDetectives.round.v1';
let puzzles = [], round = null;
function persist() {
  try { localStorage.setItem(STORAGE, JSON.stringify(round)); } catch { /* Gameplay works without storage. */ }
}
function currentWord() { return puzzles.find(item => item.id === round.puzzleId).words[round.questions[round.index].wordIndex]; }
function scores() {
  const totals = Array(round.teams).fill(0);
  round.questions.forEach((question, index) => { if (question.result === 'correct') totals[index % round.teams] += 10; });
  return totals;
}
function teamName(index) { return round.teams === 1 ? 'Solo detective' : `Team ${index + 1}`; }
function renderScores(container, active = -1) {
  container.replaceChildren();
  scores().forEach((score, index) => {
    const card = document.createElement('div'); card.className = 'score' + (active === index ? ' active' : '');
    const name = document.createElement('span'); name.textContent = teamName(index);
    const points = document.createElement('strong'); points.textContent = `${score} pts`;
    card.append(name, points); container.appendChild(card);
  });
}
function updateAvailable() {
  const source = puzzles.find(item => item.id === $('puzzle').value);
  if (!source) return;
  $('count').max = source.words.length;
  if (Number($('count').value) > source.words.length) $('count').value = source.words.length;
  $('pool-info').textContent = `${source.words.length} words available. Progress is saved automatically on this browser.`;
}
function render() {
  const complete = round.index >= round.questions.length;
  $('game').hidden = complete; $('results').hidden = !complete;
  if (complete) { renderResults(); return; }
  const question = round.questions[round.index], word = currentWord(), answered = question.result !== null;
  $('position').textContent = `Word ${round.index + 1} of ${round.questions.length}`;
  $('turn').textContent = `${teamName(round.index % round.teams)}${round.teams > 1 ? ' — your turn' : ''}`;
  $('progress').max = round.questions.length;
  $('progress').value = round.index + (answered ? 1 : 0);
  $('misspelling').textContent = question.misspelling;
  $('description').textContent = word.clue;
  $('answer').value = question.answer; $('answer').readOnly = answered;
  $('answer').maxLength = word.answer.length + 10;
  $('check').disabled = answered; $('pass').disabled = answered;
  $('feedback').className = question.result === 'correct' ? 'correct' : 'incorrect';
  $('feedback').textContent = !answered ? '' : question.result === 'correct'
    ? `Correct! ${word.answer} — 10 points.` : `The correct spelling is ${word.answer}. No points this turn.`;
  $('explanation').hidden = !answered; $('explanation').textContent = word.explain || '';
  $('next').hidden = !answered;
  const nextTeam = (round.index + 1) % round.teams;
  $('next').textContent = round.index === round.questions.length - 1 ? 'See results'
    : round.teams > 1 ? `Next word · pass to ${teamName(nextTeam)}` : 'Next word';
  renderScores($('scores'), round.index % round.teams);
  $('status').textContent = 'Game in progress. Changing setup applies when you start a new game.';
}
function renderResults() {
  const totals = scores(), correct = round.questions.filter(q => q.result === 'correct').length;
  renderScores($('final-scores'));
  if (round.teams === 1) $('result-summary').textContent = `You corrected ${correct} of ${round.questions.length} words and earned ${totals[0]} points.`;
  else {
    const high = Math.max(...totals), winners = totals.map((score, i) => score === high ? teamName(i) : null).filter(Boolean);
    $('result-summary').textContent = winners.length === 1 ? `${winners[0]} wins with ${high} points!` : `Tie: ${winners.join(' and ')} with ${high} points each.`;
  }
  $('review').replaceChildren();
  const source = puzzles.find(item => item.id === round.puzzleId);
  round.questions.forEach((question, index) => {
    const word = source.words[question.wordIndex], li = document.createElement('li');
    const title = document.createElement('strong'); title.textContent = `${question.misspelling} → ${word.answer}`;
    const result = document.createElement('p'); result.className = 'review-result';
    result.textContent = `${teamName(index % round.teams)}: ${question.result === 'correct' ? 'correct · +10' : question.result === 'passed' ? 'passed · 0' : 'incorrect · 0'}`;
    const explanation = document.createElement('p'); explanation.textContent = word.explain || '';
    li.append(title, result, explanation); $('review').appendChild(li);
  });
  $('status').textContent = 'Investigation complete. Start a new game to try another set.';
}
function start() {
  const source = puzzles.find(item => item.id === $('puzzle').value), count = Number($('count').value), teams = Number($('mode').value);
  if (!source || !Number.isInteger(count) || count < 1 || count > source.words.length) {
    $('status').textContent = 'Choose a valid whole number of words from the selected puzzle.'; return;
  }
  if (round && round.index < round.questions.length && !window.confirm('Start a new game? This replaces the saved round and its scores.')) return;
  round = {puzzleId: source.id, signature: JSON.stringify(source.words.map(w => [w.answer, w.clue])), teams, index: 0,
    questions: sample(source.words.map((_, index) => index), count).map(wordIndex => ({wordIndex, misspelling: misspell(source.words[wordIndex].answer), answer: '', result: null}))};
  persist(); render(); $('game').scrollIntoView({behavior: 'smooth', block: 'start'});
}
function finish(result) {
  if (!round || round.index >= round.questions.length) return;
  const question = round.questions[round.index];
  if (question.result !== null) return;
  question.result = result; persist(); render(); $('next').focus();
}
$('answer').addEventListener('input', event => {
  if (!round || round.index >= round.questions.length) return;
  const question = round.questions[round.index];
  if (question.result === null) { question.answer = event.target.value; persist(); }
});
$('answer-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!round || round.index >= round.questions.length) return;
  const answer = round.questions[round.index].answer;
  if (!normalize(answer)) { $('feedback').textContent = 'Type a corrected spelling first, or choose Pass.'; $('answer').focus(); return; }
  finish(normalize(answer) === currentWord().answer ? 'correct' : 'incorrect');
});
$('pass').addEventListener('click', () => finish('passed'));
$('next').addEventListener('click', () => {
  if (!round || round.index >= round.questions.length || round.questions[round.index].result === null) return;
  round.index++; persist(); render();
  if (round.index < round.questions.length) $('answer').focus(); else $('result-title').focus();
});
$('start').addEventListener('click', start); $('again').addEventListener('click', start);
$('puzzle').addEventListener('change', updateAvailable);
function restore(value) {
  if (!value || !Number.isInteger(value.teams) || value.teams < 1 || value.teams > 4 || !Array.isArray(value.questions)) return null;
  const source = puzzles.find(item => item.id === value.puzzleId);
  if (!source || value.signature !== JSON.stringify(source.words.map(w => [w.answer, w.clue])) || !value.questions.length || value.questions.length > source.words.length) return null;
  if (!Number.isInteger(value.index) || value.index < 0 || value.index > value.questions.length) return null;
  const used = new Set();
  for (const [i, q] of value.questions.entries()) {
    if (!q || !Number.isInteger(q.wordIndex) || !source.words[q.wordIndex] || used.has(q.wordIndex) || typeof q.answer !== 'string' || q.answer.length > source.words[q.wordIndex].answer.length + 10) return null;
    used.add(q.wordIndex);
    if (typeof q.misspelling !== 'string' || !/^[A-Z]+$/.test(q.misspelling) || q.misspelling === source.words[q.wordIndex].answer || q.misspelling.length > source.words[q.wordIndex].answer.length + 1) return null;
    if (![null, 'correct', 'incorrect', 'passed'].includes(q.result) || (i < value.index && q.result === null) || (i > value.index && q.result !== null)) return null;
    if (q.result === 'correct' && normalize(q.answer) !== source.words[q.wordIndex].answer) return null;
  }
  return value;
}
(async () => {
  try {
    const response = await fetch('../crossword/puzzles.json'); if (!response.ok) throw Error('Unable to load puzzles');
    puzzles = await response.json(); if (!Array.isArray(puzzles) || !puzzles.length) throw Error('No puzzles');
    for (const source of puzzles) {
      const option = document.createElement('option'); option.value = source.id;
      option.textContent = `${source.title.replace(/Crossword/gi, 'Spelling Detectives')} — ${source.subtitle}`;
      $('puzzle').appendChild(option);
    }
    try { round = restore(JSON.parse(localStorage.getItem(STORAGE))); } catch {}
    $('puzzle').value = round ? round.puzzleId : puzzles[Math.floor(Math.random() * puzzles.length)].id;
    if (round) { $('mode').value = round.teams; $('count').value = round.questions.length; }
    updateAvailable(); $('puzzle').disabled = false; $('start').disabled = false;
    if (round) render(); else $('status').textContent = 'Choose a puzzle and start your investigation.';
  } catch (error) { $('status').textContent = 'Puzzles could not be loaded. Refresh to try again.'; console.error(error); }
})();

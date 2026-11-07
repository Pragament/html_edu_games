// Run with node sentence-arena/check.cjs. Minimal DOM harness for scoring/state checks.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data=JSON.parse(fs.readFileSync(__dirname+'/questions.json'));
const nodes=new Map();
class Element{constructor(){this.children=[];this.listeners={};this.classList={toggle(){}};this.value='';}set id(v){this._id=v;nodes.set(v,this);}get id(){return this._id;}append(...children){this.children.push(...children);}replaceChildren(...children){this.children=children;}addEventListener(k,fn){this.listeners[k]=fn;}setAttribute(){} }
for(const id of ['filters','start','status','rounds','duration','setup','results','play','mode','round-title','next','round-help','boards','timer','end','clear','fullscreen','pool-count','points-correct','points-wrong','points-skipped','points-legend','setup-legend']){const el=new Element();el.id=id;}
nodes.get('rounds').value='10';nodes.get('duration').value='0';
let now=100000;
const context=vm.createContext({Date:{now:()=>now},document:{querySelector:()=>({content:'1.3.0-2026.11.07'}),getElementById:id=>nodes.get(id),createElement:()=>new Element(),createTextNode:s=>s,querySelectorAll:()=>[]},fetch:()=>new Promise(()=>{}),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},console});
vm.runInContext(fs.readFileSync(__dirname+'/game.js','utf8'),context);
const run=s=>vm.runInContext(s,context);
context.data=data;run('bank=data');

for(const [key,value]of Object.entries({correct:'10',wrong:'-2',skipped:'-1'}))nodes.get('points-'+key).value=value;
assert.equal(data.modes.length,40);
for(const q of data.questions){assert(data.modes.some(m=>m.id===q.mode));if(q.kind==='choice')assert(q.options.includes(q.answer));else if(q.kind!=='creative'){const answer=(q.prefix?q.prefix+' ':'')+(q.letters?q.letters.join(''):q.chunks?q.chunks.join(' '):q.answer);assert.equal(run(`normalize(${JSON.stringify(answer)})`),run(`normalize(${JSON.stringify(q.answer)})`));}}
const choices={};context.document.querySelectorAll=selector=>{const match=selector.match(/name="(\w+)"/);return match?(choices[match[1]]||[]).map(value=>({value})):[];};
run('start()');assert.equal(run('players[0].queue.length'),10);assert.equal(run("deck.flat().some(q=>q.kind==='creative')"),false);assert.equal(run('new Set(deck.flat().map(q=>normalize(q.answer))).size'),40);
const other=run('states[1].question.id');run("resolve(0,'wrong')");assert.equal(run('players[0].score'),-2);run("resolve(0,'wrong')");assert.equal(run('players[0].score'),-2,'one penalty per question');run('nextPlayer(0)');assert.equal(run('players[0].index'),1);assert.equal(run('players[1].index'),0);assert.equal(run('states[1].question.id'),other);run('skipPlayer(0)');assert.equal(run('players[0].index'),2);assert.equal(run('players[0].score'),-3);
// Validate every automatically graded answer through its Check button.
for(const q of data.questions.filter(q=>q.kind!=='creative')){context.question=q;run("{players[0].queue=[question,question];players[0].index=0;players[0].score=0;players[0].finishedAt=null;showPlayer(0);states[0].remembering=false;states[0].selection=question.answer;const wanted=question.letters?question.answer.split(''):question.chunks||question.answer.split(' ');const used=new Set();states[0].chosen=wanted.map(t=>{const idx=states[0].tokens.findIndex((x,n)=>x===t&&!used.has(n));used.add(idx);return idx;});renderInput(question,0)}");const actions=nodes.get('input-0').children.at(-1);actions.children[1].listeners.click();assert.equal(run('players[0].score'),10,q.id);run('award(question,0)');assert.equal(run('players[0].score'),10);}
run('finish(true)');
for(const [key,bad]of [['correct','-1'],['wrong','1'],['skipped','1'],['correct','1.5'],['wrong',''],['skipped','Infinity']]){const field=nodes.get('points-'+key),old=field.value;field.value=bad;run('start()');assert.equal(run('active'),false,'invalid '+key);field.value=old;}
for(const key of ['wrong','skipped'])nodes.get('points-'+key).value='0';run('start()');run("resolve(0,'wrong');nextPlayer(0);skipPlayer(0)");assert.equal(run('players[0].score'),0);
// Timeout is independent and counts as one skip, then student can continue.
run('finish(true)');nodes.get('duration').value='45';nodes.get('points-skipped').value='-3';run('start()');run('states[0].deadline=Date.now()-1;tick()');assert.equal(run('players[0].score'),-3);assert.equal(run('states[0].done'),true);assert.equal(run('states[1].done'),false);run('tick()');assert.equal(run('players[0].score'),-3);run('nextPlayer(0)');assert.equal(run('players[0].index'),1);run('finish(true)');assert.equal(run('players[0].skipped'),10);assert.equal(run('players[0].score'),-30,'early end counts each unanswered once');
// Completion time is captured when each player finishes, without waiting for peers.
nodes.get('duration').value='0';nodes.get('rounds').value='5';run('start()');now+=1000;
function complete(i){context.playerIndex=i;run("while(players[playerIndex].finishedAt===null){resolve(playerIndex,'correct');if(players[playerIndex].finishedAt===null)nextPlayer(playerIndex);}");}
complete(1);assert.equal(run('active'),true);now+=2000;complete(0);now+=1000;complete(2);now+=1000;complete(3);assert.equal(run('active'),false);assert.equal(run('ranking()[0].name'),'Player 2');assert.equal(nodes.get('results').hidden,false);
// Most points outrank time; exact score/time ties remain ties.
run('players[0].score+=1');assert.equal(run('ranking()[0].name'),'Player 1');
choices.review_modes=['19'];assert(run('pool().length')>0);assert.equal(run("pool().every(q=>q.mode==='19')"),true);choices.modes=['24'];assert.equal(run("pool().every(q=>q.mode==='19'||q.mode==='24')"),true);choices.review_modes=[];choices.modes=[];assert.equal(run("pool().some(q=>q.kind==='creative')"),false);
// Teacher review awards configured points, never fixed ten.
choices.review_modes=['19','20'];nodes.get('points-correct').value='7';run('start();states[0].text=states[0].question.answer;renderInput(states[0].question,0)');nodes.get('input-0').children.at(-1).children[0].listeners.click();assert.equal(run('states[0].review'),true);assert.equal(run('players[0].score'),0);nodes.get('input-0').children.at(-1).children[1].listeners.click();assert.equal(run('players[0].score'),7);
const html=fs.readFileSync(__dirname+'/index.html','utf8');const version=html.match(/name="game-version" content="([^"]+)"/)[1];assert(html.includes('v'+version));for(const file of ['game.js','style.css'])assert(html.includes(file+'?v='+version));assert(fs.readFileSync(__dirname+'/../sw.js','utf8').includes("SENTENCE_ARENA_VERSION = '"+version+"'"));
console.log('Passed: all question solutions; distinct queues; independent next/skip/timeouts; configured scores, sign validation and no double penalties; early-end accounting; score/time ranking; opt-in teacher review; version agreement.');

assert.deepEqual(Array.from(run('availableGrades()')),[1,2,3,4,5,6,7,8,9,10]);
for(const key of Object.keys(choices))choices[key]=[];
for(const grade of [6,7,8,9,10]){choices.grades=[String(grade)];assert(run('pool().length')>0);assert.equal(run(`pool().every(q=>q.grades.includes(${grade}))`),true);}
console.log('Passed: JSON-derived Grades 1–10 and grade filtering for Grades 6–10.');

// Learning metadata, full mode coverage, and explicit matching invariants.
for(const q of data.questions){
  for(const field of ['skill','languageDifficulty','subjectKnowledge','challengeGroup','expectedSeconds'])assert(q[field],q.id+' missing '+field);
  assert(q.hints.length>=2,q.id+' needs progressive hints');
  if(q.kind==='choice')for(const option of q.options)assert(q.optionFeedback[option],q.id+' missing feedback');
  for(const alternative of q.acceptedAnswers||[]){assert.equal(run(`isAccepted(${JSON.stringify(q)},${JSON.stringify(alternative)})`),true);const tokens=s=>s.toLowerCase().replace(/[.,!?"“”]/g,'').split(/\s+/).sort().join('|');if(q.kind==='tiles'&&!q.letters)assert.equal(tokens(alternative),tokens(q.answer),q.id+' alternative must be buildable with its tiles');}
  for(const next of q.followUpIds||[])assert(data.questions.some(q=>q.id===next));
}
for(const key of Object.keys(choices))choices[key]=[];
for(const mode of data.modes){context.testMode=mode.id;const sets=run('buildMatchedDeck(bank.questions.filter(q=>q.mode===testMode))');assert(sets.length>=1,mode.name+' needs a playable matched set');}
for(let trial=0;trial<10;trial++){run('start()');run('deck.forEach(group=>{if(new Set(group.map(groupKey)).size!==1)throw Error("Unmatched tasks");if(group.length!==4)throw Error("Incomplete group");})');run('finish(true)');}
for(const grade of [1,2,9,10]){choices.grades=[String(grade)];run('start()');assert(run('deck.length')>=5,'five questions per player available for grade '+grade);run('finish(true)');}choices.grades=[];
// Alternatives must be accepted by Check answer, with no wrong-answer penalty.
run('start()');
for(const id of ['q382','q404']){context.testId=id;run('{const q=bank.questions.find(q=>q.id===testId);players[0].queue=[q,q];players[0].index=0;players[0].finishedAt=null;players[0].score=0;showPlayer(0);states[0].remembering=false;const used=new Set();states[0].chosen=q.acceptedAnswers[0].split(" ").map(word=>{const idx=states[0].tokens.findIndex((token,n)=>normalize(token)===normalize(word)&&!used.has(n));if(idx<0)throw Error("Missing alternative tile");used.add(idx);return idx;});renderInput(q,0);}');nodes.get('input-0').children.at(-1).children[1].listeners.click();assert.equal(run('players[0].score'),7);assert.equal(run('states[0].outcome'),'correct');}
// Hints reveal progressively, preserve the answer and don't alter points.
run('nextPlayer(0);states[0].remembering=false;renderInput(states[0].question,0)');const hintPanel=nodes.get('input-0').children[0];hintPanel.children[0].listeners.click();assert.equal(run('states[0].hintsUsed'),1);assert.equal(run('players[0].score'),7);assert(nodes.get('input-0').children[0].children.length>=2);
run('finish(true)');
// A topical restriction must disable unusable modes, without silently broadening filters.
run('filters()');choices.topics=['not-a-topic'];run('updatePool()');assert.equal(nodes.get('start').disabled,true);assert.equal(run('modeOptions.every(o=>o.input.disabled)'),true);choices.topics=[];
choices.languageDifficulty=['advanced'];assert.equal(run('pool().every(q=>q.languageDifficulty==="advanced")'),true);choices.languageDifficulty=[];choices.subjectKnowledge=['everyday'];assert.equal(run('pool().every(q=>q.subjectKnowledge==="everyday")'),true);choices.subjectKnowledge=[];
console.log('Passed: all 40 playable modes, matched group invariants, grade capacity, accepted alternative orders through scoring, progressive hints, option feedback coverage, new filters and unavailable-mode disabling.');
for(const key of Object.keys(choices))choices[key]=[];
run('start();{const q=bank.questions.find(q=>q.id==="q008");players[0].queue=[q,q];players[0].index=0;players[0].finishedAt=null;players[0].score=0;scoring.wrong=-2;showPlayer(0);states[0].selection="have";renderInput(q,0);}');nodes.get('input-0').children.at(-1).children[1].listeners.click();assert.equal(run('players[0].score'),-2);assert(nodes.get('feedback-0').textContent.includes(run('states[0].question.optionFeedback.have')));assert.equal(run('bank.questions.find(q=>q.id==="q245").skill'),'vocabulary-in-context');
console.log('Passed: chosen-distractor feedback appears with a single penalty; subject vocabulary is not labelled agreement.');

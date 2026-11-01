'use strict';
const difficultyLevels=[
 {name:'Basic 3-note melody',grade:'Beginner · Very easy',skill:'Identify C, D & E',assessment:'Play the melody in the right order. Take as much time as you need.'},
 {name:'Repeated-note rhythm',grade:'Beginner · Easy',skill:'Steady beat, timing & finger control',assessment:'Match the note lengths and keep a steady pulse. Timing feedback follows each note.'},
 {name:'Different octave',grade:'Beginner Plus · Easy–Moderate',skill:'Octave recognition & hand movement',assessment:'Play the first two phrases in the base octave, then switch one octave higher.'},
 {name:'Left-hand accompaniment',grade:'Intermediate · Moderate',skill:'Melody + bass with two hands',assessment:'Add two bass pulses per phrase. Hold the matching left-hand control while playing each marked melody note.'},
 {name:'Chord accompaniment',grade:'Intermediate Plus · Moderate–Hard',skill:'Melody + harmony',assessment:'Play the indicated C or G major chord with the melody. C major = C–E–G; G major = G–B–D.'},
 {name:'Two-hand rhythmic arrangement',grade:'Advanced · Hard',skill:'Expression, coordination & performance',assessment:'Alternate bass and chords. Follow short (staccato), connected (legato), and accented notes; select the indicated strength. Increase tempo when ready.'}
];
let melodyLayout='cde';
let difficulty=1,arrangement=[],register=0,strength='normal',leftActive=new Map(),lastAccepted=null,rhythmAttempts=[],variationPassed=new Set(),lastRunPassed=false,accompSerial=0,usedAccompaniment=new Set();
try{variationPassed=new Set(JSON.parse(localStorage.getItem('little-keys-variations')||'[]').map(key=>/^\d+:\d+$/.test(key)?key.replace(':',':cde:'):key));}catch{}
function makeArrangement(selectedSong,level){
 const harmony=(selectedSong===0?['C','C','C','G','C']:['C','C','G','C','C','C','G','C']).map(root=>melodyLayout==='gab'?(root==='C'?'G':'D'):root);
 let offset=0;
 return songs[selectedSong].phrases.flatMap(([letters,lyric],phrase)=>{
  const notes=letters.split(' '),mid=Math.floor(notes.length/2);
  const steps=notes.map((note,j)=>{
   const original=songs[selectedSong].beats[offset+j];
   const beat=level===1?1:level===6&&original===1&&j<2 ? .5 : original;
   const accompaniment=[];
   if(level>=4){[0,mid].forEach((hit,pulse)=>{if(j===hit)accompaniment.push((level===4||level===6&&pulse===0?'bass':'chord')+harmony[phrase]);});}
   return {note:melodyLayout==='gab'?{C:'G',D:'A',E:'B'}[note]:note,beat,phrase,lyric,octave:level===3&&phrase>=2?1:0,accompaniment,
    articulation:level===6?(j===0?'accent':j===notes.length-1?'staccato':'legato'):'normal',
    strength:level===6?(j===0?'strong':j===notes.length-1?'soft':'normal'):'normal'};
  });offset+=notes.length;return steps;
 });
}
function stepAt(i=index){return mode==='songs'?arrangement[i]:null;}
function prettyAccompaniment(name){const root=name.at(-1),type=name.startsWith('bass')?'bass':'major',primary=melodyLayout==='gab'?'G':'C';return `${root} ${type} (${name.startsWith('bass')?(root===primary?'Z':'X'):(root===primary?'V':'B')})`;}
function setupVariation(){
 arrangement=mode==='songs'?makeArrangement(song,difficulty):[];lastAccepted=null;rhythmAttempts=[];lastRunPassed=false;usedAccompaniment.clear();register=0;strength='normal';
 $('variation-panel').hidden=mode!=='songs';$('left-hand').hidden=mode!=='songs'||difficulty<4;
 $('register-controls').hidden=mode!=='songs'||difficulty!==3;$('strength-controls').hidden=mode!=='songs'||difficulty!==6;
 if(mode==='songs'){
  const level=difficultyLevels[difficulty-1];$('level-description').textContent=level.grade+' · '+(difficulty===1?`Identify ${currentLayout().notes.join(', ')}`:level.skill);$('level-assessment').textContent=difficulty===5&&melodyLayout==='gab'?'Play the indicated G or D major chord with the melody. G major = G–B–D; D major = D–F♯–A.':level.assessment;
  $('difficulty').value=String(difficulty);
  $('level-progress').textContent=`${[...variationPassed].filter(key=>key.startsWith(`${song}:${melodyLayout}:`)).length} / 6 levels completed for this melody`;
 }
 $('arrangement-result').textContent='';updatePerformanceControls();
}
function updatePerformanceControls(){
 document.querySelectorAll('[data-register]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.register)===register)));
 document.querySelectorAll('[data-strength]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.strength===strength)));
}
function variationCue(i=index){
 const step=stepAt(i);$('performance-cue').hidden=!step;
 if(!step)return;
 const parts=[`Right hand: ${step.note}${Number($('pitch').value)+step.octave}`];
 if(difficulty===3)parts.push(step.octave?'Switch to +1 octave (↑)':'Use base octave (↓)');
 if(difficulty>=4)parts.push(step.accompaniment.length?`Left hand: ${step.accompaniment.map(prettyAccompaniment).join(' then ')} — overlap the melody`:'Left hand: rest');
 if(difficulty===6)parts.push(`${step.articulation} · ${step.strength} touch${step.articulation==='staccato'?' · sound for half the beat length':''}`);
 $('performance-cue').textContent=parts.join(' · ');
 document.querySelectorAll('[data-accompaniment]').forEach(b=>b.classList.toggle('needed',step.accompaniment.includes(b.dataset.accompaniment)));
}
function accompanimentTone(name){
 const root=name.at(-1),notes=name.startsWith('bass')?[root]:{C:['C','E','G'],G:['G','B','D'],D:['D','F#','A']}[root];
 const octave=Number($('pitch').value)-(name.startsWith('bass')?2:1);
 const stops=notes.map(note=>tone(note,octave,'soft',true));return ()=>stops.forEach(stop=>stop());
}
function creditAccompaniment(entry,name,strike){
 if(!entry.valid||strike&&usedAccompaniment.has(strike))return;
 const step=entry.step;if(!step)return;
 const slot=step.accompaniment.findIndex((needed,i)=>needed===name&&!entry.accompHits.has(i));if(slot>=0){entry.accompHits.add(slot);if(strike)usedAccompaniment.add(strike);}
}
function startLeft(name,source){
 if(demo||leftActive.has(source)||mode!=='songs'||difficulty<4)return;
 const el=document.querySelector(`[data-accompaniment="${name}"]`);const strike=++accompSerial;leftActive.set(source,{name,el,strike,stop:accompanimentTone(name)});el.classList.add('active');
 for(const entry of active.values())if(entry.expected===index)creditAccompaniment(entry,name,strike);
}
function endLeft(source){const voice=leftActive.get(source);if(!voice)return;voice.stop();leftActive.delete(source);if(![...leftActive.values()].some(v=>v.name===voice.name))voice.el.classList.remove('active');}
function releaseLeft(){for(const source of [...leftActive.keys()])endLeft(source);}
function requiredHold(step){return step?.articulation==='staccato' ? .5 : 1;}
function variationProblem(entry,elapsed){
 const step=entry.step;if(!step)return '';
 if(entry.register!==step.octave)return `Expected ${step.note}${Number($('pitch').value)+step.octave}; you used octave ${Number($('pitch').value)+entry.register}. Switch octave and retry.`;
 if(difficulty>=4&&entry.accompHits.size<step.accompaniment.length)return `Add ${step.accompaniment.map(prettyAccompaniment).join(' then ')} while holding the melody note. Retry this note.`;
 if(difficulty===6&&entry.strength!==step.strength)return `Use ${step.strength} touch for this ${step.articulation} note, then retry.`;
 if(difficulty>=2){const expected=step.beat*entry.tempo*requiredHold(step);if(elapsed<expected*.85||elapsed>expected*1.25)return `Aim for ${(expected/1000).toFixed(2)}s${step.articulation==='staccato'?' of short staccato sound':''}. Your hold was ${(elapsed/1000).toFixed(2)}s. Retry this note.`;}
 return '';
}
function recordAccepted(entry){
 if(mode!=='songs')return;
 if(lastAccepted&&difficulty>=2){
  const expected=lastAccepted.step.beat*lastAccepted.tempo;
  const delta=(entry.start-lastAccepted.start-expected)/expected;rhythmAttempts.push(Math.abs(delta)<=.25);
  $('arrangement-result').textContent=`Beat spacing: ${Math.abs(delta)<=.25?'steady (within 25%)':delta>0?'late — leave less space before the next note':'early — wait for the full beat'}.`;
 }
 lastAccepted=entry;
}
function finishVariation(){
 if(mode!=='songs')return;
 const steady=rhythmAttempts.filter(Boolean).length,total=rhythmAttempts.length;
 const passed=difficulty===1||!total||steady/total>=.8;lastRunPassed=passed;
 $('arrangement-result').textContent=difficulty===1?'Melody complete — you identified every note!':`${steady} / ${total} note transitions kept a steady beat (within 25%). ${passed?'Level complete!':'Melody complete. Practice again for 80% steady transitions to complete this level.'}`;
 if(passed){variationPassed.add(`${song}:${melodyLayout}:${difficulty}`);try{localStorage.setItem('little-keys-variations',JSON.stringify([...variationPassed]));}catch{}$('level-progress').textContent=`${[...variationPassed].filter(key=>key.startsWith(`${song}:${melodyLayout}:`)).length} / 6 levels completed for this melody`;}
 $('next').hidden=false;$('next').textContent=passed&&difficulty<6?'Next difficulty →':'Practice this level again';
}
function initVariations(){
 difficultyLevels.forEach((level,i)=>{const option=document.createElement('option');option.value=i+1;option.textContent=`Level ${i+1} · ${level.name}`;$('difficulty').append(option);});
 $('difficulty').onchange=()=>{difficulty=Number($('difficulty').value);reset();};
 document.querySelectorAll('[data-register]').forEach(b=>b.onclick=()=>{if(demo)return;releaseAll();register=Number(b.dataset.register);updatePerformanceControls();});
 document.querySelectorAll('[data-strength]').forEach(b=>b.onclick=()=>{strength=b.dataset.strength;updatePerformanceControls();});
 document.querySelectorAll('[data-accompaniment]').forEach(el=>{el.addEventListener('pointerdown',e=>{e.preventDefault();el.focus();el.setPointerCapture(e.pointerId);startLeft(el.dataset.accompaniment,'p'+e.pointerId);});for(const event of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(event,e=>endLeft('p'+e.pointerId));});
}

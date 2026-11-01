'use strict';
function staffY(note,octave=0){return {C:88,'C#':88,D:82,'D#':82,E:76,F:70,'F#':70,G:64,'G#':64,A:58,'A#':58,B:52}[note]-octave*42;}
function noteLocation(note,octave=0){
 const name=note[0];
 if(octave===1)return {C:'in the third space of the treble staff',D:'on the fourth line from the bottom',E:'in the top space of the treble staff',F:'on the top staff line',G:'in the space above the staff',A:'on the first ledger line above the staff',B:'above the first ledger line above the staff'}[name];
 return {C:'on the short ledger line below the staff',D:'in the space below the bottom staff line',E:'on the bottom staff line',F:'in the bottom staff space',G:'on the second line from the bottom',A:'in the second space from the bottom',B:'on the middle staff line'}[name]+(note.includes('#')?'; ♯ raises it by one semitone (the next black key)':'');
}
function noteShape(duration){
 return duration===.5?'Eighth note: a filled head, stem, and flag.':duration===1?'Quarter note: a filled head and stem.':duration===2?'Half note: a hollow head and stem.':'Whole note: a hollow head without a stem.';
}
function explainNotation(note,duration,listening=false,position=index){
 document.querySelectorAll('.staff-note.inspected').forEach(item=>{item.classList.remove('inspected');item.setAttribute('aria-pressed','false');});
 const step=stepAt(position),octave=step?.octave||0,hold=duration*requiredHold(step);
 showRecorder(note,octave);showHarmonica(note,octave,position);showPercussion(note,octave,position);
 $('notation-heading').textContent=listening?'Listen & notice':'Your next note';
 if(!note){$('notation-expected').textContent=mode==='free'?'Explore any note. There is no expected note in free play.':'Sequence complete! Restart to practice reading again.';$('notation-explanation').textContent='A note’s height tells you its pitch. Its shape tells you how many beats to hold.';return;}
 $('notation-expected').textContent=`${note.replace('#','♯')}${step?Number($('pitch').value)+octave:''} · ${duration} ${duration===1?'beat':'beats'} · ${(duration*beatMs()/1000).toFixed(2)} seconds`;
 $('notation-explanation').textContent=`${note.replace('#','♯')} is ${noteLocation(note,octave)}. ${noteShape(duration)}${step?.articulation==='staccato'?' The dot means staccato: sound for half the written length, then leave a gap.':step?.articulation==='accent'?' The > accent means a stronger touch.':step?.articulation==='legato'?' Legato means connect smoothly to the next note.':''} Count ${duration} ${duration===1?'beat':'beats'} at the selected tempo.${step?.articulation==='staccato'?` Sound for ${(hold*beatMs()/1000).toFixed(2)}s, then rest for the remaining ${(hold*beatMs()/1000).toFixed(2)}s.`:''}`;
}
function clearComparison(){
 $('notation-played').textContent='Play a key to compare your note and duration.';
 $('notation-result').textContent='';$('notation-comparison').dataset.state='ready';
 document.querySelector('.played-note-marker')?.remove();
}
function drawPlayedNote(entry){
 const svg=$('music-staff').querySelector('svg');if(!svg||!sequence[entry.expected])return;
 document.querySelector('.played-note-marker')?.remove();
 if(entry.valid)return;
 const ns='http://www.w3.org/2000/svg',group=document.createElementNS(ns,'g');group.setAttribute('class','played-note-marker');
 const x=100+entry.expected*56,y=staffY(entry.note,entry.register||0);
 const head=document.createElementNS(ns,'ellipse');head.setAttribute('cx',x);head.setAttribute('cy',y);head.setAttribute('rx','12');head.setAttribute('ry','8');head.setAttribute('fill','none');head.setAttribute('stroke','#b45344');head.setAttribute('stroke-width','2');head.setAttribute('stroke-dasharray','3 2');group.append(head);
 const label=document.createElementNS(ns,'text');label.setAttribute('x',x);label.setAttribute('y','12');label.setAttribute('text-anchor','middle');label.setAttribute('font-size','10');label.setAttribute('fill','#b45344');label.textContent=`Played ${entry.note.replace('#','♯')}`;group.append(label);svg.append(group);
}
function compareAttempt(note,expected,elapsed,duration,tempo){
 const actual=elapsed/tempo,delta=actual-duration;
 const pitch=note===expected?'Correct note.':`Expected ${expected.replace('#','♯')}, played ${note.replace('#','♯')}. ${note.replace('#','♯')} is ${noteLocation(note)}.`;
 const timing=Math.abs(delta)<=duration*.15?'Duration matched (within 15%).':`${Math.abs(delta).toFixed(2)} beats (${(Math.abs(delta)*tempo/1000).toFixed(2)}s) ${delta<0?'shorter':'longer'} than expected. ${delta<0?'Hold a little longer.':'Release a little sooner.'}`;
 return {text:`${pitch} ${timing}`,state:note!==expected?'different':Math.abs(delta)<=duration*.15?'matched':'timing'};
}
function showPlayed(entry,elapsed,released=false){
 const duration=entry.expectedBeats*requiredHold(entry.step);
 $('notation-played').textContent=`${released?'Last played':'Playing'} ${entry.note.replace('#','♯')}${entry.step?Number($('pitch').value)+entry.register:''} · ${(elapsed/entry.tempo).toFixed(2)} beats · ${(elapsed/1000).toFixed(2)}s${entry.expectedNote?` (expected ${entry.expectedNote.replace('#','♯')}${entry.step?Number($('pitch').value)+entry.step.octave:''} · ${duration} ${duration===1?'beat':'beats'} · ${(duration*entry.tempo/1000).toFixed(2)}s)`:''}`;
 if(!released)return;
 if(!entry.expectedNote){$('notation-result').textContent=`${entry.note.replace('#','♯')} is ${noteLocation(entry.note)}. ${mode==='free'?'Free play: explore short and long sounds.':'The sequence is complete; restart to compare another attempt.'}`;return;}
 const result=entry.step&&difficulty===1?{text:entry.note===entry.expectedNote?'Correct note! Hold lengths are optional at Level 1.':`Expected ${entry.expectedNote}, played ${entry.note}. Try the highlighted note.`,state:entry.note===entry.expectedNote?'matched':'different'}:compareAttempt(entry.note,entry.expectedNote,elapsed,duration,entry.tempo);
 $('notation-result').textContent=result.text;$('notation-comparison').dataset.state=result.state;
}

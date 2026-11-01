'use strict';
const recorderFingerings={
 B:{holes:[0,1],instruction:'Cover back hole 0 with your LEFT thumb and front hole 1 with your LEFT index finger. Keep all other front holes open.'},
 A:{holes:[0,1,2],instruction:'Keep your LEFT thumb and index down. Add your LEFT middle finger on front hole 2. Leave holes 3–7 open.'},
 G:{holes:[0,1,2,3],instruction:'Keep your LEFT thumb, index, and middle down. Add your LEFT ring finger on front hole 3. Leave holes 4–7 open.'}
};
function recorderDiagram(note){
 const pattern=recorderFingerings[note];
 if(!pattern)return '';
 const covered=hole=>pattern.holes.includes(hole);
 const circle=(x,y,hole)=>`<circle cx="${x}" cy="${y}" r="11" fill="${covered(hole)?'#315f49':'#fffefa'}" stroke="#60775a" stroke-width="2"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="10" fill="${covered(hole)?'#fffefa':'#61765b'}">${hole}</text>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 330" width="310" height="330" role="img" aria-label="Recorder ${note}. Covered: back thumb hole 0 and front holes ${pattern.holes.filter(h=>h>0).join(', ')}. Other holes open."><path d="M 124 15 L 154 15 L 157 68 L 166 82 L 161 290 L 172 308 Q 140 323 108 308 L 119 290 L 114 82 L 123 68 Z" fill="#ecd5a9" stroke="#b79a6b" stroke-width="3"/><path d="M 128 28 H 150 V 48 H 128 Z" fill="#b49a70"/><path d="M 116 84 H 165 M 119 286 H 161" stroke="#afbf8d" stroke-width="7"/>${circle(64,99,0)}<text x="12" y="67" font-size="11" fill="#62765b">BACK</text><text x="12" y="83" font-size="10" fill="#62765b">Left thumb</text><path d="M 77 99 H 113" stroke="#7c9271" stroke-dasharray="3 3"/>${[1,2,3,4,5,6,7].map((hole,i)=>circle(140,102+i*27,hole)).join('')}<text x="183" y="106" font-size="11" fill="#526d49">1 · Left index</text><text x="183" y="133" font-size="11" fill="#526d49">2 · Left middle</text><text x="183" y="160" font-size="11" fill="#526d49">3 · Left ring</text><text x="183" y="187" font-size="10" fill="#819076">4 · Right index</text><text x="183" y="214" font-size="10" fill="#819076">5 · Right middle</text><text x="183" y="241" font-size="10" fill="#819076">6 · Right ring</text><text x="183" y="268" font-size="10" fill="#819076">7 · Right little</text></svg>`;
}
function showRecorder(note,octave=0){
 const known=recorderFingerings[note]&&octave===0;
 $('recorder-current').textContent=known?`Play ${note} on recorder`:note?`Selected note: ${note.replace('#','♯')}${octave?' · upper octave':''}`:'Ready for B, A & G';
 $('recorder-diagram').innerHTML=known?recorderDiagram(note):'';
 $('recorder-instruction').textContent=known?recorderFingerings[note].instruction:'This starter guide covers the lower B, A and G fingerings only. Choose “Start recorder melody” for a matching arrangement. For other notes or octave variations, use the full fingering chart below.';
 document.querySelectorAll('[data-recorder-note]').forEach(button=>button.setAttribute('aria-pressed',String(known&&button.dataset.recorderNote===note)));
}
function initRecorder(){
 document.querySelectorAll('[data-recorder-note]').forEach(button=>button.onclick=()=>{if(demo)stopDemo(false);showRecorder(button.dataset.recorderNote);});
 $('start-recorder').onclick=()=>{mode='songs';melodyLayout='gab';difficulty=1;$('tone').value='54';$('pitch').value='5';describeTone();reset();};
 showRecorder(sequence[index]);
}

'use strict';
// Standard Richter tuning, 10-hole C diatonic; no bends or overblows.
const harmonicaRows={
 blow:['C4','E4','G4','C5','E5','G5','C6','E6','G6','C7'],
 draw:['D4','G4','B4','D5','F5','A5','B5','D6','F6','A6']
};
function harmonicaTab(note,octave=0){
 if(!note)return null;
 const pitch=note+(5+octave);
 for(const breath of ['blow','draw']){const hole=harmonicaRows[breath].indexOf(pitch)+1;if(hole)return {note,pitch,hole,breath,label:`${breath==='blow'?'+':'−'}${hole}`};}
 return null;
}
function harmonicaDiagram(tab){
 return `<div class="harp-map" role="table" aria-label="Standard 10-hole C diatonic harmonica. Hole 1 is on your left."><div class="harp-row" role="row"><b role="columnheader">Hole</b>${Array.from({length:10},(_,i)=>`<b role="columnheader">${i+1}</b>`).join('')}</div>${['blow','draw'].map(breath=>`<div class="harp-row ${breath}" role="row"><b role="rowheader">${breath==='blow'?'+ Blow':'− Draw'}</b>${harmonicaRows[breath].map((pitch,i)=>`<span role="cell" class="${tab&&tab.hole===i+1&&tab.breath===breath?'harp-active':''}" aria-label="Hole ${i+1}, ${breath}, ${pitch}${tab&&tab.hole===i+1&&tab.breath===breath?', selected':''}">${pitch}</span>`).join('')}</div>`).join('')}</div>`;
}
function showHarmonica(note,octave=0,position=index){
 const tab=harmonicaTab(note,octave);
 $('harmonica-map').innerHTML=harmonicaDiagram(tab);
 $('harmonica-current').textContent=tab?`${tab.note.replace('#','♯')} → ${tab.label} · hole ${tab.hole} ${tab.breath}`:note?`${note.replace('#','♯')} · no unbent tab in this register`:'Choose a note to explore';
 $('harmonica-instruction').textContent=tab?`${tab.breath==='blow'?'Breathe gently OUT through':'Breathe gently IN through'} hole ${tab.hole} only. This produces ${tab.pitch} on a standard C diatonic harmonica. ${tab.note==='D'&&octave===0?'C and D use the same hole 4: change breath direction rather than moving sideways.':''}`:'This guide uses middle-register notes and the next octave where available. Sharps and some upper notes need techniques outside this starter guide. The map stays unselected for those notes.';
 document.querySelectorAll('.harp-tab').forEach(el=>el.classList.toggle('current',Number(el.dataset.position)===position));
 document.querySelectorAll('[data-harp-note]').forEach(button=>button.setAttribute('aria-pressed',String(tab&&tab.note===button.dataset.harpNote&&octave===0)));
}
function renderHarmonicaTabs(){
 const container=$('harmonica-tabs');container.replaceChildren();
 if(!sequence.length){container.textContent='Choose a note above to see its hole and breath direction.';return;}
 const phrases=mode==='songs'?songs[song].phrases:mode==='course'&&lesson===3?songs[0].phrases:[[sequence.join(' '),'Practice notes']];
 let offset=0;
 for(const [letters,lyric] of phrases){
  const row=document.createElement('div');row.className='harp-phrase';
  const label=document.createElement('p');label.textContent=lyric;row.append(label);
  for(let j=0;j<letters.split(' ').length;j++){
   const position=offset++,note=sequence[position],tab=harmonicaTab(note,stepAt(position)?.octave||0);
   const chip=document.createElement('span');chip.className='harp-tab';chip.dataset.position=position;chip.textContent=tab?`${tab.label} ${note}`:`— ${note}`;chip.title=tab?`Hole ${tab.hole} ${tab.breath}; ${beats[position]} beats`:'No unbent fingering in this register';row.append(chip);
  }
  container.append(row);
 }
}
function initHarmonica(){
 document.querySelectorAll('[data-harp-note]').forEach(button=>button.onclick=()=>{if(demo)stopDemo(false);showHarmonica(button.dataset.harpNote,0,-1);});
 $('start-harmonica').onclick=()=>{mode='songs';melodyLayout='cde';difficulty=2;$('pitch').value='5';reset();};
 showHarmonica(sequence[index]);
}

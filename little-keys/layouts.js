'use strict';
const melodyLayouts={
 cde:{name:'C–D–E · Two black keys',notes:['C','D','E'],map:{C:'C',D:'D',E:'E'},white:['C','D','E'],black:['C#','D#'],keys:{a:'C',s:'D',d:'E',w:'C#',e:'D#'},help:'C is immediately left of the two black keys. D is between them. E is immediately right of them.'},
 gab:{name:'G–A–B · Three black keys',notes:['G','A','B'],map:{C:'G',D:'A',E:'B'},white:['F','G','A','B'],black:['F#','G#','A#'],keys:{a:'G',s:'A',d:'B',f:'F',t:'F#',w:'G#',e:'A#'},help:'Find the three black keys: F♯, G♯, A♯. G is between the first two, A is between the last two, and B is immediately right of the group. The extra F key gives you the full group to explore.'}
};
function currentLayout(){return melodyLayouts[mode==='course'?'cde':melodyLayout];}
function mappedMelody(note){return melodyLayouts[melodyLayout].map[note]||note;}
function applyLayout(){
 const layout=currentLayout(),gab=layout===melodyLayouts.gab;
 $('layout-panel').hidden=mode==='course';$('melody-layout').value=melodyLayout;
 $('layout-help').textContent=layout.help;
 $('piano').classList.toggle('gab-layout',gab);
 const white=layout.white.map((note,i)=>{
  const finger=layout.notes.indexOf(note),shortcut=Object.keys(layout.keys).find(key=>layout.keys[key]===note);
  return `<button class="white-key ${['c','d','e'][finger]||'context-key'}" data-note="${note}" aria-label="${note}, ${finger>=0?['thumb, finger 1','index, finger 2','middle, finger 3'][finger]:'extra key'}, keyboard ${shortcut.toUpperCase()}"><span class="key-hint">${shortcut.toUpperCase()}</span><span class="note">${note}</span><span class="finger">${finger>=0?['1 · THUMB','2 · INDEX','3 · MIDDLE'][finger]:'EXTRA KEY'}</span><span class="key-fill"></span></button>`;
 }).join('');
 const black=layout.black.map((note,i)=>`<button class="black-key black-${i}" data-note="${note}" aria-label="${note.replace('#',' sharp')}, keyboard ${Object.keys(layout.keys).find(key=>layout.keys[key]===note).toUpperCase()}"><kbd>${Object.keys(layout.keys).find(key=>layout.keys[key]===note).toUpperCase()}</kbd></button>`).join('');
 $('piano').innerHTML=white+black;
 bindPiano();
 $('keyboard-help').textContent=gab?'PC: A → G · S → A · D → B · F → extra F. Black keys: T → F♯ · W → G♯ · E → A♯.':'PC: A → C · S → D · D → E. Black keys: W → C♯ · E → D♯.';
 document.querySelector('.finger-guide').innerHTML=layout.notes.map((note,i)=>`<b>${i+1} <small>${['Thumb','Index','Middle'][i]} · ${note}</small></b>`).join('');
 document.querySelector('.notation-help').textContent=gab?'G is on the second staff line; A is in the second space; B is on the middle line. Staff positions use octave 4 as the reference.': 'C sits on the short line below the staff. D sits above it; E sits on the bottom staff line. Pitch sets move the sound by octaves.';
 $('feedback').textContent=layout.help;
 const harmony=gab?['G','D']:['C','G'];
 document.querySelectorAll('[data-accompaniment]').forEach((button,i)=>{const root=harmony[i%2],type=i<2?'bass':'chord';button.dataset.accompaniment=type+root;button.innerHTML=`${['Z','X','V','B'][i]} · ${root} ${type==='bass'?'bass':'major'}${type==='chord'?`<br><small>${{C:'C–E–G',G:'G–B–D',D:'D–F♯–A'}[root]}</small>`:''}`;});
}

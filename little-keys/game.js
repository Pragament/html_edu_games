'use strict';
const $ = id => document.getElementById(id);
const songs = [
 {title:'Hot Cross Buns',phrases:[['E D C','Hot cross buns'],['E D C','Hot cross buns'],['C C C C','One a penny'],['D D D D','Two a penny'],['E D C','Hot cross buns']],beats:[1,1,2,1,1,2,.5,.5,.5,.5,.5,.5,.5,.5,1,1,2]},
 {title:'Mary Had a Little Lamb',phrases:[['E D C D','Ma-ry had a'],['E E E','lit-tle lamb'],['D D D','lit-tle lamb'],['E E E','lit-tle lamb'],['E D C D','Ma-ry had a'],['E E E E','lit-tle lamb its'],['D D E D','fleece was white as'],['C','snow']],beats:[1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,4]}
];
const songStories=[
 {title:'Warm buns, happy hearts',story:'A baker carried a tray of warm buns to the market, calling, “Hot cross buns!” In this story, the baker offered one large bun for a penny or two smaller buns for a penny. A child bought two small buns and gave one to a friend. They sat together, enjoying the sweet bread and humming the baker’s tune.',meaning:'The song is a seller’s call inviting people to buy warm buns. In this little story inspired by the song, sharing a simple treat makes two friends happy.',word:'Hot cross bun: a sweet, spiced bread roll with a cross-shaped mark (+) on top. “Cross” describes that mark, not an angry feeling. The cross traditionally represents the Christian cross, and these buns are associated with Good Friday. A penny: a small coin. In our story, “one a penny, two a penny” means one large bun or two smaller buns for the same penny. The rhyme itself does not say how big the buns are.'},
 {title:'Mary and her woolly friend',story:'Mary had a little lamb with wool as white as snow. She fed it, cared for it, and spoke to it gently. The lamb felt safe with Mary and liked to stay near her. As Mary hummed a tune, her woolly friend followed along.',meaning:'The song introduces Mary and her little white lamb. This little story inspired by the song reminds us that gentle care helps animals feel safe.',word:'Lamb: a young sheep. Fleece: a sheep’s wool. “White as snow” means very white.'}
];
function showStory(){
 const selected=mode==='songs'?song:mode==='course'&&lesson===3?0:null;
 $('song-story').hidden=selected===null;
 if(selected===null)return;
 const story=songStories[selected];
 $('story-title').textContent=story.title;
 $('story-text').textContent=story.story;
 $('story-meaning').textContent=story.meaning;
 $('story-word').textContent=story.word;
}
const lessons=[
 {title:'Meet your three notes',description:'Thumb on C, index on D, middle on E. Play each one to say hello.',notes:'C D E',beats:[1,1,1]},
 {title:'Find your way around',description:'C is left of the pair, D is between, E is right. Follow the notes.',notes:'C C E E D C',beats:[1,1,1,1,1,1]},
 {title:'Make a note last',description:'Hold each key until the bar fills, then release. Two beats of beautiful sound.',notes:'C D E',beats:[2,2,2]},
 {title:'Your first little melody',description:'You know the notes. Now put them together in Hot Cross Buns!',notes:songs[0].phrases.map(p=>p[0]).join(' '),beats:songs[0].beats}
];
let mode='course',lesson=0,song=0,index=0,sequence=[],beats=[],active=new Map(),audio,muted=false,demo=false,demoStop=null,demoToken=0,completed=new Set();
try{completed=new Set(JSON.parse(localStorage.getItem('little-keys-lessons')||'[]'));}catch{}
function context(){if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();return audio;}
function tone(note,octave=Number($('pitch').value)+(mode==='songs'?register:0),touch=strength,harmony=false){
 try{const preset=tonePresets.get(harmony&&$('tone').value==='98'?'00':$('tone').value);return synthTone(context(),note,octave,preset,muted,{soft:.55,normal:1,strong:1.4}[touch]||1);}catch(error){console.error('Unable to play tone',error);return ()=>{};}
}
function describeTone(){
 const preset=tonePresets.get($('tone').value);
 $('tone-description').textContent=preset.description+(preset.drum?' Drum hits are mapped across the visible keys. They fade naturally; the hold meter still guides your timing.':'');
 try{localStorage.setItem('little-keys-tone',$('tone').value);}catch{}
}
for(const [category,items] of toneGroups){const group=document.createElement('optgroup');group.label=category;for(const [id,name] of items){const option=document.createElement('option');option.value=id;option.textContent=`${id} – ${name}`;group.append(option);}$('tone').append(group);}
try{const saved=localStorage.getItem('little-keys-tone');if(tonePresets.has(saved))$('tone').value=saved;}catch{}
$('tone').onchange=()=>{releaseAll();releaseLeft();stopDemo();describeTone();};describeTone();
function beatMs(){return Number($('tempo').value);}
function target(){return (beats[index]||1)*beatMs();}
function strict(){return mode==='songs'&&difficulty>=2||mode==='course'&&lesson>=2;}
function persist(){try{localStorage.setItem('little-keys-lessons',JSON.stringify([...completed]));}catch{}}
function lessonMenu(){$('lesson-list').innerHTML=lessons.map((l,i)=>`<button data-lesson="${i}" class="${i===lesson?'active':''}">${completed.has(i)?'✓':'○'} &nbsp; ${l.title}</button>`).join('');}
function reset(){stopDemo(false);releaseAll(false);releaseLeft();index=0;applyLayout();setupVariation();document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===mode));$('song-picker').hidden=mode!=='songs';$('next').hidden=true;lessonMenu();if(mode==='course'){const l=lessons[lesson];sequence=l.notes.split(' ');beats=l.beats;$('title').textContent=l.title;$('description').textContent=l.description;$('section-label').textContent=`LESSON ${lesson+1} OF 4`;}else if(mode==='songs'){sequence=arrangement.map(step=>step.note);beats=arrangement.map(step=>step.beat);$('title').textContent=songs[song].title;$('description').textContent=difficulty===1?'Follow the melody at your own pace. Any hold length is welcome.':'Follow the notes, rhythm, and performance cues for this level.';$('section-label').textContent='THE MELODY CLUB';}else{sequence=[];beats=[];$('title').textContent='Make your own kind of music';$('description').textContent='Explore every key, try a new pitch, and let your fingers wander.';$('section-label').textContent='YOUR LITTLE MUSIC STUDIO';}$('badge').textContent=mode==='free'?'✧ Room to explore':mode==='songs'?`Level ${difficulty} · ${difficultyLevels[difficulty-1].grade.split(' · ')[0]}`:'✦ Beginner friendly';$('feedback').textContent='Find the two black keys. Your C, D & E live around them.';$('duration').textContent='♪ Ready when you are';$('hold-fill').style.width='0%';showStory();renderScore();clearComparison();}
function noteColor(note){return ['#9a78b1','#c38d45','#6b9756'][currentLayout().notes.indexOf(note)]||'#607a68';}
function renderStaff(){
 const notes=sequence.length?sequence:Object.values(currentLayout().keys).sort((a,b)=>staffY(b)-staffY(a));
 const width=95+notes.length*56;
 const lines=[28,40,52,64,76].map(y=>`<line x1="12" y1="${y}" x2="${width-8}" y2="${y}" stroke="#cbd5c3"/>`).join('');
 const symbols=notes.map((note,i)=>{
  const step=stepAt(i),octave=step?.octave||0;
  const x=100+i*56,y=staffY(note,octave),duration=sequence.length?beats[i]:1;
  const hollow=duration>=2,whole=duration>=4;
  return `<g class="staff-note" data-index="${i}" data-staff-note="${note}" data-beats="${duration}" role="button" tabindex="0" aria-pressed="false" aria-label="Explain note ${i+1}: ${note.replace('#',' sharp')}, ${duration} ${duration===1?'beat':'beats'}" style="--staff-color:${noteColor(note)}"><title>${note}, ${duration} ${duration===1?'beat':'beats'}</title><rect class="staff-highlight" x="${x-23}" y="-30" width="46" height="151" rx="9"/>${y>=88?`<line x1="${x-14}" y1="88" x2="${x+14}" y2="88" stroke="currentColor" stroke-width="1.6"/>`:''}${y<=16?`<line x1="${x-14}" y1="16" x2="${x+14}" y2="16" stroke="currentColor" stroke-width="1.6"/>`:''}${note.includes('#')?`<text x="${x-25}" y="${y+5}" font-size="20" fill="currentColor">♯</text>`:''}<ellipse cx="${x}" cy="${y}" rx="${whole?9:8}" ry="5.5" transform="rotate(-18 ${x} ${y})" fill="${hollow?'#fffefa':'currentColor'}" stroke="currentColor" stroke-width="2"/>${whole?'':`<line x1="${x+7}" y1="${y-2}" x2="${x+7}" y2="${y-34}" stroke="currentColor" stroke-width="2"/>`}${duration<1?`<path d="M ${x+7} ${y-34} Q ${x+23} ${y-24} ${x+12} ${y-13}" stroke="currentColor" stroke-width="3" fill="none"/>`:''}${step?.articulation==='staccato'?`<circle cx="${x}" cy="${y+12}" r="2.5" fill="currentColor"/>`:step?.articulation==='accent'?`<text x="${x}" y="18" text-anchor="middle" font-size="15" fill="currentColor">&gt;</text>`:''}<text x="${x}" y="114" text-anchor="middle" font-size="11" fill="currentColor">${note.replace('#','♯')}${step?Number($('pitch').value)+octave:''}</text></g>`;
 }).join('');
 $('music-staff').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="164" viewBox="0 -36 ${width} 164" role="group" aria-label="Interactive treble staff. Select a note for its explanation: ${notes.join(', ')}. Eighth note: half a beat; quarter: one; half: two; whole: four.">${lines}<text x="22" y="79" font-size="66" fill="#7c9077" font-family="Georgia,serif">𝄞</text>${symbols}</svg>`;
}
function highlightStaff(position,playedNote){
 const items=[...$('music-staff').querySelectorAll('.staff-note')];
 items.forEach((item,i)=>{item.classList.toggle('current',playedNote?item.dataset.staffNote===playedNote:i===position);item.classList.toggle('done',sequence.length>0&&i<position);});
 const current=items.find(item=>item.classList.contains('current'));
 if(current)$('music-staff').scrollLeft=Math.max(0,Number(current.dataset.index)*56-80);
}
function renderScore(){renderStaff();const score=$('score');score.replaceChildren();sequence.forEach((note,i)=>{const el=document.createElement('div');el.className='note-block'+(i<index?' done':'')+(i===index?' current':'');el.dataset.n=note;el.style.setProperty('--color',noteColor(note));el.style.setProperty('--soft',['#eee6f5','#f8ecd8','#e7efda'][currentLayout().notes.indexOf(note)]||'#edf1e6');el.innerHTML=`${note}${stepAt(i)?.octave?'<sup>+1</sup>':''}<small>${beats[i]} ${beats[i]===1?'beat':'beats'}</small>`;score.append(el);});if(!sequence.length)score.innerHTML='<span style="color:#8b9b82;font-size:13px;padding:10px">♪ &nbsp; No right or wrong notes. Just play.</span>';update();}
function showLyrics(position){
 const selectedSong=mode==='songs'?songs[song]:mode==='course'&&lesson===3?songs[0]:null;
 $('lyrics').hidden=!selectedSong;
 if(!selectedSong){$('lyrics').textContent='';return;}
 let offset=0;
 for(const [notes,words] of selectedSong.phrases){
  offset+=notes.split(' ').length;
  if(position<offset){$('lyrics').textContent='♫ '+words;return;}
 }
 $('lyrics').textContent='♫ '+selectedSong.phrases.at(-1)[1];
}
function update(){variationCue();explainNotation(sequence[index],beats[index]);showLyrics(index);highlightStaff(sequence.length?index:-1);const total=sequence.length;[...$('score').children].forEach((el,i)=>{el.classList.toggle('done',i<index);el.classList.toggle('current',i===index);});$('count').textContent=total?`${index} / ${total}`:'Free play';$('progress-fill').style.width=total?`${index/total*100}%`:'0%';$('progress-label').textContent=index===total&&total?'A little practice. A lovely achievement!':index?'Look at you making music!':'Your musical journey starts here';if(!total){$('prompt').textContent='Your keys. Your tune.';return;}if(index===total){$('prompt').textContent='✦ Beautifully played! You did it.';$('feedback').textContent='Play again, or explore something new.';finishVariation();if(mode==='course'){completed.add(lesson);persist();lessonMenu();$('next').hidden=false;$('next').textContent=lesson===3?'Explore melodies →':'Next lesson →';}return;}$('prompt').textContent=`Play ${sequence[index]}${strict()?` · hold ${beats[index]} ${beats[index]===1?'beat':'beats'}`:''}`;if(mode==='songs'||mode==='course'&&lesson===3){let offset=0;for(const phrase of songs[mode==='songs'?song:0].phrases){offset+=phrase[0].split(' ').length;if(index<offset){$('feedback').textContent=phrase[1];break;}}}const current=$('score').children[index];if(current)$('score').scrollLeft=Math.max(0,current.offsetLeft-$('score').offsetLeft-100);}
function start(note,source){
 if(demo||active.has(source))return;
 const el=document.querySelector(`[data-note="${note}"]`),step=stepAt();
 const entry={note,el,start:performance.now(),stop:tone(note),expected:index,expectedNote:sequence[index],expectedBeats:beats[index],tempo:beatMs(),valid:mode==='free'||sequence[index]===note,step,register,strength,accompHits:new Set()};
 for(const voice of leftActive.values())creditAccompaniment(entry,voice.name,voice.strike);
 active.set(source,entry);$('notation-result').textContent='';drawPlayedNote(entry);showPlayed(entry,0);if(mode==='free')explainNotation(note,1);el.classList.add('active');
 if(mode==='free')highlightStaff(-1,note);
 if(mode!=='free'&&index<sequence.length&&!entry.valid)$('feedback').textContent=`Try ${sequence[index]} next. You’ve got this!`;
}
function end(source,advance=true){
 const entry=active.get(source);if(!entry)return;active.delete(source);entry.stop();
 if(![...active.values()].some(e=>e.note===entry.note)){entry.el.classList.remove('active');entry.el.querySelector('.key-fill')?.style.setProperty('height','0%');}
 const elapsed=performance.now()-entry.start;if(!advance)return;
 showPlayed(entry,elapsed,true);$('duration').textContent=`${(elapsed/1000).toFixed(2)}s · ${(elapsed/beatMs()).toFixed(1)} beats`;
 if(mode==='free'){$('feedback').textContent=`Lovely ${entry.note}! Try a different pitch or a longer note.`;return;}
 if(entry.valid&&entry.expected===index&&index<sequence.length){
  const problem=variationProblem(entry,elapsed);
  if(problem){$('feedback').textContent=problem;$('notation-result').textContent+=' '+problem;return;}
  if(mode!=='songs'&&strict()&&elapsed<target()*.85){$('feedback').textContent=`A little longer! Hold ${sequence[index]} until the bar fills.`;return;}
  recordAccepted(entry);index++;update();
 }
}
function releaseAll(advance=false){for(const source of [...active.keys()])end(source,advance);}
function animate(){const entry=[...active.values()].at(-1);if(entry){const elapsed=performance.now()-entry.start;showPlayed(entry,elapsed);const goal=entry.valid&&mode!=='free'?(beats[entry.expected]||1)*beatMs()*requiredHold(entry.step):beatMs()*2;const percent=Math.min(100,elapsed/goal*100);$('hold-fill').style.width=percent+'%';entry.el.querySelector('.key-fill')?.style.setProperty('height',percent+'%');$('duration').textContent=`${(elapsed/1000).toFixed(1)}s · ${(elapsed/beatMs()).toFixed(1)} beats`;if(entry.valid&&mode!=='free'&&entry.expected===index&&index<sequence.length)$('feedback').textContent=percent>=100?'Perfect! Release to play the next note.':'Keep holding… watch your note grow.';}requestAnimationFrame(animate);}
const demoTimers=new Set(),demoHarmony=new Set();
function stopDemo(restore=true){const wasDemo=demo;for(const timer of demoTimers)clearTimeout(timer);demoTimers.clear();for(const stop of demoHarmony)stop();demoHarmony.clear();if(demoStop){demoStop();demoStop=null;}demoToken++;demo=false;document.querySelectorAll('.demo').forEach(el=>el.classList.remove('demo'));$('listen').textContent='▶ Listen first';if(restore&&$('score').children.length){update();if(wasDemo)$('notation-played').textContent='Demonstration finished or stopped. Your practice position is unchanged.';}}
async function listen(){
 if(demo){stopDemo();return;}releaseAll();releaseLeft();context();demo=true;const token=++demoToken;
 $('listen').textContent='■ Stop listening';clearComparison();$('notation-played').textContent='Demonstration playing. Watch the note’s position and shape.';
 const notes=sequence.length?sequence:currentLayout().notes;
 for(let i=0;i<notes.length;i++){
  if(token!==demoToken)break;
  const step=stepAt(i),length=(beats[i]||1)*beatMs();showLyrics(i);highlightStaff(sequence.length?i:-1,sequence.length?undefined:notes[i]);explainNotation(notes[i],beats[i]||1,true,i);variationCue(i);
  $('prompt').textContent=`Listen · ${notes[i]}${step?Number($('pitch').value)+step.octave:''}`;
  [...$('score').children].forEach((block,j)=>block.classList.toggle('current',j===i));
  const block=$('score').children[i];if(block)$('score').scrollLeft=Math.max(0,block.offsetLeft-$('score').offsetLeft-100);
  const el=document.querySelector(`[data-note="${notes[i]}"]`);el.classList.add('demo');
  const stop=tone(notes[i],Number($('pitch').value)+(step?.octave||0),step?.strength||'normal');demoStop=stop;
  const soundLength=length*(step?.articulation==='staccato' ? .5 : step?.articulation==='legato'?1:.95);
  const off=setTimeout(()=>{demoTimers.delete(off);if(demoStop===stop){stop();demoStop=null;}},soundLength);demoTimers.add(off);
  step?.accompaniment.forEach((name,j)=>{const timer=setTimeout(()=>{demoTimers.delete(timer);if(token!==demoToken)return;const stopLeft=accompanimentTone(name);demoHarmony.add(stopLeft);const endTimer=setTimeout(()=>{demoTimers.delete(endTimer);stopLeft();demoHarmony.delete(stopLeft);},Math.min(length*.4,beatMs()));demoTimers.add(endTimer);},j*length/step.accompaniment.length);demoTimers.add(timer);});
  await new Promise(resolve=>setTimeout(resolve,length));
  if(token!==demoToken)break;
  if(demoStop===stop){stop();demoStop=null;}el.classList.remove('demo');
 }
 if(token===demoToken)stopDemo();
}
function bindPiano(){document.querySelectorAll('#piano [data-note]').forEach(el=>{el.addEventListener('pointerdown',e=>{e.preventDefault();el.focus();el.setPointerCapture(e.pointerId);start(el.dataset.note,'p'+e.pointerId);});el.addEventListener('pointerup',e=>end('p'+e.pointerId));el.addEventListener('pointercancel',e=>end('p'+e.pointerId,false));el.addEventListener('lostpointercapture',e=>end('p'+e.pointerId,false));});}
const keymap={a:'C',s:'D',d:'E',w:'C#',e:'D#'},leftKeymap={z:'bassC',x:'bassG',v:'chordC',b:'chordG'};
document.addEventListener('keydown',e=>{
 if(e.target.matches('select,input,textarea')||e.metaKey||e.ctrlKey||e.altKey)return;
 const key=e.key.toLowerCase();
 if(mode==='songs'&&difficulty===3&&['ArrowUp','ArrowDown'].includes(e.key)&&!demo){e.preventDefault();releaseAll();register=e.key==='ArrowUp'?1:0;updatePerformanceControls();return;}
 if(mode==='songs'&&difficulty===6&&['1','2','3'].includes(key)){e.preventDefault();strength={1:'soft',2:'normal',3:'strong'}[key];updatePerformanceControls();return;}
 if(leftKeymap[key]){if(mode==='songs'&&difficulty>=4){e.preventDefault();if(!e.repeat)startLeft((key==='z'||key==='x'?'bass':'chord')+((key==='z'||key==='v')?(melodyLayout==='gab'?'G':'C'):(melodyLayout==='gab'?'D':'G')),'k'+key);}return;}
 const note=currentLayout().keys[key];if(note){e.preventDefault();if(!e.repeat)start(note,'k'+key);}
});
document.addEventListener('keyup',e=>{const source='k'+e.key.toLowerCase();end(source);endLeft(source);});
window.addEventListener('blur',()=>{releaseAll();releaseLeft();stopDemo();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseAll();releaseLeft();stopDemo();}});
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;reset();});$('lesson-list').onclick=e=>{const b=e.target.closest('[data-lesson]');if(b){lesson=Number(b.dataset.lesson);reset();}};document.querySelectorAll('[data-song]').forEach(b=>b.onclick=()=>{song=Number(b.dataset.song);document.querySelectorAll('[data-song]').forEach(el=>el.classList.toggle('selected',el===b));reset();});function inspectStaffNote(noteElement){
 if(!noteElement)return;
 if(demo)stopDemo(false);
 const position=Number(noteElement.dataset.index);
 explainNotation(noteElement.dataset.staffNote,Number(noteElement.dataset.beats),false,position);
 $('notation-heading').textContent=`Selected note ${position+1} · reading only`;
 noteElement.classList.add('inspected');noteElement.setAttribute('aria-pressed','true');
}
$('music-staff').addEventListener('click',event=>inspectStaffNote(event.target.closest('.staff-note')));
$('music-staff').addEventListener('keydown',event=>{
 if(event.key==='Enter'||event.key===' '){const note=event.target.closest('.staff-note');if(note){event.preventDefault();event.stopPropagation();inspectStaffNote(note);}}
});
$('melody-layout').onchange=()=>{melodyLayout=$('melody-layout').value;reset();};$('restart').onclick=reset;$('next').onclick=()=>{if(mode==='songs'){if(lastRunPassed&&difficulty<6)difficulty++;}else if(lesson<3)lesson++;else mode='songs';reset();};$('listen').onclick=listen;$('sound').onclick=()=>{muted=!muted;releaseAll();releaseLeft();stopDemo();$('sound').textContent=muted?'♪ Sound off':'♪ Sound on';$('sound').setAttribute('aria-pressed',String(muted));};$('pitch').onchange=()=>{releaseAll();releaseLeft();stopDemo();variationCue();};$('tempo').onchange=()=>{releaseAll();releaseLeft();stopDemo();};
const mini=document.querySelector('.mini-keyboard');['C','D','E','F','G','A','B'].forEach(n=>{const key=document.createElement('span');key.className='mini-white';key.textContent=n;mini.append(key);});[1,2,4,5,6].forEach(pos=>{const key=document.createElement('span');key.className='mini-black';key.style.left=`${pos/7*100-4}%`;mini.append(key);});initVariations();reset();animate();

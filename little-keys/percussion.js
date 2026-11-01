'use strict';
const snarePatterns={
 alternating:['R','L','R','L'],
 rest:['R','L','rest','L'],
 space:['R','rest','rest','L']
};
let snareSession=null,snareTimer=null;
function malletHand(position){return position%2===0?'R':'L';}
function showPercussion(note,octave=0,position=index){
 const notes=currentLayout().notes;
 $('mallet-bars').innerHTML=notes.map((name,i)=>`<button data-mallet-preview="${name}" class="mallet-bar ${name===note?'selected':''}" style="--bar-height:${115-i*17}px" aria-label="Preview mallet ${name}"><span>${name}</span><small>${['1 · lower','2 · middle','3 · higher'][i]}</small></button>`).join('');
 $('mallet-current').textContent=note?`Strike ${note.replace('#','♯')}${octave?' one octave higher':''} · ${malletHand(position)} hand suggested`:'Choose a staff note to see its mallet position';
 $('mallet-instruction').textContent=notes.includes(note)?'Strike near the centre of the marked bar with a relaxed wrist, then let the mallet rebound. Let the note ring for its written value. R = right hand; L = left hand. Alternating hands is a starter suggestion, not a required fingering.':'The three bars show the current melody layout. For other notes, locate the matching bar on your instrument.';
}
function renderSnarePattern(){
 const pattern=snarePatterns[$('snare-pattern').value];
 $('snare-grid').innerHTML=pattern.map((hand,i)=>`<div class="snare-beat ${hand==='rest'?'is-rest':''}" data-beat="${i}"><small>Beat ${i+1}</small><strong>${hand==='rest'?'<svg viewBox="0 0 22 40" width="22" height="32" role="img" aria-label="Quarter rest"><path d="M8 2 L17 11 L10 19 L17 27 C7 23 3 30 12 37 C0 33 1 23 10 23 L4 17 L11 10 Z" fill="currentColor"/></svg>':hand}</strong><span>${hand==='rest'?'quarter rest':'one stroke'}</span></div>`).join('');
}
function snareSound(){
 if(muted)return;
 try{
  const ctx=context(),now=ctx.currentTime,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.22),ctx.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),env=ctx.createGain();noise.buffer=buffer;filter.type='highpass';filter.frequency.value=1400;env.gain.setValueAtTime(muted?0:.3,now);env.gain.exponentialRampToValueAtTime(.0001,now+.19);noise.connect(filter);filter.connect(env);env.connect(ctx.destination);noise.start();noise.stop(now+.22);
  noise.onended=()=>{noise.disconnect();filter.disconnect();env.disconnect();};
 }catch(error){console.error('Unable to play snare',error);}
}
function assessSnareHit(session,hand,now){
 const position=Math.round((now-session.start)/session.tempo);
 if(position<0)return {text:'Count in first. Get ready…'};
 if(position>=8)return {text:'Pattern finished.'};
 const wanted=session.pattern[position%4],offset=Math.abs(now-(session.start+position*session.tempo));
 const ok=wanted===hand&&offset<=session.tempo*.25;
 if(session.hits.has(position))return {text:'This beat already has a stroke. Wait for the next cue.'};
 session.hits.set(position,ok);
 return {text:wanted==='rest'?'This beat is a rest: keep both sticks still.':wanted!==hand?`Use ${wanted==='R'?'RIGHT':'LEFT'} on this beat.`:ok?'On the beat! Nice stroke.':'Correct hand; aim closer to the beat (within 25%).'};
}
function hitSnare(hand){
 snareSound();$('snare-hit').textContent=`${hand==='R'?'Right':'Left'} stroke`;
 if(snareSession&&!snareSession.demo)$('snare-feedback').textContent=assessSnareHit(snareSession,hand,performance.now()).text;
}
function stopSnare(announce=false){
 if(snareTimer!==null){clearInterval(snareTimer);snareTimer=null;}
 const wasRunning=!!snareSession;snareSession=null;
 document.querySelectorAll('.snare-beat').forEach(el=>el.classList.remove('current'));
 if(announce&&wasRunning)$('snare-feedback').textContent='Pattern stopped. Start again when ready.';
}
function runSnare(demonstration){
 stopSnare();stopDemo();releaseAll();releaseLeft();context();
 const tempo=beatMs(),pattern=[...snarePatterns[$('snare-pattern').value]],start=performance.now()+tempo*4;
 const session={demo:demonstration,tempo,pattern,start,hits:new Map()};snareSession=session;let tick=-4;
 const advance=()=>{
  if(snareSession!==session)return;
  if(tick>=8){
   let correct=0;for(let i=0;i<8;i++){const rest=pattern[i%4]==='rest';if(session.hits.get(i)===true||rest&&!session.hits.has(i))correct++;}
   stopSnare();$('snare-feedback').textContent=demonstration?'Demonstration finished. Try the pattern yourself.':`${correct} / 8 beats matched across two bars. Rest beats count when you stay silent.`;return;
  }
  if(tick<0){$('snare-feedback').textContent=`Count in: ${tick+5} of 4…`;$('snare-hit').textContent='Get ready';}
  else{
   const hand=pattern[tick%4];document.querySelectorAll('.snare-beat').forEach((el,i)=>el.classList.toggle('current',i===tick%4));
   $('snare-hit').textContent=`Bar ${Math.floor(tick/4)+1} · beat ${tick%4+1} · ${hand==='rest'?'REST':hand==='R'?'RIGHT':'LEFT'}`;
   if(tick===0)$('snare-feedback').textContent=demonstration?'Watch and listen to the strokes and silences.':'Play R/L as each beat arrives. Leave rests silent.';
   if(demonstration&&hand!=='rest')snareSound();
  }
  tick++;
 };
 advance();snareTimer=setInterval(advance,tempo);
}
function initPercussion(){
 $('start-mallets').onclick=()=>{mode='songs';melodyLayout='cde';difficulty=2;$('tone').value='89';$('pitch').value='4';describeTone();reset();};
 $('mallet-bars').onclick=event=>{const button=event.target.closest('[data-mallet-preview]');if(!button)return;const note=button.dataset.malletPreview;try{const stop=synthTone(context(),note,Number($('pitch').value),tonePresets.get('89'),muted);setTimeout(stop,800);}catch{}$('mallet-preview-status').textContent=`Preview: ${note}. This strike does not advance practice.`;};
 $('snare-pattern').onchange=()=>{stopSnare(true);renderSnarePattern();};
 $('snare-listen').onclick=()=>runSnare(true);$('snare-practice').onclick=()=>runSnare(false);$('snare-stop').onclick=()=>stopSnare(true);
 document.querySelectorAll('[data-snare-hand]').forEach(button=>button.onclick=()=>hitSnare(button.dataset.snareHand));
 document.addEventListener('keydown',event=>{if(event.repeat||event.metaKey||event.ctrlKey||event.altKey||event.target.matches('select,input,textarea'))return;const hand={j:'L',k:'R'}[event.key.toLowerCase()];if(hand){event.preventDefault();hitSnare(hand);}});
 window.addEventListener('blur',()=>stopSnare(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSnare(true);});
 renderSnarePattern();showPercussion(sequence[index]);
}

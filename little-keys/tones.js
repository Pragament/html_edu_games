'use strict';
// Local tone IDs follow the labels supplied for this app, not MIDI program numbers.
const toneGroups = [
 ['Pianos & Organs',[
  ['00','Grand Piano','Clean, warm piano for practicing melodies.',{partials:[1,.45,.22,.12],decay:2.4}],
  ['03','Honky-Tonk Piano','Bright, playfully detuned vintage piano.',{partials:[1,.55,.3,.18],decay:1.7,detune:9}],
  ['06','Electric Piano','Smooth, mellow electric keyboard.',{partials:[1,.12,.3,.04],ratios:[1,2,3.01,7],decay:2.8}],
  ['10','Church Organ','Deep, sustained pipe-organ sound.',{partials:[.7,1,.5,.25],ratios:[.5,1,2,4],attack:.06,sustain:.8}],
  ['14','Accordion','A bright, gently beating folk reed tone.',{partials:[1,.45,.33,.2,.12],detune:5,sustain:.75}]
 ]],
 ['Guitars & Basses',[
  ['20','Nylon String Guitar','Soft, plucked classical guitar.',{partials:[1,.4,.18,.07],decay:1.3,cutoff:2400}],
  ['23','Distortion Guitar','Crunchy electric guitar with a rock edge.',{wave:'sawtooth',drive:18,cutoff:2800,sustain:.6}],
  ['28','Acoustic Bass','Deep, rounded plucked bass.',{partials:[1,.4,.16],transpose:-12,decay:1.1,cutoff:1100}]
 ]],
 ['Strings & Traditional Instruments',[
  ['30','Violin','Smooth, sustained solo-string style.',{wave:'sawtooth',attack:.16,sustain:.7,vibrato:5,cutoff:3600}],
  ['37','Strings','A broad, layered string ensemble.',{wave:'sawtooth',attack:.25,sustain:.65,detune:7,vibrato:2,cutoff:2200}],
  ['40','Trumpet','Bright, punchy brass.',{partials:[1,.8,.6,.4,.2],attack:.045,sustain:.75,cutoff:4200}],
  ['46','Synth-Brass','Bold, retro electronic brass.',{wave:'sawtooth',attack:.04,sustain:.65,detune:4,cutoff:1700}]
 ]],
 ['Flutes & Reeds',[
  ['50','Alto Sax','Warm, reedy saxophone style.',{partials:[1,.65,.3,.18,.08],attack:.07,sustain:.7,vibrato:4,cutoff:2800}],
  ['54','Flute','Light, airy wind-instrument style.',{partials:[1,.12,.07],attack:.1,sustain:.8,noise:.025,vibrato:3}],
  ['67','Square Lead','Classic 8-bit video-game sound.',{wave:'square',sustain:.7,cutoff:7000}]
 ]],
 ['Indian Ethnic Tones',[
  ['84','Sitar','Resonant plucked strings with a buzzy edge.',{partials:[1,.6,.4,.3,.16],ratios:[1,2,3.01,4.03,6.02],decay:1.8,detune:2}],
  ['86','Harmonium','A rich, sustained reed-organ tone.',{partials:[1,.5,.28,.22,.1],attack:.075,sustain:.8,detune:3,cutoff:3000}],
  ['89','Santoor','Bright, ringing hammered-string style.',{partials:[1,.6,.35,.18],ratios:[1,2.01,3.98,6.03],decay:2.1}],
  ['98','Tabla','Five tabla-style drum hits across the keys.',{drum:true}]
 ]]
];
const tonePresets = new Map(toneGroups.flatMap(([,items])=>items.map(([id,name,description,config])=>[id,{name,description,...config}])));
function synthTone(ctx,note,octave,preset,muted,volume=1){
 const now=ctx.currentTime,nodes=[],sources=[];
 const output=ctx.createGain();nodes.push(output);output.gain.value=muted?0:.17*volume;output.connect(ctx.destination);
 const env=ctx.createGain();nodes.push(env);env.connect(output);
 const attack=preset.attack||.008;
 env.gain.setValueAtTime(0,now);env.gain.linearRampToValueAtTime(1,now+attack);
 env.gain.exponentialRampToValueAtTime(preset.decay ? .0001 : (preset.sustain||.7),now+attack+(preset.decay||.18));
 const filter=ctx.createBiquadFilter();nodes.push(filter);filter.type='lowpass';filter.frequency.value=preset.cutoff||9000;filter.connect(env);
 let destination=filter;
 if(preset.drive){const shaper=ctx.createWaveShaper();nodes.push(shaper);const curve=new Float32Array(1024);for(let i=0;i<curve.length;i++){const x=i*2/(curve.length-1)-1;curve[i]=Math.tanh(x*preset.drive);}shaper.curve=curve;shaper.oversample='2x';shaper.connect(filter);destination=shaper;}
 const offset={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11}[note];
 const frequency=261.625565*2**(octave-4+(offset+(preset.transpose||0))/12);
 function oscillator(freq,level,type='sine',detune=0,decay){
  const osc=ctx.createOscillator(),gain=ctx.createGain();sources.push(osc);nodes.push(osc,gain);
  osc.type=type;osc.frequency.value=freq;osc.detune.value=detune;gain.gain.setValueAtTime(level,now);
  if(decay)gain.gain.exponentialRampToValueAtTime(.0001,now+decay);
  osc.connect(gain);gain.connect(destination);osc.start(now);return osc;
 }
 if(preset.drum){
  // Each physical key has its own percussive voice; no pitched melody is implied.
  const drumIndex=offset%5;
  const base=[95,145,230,330,430][drumIndex]*2**((octave-4)/2);
  [1,1.47,2.09].forEach((ratio,i)=>{const osc=oscillator(base*ratio,.65/(i+1),'sine',0,[.7,.25,.4,.18,.3][drumIndex]);osc.frequency.exponentialRampToValueAtTime(base*ratio*.78,now+.1);});
 }else if(preset.partials){
  const sum=preset.partials.reduce((a,b)=>a+b,0);
  preset.partials.forEach((amplitude,i)=>oscillator(frequency*(preset.ratios?.[i]||i+1),amplitude/sum));
 }else oscillator(frequency,.65,preset.wave||'triangle');
 if(preset.detune){oscillator(frequency,.18,preset.wave||'sawtooth',preset.detune);oscillator(frequency,.18,preset.wave||'sawtooth',-preset.detune);}
 if(preset.vibrato){const lfo=ctx.createOscillator(),amount=ctx.createGain();sources.push(lfo);nodes.push(lfo,amount);lfo.frequency.value=5;amount.gain.value=preset.vibrato;lfo.connect(amount);sources.filter(s=>s!==lfo).forEach(s=>amount.connect(s.detune));lfo.start(now);}
 if(preset.noise||preset.drum){const buffer=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;const noise=ctx.createBufferSource(),gain=ctx.createGain();sources.push(noise);nodes.push(noise,gain);noise.buffer=buffer;noise.loop=true;gain.gain.setValueAtTime(preset.noise||.1,now);if(preset.drum)gain.gain.exponentialRampToValueAtTime(.0001,now+.06);noise.connect(gain);gain.connect(destination);noise.start(now);}
 let stopped=false;
 return ()=>{if(stopped)return;stopped=true;const end=ctx.currentTime;env.gain.cancelScheduledValues(end);env.gain.setTargetAtTime(0,end,.035);sources.forEach(source=>source.stop(end+.25));setTimeout(()=>nodes.forEach(node=>node.disconnect()),350);};
}
